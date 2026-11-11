import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  Code2,
  Cpu,
  FlaskConical,
  LibraryBig,
  Moon,
  Play,
  Plus,
  Settings2,
  Share2,
  Square,
  Sun,
} from 'lucide-react';
import Workbench from './components/Workbench';
import SettingsModal from './components/SettingsModal';
import ShareModal from './components/ShareModal';
import Modal from './components/Modal';
import { ExamplesPage, ExercisesPage, GuidePage } from './pages/LibraryPages';
import { DEFAULT_CODE } from './data/examples';
import { EXERCISES } from './data/exercises';
import { LocalCompilerError, compileAndRun, normalizeOutput } from './lib/compiler';
import { createId, loadSettings, loadWorkspace, saveSettings, saveWorkspace } from './lib/storage';
import { createShareUrl, workspaceFromHash } from './lib/share';
import type {
  AppView,
  EditorSettings,
  Example,
  Exercise,
  ResolvedTheme,
  RunState,
  TestResult,
  Workspace,
} from './types';

const NAV_ITEMS: Array<{ id: AppView; label: string; icon: typeof Code2 }> = [
  { id: 'workspace', label: '工作台', icon: Code2 },
  { id: 'examples', label: '示例库', icon: LibraryBig },
  { id: 'exercises', label: '练习', icon: FlaskConical },
  { id: 'guide', label: '指南', icon: BookOpen },
];

type PendingAction =
  | { kind: 'new' }
  | { kind: 'example'; example: Example }
  | { kind: 'exercise'; exercise: Exercise; solution: boolean }
  | { kind: 'file'; filename: string; code: string };

function defaultWorkspace(): Workspace {
  return {
    code: DEFAULT_CODE,
    stdin: '',
    filename: 'main.c',
    testCases: [],
    content: { kind: 'draft', title: '欢迎草稿' },
  };
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    } catch {
      return false;
    }
  }
}

export default function App() {
  const [initial] = useState(() => {
    const shared = workspaceFromHash(window.location.hash);
    return { shared: Boolean(shared), workspace: shared || loadWorkspace() || defaultWorkspace() };
  });
  const [view, setView] = useState<AppView>('workspace');
  const [code, setCode] = useState(initial.workspace.code);
  const [stdin, setStdin] = useState(initial.workspace.stdin);
  const [filename, setFilename] = useState(initial.workspace.filename);
  const [testCases, setTestCases] = useState(initial.workspace.testCases);
  const [content, setContent] = useState(initial.workspace.content);
  const [settings, setSettings] = useState<EditorSettings>(loadSettings);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved');
  const [runState, setRunState] = useState<RunState>({ phase: 'idle' });
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const testsCancelledRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workspace = useMemo<Workspace>(() => ({ code, stdin, filename, testCases, content }), [code, stdin, filename, testCases, content]);
  const activeExercise = content.kind === 'exercise' ? EXERCISES.find((exercise) => exercise.id === content.id) : undefined;
  const isRunning = runState.phase === 'running';
  const isBusy = isRunning || isTesting;

  const notify = useCallback((message: string) => setToast({ id: Date.now(), message }), []);
  const closeModal = useCallback(() => {
    setSettingsOpen(false);
    setShareUrl(null);
    setPending(null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    setSaveStatus('saving');
    const timer = window.setTimeout(() => {
      setSaveStatus(saveWorkspace(workspace) ? 'saved' : 'error');
    }, 450);
    return () => window.clearTimeout(timer);
  }, [workspace]);

  useEffect(() => saveSettings(settings), [settings]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const theme = settings.theme === 'system' ? (media.matches ? 'dark' : 'light') : settings.theme;
      setResolvedTheme(theme);
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121814' : '#f5f5f0');
    };
    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [settings.theme]);

  useEffect(() => {
    if (!initial.shared) return;
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
    notify('分享代码已还原，并保存到这台设备。');
  }, [initial.shared, notify]);

  const runCode = useCallback(async () => {
    if (abortRef.current || isTesting) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setRunState({ phase: 'running', progress: 0, stage: 'bootstrap' });
    setTestResults({});
    try {
      const result = await compileAndRun(code, stdin, settings, controller.signal, (progress) => {
        setRunState({ phase: 'running', ...progress });
      });
      const phase = !result.compiled ? 'compile-error' : result.exitCode === 0 && !result.signal ? 'success' : 'runtime-error';
      setRunState({ phase, result });
    } catch (error) {
      const cancelled = error instanceof LocalCompilerError && error.cancelled;
      setRunState({
        phase: cancelled ? 'cancelled' : 'engine-error',
        message: error instanceof Error ? error.message : '运行时发生未知错误。',
      });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [code, stdin, settings, isTesting]);

  const stopRunning = useCallback(() => {
    testsCancelledRef.current = true;
    abortRef.current?.abort();
  }, []);

  const runTests = useCallback(async () => {
    if (!testCases.length || abortRef.current || isRunning) return;
    const controller = new AbortController();
    abortRef.current = controller;
    testsCancelledRef.current = false;
    setIsTesting(true);
    setTestResults({});
    setRunState({ phase: 'idle' });

    try {
      for (const test of testCases) {
        if (testsCancelledRef.current) break;
        setTestResults((current) => ({ ...current, [test.id]: { status: 'running' } }));
        try {
          const result = await compileAndRun(code, test.input, settings, controller.signal);
          if (!result.compiled) {
            setTestResults((current) => ({
              ...current,
              [test.id]: { status: 'error', actual: result.stdout, message: '编译未通过，请先修复“问题”中的错误。' },
            }));
            setRunState({ phase: 'compile-error', result });
            break;
          }
          const passed = result.exitCode === 0 && !result.signal && normalizeOutput(result.stdout) === normalizeOutput(test.expected);
          setTestResults((current) => ({
            ...current,
            [test.id]: {
              status: passed ? 'passed' : 'failed',
              actual: result.stdout,
              message: result.exitCode !== 0 ? `程序退出码为 ${result.exitCode}。${result.stderr ? ` ${result.stderr}` : ''}` : result.stderr || undefined,
              duration: result.duration,
            },
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : '测试运行失败。';
          setTestResults((current) => ({ ...current, [test.id]: { status: 'error', message } }));
          if (!(error instanceof LocalCompilerError && error.cancelled)) {
            setRunState({ phase: 'engine-error', message });
          }
          break;
        }
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsTesting(false);
    }
  }, [code, testCases, settings, isRunning]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key === 'Enter' && view === 'workspace' && !settingsOpen && !shareUrl && !pending) {
        event.preventDefault();
        if (isBusy) stopRunning(); else runCode();
      }
      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        const blob = new Blob([code], { type: 'text/x-c;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename.endsWith('.c') ? filename : `${filename}.c`;
        anchor.click();
        URL.revokeObjectURL(url);
        notify('代码已导出。');
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [view, settingsOpen, shareUrl, pending, isBusy, stopRunning, runCode, code, filename, notify]);

  const exportCode = useCallback(() => {
    const blob = new Blob([code], { type: 'text/x-c;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename.endsWith('.c') ? filename : `${filename}.c`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify('代码已导出。');
  }, [code, filename, notify]);

  const openShare = () => setShareUrl(createShareUrl(workspace));

  const applyPending = () => {
    if (!pending) return;
    if (pending.kind === 'new') {
      const fresh = defaultWorkspace();
      setCode(fresh.code);
      setStdin(fresh.stdin);
      setFilename(fresh.filename);
      setTestCases(fresh.testCases);
      setContent(fresh.content);
    } else if (pending.kind === 'example') {
      setCode(pending.example.code);
      setStdin(pending.example.stdin || '');
      setFilename(`${pending.example.id}.c`);
      setTestCases([]);
      setContent({ kind: 'example', id: pending.example.id, title: pending.example.title });
    } else if (pending.kind === 'exercise') {
      const exercise = pending.exercise;
      setCode(pending.solution ? exercise.solution : exercise.starterCode);
      setStdin(exercise.tests[0]?.input || '');
      setFilename(`${exercise.id}.c`);
      setTestCases(exercise.tests.map((test) => ({ ...test, id: createId(), source: 'exercise' })));
      setContent({ kind: 'exercise', id: exercise.id, title: exercise.title });
    } else {
      setCode(pending.code);
      setStdin('');
      setFilename(pending.filename);
      setTestCases([]);
      setContent({ kind: 'draft', title: pending.filename });
    }
    setRunState({ phase: 'idle' });
    setTestResults({});
    setView('workspace');
    setPending(null);
    notify(pending.kind === 'exercise' && pending.solution ? '参考答案已载入，可以继续修改和测试。' : '已载入工作台。');
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 512 * 1024) {
      notify('文件超过 512 KB，请选择较小的单文件源码。');
      return;
    }
    try {
      const source = await file.text();
      setPending({ kind: 'file', filename: file.name.endsWith('.c') ? file.name : `${file.name}.c`, code: source });
    } catch {
      notify('无法读取这个文件，请重试。');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const pendingCopy = pending?.kind === 'new'
    ? { title: '新建一个草稿？', description: '当前编辑器内容会被默认示例替换。若需要保留，请先下载或分享。', action: '新建草稿' }
    : pending?.kind === 'file'
      ? { title: `打开 ${pending.filename}？`, description: '文件内容会替换当前编辑器，当前代码请先下载备份。', action: '打开文件' }
      : pending?.kind === 'exercise' && pending.solution
        ? { title: '载入参考答案？', description: '参考答案会替换当前代码，但练习和公开测试会保留。建议先独立完成，再比较思路。', action: '载入参考答案' }
        : { title: '替换当前编辑器内容？', description: '新内容会覆盖当前草稿。若这份代码对你很重要，请先下载或生成分享链接。', action: '载入并打开' };

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" onClick={() => setView('workspace')} aria-label="C Lab 首页">
          <span className="brand-mark">C<span /></span>
          <span className="brand-name">C Lab<small>LEARN BY RUNNING</small></span>
        </button>

        <nav className="desktop-nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}>{item.label}</button>)}
        </nav>

        <div className="header-actions">
          <span className="network-status" title="Clang 与程序都在浏览器 Worker 中运行">
            <Cpu size={14} />本地运行
          </span>
          <span className={`save-status ${saveStatus}`} title="代码仅保存在当前浏览器">
            {saveStatus === 'saved' ? <Check size={14} /> : <span className="status-dot" />}
            {saveStatus === 'saving' ? '保存中' : saveStatus === 'error' ? '保存失败' : '已存本机'}
          </span>
          <span className="header-divider" />
          {view === 'workspace' && <button className="icon-button header-new" onClick={() => setPending({ kind: 'new' })} title="新建草稿" aria-label="新建草稿"><Plus size={18} /></button>}
          <button className="icon-button" onClick={() => setSettings((current) => ({ ...current, theme: resolvedTheme === 'dark' ? 'light' : 'dark' }))} title="切换深浅色" aria-label="切换深浅色">
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-button" onClick={() => setSettingsOpen(true)} title="工作台设置" aria-label="工作台设置"><Settings2 size={18} /></button>
          {view === 'workspace' && (
            <button className={`button ${isBusy ? 'danger' : 'primary'} header-run`} onClick={isBusy ? stopRunning : runCode}>
              {isBusy ? <Square size={15} /> : <Play size={15} />}{isBusy ? '停止' : '运行'}<kbd>{isBusy ? '' : '⌘ ↵'}</kbd>
            </button>
          )}
        </div>
      </header>

      <div className="app-content">
        {view === 'workspace' && (
          <Workbench
            code={code}
            onCodeChange={setCode}
            stdin={stdin}
            onStdinChange={setStdin}
            filename={filename}
            onFilenameChange={setFilename}
            content={content}
            activeExercise={activeExercise}
            testCases={testCases}
            onTestCasesChange={setTestCases}
            testResults={testResults}
            onRunTests={runTests}
            isTesting={isTesting}
            settings={settings}
            theme={resolvedTheme}
            runState={runState}
            onRun={runCode}
            onStop={stopRunning}
            onImport={() => fileInputRef.current?.click()}
            onExport={exportCode}
            onShare={openShare}
          />
        )}
        {view === 'examples' && <ExamplesPage onSelect={(example) => setPending({ kind: 'example', example })} />}
        {view === 'exercises' && <ExercisesPage onStart={(exercise) => setPending({ kind: 'exercise', exercise, solution: false })} onSolution={(exercise) => setPending({ kind: 'exercise', exercise, solution: true })} />}
        {view === 'guide' && <GuidePage onOpenExamples={() => setView('examples')} onOpenWorkspace={() => setView('workspace')} />}
      </div>

      <nav className="mobile-nav" aria-label="移动端主导航">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}><Icon size={19} /><span>{item.label}</span></button>;
        })}
      </nav>

      <input ref={fileInputRef} className="visually-hidden" type="file" accept=".c,.h,.txt,text/x-c,text/plain" onChange={(event) => importFile(event.target.files?.[0])} tabIndex={-1} />

      {settingsOpen && <SettingsModal settings={settings} onChange={setSettings} onClose={closeModal} />}
      {shareUrl && <ShareModal url={shareUrl} onClose={closeModal} onCopy={async (text) => {
        const copied = await copyText(text);
        if (!copied) notify('自动复制失败，请手动选择链接复制。');
        return copied;
      }} />}
      {pending && (
        <Modal title={pendingCopy.title} description={pendingCopy.description} onClose={closeModal} size="small">
          <div className="confirm-note"><Share2 size={18} /><p>自动保存会持续保留最新版本，但不会保留被覆盖之前的版本。</p></div>
          <div className="modal-actions"><button className="button secondary" onClick={closeModal}>取消</button><button className="button primary" onClick={applyPending}>{pendingCopy.action}</button></div>
        </Modal>
      )}

      {toast && <div className="toast" role="status" key={toast.id}><Check size={16} />{toast.message}</div>}
    </div>
  );
}

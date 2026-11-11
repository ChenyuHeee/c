import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Download,
  FileCode2,
  FlaskConical,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  Play,
  Plus,
  Share2,
  Square,
  Terminal,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import type {
  ContentReference,
  EditorSettings,
  Exercise,
  ResolvedTheme,
  RunState,
  TestCase,
  TestResult,
} from '../types';
import { createId } from '../lib/storage';
import Editor from './Editor';
import CompilerLoading from './CompilerLoading';

interface WorkbenchProps {
  code: string;
  onCodeChange: (code: string) => void;
  stdin: string;
  onStdinChange: (stdin: string) => void;
  filename: string;
  onFilenameChange: (filename: string) => void;
  content: ContentReference;
  activeExercise?: Exercise;
  testCases: TestCase[];
  onTestCasesChange: (testCases: TestCase[]) => void;
  testResults: Record<string, TestResult>;
  onRunTests: () => void;
  isTesting: boolean;
  settings: EditorSettings;
  theme: ResolvedTheme;
  runState: RunState;
  onRun: () => void;
  onStop: () => void;
  onImport: () => void;
  onExport: () => void;
  onShare: () => void;
}

type SideTab = 'output' | 'tests' | 'brief';
type OutputTab = 'stdout' | 'problems';

const phaseText = {
  idle: '尚未运行',
  running: '正在编译与运行',
  success: '运行完成',
  'compile-error': '编译未通过',
  'runtime-error': '程序异常结束',
  'engine-error': '运行失败',
  cancelled: '已停止',
};

function compilerName(_settings: EditorSettings): string {
  return 'Clang 22 · WASM';
}

function statusIcon(status?: TestResult['status']) {
  if (status === 'running') return <LoaderCircle className="spin" size={17} />;
  if (status === 'passed') return <CheckCircle2 size={17} />;
  if (status === 'failed' || status === 'error') return <XCircle size={17} />;
  return <Circle size={15} />;
}

export default function Workbench({
  code,
  onCodeChange,
  stdin,
  onStdinChange,
  filename,
  onFilenameChange,
  content,
  activeExercise,
  testCases,
  onTestCasesChange,
  testResults,
  onRunTests,
  isTesting,
  settings,
  theme,
  runState,
  onRun,
  onStop,
  onImport,
  onExport,
  onShare,
}: WorkbenchProps) {
  const [sideTab, setSideTab] = useState<SideTab>('output');
  const [outputTab, setOutputTab] = useState<OutputTab>('stdout');
  const [jumpTo, setJumpTo] = useState<{ line: number; column: number; nonce: number }>();
  const diagnostics = runState.result?.diagnostics || [];
  const hasErrors = diagnostics.some((diagnostic) => diagnostic.severity === 'error');
  const isBusy = runState.phase === 'running' || isTesting;

  useEffect(() => {
    if (runState.phase === 'running') setSideTab('output');
    if (runState.phase === 'compile-error') setOutputTab('problems');
    if (runState.phase === 'success' || runState.phase === 'runtime-error') setOutputTab('stdout');
  }, [runState.phase]);

  useEffect(() => {
    if (isTesting) setSideTab('tests');
  }, [isTesting]);

  useEffect(() => {
    if (!activeExercise && sideTab === 'brief') setSideTab('output');
  }, [activeExercise, sideTab]);

  const testSummary = useMemo(() => {
    const results = Object.values(testResults);
    return {
      passed: results.filter((result) => result.status === 'passed').length,
      failed: results.filter((result) => result.status === 'failed' || result.status === 'error').length,
    };
  }, [testResults]);

  const updateTest = (id: string, patch: Partial<TestCase>) => {
    onTestCasesChange(testCases.map((test) => test.id === id ? { ...test, ...patch } : test));
  };

  const addTest = () => {
    onTestCasesChange([...testCases, {
      id: createId(),
      name: `自定义用例 ${testCases.filter((test) => test.source === 'user').length + 1}`,
      input: stdin,
      expected: '',
      source: 'user',
    }]);
  };

  const jumpToDiagnostic = (line: number, column: number) => {
    setJumpTo({ line, column, nonce: Date.now() });
  };

  return (
    <main className="workspace" aria-label="C 语言工作台">
      <section className="editor-panel panel">
        <div className="editor-topbar">
          <div className="file-tab">
            <FileCode2 size={16} />
            <input
              value={filename}
              onChange={(event) => onFilenameChange(event.target.value)}
              onBlur={() => {
                const clean = filename.trim().replace(/[\\/]/g, '-');
                onFilenameChange(clean ? (clean.endsWith('.c') ? clean : `${clean}.c`) : 'main.c');
              }}
              aria-label="文件名"
              spellCheck={false}
            />
          </div>
          <span className={`content-chip ${content.kind}`}>
            {content.kind === 'exercise' ? '练习中' : content.kind === 'example' ? '示例' : '草稿'}
          </span>
          <div className="editor-actions">
            <button className="icon-button" onClick={onImport} title="打开本地 .c 文件" aria-label="打开本地文件"><Upload size={17} /></button>
            <button className="icon-button" onClick={onExport} title="下载当前代码" aria-label="下载代码"><Download size={17} /></button>
            <button className="icon-button" onClick={onShare} title="生成分享链接" aria-label="分享代码"><Share2 size={17} /></button>
          </div>
        </div>

        <div className="editor-container">
          <Editor
            value={code}
            onChange={onCodeChange}
            settings={settings}
            theme={theme}
            diagnostics={diagnostics}
            jumpTo={jumpTo}
          />
        </div>

        <footer className="editor-statusbar">
          <div><span>{settings.standard.toUpperCase()}</span><span>{compilerName(settings)}</span><span>UTF-8</span></div>
          <div><span className="status-dot" />浏览器内编译 · 可离线</div>
        </footer>
      </section>

      <aside className="side-panel panel">
        <div className="side-tabs" role="tablist" aria-label="工作区侧栏">
          <button className={sideTab === 'output' ? 'active' : ''} onClick={() => setSideTab('output')} role="tab" aria-selected={sideTab === 'output'}>
            <Terminal size={16} />控制台
          </button>
          <button className={sideTab === 'tests' ? 'active' : ''} onClick={() => setSideTab('tests')} role="tab" aria-selected={sideTab === 'tests'}>
            <FlaskConical size={16} />测试<span className="tab-count">{testCases.length}</span>
          </button>
          {activeExercise && (
            <button className={sideTab === 'brief' ? 'active' : ''} onClick={() => setSideTab('brief')} role="tab" aria-selected={sideTab === 'brief'}>
              <BookOpen size={16} />题目
            </button>
          )}
        </div>

        {sideTab === 'output' && (
          <div className="console-view">
            <section className="stdin-section">
              <div className="section-label">
                <label htmlFor="stdin-input">标准输入</label>
                <span>stdin</span>
              </div>
              <textarea
                id="stdin-input"
                value={stdin}
                onChange={(event) => onStdinChange(event.target.value)}
                placeholder={'程序需要读取的内容\n例如：12 30'}
                spellCheck={false}
              />
            </section>

            <section className="output-section">
              <div className="output-heading">
                <div className="output-tabs">
                  <button className={outputTab === 'stdout' ? 'active' : ''} onClick={() => setOutputTab('stdout')}>输出</button>
                  <button className={outputTab === 'problems' ? 'active' : ''} onClick={() => setOutputTab('problems')}>
                    问题{diagnostics.length > 0 && <span className={hasErrors ? 'problem-count error' : 'problem-count'}>{diagnostics.length}</span>}
                  </button>
                </div>
                <span className={`run-phase ${runState.phase}`}>{phaseText[runState.phase]}</span>
              </div>

              {outputTab === 'stdout' ? (
                <div className="output-content">
                  {runState.phase === 'idle' && (
                    <div className="empty-state">
                      <div className="empty-icon"><Terminal size={24} /></div>
                      <h3>让代码跑起来</h3>
                      <p>输出、错误和退出状态都会显示在这里。</p>
                      <button className="text-button" onClick={onRun}>运行当前代码<ChevronRight size={15} /></button>
                    </div>
                  )}
                  {runState.phase === 'running' && <CompilerLoading runState={runState} />}
                  {runState.phase === 'engine-error' && (
                    <div className="empty-state error-state">
                      <AlertTriangle size={27} />
                      <h3>本地运行没有完成</h3>
                      <p>{runState.message}</p>
                      <button className="button secondary small" onClick={onRun}>重试</button>
                    </div>
                  )}
                  {runState.phase === 'cancelled' && (
                    <div className="empty-state"><Square size={24} /><h3>已停止运行</h3><p>{runState.message || '代码和输入仍然保留。'}</p></div>
                  )}
                  {runState.result && !['idle', 'running', 'engine-error', 'cancelled'].includes(runState.phase) && (
                    <div className="program-result">
                      {runState.result.stdout
                        ? <pre className="stdout-block">{runState.result.stdout}</pre>
                        : <p className="no-output">（程序没有标准输出）</p>}
                      {runState.result.stderr && (
                        <div className="stderr-block"><span>标准错误</span><pre>{runState.result.stderr}</pre></div>
                      )}
                      {runState.result.signal && <p className="runtime-signal">信号：{runState.result.signal}</p>}
                      {runState.result.compilerMessage && !hasErrors && (
                        <details className="compiler-log">
                          <summary>编译日志（{diagnostics.length} 条提示）</summary>
                          <pre>{runState.result.compilerMessage}</pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="problems-list">
                  {diagnostics.length === 0 ? (
                    <div className="empty-state compact"><CheckCircle2 size={25} /><h3>没有编译问题</h3><p>运行后，警告和错误会出现在这里。</p></div>
                  ) : diagnostics.map((diagnostic, index) => (
                    <article className={`problem-card ${diagnostic.severity}`} key={`${diagnostic.line}-${diagnostic.column}-${index}`}>
                      <button className="problem-location" onClick={() => jumpToDiagnostic(diagnostic.line, diagnostic.column)}>
                        {diagnostic.severity === 'warning' ? <AlertTriangle size={16} /> : diagnostic.severity === 'info' ? <Circle size={14} /> : <XCircle size={16} />}
                        <span>第 {diagnostic.line} 行，第 {diagnostic.column} 列</span><ChevronRight size={14} />
                      </button>
                      <p>{diagnostic.message}</p>
                      {diagnostic.hint && <div className="problem-hint"><Lightbulb size={14} /><span>{diagnostic.hint}</span></div>}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <footer className="console-footer">
              {runState.result ? (
                <><span>退出码 {runState.result.exitCode}</span><span>{(runState.result.duration / 1000).toFixed(2)}s</span></>
              ) : <span>Clang 22 · 本地 WebAssembly</span>}
              <button className={`button ${isBusy ? 'danger' : 'primary'} small run-panel-button`} onClick={isBusy ? onStop : onRun}>
                {isBusy ? <Square size={14} /> : <Play size={14} />}{isBusy ? '停止' : '运行'}
              </button>
            </footer>
          </div>
        )}

        {sideTab === 'tests' && (
          <div className="tests-view">
            <div className="tests-toolbar">
              <div><h3>测试用例</h3><p>逐个运行，比较标准输出。</p></div>
              <button className="icon-button" onClick={addTest} aria-label="新增测试用例" title="新增测试用例"><Plus size={18} /></button>
            </div>
            {testCases.length > 0 && Object.keys(testResults).length > 0 && (
              <div className="test-summary">
                <span className="passed"><Check size={14} />{testSummary.passed} 通过</span>
                <span className="failed"><XCircle size={14} />{testSummary.failed} 未通过</span>
                <span>{testCases.length} 总计</span>
              </div>
            )}
            <div className="test-list">
              {testCases.length === 0 && (
                <div className="empty-state compact"><ListChecks size={25} /><h3>为边界情况留个位置</h3><p>添加输入与期望输出，再批量验证你的程序。</p><button className="button secondary small" onClick={addTest}><Plus size={15} />添加用例</button></div>
              )}
              {testCases.map((test, index) => {
                const result = testResults[test.id];
                const readOnly = test.source === 'exercise';
                return (
                  <article className={`test-card ${result?.status || ''}`} key={test.id}>
                    <div className="test-card-header">
                      <span className={`test-status ${result?.status || 'idle'}`}>{statusIcon(result?.status)}</span>
                      <input value={test.name} onChange={(event) => updateTest(test.id, { name: event.target.value })} aria-label={`测试 ${index + 1} 名称`} readOnly={readOnly} />
                      <span className="test-source">{readOnly ? '公开' : '自定义'}</span>
                      {!readOnly && <button className="icon-button subtle" onClick={() => onTestCasesChange(testCases.filter((item) => item.id !== test.id))} aria-label={`删除 ${test.name}`}><Trash2 size={15} /></button>}
                    </div>
                    <div className="test-io-grid">
                      <label><span>输入</span><textarea value={test.input} onChange={(event) => updateTest(test.id, { input: event.target.value })} readOnly={readOnly} rows={2} spellCheck={false} /></label>
                      <label><span>期望输出</span><textarea value={test.expected} onChange={(event) => updateTest(test.id, { expected: event.target.value })} readOnly={readOnly} rows={2} spellCheck={false} /></label>
                    </div>
                    {result?.actual !== undefined && result.status !== 'passed' && (
                      <div className="actual-output"><span>实际输出</span><pre>{result.actual || '（空）'}</pre>{result.message && <p>{result.message}</p>}</div>
                    )}
                  </article>
                );
              })}
            </div>
            <footer className="tests-footer">
              <span>忽略行尾空格与末尾换行</span>
              <button className="button primary small" onClick={isBusy ? onStop : onRunTests} disabled={!testCases.length}>
                {isTesting ? <Square size={14} /> : <Play size={14} />}{isTesting ? '停止' : isBusy ? '运行中' : '运行全部'}
              </button>
            </footer>
          </div>
        )}

        {sideTab === 'brief' && activeExercise && (
          <div className="brief-view">
            <span className="eyebrow">{activeExercise.category} · {activeExercise.difficulty}</span>
            <h2>{activeExercise.title}</h2>
            <p>{activeExercise.summary}</p>
            <div className="concept-list">{activeExercise.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div>
            <section className="brief-section"><h3>任务要求</h3><ol>{activeExercise.task.map((item) => <li key={item}>{item}</li>)}</ol></section>
            <section className="brief-section"><h3>需要一点提示？</h3>{activeExercise.hints.map((hint, index) => <details className="hint-details" key={hint}><summary><Lightbulb size={15} />提示 {index + 1}<ChevronRight size={14} /></summary><p>{hint}</p></details>)}</section>
            <button className="button secondary full-width" onClick={() => setSideTab('tests')}><FlaskConical size={16} />查看 {activeExercise.tests.length} 个公开测试</button>
          </div>
        )}
      </aside>
    </main>
  );
}

import type { CompileResult, Diagnostic, EditorSettings } from '../types';

const IDLE_TIMEOUT = 30_000;

export class LocalCompilerError extends Error {
  constructor(message: string, public readonly cancelled = false) {
    super(message);
    this.name = 'LocalCompilerError';
  }
}

export function normalizeOutput(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\t ]+$/gm, '')
    .replace(/\n+$/g, '');
}

function friendlyHint(message: string, severity: Diagnostic['severity']): string | undefined {
  if (/unused variable|unused-but-set-variable/i.test(message)) {
    return '这个提示不影响运行。使用这个变量，或删除不需要的声明即可。';
  }
  if (/was not declared in this scope|use of undeclared identifier|undeclared \(first use/i.test(message)) {
    return '检查变量或函数是否先声明，以及拼写和作用域是否正确。';
  }
  if (/implicit declaration of function|call to undeclared function/i.test(message)) {
    return '确认包含了正确的头文件；自定义函数还需要在使用前声明。';
  }
  if (/expected.*[;；]|expected.*before/i.test(message)) {
    return '优先检查这一行和上一行的分号、括号是否完整。';
  }
  if (/expects argument of type|format specifies type|too many arguments to format|too few arguments/i.test(message)) {
    return '检查 printf / scanf 的格式说明符是否与参数类型、数量一致。';
  }
  if (/incompatible pointer|incompatible types|assignment to.*from/i.test(message)) {
    return '检查赋值两边的类型；指针、数组和普通变量不能直接混用。';
  }
  if (/address of stack memory|returns address of local/i.test(message)) {
    return '局部变量会在函数结束后失效，不要返回它的地址。';
  }
  if (/array subscript is not an integer|subscripted value is neither array nor pointer/i.test(message)) {
    return '下标必须是整数，并且被下标访问的值应当是数组或指针。';
  }
  if (/division by zero/i.test(message)) {
    return '除数可能为零，请在除法或取余之前增加判断。';
  }
  if (severity === 'error') {
    return '从第一条错误开始修复；后续错误可能只是由它引起的连锁反应。';
  }
  return undefined;
}

export function parseDiagnostics(compilerMessage: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const seen = new Set<string>();
  const pattern = /(?:prog|main)\.c:(\d+):(?:(\d+):)?\s+(fatal error|error|warning|note):\s*(.+)/;

  for (const sourceLine of compilerMessage.split('\n')) {
    const match = sourceLine.match(pattern);
    if (!match) continue;
    const line = Number(match[1]);
    const column = Number(match[2] || 1);
    const rawSeverity = match[3];
    const severity = rawSeverity === 'warning' ? 'warning' : rawSeverity === 'note' ? 'info' : 'error';
    const message = match[4].trim();
    const key = `${line}:${column}:${severity}:${message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    diagnostics.push({ line, column, severity, message, hint: friendlyHint(message, severity) });
  }

  return diagnostics;
}

interface ProgressUpdate {
  stage: string;
  progress: number;
  message?: string;
}

interface PendingRun {
  id: number;
  resolve: (result: CompileResult) => void;
  reject: (error: LocalCompilerError) => void;
  signal?: AbortSignal;
  onProgress?: (update: ProgressUpdate) => void;
  timer: number;
}

let worker: Worker | null = null;
let pending: PendingRun | null = null;
let nextId = 1;

function clearPendingTimer(run: PendingRun) {
  window.clearTimeout(run.timer);
}

function stopWorker() {
  if (worker) {
    worker.onmessage = null;
    worker.onerror = null;
    worker.onmessageerror = null;
    worker.terminate();
    worker = null;
  }
}

function cancelPending(message: string) {
  if (!pending) return;
  clearPendingTimer(pending);
  const run = pending;
  pending = null;
  stopWorker();
  run.reject(new LocalCompilerError(message, true));
}

function armIdleTimer(run: PendingRun, timeout = IDLE_TIMEOUT) {
  clearPendingTimer(run);
  run.timer = window.setTimeout(() => {
    if (pending?.id !== run.id) return;
    cancelPending('运行超过 30 秒没有进展，已终止本地 Worker。请检查程序是否存在死循环。');
  }, timeout);
}

function ensureWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('../workers/c-compiler.worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (event: MessageEvent) => {
    const run = pending;
    const message = event.data;
    if (!run || message.id !== run.id) return;

    if (message.type === 'progress') {
      run.onProgress?.({ stage: message.stage, progress: message.progress, message: message.message });
      armIdleTimer(run);
      return;
    }

    clearPendingTimer(run);
    pending = null;
    if (message.type === 'result') {
      const result = message.result as CompileResult;
      const stripAnsi = (value: string) => value.replace(/\u001b\[[0-9;]*m/g, '');
      result.compilerMessage = stripAnsi(result.compilerMessage);
      result.diagnostics = result.diagnostics.map((diagnostic) => ({
        ...diagnostic,
        message: stripAnsi(diagnostic.message),
        hint: diagnostic.hint || friendlyHint(stripAnsi(diagnostic.message), diagnostic.severity),
      }));
      run.resolve(result);
      return;
    }

    stopWorker();
    run.reject(new LocalCompilerError(message.message || '本地编译器发生未知错误。'));
  };

  worker.onerror = () => {
    if (!pending) return;
    clearPendingTimer(pending);
    const run = pending;
    pending = null;
    stopWorker();
    run.reject(new LocalCompilerError('本地编译 Worker 启动失败。请使用支持 WebAssembly 的现代浏览器，或尝试刷新页面。'));
  };

  worker.onmessageerror = () => {
    if (!pending) return;
    clearPendingTimer(pending);
    const run = pending;
    pending = null;
    stopWorker();
    run.reject(new LocalCompilerError('本地编译器返回了无法读取的结果，请重试。'));
  };

  return worker;
}

export async function compileAndRun(
  code: string,
  stdin: string,
  settings: Pick<EditorSettings, 'standard'>,
  externalSignal?: AbortSignal,
  onProgress?: (update: ProgressUpdate) => void,
): Promise<CompileResult> {
  if (!code.trim()) {
    throw new LocalCompilerError('编辑器还是空的，先写一点 C 代码吧。');
  }
  if (pending) {
    throw new LocalCompilerError('已有一个本地编译任务正在进行。');
  }
  if (externalSignal?.aborted) {
    throw new LocalCompilerError('已停止本次运行。', true);
  }

  return new Promise<CompileResult>((resolve, reject) => {
    const id = nextId++;
    const run: PendingRun = { id, resolve, reject, signal: externalSignal, onProgress, timer: 0 };
    pending = run;
    armIdleTimer(run);
    externalSignal?.addEventListener('abort', () => {
      if (pending?.id === id) cancelPending('已停止本次运行。');
    }, { once: true });

    try {
      const assetBaseUrl = new URL(`${import.meta.env.BASE_URL}clang/`, window.location.href).href;
      ensureWorker().postMessage({ id, code, stdin, standard: settings.standard, assetBaseUrl });
    } catch (error) {
      clearPendingTimer(run);
      pending = null;
      stopWorker();
      reject(new LocalCompilerError(error instanceof Error ? error.message : '无法启动本地编译器。'));
    }
  });
}

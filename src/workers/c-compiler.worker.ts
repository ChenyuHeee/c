import {
  createClangCompiler,
  executeBrowserClangArtifact,
  type CompilerDiagnostic,
} from '@wasm-idle/llvm-core/clang';

if (typeof globalThis.SharedArrayBuffer === 'undefined') {
  Object.defineProperty(globalThis, 'SharedArrayBuffer', { value: class SharedArrayBuffer {}, configurable: true });
}

interface RunRequest {
  id: number;
  code: string;
  stdin: string;
  standard: 'c99' | 'c11' | 'c17';
  assetBaseUrl: string;
}

interface DiagnosticPayload {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

function mapDiagnostic(diagnostic: CompilerDiagnostic): DiagnosticPayload {
  return {
    line: Math.max(1, diagnostic.lineNumber || 1),
    column: Math.max(1, diagnostic.columnNumber || 1),
    severity: diagnostic.severity === 'error' ? 'error' : diagnostic.severity === 'warning' ? 'warning' : 'info',
    message: diagnostic.message,
  };
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { id, code, stdin, standard, assetBaseUrl } = event.data;
  const startedAt = performance.now();

  try {
    const compiler = await createClangCompiler({
      runtimeBaseUrl: assetBaseUrl,
      maxAssetBytes: 128 * 1024 * 1024,
    });
    const compileStarted = performance.now();
    const compiled = await compiler.compile({
      code,
      language: 'C',
      target: 'wasm32-wasi',
      fileName: 'main.c',
      compileArgs: [`-std=${standard}`, '-Wall', '-Wextra', '-Wpedantic'],
      maxWasmMemoryBytes: 128 * 1024 * 1024,
      onProgress: (progress) => {
        self.postMessage({
          type: 'progress',
          id,
          stage: progress.stage,
          progress: progress.percent,
          message: progress.message,
        });
      },
    });
    const compileMs = performance.now() - compileStarted;
    const diagnostics = (compiled.diagnostics || []).map(mapDiagnostic);
    const compilerMessage = compiled.stderr || compiled.stdout || '';

    if (!compiled.success || !compiled.artifact) {
      if (!diagnostics.length) {
        diagnostics.push({
          line: 1,
          column: 1,
          severity: 'error',
          message: compilerMessage || 'Clang 未能完成编译。',
        });
      }
      self.postMessage({
        type: 'result',
        id,
        result: {
          stdout: '',
          stderr: '',
          compilerMessage,
          exitCode: 1,
          duration: performance.now() - startedAt,
          compiled: false,
          compileMs,
          diagnostics,
        },
      });
      return;
    }

    self.postMessage({ type: 'progress', id, stage: 'run', progress: 100 });
    const runStarted = performance.now();
    const execution = await executeBrowserClangArtifact(compiled.artifact, {
      stdin: () => stdin,
      maxWasmMemoryBytes: 128 * 1024 * 1024,
    });
    const runMs = performance.now() - runStarted;

    self.postMessage({
      type: 'result',
      id,
      result: {
        stdout: execution.stdout,
        stderr: execution.stderr,
        compilerMessage: compiled.stdout || '',
        exitCode: execution.exitCode ?? 1,
        duration: performance.now() - startedAt,
        compiled: true,
        compileMs,
        runMs,
        diagnostics,
      },
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

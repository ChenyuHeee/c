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

const ASSETS: Record<string, { name: string; bytes: number }> = {
  'runtime-manifest.v1.json': { name: '编译器清单', bytes: 876 },
  'bin/memfs.wasm.gz': { name: '虚拟文件系统', bytes: 38_702 },
  'bin/clang.wasm.gz': { name: 'Clang 编译器', bytes: 15_721_977 },
  'bin/lld.wasm.gz': { name: 'WASM 链接器', bytes: 7_837_837 },
  'bin/sysroot.tar.gz': { name: 'C 标准库与头文件', bytes: 5_401_380 },
};
const TOTAL_ASSET_BYTES = Object.values(ASSETS).reduce((total, asset) => total + asset.bytes, 0);

function mapDiagnostic(diagnostic: CompilerDiagnostic): DiagnosticPayload {
  return {
    line: Math.max(1, diagnostic.lineNumber || 1),
    column: Math.max(1, diagnostic.columnNumber || 1),
    severity: diagnostic.severity === 'error' ? 'error' : diagnostic.severity === 'warning' ? 'warning' : 'info',
    message: diagnostic.message,
  };
}

function createTrackedFetch(id: number): typeof fetch {
  let settledBytes = 0;
  const active = new Map<string, { loaded: number; total: number }>();

  return async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const key = Object.keys(ASSETS).find((asset) => url.endsWith(asset));
    if (!key) return fetch(input, init);

    const asset = ASSETS[key];
    active.set(url, { loaded: 0, total: asset.bytes });
    const emit = (message: string) => {
      const activeEntry = active.get(url);
      const loadedBytes = settledBytes + Array.from(active.values()).reduce((total, entry) => total + entry.loaded, 0);
      self.postMessage({
        type: 'progress',
        id,
        stage: 'bootstrap',
        progress: Math.min(99, (loadedBytes / TOTAL_ASSET_BYTES) * 100),
        message,
        loadedBytes,
        totalBytes: TOTAL_ASSET_BYTES,
        assetName: asset.name,
        assetLoadedBytes: activeEntry?.loaded ?? asset.bytes,
        assetTotalBytes: activeEntry?.total ?? asset.bytes,
      });
    };

    emit(`正在准备${asset.name}`);
    const response = await fetch(input, init);
    const expectedBytes = Number(response.headers.get('content-length')) || asset.bytes;
    active.set(url, { loaded: 0, total: expectedBytes });

    if (!response.body) {
      active.delete(url);
      settledBytes += expectedBytes;
      emit(`${asset.name}已就绪`);
      return response;
    }

    const reader = response.body.getReader();
    let actualBytes = 0;
    let lastEmit = 0;
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          active.delete(url);
          settledBytes += actualBytes;
          emit(`${asset.name}已就绪`);
          controller.close();
          return;
        }
        actualBytes += value.byteLength;
        active.set(url, { loaded: actualBytes, total: expectedBytes });
        const now = performance.now();
        if (now - lastEmit >= 80) {
          emit(`正在下载${asset.name}`);
          lastEmit = now;
        }
        controller.enqueue(value);
      },
      async cancel(reason) {
        active.delete(url);
        await reader.cancel(reason);
      },
    });

    return new Response(stream, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { id, code, stdin, standard, assetBaseUrl } = event.data;
  const startedAt = performance.now();

  try {
    const compiler = await createClangCompiler({
      runtimeBaseUrl: assetBaseUrl,
      maxAssetBytes: 128 * 1024 * 1024,
      fetchImpl: createTrackedFetch(id),
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

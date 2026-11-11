import { Check, CheckCircle2, Circle, Download, LoaderCircle } from 'lucide-react';
import type { RunState } from '../types';

const STEPS = [
  { id: 'bootstrap', label: '准备本地编译器', detail: 'Clang、链接器与 C 标准库' },
  { id: 'compile', label: '编译当前代码', detail: '检查语法并生成 WASM' },
  { id: 'run', label: '运行程序', detail: '执行并收集输出' },
];

function formatMB(bytes?: number): string {
  if (bytes === undefined) return '—';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function stageIndex(stage?: string): number {
  if (stage === 'run') return 2;
  if (stage && stage !== 'bootstrap') return 1;
  return 0;
}

export default function CompilerLoading({ runState }: { runState: RunState }) {
  const stage = runState.stage || 'bootstrap';
  const currentIndex = stageIndex(stage);
  const isDownloading = stage === 'bootstrap';
  const percent = Math.min(100, Math.max(0, Math.round(runState.progress || 0)));
  const assetPercent = runState.assetTotalBytes
    ? Math.min(100, Math.round(((runState.assetLoadedBytes || 0) / runState.assetTotalBytes) * 100))
    : 0;

  return (
    <div className={`compiler-loading ${isDownloading ? 'is-downloading' : ''}`}>
      <div className="loading-intro">
        <div className="download-badge"><Download size={22} /></div>
        <div>
          <span className="loading-kicker">{isDownloading ? '首次运行 · 只需准备一次' : 'Clang 22 · 本地 WebAssembly'}</span>
          <h3>{isDownloading ? '正在准备本地编译器' : stage === 'run' ? '程序正在运行' : '正在编译你的代码'}</h3>
          <p>{isDownloading ? '下载完成后会保存在浏览器中，之后离线也能直接使用。' : '源代码没有离开这台设备，请稍候。'}</p>
        </div>
      </div>

      <div className="download-progress">
        <div className="progress-heading">
          <span>{isDownloading ? (runState.assetName || '正在连接编译资源') : STEPS[currentIndex].label}</span>
          <strong>{percent}<small>%</small></strong>
        </div>
        <div className="download-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="本地编译准备进度">
          <span style={{ width: `${Math.max(percent, 2)}%` }} />
        </div>
        <div className="progress-meta">
          {isDownloading ? (
            <>
              <span>{formatMB(runState.loadedBytes)} / {formatMB(runState.totalBytes)}</span>
              <span>{runState.assetName ? `当前组件 ${assetPercent}%` : '等待下载信息'}</span>
            </>
          ) : (
            <><span>{STEPS[currentIndex].detail}</span><span>步骤 {currentIndex + 1} / 3</span></>
          )}
        </div>
      </div>

      <ol className="loading-steps">
        {STEPS.map((step, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'pending';
          return (
            <li className={state} key={step.id}>
              <span className="step-icon">
                {state === 'done' ? <CheckCircle2 size={17} /> : state === 'active' ? <LoaderCircle className="spin" size={17} /> : <Circle size={15} />}
              </span>
              <span><strong>{step.label}</strong><small>{step.detail}</small></span>
              <span className="step-state">{state === 'done' ? '完成' : state === 'active' ? '进行中' : '等待'}</span>
            </li>
          );
        })}
      </ol>

      <div className="loading-offline-note"><Check size={14} /><span>编译器缓存后可离线使用，代码始终留在本机</span></div>
    </div>
  );
}

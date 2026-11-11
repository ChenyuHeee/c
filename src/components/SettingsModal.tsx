import type { EditorSettings } from '../types';
import Modal from './Modal';

interface SettingsModalProps {
  settings: EditorSettings;
  onChange: (settings: EditorSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onChange, onClose }: SettingsModalProps) {
  const update = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <Modal title="工作台设置" description="设置会保存在当前浏览器中。" onClose={onClose}>
      <div className="settings-grid">
        <section className="settings-section">
          <h3>编译</h3>
          <div className="field-label">
            <span>本地编译器</span>
            <div className="engine-value"><strong>Clang 22</strong><small>WebAssembly · WASI · 代码不离开本机</small></div>
          </div>
          <label className="field-label">
            <span>语言标准</span>
            <select value={settings.standard} onChange={(event) => update('standard', event.target.value as EditorSettings['standard'])}>
              <option value="c99">C99</option>
              <option value="c11">C11</option>
              <option value="c17">C17</option>
            </select>
          </label>
          <p className="field-help">始终启用 -Wall、-Wextra 和 -Wpedantic，让潜在问题尽早暴露。</p>
        </section>

        <section className="settings-section">
          <h3>编辑器</h3>
          <label className="field-label">
            <span>外观</span>
            <select value={settings.theme} onChange={(event) => update('theme', event.target.value as EditorSettings['theme'])}>
              <option value="system">跟随系统</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </label>
          <label className="field-label">
            <span>字号</span>
            <div className="range-field">
              <input type="range" min="12" max="22" step="1" value={settings.fontSize} onChange={(event) => update('fontSize', Number(event.target.value))} />
              <output>{settings.fontSize}px</output>
            </div>
          </label>
          <label className="field-label">
            <span>缩进宽度</span>
            <select value={settings.tabSize} onChange={(event) => update('tabSize', Number(event.target.value))}>
              <option value="2">2 个空格</option>
              <option value="4">4 个空格</option>
              <option value="8">8 个空格</option>
            </select>
          </label>
          <label className="toggle-field">
            <span><strong>自动换行</strong><small>长行在编辑器边缘换行</small></span>
            <input type="checkbox" checked={settings.wordWrap} onChange={(event) => update('wordWrap', event.target.checked)} />
          </label>
        </section>
      </div>
      <div className="modal-actions">
        <button className="button primary" onClick={onClose}>完成</button>
      </div>
    </Modal>
  );
}

import { useState } from 'react';
import { Check, Copy, Link2 } from 'lucide-react';
import Modal from './Modal';

interface ShareModalProps {
  url: string;
  onCopy: (text: string) => Promise<boolean>;
  onClose: () => void;
}

export default function ShareModal({ url, onCopy, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (await onCopy(url)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <Modal title="分享这份代码" description="代码和测试用例会被压缩进链接，无需账号或服务器。" onClose={onClose}>
      <div className="share-visual"><Link2 size={26} /><span>一个链接，还原整个工作现场</span></div>
      <label className="field-label">
        <span>分享链接 <small className="inline-meta">{url.length.toLocaleString()} 字符</small></span>
        <textarea className="share-url" value={url} readOnly rows={4} onFocus={(event) => event.target.select()} />
      </label>
      <p className="notice-text">任何拿到链接的人都能读取其中的代码。请移除密码、个人资料等敏感内容；很长的代码建议改用文件导出。</p>
      <div className="modal-actions">
        <button className="button secondary" onClick={onClose}>取消</button>
        <button className="button primary" onClick={copy}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? '已复制' : '复制链接'}
        </button>
      </div>
    </Modal>
  );
}

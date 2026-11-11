import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  FileDown,
  FlaskConical,
  Keyboard,
  Lightbulb,
  Link2,
  LockKeyhole,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  WifiOff,
} from 'lucide-react';
import { EXAMPLES } from '../data/examples';
import { EXERCISES } from '../data/exercises';
import type { Example, Exercise } from '../types';

export function ExamplesPage({ onSelect }: { onSelect: (example: Example) => void }) {
  const [category, setCategory] = useState('全部');
  const [query, setQuery] = useState('');
  const categories = ['全部', ...new Set(EXAMPLES.map((example) => example.category))];
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return EXAMPLES.filter((example) => {
      const inCategory = category === '全部' || example.category === category;
      const matches = !keyword || `${example.title} ${example.summary} ${example.concepts.join(' ')}`.toLowerCase().includes(keyword);
      return inCategory && matches;
    });
  }, [category, query]);

  return (
    <main className="page-content library-page">
      <section className="page-hero examples-hero">
        <div>
          <span className="eyebrow"><Sparkles size={14} />可运行的学习材料</span>
          <h1>别只读代码。<br /><em>改一改，跑一遍。</em></h1>
          <p>从第一个 printf 到动态内存，每个示例都可以直接载入工作台，配上输入，观察真实结果。</p>
        </div>
        <div className="hero-code-card" aria-hidden="true">
          <div><span /><span /><span /></div>
          <div className="hero-code-lines">
            <div><span className="code-purple">int</span> main(<span className="code-purple">void</span>) {'{'}</div>
            <div>&nbsp;&nbsp;<span className="code-blue">printf</span>(<span className="code-green">"Stay curious.\n"</span>);</div>
            <div>&nbsp;&nbsp;<span className="code-purple">return</span> <span className="code-orange">0</span>;</div>
            <div>{'}'}</div>
          </div>
          <span className="hero-code-output"><Terminal size={14} />Stay curious.</span>
        </div>
      </section>

      <section className="library-controls">
        <div className="filter-pills">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索概念或示例" /></label>
      </section>

      <div className="results-meta"><span>{filtered.length} 个示例</span><span>所有示例使用标准 C</span></div>
      <section className="example-grid">
        {filtered.map((example, index) => (
          <button className="example-card" key={example.id} onClick={() => onSelect(example)}>
            <div className="example-card-top"><span className="example-number">{String(index + 1).padStart(2, '0')}</span><span className="example-time"><Clock3 size={13} />{example.minutes} 分钟</span></div>
            <span className="example-category">{example.category}</span>
            <h2>{example.title}</h2>
            <p>{example.summary}</p>
            <div className="concept-list">{example.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div>
            <div className="example-card-action">打开并运行<ArrowUpRight size={17} /></div>
          </button>
        ))}
      </section>
      {filtered.length === 0 && <div className="page-empty"><Search size={28} /><h2>没有找到相关示例</h2><p>试试“指针”“循环”或清空分类。</p><button className="button secondary" onClick={() => { setQuery(''); setCategory('全部'); }}>清空筛选</button></div>}
    </main>
  );
}

export function ExercisesPage({ onStart, onSolution }: { onStart: (exercise: Exercise) => void; onSolution: (exercise: Exercise) => void }) {
  const [selectedId, setSelectedId] = useState(EXERCISES[0].id);
  const selected = EXERCISES.find((exercise) => exercise.id === selectedId) || EXERCISES[0];

  return (
    <main className="page-content exercises-page">
      <section className="simple-page-heading">
        <div><span className="eyebrow"><FlaskConical size={14} />真实编译 · 公开测试</span><h1>把“我会了”变成<br /><em>“它通过了”。</em></h1></div>
        <p>每道题都带有起始代码和公开测试。先独立思考，再展开提示；参考答案也只是一次可运行的比较，而不是终点。</p>
      </section>

      <div className="exercise-layout">
        <aside className="exercise-list panel">
          <div className="exercise-list-heading"><span>练习目录</span><span>{EXERCISES.length} 题</span></div>
          {EXERCISES.map((exercise, index) => (
            <button key={exercise.id} className={exercise.id === selected.id ? 'active' : ''} onClick={() => setSelectedId(exercise.id)}>
              <span className="exercise-index">{String(index + 1).padStart(2, '0')}</span>
              <span><strong>{exercise.title}</strong><small>{exercise.category} · {exercise.difficulty}</small></span>
              <ChevronRight size={16} />
            </button>
          ))}
        </aside>

        <article className="exercise-detail panel">
          <header className="exercise-detail-header">
            <div><span className={`difficulty ${selected.difficulty}`}>{selected.difficulty}</span><span className="exercise-category-label">{selected.category}</span><h2>{selected.title}</h2><p>{selected.summary}</p></div>
            <div className="exercise-icon"><Code2 size={28} /></div>
          </header>
          <div className="concept-list">{selected.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div>

          <section className="detail-section"><h3><BookOpen size={18} />任务要求</h3><ol className="task-list">{selected.task.map((item) => <li key={item}>{item}</li>)}</ol></section>

          <section className="detail-section">
            <h3><FlaskConical size={18} />公开测试 <span>{selected.tests.length}</span></h3>
            <div className="public-tests">
              {selected.tests.map((test) => <details key={test.name}><summary><CheckCircle2 size={15} />{test.name}<ChevronRight size={14} /></summary><div><label>输入<pre>{test.input}</pre></label><label>期望输出<pre>{test.expected}</pre></label></div></details>)}
            </div>
          </section>

          <section className="detail-section"><h3><Lightbulb size={18} />渐进提示</h3><div className="public-tests">{selected.hints.map((hint, index) => <details key={hint}><summary><Lightbulb size={15} />提示 {index + 1}<ChevronRight size={14} /></summary><p className="detail-hint">{hint}</p></details>)}</div></section>

          <footer className="exercise-detail-actions">
            <button className="button ghost" onClick={() => onSolution(selected)}>查看参考答案</button>
            <button className="button primary" onClick={() => onStart(selected)}><Play size={16} />开始练习<ArrowRight size={16} /></button>
          </footer>
        </article>
      </div>
    </main>
  );
}

export function GuidePage({ onOpenExamples, onOpenWorkspace }: { onOpenExamples: () => void; onOpenWorkspace: () => void }) {
  return (
    <main className="page-content guide-page">
      <section className="simple-page-heading guide-heading">
        <div><span className="eyebrow"><BookOpen size={14} />使用指南</span><h1>你的 C 语言<br /><em>实验桌。</em></h1></div>
        <p>C Lab 不替代教材，也不假装在浏览器里模拟 C。它把编辑、真实编译、测试和复盘放在同一个安静的地方。</p>
      </section>

      <section className="guide-steps">
        <article><span>01</span><Code2 size={22} /><h2>写</h2><p>从草稿、示例或练习开始。编辑器会自动缩进、补全括号，并在每次修改后保存到本机。</p></article>
        <article><span>02</span><Play size={22} /><h2>跑</h2><p>准备标准输入，点击运行。Clang 22 会在这台设备上将代码编译为 WASM 并执行。</p></article>
        <article><span>03</span><FlaskConical size={22} /><h2>验证</h2><p>为正常、边界和异常输入添加用例。比较实际输出，点击诊断回到源码位置。</p></article>
      </section>

      <div className="guide-columns">
        <section className="guide-section panel">
          <h2><Keyboard size={21} />快捷键</h2>
          <div className="shortcut-list"><div><span>运行当前代码</span><span><kbd>⌘ / Ctrl</kbd><kbd>Enter</kbd></span></div><div><span>下载当前 .c 文件</span><span><kbd>⌘ / Ctrl</kbd><kbd>S</kbd></span></div><div><span>编辑器撤销 / 重做</span><span><kbd>⌘ / Ctrl</kbd><kbd>Z / ⇧ Z</kbd></span></div><div><span>搜索与替换</span><span><kbd>⌘ / Ctrl</kbd><kbd>F</kbd></span></div></div>
        </section>

        <section className="guide-section panel privacy-section">
          <h2><LockKeyhole size={21} />代码去了哪里？</h2>
          <div className="privacy-flow"><div><LockKeyhole size={19} /><strong>编辑时</strong><p>仅保存在你的浏览器</p></div><ArrowRight size={18} /><div><Terminal size={19} /><strong>运行时</strong><p>仍在你的浏览器内编译</p></div></div>
          <p>不需要账号，没有编译 API 或云端数据库。源代码不会上传；清理站点数据会删除草稿与编译器缓存，重要代码请下载备份。</p>
        </section>
      </div>

      <section className="faq-section">
        <span className="eyebrow">常见问题</span><h2>透明，比魔法更重要。</h2>
        <details><summary><WifiOff size={18} />离线时还能使用吗？<ChevronRight size={17} /></summary><p>首次下载约 28 MB 的 Clang 资源需要网络。缓存完成后，编辑、示例、练习和真实编译都能离线进行；源代码不会因为运行而上传。</p></details>
        <details><summary><ShieldCheck size={18} />这是完整、真实的 C 环境吗？<ChevronRight size={17} /></summary><p>Clang 22 在 Web Worker 中将 C 编译为 wasm32-wasi 模块，再由浏览器执行，不是 JavaScript 模拟器。它适合单文件学习和实验；多文件构建、外部本地库、交互式调试器和原生操作系统 API 不在支持范围内。</p></details>
        <details><summary><Link2 size={18} />分享链接会上传代码吗？<ChevronRight size={17} /></summary><p>不会额外上传。代码、输入和测试被压缩到 URL 的 hash 中，打开链接时在浏览器本地解压。链接持有者可以读取内容，所以不要分享敏感信息。</p></details>
        <details><summary><FileDown size={18} />怎样避免丢失重要代码？<ChevronRight size={17} /></summary><p>C Lab 会在修改后自动保存，但本地存储不是版本控制系统。重要工作请用“下载”保存 .c 文件，或纳入你自己的 Git 项目。</p></details>
      </section>

      <section className="guide-cta"><div><span className="eyebrow">开始动手</span><h2>下一行，由你来写。</h2></div><div><button className="button secondary" onClick={onOpenExamples}>浏览示例</button><button className="button primary" onClick={onOpenWorkspace}>打开工作台<ArrowRight size={16} /></button></div></section>
    </main>
  );
}

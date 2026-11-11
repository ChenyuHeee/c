export type AppView = 'workspace' | 'examples' | 'exercises' | 'guide';
export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export type CStandard = 'c99' | 'c11' | 'c17';
export type CompilerId = 'clang-22-wasm';

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  theme: ThemePreference;
  compiler: CompilerId;
  standard: CStandard;
}

export interface ContentReference {
  kind: 'draft' | 'example' | 'exercise';
  id?: string;
  title: string;
}

export interface TestCase {
  id: string;
  name: string;
  input: string;
  expected: string;
  source: 'user' | 'exercise';
}

export type TestStatus = 'idle' | 'running' | 'passed' | 'failed' | 'error';

export interface TestResult {
  status: TestStatus;
  actual?: string;
  message?: string;
  duration?: number;
}

export interface Workspace {
  code: string;
  stdin: string;
  filename: string;
  testCases: TestCase[];
  content: ContentReference;
}

export interface Diagnostic {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  hint?: string;
}

export interface CompileResult {
  stdout: string;
  stderr: string;
  compilerMessage: string;
  exitCode: number;
  duration: number;
  compiled: boolean;
  compileMs?: number;
  runMs?: number;
  signal?: string;
  diagnostics: Diagnostic[];
}

export type RunPhase =
  | 'idle'
  | 'running'
  | 'success'
  | 'compile-error'
  | 'runtime-error'
  | 'engine-error'
  | 'cancelled';

export interface RunState {
  phase: RunPhase;
  result?: CompileResult;
  message?: string;
  progress?: number;
  stage?: string;
  loadedBytes?: number;
  totalBytes?: number;
  assetName?: string;
  assetLoadedBytes?: number;
  assetTotalBytes?: number;
}

export interface Example {
  id: string;
  title: string;
  summary: string;
  category: string;
  minutes: number;
  concepts: string[];
  code: string;
  stdin?: string;
}

export interface Exercise {
  id: string;
  title: string;
  summary: string;
  category: string;
  difficulty: '入门' | '基础' | '进阶';
  concepts: string[];
  task: string[];
  starterCode: string;
  tests: Array<Omit<TestCase, 'id' | 'source'>>;
  hints: string[];
  solution: string;
}

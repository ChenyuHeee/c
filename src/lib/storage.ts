import type { EditorSettings, TestCase, Workspace } from '../types';

const WORKSPACE_KEY = 'c-lab.workspace.v2';
const SETTINGS_KEY = 'c-lab.settings.v2';

export const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 15,
  tabSize: 4,
  wordWrap: true,
  theme: 'system',
  compiler: 'clang-22-wasm',
  standard: 'c17',
};

export function createId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function validTestCases(value: unknown): TestCase[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const test = item as Partial<TestCase>;
    if (typeof test.input !== 'string' || typeof test.expected !== 'string') return [];
    return [{
      id: typeof test.id === 'string' ? test.id : createId(),
      name: typeof test.name === 'string' ? test.name : '测试用例',
      input: test.input,
      expected: test.expected,
      source: test.source === 'exercise' ? 'exercise' : 'user',
    }];
  });
}

export function loadWorkspace(): Workspace | null {
  try {
    const raw = localStorage.getItem(WORKSPACE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Workspace>;
    if (typeof data.code !== 'string') return null;
    return {
      code: data.code,
      stdin: typeof data.stdin === 'string' ? data.stdin : '',
      filename: typeof data.filename === 'string' && data.filename ? data.filename : 'main.c',
      testCases: validTestCases(data.testCases),
      content: {
        kind: data.content?.kind === 'example' || data.content?.kind === 'exercise' ? data.content.kind : 'draft',
        id: typeof data.content?.id === 'string' ? data.content.id : undefined,
        title: typeof data.content?.title === 'string' ? data.content.title : '未命名草稿',
      },
    };
  } catch {
    return null;
  }
}

export function saveWorkspace(workspace: Workspace): boolean {
  try {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredWorkspace(): void {
  try {
    localStorage.removeItem(WORKSPACE_KEY);
  } catch {
    // Storage can be unavailable in private browsing; the in-memory reset still works.
  }
}

export function loadSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const data = JSON.parse(raw) as Partial<EditorSettings>;
    return {
      fontSize: typeof data.fontSize === 'number' ? Math.min(22, Math.max(12, data.fontSize)) : 15,
      tabSize: data.tabSize === 2 || data.tabSize === 8 ? data.tabSize : 4,
      wordWrap: typeof data.wordWrap === 'boolean' ? data.wordWrap : true,
      theme: data.theme === 'light' || data.theme === 'dark' ? data.theme : 'system',
      compiler: 'clang-22-wasm',
      standard: data.standard === 'c99' || data.standard === 'c11' ? data.standard : 'c17',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: EditorSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Settings remain active for this session.
  }
}

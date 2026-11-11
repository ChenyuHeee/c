import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { TestCase, Workspace } from '../types';
import { createId } from './storage';

interface SharePayload {
  version: 1;
  code: string;
  stdin: string;
  filename: string;
  testCases?: TestCase[];
}

export function encodeWorkspace(workspace: Workspace): string {
  const payload: SharePayload = {
    version: 1,
    code: workspace.code,
    stdin: workspace.stdin,
    filename: workspace.filename,
    testCases: workspace.testCases.length ? workspace.testCases : undefined,
  };
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeWorkspace(encoded: string): Workspace | null {
  try {
    if (!encoded || encoded.length > 250_000) return null;
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const payload = JSON.parse(json) as Partial<SharePayload>;
    if (payload.version !== 1 || typeof payload.code !== 'string') return null;
    const testCases = Array.isArray(payload.testCases)
      ? payload.testCases.flatMap((test) => {
          if (typeof test.input !== 'string' || typeof test.expected !== 'string') return [];
          return [{
            id: createId(),
            name: typeof test.name === 'string' ? test.name : '分享用例',
            input: test.input,
            expected: test.expected,
            source: 'user' as const,
          }];
        })
      : [];
    return {
      code: payload.code,
      stdin: typeof payload.stdin === 'string' ? payload.stdin : '',
      filename: typeof payload.filename === 'string' && payload.filename ? payload.filename : 'main.c',
      testCases,
      content: { kind: 'draft', title: '分享的代码' },
    };
  } catch {
    return null;
  }
}

export function workspaceFromHash(hash: string): Workspace | null {
  const match = hash.match(/^#share=([^&]+)/);
  return match ? decodeWorkspace(match[1]) : null;
}

export function createShareUrl(workspace: Workspace): string {
  const url = new URL(window.location.href);
  url.hash = `share=${encodeWorkspace(workspace)}`;
  return url.toString();
}

import { useEffect, useMemo, useState } from 'react';
import ReactCodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { setDiagnostics, type Diagnostic as CodeMirrorDiagnostic } from '@codemirror/lint';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import type { Diagnostic, EditorSettings, ResolvedTheme } from '../types';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
  theme: ResolvedTheme;
  diagnostics: Diagnostic[];
  jumpTo?: { line: number; column: number; nonce: number };
}

export default function Editor({ value, onChange, settings, theme, diagnostics, jumpTo }: EditorProps) {
  const [view, setView] = useState<EditorView | null>(null);

  const extensions = useMemo(() => {
    const dark = theme === 'dark';
    const editorTheme = EditorView.theme({
      '&': {
        height: '100%',
        backgroundColor: 'transparent',
        color: dark ? '#dce5dc' : '#26332d',
        fontSize: `${settings.fontSize}px`,
      },
      '.cm-content': {
        padding: '22px 0 40px',
        caretColor: dark ? '#dfff78' : '#326b54',
        fontFamily: '"SFMono-Regular", "Cascadia Code", "Liberation Mono", Menlo, monospace',
        lineHeight: '1.75',
      },
      '.cm-cursor, .cm-dropCursor': { borderLeftColor: dark ? '#dfff78' : '#326b54' },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        color: dark ? '#627168' : '#9aa69f',
        border: 'none',
        paddingLeft: '8px',
      },
      '.cm-activeLine': { backgroundColor: dark ? '#ffffff05' : '#173f3506' },
      '.cm-activeLineGutter': { backgroundColor: 'transparent', color: dark ? '#b8c6ba' : '#53675c' },
      '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
        backgroundColor: dark ? '#dfff7828' : '#3f7b6030',
      },
      '.cm-tooltip': {
        backgroundColor: dark ? '#202a23' : '#ffffff',
        border: `1px solid ${dark ? '#39483e' : '#d8ded7'}`,
        borderRadius: '10px',
        color: dark ? '#e5ede5' : '#26332d',
      },
      '.cm-tooltip-lint': { maxWidth: '480px' },
      '.cm-diagnostic': { padding: '8px 10px', whiteSpace: 'pre-wrap', lineHeight: '1.5' },
      '.cm-panels': { backgroundColor: dark ? '#202a23' : '#ffffff', color: dark ? '#e5ede5' : '#26332d' },
      '.cm-placeholder': { color: dark ? '#627168' : '#9aa69f' },
      '.cm-matchingBracket': { backgroundColor: dark ? '#dfff7824' : '#3f7b6024' },
    }, { dark });

    const highlight = HighlightStyle.define([
      { tag: [tags.keyword, tags.controlKeyword, tags.operatorKeyword], color: dark ? '#df9dfb' : '#8751a5' },
      { tag: [tags.string, tags.special(tags.string)], color: dark ? '#b8d77a' : '#53752d' },
      { tag: [tags.number, tags.bool, tags.null], color: dark ? '#efae76' : '#b3602c' },
      { tag: [tags.comment, tags.blockComment], color: dark ? '#6f8275' : '#89958c', fontStyle: 'italic' },
      { tag: [tags.typeName, tags.standard(tags.typeName)], color: dark ? '#7ccbc1' : '#24766b' },
      { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: dark ? '#82b8f5' : '#346fa4' },
      { tag: [tags.definition(tags.variableName)], color: dark ? '#e2e9df' : '#26332d' },
      { tag: [tags.meta, tags.processingInstruction], color: dark ? '#e6c778' : '#9a7025' },
      { tag: [tags.operator], color: dark ? '#b9c6bc' : '#53675c' },
    ]);

    return [
      cpp(),
      EditorState.tabSize.of(settings.tabSize),
      ...(settings.wordWrap ? [EditorView.lineWrapping] : []),
      editorTheme,
      syntaxHighlighting(highlight),
    ];
  }, [settings.fontSize, settings.tabSize, settings.wordWrap, theme]);

  useEffect(() => {
    if (!view) return;
    const mapped = diagnostics.flatMap<CodeMirrorDiagnostic>((diagnostic) => {
      if (diagnostic.line < 1 || diagnostic.line > view.state.doc.lines) return [];
      const line = view.state.doc.line(diagnostic.line);
      const from = Math.min(line.from + Math.max(0, diagnostic.column - 1), line.to);
      return [{
        from,
        to: from < line.to ? from + 1 : from,
        severity: diagnostic.severity,
        message: diagnostic.message + (diagnostic.hint ? `\n${diagnostic.hint}` : ''),
        source: 'C 编译器',
      }];
    });
    view.dispatch(setDiagnostics(view.state, mapped));
  }, [diagnostics, view]);

  useEffect(() => {
    if (!view || !jumpTo || jumpTo.line < 1 || jumpTo.line > view.state.doc.lines) return;
    const line = view.state.doc.line(jumpTo.line);
    const position = Math.min(line.from + Math.max(0, jumpTo.column - 1), line.to);
    view.dispatch({
      selection: { anchor: position },
      effects: EditorView.scrollIntoView(position, { y: 'center' }),
    });
    view.focus();
  }, [jumpTo, view]);

  return (
    <ReactCodeMirror
      value={value}
      onChange={onChange}
      onCreateEditor={setView}
      extensions={extensions}
      theme={theme}
      placeholder="在这里编写 C 代码…"
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: true,
        highlightActiveLine: true,
        foldGutter: true,
        autocompletion: true,
        bracketMatching: true,
        closeBrackets: true,
        indentOnInput: true,
        highlightSelectionMatches: true,
      }}
    />
  );
}

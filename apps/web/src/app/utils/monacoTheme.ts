import type { Monaco } from '@monaco-editor/react';

export const MONACO_DARK = 'codewise-dark';
export const MONACO_LIGHT = 'codewise-light';

/**
 * Monaco's stock `vs-dark` paints a #1e1e1e background, which reads as a grey
 * slab floating on the app's true-black ground. Both themes inherit the built-in
 * token colours and only restage the chrome onto the app's own surfaces.
 */
export const defineMonacoThemes = (monaco: Monaco) => {
  monaco.editor.defineTheme(MONACO_DARK, {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#ededed',
      'editorGutter.background': '#000000',
      'editorLineNumber.foreground': '#4d4d4d',
      'editorLineNumber.activeForeground': '#8f8f8f',
      'editorIndentGuide.background1': '#1f1f1f',
      'editorIndentGuide.activeBackground1': '#2e2e2e',
      'editor.selectionBackground': '#0d1a2d',
      'editor.inactiveSelectionBackground': '#141414',
      'editorWidget.background': '#0a0a0a',
      'editorWidget.border': '#1f1f1f',
      'scrollbarSlider.background': '#2e2e2e80',
      'scrollbarSlider.hoverBackground': '#8f8f8f80',
      'scrollbarSlider.activeBackground': '#8f8f8f',
    },
  });

  monaco.editor.defineTheme(MONACO_LIGHT, {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#0e1219',
      'editorGutter.background': '#ffffff',
      'editorLineNumber.foreground': '#a8b0bd',
      'editorLineNumber.activeForeground': '#666f80',
      'editor.selectionBackground': '#eaf0f8',
    },
  });
};

/**
 * @file enums.ts
 * @description Centralized enums for the application to eliminate magic strings/numbers.
 */

/**
 * Defines the available panes in the right side of the application layout.
 */
export enum PaneType {
  /** The code editor pane powered by Monaco */
  EDITOR = 'EDITOR',
  /** The interactive documentation pane */
  DOCS = 'DOCS',
  /** The standard execution output pane */
  OUTPUT = 'OUTPUT',
  /** The live websocket REPL terminal pane */
  LIVE = 'LIVE',
}

/**
 * Defines the supported languages in the application.
 */
export enum AppLanguage {
  /** English */
  EN = 'en',
  /** Spanish */
  ES = 'es',
}

/**
 * Defines the authentication modes.
 */
export enum AuthMode {
  LOGIN = 'login',
  REGISTER = 'register',
}

/**
 * Defines the application themes.
 */
export enum AppTheme {
  LIGHT = 'light',
  DARK = 'dark',
}

/**
 * Defines keys used in localStorage to avoid magic strings.
 */
export enum LocalStorageKey {
  LANGUAGE = 'mpl_language',
  THEME = 'theme',
}

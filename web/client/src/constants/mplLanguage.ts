export const mplLanguageDef = {
  keywords: [
    'print',
    'display',
    'LOG',
    'LN',
    'SQRT',
    'ROOT',
    'SIN',
    'COS',
    'TAN',
    'CTG',
    'INVERSE',
    'MATRIXLU',
    'TRIDIAGONAL',
    'REALEIGENVALUES',
    'DETERMINANT',
    'BISECTIONROOT',
    'INTEGRAL',
    'ODEFIRST',
    'INTERPOLATE',
    'PI',
    'EULER',
    'exit',
  ],
  operators: ['+', '-', '*', '/', '^', '=', '==', '<', '>', '<=', '>=', '!='],
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  tokenizer: {
    root: [
      [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
      { include: '@whitespace' },
      [/[{}()\[\]]/, '@brackets'],
      [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/\d+/, 'number'],
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
    ],
    string: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],
    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],
    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      ['\\*/', 'comment', '@pop'],
      [/[\/*]/, 'comment'],
    ],
  },
};

export const mplLanguageConfig = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
  ],
};

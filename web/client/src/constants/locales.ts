export const locales = {
  en: {
    app: {
      title: 'MPL ULA',
      loadSample: '-- Load a Sample --',
      runCode: 'Run Code',
      download: 'Download',
      editor: 'Editor',
      documentation: 'Documentation',
      output: 'Output',
      liveRepl: 'Live REPL',
      outputPlaceholder: 'Output will appear here...',
      backendError: 'Failed to connect to the MPL engine. Is the backend running?',
    },
    docs: {
      title: '📖 MPL ULA - Reference Guide',
      intro:
        'Welcome to the interactive environment. The MPL language is strictly designed for mathematical and numerical operations. (Note: Strings/text do not exist!).',
      varType: '1. Variables and Basic Types',
      varDesc: 'Everything in MPL revolves around numbers, vectors, and matrices.',
      scalar: 'Scalar Number',
      vector: 'Vector (Components separated by commas)',
      matrix: 'Matrix (Vectors joined by braces or declared explicitly)',
      basicOps: '2. Basic Operations and Trigonometry',
      basicOpsDesc:
        'You can use standard operators +, -, *, /, ^ and built-in trigonometric functions.',
      advancedMath: '3. Numerical Methods and Advanced Math',
      advancedMathDesc: 'Click on each method to see its operation and mathematical background.',
      tridiagonal: 'TRIDIAGONAL(mat) - Matrix Transformation',
      tridiagonalDesc:
        'Background: Uses Householder reflections to reduce a symmetric matrix to a tridiagonal form. It is a crucial intermediate step for computing eigenvalues efficiently.',
      matrixLu: 'MATRIXLU(mat) - LU Factorization',
      matrixLuDesc:
        'Background: Decomposes a square matrix A into the product of a lower triangular matrix (L) and an upper triangular matrix (U). Useful for solving linear systems of equations Ax = b.',
      realEigen: 'REALEIGENVALUES(mat) - Eigenvalues',
      realEigenDesc:
        'Background: Computes the real eigenvalues of a matrix, typically using the QR algorithm. Eigenvalues are scalars λ such that Ax = λx.',
      bisection: 'BISECTIONROOT(expr, a, b) - Root Finding',
      bisectionDesc:
        'Background: The bisection method finds a root of a mathematical equation f(x) = 0 by repeatedly halving the interval [a, b], guaranteeing convergence if f(a) and f(b) have opposite signs.',
      bisectionExample: 'Find the root of (letter)^2 - 4 in the interval [0, 5]',
      integral: 'INTEGRAL(expr, a, b) - Numerical Integration',
      integralDesc:
        "Background: Computes the definite integral of a function over the interval [a, b] using numerical methods (like Simpson's or Trapezoidal rule) to approximate the area under the curve.",
      integralExample: 'Integrate (letter)^2 from 0 to 10',
    },
    terminal: {
      connected: 'Connected to MPL Live Interpreter.',
      disconnected: 'Disconnected from server.',
      placeholder: 'Type MPL code and press Enter...',
    },
  },
  es: {
    app: {
      title: 'MPL ULA',
      loadSample: '-- Cargar Ejemplo --',
      runCode: 'Ejecutar Código',
      download: 'Descargar',
      editor: 'Editor',
      documentation: 'Documentación',
      output: 'Salida',
      liveRepl: 'Terminal en Vivo',
      outputPlaceholder: 'La salida aparecerá aquí...',
      backendError: 'Fallo al conectar con el motor MPL. ¿Está corriendo el backend?',
    },
    docs: {
      title: '📖 MPL ULA - Guía de Referencia',
      intro:
        'Bienvenido al entorno interactivo. El lenguaje MPL está diseñado estrictamente para operaciones matemáticas y numéricas. (Nota: ¡No existen los strings/textos!).',
      varType: '1. Variables y Tipos Básicos',
      varDesc: 'Todo en MPL gira en torno a números, vectores y matrices.',
      scalar: 'Número Escalar',
      vector: 'Vector (Componentes separados por comas)',
      matrix: 'Matriz (Vectores unidos por llaves o declarada explícitamente)',
      basicOps: '2. Operaciones Básicas y Trigonometría',
      basicOpsDesc:
        'Puedes usar los operadores estándar +, -, *, /, ^ y las funciones trigonométricas integradas.',
      advancedMath: '3. Métodos Numéricos y Matemáticas Avanzadas',
      advancedMathDesc:
        'Haz clic en cada método para ver su funcionamiento y trasfondo matemático.',
      tridiagonal: 'TRIDIAGONAL(mat) - Transformación de Matriz',
      tridiagonalDesc:
        'Trasfondo: Utiliza reflexiones de Householder para reducir una matriz simétrica a una forma tridiagonal. Es un paso intermedio crucial para calcular valores propios de forma eficiente.',
      matrixLu: 'MATRIXLU(mat) - Factorización LU',
      matrixLuDesc:
        'Trasfondo: Descompone una matriz cuadrada A en el producto de una matriz triangular inferior (L) y una triangular superior (U). Útil para resolver sistemas de ecuaciones lineales de la forma Ax = b.',
      realEigen: 'REALEIGENVALUES(mat) - Valores Propios',
      realEigenDesc:
        'Trasfondo: Calcula los valores propios reales de una matriz, típicamente utilizando el algoritmo QR. Los valores propios son escalares λ tales que Ax = λx.',
      bisection: 'BISECTIONROOT(expr, a, b) - Búsqueda de Raíces',
      bisectionDesc:
        'Trasfondo: El método de la bisección encuentra una raíz de una ecuación matemática f(x) = 0 dividiendo el intervalo [a, b] por la mitad de forma iterativa, garantizando convergencia si f(a) y f(b) tienen signos opuestos.',
      bisectionExample: 'Encontrar la raíz de (letter)^2 - 4 en el intervalo [0, 5]',
      integral: 'INTEGRAL(expr, a, b) - Integración Numérica',
      integralDesc:
        'Trasfondo: Calcula la integral definida de una función en el intervalo [a, b] utilizando métodos numéricos (como la Regla de Simpson o Trapezoidal) para aproximar el área bajo la curva.',
      integralExample: 'Integrar (letter)^2 desde 0 hasta 10',
    },
    terminal: {
      connected: 'Conectado al Intérprete MPL en Vivo.',
      disconnected: 'Desconectado del servidor.',
      placeholder: 'Escribe código MPL y presiona Enter...',
    },
  },
};

import React from 'react';
import { locales } from './locales';

const Documentation = ({ lang }) => {
    const t = locales[lang].docs;

    return (
        <div className="documentation">
            <h2>{t.title}</h2>
            <p>{t.intro}</p>

            <section>
                <h3>{t.varType}</h3>
                <p>{t.varDesc}</p>
                <div className="code-block">
                    <code>
                        <span style={{color: '#94a3b8'}}>// {t.scalar}</span><br/>
                        num = 5.5;<br/><br/>
                        <span style={{color: '#94a3b8'}}>// {t.vector}</span><br/>
                        vec = [1, 2, 3];<br/><br/>
                        <span style={{color: '#94a3b8'}}>// {t.matrix}</span><br/>
                        mat = [1, 2, 3][4, 5, 6][7, 8, 9];<br/>
                        mat2 = &#123;vec, vec&#125;;
                    </code>
                </div>
            </section>

            <section>
                <h3>{t.basicOps}</h3>
                <p>{t.basicOpsDesc}</p>
                <div className="code-block">
                    <code>
                        print(SIN(PI));<br/>
                        display(COS(0));<br/>
                        resultado = TAN(PI/4) + SQRT(16);
                    </code>
                </div>
            </section>

            <section>
                <h3>{t.advancedMath}</h3>
                <p>{t.advancedMathDesc}</p>

                <details className="doc-dropdown">
                    <summary><strong>TRIDIAGONAL(mat)</strong></summary>
                    <div className="dropdown-content">
                        <p>{t.tridiagonalDesc}</p>
                        <div className="code-block">
                            <code>
                                A = [2, 1, -3][-1, 3, 2][3, 1, -3];<br/>
                                tri = TRIDIAGONAL(A);<br/>
                                display(tri);
                            </code>
                        </div>
                    </div>
                </details>

                <details className="doc-dropdown">
                    <summary><strong>MATRIXLU(mat)</strong></summary>
                    <div className="dropdown-content">
                        <p>{t.matrixLuDesc}</p>
                        <div className="code-block">
                            <code>
                                M = [1, 2, 3][4, 5, 6][7, 8, 9];<br/>
                                lu = MATRIXLU(M);<br/>
                                display(lu);
                            </code>
                        </div>
                    </div>
                </details>

                <details className="doc-dropdown">
                    <summary><strong>REALEIGENVALUES(mat)</strong></summary>
                    <div className="dropdown-content">
                        <p>{t.realEigenDesc}</p>
                        <div className="code-block">
                            <code>
                                B = [4, 1][1, 3];<br/>
                                eigen = REALEIGENVALUES(B);<br/>
                                display(eigen);
                            </code>
                        </div>
                    </div>
                </details>

                <details className="doc-dropdown">
                    <summary><strong>BISECTIONROOT(expr, a, b)</strong></summary>
                    <div className="dropdown-content">
                        <p>{t.bisectionDesc}</p>
                        <div className="code-block">
                            <code>
                                <span style={{color: '#94a3b8'}}>// {t.bisectionExample}</span><br/>
                                expr = (letter)^2 - 4;<br/>
                                root = BISECTIONROOT(expr, 0, 5);<br/>
                                display(root);
                            </code>
                        </div>
                    </div>
                </details>

                <details className="doc-dropdown">
                    <summary><strong>INTEGRAL(expr, a, b)</strong></summary>
                    <div className="dropdown-content">
                        <p>{t.integralDesc}</p>
                        <div className="code-block">
                            <code>
                                <span style={{color: '#94a3b8'}}>// {t.integralExample}</span><br/>
                                area = INTEGRAL((letter)^2, 0, 10);<br/>
                                display(area);
                            </code>
                        </div>
                    </div>
                </details>

            </section>
        </div>
    );
};

export default Documentation;

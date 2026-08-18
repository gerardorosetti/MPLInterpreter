/**
 * @file Documentation.tsx
 * @description Documentation component displaying the MPL reference guide.
 * Uses Framer Motion for smooth accordion-style dropdowns.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Code, Hash, Calculator, FunctionSquare, BookOpen } from 'lucide-react';

/**
 * Interface for documentation items.
 */
interface DocItem {
    id: string;
    title: string;
    desc: string;
    example?: string;
    icon: React.ReactNode;
}

/**
 * Documentation Component
 */
const Documentation: React.FC = () => {
    const { t } = useTranslation();
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (id: string) => {
        setOpenSection(openSection === id ? null : id);
    };

    const advancedMathItems: DocItem[] = [
        {
            id: 'tridiagonal',
            title: t('docs.tridiagonal'),
            desc: t('docs.tridiagonalDesc'),
            icon: <Code className="w-4 h-4 text-purple-500" />
        },
        {
            id: 'matrixLu',
            title: t('docs.matrixLu'),
            desc: t('docs.matrixLuDesc'),
            icon: <Code className="w-4 h-4 text-blue-500" />
        },
        {
            id: 'realEigen',
            title: t('docs.realEigen'),
            desc: t('docs.realEigenDesc'),
            icon: <Hash className="w-4 h-4 text-green-500" />
        },
        {
            id: 'bisection',
            title: t('docs.bisection'),
            desc: t('docs.bisectionDesc'),
            example: t('docs.bisectionExample'),
            icon: <Calculator className="w-4 h-4 text-orange-500" />
        },
        {
            id: 'integral',
            title: t('docs.integral'),
            desc: t('docs.integralDesc'),
            example: t('docs.integralExample'),
            icon: <FunctionSquare className="w-4 h-4 text-pink-500" />
        }
    ];

    return (
        <div className="space-y-6 text-muted-foreground pb-10">
            <div className="bg-muted/50 border border-border p-4 text-foreground rounded-md mb-6">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> {t('docs.title')}
                </h3>
                {t('docs.intro')}
            </div>

            <section className="space-y-3">
                <h3 className="text-foreground font-semibold flex items-center gap-2">
                    <Hash className="w-4 h-4 text-accent" />
                    {t('docs.varType')}
                </h3>
                <p className="text-sm">{t('docs.varDesc')}</p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li><strong className="text-foreground">number:</strong> {t('docs.scalar')}</li>
                    <li><strong className="text-foreground">vector:</strong> {t('docs.vector')}</li>
                    <li><strong className="text-foreground">matrix:</strong> {t('docs.matrix')}</li>
                </ul>
            </section>

            <section className="space-y-3">
                <h3 className="text-foreground font-semibold flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-accent" />
                    {t('docs.basicOps')}
                </h3>
                <p className="text-sm">{t('docs.basicOpsDesc')}</p>
            </section>

            <section className="space-y-4">
                <h3 className="text-foreground font-semibold flex items-center gap-2">
                    <FunctionSquare className="w-4 h-4 text-accent" />
                    {t('docs.advancedMath')}
                </h3>
                <p className="text-sm mb-4">{t('docs.advancedMathDesc')}</p>
                
                <div className="space-y-2">
                    {advancedMathItems.map((item) => (
                        <div key={item.id} className="border border-border rounded-lg overflow-hidden bg-card/50 shadow-sm transition-all hover:border-primary/50">
                            <button
                                onClick={() => toggleSection(item.id)}
                                className="w-full flex items-center justify-between p-3 text-left focus:outline-none bg-muted/20 hover:bg-muted/40 transition-colors"
                            >
                                <div className="flex items-center gap-3 font-medium text-foreground text-sm">
                                    {item.icon}
                                    {item.title}
                                </div>
                                <motion.div animate={{ rotate: openSection === item.id ? 180 : 0 }}>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </motion.div>
                            </button>
                            
                            <AnimatePresence>
                                {openSection === item.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                    >
                                        <div className="p-4 bg-muted/10 border-t border-border text-sm space-y-3">
                                            <p className="leading-relaxed">{item.desc}</p>
                                            {item.example && (
                                                <div className="bg-background border border-border p-3 rounded-md font-mono text-xs text-primary shadow-inner">
                                                    // {item.example}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Documentation;

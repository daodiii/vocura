'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Brødsmuler" className="flex items-center gap-1 text-sm">
            <ol className="flex items-center gap-1 list-none m-0 p-0">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={index} className="flex items-center gap-1">
                            {index > 0 && (
                                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                            )}
                            {isLast || !item.href ? (
                                <span className="text-[var(--text-primary)] font-medium truncate max-w-[200px]">
                                    {index === 0 && <Home className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />}
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 truncate max-w-[200px]"
                                >
                                    {index === 0 && <Home className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />}
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

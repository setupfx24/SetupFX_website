'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { FAQS } from './faqs-data';

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="liquid-glass rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-foreground/5 transition-colors"
      >
        <span className="font-semibold text-foreground">{q}</span>
        <ChevronDown
          className={`size-5 text-primary shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-foreground/75 leading-relaxed text-sm">{a}</div>
      )}
    </div>
  );
}

export default function FaqsPage() {
  return (
    <div className="setupfx-home min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4">
            Resources
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-5">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Answers to common questions about our services, process, and pricing.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} index={i} />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-foreground/65 mb-4">Still have questions?</p>
          <Link
            href="/company/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
          >
            Contact Our Team
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

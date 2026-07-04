import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

export const metadata = { title: 'Blog — SetupFX' };

const POSTS = [
  {
    title: 'How Custom Software Can Transform Your Business',
    date: 'Feb 5, 2026',
    category: 'Software Development',
    excerpt: 'Discover how tailored software solutions can streamline operations, reduce costs, and drive growth for businesses of all sizes.',
  },
  {
    title: 'SEO Trends to Watch in 2026',
    date: 'Jan 28, 2026',
    category: 'Digital Marketing',
    excerpt: 'Stay ahead of the curve with the latest SEO strategies and algorithm updates that will shape search rankings this year.',
  },
  {
    title: 'Why Every Business Needs a CRM System',
    date: 'Jan 20, 2026',
    category: 'Business Solutions',
    excerpt: 'Learn how a custom CRM can help you manage customer relationships, automate workflows, and boost sales efficiency.',
  },
  {
    title: 'Mobile App Development: Native vs Cross-Platform',
    date: 'Jan 15, 2026',
    category: 'Mobile Development',
    excerpt: 'A comprehensive comparison to help you choose the right approach for your next mobile application project.',
  },
  {
    title: 'The Power of Data-Driven Marketing',
    date: 'Jan 8, 2026',
    category: 'Digital Marketing',
    excerpt: 'How leveraging data analytics can help you make smarter marketing decisions and achieve better ROI.',
  },
  {
    title: 'Building Scalable Web Applications with Next.js',
    date: 'Jan 2, 2026',
    category: 'Web Development',
    excerpt: 'Best practices for building high-performance, scalable web applications using modern frameworks.',
  },
];

export default function BlogPage() {
  return (
    <div className="setupfx-home min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4">
            Resources
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5">
            Blog
          </h1>
          <p className="text-base sm:text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            Insights, tips &amp; industry trends. Stay updated with the latest in software development and digital marketing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.map((p) => (
            <article
              key={p.title}
              className="liquid-glass rounded-3xl p-7 hover:border-primary/35 transition-colors flex flex-col"
            >
              <span className="inline-block self-start rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary mb-4">
                {p.category}
              </span>
              <h2 className="font-display text-xl font-bold text-foreground mb-3 leading-tight">
                {p.title}
              </h2>
              <p className="text-sm text-foreground/65 leading-relaxed mb-5 flex-1">
                {p.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-foreground/55">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {p.date}
                </span>
                <Link
                  href="/company/contact"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                >
                  Read more <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

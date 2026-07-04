/**
 * FAQ Q&A pairs — single source of truth for both the client-rendered
 * accordion page AND the server-rendered FAQPage JSON-LD in layout.tsx.
 */
export const FAQS = [
  {
    q: 'What services does SetupFX offer?',
    a: 'We offer custom software development, web & mobile app development, CRM & business systems, UI/UX design, and comprehensive digital marketing services including SEO, paid advertising, social media marketing, and content marketing.',
  },
  {
    q: 'How long does a typical project take?',
    a: 'Project timelines vary based on complexity. A simple website takes 2-4 weeks, a web application 6-12 weeks, and a mobile app 8-16 weeks. We provide detailed timelines during the discovery phase.',
  },
  {
    q: 'What is your pricing model?',
    a: 'We offer flexible pricing models including fixed-price projects, hourly rates, and dedicated team arrangements. We provide transparent quotes after understanding your requirements.',
  },
  {
    q: 'Do you provide ongoing support after launch?',
    a: 'Yes, we offer ongoing maintenance and support packages to ensure your application stays updated, secure, and performing optimally. We also provide 24/7 emergency support for critical issues.',
  },
  {
    q: 'What technologies do you work with?',
    a: 'We work with modern technologies including React, Next.js, Node.js, Python, React Native, Flutter, PostgreSQL, MongoDB, AWS, Azure, and more. We choose the best stack for each project.',
  },
  {
    q: 'Can you work with our existing team?',
    a: 'Absolutely. We offer team augmentation services where our developers integrate seamlessly with your existing team, following your processes and workflows.',
  },
  {
    q: 'Do you sign NDAs?',
    a: 'Yes, we take confidentiality seriously. We are happy to sign NDAs before discussing any project details to protect your intellectual property.',
  },
  {
    q: 'How do you handle project communication?',
    a: 'We use tools like Slack, Jira, and regular video calls to maintain transparent communication. You will have a dedicated project manager as your single point of contact.',
  },
] as const;

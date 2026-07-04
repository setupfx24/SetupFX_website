import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'UI / UX Design — SetupFX' };

export default function UiUxDesignPage() {
  return (
    <MarketingTemplate
      eyebrow="Services"
      title="UI / UX Design"
      subtitle="User-centered design that converts & delights. We create intuitive, beautiful interfaces that drive engagement and business results."
      leftHeading="Design That Converts"
      leftBody="Great design is more than aesthetics — it is about creating experiences that guide users toward their goals. Our design team combines creativity with data-driven insights to deliver interfaces that are both beautiful and functional."
      features={[
        'User research & persona development',
        'Wireframing & prototyping',
        'Visual design & branding',
        'Responsive & accessible design',
        'Design systems & component libraries',
        'Usability testing & iteration',
      ]}
      rightHeading="Our Design Process"
      rightItems={[
        { title: 'Discovery', description: 'Understand users, goals, and business requirements.' },
        { title: 'Wireframes', description: 'Low-fidelity layouts to map user flows.' },
        { title: 'Visual Design', description: 'High-fidelity mockups with brand consistency.' },
        { title: 'Prototyping', description: 'Interactive prototypes for testing & validation.' },
      ]}
      ctaPrimary={{ label: 'Get a Quote', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Case Studies', href: '/resources/case-studies' }}
    />
  );
}

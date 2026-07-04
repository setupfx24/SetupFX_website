import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'Mobile App Development — SetupFX' };

export default function MobileAppDevelopmentPage() {
  return (
    <MarketingTemplate
      eyebrow="Services"
      title="Mobile App Development"
      subtitle="Native & cross-platform mobile solutions. We build beautiful, high-performance mobile apps that users love."
      leftHeading="Mobile-First Solutions"
      leftBody="We create mobile applications that deliver seamless experiences across all devices. Whether you need a native iOS app, an Android app, or a cross-platform solution, our team has the expertise to bring your vision to life."
      features={[
        'Native iOS & Android development',
        'Cross-platform with React Native & Flutter',
        'UI/UX optimized for mobile experiences',
        'Push notifications & real-time features',
        'App Store & Play Store deployment',
        'Ongoing updates & maintenance',
      ]}
      rightHeading="Platforms We Support"
      rightItems={[
        { title: 'iOS (Swift)', description: 'Native iPhone & iPad applications.' },
        { title: 'Android (Kotlin)', description: 'Native Android phone & tablet apps.' },
        { title: 'React Native', description: 'Cross-platform apps from a single codebase.' },
        { title: 'Flutter', description: 'Beautiful, natively compiled applications.' },
      ]}
      ctaPrimary={{ label: 'Get a Quote', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Case Studies', href: '/resources/case-studies' }}
    />
  );
}

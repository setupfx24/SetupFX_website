import type { ReactNode } from 'react'

export const metadata = {
  title: 'Shared Trade — SetupFX',
  description: 'A trader shared this position with you.',
  openGraph: {
    title: 'Shared Trade on SetupFX',
    description: 'View a position card a SetupFX trader shared.',
    type: 'website',
  },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

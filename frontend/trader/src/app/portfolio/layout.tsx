import type { ReactNode } from 'react'

export const metadata = {
  title: 'Portfolio — SetupFX',
  description: 'Open positions, P&L breakdown, and historical performance.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

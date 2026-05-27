import type { ReactNode } from 'react'

export const metadata = {
  title: 'Insurance Platform — SwissCresta',
  description: 'Position-level insurance integrated into every trading account.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

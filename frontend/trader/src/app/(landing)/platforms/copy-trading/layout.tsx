import type { ReactNode } from 'react'

export const metadata = {
  title: 'Copy Trading — SwissCresta',
  description: 'Follow proven traders and auto-replicate their positions in real-time.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

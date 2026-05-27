import type { ReactNode } from 'react'

export const metadata = {
  title: 'Academy Quiz — SwissCresta',
  description: 'Phase-end knowledge check.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

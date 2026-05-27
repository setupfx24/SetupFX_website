import type { ReactNode } from 'react'

export const metadata = {
  title: 'Academy Phase — SwissCresta',
  description: 'Trading academy phase: lessons, exercises, and progression tracking.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

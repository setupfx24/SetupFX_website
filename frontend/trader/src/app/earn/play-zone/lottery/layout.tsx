import type { ReactNode } from 'react'

export const metadata = {
  title: 'Lottery — SwissCresta',
  description: 'Reward-point lottery draws.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

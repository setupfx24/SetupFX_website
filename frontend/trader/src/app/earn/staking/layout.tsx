import type { ReactNode } from 'react'

export const metadata = {
  title: 'Staking — SwissCresta',
  description: 'Stake funds and earn passive yield.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

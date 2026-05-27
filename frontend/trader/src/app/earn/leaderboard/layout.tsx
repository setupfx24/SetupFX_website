import type { ReactNode } from 'react'

export const metadata = {
  title: 'Leaderboard — SwissCresta',
  description: 'Top traders this month, ranked by realized P&L and ROI.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

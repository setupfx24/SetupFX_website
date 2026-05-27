import type { ReactNode } from 'react'

export const metadata = {
  title: 'Play Zone — SwissCresta',
  description: 'Earn rewards through spin, bidding, lottery, and daily tasks.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

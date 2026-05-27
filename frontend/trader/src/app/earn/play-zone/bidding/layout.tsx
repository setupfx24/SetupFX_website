import type { ReactNode } from 'react'

export const metadata = {
  title: 'Bidding — SwissCresta',
  description: 'Bid your reward points on featured items.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

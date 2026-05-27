import type { ReactNode } from 'react'

export const metadata = {
  title: 'Trade Insurance — SwissCresta',
  description: 'Protect open positions with built-in trade insurance coverage.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

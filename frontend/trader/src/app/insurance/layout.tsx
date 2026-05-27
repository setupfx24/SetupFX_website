import type { ReactNode } from 'react'

export const metadata = {
  title: 'Insurance — SwissCresta',
  description: 'Active insurance coverage on your open positions.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

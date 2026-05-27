import type { ReactNode } from 'react'

export const metadata = {
  title: 'Academy Module — SwissCresta',
  description: 'Academy lesson module.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

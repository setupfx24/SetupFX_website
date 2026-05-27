import type { ReactNode } from 'react'

export const metadata = {
  title: 'Academy — SwissCresta',
  description: 'Structured trading education from fundamentals to advanced strategy.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

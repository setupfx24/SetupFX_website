import type { ReactNode } from 'react'

export const metadata = {
  title: 'Spin Wheel — SwissCresta',
  description: 'Daily spin for bonus rewards.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

import type { ReactNode } from 'react'

export const metadata = {
  title: 'Tasks — SwissCresta',
  description: 'Daily and weekly tasks that earn reward points.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

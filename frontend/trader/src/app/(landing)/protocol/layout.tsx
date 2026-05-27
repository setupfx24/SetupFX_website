import type { ReactNode } from 'react'

export const metadata = {
  title: 'SwissCresta Protocol — Trading Infrastructure',
  description: 'The execution, settlement, and risk infrastructure behind SwissCresta.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

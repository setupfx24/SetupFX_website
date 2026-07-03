import type { ReactNode } from 'react'

export const metadata = {
  title: 'SetupFX Protocol — Trading Infrastructure',
  description: 'The execution, settlement, and risk infrastructure behind SetupFX.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

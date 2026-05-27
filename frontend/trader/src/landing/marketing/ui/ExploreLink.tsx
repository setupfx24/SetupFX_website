'use client'

import { ArrowRight } from 'lucide-react'
import { type ReactNode } from 'react'

interface ExploreLinkProps {
  href?: string
  children?: ReactNode
  className?: string
}

export default function ExploreLink({
  href = '#',
  children = 'Explore',
  className = '',
}: ExploreLinkProps) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors ${className}`}
    >
      <span>{children}</span>
      <ArrowRight
        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
        strokeWidth={2.5}
      />
    </a>
  )
}

export interface FooterColumn {
  heading: string
  links: string[]
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  { heading: 'Become a client', links: ['Open your account', 'Refer a friend (Forex)'] },
  { heading: 'Become a partner', links: ['Forex Partnerships'] },
  { heading: 'Help & Support', links: ['Help center', 'Customer Care', 'Legal info & documents'] },
]

interface FooterLinksProps {
  columns?: FooterColumn[]
  align?: 'center' | 'left'
}

export default function FooterLinks({ columns, align = 'center' }: FooterLinksProps) {
  const cols = columns ?? DEFAULT_COLUMNS
  const isCentered = align === 'center'
  const count = Math.min(cols.length, 4)

  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 pb-16 md:pb-24">
        <div
          className="grid gap-10"
          style={{
            gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
            textAlign: isCentered ? 'center' : 'left',
            maxWidth: isCentered ? '64rem' : undefined,
            margin: isCentered ? '0 auto' : undefined,
          }}
        >
          {cols.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#E94E1B]">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-[#E94E1B] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

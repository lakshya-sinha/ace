import { Link, useRouterState } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// Optional: nicer names for specific segments. Anything not listed is
// auto-formatted ("my-projects" -> "My projects").
const LABELS: Record<string, string> = {
  // about: 'About me',
  // blog: 'Writing',
}

const prettify = (segment: string) => {
  const decoded = decodeURIComponent(segment)
  if (LABELS[decoded]) return LABELS[decoded]
  const spaced = decoded.replace(/[-_]+/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export function LinkTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // "/blog/my-post" -> ["blog", "my-post"]
  const segments = pathname.split('/').filter(Boolean)

  // Build cumulative paths: ["/blog", "/blog/my-post"]
  const crumbs = segments.map((segment, i) => ({
    label: prettify(segment),
    to: '/' + segments.slice(0, i + 1).join('/'),
  }))

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur">
      <Breadcrumb className="mx-auto max-w-4xl overflow-x-auto px-4 py-3">
        <BreadcrumbList className="flex-nowrap whitespace-nowrap">
          {/* Home is always the first crumb */}
          <BreadcrumbItem>
            {crumbs.length === 0 ? (
              <BreadcrumbPage>Home</BreadcrumbPage>
            ) : (
              <BreadcrumbLink >
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>

          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1
            return (
              <div key={crumb.to} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    // Current page: plain text, not clickable
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    // Earlier pages: click to go back to that level
                    <BreadcrumbLink >
                      <Link to={crumb.to}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

export default LinkTabs
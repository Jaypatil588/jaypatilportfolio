import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { neon } from '@neondatabase/serverless'
import { AdminLinkTools } from '@/components/admin-link-tools'
import { AdminResetVisits } from '@/components/admin-reset-visits'

function decodeLocationValue(value: string | null | undefined) {
  if (!value) return ''
  try {
    return decodeURIComponent(value.replace(/\+/g, ' ')).trim()
  } catch {
    return value.trim()
  }
}

function parseJsonArray(value: unknown) {
  if (!value) return []
  if (Array.isArray(value)) return value.map(String)
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export default async function AdminRoute() {
  const cookieStore = await cookies()
  const isAuthed = cookieStore.get('portfolio_admin_auth')?.value === '1'

  if (!isAuthed) {
    redirect('/auth')
  }

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return (
      <main className="min-h-screen bg-background text-foreground px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-semibold">Admin Panel</h1>
          <p className="mt-3 text-red-400">`DATABASE_URL` is not configured.</p>
        </div>
      </main>
    )
  }

  const sql = neon(dbUrl)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jaypatilportfolio.vercel.app'

  await sql`ALTER TABLE visits ADD COLUMN IF NOT EXISTS region VARCHAR(100)`
  await sql`ALTER TABLE visits ADD COLUMN IF NOT EXISTS city VARCHAR(100)`
  await sql`ALTER TABLE visits ADD COLUMN IF NOT EXISTS time_on_page_seconds INTEGER DEFAULT 0`

  const [
    usersCount,
    projectsCount,
    distributionsCount,
    chatCount,
    visitsCount,
    uniqueVisitors,
    recentProjects,
    recentDistributions,
    recentResponses,
    recentVisits,
    refTagBreakdown,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM users`,
    sql`SELECT COUNT(*)::int AS count FROM projects_data`,
    sql`SELECT COUNT(*)::int AS count FROM distributions_data`,
    sql`SELECT COUNT(*)::int AS count FROM chat_logs`,
    sql`SELECT COUNT(*)::int AS count FROM visits`,
    sql`SELECT COUNT(DISTINCT ip_hash)::int AS count FROM visits`,
    sql`
      SELECT
        id,
        company,
        COALESCE((data->>'atsScore')::int, 0) AS ats_score,
        data->>'name' AS name,
        data->>'type' AS type,
        COALESCE((data->>'techCount')::int, 0) AS tech_count,
        data->'techStack' AS tech_stack,
        data->'concepts' AS concepts,
        data->>'whatItSolves' AS what_it_solves,
        data->>'description' AS description
      FROM projects_data
      ORDER BY COALESCE((data->>'atsScore')::int, 0) DESC, id DESC
      LIMIT 40
    `,
    sql`
      SELECT id, user_id, dist_type, company, created_at,
             COALESCE(data->>'keyword', data->>'concept', data->>'company') AS label,
             COALESCE((data->>'count')::int, 0) AS count
      FROM distributions_data
      ORDER BY id DESC
      LIMIT 12
    `,
    sql`
      SELECT id, timestamp, message, response
      FROM chat_logs
      ORDER BY timestamp DESC
      LIMIT 20
    `,
    sql`
      SELECT id, timestamp, ref_tag, device_type, referer, page_url, country, region, city, COALESCE(time_on_page_seconds, 0) AS time_on_page_seconds
      FROM visits
      ORDER BY timestamp DESC
      LIMIT 40
    `,
    sql`
      SELECT COALESCE(ref_tag, 'direct') AS ref_tag, COUNT(*)::int AS count
      FROM visits
      GROUP BY COALESCE(ref_tag, 'direct')
      ORDER BY count DESC
    `,
  ])

  const kpis = [
    { label: 'Users', value: usersCount[0]?.count ?? 0 },
    { label: 'Projects Rows', value: projectsCount[0]?.count ?? 0 },
    { label: 'Distributions Rows', value: distributionsCount[0]?.count ?? 0 },
    { label: 'RAG Chats', value: chatCount[0]?.count ?? 0 },
    { label: 'Visits', value: visitsCount[0]?.count ?? 0 },
    { label: 'Unique Visitors', value: uniqueVisitors[0]?.count ?? 0 },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <h1 className="text-3xl md:text-4xl font-semibold">Admin Panel</h1>
        <p className="mt-3 text-muted-foreground">
          Internal view of database tables, chatbot responses, and tracking metrics.
        </p>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi) => (
            <article key={kpi.label} className="rounded-xl border border-primary/20 bg-card/60 p-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 text-2xl font-semibold">{kpi.value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-primary/20 bg-card/60 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Tracking Controls</h2>
            <p className="text-sm text-muted-foreground">Reset visits and unique-visitor counts.</p>
          </div>
          <AdminResetVisits />
        </section>

        <AdminLinkTools
          links={[
            { label: 'Post', url: `${baseUrl}/?ref=post` },
            { label: 'Featured', url: `${baseUrl}/?ref=feat` },
          ]}
        />

        <section className="rounded-2xl border border-primary/20 bg-card/60 p-4">
          <h2 className="text-xl font-semibold mb-3">Projects Table Data</h2>
          <div className="max-h-[420px] overflow-y-auto overflow-x-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">ATS Score</th>
                  <th className="py-2 pr-3">Project / Role</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3"># Tech</th>
                  <th className="py-2 pr-3">Tech Stack</th>
                  <th className="py-2 pr-3">Concepts</th>
                  <th className="py-2 pr-3">What It Solves (AI)</th>
                  <th className="py-2 pr-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((row) => {
                  const techStack = parseJsonArray(row.tech_stack)
                  const concepts = parseJsonArray(row.concepts)
                  return (
                  <tr key={row.id} className="border-t border-white/5">
                    <td className="py-2 pr-3 font-semibold">{row.ats_score ?? 0}</td>
                    <td className="py-2 pr-3 font-medium">{row.name || '-'}</td>
                    <td className="py-2 pr-3">{row.type || '-'}</td>
                    <td className="py-2 pr-3">{row.tech_count ?? 0}</td>
                    <td className="py-2 pr-3">{techStack.length ? techStack.join(', ') : '-'}</td>
                    <td className="py-2 pr-3">{concepts.length ? concepts.join(', ') : '-'}</td>
                    <td className="py-2 pr-3">{row.what_it_solves || '-'}</td>
                    <td className="py-2 pr-3">{row.description || '-'}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-primary/20 bg-card/60 p-4">
          <h2 className="text-xl font-semibold mb-3">Distributions Table Data</h2>
          <div className="max-h-[420px] overflow-y-auto overflow-x-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Label</th>
                  <th className="py-2 pr-3">Count</th>
                  <th className="py-2 pr-3">Company</th>
                </tr>
              </thead>
              <tbody>
                {recentDistributions.map((row) => (
                  <tr key={row.id} className="border-t border-white/5">
                    <td className="py-2 pr-3">{row.id}</td>
                    <td className="py-2 pr-3">{row.dist_type || '-'}</td>
                    <td className="py-2 pr-3">{row.label || '-'}</td>
                    <td className="py-2 pr-3">{row.count ?? 0}</td>
                    <td className="py-2 pr-3">{row.company || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-primary/20 bg-card/60 p-4">
          <h2 className="text-xl font-semibold mb-3">Responses Table</h2>
          <div className="max-h-[420px] overflow-y-auto overflow-x-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Prompt</th>
                  <th className="py-2 pr-3">Response</th>
                </tr>
              </thead>
              <tbody>
                {recentResponses.map((row) => (
                  <tr key={row.id} className="border-t border-white/5 align-top">
                    <td className="py-2 pr-3 whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</td>
                    <td className="py-2 pr-3">{row.message || '-'}</td>
                    <td className="py-2 pr-3">{row.response || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-primary/20 bg-card/60 p-4">
          <h2 className="text-xl font-semibold mb-3">Tracking Counter</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            {refTagBreakdown.map((row) => (
              <span key={row.ref_tag} className="rounded-full border border-primary/30 px-3 py-1 text-xs">
                {row.ref_tag}: {row.count}
              </span>
            ))}
          </div>
          <div className="max-h-[420px] overflow-y-auto overflow-x-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Ref</th>
                  <th className="py-2 pr-3">Device</th>
                  <th className="py-2 pr-3">Location</th>
                  <th className="py-2 pr-3">Time On Page</th>
                  <th className="py-2 pr-3">Page</th>
                  <th className="py-2 pr-3">Referer</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((row) => (
                  <tr key={row.id} className="border-t border-white/5 align-top">
                    <td className="py-2 pr-3 whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</td>
                    <td className="py-2 pr-3">{row.ref_tag || 'direct'}</td>
                    <td className="py-2 pr-3">{row.device_type || '-'}</td>
                    <td className="py-2 pr-3">
                      {[decodeLocationValue(row.city), decodeLocationValue(row.region), decodeLocationValue(row.country)]
                        .filter(Boolean)
                        .join(', ') || '-'}
                    </td>
                    <td className="py-2 pr-3">{row.time_on_page_seconds ?? 0}s</td>
                    <td className="py-2 pr-3">{row.page_url || '-'}</td>
                    <td className="py-2 pr-3">{row.referer || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/dashboard.html"
            className="rounded-xl bg-primary px-5 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition"
          >
            Open Public Dashboard
          </a>
          <a
            href="/"
            className="rounded-xl border border-primary/30 px-5 py-3 text-primary font-medium hover:bg-primary/10 transition"
          >
            Back To Portfolio
          </a>
        </div>
      </div>
    </main>
  )
}

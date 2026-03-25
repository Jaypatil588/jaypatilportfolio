import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function AdminRoute() {
  const cookieStore = await cookies()
  const isAuthed = cookieStore.get('portfolio_admin_auth')?.value === '1'

  if (!isAuthed) {
    redirect('/auth')
  }

  redirect('/dashboard.html')
}

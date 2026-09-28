import { redirect } from 'next/navigation'
import { DEFAULT_TABLE_ROUTE } from '@/config/schemaRegistry'

export const revalidate = 0

export default function Page() {
  redirect(`/${DEFAULT_TABLE_ROUTE}`)
}

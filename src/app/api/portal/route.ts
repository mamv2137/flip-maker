import { CustomerPortal } from '@polar-sh/nextjs'
import { type NextRequest } from 'next/server'
import { createClient } from '@/supabase/server'

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile`,
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  getCustomerId: async (_req: NextRequest) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return ''

    const { data: profile } = await supabase
      .from('profiles')
      .select('polar_customer_id')
      .eq('id', user.id)
      .single()

    return profile?.polar_customer_id || ''
  },
})

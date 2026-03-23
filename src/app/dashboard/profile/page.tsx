import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile-form'
import { GoogleDriveConnect } from '@/components/google-drive-connect'
import { PlanCard } from '@/components/plan-card'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and integrations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>
              Update your display name and profile details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              userId={user.id}
              email={user.email || ''}
              displayName={profile?.display_name || ''}
              avatarUrl={profile?.avatar_url || ''}
              bio={profile?.bio || ''}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {/* Plan */}
          <PlanCard plan={profile?.plan || 'free'} userEmail={user.email || ''} />

          {/* Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integrations</CardTitle>
              <CardDescription>
                Connect external services to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleDriveConnect />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

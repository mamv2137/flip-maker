'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu,
  BookOpen,
  Library,
  User,
  LogOut,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/supabase/client'

type Props = {
  userEmail: string
  displayName: string | null
}

const navLinks = [
  { name: 'Books', href: '/dashboard', icon: BookOpen },
  { name: 'Library', href: '/library', icon: Library },
]

export function DashboardNavbar({ userEmail, displayName }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const initials = (displayName || userEmail)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-5 w-5" />
            <span>Flipbooks</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Button
                  key={link.name}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  asChild
                >
                  <Link href={link.href} className="gap-1.5">
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Right: Theme + Avatar (desktop) + Burger (mobile) */}
        <div className="flex items-center gap-2">
          {/* Theme switcher - desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden h-9 w-9 md:inline-flex">
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : theme === 'light' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Laptop className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light" className="gap-2">
                  <Sun className="h-4 w-4" /> Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark" className="gap-2">
                  <Moon className="h-4 w-4" /> Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system" className="gap-2">
                  <Laptop className="h-4 w-4" /> System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User dropdown - desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative hidden h-9 w-9 rounded-full md:inline-flex">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{displayName || 'User'}</p>
                <p className="text-muted-foreground truncate text-xs">{userEmail}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile burger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Flipbooks
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {/* User info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium">{displayName || 'User'}</p>
                    <p className="text-muted-foreground truncate text-xs">{userEmail}</p>
                  </div>
                </div>

                <Separator />

                {/* Nav links */}
                {navLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Button
                      key={link.name}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className="justify-start gap-2"
                      asChild
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link href={link.href}>
                        <link.icon className="h-4 w-4" />
                        {link.name}
                      </Link>
                    </Button>
                  )
                })}

                <Separator />

                {/* Theme */}
                <div className="flex flex-col gap-1">
                  <p className="text-muted-foreground px-3 text-xs font-medium">Theme</p>
                  <div className="flex gap-1">
                    {[
                      { value: 'light', icon: Sun, label: 'Light' },
                      { value: 'dark', icon: Moon, label: 'Dark' },
                      { value: 'system', icon: Laptop, label: 'Auto' },
                    ].map((t) => (
                      <Button
                        key={t.value}
                        variant={theme === t.value ? 'secondary' : 'ghost'}
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => setTheme(t.value)}
                      >
                        <t.icon className="h-3.5 w-3.5" />
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Profile & Logout */}
                <Button
                  variant="ghost"
                  className="justify-start gap-2"
                  asChild
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href="/dashboard/profile">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive justify-start gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

import Link from 'next/link'
import { useRouter } from 'next/router'
import { Home, CreditCard, User, Users, ShieldCheck, Mail, BarChart, Settings } from 'lucide-react'

export default function Sidebar({ user }) {
  const router = useRouter()
  const isAdmin = user?.role === 'admin'

  const clientLinks = [
    { href: '/client/dashboard', label: 'Dashboard', icon: Home },
    { href: '/client/transactions', label: 'Transactions', icon: CreditCard },
    { href: '/client/profile', label: 'Profile', icon: User },
  ]

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Overview', icon: BarChart },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/transactions', label: 'Transactions', icon: ShieldCheck },
    { href: '/admin/messages', label: 'Send Message', icon: Mail },
  ]

  const links = isAdmin ? adminLinks : clientLinks

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
      <div className="p-4">
        <div className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = router.pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
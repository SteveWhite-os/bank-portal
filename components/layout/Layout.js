import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children, user }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-8 mt-16 ml-0 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
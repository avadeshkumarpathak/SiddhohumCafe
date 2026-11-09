
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Utensils,
   ClipboardList,
  User
} from 'lucide-react'

export const MobileBottomNavigation = () => {
  const location = useLocation()

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path ||
        location.pathname.startsWith(`${path}/`)

  return (
    <nav
      className="md:hidden bg-[#381E0D] border-t border-amber-900/60 shadow-[0_-4px_15px_rgba(0,0,0,0.2)]"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="grid grid-cols-4 max-w-lg mx-auto">

        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 py-2.5 ${
            isActive('/') ? 'text-amber-400' : 'text-stone-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>

        <Link
          to="/menu"
          className={`flex flex-col items-center justify-center gap-1 py-2.5 ${
            isActive('/menu') ? 'text-amber-400' : 'text-stone-300'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Menu</span>
        </Link>

        <Link
          to="/orders"
          className={`flex flex-col items-center justify-center gap-1 py-2.5 ${
            isActive('/orders') ? 'text-amber-400' : 'text-stone-300'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] font-semibold">My Orders</span>
        </Link>

        <Link
  to="/profile"
  className={`flex flex-col items-center justify-center gap-1 py-2.5 ${
    isActive('/profile') ? 'text-amber-400' : 'text-stone-300'
  }`}
>
  <User className="w-5 h-5" />
  <span className="text-[10px] font-semibold">Account</span>
</Link>

      </div>
    </nav>
  )
}

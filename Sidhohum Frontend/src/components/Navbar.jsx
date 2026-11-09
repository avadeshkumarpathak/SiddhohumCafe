
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ShoppingBag,
  User,
  Award,
  Coffee,
} from 'lucide-react'

import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCafe } from '../context/CafeContext'

import logo from '../assets/images/siddhohum-logo.png'

export const Navbar = () => {
  const { totalItemsCount, setIsDrawerOpen } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { settings } = useCafe()
  const location = useLocation()

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path ||
        location.pathname.startsWith(`${path}/`)

  return (
    <header className="sticky top-0 z-40 bg-[#381E0D]/95 backdrop-blur-md text-white border-b border-amber-900/50 shadow-md transition-colors">

      {/* Header Content */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">

        {/* Brand Logo & Name */}
        <Link
          to="/"
          className="flex items-center gap-1.5 sm:gap-2.5 group min-w-0 flex-1"
        >
          <img
            src={logo}
            alt="Siddhohum Cafe"
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 object-contain drop-shadow transition-transform group-hover:scale-105"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <span className="font-display font-extrabold text-sm sm:text-lg tracking-tight text-white group-hover:text-amber-300 transition-colors whitespace-nowrap">
                {settings?.cafeName || 'Siddhohum Cafe'}
              </span>

              {/* Dynamic Open / Closed Badge */}
              <span
                className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${
                  settings?.isOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {settings?.isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>

            {/* Tagline */}
            <div className="flex items-center gap-1.5 text-[11px] text-amber-200/90 font-medium">
              {/* <Coffee className="w-3 h-3 text-amber-400" /> */}
              <span>Sukoon Ka Permanent Address</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className={`transition-colors hover:text-amber-300 ${
              isActive('/')
                ? 'text-amber-400 font-semibold'
                : 'text-stone-200'
            }`}
          >
            Home
          </Link>

          <Link
            to="/menu"
            className={`transition-colors hover:text-amber-300 ${
              isActive('/menu')
                ? 'text-amber-400 font-semibold'
                : 'text-stone-200'
            }`}
          >
            Menu
          </Link>

          <Link
            to="/orders"
            className={`transition-colors hover:text-amber-300 ${
              isActive('/orders')
                ? 'text-amber-400 font-semibold'
                : 'text-stone-200'
            }`}
          >
            My Orders
          </Link>

          <Link
            to="/profile"
            className={`flex items-center gap-1 transition-colors hover:text-amber-300 ${
              isActive('/profile')
                ? 'text-amber-400 font-semibold'
                : 'text-stone-200'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Rewards</span>

            {user?.rewardPoints > 0 && (
              <span className="bg-amber-500 text-stone-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                {user.rewardPoints}p
              </span>
            )}
          </Link>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* User Account / Profile */}
          {/* Rewards */}
<Link
  to="/profile"
  className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 hover:text-amber-300 transition-colors relative shrink-0"
  title="Rewards"
>
  <Award className="w-4 h-4" />
</Link>

          {/* Cart Icon & Trigger Drawer */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative flex items-center gap-1 sm:gap-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-2 sm:px-3 py-1.5 rounded-lg text-xs transition shadow-sm shrink-0"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-4 h-4 text-stone-950" />
            <span className="hidden sm:inline">Cart</span>

            {totalItemsCount > 0 && (
              <span className="bg-stone-950 text-amber-400 font-extrabold text-[11px] px-1.5 py-0.5 rounded-full leading-none">
                {totalItemsCount}
              </span>
            )}
          </button>

        </div>
      </div>


    </header>
  )
}

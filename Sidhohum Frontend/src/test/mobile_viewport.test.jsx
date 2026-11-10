import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../context/ToastContext'
import { CafeProvider } from '../context/CafeContext'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { MenuItemCard } from '../components/MenuItemCard'
import { CartDrawer } from '../components/CartDrawer'
import { MobileBottomNavigation } from '../components/MobileBottomNavigation'

const mockDish = {
  _id: 'dish-viewport-1',
  name: 'Signature Artisan Chai',
  creativeName: 'Mountain Elixir',
  price: 65,
  isVeg: true,
  isAvailable: true
}

const ViewportTestApp = () => (
  <ToastProvider>
    <CafeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
              <main className="flex-1 p-4 pb-24 md:pb-4">
                <MenuItemCard item={mockDish} />
              </main>
              <CartDrawer />
              <MobileBottomNavigation />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </CafeProvider>
  </ToastProvider>
)

describe('CartDrawer Mobile & Desktop Viewport Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  const setViewport = (width, height = 800) => {
    window.innerWidth = width
    window.innerHeight = height
    window.dispatchEvent(new Event('resize'))
  }

  const testViewportDrawer = (width, height) => {
    setViewport(width, height)
    render(<ViewportTestApp />)

    // Verify MobileBottomNavigation is present in document
    const mobileNav = document.querySelector('nav.md\\:hidden')
    expect(mobileNav).toBeInTheDocument()
    expect(mobileNav.style.zIndex).toBe('9999')

    // Find first dish on the page and add to cart
    const addButtons = screen.getAllByText('ADD')
    expect(addButtons.length).toBeGreaterThan(0)
    fireEvent.click(addButtons[0])

    // Verify Sticky Bottom Mini Bar appears
    const viewCartBtn = screen.getByText('View Cart')
    expect(viewCartBtn).toBeInTheDocument()

    const stickyBar = viewCartBtn.closest('.fixed')
    expect(stickyBar).toBeInTheDocument()
    expect(stickyBar.className).toContain('bottom-[calc(56px+env(safe-area-inset-bottom))]')
    expect(stickyBar.className).toContain('md:bottom-0')

    // Click "View Cart" to open Full Cart Drawer
    fireEvent.click(viewCartBtn)

    // Full Cart Drawer Modal should be rendered in document.body via portal
    const modalBackdrop = document.querySelector('.bg-stone-950\\/70')
    expect(modalBackdrop).toBeInTheDocument()

    const modalWrapper = modalBackdrop.parentElement
    // Modal wrapper has z-[10000] which is above MobileBottomNavigation's z-index 9999
    expect(modalWrapper.className).toContain('z-[10000]')
    expect(modalWrapper.className).toContain('fixed')
    expect(modalWrapper.className).toContain('inset-0')

    // Drawer container occupies available viewport height
    const drawerContainer = modalWrapper.querySelector('.inset-0.sm\\:inset-y-0')
    expect(drawerContainer).toBeInTheDocument()

    // Inner drawer panel
    const drawerPanel = modalWrapper.querySelector('.bg-\\[\\#FAF7F2\\]')
    expect(drawerPanel).toBeInTheDocument()
    expect(drawerPanel.className).toContain('flex-col')
    expect(drawerPanel.className).toContain('h-full')

    // Header remains visible at top
    const header = drawerPanel.querySelector('.shrink-0.bg-\\[\\#381E0D\\]')
    expect(header).toBeInTheDocument()
    expect(within(header).getByText('Your Cart')).toBeInTheDocument()

    // Items list is scrollable
    const itemsList = drawerPanel.querySelector('.overflow-y-auto')
    expect(itemsList).toBeInTheDocument()
    expect(itemsList.className).toContain('flex-1')
    expect(itemsList.className).toContain('min-h-0')

    // Bill breakdown & Proceed to Checkout button remain visible and accessible at bottom
    const footer = drawerPanel.querySelector('.shrink-0.bg-white')
    expect(footer).toBeInTheDocument()
    expect(within(footer).getByText('Item Subtotal')).toBeInTheDocument()
    expect(within(footer).getByText('To Pay')).toBeInTheDocument()

    const checkoutBtn = within(footer).getByText('Proceed to Checkout')
    expect(checkoutBtn).toBeInTheDocument()
    expect(checkoutBtn).toBeVisible()

    // Quantity controls work in drawer
    const plusBtn = drawerPanel.querySelector('button.bg-amber-700')
    expect(plusBtn).toBeInTheDocument()
    fireEvent.click(plusBtn)

    // Items count updated to 2
    expect(within(header).getByText(/2 items/i)).toBeInTheDocument()

    // Close the drawer using the close button in header
    const closeBtn = header.querySelector('button')
    expect(closeBtn).toBeInTheDocument()
    fireEvent.click(closeBtn)

    // Modal drawer is unmounted and no longer in document
    expect(document.querySelector('.bg-stone-950\\/70')).toBeNull()

    // Sticky Bottom Mini Bar is restored
    expect(screen.getByText('View Cart')).toBeInTheDocument()
  }

  it('runs successfully at 375px mobile viewport width (iPhone SE / mini)', () => {
    testViewportDrawer(375, 667, true)
  })

  it('runs successfully at 390px mobile viewport width (iPhone 14/15/16)', () => {
    testViewportDrawer(390, 844, true)
  })

  it('runs successfully at 1024px desktop viewport width', () => {
    testViewportDrawer(1024, 768, false)
  })
})

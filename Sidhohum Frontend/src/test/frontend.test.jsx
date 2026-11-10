import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { MenuItemCard } from '../components/MenuItemCard'
import { CategoryNav } from '../components/CategoryNav'
import { LoyaltyWidget } from '../components/LoyaltyWidget'
import { CartDrawer } from '../components/CartDrawer'
import { CartProvider } from '../context/CartContext'
import { ToastProvider } from '../context/ToastContext'
import { CafeProvider } from '../context/CafeContext'
import { AuthProvider } from '../context/AuthContext'

const mockDish = {
  _id: 'dish-1',
  name: 'Midnight Himalayan Chai',
  creativeName: 'Soul Warmer Elixir',
  description: 'Slow-simmered mountain blend infused with cardamom.',
  price: 40,
  isVeg: true,
  isAvailable: true,
  badge: 'Bestseller',
  imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3'
}

const renderWithProviders = (ui) => {
  return render(
    <ToastProvider>
      <CafeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>{ui}</BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </CafeProvider>
    </ToastProvider>
  )
}

describe('Frontend Component Tests', () => {
  describe('1. MenuItemCard', () => {
    it('renders dish name, creative display name, and price', () => {
      renderWithProviders(<MenuItemCard item={mockDish} />)

      expect(screen.getByText('Midnight Himalayan Chai')).toBeInTheDocument()
      expect(screen.getByText('Soul Warmer Elixir')).toBeInTheDocument()
      expect(screen.getByText('₹40')).toBeInTheDocument()
      expect(screen.getByText('ADD')).toBeInTheDocument()
    })

    it('clicking ADD adds item to cart and displays quantity selector', () => {
      renderWithProviders(<MenuItemCard item={mockDish} />)

      const addButton = screen.getByText('ADD')
      fireEvent.click(addButton)

      // Should now show quantity 1
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('renders Sold Out overlay when item is unavailable', () => {
      const unavailableDish = { ...mockDish, _id: 'dish-2', isAvailable: false }
      renderWithProviders(<MenuItemCard item={unavailableDish} />)

      expect(screen.getByText('Sold Out')).toBeInTheDocument()
      expect(screen.getByText('Unavailable')).toBeInTheDocument()
    })
  })

  describe('2. CategoryNav', () => {
    const mockCategories = [
      { _id: 'cat-1', name: 'Beverages and Chai', slug: 'beverages-and-chai', iconName: 'Coffee' },
      { _id: 'cat-2', name: 'Starters', slug: 'starters', iconName: 'Flame' }
    ]

    it('renders categories and responds to click selection', () => {
      const onSelect = vi.fn()
      render(
        <CategoryNav
          categories={mockCategories}
          selectedCategory="all"
          onSelectCategory={onSelect}
        />
      )

      expect(screen.getByText('All Items')).toBeInTheDocument()
      expect(screen.getByText('Beverages and Chai')).toBeInTheDocument()
      expect(screen.getByText('Starters')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Beverages and Chai'))
      expect(onSelect).toHaveBeenCalledWith('beverages-and-chai')
    })
  })

  describe('3. LoyaltyWidget', () => {
    it('renders reward progress tracker and points balance', () => {
      renderWithProviders(<LoyaltyWidget />)

      expect(screen.getByText(/Loyalty Rewards/i)).toBeInTheDocument()
      expect(screen.getByText(/Orders Completed|Milestone/i)).toBeInTheDocument()
      expect(screen.getByText(/Pts/i)).toBeInTheDocument()
    })
  })

  describe('4. CartDrawer Mobile Navigation & Visibility Tests', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    const TestCartApp = () => (
      <>
        <MenuItemCard item={mockDish} />
        <CartDrawer />
      </>
    )

    it('displays Sticky Bottom Mini Bar positioned above MobileBottomNavigation when items added', () => {
      renderWithProviders(<TestCartApp />)

      // Add item to cart
      const addButton = screen.getByText('ADD')
      fireEvent.click(addButton)

      // Sticky Bottom Mini Bar should appear
      expect(screen.getByText(/1 item in Cart/i)).toBeInTheDocument()
      expect(screen.getByText('View Cart')).toBeInTheDocument()

      // Check mobile bottom offset to sit above MobileBottomNavigation
      const stickyBar = screen.getByText('View Cart').closest('.fixed')
      expect(stickyBar).toBeInTheDocument()
      expect(stickyBar.className).toContain('bottom-[calc(56px+env(safe-area-inset-bottom))]')
      expect(stickyBar.className).toContain('md:bottom-0')
    })

    it('opens Full Cart Drawer in portal above all elements, occupies viewport height, and supports quantity controls', () => {
      renderWithProviders(<TestCartApp />)

      // Add item and open cart
      const addButton = screen.getByText('ADD')
      fireEvent.click(addButton)

      const viewCartButton = screen.getByText('View Cart')
      fireEvent.click(viewCartButton)

      // Verify portal modal renders above all UI elements with z-[10000]
      const modalBackdrop = document.querySelector('.bg-stone-950\\/70')
      expect(modalBackdrop).toBeInTheDocument()

      const modalWrapper = modalBackdrop.parentElement
      expect(modalWrapper.className).toContain('z-[10000]')
      expect(modalWrapper.className).toContain('fixed')
      expect(modalWrapper.className).toContain('inset-0')

      // Drawer container must occupy full viewport on mobile (inset-0) and right-drawer on desktop
      const drawerContainer = modalWrapper.querySelector('.inset-0.sm\\:inset-y-0')
      expect(drawerContainer).toBeInTheDocument()

      const drawerPanel = modalWrapper.querySelector('.bg-\\[\\#FAF7F2\\]')
      expect(drawerPanel).toBeInTheDocument()

      // Header remains visible
      expect(within(drawerPanel).getByText('Your Cart')).toBeInTheDocument()

      // Item in list
      expect(within(drawerPanel).getByText('Midnight Himalayan Chai')).toBeInTheDocument()

      // Bill breakdown & Proceed to Checkout button visible
      expect(within(drawerPanel).getByText('Proceed to Checkout')).toBeInTheDocument()
      expect(within(drawerPanel).getByText('Item Subtotal')).toBeInTheDocument()
      expect(within(drawerPanel).getByText('To Pay')).toBeInTheDocument()

      // Quantity controls test inside drawer: increase to 2
      const itemRow = within(drawerPanel).getByText('Midnight Himalayan Chai').closest('.bg-white')
      const incrementBtn = itemRow.querySelector('.bg-amber-700')
      fireEvent.click(incrementBtn)

      // Subtotal and item total should now reflect 2 items (2 * 40 = 80)
      expect(within(drawerPanel).getAllByText('₹80').length).toBeGreaterThanOrEqual(1)

      // Clear cart
      const clearBtn = within(drawerPanel).getByText('Clear Cart')
      fireEvent.click(clearBtn)
      expect(within(drawerPanel).getByText('Your cart is empty')).toBeInTheDocument()

      // Close drawer via header close button
      const headerCloseBtn = drawerPanel.querySelector('button')
      fireEvent.click(headerCloseBtn)
    })

    it('handles many items with independent scrolling, bill calculation, and accessible checkout button', () => {
      // Create multi-item scenario
      const manyDishes = Array.from({ length: 8 }, (_, idx) => ({
        _id: `dish-multi-${idx}`,
        name: `Special Artisan Drink #${idx + 1}`,
        price: 50 + idx * 10,
        isVeg: true,
        isAvailable: true
      }))

      const MultiItemApp = () => (
        <>
          {manyDishes.map((dish) => (
            <MenuItemCard key={dish._id} item={dish} />
          ))}
          <CartDrawer />
        </>
      )

      renderWithProviders(<MultiItemApp />)

      // Add all 8 dishes to cart
      const addButtons = screen.getAllByText('ADD')
      addButtons.forEach((btn) => fireEvent.click(btn))

      // Open Cart
      const viewCartBtn = screen.getByText('View Cart')
      fireEvent.click(viewCartBtn)

      // Get drawer elements
      const drawerPanel = document.querySelector('.bg-\\[\\#FAF7F2\\]')
      expect(drawerPanel).toBeInTheDocument()

      // Header remains visible
      const header = drawerPanel.querySelector('.shrink-0.bg-\\[\\#381E0D\\]')
      expect(header).toBeInTheDocument()

      // Scrollable list container must have overflow-y-auto, flex-1, min-h-0
      const scrollableList = drawerPanel.querySelector('.overflow-y-auto')
      expect(scrollableList).toBeInTheDocument()
      expect(scrollableList.className).toContain('flex-1')
      expect(scrollableList.className).toContain('min-h-0')

      // All 8 items are rendered inside the scrollable list
      manyDishes.forEach((dish) => {
        expect(within(scrollableList).getByText(dish.name)).toBeInTheDocument()
      })

      // Footer is shrink-0 and remains visible with Proceed to Checkout button
      const footer = drawerPanel.querySelector('.shrink-0.bg-white')
      expect(footer).toBeInTheDocument()

      const checkoutBtn = within(footer).getByText('Proceed to Checkout')
      expect(checkoutBtn).toBeInTheDocument()

      // Click Proceed to Checkout closes the drawer
      fireEvent.click(checkoutBtn)
      expect(drawerPanel).not.toBeInTheDocument()
    })
  })
})

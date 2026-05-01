import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Cart from '../Cart.vue'
import api from '../../api'
import * as auth from '../../utils/auth'

vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('../../utils/auth.ts', () => ({
  getCurrentUser: vi.fn()
}))

const mountComponent = () =>
  mount(Cart, {
    global: {
      stubs: { 'v-img': true, 'v-icon': true },
    },
  })

describe('Cart.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  //purpose: verifies empty cart UI
  //inputs: api returns empty items
  //outputs: empty message displayed
  it('renders empty cart message', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })
    vi.mocked(api.get).mockResolvedValue({ data: { items: [] } })

    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('Your cart is empty.')
  })

  //purpose: checks total calculation
  //inputs: one item with quantity 2 and price 10
  //outputs: total is 20
  it('renders items and total correctly', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })
    vi.mocked(api.get).mockResolvedValue({
      data: { items: [{ product_id: 1, price: '10.00', quantity: 2 }] }
    })

    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('€20.00')
  })

  //purpose: tests decrease quantity action
  //inputs: click "-" button
  //outputs: api.post called with decrease endpoint
  it('decreases quantity', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })
    vi.mocked(api.get).mockResolvedValue({
      data: { items: [{ product_id: 1, price: '10', quantity: 2 }] }
    })
    vi.mocked(api.post).mockResolvedValue({})

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper.findAll('button')[0].trigger('click')

    expect(api.post).toHaveBeenCalledWith('/cart/decrease/', expect.any(Object))
  })

  //purpose: ensures item is removed when quantity reaches zero
  //inputs: item with quantity 1, click "-"
  //outputs: api.post called with remove endpoint
  it('removes item when quantity goes to 0', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })

    vi.mocked(api.get).mockResolvedValue({
      data: { items: [{ product_id: 1, price: '10', quantity: 1 }] }
    })

    vi.mocked(api.post).mockResolvedValue({})

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper.findAll('button')[0].trigger('click')

    expect(api.post).toHaveBeenCalledWith('/cart/remove/', {
      account_id: 1,
      product_id: 1
    })
  })

  //purpose: tests checkout flow
  //inputs: click checkout button
  //outputs: api.post called with checkout endpoint
  it('calls checkout', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })
    vi.mocked(api.get).mockResolvedValue({
      data: { items: [{ product_id: 1, price: '10', quantity: 1 }] }
    })
    vi.mocked(api.post).mockResolvedValue({})

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper.find('.checkout-btn').trigger('click')

    expect(api.post).toHaveBeenCalledWith('/cart/checkout/', {
      account_id: 1
    })
  })

  //purpose: tests error handling during checkout
  //inputs: api.post rejects
  //outputs: console.error is called
  it('handles checkout error', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })

    vi.mocked(api.get).mockResolvedValue({
      data: { items: [{ product_id: 1, price: '10', quantity: 1 }] }
    })

    vi.mocked(api.post).mockRejectedValue(new Error('fail'))

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper.find('.checkout-btn').trigger('click')
    await flushPromises()

    expect(console.error).toHaveBeenCalled()
  })

  //purpose: prevents fetching cart if no user
  //inputs: null user
  //outputs: api.get not called
  it('does not fetch if no user', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue(null)

    const wrapper = mountComponent()
    await flushPromises()

    expect(api.get).not.toHaveBeenCalled()
  })
})
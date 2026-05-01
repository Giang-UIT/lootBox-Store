import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ProductPage from '../productpage.vue'
import api from '../../api'
import * as auth from '../../utils/auth'

vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('../../utils/auth.ts', () => ({
  getCurrentUser: vi.fn()
}))

const mockProducts = [
  { id: 1, name: 'Tokyo Neon Box', description: 'Cool stuff', price: '89.99', stock: 15, origin: 'Japan', image: '' },
  { id: 2, name: 'Italy Box', description: 'Pasta', price: '39.99', stock: 0, origin: 'Italy', image: '' }
]

const mountComponent = () =>
  mount(ProductPage, {
    global: {
      stubs: { 'v-img': true, 'v-icon': true },
    },
  })

describe('ProductPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  //purpose: checks if products are rendered from api
  //inputs: api returns 2 products
  //outputs: 2 product titles displayed
  it('renders products from api', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })
    vi.mocked(api.get).mockResolvedValue({ data: mockProducts })

    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.findAll('h3').length).toBe(2)
  })

  //purpose: verifies empty state rendering
  //inputs: api returns empty array
  //outputs: no product titles shown
  it('renders nothing if api returns empty array', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.findAll('h3').length).toBe(0)
  })

  //purpose: tests navigation when clicking product card
  //inputs: click event on first card
  //outputs: router push called with correct route
  it('navigates when product card is clicked', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })
    vi.mocked(api.get).mockResolvedValue({ data: mockProducts })

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper.find('.product-card').trigger('click')

    expect(mockPush).toHaveBeenCalledWith('/product/1')
  })

  //purpose: prevents cart action if user not logged in
  //inputs: null user, click add to cart
  //outputs: alert shown and no api call
  it('prevents adding to cart if not logged in', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue(null)
    vi.mocked(api.get).mockResolvedValue({ data: mockProducts })

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper.find('.add-to-cart-btn').trigger('click')

    expect(window.alert).toHaveBeenCalled()
    expect(api.post).not.toHaveBeenCalled()
  })

  //purpose: tests successful add to cart
  //inputs: logged in user, click button
  //outputs: api.post called with correct payload
  it('adds product to cart if logged in', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })
    vi.mocked(api.get).mockResolvedValue({ data: mockProducts })
    vi.mocked(api.post).mockResolvedValue({})

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper.find('.add-to-cart-btn').trigger('click')

    expect(api.post).toHaveBeenCalledWith('/cart/add/', {
      account_id: 1,
      product_id: 1,
      quantity: 1
    })
  })

  //purpose: verifies loading state during add to cart
  //inputs: delayed api response
  //outputs: button shows "Adding..."
  it('shows loading state while adding', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })
    vi.mocked(api.get).mockResolvedValue({ data: mockProducts })

    let resolvePost: any
    vi.mocked(api.post).mockImplementation(() =>
      new Promise(res => { resolvePost = res })
    )

    const wrapper = mountComponent()
    await flushPromises()

    const btn = wrapper.find('.add-to-cart-btn')
    await btn.trigger('click')

    expect(btn.text()).toContain('Adding...')

    resolvePost({})
    await flushPromises()
  })

  //purpose: tests error handling in add to cart
  //inputs: api.post throws error
  //outputs: console.error called
  it('handles api error when adding to cart fails', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })
    vi.mocked(api.get).mockResolvedValue({ data: mockProducts })
    vi.mocked(api.post).mockRejectedValue(new Error('fail'))

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper.find('.add-to-cart-btn').trigger('click')

    expect(console.error).toHaveBeenCalled()
  })

  //purpose: ensures out of stock button is disabled
  //inputs: product with stock 0
  //outputs: button has disabled attribute
  it('disables button if out of stock', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })
    vi.mocked(api.get).mockResolvedValue({ data: mockProducts })

    const wrapper = mountComponent()
    await flushPromises()

    const buttons = wrapper.findAll('.add-to-cart-btn')

    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  //purpose: tests api failure when fetching products
  //inputs: api.get rejects
  //outputs: no crash and no products rendered
  it('handles api error when fetching products fails', async () => {
    vi.mocked(auth.getCurrentUser).mockReturnValue({ id: 1 })
    vi.mocked(api.get).mockRejectedValue(new Error('fail'))

    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.findAll('h3').length).toBe(0)
  })
})
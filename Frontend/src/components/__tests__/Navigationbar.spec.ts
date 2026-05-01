import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import NavigationBar from '../Navigationbar.vue'
import api from '../../api'

vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const mockGet = api.get as ReturnType<typeof vi.fn>
const mockPost = api.post as ReturnType<typeof vi.fn>

const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

const mockProducts = [
  {
    id: 1,
    name: 'Keyboard',
    description: 'Mechanical keyboard',
    price: '99.99',
    stock: 10,
    origin: 'Norway',
    image: '',
  },
  {
    id: 2,
    name: 'Mouse',
    description: 'Gaming mouse',
    price: '49.99',
    stock: 5,
    origin: 'Sweden',
    image: '',
  },
  {
    id: 3,
    name: 'Monitor',
    description: '4K monitor',
    price: '299.99',
    stock: 3,
    origin: 'Denmark',
    image: '',
  },
]

//v-autocomplete testing
const VAutocompleteStub = {
  name: 'VAutocomplete',
  props: ['modelValue', 'search', 'items', 'loading'],
  emits: ['update:modelValue', 'update:search'],
  template: `
    <div>
      <input
        class="search-input"
        :value="search"
        @input="$emit('update:search', $event.target.value)"
      />

      <button
        class="select-first-product"
        @click="$emit('update:modelValue', items?.[0]?.value)"
      >
        Select first
      </button>

      <div class="loading-state">{{ loading }}</div>

      <ul class="autocomplete-items">
        <li
          v-for="item in items"
          :key="item.value"
          class="autocomplete-item"
        >
          {{ item.title }}
        </li>
      </ul>
    </div>
  `,
}

const mountComponent = () =>
  mount(NavigationBar, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
        'v-container': { template: '<div><slot /></div>' },
        'v-sheet': { template: '<div><slot /></div>' },
        'v-text': { template: '<span><slot /></span>' },
        'v-card': { template: '<div><slot /></div>' },
        'v-autocomplete': VAutocompleteStub,
      },
    },
  })

describe('NavigationBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    localStorage.clear()

    mockGet.mockResolvedValue({ data: mockProducts })
    mockPost.mockResolvedValue({})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  //Rendering

  it('renders store logo and Products link', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('LootBox Store')

    const links = wrapper.findAllComponents(RouterLinkStub)
    expect(links.some(link => link.props('to') === '/')).toBe(true)
  })

  it('shows Log in link when user is not logged in', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const links = wrapper.findAllComponents(RouterLinkStub)
    expect(links.some(link => link.props('to') === '/login')).toBe(true)
    expect(wrapper.find('.logout-btn').exists()).toBe(false)
  })

  it('shows cart and addresses links when normal user is logged in', async () => {
    localStorage.setItem(
      'account',
      JSON.stringify({ id: 1, username: 'testuser', admin_status: false })
    )

    const wrapper = mountComponent()
    await flushPromises()

    const links = wrapper.findAllComponents(RouterLinkStub)

    expect(links.some(link => link.props('to') === '/cart')).toBe(true)
    expect(links.some(link => link.props('to') === '/addresses')).toBe(true)
    expect(links.some(link => link.props('to') === '/productmanagement')).toBe(false)
    expect(wrapper.find('.logout-btn').exists()).toBe(true)
  })

  it('shows product management link when admin is logged in', async () => {
    localStorage.setItem(
      'account',
      JSON.stringify({ id: 1, username: 'admin', admin_status: true })
    )

    const wrapper = mountComponent()
    await flushPromises()

    const links = wrapper.findAllComponents(RouterLinkStub)

    expect(links.some(link => link.props('to') === '/productmanagement')).toBe(true)
    expect(links.some(link => link.props('to') === '/cart')).toBe(false)
    expect(links.some(link => link.props('to') === '/addresses')).toBe(false)
    expect(wrapper.find('.logout-btn').exists()).toBe(true)
  })

  //fetch Products for search bar

  it('calls api.get with products on mount', async () => {
    mountComponent()
    await flushPromises()

    expect(mockGet).toHaveBeenCalledWith('/products/')
  })

  it('handles fetch failure', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    mockGet.mockRejectedValue(new Error('failed'))

    mountComponent()
    await flushPromises()

    expect(consoleSpy).toHaveBeenCalledWith('could not get records from product table')
    consoleSpy.mockRestore()
  })

  //search bar

  it('shows no items when search input is empty', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.findAll('.autocomplete-item')).toHaveLength(0)
  })

  it('filters products after typing in search bar', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const input = wrapper.find('.search-input')
    await input.setValue('key')

    expect(wrapper.findAll('.autocomplete-item')).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(300)
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('.autocomplete-item')
    expect(items).toHaveLength(1)
    expect(items[0].text()).toBe('Keyboard')
  })

  it('clears items when search input becomes empty', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const input = wrapper.find('.search-input')
    await input.setValue('mo')

    await vi.advanceTimersByTimeAsync(300)
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.autocomplete-item')).toHaveLength(2)

    await input.setValue('')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.autocomplete-item')).toHaveLength(0)
  })

  //Logout

  it('calls api.post, clears localStorage and redirects on logout', async () => {
    localStorage.setItem(
      'account',
      JSON.stringify({ id: 1, username: 'testuser', admin_status: false })
    )
    localStorage.setItem('token', 'fake-token')

    const originalLocation = window.location

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    })

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper.find('.logout-btn').trigger('click')
    await flushPromises()

    expect(mockPost).toHaveBeenCalledWith('/logout/', { token: 'fake-token' })
    expect(localStorage.getItem('account')).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(window.location.href).toBe('/')

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })
  })

  it('still clears localStorage and redirects even if logout request fails', async () => {
    localStorage.setItem(
      'account',
      JSON.stringify({ id: 1, username: 'testuser', admin_status: false })
    )
    localStorage.setItem('token', 'fake-token')

    mockPost.mockRejectedValue(new Error('logout failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const originalLocation = window.location

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    })

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper.find('.logout-btn').trigger('click')
    await flushPromises()

    expect(consoleSpy).toHaveBeenCalled()
    expect(localStorage.getItem('account')).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(window.location.href).toBe('/')

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })

    consoleSpy.mockRestore()
  })
})
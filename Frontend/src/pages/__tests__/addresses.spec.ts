import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Addresses from '../Addresses.vue'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockAccount = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
}

const mockAddresses = [
  {
    id: 10,
    account_id: 1,
    phone_number: '12345678',
    line1: 'Test Street 1',
    line2: 'Apartment 2',
    city: 'Tromsø',
    state: 'Troms',
    postal_code: '9000',
    country: 'Norway',
  },
  {
    id: 11,
    account_id: 1,
    phone_number: '87654321',
    line1: 'Second Street 5',
    line2: '',
    city: 'Oslo',
    state: 'Oslo',
    postal_code: '0150',
    country: 'Norway',
  },
]

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

Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(window, 'confirm', {
  value: vi.fn(),
  writable: true,
})

const mockFetch = vi.fn()

Object.defineProperty(window, 'fetch', {
  value: mockFetch,
  writable: true,
})

const mountComponent = () => mount(Addresses)

describe('Addresses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockAddresses),
    })
  })

  //Authentication

  //purpose: ensures user is redirected to login if no account in localStorage
  //inputs: component mounts with empty localStorage
  //outputs: alert shown and router.push called with /login
  it('redirects to login when no account is found', async () => {
    mountComponent()
    await flushPromises()

    expect(window.alert).toHaveBeenCalledWith('No account found. Please log in.')
    expect(mockPush).toHaveBeenCalledWith('/login')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  //Rendering

  //purpose: ensures page title and add button are rendered
  //inputs: account in localStorage, component mounts
  //outputs: "My Addresses" title and "Add New Address" button shown on page
  it('renders page title and add button', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))

    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.find('h1').text()).toBe('My Addresses')
    expect(wrapper.find('.add-button').text()).toBe('Add New Address')
  })

  //purpose: ensures message is shown when no addresses are returned
  //inputs: API returns empty list
  //outputs: "No addresses found." shown and no address cards rendered
  it('shows "No addresses found." when address list is empty', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    })

    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.find('.no-addresses').exists()).toBe(true)
    expect(wrapper.find('.no-addresses').text()).toBe('No addresses found.')
    expect(wrapper.findAll('.address-card')).toHaveLength(0)
  })

  //purpose: ensures addresses are rendered correctly after fetch
  //inputs: API returns list of addresses
  //outputs: address details shown in correct format on page
  it('renders addresses after fetch', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))

    const wrapper = mountComponent()
    await flushPromises()

    const cards = wrapper.findAll('.address-card')

    expect(cards).toHaveLength(2)
    expect(wrapper.text()).toContain('Test Street 1')
    expect(wrapper.text()).toContain('Apartment 2')
    expect(wrapper.text()).toContain('Tromsø, Troms 9000')
    expect(wrapper.text()).toContain('Phone: 12345678')
    expect(wrapper.text()).toContain('Second Street 5')
    expect(wrapper.text()).toContain('Oslo, Oslo 0150')
  })

  //loadAddresses

  //purpose: ensures fetch is called with correct endpoint on mount
  //inputs: component mounts with account in localStorage
  //outputs: fetch called with /accounts/1/addresses/
  it('calls fetch with the correct endpoint on mount', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))

    mountComponent()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/accounts/1/addresses/'
    )
  })

  //purpose: logs error when response is not ok
  //inputs: API returns response with ok: false
  //outputs: error logged and no addresses rendered
  it('logs an error when fetch response is not ok', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockFetch.mockResolvedValue({
      ok: false,
      json: vi.fn(),
    })

    mountComponent()
    await flushPromises()

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load addresses')

    consoleSpy.mockRestore()
  })

  //purpose: logs error when fetch throws
  //inputs: API throws error during fetch
  //outputs: error logged and no addresses rendered
  it('logs an error when fetch throws', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Network error')

    mockFetch.mockRejectedValue(error)

    mountComponent()
    await flushPromises()

    expect(consoleSpy).toHaveBeenCalledWith('Error loading addresses:', error)

    consoleSpy.mockRestore()
  })

  //Navigation

  //purpose: ensures user is redirected to edit page with correct query when Edit button is clicked
  //inputs: user clicks Edit on first address card
  //outputs: router.push called with /address?edit=10
  it('redirects to edit page when Edit is clicked', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))

    const wrapper = mountComponent()
    await flushPromises()

    const firstEditButton = wrapper.findAll('.address-actions button')[0]
    await firstEditButton.trigger('click')

    expect(mockPush).toHaveBeenCalledWith('/address?edit=10')
  })

  //deleteAddress

  //purpose: ensures address is not deleted if user cancels confirmation
  //inputs: user clicks delete but cancels confirm dialog
  //outputs: fetch not called, address still rendered
  it('does not delete address when confirm is cancelled', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))
    vi.mocked(window.confirm).mockReturnValue(false)

    const wrapper = mountComponent()
    await flushPromises()

    const deleteButton = wrapper.findAll('.address-actions button')[1]
    await deleteButton.trigger('click')
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledTimes(1) // only initial GET
    expect(wrapper.findAll('.address-card')).toHaveLength(2)
  })

  //purpose: ensures address is deleted when user confirms and response is ok
  //inputs: user clicks delete and accepts confirm dialog, API returns ok
  //outputs: fetch called with correct endpoint and method, address removed from page
  it('deletes address when confirm is accepted and response is ok', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))
    vi.mocked(window.confirm).mockReturnValue(true)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockAddresses),
      })
      .mockResolvedValueOnce({
        ok: true,
      })

    const wrapper = mountComponent()
    await flushPromises()

    const deleteButton = wrapper.findAll('.address-actions button')[1]
    await deleteButton.trigger('click')
    await flushPromises()

    expect(mockFetch).toHaveBeenLastCalledWith(
      'http://127.0.0.1:8000/api/accounts/1/addresses/10/',
      {
        method: 'DELETE',
      }
    )

    expect(wrapper.findAll('.address-card')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Test Street 1')
    expect(wrapper.text()).toContain('Second Street 5')
  })

  //purpose: shows alert when delete response is not ok
  //inputs: user clicks delete and accepts confirm dialog, API returns not ok
  //outputs: alert shown and address still rendered 
  it('shows alert when delete response is not ok', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))
    vi.mocked(window.confirm).mockReturnValue(true)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockAddresses),
      })
      .mockResolvedValueOnce({
        ok: false,
      })

    const wrapper = mountComponent()
    await flushPromises()

    const deleteButton = wrapper.findAll('.address-actions button')[1]
    await deleteButton.trigger('click')
    await flushPromises()

    expect(window.alert).toHaveBeenCalledWith('Failed to delete address')
    expect(wrapper.findAll('.address-card')).toHaveLength(2)
  })

  //purpose: logs error when delete throws
  //inputs: user clicks delete and accepts confirm dialog, API throws error
  //outputs: error logged and address still rendered
  it('logs an error when delete throws', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))
    vi.mocked(window.confirm).mockReturnValue(true)

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Delete failed')

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockAddresses),
      })
      .mockRejectedValueOnce(error)

    const wrapper = mountComponent()
    await flushPromises()

    const deleteButton = wrapper.findAll('.address-actions button')[1]
    await deleteButton.trigger('click')
    await flushPromises()

    expect(consoleSpy).toHaveBeenCalledWith('Error deleting address:', error)

    consoleSpy.mockRestore()
  })
})

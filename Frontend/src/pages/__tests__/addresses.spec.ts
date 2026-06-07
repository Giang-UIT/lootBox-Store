import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Addresses from '../addresses.vue'
import api from '../../api'

vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
  },
}))

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

const mountComponent = () => mount(Addresses)

describe('Addresses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    vi.mocked(api.get).mockResolvedValue({ status: 200, data: { json: mockAddresses } })
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
    expect(api.get).not.toHaveBeenCalled()
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

    vi.mocked(api.get).mockResolvedValue({ status: 200, data: { json: [] } })

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

  //purpose: ensures api.get is called with correct endpoint on mount
  //inputs: component mounts with account in localStorage
  //outputs: api.get called with /accounts/1/addresses/
  it('calls api.get with the correct endpoint on mount', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))

    mountComponent()
    await flushPromises()

    expect(api.get).toHaveBeenCalledWith('/accounts/1/addresses/')
  })

  //purpose: logs error when response is not ok
  //inputs: API returns response with falsy status
  //outputs: error logged and no addresses rendered
  it('logs an error when api.get response is not ok', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(api.get).mockResolvedValue({ status: 0, data: {} })

    mountComponent()
    await flushPromises()

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load addresses')

    consoleSpy.mockRestore()
  })

  //purpose: logs error when api.get throws
  //inputs: api.get rejects with an error
  //outputs: error logged and no addresses rendered
  it('logs an error when api.get throws', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Network error')

    vi.mocked(api.get).mockRejectedValue(error)

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
  //outputs: api.get called only once (for initial load), address still rendered
  it('does not delete address when confirm is cancelled', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))
    vi.mocked(window.confirm).mockReturnValue(false)

    const wrapper = mountComponent()
    await flushPromises()

    const deleteButton = wrapper.findAll('.address-actions button')[1]
    await deleteButton.trigger('click')
    await flushPromises()

    expect(api.get).toHaveBeenCalledTimes(1) // only initial GET
    expect(wrapper.findAll('.address-card')).toHaveLength(2)
  })

  //purpose: ensures address is deleted when user confirms and response is ok
  //inputs: user clicks delete and accepts confirm dialog, API returns ok
  //outputs: api.get called with correct endpoint and method, address removed from page
  it('deletes address when confirm is accepted and response is ok', async () => {
    localStorage.setItem('account', JSON.stringify(mockAccount))
    vi.mocked(window.confirm).mockReturnValue(true)

    vi.mocked(api.get)
      .mockResolvedValueOnce({ status: 200, data: { json: mockAddresses } })
      .mockResolvedValueOnce({ status: 200 })

    const wrapper = mountComponent()
    await flushPromises()

    const deleteButton = wrapper.findAll('.address-actions button')[1]
    await deleteButton.trigger('click')
    await flushPromises()

    expect(api.get).toHaveBeenLastCalledWith(
      '/accounts/1/addresses/10/',
      { method: 'DELETE' }
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

    vi.mocked(api.get)
      .mockResolvedValueOnce({ status: 200, data: { json: mockAddresses } })
      .mockResolvedValueOnce({ status: 0 })

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

    vi.mocked(api.get)
      .mockResolvedValueOnce({ status: 200, data: { json: mockAddresses } })
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

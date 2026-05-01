import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import Login from '../Login.vue'
import api from '../../api'

// Mock the API
vi.mock('../../api', () => ({
  default: {
    post: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.location
delete (window as any).location
window.location = { href: '' } as any

describe('Login.vue', () => {
  let router: any
  let wrapper: any

  beforeEach(() => {
    // Create router
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'Home' },
        { path: '/createaccount', name: 'CreateAccount' },
      ],
    })

    // Create wrapper
    wrapper = mount(Login, {
      global: {
        plugins: [router, createPinia()],
      },
    })

    // Reset mocks
    vi.clearAllMocks()
    localStorageMock.setItem.mockClear()
    localStorageMock.getItem.mockClear()
  })

  //purpose: checks if login form renders correctly
  //inputs: none
  //outputs: form elements are present
  it('renders the login form', () => {
    expect(wrapper.find('h1').text()).toBe('Login')
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Login')
    expect(wrapper.find('button.createAccount').text()).toBe('Create Account')
  })

  //purpose: verifies input handling for email and password fields
  //inputs: user types email and password
  //outputs: input values are updated in the form
  it('updates email and password on input', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')

    expect(emailInput.element.value).toBe('test@example.com')
    expect(passwordInput.element.value).toBe('password123')
  })

  //purpose: tests successful login flow
  //inputs: user submits valid credentials, API returns token and account info
  //outputs: token and account stored in localStorage, welcome message shown, redirected to home
  it('calls login on form submit and succeeds', async () => {
    const mockResponse = {
      data: {
        token: 'fake-token',
        account: { name: 'Test User' },
      },
    }
    ;(api.post as any).mockResolvedValue(mockResponse)

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    await form.trigger('submit.prevent')

    expect(api.post).toHaveBeenCalledWith('/login/', {
      email: 'test@example.com',
      password: 'password123',
    })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'fake-token')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('account', JSON.stringify({ name: 'Test User' }))
    expect(wrapper.find('p').text()).toBe('Welcome, Test User!')
    expect(window.location.href).toBe('/')
  })

  //purpose: tests error handling in login flow
  //inputs: user submits invalid credentials, API returns error
  //outputs: error message displayed to user
  it('displays error message on login failure', async () => {
    const mockError = new Error('Invalid credentials')
    ;(api.post as any).mockRejectedValue(mockError)

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await emailInput.setValue('wrong@example.com')
    await passwordInput.setValue('wrongpassword')
    await form.trigger('submit.prevent')

    expect(api.post).toHaveBeenCalledWith('/login/', {
      email: 'wrong@example.com',
      password: 'wrongpassword',
    })
    expect(wrapper.find('p').text()).toBe('Invalid credentials')
  })

  //purpose: tests navigation to create account page
  //inputs: user clicks "Create Account" button
  //outputs: router navigates to /createaccount
  it('navigates to create account page on button click', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const createAccountButton = wrapper.find('button.createAccount')
    await createAccountButton.trigger('click')

    expect(pushSpy).toHaveBeenCalledWith('/createaccount')
  })
})
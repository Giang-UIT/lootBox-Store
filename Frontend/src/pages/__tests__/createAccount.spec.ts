import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import CreateAccount from '../CreateAccount.vue'
import api from '../../api'

// Mock the API
vi.mock('../../api', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('CreateAccount.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(CreateAccount, {
      global: {
        plugins: [createPinia()],
      },
    })

    // Reset mocks
    vi.clearAllMocks()
  })

  //purpose: checks if create account form renders correctly
  //inputs: none
  //outputs: form elements are present
  it('renders the create account form', () => {
    expect(wrapper.find('h1').text()).toBe('Create Account')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Create Account')
  })

  //purpose: checks if form inputs update correctly
  //inputs: user types in name, email and password
  //outputs: input values are updated
  it('updates name, email and password on input', async () => {
    const nameInput = wrapper.find('input[type="text"]')
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await nameInput.setValue('John Doe')
    await emailInput.setValue('john@example.com')
    await passwordInput.setValue('password123')

    expect(nameInput.element.value).toBe('John Doe')
    expect(emailInput.element.value).toBe('john@example.com')
    expect(passwordInput.element.value).toBe('password123')
  })

  //purpose: checks if createAccount method is called on form submit and handles success response
  //inputs: user fills form and submits
  //outputs: API is called with correct data, success message is shown and form is cleared
  it('calls createAccount on form submit and succeeds', async () => {
    const mockResponse = {
      data: {
        id: 1,
        name: 'John Doe',
      },
    }
    ;(api.post as any).mockResolvedValue(mockResponse)

    const nameInput = wrapper.find('input[type="text"]')
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await nameInput.setValue('John Doe')
    await emailInput.setValue('john@example.com')
    await passwordInput.setValue('password123')
    await form.trigger('submit.prevent')

    expect(api.post).toHaveBeenCalledWith('/signup/', {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    })
    expect(wrapper.find('p').text()).toBe('Account created! ID: 1, Name: John Doe')
    // Check form is cleared
    expect(nameInput.element.value).toBe('')
    expect(emailInput.element.value).toBe('')
    expect(passwordInput.element.value).toBe('')
  })

  //purpose: checks if error message is displayed on create account failure
  //inputs: user fills form and submits with existing email
  //outputs: error message is shown
  it('displays error message on create account failure', async () => {
    const mockError = new Error('Email already exists')
    ;(api.post as any).mockRejectedValue(mockError)

    const nameInput = wrapper.find('input[type="text"]')
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await nameInput.setValue('Jane Doe')
    await emailInput.setValue('jane@example.com')
    await passwordInput.setValue('password456')
    await form.trigger('submit.prevent')

    expect(api.post).toHaveBeenCalledWith('/signup/', {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password456',
    })
    expect(wrapper.find('p').text()).toBe('Email already exists')
  })
})
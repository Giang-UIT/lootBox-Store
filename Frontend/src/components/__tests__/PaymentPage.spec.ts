import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PaymentPage from '../../pages/paymentPage.vue'
import api from '../../api'
import { getCurrentUser } from '../../utils/auth.ts'

const pushMock = vi.fn()
let beforeRouteLeaveGuard: (() => Promise<void> | void) | null = null

vi.mock('../../api', () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}))

vi.mock('../../utils/auth.ts', () => ({
	getCurrentUser: vi.fn(),
}))

vi.mock('vue-router', async () => {
	const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
	return {
		...actual,
		useRouter: () => ({ push: pushMock }),
		onBeforeRouteLeave: (guard: () => Promise<void> | void) => {
			beforeRouteLeaveGuard = guard
		},
	}
})

const mockCartItems = [
	{ product_id: 1, name: 'Loot', price: '10.00', quantity: 2 },
	{ product_id: 2, name: 'Box', price: '20.00', quantity: 1 },
]

const mockAddresses = [
	{
		id: 11,
		account_id: 1,
		phone_number: '+47 11111111',
		line1: 'Main Street 1',
		line2: '',
		city: 'Tromso',
		state: 'Troms',
		postal_code: '9000',
		country: 'Norway',
	},
	{
		id: 12,
		account_id: 1,
		phone_number: '+47 22222222',
		line1: 'Second Street 5',
		line2: 'Floor 2',
		city: 'Tromso',
		state: 'Troms',
		postal_code: '9001',
		country: 'Norway',
	},
]

const mountComponent = () => mount(PaymentPage)

describe('paymentPage.vue', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		beforeRouteLeaveGuard = null

		vi.mocked(getCurrentUser).mockReturnValue({ id: 1, admin_status: false } as any)
		vi.mocked(api.get).mockResolvedValue({ data: { items: mockCartItems } })
		vi.mocked(api.post).mockResolvedValue({})

		vi.spyOn(window, 'alert').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})

		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockAddresses,
			}),
		)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	//purpose: verifies payment page loads cart and address data for logged-in user
	//inputs: valid account, cart API response, address fetch response
	//outputs: order summary and address list render with computed total
	it('loads payment data and renders summary and addresses', async () => {
		const wrapper = mountComponent()
		await flushPromises()

		expect(api.get).toHaveBeenCalledWith('/cart/1/')
		expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/api/accounts/1/addresses/')
		expect(wrapper.text()).toContain('Order Summary')
		expect(wrapper.text()).toContain('Delivery Address')
		expect(wrapper.text()).toContain('€40.00')
		expect(wrapper.text()).toContain('Main Street 1')
	})

	//purpose: verifies page protection when user is not logged in
	//inputs: getCurrentUser returns null
	//outputs: alert shown and user redirected to login page
	it('alerts and redirects to login if account is missing', async () => {
		vi.mocked(getCurrentUser).mockReturnValue(null)

		mountComponent()
		await flushPromises()

		expect(window.alert).toHaveBeenCalledWith('No account found. Please log in.')
		expect(pushMock).toHaveBeenCalledWith('/login')
		expect(api.get).not.toHaveBeenCalled()
		expect(fetch).not.toHaveBeenCalled()
	})

	//purpose: verifies empty cart messaging
	//inputs: cart endpoint returns no items
	//outputs: empty cart text is displayed
	it('shows empty-cart message when no items exist', async () => {
		vi.mocked(api.get).mockResolvedValue({ data: { items: [] } })

		const wrapper = mountComponent()
		await flushPromises()

		expect(wrapper.text()).toContain('Your cart is empty.')
	})

	//purpose: verifies complete purchase button requires both address and items
	//inputs: no addresses available
	//outputs: complete purchase button remains disabled
	it('disables complete purchase when no address is available', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => [],
			}),
		)

		const wrapper = mountComponent()
		await flushPromises()

		const purchaseButton = wrapper.find('.complete-purchase-button')
		expect((purchaseButton.element as HTMLButtonElement).disabled).toBe(true)
		expect(wrapper.text()).toContain('No saved addresses found. Add one to continue.')
	})

	//purpose: verifies address page navigation action
	//inputs: click add/edit address button
	//outputs: router navigates to addresses page
	it('navigates to addresses page when address button is clicked', async () => {
		const wrapper = mountComponent()
		await flushPromises()

		await wrapper.find('.address-button').trigger('click')

		expect(pushMock).toHaveBeenCalledWith('/addresses')
	})

	//purpose: verifies successful purchase completion flow
	//inputs: submit payment form when cart and address are available
	//outputs: confirmation section with order details is shown
	it('completes purchase and renders confirmation details', async () => {
		const wrapper = mountComponent()
		await flushPromises()

		await wrapper.find('.card-form').trigger('submit')
		await flushPromises()

		expect(wrapper.text()).toContain('Thank you for your purchase!')
		expect(wrapper.text()).toContain('Order Information')
		expect(wrapper.text()).toContain('Delivery Address')
		expect(wrapper.text()).toContain('Loot x 2')
		expect(wrapper.text()).toContain('Total:')
	})

	//purpose: verifies cart checkout call runs when leaving after completed purchase
	//inputs: complete purchase, then trigger route-leave guard
	//outputs: checkout endpoint called once with account id
	it('finalizes checkout on route leave after purchase completion', async () => {
		const wrapper = mountComponent()
		await flushPromises()

		await wrapper.find('.card-form').trigger('submit')
		await flushPromises()

		expect(beforeRouteLeaveGuard).not.toBeNull()
		await beforeRouteLeaveGuard?.()

		expect(api.post).toHaveBeenCalledWith('/cart/checkout/', { account_id: 1 })
		wrapper.unmount()
	})

	//purpose: ensures page exit does not checkout cart before purchase is completed
	//inputs: mount and immediately trigger leave guard
	//outputs: checkout endpoint is not called
	it('does not finalize checkout when purchase has not been completed', async () => {
		mountComponent()
		await flushPromises()

		await beforeRouteLeaveGuard?.()

		expect(api.post).not.toHaveBeenCalled()
	})

	//purpose: verifies checkout failure is handled safely during exit
	//inputs: complete purchase and checkout endpoint rejects
	//outputs: error logged without crashing
	it('handles checkout errors during page exit', async () => {
		vi.mocked(api.post).mockRejectedValue(new Error('checkout failed'))

		const wrapper = mountComponent()
		await flushPromises()

		await wrapper.find('.card-form').trigger('submit')
		await flushPromises()

		await beforeRouteLeaveGuard?.()

		expect(console.error).toHaveBeenCalledWith(
			'Failed to clear cart on page exit:',
			expect.any(Error),
		)
		wrapper.unmount()
	})
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AdminAccount from '../../pages/adminAccount.vue'
import api from '@/api'

vi.mock('@/api', () => ({
	default: {
		get: vi.fn(),
		delete: vi.fn(),
		put: vi.fn(),
	},
}))

const mockAccounts = [
	{
		id: 1,
		name: 'admin',
		password: 'secret',
		email: 'admin@admin.com',
		admin_status: true,
		time_created: '2026-05-01 10:00:00',
	},
	{
		id: 2,
		name: 'user',
		password: 'secret2',
		email: 'user@user.com',
		admin_status: false,
		time_created: '2026-05-01 10:05:00',
	},
]

const mountComponent = () =>
	mount(AdminAccount, {
		global: {
			stubs: {
				'v-virtual-scroll': {
					props: ['items'],
					template: '<div><slot v-for="entry in items" :item="entry" /></div>',
				},
				'v-list-item': {
					props: ['title', 'subtitle'],
					template: `
						<div class="list-item">
							<span class="item-title">{{ title }}</span>
							<span class="item-subtitle">{{ subtitle }}</span>
							<slot name="prepend" />
							<slot name="append" />
						</div>
					`,
				},
				'v-btn': {
					emits: ['click'],
					template: '<button class="v-btn" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
				},
				'v-text-field': {
					props: ['modelValue', 'label'],
					emits: ['update:modelValue'],
					template: `
						<label>
							{{ label }}
							<input
								class="text-field-input"
								:value="modelValue"
								@input="$emit('update:modelValue', $event.target.value)"
							/>
						</label>
					`,
				},
			},
		},
	})

describe('adminAccount.vue', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(api.get).mockResolvedValue({ data: { accounts: mockAccounts } })
		vi.mocked(api.delete).mockResolvedValue({ status: 200 })
		vi.mocked(api.put).mockResolvedValue({ status: 200 })
	})

	//purpose: verifies account data is fetched and displayed on mount
	//inputs: backend returns two accounts
	//outputs: api.get called and list contains account emails
	it('fetches users on mount and renders account list', async () => {
		const wrapper = mountComponent()
		await flushPromises()

		expect(api.get).toHaveBeenCalledWith('/getUser/')
		expect(wrapper.text()).toContain('Account admin')
		expect(wrapper.text()).toContain('admin@admin.com')
		expect(wrapper.text()).toContain('user@user.com')
	})

	//purpose: verifies selecting an account loads its details in form fields
	//inputs: click pencil button for first account
	//outputs: text fields contain selected account values
	it('loads account details into input fields when edit icon is clicked', async () => {
		const wrapper = mountComponent()
		await flushPromises()

		const editButtons = wrapper.findAll('button[icon="mdi-pencil"]')
		await editButtons[0].trigger('click')
		await flushPromises()

		const inputs = wrapper.findAll('.text-field-input')
		expect((inputs[0].element as HTMLInputElement).value).toBe('admin@admin.com')
		expect((inputs[1].element as HTMLInputElement).value).toBe('secret')
		expect((inputs[2].element as HTMLInputElement).value).toBe('admin')
	})

	//purpose: verifies delete action requires explicit confirm/cancel state
	//inputs: click delete account then cancel
	//outputs: confirm buttons appear and then disappear after cancel
	it('shows and hides delete confirmation controls', async () => {
		const wrapper = mountComponent()
		await flushPromises()

		const deleteButton = wrapper.findAll('button').find(btn => btn.text() === 'Delete account')
		await deleteButton!.trigger('click')
		await flushPromises()

		expect(wrapper.findAll('button').some(btn => btn.text() === 'Confirm')).toBe(true)
		expect(wrapper.findAll('button').some(btn => btn.text() === 'Cancel')).toBe(true)

		const cancelButton = wrapper.findAll('button').find(btn => btn.text() === 'Cancel')
		await cancelButton!.trigger('click')
		await flushPromises()

		expect(wrapper.findAll('button').some(btn => btn.text() === 'Delete account')).toBe(true)
		expect(wrapper.findAll('button').some(btn => btn.text() === 'Confirm')).toBe(false)
	})

	//purpose: verifies delete request is sent after confirmation
	//inputs: select account, click delete account, then confirm
	//outputs: api.delete called with selected account id and success message shown
	it('deletes selected account when confirm is clicked', async () => {
		const wrapper = mountComponent()
		await flushPromises()

		const editButtons = wrapper.findAll('button[icon="mdi-pencil"]')
		await editButtons[0].trigger('click')

		const deleteButton = wrapper.findAll('button').find(btn => btn.text() === 'Delete account')
		await deleteButton!.trigger('click')
		await flushPromises()

		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === 'Confirm')
		await confirmButton!.trigger('click')
		await flushPromises()

		expect(api.delete).toHaveBeenCalledWith('/deleteUser/1')
		expect(api.get).toHaveBeenCalledTimes(2)
		expect(wrapper.text()).toContain('The account is successfully deleted')
	})

	//purpose: validates edit account frontend checks required fields
	//inputs: select account, clear one field, click edit account, then confirm
	//outputs: no api.put call and validation message shown
	it('blocks edit when required fields are empty', async () => {
		const wrapper = mountComponent()
		await flushPromises()

		const editButtons = wrapper.findAll('button[icon="mdi-pencil"]')
		await editButtons[0].trigger('click')
		await flushPromises()

		const inputs = wrapper.findAll('.text-field-input')
		await inputs[2].setValue('')

		const editAccountButton = wrapper.findAll('button').find(btn => btn.text() === 'Edit account')
		await editAccountButton!.trigger('click')
		await flushPromises()

		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === 'Confirm')
		await confirmButton!.trigger('click')
		await flushPromises()

		expect(api.put).not.toHaveBeenCalled()
		expect(wrapper.text()).toContain('name, email or password cannot be empy!')
	})

	//purpose: verifies successful account edit request
	//inputs: select account, modify name, click edit account, then confirm
	//outputs: api.put called and success message rendered
	it('edits account successfully when fields are valid', async () => {
		const wrapper = mountComponent()
		await flushPromises()

		const editButtons = wrapper.findAll('button[icon="mdi-pencil"]')
		await editButtons[0].trigger('click')
		await flushPromises()

		const inputs = wrapper.findAll('.text-field-input')
		await inputs[2].setValue('updated-admin')

		const editAccountButton = wrapper.findAll('button').find(btn => btn.text() === 'Edit account')
		await editAccountButton!.trigger('click')
		await flushPromises()

		const confirmButton = wrapper.findAll('button').find(btn => btn.text() === 'Confirm')
		await confirmButton!.trigger('click')
		await flushPromises()

		expect(api.put).toHaveBeenCalledWith('/editAccount/', expect.objectContaining({
			id: 1,
			name: 'updated-admin',
			email: 'admin@admin.com',
		}))
		expect(wrapper.text()).toContain('The account is successfully edited')
	})

	//purpose: verifies user fetch errors are shown to the user
	//inputs: api.get fails with status code
	//outputs: error message contains failing status code
	it('shows fetch error status when loading users fails', async () => {
		vi.mocked(api.get).mockRejectedValue({ status: 500 })

		const wrapper = mountComponent()
		await flushPromises()

		expect(wrapper.text()).toContain('an error has occured. Status code: 500')
	})
})

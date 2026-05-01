import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ProductManagement from '../ProductManagement.vue' 
import api from '../../api'

vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockProduct = {
  id: 99,
  name: 'Admin Box',
  description: 'Special box',
  price: '100.00',
  stock: 10,
  origin: 'Norway',
  image: 'admin.jpg'
}

describe('ProductManagement.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  //MODE SWITCHING AND LOOKUPS

  //purpose: verify default state is "create mode"
  //inputs: mount component
  //outputs: shows create UI and no delete button
  it('starts in "Create New" mode by default', () => {
    const wrapper = mount(ProductManagement)

    expect(wrapper.text()).toContain('Create New Product')
    expect(wrapper.find('button.primary').text()).toBe('Create Product')
    expect(wrapper.find('button.danger').exists()).toBe(false) 
  })

  //purpose: verify loading a product switches to edit mode
  //inputs: enter ID and click load
  //outputs: api.get called and UI switches to edit mode
  it('switches to edit mode when a valid product ID is loaded', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProduct })
    const wrapper = mount(ProductManagement)

    const searchInput = wrapper.find('.search-row input')
    await searchInput.setValue('99')

    const loadButton = wrapper.findAll('.search-row button')[0]
    await loadButton.trigger('click')
    await flushPromises()

    expect(api.get).toHaveBeenCalledWith('/products/99/')
    expect(wrapper.text()).toContain('Editing Product #99 — Admin Box')
    expect(wrapper.find('button.primary').text()).toBe('Save Changes')
    expect(wrapper.find('button.danger').exists()).toBe(true)
  })

  //CREATING PRODUCTS 

  //purpose: validate required fields when creating product
  //inputs: click create with empty form
  //outputs: shows error and prevents api call
  it('shows an error if trying to create without name and price', async () => {
    const wrapper = mount(ProductManagement)
    
    await wrapper.find('button.primary').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Name and Price are required')
    expect(api.post).not.toHaveBeenCalled()
  })

  //purpose: verify successful product creation
  //inputs: fill form and submit
  //outputs: api.post called with correct payload
  it('calls api.post to create a new product', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 100, name: 'New Box' } })
    const wrapper = mount(ProductManagement)

    const inputs = wrapper.findAll('.form input')
    await inputs[0].setValue('New Box') 
    await inputs[2].setValue('50.00')   

    await wrapper.find('button.primary').trigger('click')
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith('/products/', {
      name: 'New Box',
      description: '',
      price: '50.00',
      stock: 0,
      origin: '',
      image: ''
    })

    expect(wrapper.text()).toContain('Product #100 "New Box" created!')
  })

  //UPDATING PRODUCTS 

  //purpose: verify updating sends only modified fields
  //inputs: load product, modify one field, save
  //outputs: api.patch called with only changed field
  it('calls api.patch to update an existing product', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProduct })
    vi.mocked(api.patch).mockResolvedValue({ data: { ...mockProduct, price: '120.00' } })
    
    const wrapper = mount(ProductManagement)

    await wrapper.find('.search-row input').setValue('99')
    await wrapper.findAll('.search-row button')[0].trigger('click')
    await flushPromises()

    const inputs = wrapper.findAll('.form input')
    await inputs[2].setValue('120.00') 

    await wrapper.find('button.primary').trigger('click')
    await flushPromises()

    expect(api.patch).toHaveBeenCalledWith('/products/99/', {
      price: '120.00'
    })

    expect(wrapper.text()).toContain('Product #99 updated successfully.')
  })

  //DELETING PRODUCTS 

  //purpose: verify delete workflow
  //inputs: load product and click delete
  //outputs: confirm shown and api.delete called
  it('calls api.delete and window.confirm when delete button is clicked', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProduct })
    vi.mocked(api.delete).mockResolvedValue({})
    
    const wrapper = mount(ProductManagement)

    await wrapper.find('.search-row input').setValue('99')
    await wrapper.findAll('.search-row button')[0].trigger('click')
    await flushPromises()

    await wrapper.find('button.danger').trigger('click')
    await flushPromises()

    expect(window.confirm).toHaveBeenCalledWith('Delete product #99 "Admin Box"?')
    expect(api.delete).toHaveBeenCalledWith('/products/99/')
    expect(wrapper.text()).toContain('Product #99 deleted.')
    expect(wrapper.text()).toContain('Create New Product')
  })

  //EDGE CASES 

  //purpose: verify handling of non-existent product
  //inputs: api returns 404
  //outputs: error message displayed
  it('shows an error when looking up a product that does not exist', async () => {
    vi.mocked(api.get).mockRejectedValue({ response: { status: 404 } })
    
    const wrapper = mount(ProductManagement)

    await wrapper.find('.search-row input').setValue('999')
    await wrapper.findAll('.search-row button')[0].trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('No product with ID 999 found.')
  })

  //purpose: verify reset button clears state
  //inputs: load product then click reset
  //outputs: returns to create mode and clears data
  it('clears the form and returns to create mode when reset is clicked', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProduct })

    const wrapper = mount(ProductManagement)
    
    await wrapper.find('.search-row input').setValue('99')
    await wrapper.findAll('.search-row button')[0].trigger('click')
    await flushPromises()

    await wrapper.find('button.secondary').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Create New Product')
    expect(wrapper.text()).not.toContain('Editing Product #99')
  })

  //purpose: verify no patch is sent if nothing changed
  //inputs: load product and click save without edits
  //outputs: no api.patch call and message shown
  it('does not send patch if no fields changed', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProduct })

    const wrapper = mount(ProductManagement)

    await wrapper.find('.search-row input').setValue('99')
    await wrapper.findAll('.search-row button')[0].trigger('click')
    await flushPromises()

    await wrapper.find('button.primary').trigger('click')
    await flushPromises()

    expect(api.patch).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Nothing changed')
  })

  //purpose: verify error handling during product creation
  //inputs: api.post fails
  //outputs: error message displayed
  it('handles api error on create', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('fail'))

    const wrapper = mount(ProductManagement)

    const inputs = wrapper.findAll('.form input')
    await inputs[0].setValue('Box')
    await inputs[2].setValue('10')

    await wrapper.find('button.primary').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('fail')
  })
})
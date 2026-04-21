<script setup lang="ts">
import { ref, computed } from 'vue'
import api from '../api'

// Search / selection state
const searchId = ref('')
const selectedProduct = ref<any>(null)
const loadError = ref('')
const statusMsg = ref('')

// Form fields
const formName = ref('')
const formDescription = ref('')
const formPrice = ref('')
const formStock = ref('')
const formOrigin = ref('')
const formImage = ref('')

// Boolean for checking if a field is edited, used to remove placeholder
const isEditing = computed(() => selectedProduct.value !== null)

// Look up a product by ID
async function lookupProduct() {
  statusMsg.value = ''
  loadError.value = ''
  selectedProduct.value = null
  clearForm()

  const id = searchId.value.trim()      // white trim
  if (!id) return                       // empty → "create new" mode

  try {
    const { data } = await api.get(`/products/${id}/`)
    selectedProduct.value = data
    clearForm()
  } catch (e: any) {
    if (e.response?.status === 404) {
      loadError.value = `No product with ID ${id} found.`
    } else {
      loadError.value = e.message
    }
  }
}

// Save: create or update
async function saveProduct() {
  statusMsg.value = ''
  loadError.value = ''

  if (isEditing.value) {
    // UPDATE — only send fields the user actually changed
    const body: Record<string, any> = {}
    if (formName.value)        body.name = formName.value
    if (formDescription.value) body.description = formDescription.value
    if (formPrice.value)       body.price = formPrice.value
    if (formStock.value)       body.stock = Number(formStock.value)
    if (formOrigin.value)      body.origin = formOrigin.value
    if (formImage.value)       body.image = formImage.value

    // sanity check for PATCH request
    if (Object.keys(body).length === 0) {
      statusMsg.value = 'Nothing changed — edit at least one field.'
      return
    }

    try {
      const { data: updated } = await api.patch(
        `/products/${selectedProduct.value.id}/`,
        body,
      )
      selectedProduct.value = updated
      clearForm()
      statusMsg.value = `Product #${updated.id} updated successfully.`
    } catch (e: any) {
      loadError.value = e.message
    }
  } else {
    // CREATE — require at least name and price
    if (!formName.value || !formPrice.value) {
      loadError.value = 'Name and Price are required to create a new product.'
      return
    }

    try {
      const { data: created } = await api.post('/products/', {
        name: formName.value,
        description: formDescription.value,
        price: formPrice.value,
        stock: formStock.value ? Number(formStock.value) : 0,
        origin: formOrigin.value,
        image: formImage.value,
      })
      statusMsg.value = `Product #${created.id} "${created.name}" created!`
      clearForm()
      searchId.value = ''
    } catch (e: any) {
      loadError.value = e.message
    }
  }
}

// Delete selected product
async function deleteProduct() {
  if (!selectedProduct.value) return
  statusMsg.value = ''
  loadError.value = ''

  const id = selectedProduct.value.id
  if (!confirm(`Delete product #${id} "${selectedProduct.value.name}"?`)) return

  try {
    await api.delete(`/products/${id}/`)
    statusMsg.value = `Product #${id} deleted.`
    selectedProduct.value = null
    searchId.value = ''
    clearForm()
  } catch (e: any) {
    loadError.value = e.message
  }
}

function clearForm() {
  formName.value = ''
  formDescription.value = ''
  formPrice.value = ''
  formStock.value = ''
  formOrigin.value = ''
  formImage.value = ''
}

function resetAll() {
  searchId.value = ''
  selectedProduct.value = null
  loadError.value = ''
  statusMsg.value = ''
  clearForm()
}

</script>

<template>
  <div class="mgmt">
    <h1>Product Management</h1>

    <!-- Search bar -->
    <div class="search-row">
      <input
        v-model="searchId"
        type="text"
        placeholder="Enter product ID to edit (leave empty to create new)"
        @keyup.enter="lookupProduct"
      />
      <button @click="lookupProduct">Load</button>
      <button class="secondary" @click="resetAll">Reset</button>
    </div>

    <!-- Status messages -->
    <p v-if="loadError" class="error">{{ loadError }}</p>
    <p v-if="statusMsg" class="success">{{ statusMsg }}</p>

    <!-- Mode indicator -->
    <h2 v-if="isEditing">
      Editing Product #{{ selectedProduct.id }} — {{ selectedProduct.name }}
    </h2>
    <h2 v-else>Create New Product</h2>

    <!-- Form fields -->
    <div class="form">
      <label>
        Name
        <input
          v-model="formName"
          type="text"
          :placeholder="isEditing ? selectedProduct.name : 'Product name (required)'"
        />
      </label>

      <label>
        Description
        <input
          v-model="formDescription"
          type="text"
          :placeholder="isEditing ? selectedProduct.description : 'Description'"
        />
      </label>

      <label>
        Price
        <input
          v-model="formPrice"
          type="text"
          :placeholder="isEditing ? selectedProduct.price : 'Price (required)'"
        />
      </label>

      <label>
        Stock
        <input
          v-model="formStock"
          type="text"
          :placeholder="isEditing ? String(selectedProduct.stock) : 'Stock quantity'"
        />
      </label>

      <label>
        Origin Country
        <input
          v-model="formOrigin"
          type="text"
          :placeholder="isEditing ? selectedProduct.origin : 'Country of origin'"
        />
      </label>
      <label>
       Image URL
       <input
          v-model="formImage"
          type="text"
          :placeholder="isEditing ? selectedProduct.image : 'URL of product picture'"
          />
      </label>
    </div>

    <!-- Action buttons -->
    <div class="actions">
      <button class="primary" @click="saveProduct">
        {{ isEditing ? 'Save Changes' : 'Create Product' }}
      </button>
      <button v-if="isEditing" class="danger" @click="deleteProduct">
        Delete Product
      </button>
    </div>
  </div>
</template>

<style scoped>
.mgmt {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1.5rem;
  font-family: sans-serif;
}

.search-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-row input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.form label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-size: 0.9rem;
}

.form input {
  margin-top: 0.25rem;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  background: #42b883;
}

button:hover { opacity: 0.9; }
button.secondary { background: #666; }
button.primary { background: #42b883; }
button.danger { background: #e74c3c; }

.error { color: #e74c3c; font-weight: 600; }
.success { color: #27ae60; font-weight: 600; }

h2 { margin: 1rem 0 0.5rem; }
</style>

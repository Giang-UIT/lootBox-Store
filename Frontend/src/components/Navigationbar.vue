<template>
  
  <v-container class="nav-container">
    <v-sheet class="logo">
      <v-text>LootBox Store</v-text>
    </v-sheet>

    <!-- Search bar-->
    <v-card>
      <v-autocomplete
      v-model="selectedProduct"
      v-model:search="searchInput"
      :items="filteredItems"
      item-title="title"
      item-value="value"
      :loading="loading"
      autocomplete="off"
      class="mx-auto"
      density="comfortable"
      label="search for a product"
      placeholder="Start typing..."
      style="width: 300px"
      prepend-inner-icon="mdi-magnify"
      hide-details
      hide-no-data
      >

      </v-autocomplete>
    </v-card> 

    <v-sheet class="nav-links">
      <router-link to="/">Products</router-link>
      <router-link v-if="!isAdmin && account" to="/cart">&#128722</router-link>
      <router-link v-if="isAdmin" to="/productmanagement">Product management</router-link>
      <router-link v-if="!isAdmin && account" to="/addresses">Addresses</router-link>

      <!-- added temporarily -->
      <router-link v-if="!account" to="/login">Log in</router-link>
      <button v-else @click="logout" class="logout-btn">Log out</button>
    </v-sheet>
  </v-container>

</template>

<script setup lang="ts">

//checks on re-render of nav-bar if user's admin status = true, used in v-if checks on router links to
//have access control
import { onMounted, computed, ref, watch} from 'vue'
import api from '../api'
import { de, tr } from 'vuetify/locale'
import { filterItems } from 'vuetify/lib/composables/filter.mjs'

//For loading icon
const loading = ref(false)
const products = ref<Product[]>()

//For input from search bar
const searchInput = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

//array of filtered items from products, as { title, value } objects for navigation
const filteredItems = ref<{ title: string; value: number }[]>([])

//the product id. It's used for manipulating product id in the second watcher
const selectedProduct = ref<number | null>(null)

const account = computed(() => {
const raw = localStorage.getItem('account')
return raw ? JSON.parse(raw) : null
})

onMounted(fetchProducts)

//Product object. For the records from product table.
interface Product {
  id: number
  name: string
  description: string
  price: string
  stock: number
  origin: string
  image: string
}

//Delays the search for 300 ms after a key is typed. This is used only for the search bar 
watch(searchInput, (val) => {
  clearTimeout(debounceTimer!)
  try {
    if (!val) {
      filteredItems.value = []
      return
    }
    loading.value = true
    debounceTimer = setTimeout(() => {
      filteredItems.value = products.value
        ?.filter(p => p.name.toLowerCase().includes(val.toLowerCase()))
        .map(p => ({ title: p.name, value: p.id })) ?? []
      loading.value = false
    }, 300) // 300ms delay
  } catch (e: any) { 
    console.log("error with a state change")
  }
})

//Constantly checking if the product id has changed. 
watch(selectedProduct, (id) => {
  if (id !== null) {
    //reloads the entire page with the given ID
    window.location.href = `/product/${id}`
    selectedProduct.value = null
    searchInput.value = ''
  }
})

//Sending a GET request for getting the records from product table
async function fetchProducts() {
  loading.value = true

  try {
    const { data } = await api.get<Product[]>('/products/')
    products.value = data 

  } catch (e: any) {
    console.log("could not get records from product table")
  } finally {
    loading.value = false
  }
  
}

//to access the product management / account management after admin access control is added
//this line can be changed to allow access under database population - admin_status === true/false
const isAdmin = computed(() => account.value?.admin_status === true)

// logout function to clear local storage and redirect to home page
const logout = async () => {
const token = localStorage.getItem('token')
if (token) {
  try {
    await api.post('/logout/', { token })
  } catch (e) {
    console.error('Logout failed', e)
  }
}
localStorage.removeItem('account')
localStorage.removeItem('token')
window.location.href = '/'
}
</script>

<style scoped>


.nav-container {
max-width: 1200px;
margin: auto;
padding: 15px 30px;
display: flex;
justify-content: space-between;
align-items: center;

}

.logo {
font-size: 20px;
font-weight: bold;
}

.nav-links {
display: flex;
gap: 30px;

}

.nav-links a {
color: rgb(2, 2, 2);
text-decoration: none;
font-size: 16px;
transition: 0.2s;
}

.nav-links a:hover {
color: #616461;
}

.nav-links button {
color: rgb(2, 2, 2);
text-decoration: none;
font-size: 16px;
transition: 0.2s;
background: none;
border: none;
cursor: pointer;
}

.nav-links button:hover {
color: #616461;
}

</style>
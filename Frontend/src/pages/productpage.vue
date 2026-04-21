<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

// state stuff
const products = ref<Product[]>([])
const loading = ref(true)
const error = ref('')
const addingProductId = ref<number | null>(null) // keeps track of which button says "adding..."
const accountId = 1 // hardcoded for testing, change later

const router = useRouter()

// load products when page opens
onMounted(fetchProducts)

interface Product {
  id: number
  name: string
  description: string
  price: string
  stock: number
  origin: string
  image: string
}

//Sending a GET request for getting the data from product table
async function fetchProducts() {
  try {
    const { data } = await api.get<Product[]>('/products/')
    products.value = data // This is an array of records from product table

  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// add item to cart
async function addToCart(id: number) {
  addingProductId.value = id // trigger loading state on button
  try {
    await api.post('/cart/add/', {
      account_id: accountId,
      product_id: id,
      quantity: 1
    })
    console.log("added to cart!")
  } catch (error) {
    console.error("error adding to cart", error)
  } finally {
    addingProductId.value = null // reset button
  }
}
</script>

<template>
  <div id="main">
    <v-container class="py-10" style="max-width: 1200px;"> 
      
      <h1 class="text-h4 font-weight-bold mb-8" style="color: #222;">Products</h1>

      <v-row>
        <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="4" lg="3">
          
          <v-card 
            class="product-card d-flex flex-column" 
            elevation="0"
            @click="router.push(`/product/${product.id}`)"
          >
            <div class="pa-5 d-flex flex-column h-100">
              
              <h3 class="text-h6 font-weight-bold mb-3" style="color: #222; line-height: 1.2;">
                {{ product.name }}
              </h3>

              <v-img 
                :src="product.image"
                cover
                class="product-image mb-4"
                style="background-color: #f5f5f5;"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height" style="color: #8d99ae; flex-direction: column;">
                    <v-icon size="40">mdi-camera-off</v-icon>
                    <span style="font-size: 13px; font-weight: bold; margin-top: 8px;">No Image</span>
                  </div>
                </template>
              </v-img>

              <p class="text-body-2 text-grey-darken-2 mb-4 flex-grow-1">
                {{ product.description }}
              </p>

              <div class="font-weight-bold mb-2" style="color: #1a365d; font-size: 1.1rem;">
                ${{ Number(product.price).toFixed(2) }}
              </div>

              <div class="text-caption text-grey-darken-1 mb-4">
                Stock: {{ product.stock }} &middot; Origin: {{ product.origin }}
              </div>

              <div>
                <button 
                  class="add-to-cart-btn"
                  @click.stop="addToCart(product.id)"
                  :disabled="product.stock <= 0 || addingProductId === product.id"
                >
                  <span v-if="addingProductId === product.id">Adding...</span>
                  <span v-else-if="product.stock <= 0">Out of stock</span>
                  <span v-else>Add to Cart</span>
                </button>
              </div>

            </div>
          </v-card>

        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
/* page background */
#main { 
  width: 100%;
  min-height: 100vh;
  background-color: #fafbfc;
}

/* main card styles */
.product-card { 
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

/* card hover fx */
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important;
}

/* image sizing */
.product-image {
  width: 100%;
  height: 250px; 
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

/* btn styles */
.add-to-cart-btn {
  background-color: black;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #333;
}

/* disable state */
.add-to-cart-btn:disabled {
  background-color: #999;
  cursor: not-allowed;
}
</style>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'

interface Product {
  id: number
  name: string
  description: string
  price: string
  stock: number
  origin: string
  image: string
}

const route = useRoute()
const router = useRouter()
const product = ref<Product | null>(null)
const addingProductId = ref<number | null>(null)
const accountId = 1 

async function addToCart(id: number) {
  addingProductId.value = id
  try {
    await api.post('/cart/add/', {
      account_id: accountId,
      product_id: id,
      quantity: 1
    })
  } catch (error) {
    console.error("Error adding to cart", error)
  } finally {
    addingProductId.value = null
  }
}

async function fetchProduct() {
  try {
    const { data } = await api.get(`/products/${route.params.id}/`)
    product.value = data
  } catch (error) {
    console.error("Product not found", error)
    router.push('/products')
  }
}

onMounted(fetchProduct)
</script>

<template>
  <div v-if="product" class="page-wrapper">
    <div class="card">
      
      <div class="image-container">
        <v-img 
          v-if="product.image" 
          :src="product.image" 
          cover
          alt="Product Image" 
        ></v-img>
        <div v-else class="empty-image-placeholder">
          <span>📷 No Image Available</span>
        </div>
      </div>

      <div class="info-container">
        <v-chip
          color="#ffe8ec"
          class="font-weight-bold mb-4 align-self-start"
          style="color: #ff4d6d !important;"
        >
          📦 Only {{ product.stock }} left!
        </v-chip>

        <h1 class="title">{{ product.name }}</h1>
        <p class="price">${{ Number(product.price).toFixed(2) }}</p>
        <p class="description">{{ product.description }}</p>

        <button 
          class="add-to-cart-button" 
          :disabled="product.stock <= 0 || addingProductId === product.id"
          @click="addToCart(product.id)" 
        >
          <span v-if="addingProductId === product.id">Adding... ⏳</span>
          <span v-else-if="product.stock <= 0">Out of stock ❌</span>
          <span v-else>Add to Cart 🛒</span>
        </button>

      </div>

    </div>
  </div>
</template>

<style scoped>
  .page-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    background-color: #fafbfc;
    padding: 2rem;
  }
  .card {
    display: flex;
    background: white;
    border-radius: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    max-width: 900px;
    width: 100%;
    gap: 2rem;
  }
  .image-container {
    flex: 1;
    display: flex;
    background-color: #f0f2f5;
  }
  .empty-image-placeholder {
    width: 100%;
    height: 100%;
    min-height: 400px; 
    display: flex;
    justify-content: center;
    align-items: center;
    color: #8d99ae;
    font-size: 1.2rem;
    font-weight: bold;
  }
  .info-container {
    flex: 1;
    padding: 3rem 3rem 3rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #2b2d42;
    margin: 0 0 0.5rem 0;
  }
  .price {
    font-size: 1.8rem;
    font-weight: 700;
    color: #8d99ae;
    margin: 0 0 1.5rem 0;
  }
  .description {
    font-size: 1.1rem;
    color: #5c677d;
    line-height: 1.6;
    margin-bottom: 2rem;
  }
  .add-to-cart-button {
    margin-top: 1rem;
    padding: 1rem 2rem;
    border: none;
    border-radius: 16px;
    background: #2b2d42;
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
    box-shadow: 0 4px 15px rgba(43, 45, 66, 0.3);
  }
  .add-to-cart-button:hover:not(:disabled) {
    background: #1a1b28;
    transform: translateY(-2px);
  }
  .add-to-cart-button:disabled {
    background: #999;
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
</style>
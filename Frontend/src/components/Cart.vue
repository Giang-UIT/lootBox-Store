<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRouter } from 'vue-router'
import api from '../api'

interface CartItemType {
  product_id: number
  name: string
  price: number | string 
  quantity: number
  image?: string
}

const cart = ref<CartItemType[]>([])
const accountId = 1 // FOR TESTING
const router = useRouter()

async function fetchCart() {
  try {
    const { data } = await api.get(`/cart/${accountId}/`)
    if (data.items) {
      cart.value = data.items
    } else {
      cart.value = []
    }
  } catch (error) {
    console.error("Error fetching cart data:", error)
  }
}

onMounted(() => {
  fetchCart()
})

async function updateQuantity(id: number, currentQuantity: number, change: number) {
  const newQuantity = currentQuantity + change
  if (newQuantity <= 0) {
    removeItem(id)
    return
  }
  const url = change > 0 ? '/cart/add/' : '/cart/decrease/'
  try {
    await api.post(url, { account_id: accountId, product_id: id, quantity: 1 })
    fetchCart() 
  } catch (error) {
    console.error("Error updating quantity", error)
  }
}

async function removeItem(id: number) {
  try {
    await api.post('/cart/remove/', { account_id: accountId, product_id: id })
    fetchCart() 
  } catch (error) {
    console.error("Error removing item", error)
  }
}

async function checkout() {
  try {
    await api.post('/cart/checkout/', { account_id: accountId })
    alert("Checked out successfully!")
    fetchCart() 
  } catch (error) {
    console.error("Error checking out", error)
  }
}

const total = computed(() =>
  cart.value.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
)
</script>

<template>
  <div style="background:#f5f5f5; min-height:100vh; padding:60px 20px;">
    <div style="max-width:1100px; margin:auto;">

      <h1 style="font-size:28px; font-weight:bold; margin-bottom:30px; color: #000000;">
        Shopping Cart
      </h1>

      <div
        v-if="cart.length === 0"
        style="text-align:center; padding:60px; color:#666;"
      >
        Your cart is empty.
      </div>

      <div
        v-else
        style="background:white; padding:30px; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.08);"
      >

        <div v-for="(item, index) in cart" :key="item.product_id">
          <div style="display:flex; gap:20px; padding:25px 0; align-items: center;">
            
            <v-img
              :src="item.image"
              width="100"
              height="100"
              max-width="100"
              cover
              class="rounded-lg cursor-pointer flex-grow-0"
              style="border: 1px solid #f0f0f0; background-color: #f5f5f5;"
              @click="router.push(`/product/${item.product_id}`)"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height" style="color: #8d99ae; flex-direction: column;">
                  <v-icon size="24">mdi-camera-off</v-icon>
                  <span style="font-size: 10px; font-weight: bold; margin-top: 4px; text-align: center;">No Image</span>
                </div>
              </template>
            </v-img>

            <div style="flex:1;">
              <h2 
                @click="router.push(`/product/${item.product_id}`)"
                style="font-size:18px; font-weight:600; margin-bottom:6px; color: black; cursor: pointer;"
                class="hover-title"
              >
                {{ item.name }}
              </h2>

              <div style="font-weight:600; color: #333; font-size: 15px;">
                €{{ Number(item.price).toFixed(2) }}
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:15px;">
              <button
                @click="updateQuantity(item.product_id, item.quantity, -1)"
                style="padding:6px 14px; border:1px solid #ddd; border-radius:6px; background:white; cursor:pointer; color: black; font-size: 16px;"
              >
                -
              </button>

              <span style="min-width:20px; text-align:center; color: black; font-weight: 500;">
                {{ item.quantity }}
              </span>

              <button
                @click="updateQuantity(item.product_id, item.quantity, 1)"
                style="padding:6px 14px; border:1px solid #ddd; border-radius:6px; background:white; cursor:pointer; color: black; font-size: 16px;"
              >
                +
              </button>
            </div>

            <button
              @click="removeItem(item.product_id)"
              style="color:#d11a2a; font-weight:500; background:none; border:none; cursor:pointer; margin-left: 20px; font-size: 15px;"
            >
              Remove
            </button>
          </div>

          <div v-if="index !== cart.length - 1" style="border-bottom:1px solid #f0f0f0;"></div>
        </div>

        <div style="margin-top:10px; padding-top:25px; border-top:1px solid #f0f0f0;">
          <div style="display:flex; justify-content:space-between; margin-bottom:20px; align-items: center;">
            <span style="font-size:18px; font-weight:bold; color: black;">Total</span>
            <span style="font-size:22px; font-weight:bold; color: black;">
              €{{ total.toFixed(2) }}
            </span>
          </div>

          <button
            @click="checkout"
            style="width:100%; padding:16px; background:black; color:white; border:none; border-radius:8px; font-size:16px; font-weight:bold; cursor:pointer;"
            class="checkout-btn"
          >
            Checkout
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.hover-title:hover {
  text-decoration: underline;
}
.checkout-btn {
  transition: background-color 0.2s ease;
}
.checkout-btn:hover {
  background-color: #222 !important;
}
</style>
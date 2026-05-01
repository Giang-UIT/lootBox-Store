<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import api from '../api'
import { getCurrentUser } from '../utils/auth.ts'

type CartItem = {
	product_id: number
	name: string
	price: number | string
	quantity: number
}

type Address = {
	id: number
	account_id: number
	phone_number: string
	line1: string
	line2: string
	city: string
	state: string
	postal_code: string
	country: string
}

const router = useRouter()
const account = getCurrentUser()

const cartItems = ref<CartItem[]>([])
const addresses = ref<Address[]>([])
const selectedAddressId = ref<number | null>(null)
const loading = ref(true)
const purchaseCompleted = ref(false)
const completedAt = ref<Date | null>(null)
const OrderNumber = ref('')
const shouldClearCartOnExit = ref(false)
const checkoutFinalized = ref(false)
const completedOrderItems = ref<CartItem[]>([])
const completedDeliveryAddress = ref<Address | null>(null)
const completedOrderTotal = ref(0)

// at no point in this implementation should the values contained in the
// payment information form be stored on the page, or used in any way by any other function


// computes Total price of the order
const totalPrice = computed(() =>
	cartItems.value.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
)
// loads the full selected address object for the page
const selectedAddress = computed(() =>
	addresses.value.find((address) => address.id === selectedAddressId.value) ?? null,
)
// checks if address is selected, and if cart has items
const canCompletePurchase = computed(
	() => cartItems.value.length > 0 && !!selectedAddress.value,
)
// pricing formatting
function formatPrice(value: number): string {
	return `€${value.toFixed(2)}`
}
// routing for address page button, should addresses need to be created/edited
function openAddressPage() {
	router.push('/addresses')
}
// safety function for checkout, to ensure no dual checkouts, and that cart items get checked out
async function finalizeCheckoutIfNeeded() {
	if (!shouldClearCartOnExit.value || checkoutFinalized.value || !account?.id) {
		return
	}

	try {
		await api.post('/cart/checkout/', { account_id: account.id })
		checkoutFinalized.value = true
	} catch (error) {
		console.error('Failed to clear cart on page exit:', error)
	}
}
// User data load
async function loadPaymentData() {
	// returns user to login page should the user have reached the payment page without being logged in
  // usualy not possible using regular routing
  if (!account?.id) {
		alert('No account found. Please log in.')
		router.push('/login')
		return
	}
  // load cart items and user addresses into the payment page
	try {
		const [cartResponse, addressesResponse] = await Promise.all([
			api.get(`/cart/${account.id}/`),
			fetch(`http://127.0.0.1:8000/api/accounts/${account.id}/addresses/`),
		])

		cartItems.value = cartResponse.data.items ?? []

		if (addressesResponse.ok) {
			const loadedAddresses: Address[] = await addressesResponse.json()
			addresses.value = loadedAddresses
			if (loadedAddresses.length > 0) {
				selectedAddressId.value = loadedAddresses[0].id
			}
		}
	} catch (error) {
		console.error('Error loading payment data:', error)
	} finally {
		loading.value = false
	}
}
// onmount call
onMounted(() => {
	loadPaymentData()
})
// complete purchase handler, stores currently selected address and cart items into page variables
// to be used in order information
function completePurchase(event: Event) {
	if (!canCompletePurchase.value) {
		alert('Please make sure you have products in your order and a delivery address selected.')
		return
	}

	const form = event.target as HTMLFormElement | null
	form?.reset()
	completedOrderItems.value = cartItems.value.map((item) => ({ ...item }))
	completedDeliveryAddress.value = selectedAddress.value ? { ...selectedAddress.value } : null
	completedOrderTotal.value = totalPrice.value
	shouldClearCartOnExit.value = true
	purchaseCompleted.value = true
	completedAt.value = new Date()
	OrderNumber.value = `ON-${Date.now().toString().slice(-6)}`
}
// checkout of cart to clear cart items when user navigates away from the payment page
onBeforeRouteLeave(async () => {
	await finalizeCheckoutIfNeeded()
})
// safety function, should the beforeRouteLeave not checkout the cart
onBeforeUnmount(() => {
	void finalizeCheckoutIfNeeded()
})
</script>

<template>
	<div class="payment-page">
		<div class="payment-container">
			<h1>Payment</h1>

			<div v-if="loading" class="status-message">Loading payment details...</div>

			<template v-else>
				<section class="panel">
					<h2>Order Summary</h2>

					<div v-if="cartItems.length === 0" class="status-message">
						Your cart is empty.
					</div>

					<div v-else class="summary-list">
						<div v-for="item in cartItems" :key="item.product_id" class="summary-row">
							<div class="item-meta">
								<p class="item-name">{{ item.name }}</p>
								<p class="item-qty">Quantity: {{ item.quantity }}</p>
							</div>
							<p class="item-price">{{ formatPrice(Number(item.price) * item.quantity) }}</p>
						</div>

						<div class="total-row">
							<span>Total</span>
							<strong>{{ formatPrice(totalPrice) }}</strong>
						</div>
					</div>
				</section>

				<section class="panel">
					<div class="section-header">
						<h2>Delivery Address</h2>
						<button class="address-button" type="button" @click="openAddressPage">
							{{ addresses.length > 0 ? 'Edit or Add Address' : 'Add Address' }}
						</button>
					</div>

					<div v-if="addresses.length === 0" class="status-message">
						No saved addresses found. Add one to continue.
					</div>

					<div v-else class="address-list">
						<label v-for="address in addresses" :key="address.id" class="address-option">
							<input
								v-model="selectedAddressId"
								:value="address.id"
								type="radio"
								name="delivery-address"
							/>
							<div>
								<p>{{ address.line1 }}</p>
								<p v-if="address.line2">{{ address.line2 }}</p>
								<p>{{ address.city }}, {{ address.state }} {{ address.postal_code }}</p>
								<p>{{ address.country }}</p>
								<p>Phone: {{ address.phone_number }}</p>
							</div>
						</label>
					</div>
				</section>

				<section class="panel card-panel">
					<img
						class="card-icon"
						src="https://cdn0.iconfinder.com/data/icons/finance-glyph-2/33/card-512.png"
						alt="Card information"
					/>

					<p class="payment-note">
						 Demo Only! Do not enter real card details.
					</p>

					<form class="card-form" autocomplete="off" @submit.prevent="completePurchase">
						<div class="card-field">
							<label for="card-name">Name</label>
							<input
								id="card-name"
								name="cardholder"
								type="text"
								placeholder="Name"
								autocomplete="off"
							/>
						</div>

						<div class="card-field">
							<label for="card-number">Card Number</label>
							<input
								id="card-number"
								name="card_number"
								type="text"
								inputmode="numeric"
								placeholder="0000 0000 0000 0000"
								autocomplete="off"
								maxlength="23"
							/>
						</div>

						<div class="card-grid">
							<div class="card-field">
								<label for="expiry">Expiry Date</label>
								<input
									id="expiry"
									name="expiry"
									type="text"
									placeholder="MM/YY"
									autocomplete="off"
									maxlength="5"
								/>
							</div>

							<div class="card-field">
								<label for="cvc">CVC</label>
								<input
									id="cvc"
									name="cvc"
									type="password"
									inputmode="numeric"
									placeholder="123"
									autocomplete="new-password"
									maxlength="4"
								/>
							</div>
						</div>

						<button
							type="submit"
							class="complete-purchase-button"
							:disabled="!canCompletePurchase"
						>
							Complete purchase
						</button>
					</form>
				</section>

				<section v-if="purchaseCompleted" class="panel confirmation-panel">
					<h2>Thank you for your purchase!</h2>
					<p class="confirmation-text">
						Your order has been completed successfully.
					</p>

					<div class="confirmation-grid">
						<div>
							<h3>Order Information</h3>
							<p><strong>Order number:</strong> {{ OrderNumber }}</p>
							<p v-if="completedAt"><strong>Placed:</strong> {{ completedAt.toLocaleString() }}</p>
							<div class="confirmation-order-list">
								<p
									v-for="item in completedOrderItems"
									:key="`confirm-${item.product_id}`"
								>
									{{ item.name }} x {{ item.quantity }} -
									{{ formatPrice(Number(item.price) * item.quantity) }}
								</p>
							</div>
							<p><strong>Total:</strong> {{ formatPrice(completedOrderTotal) }}</p>
						</div>

						<div>
							<h3>Delivery Address</h3>
							<template v-if="completedDeliveryAddress">
								<p>{{ completedDeliveryAddress.line1 }}</p>
								<p v-if="completedDeliveryAddress.line2">{{ completedDeliveryAddress.line2 }}</p>
								<p>
									{{ completedDeliveryAddress.city }}, {{ completedDeliveryAddress.state }}
									{{ completedDeliveryAddress.postal_code }}
								</p>
								<p>{{ completedDeliveryAddress.country }}</p>
								<p>Phone: {{ completedDeliveryAddress.phone_number }}</p>
							</template>
						</div>
					</div>
				</section>
			</template>
		</div>
	</div>
</template>

<style scoped>
.payment-page {
	min-height: 100vh;
	background: #f3f3f3;
	padding: 40px 20px;
}

.payment-container {
	max-width: 900px;
	margin: 0 auto;
	display: grid;
	gap: 20px;
}

h1 {
	margin: 0;
	color: #111;
}

.panel {
	background: #fff;
	border-radius: 12px;
	padding: 24px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

h2,
.confirmation-grid h3 {
	color: #111;
}

h2 {
	margin: 0 0 16px;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
}

.status-message {
	color: #666;
}

.summary-list,
.address-list,
.card-form {
	display: grid;
	gap: 12px;
}

.summary-row {
	display: flex;
	justify-content: space-between;
	gap: 12px;
	padding-bottom: 12px;
	border-bottom: 1px solid #ececec;
}

.item-meta p,
.item-price {
	margin: 0;
}

.item-name {
	font-weight: 600;
	color: #111;
}

.item-qty {
	color: #555;
	margin-top: 2px;
}

.item-price {
	font-weight: 600;
	color: #111;
}

.total-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 8px;
	font-size: 1.05rem;
	color: #111;
}

.address-button,
.complete-purchase-button {
	width: fit-content;
	margin-top: 4px;
	padding: 10px 14px;
	background: #111;
	color: #fff;
	border: none;
	border-radius: 8px;
	cursor: pointer;
}


.address-button:hover,
.complete-purchase-button:hover {
	background: #333;
}

.address-option {
	display: flex;
	gap: 12px;
	border: 1px solid #ddd;
	border-radius: 8px;
	padding: 12px;
	align-items: flex-start;
}

.address-option p {
	margin: 2px 0;
	color: #444;
}

.card-panel {
	position: relative;
	padding-top: 32px;
}

.card-icon {
	position: absolute;
	top: 18px;
	right: 18px;
	width: 36px;
	height: 36px;
	object-fit: contain;
	opacity: 0.8;
}

.payment-note {
	margin: 0 0 16px;
	color: #7a2d2d;
	background: #fff3f3;
	border: 1px solid #f1c5c5;
	border-radius: 8px;
	padding: 10px 12px;
	max-width: 640px;
}

.card-form {
	max-width: 640px;
}

.card-field {
	display: grid;
	gap: 6px;
}

.card-field label {
	font-size: 0.95rem;
	color: #222;
	font-weight: 600;
}

.card-field input {
	width: 100%;
	padding: 10px 12px;
	border: 1px solid #d4d4d4;
	border-radius: 8px;
	font-size: 0.95rem;
	outline: none;
}

.card-field input:focus {
	border-color: #111;
	box-shadow: 0 0 0 2px rgba(17, 17, 17, 0.08);
}

.card-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px;
}

.complete-purchase-button:disabled {
	opacity: 0.55;
	cursor: not-allowed;
	background: #4b4b4b;
}

.confirmation-panel h2 {
	margin-bottom: 8px;
}

.confirmation-text {
	margin: 0 0 16px;
	color: #2e5c3d;
}

.confirmation-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 20px;
}

.confirmation-grid h3 {
	margin: 0 0 8px;
}

.confirmation-grid p {
	margin: 3px 0;
	color: #333;
}

.confirmation-order-list {
	margin: 10px 0;
	padding: 10px 12px;
	background: #f7f7f7;
	border-radius: 8px;
}

@media (max-width: 700px) {
	.section-header,
  .summary-row {
		align-items: flex-start;
		flex-direction: column;
	}

	.confirmation-grid,
  .card-grid {
		grid-template-columns: 1fr;
	}
}
</style>

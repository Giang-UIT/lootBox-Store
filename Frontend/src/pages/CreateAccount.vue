<script setup lang="ts">
import { ref } from 'vue'
import api from '../api'

const name = ref('')
const email = ref('')
const password = ref('')
const msg = ref('')

async function createAccount() {
  msg.value = ''
  try {
    const { data } = await api.post('/signup/', {
      name: name.value,
      email: email.value,
      password: password.value,
    })
    msg.value = `Account created! ID: ${data.id}, Name: ${data.name}`
    name.value = ''
    email.value = ''
    password.value = ''
  } catch (e: any) {
    if(e.response.status == 400) 
      msg.value = "email already exist "
    else if (e.response.status == 500)
      msg.value = "Could not create account. Error from server side"
  }
}
</script>

<template>
  <div class="create-account-page">
    <h1>Create Account</h1>

    <form @submit.prevent="createAccount">
      <div class="form-group">
        <label>Name</label>
        <input v-model="name" type="text" placeholder="Name" />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="Email" />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="Password" />
      </div>

      <div>
      <button type="submit">Create Account</button>
      </div>
    </form>
    
    <p v-if="msg">{{ msg }}</p> 
  </div>
</template>

<style scoped>
.create-account-page {
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
}

.form-group {
  margin: 1rem auto;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #1e7e34;
}

</style>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const email = ref('')
const password = ref('')
const msg = ref('')

//to retrieve info about session, use localStorage.getItem() to retrieve info
async function login() {
  msg.value = ''
  try {
    const { data } = await api.post('/login/', {
      email: email.value,
      password: password.value,
    })
    // Store the session token and account info localy in client browser
    localStorage.setItem('token', data.token)
    localStorage.setItem('account', JSON.stringify(data.account))

    //would be cool to add 1ms delay here. Before sending user to home page
    msg.value = `Welcome, ${data.account.name}!`    
    window.location.href = '/'
  } catch (e: any) {
    if(e.response.status == 400)
      msg.value = "Need to input email or password to login"
    else if (e.response.status == 401)
      msg.value = "Invalid email or password"
    else if (e.response.status == 500)
      msg.value = "Could not login account. Error from server side"
  }
}
</script>

<template>
  <div class="login-page">
    <h1>Login</h1>

    <form @submit.prevent="login">
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="Email" />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="Password" />
      </div>

      <div>
        <button type="submit">Login</button>
        <button class="createAccount" type="button" @click="router.push('/createaccount')">Create Account</button>
      </div>

    </form>
    
    <p v-if="msg">{{ msg }}</p> 
  </div>
</template>

<style scoped>

.login-page {
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
}

.form-group {
  max-width: 600px;
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
  margin: 0.5rem 0.25rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button.createAccount {
  background-color: #28a745;
}

button.createAccount:hover {
  background-color: #1e7e34;
}

</style>
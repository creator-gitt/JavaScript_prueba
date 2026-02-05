<template>
<form @submit.prevent="register" class="card">
<h2>Registro</h2>
<input v-model="name" placeholder="Nombre" required />
<input v-model="email" type="email" placeholder="Email" required />
<input v-model="password" type="password" placeholder="Contraseña" required />
<button>Crear cuenta</button>
<p class="link" @click="goLogin">Ya tengo cuenta</p>
</form>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const name = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()

function register() {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  if (users.some(u => u.email === email.value)) {
    alert('El usuario ya existe')
    return
  }
  users.push({ name: name.value, email: email.value, password: password.value })
  localStorage.setItem('users', JSON.stringify(users))
  alert('Registro exitoso')
  router.push('/login')
}

function goLogin() {
  router.push('/login')
}
</script>


<style scoped>
.card{max-width:360px;margin:80px auto;padding:20px;border:1px solid #ddd}
input,button{width:100%;margin:8px 0;padding:8px}
.link{cursor:pointer;color:#42b883}
</style>
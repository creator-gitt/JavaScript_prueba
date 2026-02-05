<template>
<form @submit.prevent="login" class="card">
<h2>Iniciar sesión</h2>
<input v-model="email" type="email" placeholder="Email" required />
<input v-model="password" type="password" placeholder="Contraseña" required />
<button>Entrar</button>
<p class="link" @click="goRegister">Crear cuenta</p>
</form>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const email = ref('')
const password = ref('')
const router = useRouter()

function login() {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const user = users.find(u => u.email === email.value && u.password === password.value)
  if (!user) {
    alert('Credenciales inválidas')
    return
  }
  localStorage.setItem('auth', 'true')
  alert('Login correcto')
}

function goRegister() {
  router.push('/register')
}
</script>


<style scoped>
.card{max-width:360px;margin:80px auto;padding:20px;border:1px solid #ddd}
input,button{width:100%;margin:8px 0;padding:8px}
.link{cursor:pointer;color:#42b883}
</style>
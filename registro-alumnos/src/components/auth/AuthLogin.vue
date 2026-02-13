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
  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value, password: password.value })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert(data.error)
    } else {
      localStorage.setItem('auth', 'true')
      localStorage.setItem('user', JSON.stringify(data.user)) // Guardar info del usuario
      alert(data.message)
      // Redirigir al formulario principal
      router.push('/')
    }
  })
  .catch(err => {
    console.error(err)
    alert('Error al conectar con el servidor')
  })
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
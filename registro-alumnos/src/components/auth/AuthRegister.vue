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
  fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.value, email: email.value, password: password.value })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert(data.error)
    } else {
      alert(data.message)
      router.push('/login')
    }
  })
  .catch(err => {
    console.error(err)
    alert('Error al conectar con el servidor')
  })
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
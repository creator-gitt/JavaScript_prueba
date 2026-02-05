<template>
  <div class="main-container">
    <div class="header-container">
      <h1>SISTEMA ESCOLAR</h1>
      <p>Gestión de Registro de Alumnos</p>
    </div>

    <div class="content-wrapper">
      <!-- FORMULARIO -->
      <div class="form-section">
        <div class="form-title">
          {{ editing ? 'EDITAR ALUMNO' : 'NUEVO ALUMNO' }}
        </div>

        <form @submit.prevent="guardarAlumno">
          <div class="form-group-custom">
            <label for="inputCodigo">CÓDIGO:</label>
            <input 
              id="inputCodigo"
              v-model="alumno.codigo" 
              type="text"
              class="form-control"
              placeholder="Ej: A001"
              :disabled="editing"
              required>
          </div>
            <div class="form-group-custom">
              <label for="inputNombre">NOMBRE COMPLETO:</label>
            <input 
              id="inputNombre"
              v-model="alumno.nombre" 
              type="text"
              class="form-control"
              placeholder="Juan García López"
              required>
          </div>


          <div class="form-group-custom">
            <label for="inputDireccion">DIRECCIÓN:</label>
            <input 
              id="inputDireccion"
              v-model="alumno.direccion" 
              type="text"
              class="form-control"
              placeholder="Calle y número"
              required>
          </div>

          <div class="form-row-split">
            <div class="form-group-custom">
              <label for="inputMunicipio">MUNICIPIO:</label>
              <input 
                id="inputMunicipio"
                v-model="alumno.municipio" 
                type="text"
                class="form-control"
                placeholder="San Salvador"
                required>
            </div>

            <div class="form-group-custom">
              <label for="selectDepartamento">DEPARTAMENTO:</label>
              <select 
                id="selectDepartamento"
                v-model="alumno.departamento"
                class="form-select"
                required>
                <option value="">Seleccione...</option>
                <option value="Ahuachapán">Ahuachapán</option>
                <option value="Santa Ana">Santa Ana</option>
                <option value="Sonsonate">Sonsonate</option>
                <option value="Chalatenango">Chalatenango</option>
                <option value="La Libertad">La Libertad</option>
                <option value="San Salvador">San Salvador</option>
                <option value="Cuscatlán">Cuscatlán</option>
                <option value="La Paz">La Paz</option>
                <option value="Cabañas">Cabañas</option>
                <option value="San Vicente">San Vicente</option>
                <option value="Usulután">Usulután</option>
                <option value="San Miguel">San Miguel</option>
                <option value="Morazán">Morazán</option>
                <option value="La Unión">La Unión</option>
              </select>
            </div>
          </div>

          <div class="form-row-split">
            <div class="form-group-custom">
              <label for="inputTelefono">TELÉFONO:</label>
              <input 
                id="inputTelefono"
                v-model="alumno.telefono" 
                type="tel"
                class="form-control"
                placeholder="0000-0000"
                required>
            </div>

            <div class="form-group-custom">
              <label for="inputEmail">EMAIL:</label>
              <input 
                id="inputEmail"
                v-model="alumno.email" 
                type="email"
                class="form-control"
                placeholder="correo@ejemplo.com"
                required>
            </div>
          </div>

          <div class="form-group-custom">
            <label for="inputFechaNac">FECHA DE NACIMIENTO:</label>
            <input 
              id="inputFechaNac"
              v-model="alumno.fechaNacimiento" 
              type="date"
              class="form-control"
              required>
          </div>

          <div class="form-group-custom">
            <label>SEXO:</label>
            <div class="sexo-group">
              <div class="form-check">
                <input 
                  v-model="alumno.sexo"
                  type="radio" 
                  value="M" 
                  id="sexoM"
                  required>
                <label for="sexoM">Masculino</label>
              </div>
              <div class="form-check">
                <input 
                  v-model="alumno.sexo"
                  type="radio" 
                  value="F" 
                  id="sexoF"
                  required>
                <label for="sexoF">Femenino</label>
              </div>
            </div>
          </div>

          <div class="button-group">
            <button type="submit" class="btn btn-primary">
              {{ editing ? 'ACTUALIZAR' : 'GUARDAR' }}
            </button>
            <button type="button" @click="resetForm" class="btn btn-warning">
              NUEVO
            </button>
          </div>
        </form>
      </div>

      <!-- TABLA -->
      <div class="table-section">
        <div class="table-title">LISTA DE ALUMNOS</div>

        <div class="search-box">
          <div class="input-group">
            <span class="input-group-text">BUSCAR</span>
            <input 
              v-model="search" 
              type="text" 
              class="form-control"
              placeholder="Buscar por código, nombre, municipio..."
              aria-label="Buscar alumnos">
            <button 
              v-if="search" 
              @click="clearSearch" 
              class="btn btn-outline-secondary"
              type="button">
              Limpiar
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>NOMBRE</th>
                <th>MUNICIPIO</th>
                <th>DEPTO</th>
                <th>TELÉFONO</th>
                <th style="text-align: center;">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filtered.length === 0 && search === ''">
                <td colspan="6" class="text-center text-muted">
                  No hay alumnos registrados
                </td>
              </tr>
              <tr v-if="filtered.length === 0 && search !== ''">
                <td colspan="6" class="text-center text-warning">
                  No se encontraron resultados para "{{ search }}"
                </td>
              </tr>
              <tr v-for="al in filtered" :key="al.codigo">
                <td><strong>{{ al.codigo }}</strong></td>
                <td>{{ al.nombre }}</td>
                <td>{{ al.municipio }}</td>
                <td>{{ al.departamento }}</td>
                <td>{{ al.telefono }}</td>
                <td style="text-align: center;">
                  <button 
                    @click="modificarAlumno(al)" 
                    class="btn btn-info"
                    title="Editar alumno">
                    EDITAR
                  </button>
                  <button 
                    @click="eliminarAlumno(al.codigo)" 
                    class="btn btn-danger"
                    title="Eliminar alumno">
                    ELIMINAR
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import './AlumnoRegistro.css'

const alumno = reactive({
  codigo: '',
  nombre: '',
  direccion: '',
  municipio: '',
  departamento: '',
  telefono: '',
  fechaNacimiento: '',
  sexo: 'M',
  email: ''
})
const alumnos = ref([])
const editing = ref(false)
const prevCode = ref('')
const search = ref('')

const filtered = computed(() => {
  if (search.value === '') return alumnos.value
  const term = search.value.toLowerCase().trim()
  return alumnos.value.filter(al =>
    al.codigo.toLowerCase().includes(term) ||
    al.nombre.toLowerCase().includes(term) ||
    al.municipio.toLowerCase().includes(term) ||
    al.departamento.toLowerCase().includes(term)
  )
})

function guardarAlumno() {
  if (!editing.value) {
    const exists = alumnos.value.find(a => 
      a.codigo.trim().toUpperCase() === alumno.codigo.trim().toUpperCase()
    )
    if (exists) {
      alert(`El código del alumno ya existe: ${exists.nombre}`)
      return
    }
  }

  const data = { ...alumno }
  if (editing.value) {
    const idx = alumnos.value.findIndex(a => a.codigo === prevCode.value)
    if (idx !== -1) alumnos.value[idx] = data
  } else {
    alumnos.value.push(data)
  }

  saveToStorage()
  resetForm()
  alert(editing.value ? 'Alumno actualizado exitosamente' : 'Alumno guardado exitosamente')
}

function modificarAlumno(al) {
  Object.assign(alumno, al)
  prevCode.value = al.codigo
  editing.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function eliminarAlumno(codigo) {
  const al = alumnos.value.find(a => a.codigo === codigo)
  if (confirm(`¿Está seguro de eliminar al alumno ${al.nombre}?`)) {
    alumnos.value = alumnos.value.filter(a => a.codigo !== codigo)
    saveToStorage()
    alert('Alumno eliminado exitosamente')
  }
}

function resetForm() {
  alumno.codigo = ''
  alumno.nombre = ''
  alumno.direccion = ''
  alumno.municipio = ''
  alumno.departamento = ''
  alumno.telefono = ''
  alumno.fechaNacimiento = ''
  alumno.sexo = 'M'
  alumno.email = ''
  editing.value = false
  prevCode.value = ''
}

function clearSearch() {
  search.value = ''
}

function loadAlumnos() {
  const stored = localStorage.getItem('alumnos')
  if (stored) {
    try {
      alumnos.value = JSON.parse(stored)
    } catch (err) {
      console.error('Error loading data:', err)
      alumnos.value = []
    }
  }
}

function saveToStorage() {
  localStorage.setItem('alumnos', JSON.stringify(alumnos.value))
}

onMounted(() => loadAlumnos())
</script>


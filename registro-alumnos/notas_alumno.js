// =============================================
// COMPONENTE: NOTAS — Vista del Alumno
// Solo lectura. Muestra sus materias inscritas
// con los computos, promedio final y estado.
// =============================================
const notas_alumno = {
    props: ['usuarioActual'],
    data() {
        return {
            filas: [],    // { inscripcion, nota }
            cargando: true,
        };
    },
    async mounted() {
        await this.cargarDatos();
    },
    methods: {
        async cargarDatos() {
            this.cargando = true;
            // Buscar las matriculas del alumno por su email
            const email = this.usuarioActual?.email?.toLowerCase() ?? '';

            // 1. Encontrar el registro de alumno por email
            const alumnos = await db.alumnos.toArray();
            const alumno = alumnos.find(a => a.email && a.email.trim().toLowerCase() === email);

            if (!alumno) { this.cargando = false; return; }

            // 2. Encontrar sus matrículas
            const matriculas = await db.matricula
                .where('idAlumno').equals(alumno.idAlumno)
                .toArray();
            const idMatriculas = matriculas.map(m => m.idMatricula);

            // 3. Inscripciones de esas matrículas
            const todasIns = await db.inscripciones.toArray();
            const misIns = todasIns.filter(i => idMatriculas.includes(i.idMatricula) || idMatriculas.map(String).includes(String(i.idMatricula)));

            // 4. Notas por inscripción
            const todasNotas = await db.notas.toArray();

            this.filas = misIns.map(ins => {
                const nota = todasNotas.find(n => n.idInscripcion == ins.idInscripcion) || null;
                return { inscripcion: ins, nota };
            });

            this.cargando = false;
        },

        calcComputo(lab1, lab2, examen) {
            const l1 = parseFloat(lab1);
            const l2 = parseFloat(lab2);
            const ex = parseFloat(examen);
            if (isNaN(l1) || isNaN(l2) || isNaN(ex)) return null;
            return (l1 * 0.30) + (l2 * 0.30) + (ex * 0.40);
        },

        calcPromedio(n) {
            if (!n) return null;
            const c1 = this.calcComputo(n.c1_lab1, n.c1_lab2, n.c1_examen);
            const c2 = this.calcComputo(n.c2_lab1, n.c2_lab2, n.c2_examen);
            const c3 = this.calcComputo(n.c3_lab1, n.c3_lab2, n.c3_examen);
            if (c1 === null || c2 === null || c3 === null) return null;
            return (c1 + c2 + c3) / 3;
        },

        fmt(val) {
            if (val === null || val === undefined) return '—';
            return parseFloat(val).toFixed(2);
        },

        estadoBadge(promedio) {
            if (promedio === null) return { clase: 'bg-secondary', texto: 'Pendiente' };
            return promedio >= 6
                ? { clase: 'bg-success', texto: 'Aprobado ✓' }
                : { clase: 'bg-danger', texto: 'Reprobado ✗' };
        }
    },

    template: `
    <div>
        <div class="d-flex align-items-center mb-3 border-bottom pb-2">
            <i class="bi bi-journal-text me-2 fs-5 text-secondary"></i>
            <h5 class="mb-0 fw-semibold">Mis Notas</h5>
            <span class="badge bg-success ms-2">Alumno</span>
        </div>

        <div v-if="cargando" class="text-center py-5 text-muted">
            <div class="spinner-border spinner-border-sm me-2"></div>Cargando tus notas...
        </div>

        <div v-else-if="filas.length === 0" class="alert alert-info d-flex align-items-center gap-2 py-2" style="max-width:640px;">
            <i class="bi bi-info-circle-fill flex-shrink-0"></i>
            <div class="small">No tienes materias inscritas o aún no hay notas registradas para tu cuenta.</div>
        </div>

        <div v-else>
            <!-- Resumen superior -->
            <div class="d-flex gap-3 mb-4 flex-wrap">
                <div class="card border-0 shadow-sm text-center px-4 py-3">
                    <div class="fs-4 fw-bold" style="color:#1a3a5c;">{{ filas.length }}</div>
                    <div class="small text-muted">Materias inscritas</div>
                </div>
                <div class="card border-0 shadow-sm text-center px-4 py-3">
                    <div class="fs-4 fw-bold text-success">
                        {{ filas.filter(f => calcPromedio(f.nota) !== null && calcPromedio(f.nota) >= 6).length }}
                    </div>
                    <div class="small text-muted">Aprobadas</div>
                </div>
                <div class="card border-0 shadow-sm text-center px-4 py-3">
                    <div class="fs-4 fw-bold text-danger">
                        {{ filas.filter(f => calcPromedio(f.nota) !== null && calcPromedio(f.nota) < 6).length }}
                    </div>
                    <div class="small text-muted">Reprobadas</div>
                </div>
                <div class="card border-0 shadow-sm text-center px-4 py-3">
                    <div class="fs-4 fw-bold text-secondary">
                        {{ filas.filter(f => calcPromedio(f.nota) === null).length }}
                    </div>
                    <div class="small text-muted">Pendientes</div>
                </div>
            </div>

            <!-- Tabla de notas -->
            <div class="card border-0 shadow-sm" style="max-width:860px; overflow-x:auto;">
                <table class="table table-hover table-sm align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="px-3">Materia</th>
                            <th class="text-center" colspan="3">Cómputo 1</th>
                            <th class="text-center" colspan="3">Cómputo 2</th>
                            <th class="text-center" colspan="3">Cómputo 3</th>
                            <th class="text-center">C1</th>
                            <th class="text-center">C2</th>
                            <th class="text-center">C3</th>
                            <th class="text-center">Promedio</th>
                            <th class="text-center">Estado</th>
                        </tr>
                        <tr class="table-light border-top">
                            <th></th>
                            <th class="text-center text-muted" style="font-size:0.7rem;font-weight:400;">Lab1</th>
                            <th class="text-center text-muted" style="font-size:0.7rem;font-weight:400;">Lab2</th>
                            <th class="text-center text-muted" style="font-size:0.7rem;font-weight:400;">Exm</th>
                            <th class="text-center text-muted" style="font-size:0.7rem;font-weight:400;">Lab1</th>
                            <th class="text-center text-muted" style="font-size:0.7rem;font-weight:400;">Lab2</th>
                            <th class="text-center text-muted" style="font-size:0.7rem;font-weight:400;">Exm</th>
                            <th class="text-center text-muted" style="font-size:0.7rem;font-weight:400;">Lab1</th>
                            <th class="text-center text-muted" style="font-size:0.7rem;font-weight:400;">Lab2</th>
                            <th class="text-center text-muted" style="font-size:0.7rem;font-weight:400;">Exm</th>
                            <th></th><th></th><th></th><th></th><th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="f in filas" :key="f.inscripcion.idInscripcion">
                            <td class="px-3 fw-semibold small">{{ f.inscripcion.materia }}</td>

                            <!-- Cómputo 1 -->
                            <td class="text-center small">{{ f.nota ? fmt(f.nota.c1_lab1) : '—' }}</td>
                            <td class="text-center small">{{ f.nota ? fmt(f.nota.c1_lab2) : '—' }}</td>
                            <td class="text-center small">{{ f.nota ? fmt(f.nota.c1_examen) : '—' }}</td>

                            <!-- Cómputo 2 -->
                            <td class="text-center small">{{ f.nota ? fmt(f.nota.c2_lab1) : '—' }}</td>
                            <td class="text-center small">{{ f.nota ? fmt(f.nota.c2_lab2) : '—' }}</td>
                            <td class="text-center small">{{ f.nota ? fmt(f.nota.c2_examen) : '—' }}</td>

                            <!-- Cómputo 3 -->
                            <td class="text-center small">{{ f.nota ? fmt(f.nota.c3_lab1) : '—' }}</td>
                            <td class="text-center small">{{ f.nota ? fmt(f.nota.c3_lab2) : '—' }}</td>
                            <td class="text-center small">{{ f.nota ? fmt(f.nota.c3_examen) : '—' }}</td>

                            <!-- Notas de computo -->
                            <td class="text-center">
                                <span class="badge bg-light text-dark border fw-semibold">
                                    {{ f.nota ? fmt(calcComputo(f.nota.c1_lab1, f.nota.c1_lab2, f.nota.c1_examen)) : '—' }}
                                </span>
                            </td>
                            <td class="text-center">
                                <span class="badge bg-light text-dark border fw-semibold">
                                    {{ f.nota ? fmt(calcComputo(f.nota.c2_lab1, f.nota.c2_lab2, f.nota.c2_examen)) : '—' }}
                                </span>
                            </td>
                            <td class="text-center">
                                <span class="badge bg-light text-dark border fw-semibold">
                                    {{ f.nota ? fmt(calcComputo(f.nota.c3_lab1, f.nota.c3_lab2, f.nota.c3_examen)) : '—' }}
                                </span>
                            </td>

                            <!-- Promedio final -->
                            <td class="text-center fw-bold">
                                {{ fmt(calcPromedio(f.nota)) }}
                            </td>

                            <!-- Estado -->
                            <td class="text-center">
                                <span class="badge" :class="estadoBadge(calcPromedio(f.nota)).clase">
                                    {{ estadoBadge(calcPromedio(f.nota)).texto }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p class="text-muted small mt-2">
                <i class="bi bi-shield-lock me-1"></i>
                Vista de solo lectura. Las notas son ingresadas por tu docente.
            </p>
        </div>
    </div>
    `
};

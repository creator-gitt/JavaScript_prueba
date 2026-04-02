<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AlumnoController;
use App\Http\Controllers\MateriaController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\MatriculaController;
use App\Http\Controllers\InscripcionController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/alumnos', [AlumnoController::class, 'index'])->name('alumnos.index');
Route::post('/alumnos', [AlumnoController::class, 'store'])->name('alumnos.store');

Route::get('/materias', [MateriaController::class, 'index'])->name('materias.index');
Route::post('/materias', [MateriaController::class, 'store'])->name('materias.store');

Route::get('/docentes', [DocenteController::class, 'index'])->name('docentes.index');
Route::post('/docentes', [DocenteController::class, 'store'])->name('docentes.store');

Route::get('/matriculas', [MatriculaController::class, 'index'])->name('matriculas.index');
Route::post('/matriculas', [MatriculaController::class, 'store'])->name('matriculas.store');

Route::get('/inscripciones', [InscripcionController::class, 'index'])->name('inscripciones.index');
Route::post('/inscripciones', [InscripcionController::class, 'store'])->name('inscripciones.store');

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AlumnoController;
use App\Http\Controllers\Api\DocenteController;
use App\Http\Controllers\Api\MateriaController;
use App\Http\Controllers\Api\MatriculaController;
use App\Http\Controllers\Api\InscripcionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('alumnos', AlumnoController::class);
Route::apiResource('docentes', DocenteController::class);
Route::apiResource('materias', MateriaController::class);
Route::apiResource('matriculas', MatriculaController::class);
Route::apiResource('inscripciones', InscripcionController::class);

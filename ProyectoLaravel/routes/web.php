<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome'); 
});

Route::get('/bienvenida', function () {
    return "Esta es la página de bienvenida secundaria sin errores.";
});
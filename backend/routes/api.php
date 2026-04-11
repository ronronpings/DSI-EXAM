<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SaleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
   Route::post('/auth/logout', [AuthController::class, 'logout']);
   Route::get('/dashboard', [AuthController::class, 'index']);


   Route::apiResource('customers', CustomerController::class);
   Route::apiResource('products', ProductController::class);
   Route::apiResource('sales', SaleController::class);
});
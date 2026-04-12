<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:view_dashboard');

    Route::get('/reports/sales', [ReportController::class, 'sales'])
        ->middleware('permission:view_reports');
    Route::get('/reports/sales/print', [ReportController::class, 'printableSales'])
        ->middleware('permission:view_reports');
    Route::get('/reports/sales/download', [ReportController::class, 'downloadSalesCsv'])
        ->middleware('permission:view_reports');

    Route::get('/customers', [CustomerController::class, 'index'])
        ->middleware('permission:manage_customers');
    Route::post('/customers', [CustomerController::class, 'store'])
        ->middleware('permission:manage_customers');
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])
        ->middleware('permission:manage_customers');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])
        ->middleware('permission:manage_customers');
    Route::patch('/customers/{customer}', [CustomerController::class, 'update'])
        ->middleware('permission:manage_customers');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])
        ->middleware('permission:manage_customers');

    Route::get('/products', [ProductController::class, 'index'])
        ->middleware('permission:manage_products');
    Route::post('/products', [ProductController::class, 'store'])
        ->middleware('permission:manage_products');
    Route::get('/products/{product}', [ProductController::class, 'show'])
        ->middleware('permission:manage_products');
    Route::put('/products/{product}', [ProductController::class, 'update'])
        ->middleware('permission:manage_products');
    Route::patch('/products/{product}', [ProductController::class, 'update'])
        ->middleware('permission:manage_products');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])
        ->middleware('permission:manage_products');

    Route::get('/sales', [SaleController::class, 'index'])
        ->middleware('permission:manage_sales');
    Route::post('/sales', [SaleController::class, 'store'])
        ->middleware('permission:manage_sales');
    Route::get('/sales/{sale}', [SaleController::class, 'show'])
        ->middleware('permission:manage_sales');
    Route::put('/sales/{sale}', [SaleController::class, 'update'])
        ->middleware('permission:manage_sales');
    Route::patch('/sales/{sale}', [SaleController::class, 'update'])
        ->middleware('permission:manage_sales');
    Route::delete('/sales/{sale}', [SaleController::class, 'destroy'])
        ->middleware('permission:manage_sales');
});

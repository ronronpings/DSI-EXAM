<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\SaleReturnController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:view_dashboard');

    Route::get('/reports/sales', [ReportController::class, 'sales'])
        ->middleware('permission:reports.view');
    Route::get('/reports/sales/print', [ReportController::class, 'printableSales'])
        ->middleware('permission:reports.view');
    Route::get('/reports/sales/download', [ReportController::class, 'downloadSalesCsv'])
        ->middleware('permission:reports.view');

    Route::get('/customers', [CustomerController::class, 'index'])
        ->middleware('permission:customer.view');
    Route::post('/customers', [CustomerController::class, 'store'])
        ->middleware('permission:customer.create');
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])
        ->middleware('permission:customer.view');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])
        ->middleware('permission:customer.update');
    Route::patch('/customers/{customer}', [CustomerController::class, 'update'])
        ->middleware('permission:customer.update');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])
        ->middleware('permission:customer.delete');

    Route::get('/products', [ProductController::class, 'index'])
        ->middleware('permission:product.view');
    Route::post('/products', [ProductController::class, 'store'])
        ->middleware('permission:product.create');
    Route::get('/products/{product}', [ProductController::class, 'show'])
        ->middleware('permission:product.view');
    Route::put('/products/{product}', [ProductController::class, 'update'])
        ->middleware('permission:product.update');
    Route::patch('/products/{product}', [ProductController::class, 'update'])
        ->middleware('permission:product.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])
        ->middleware('permission:product.delete');

    Route::get('/sales', [SaleController::class, 'index'])
        ->middleware('permission:sales.view');
    Route::post('/sales', [SaleController::class, 'store'])
        ->middleware('permission:sales.create');
    Route::get('/sales/{sale}', [SaleController::class, 'show'])
        ->middleware('permission:sales.view');
    Route::put('/sales/{sale}', [SaleController::class, 'update'])
        ->middleware('permission:sales.update');
    Route::patch('/sales/{sale}', [SaleController::class, 'update'])
        ->middleware('permission:sales.update');
    Route::delete('/sales/{sale}', [SaleController::class, 'destroy'])
        ->middleware('permission:sales.delete');

    Route::get('/sales/{sale}/returns', [SaleReturnController::class, 'index'])
        ->middleware('permission:sales.view');
    Route::post('/sales/{sale}/returns', [SaleReturnController::class, 'store'])
        ->middleware('permission:sales.return');

    Route::get('/users', [UserController::class, 'index'])
        ->middleware('permission:users.view');
    Route::post('/users', [UserController::class, 'store'])
        ->middleware('permission:users.create');

    Route::get('/users/roles', [UserController::class, 'roles'])
        ->middleware('permission:users.assign_roles');
    Route::get('/users/permissions', [UserController::class, 'permissions'])
        ->middleware('permission:users.assign_permissions');

    Route::get('/users/{user}', [UserController::class, 'show'])
        ->middleware('permission:users.view');
    Route::put('/users/{user}', [UserController::class, 'update'])
        ->middleware('permission:users.update');
    Route::patch('/users/{user}', [UserController::class, 'update'])
        ->middleware('permission:users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])
        ->middleware('permission:users.delete');
    Route::post('/users/{user}/assign-roles', [UserController::class, 'assignRoles'])
        ->middleware('permission:users.assign_roles');
    Route::post('/users/{user}/assign-permissions', [UserController::class, 'assignPermissions'])
        ->middleware('permission:users.assign_permissions');
});

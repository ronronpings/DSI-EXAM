<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = now()->toDateString();

        $salesToday = Sale::query()
            ->whereDate('sold_at', $today)
            ->where('status', 'paid')
            ->sum('total_amount');

        $salesThisMonth = Sale::query()
            ->whereBetween('sold_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->where('status', 'paid')
            ->sum('total_amount');

        $totalSalesCount = Sale::query()->count();
        $totalCustomers = Customer::query()->count();
        $totalProducts = Product::query()->count();

        $lowStockProducts = Product::query()
            ->where('stock_quantity', '<=', 10)
            ->orderBy('stock_quantity')
            ->get(['id', 'sku', 'name', 'stock_quantity']);

        $topProducts = SaleItem::query()
            ->select('product_id')
            ->selectRaw('SUM(quantity) as total_quantity')
            ->selectRaw('SUM(line_total) as total_revenue')
            ->with('product:id,sku,name')
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();

        $recentSales = Sale::query()
            ->with(['customer:id,first_name,last_name', 'cashier:id,name'])
            ->latest('sold_at')
            ->limit(5)
            ->get([
                'id',
                'invoice_number',
                'customer_id',
                'user_id',
                'total_amount',
                'status',
                'sold_at',
            ]);

        return response()->json([
            'metrics' => [
                'sales_today' => (float) $salesToday,
                'sales_this_month' => (float) $salesThisMonth,
                'total_sales_count' => $totalSalesCount,
                'total_customers' => $totalCustomers,
                'total_products' => $totalProducts,
            ],
            'top_products' => $topProducts,
            'low_stock_products' => $lowStockProducts,
            'recent_sales' => $recentSales,
        ]);
    }
}

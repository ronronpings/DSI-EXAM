<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleStatusRequest;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function __construct(
        protected SaleService $saleService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $sales = Sale::query()
            ->with(['customer', 'cashier', 'items.product'])
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->when($request->filled('date_from'), function ($query) use ($request) {
                $query->whereDate('sold_at', '>=', $request->string('date_from'));
            })
            ->when($request->filled('date_to'), function ($query) use ($request) {
                $query->whereDate('sold_at', '<=', $request->string('date_to'));
            })
            ->latest('sold_at')
            ->paginate((int) $request->get('per_page', 10));

        return response()->json($sales);
    }

    public function store(StoreSaleRequest $request): JsonResponse
    {
        $sale = $this->saleService->create($request->validated(), $request->user()->id);

        return response()->json([
            'message' => 'Sale created successfully.',
            'data' => $sale,
        ], 201);
    }

    public function show(Sale $sale): JsonResponse
    {
        $sale->load(['customer', 'cashier', 'items.product']);

        return response()->json([
            'data' => $sale,
        ]);
    }

    public function update(UpdateSaleStatusRequest $request, Sale $sale): JsonResponse
    {
        $updatedSale = $this->saleService->updateStatus($sale, $request->validated('status'));

        return response()->json([
            'message' => 'Sale updated successfully.',
            'data' => $updatedSale,
        ]);
    }

    public function destroy(Sale $sale): JsonResponse
    {
        if ($sale->status !== 'cancelled') {
            return response()->json([
                'message' => 'Only cancelled sales can be deleted.',
            ], 422);
        }

        $sale->delete();

        return response()->json([
            'message' => 'Sale deleted successfully.',
        ]);
    }
}

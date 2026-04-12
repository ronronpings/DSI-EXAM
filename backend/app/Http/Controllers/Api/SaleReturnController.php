<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleReturnRequest;
use App\Models\Sale;
use App\Services\SaleReturnService;
use Illuminate\Http\JsonResponse;

class SaleReturnController extends Controller
{
    public function __construct(
        protected SaleReturnService $saleReturnService
    ) {
    }

    public function index(Sale $sale): JsonResponse
    {
        return response()->json([
            'data' => $sale->returns()
                ->with(['items.product', 'user'])
                ->latest('returned_at')
                ->get(),
        ]);
    }

    public function store(StoreSaleReturnRequest $request, Sale $sale): JsonResponse
    {
        $saleReturn = $this->saleReturnService->create(
            $sale,
            $request->validated(),
            $request->user()->id
        );

        return response()->json([
            'message' => 'Sale return created successfully.',
            'data' => $saleReturn,
        ], 201);
    }
}

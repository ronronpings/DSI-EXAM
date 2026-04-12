<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    //
    public function index(Request $request)
    {
        $products = Product::query()
        ->when($request->filled('search'), function ($query) use ($request) {
            $search = preg_replace('/\s+/', '', $request->string('search'));

            $query->where(function ($subQuery) use ($search) {
                $subQuery
                    ->whereRaw("REPLACE(sku, ' ', '') LIKE ?", ["%{$search}%"])
                    ->orWhereRaw("REPLACE(name, ' ', '') LIKE ?", ["%{$search}%"])
                    ->orWhereRaw("REPLACE(description, ' ', '') LIKE ?", ["%{$search}%"]);
            });
        })
        ->when($request->filled('is_active'), function ($query) use ($request) {
            $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        })
        ->latest()
        ->paginate((int) $request->get('per_page', 10));

    return response()->json($products);
    }

    public function store(StoreProductRequest $request)
    {
       $product = Product::create($request->validated());

       return response()->json([
        'message' => 'Product created successfully.',
        'product' => $product,
       ],201);
    }

    public function show(Product $product)
    {
        return response()->json([
            'product' => $product,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $product,
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }
}

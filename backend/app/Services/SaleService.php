<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleService
{
    public function create(array $validated, int $userId): Sale
    {
        return DB::transaction(function () use ($validated, $userId) {
            $tax = (float) ($validated['tax'] ?? 0);
            $discount = (float) ($validated['discount'] ?? 0);

            $groupedItems = collect($validated['items'])
                ->groupBy('product_id')
                ->map(function ($items, $productId) {
                    return [
                        'product_id' => (int) $productId,
                        'quantity' => collect($items)->sum('quantity'),
                    ];
                })
                ->values();

            $subtotal = 0;
            $preparedItems = [];

            foreach ($groupedItems as $item) {
                $product = Product::query()
                    ->lockForUpdate()
                    ->findOrFail($item['product_id']);

                if (! $product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => ["Product {$product->name} is inactive."],
                    ]);
                }

                if ($product->stock_quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => [
                            "Insufficient stock for {$product->name}. Available: {$product->stock_quantity}, requested: {$item['quantity']}.",
                        ],
                    ]);
                }

                $unitPrice = (float) $product->price;
                $lineTotal = $unitPrice * (int) $item['quantity'];
                $subtotal += $lineTotal;

                $preparedItems[] = [
                    'product' => $product,
                    'quantity' => (int) $item['quantity'],
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];
            }

            $totalAmount = max(($subtotal + $tax) - $discount, 0);

            $sale = Sale::create([
                'invoice_number' => $this->generateInvoiceNumber(),
                'customer_id' => $validated['customer_id'],
                'user_id' => $userId,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total_amount' => $totalAmount,
                'status' => $validated['status'] ?? 'paid',
                'sold_at' => $validated['sold_at'],
            ]);

            foreach ($preparedItems as $preparedItem) {
                $sale->items()->create([
                    'product_id' => $preparedItem['product']->id,
                    'quantity' => $preparedItem['quantity'],
                    'unit_price' => $preparedItem['unit_price'],
                    'line_total' => $preparedItem['line_total'],
                ]);

                $preparedItem['product']->decrement('stock_quantity', $preparedItem['quantity']);
            }

            return $sale->load(['customer', 'cashier', 'items.product']);
        });
    }

    public function updateStatus(Sale $sale, string $status): Sale
    {
        return DB::transaction(function () use ($sale, $status) {
            $sale->loadMissing('items.returnItems');

            if (
                ! in_array($sale->status, ['cancelled', 'returned'], true)
                && $status === 'cancelled'
            ) {
                foreach ($sale->items as $item) {
                    $returnedQuantity = (int) $item->returnItems->sum('quantity');
                    $restorableQuantity = max($item->quantity - $returnedQuantity, 0);

                    if ($restorableQuantity === 0) {
                        continue;
                    }

                    Product::query()
                        ->whereKey($item->product_id)
                        ->lockForUpdate()
                        ->firstOrFail()
                        ->increment('stock_quantity', $restorableQuantity);
                }
            }

            $sale->update([
                'status' => $status,
            ]);

            return $sale->fresh()->load(['customer', 'cashier', 'items.product']);
        });
    }

    protected function generateInvoiceNumber(): string
    {
        do {
            $invoiceNumber = 'INV-' . now()->format('Ymd') . '-' . strtoupper(str()->random(6));
        } while (Sale::query()->where('invoice_number', $invoiceNumber)->exists());

        return $invoiceNumber;
    }
}

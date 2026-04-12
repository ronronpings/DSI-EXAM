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
            $itemsPayload = $validated['items'];
            $tax = (float) ($validated['tax'] ?? 0);
            $discount = (float) ($validated['discount'] ?? 0);

            $subtotal = 0;
            $preparedItems = [];

            foreach ($itemsPayload as $item) {
                $product = Product::query()->lockForUpdate()->findOrFail($item['product_id']);

                if (! $product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => ["Product {$product->name} is inactive."],
                    ]);
                }

                if ($product->stock_quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => ["Insufficient stock for {$product->name}."],
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

    protected function generateInvoiceNumber(): string
    {
        do {
            $invoiceNumber = 'INV-' . now()->format('Ymd') . '-' . strtoupper(str()->random(6));
        } while (Sale::query()->where('invoice_number', $invoiceNumber)->exists());

        return $invoiceNumber;
    }
}

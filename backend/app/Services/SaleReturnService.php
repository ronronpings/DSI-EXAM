<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SaleReturn;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleReturnService
{
    public function create(Sale $sale, array $validated, int $userId): SaleReturn
    {
        return DB::transaction(function () use ($sale, $validated, $userId) {
            $sale->loadMissing(['items.product', 'returns.items']);

            $totalAmount = 0;
            $preparedItems = [];

            foreach ($validated['items'] as $item) {
                $saleItem = SaleItem::query()
                    ->with('product')
                    ->where('sale_id', $sale->id)
                    ->lockForUpdate()
                    ->findOrFail($item['sale_item_id']);

                $alreadyReturned = (int) $saleItem->returnItems()->sum('quantity');
                $availableQuantity = $saleItem->quantity - $alreadyReturned;
                $requestedQuantity = (int) $item['quantity'];

                if ($requestedQuantity > $availableQuantity) {
                    throw ValidationException::withMessages([
                        'items' => [
                            "Return quantity for {$saleItem->product->name} exceeds available quantity. Available: {$availableQuantity}.",
                        ],
                    ]);
                }

                $lineTotal = (float) $saleItem->unit_price * $requestedQuantity;
                $totalAmount += $lineTotal;

                $preparedItems[] = [
                    'sale_item' => $saleItem,
                    'product_id' => $saleItem->product_id,
                    'quantity' => $requestedQuantity,
                    'unit_price' => (float) $saleItem->unit_price,
                    'line_total' => $lineTotal,
                ];
            }

            $saleReturn = SaleReturn::create([
                'sale_id' => $sale->id,
                'user_id' => $userId,
                'return_number' => $this->generateReturnNumber(),
                'reason' => $validated['reason'] ?? null,
                'total_amount' => $totalAmount,
                'returned_at' => $validated['returned_at'],
            ]);

            foreach ($preparedItems as $preparedItem) {
                $saleReturn->items()->create([
                    'sale_item_id' => $preparedItem['sale_item']->id,
                    'product_id' => $preparedItem['product_id'],
                    'quantity' => $preparedItem['quantity'],
                    'unit_price' => $preparedItem['unit_price'],
                    'line_total' => $preparedItem['line_total'],
                ]);

                Product::query()
                    ->whereKey($preparedItem['product_id'])
                    ->lockForUpdate()
                    ->firstOrFail()
                    ->increment('stock_quantity', $preparedItem['quantity']);
            }

            $this->syncSaleStatus($sale);

            return $saleReturn->load([
                'sale.customer',
                'sale.cashier',
                'items.product',
                'items.saleItem',
                'user',
            ]);
        });
    }

    protected function syncSaleStatus(Sale $sale): void
    {
        $sale->loadMissing(['items.returnItems']);

        $totalPurchased = (int) $sale->items->sum('quantity');
        $totalReturned = (int) $sale->items->sum(
            fn ($item) => $item->returnItems->sum('quantity')
        );

        if ($totalReturned <= 0) {
            return;
        }

        if ($totalReturned >= $totalPurchased) {
            $sale->update(['status' => 'returned']);
            return;
        }

        $sale->update(['status' => 'partially_returned']);
    }

    protected function generateReturnNumber(): string
    {
        do {
            $returnNumber = 'RET-' . now()->format('Ymd') . '-' . strtoupper(str()->random(6));
        } while (SaleReturn::query()->where('return_number', $returnNumber)->exists());

        return $returnNumber;
    }
}

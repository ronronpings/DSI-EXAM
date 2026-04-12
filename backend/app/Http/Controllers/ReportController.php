<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function sales(Request $request): JsonResponse
    {
        $sales = $this->salesQuery($request)->get();

        return response()->json([
            'data' => $sales,
            'summary' => [
                'total_sales' => (float) $sales->sum('total_amount'),
                'total_transactions' => $sales->count(),
            ],
        ]);
    }
    public function printableSales(Request $request): JsonResponse
    {
        $sales = $this->salesQuery($request)->get();

        return response()->json([
            'title' => 'Printable Sales Report',
            'generated_at' => now()->toDateTimeString(),
            'filters' => [
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'status' => $request->get('status'),
            ],
            'summary' => [
                'total_sales' => (float) $sales->sum('total_amount'),
                'total_transactions' => $sales->count(),
            ],
            'data' => $sales,
        ]);
    }

    public function downloadSalesCsv(Request $request): StreamedResponse
    {
        $sales = $this->salesQuery($request)->get();

        $filename = 'sales-report-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($sales) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Invoice Number',
                'Customer',
                'Cashier',
                'Subtotal',
                'Tax',
                'Discount',
                'Total Amount',
                'Status',
                'Sold At',
            ]);

            foreach ($sales as $sale) {
                fputcsv($handle, [
                    $sale->invoice_number,
                    trim($sale->customer->first_name . ' ' . $sale->customer->last_name),
                    $sale->cashier->name,
                    $sale->subtotal,
                    $sale->tax,
                    $sale->discount,
                    $sale->total_amount,
                    $sale->status,
                    $sale->sold_at,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    protected function salesQuery(Request $request)
    {
        return Sale::query()
            ->with(['customer:id,first_name,last_name', 'cashier:id,name'])
            ->when($request->filled('date_from'), function ($query) use ($request) {
                $query->whereDate('sold_at', '>=', $request->string('date_from'));
            })
            ->when($request->filled('date_to'), function ($query) use ($request) {
                $query->whereDate('sold_at', '<=', $request->string('date_to'));
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->latest('sold_at');
    }
}

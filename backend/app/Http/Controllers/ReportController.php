<?php

namespace App\Http\Controllers;

use App\Exports\SalesReportExport;
use App\Models\Sale;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

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

    public function printableSales(Request $request)
    {
        $sales = $this->salesQuery($request)->get();

        $pdf = Pdf::loadView('sales-pdf', [
            'sales' => $sales,
            'generatedAt' => now(),
            'filters' => [
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'status' => $request->get('status'),
            ],
            'summary' => [
                'total_sales' => (float) $sales->sum('total_amount'),
                'total_transactions' => $sales->count(),
            ],
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('sales-report.pdf');
    }

    public function downloadSalesCsv(Request $request)
    {
        $sales = $this->salesQuery($request)->get();
        $filters = [
            'date_from' => $request->get('date_from'),
            'date_to' => $request->get('date_to'),
            'status' => $request->get('status'),
        ];
        $summary = [
            'total_sales' => (float) $sales->sum('total_amount'),
            'total_transactions' => $sales->count(),
        ];
        $filename = 'sales-report-' . now()->format('Ymd-His') . '.xlsx';

        return Excel::download(
            new SalesReportExport($sales, $filters, $summary),
            $filename
        );
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

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sales Report</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #1f2937;
        }
        .header {
            margin-bottom: 20px;
        }
        .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 6px;
        }
        .meta {
            color: #6b7280;
            font-size: 11px;
            margin-bottom: 4px;
        }
        .summary {
            margin: 16px 0;
            padding: 12px;
            background: #f3f4f6;
            border-radius: 6px;
        }
        .summary p {
            margin: 4px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14px;
        }
        th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background: #e5e7eb;
            font-weight: bold;
        }
        .text-right {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Sales Report</div>
        <div class="meta">Generated at: {{ $generatedAt->format('Y-m-d h:i A') }}</div>
        <div class="meta">
            Filters:
            From {{ $filters['date_from'] ?: 'N/A' }},
            To {{ $filters['date_to'] ?: 'N/A' }},
            Status {{ $filters['status'] ?: 'All' }}
        </div>
    </div>

    <div class="summary">
        <p><strong>Total Transactions:</strong> {{ $summary['total_transactions'] }}</p>
        <p><strong>Total Sales:</strong> PHP {{ number_format($summary['total_sales'], 2) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Cashier</th>
                <th>Status</th>
                <th>Sold At</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($sales as $sale)
                <tr>
                    <td>{{ $sale->invoice_number }}</td>
                    <td>{{ trim(($sale->customer->first_name ?? '') . ' ' . ($sale->customer->last_name ?? '')) ?: 'N/A' }}</td>
                    <td>{{ $sale->cashier->name ?? 'N/A' }}</td>
                    <td>{{ ucfirst($sale->status) }}</td>
                    <td>{{ optional($sale->sold_at)->format('Y-m-d h:i A') }}</td>
                    <td class="text-right">PHP {{ number_format((float) $sale->total_amount, 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6">No sales records found for the selected filters.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>

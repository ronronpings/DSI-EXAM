<table>
    <tr>
        <td colspan="9"><strong>Sales Report</strong></td>
    </tr>
    <tr>
        <td colspan="9">Date From: {{ $filters['date_from'] ?: 'N/A' }}</td>
    </tr>
    <tr>
        <td colspan="9">Date To: {{ $filters['date_to'] ?: 'N/A' }}</td>
    </tr>
    <tr>
        <td colspan="9">Status: {{ $filters['status'] ?: 'All' }}</td>
    </tr>
    <tr>
        <td colspan="9">Total Transactions: {{ $summary['total_transactions'] }}</td>
    </tr>
    <tr>
        <td colspan="9">Total Sales: {{ number_format($summary['total_sales'], 2) }}</td>
    </tr>
    <tr></tr>
    <thead>
        <tr>
            <th><strong>Invoice Number</strong></th>
            <th><strong>Customer</strong></th>
            <th><strong>Cashier</strong></th>
            <th><strong>Subtotal</strong></th>
            <th><strong>Tax</strong></th>
            <th><strong>Discount</strong></th>
            <th><strong>Total Amount</strong></th>
            <th><strong>Status</strong></th>
            <th><strong>Sold At</strong></th>
        </tr>
    </thead>
    <tbody>
        @foreach ($sales as $sale)
            <tr>
                <td>{{ $sale->invoice_number }}</td>
                <td>{{ trim(($sale->customer->first_name ?? '') . ' ' . ($sale->customer->last_name ?? '')) }}</td>
                <td>{{ $sale->cashier->name ?? 'N/A' }}</td>
                <td>{{ $sale->subtotal }}</td>
                <td>{{ $sale->tax }}</td>
                <td>{{ $sale->discount }}</td>
                <td>{{ $sale->total_amount }}</td>
                <td>{{ $sale->status }}</td>
                <td>{{ $sale->sold_at }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class SalesReportExport implements FromView
{
    public function __construct(
        protected $sales,
        protected array $filters,
        protected array $summary,
    ) {
    }

    public function view(): View
    {
        return view('exports.sales-report', [
            'sales' => $this->sales,
            'filters' => $this->filters,
            'summary' => $this->summary,
        ]);
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE sales MODIFY status ENUM('pending', 'paid', 'cancelled', 'partially_returned', 'returned') NOT NULL DEFAULT 'paid'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE sales MODIFY status ENUM('pending', 'paid', 'cancelled') NOT NULL DEFAULT 'paid'");
    }
};

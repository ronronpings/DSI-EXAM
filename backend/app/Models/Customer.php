<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    //
    protected $fillable = [
        'customer_code',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'is_active'
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}

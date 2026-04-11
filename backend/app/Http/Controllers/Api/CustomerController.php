<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class CustomerController extends Controller
{
    //
   public function index(Request $request)
   {
       $customers = Customer::query()
        ->when($request->filled('search'), function ($query) use ($request) {
            $search = preg_replace('/\s+/', '', $request->string('search'));

            $query->where(function ($subQuery) use ($search) {
                $subQuery
                    ->whereRaw("REPLACE(customer_code, ' ', '') LIKE ?", ["%{$search}%"])
                    ->orWhereRaw("REPLACE(first_name, ' ', '') LIKE ?", ["%{$search}%"])
                    ->orWhereRaw("REPLACE(last_name, ' ', '') LIKE ?", ["%{$search}%"])
                    ->orWhereRaw("REPLACE(email, ' ', '') LIKE ?", ["%{$search}%"]);
            });
        })
        ->latest()
        ->paginate((int) $request->get('per_page', 10));

        return response()->json($customers);
   }
   public function store(StoreCustomerRequest $request)
   {
   
    $customer = Customer::create($request->validated());

    return response()->json([
        'message' => 'Customer created successfully.',
        'customer' => $customer,
    ],201);
   }

   public function show(Customer $customer)
   {

    return response()->json([
        'customer' => $customer,
    
    ]);

   }

   public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        $customer->update($request->validated());

        return response()->json([
            'message' => 'Customer updated successfully.',
            'data' => $customer->fresh(),
        ]);
    }
    public function destroy(Customer $customer)
    {
        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully.',
        ]);
    }
    
}

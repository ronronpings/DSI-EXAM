<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
// use League\Config\Exception\ValidationException;
use Illuminate\Validation\ValidationException;


class AuthController extends Controller
{
    //
    public function login(LoginRequest $request)
    {
        // dd($request->all());
        $credentials = $request->validated();
        // $credentials = $request->validate([
        //     'email' => 'required|email',
        //     'password' => 'required',
        // ]);
        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('roles'),
        ]);
       
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        // Get all permissions from roles
        $rolePermissions = $user->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->pluck('name');

        // Get direct permissions
        $directPermissions = $user->permissions()->pluck('name');

        // Combine and unique
        $allPermissions = $rolePermissions
            ->concat($directPermissions)
            ->unique()
            ->values();

        return response()->json([
            'user' => $user->load('roles'),
            'permissions' => $allPermissions,
        ]);
    }
}

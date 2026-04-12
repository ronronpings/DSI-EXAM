<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignRoleRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->with('roles:id,name,display_name')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = preg_replace('/\s+/', '', $request->string('search'));

                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->whereRaw("REPLACE(name, ' ', '') LIKE ?", ["%{$search}%"])
                        ->orWhereRaw("REPLACE(email, ' ', '') LIKE ?", ["%{$search}%"]);
                });
            })
            ->latest()
            ->paginate((int) $request->get('per_page', 10));

        return response()->json($users);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        if (! empty($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return response()->json([
            'message' => 'User created successfully.',
            'data' => $user->load('roles:id,name,display_name'),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => $user->load('roles:id,name,display_name'),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (! empty($validated['password'])) {
            $payload['password'] = Hash::make($validated['password']);
        }

        $user->update($payload);

        if (array_key_exists('roles', $validated)) {
            $user->roles()->sync($validated['roles'] ?? []);
        }

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => $user->fresh()->load('roles:id,name,display_name'),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->id === request()->user()->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $user->roles()->detach();
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    public function roles(): JsonResponse
    {
        return response()->json([
            'data' => Role::query()
                ->with('permissions:id,name,display_name')
                ->orderBy('display_name')
                ->get(['id', 'name', 'display_name']),
        ]);
    }

    public function assignRoles(AssignRoleRequest $request, User $user): JsonResponse
    {
        // dd("testing");
        $user->roles()->sync($request->validated('roles'));

        return response()->json([
            'message' => 'Roles assigned successfully.',
            'data' => $user->fresh()->load('roles:id,name,display_name'),
        ]);
    }
}

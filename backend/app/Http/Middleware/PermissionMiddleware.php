<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, String $permissions): Response
    {
        $user = $request->user();

        //  dd([
        //     'user_id' => $user?->id,
        //     'email' => $user?->email,
        //     'required_permission' => $permission,
        //     'role_names' => $user?->roles()->pluck('name')->all(),
        //     'permissions_from_roles' => $user?->roles()
        //         ->with('permissions:id,name')
        //         ->get()
        //         ->pluck('permissions')
        //         ->flatten()
        //         ->pluck('name')
        //         ->unique()
        //         ->values()
        //         ->all(),
        //     'has_permission_result' => $user?->hasPermission($permission),
        // ]);


        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $permissionList = collect(explode('|', $permissions))
            ->map(fn ($permission) => trim($permission))
            ->filter();

        $hasPermission = $permissionList->contains(
            fn ($permission) => $user->hasPermission($permission)
        );

        if (! $hasPermission) {
            return response()->json([
                'message' => 'You do not have permission to perform this action.',
                'required_permissions' => $permissionList->values(),
            ], 403);
        }

        return $next($request);
    }
}

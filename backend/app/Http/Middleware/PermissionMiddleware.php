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
    public function handle(Request $request, Closure $next, String $permission): Response
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

        $allowedPermissions = explode('|', $permission);
        $hasPermission = false;

        foreach ($allowedPermissions as $p) {
            if ($user->hasPermission($p)) {
                $hasPermission = true;
                break;
            }
        }

        if (! $hasPermission) {
            return response()->json([
                'message' => 'You do not have permission to perform this action.',
                'required_permission' => $permission,
            ], 403);
        }

        return $next($request);
    }
}

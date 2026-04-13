<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'role_names',
        'direct_permission_names',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

   public function hasPermission(string $permission): bool
    {
        $hasDirectPermission = $this->permissions()
            ->where('name', $permission)
            ->exists();

        if ($hasDirectPermission) {
            return true;
        }

        return $this->roles()
            ->whereHas('permissions', fn ($query) => $query->where('name', $permission))
            ->exists();
    }


    public function getRoleNamesAttribute(): array
    {
        return $this->roles->pluck('name')->values()->all();
    }

    public function getDirectPermissionNamesAttribute(): array
    {
        return $this->permissions->pluck('name')->values()->all();
    }
}

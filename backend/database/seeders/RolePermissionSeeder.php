<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view_dashboard' => 'View Dashboard',

            'customer.view' => 'View Customers',
            'customer.create' => 'Create Customer',
            'customer.update' => 'Update Customer',
            'customer.delete' => 'Delete Customer',

            'product.view' => 'View Products',
            'product.create' => 'Create Product',
            'product.update' => 'Update Product',
            'product.delete' => 'Delete Product',

            'sales.view' => 'View Sales',
            'sales.create' => 'Create Sale',
            'sales.update' => 'Update Sale',
            'sales.delete' => 'Delete Sale',
            'sales.return' => 'Process Sales Return',

            'reports.view' => 'View Reports',

            'users.view' => 'View Users',
            'users.create' => 'Create User',
            'users.update' => 'Update User',
            'users.delete' => 'Delete User',
            'users.assign_roles' => 'Assign Roles',
            'users.assign_permissions' => 'Assign Permissions',
        ];

        foreach ($permissions as $name => $displayName) {
            Permission::query()->updateOrCreate(
                ['name' => $name],
                ['display_name' => $displayName]
            );
        }

        $admin = Role::query()->updateOrCreate(
            ['name' => 'admin'],
            ['display_name' => 'Administrator']
        );

        $manager = Role::query()->updateOrCreate(
            ['name' => 'manager'],
            ['display_name' => 'Manager']
        );

        $cashier = Role::query()->updateOrCreate(
            ['name' => 'cashier'],
            ['display_name' => 'Cashier']
        );

        $admin->permissions()->sync(
            Permission::query()->pluck('id')->all()
        );

        $manager->permissions()->sync(
            Permission::query()
                ->whereIn('name', [
                    'view_dashboard',
                    'customer.view',
                    'customer.create',
                    'customer.update',
                    'product.view',
                    'product.create',
                    'product.update',
                    'sales.view',
                    'sales.create',
                    'sales.update',
                    'sales.return',
                    'reports.view',
                ])
                ->pluck('id')
                ->all()
        );

        $cashier->permissions()->sync(
            Permission::query()
                ->whereIn('name', [
                    'view_dashboard',
                    'customer.view',
                    'customer.create',
                    'product.view',
                    'sales.view',
                    'sales.update',
                    'sales.create',
                    'sales.create',
                    'sales.delete',
                    'sales.return',
                ])
                ->pluck('id')
                ->all()
        );
    }
}

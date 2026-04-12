<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $permissions = [
            'view_dashboard' => 'View Dashboards',
            'manage_customers' => 'Manage Customers',
            'manage_products' => 'Manage Products',
            'manage_sales' => 'Manage Sales',
            'view_reports' => 'View Reports',
            'manage_users' => 'Manage Users'
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
         $allPermissionIds = Permission::query()->pluck('id')->all();
        $admin->permissions()->sync($allPermissionIds);

        $manager->permissions()->sync(
            Permission::query()
                ->whereIn('name', ['view_dashboard', 'manage_customers', 'manage_products', 'manage_sales', 'view_reports'])
                ->pluck('id')
                ->all()
        );

        $cashier->permissions()->sync(
            Permission::query()
                ->whereIn('name', ['manage_customers', 'manage_sales'])
                ->pluck('id')
                ->all()
        );
    }
}

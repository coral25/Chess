<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'asd',
            'email' => 'asd@a.a',
            'password' => 'asdasdasd',
        ]);
        User::factory()->create([
            'name' => 'qwe',
            'email' => 'qwe@a.a',
            'password' => 'asdasdasd',
        ]);
        $this->call(GameSeeder::class);
    }
}

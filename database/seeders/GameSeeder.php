<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use PHPUnit\Framework\Attributes\Ticket;

class GameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $u1 = $users->findOrFail(1);
        $u2 = $users->findOrFail(2);
        Game::factory() ->for($u1, 'white_player')
                        ->for($u2, 'black_player')
                        ->create();
    }
}

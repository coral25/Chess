<?php

use App\Models\Game;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('game.{gameId}', function ($user, $gameId) {
    $game = Game::find($gameId);

    if (!$game) {
        return false;
    }

    return $user->id === $game->white_player_id || $user->id === $game->black_player_id;
});

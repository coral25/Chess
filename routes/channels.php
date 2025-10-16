<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('game.{gameId}', function ($user, $gameId) {
    // TODO: Add authorization logic to ensure user is part of this game
    return true;
});

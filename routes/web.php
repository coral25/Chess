<?php

use App\Http\Controllers\GameController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Game routes
    Route::get('/', [GameController::class, 'lobby'])->name('home');
    Route::get('lobby', [GameController::class, 'lobby'])->name('lobby');
    Route::get('history', [GameController::class, 'history'])->name('history');
    Route::post('game/create', [GameController::class, 'store'])->name('game.create');
    Route::get('game/{id}', [GameController::class, 'show'])->name('game.show');
    Route::get('game/{id}/review', [GameController::class, 'review'])->name('game.review');
    Route::post('game/{id}/join', [GameController::class, 'join'])->name('game.join');
    Route::post('game/move', [GameController::class, 'move'])->name('game.move');
    Route::post('game/{id}/resign', [GameController::class, 'resign'])->name('game.resign');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

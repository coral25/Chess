<?php

use App\Enums\GameStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->enum('status',GameStatus::cases())->default(GameStatus::CreatingPublic->value);
            $table->string('fen')->default('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
            $table->timestamps();

            $table->unsignedBigInteger('white_player_id')->nullable();
            $table->foreign('white_player_id')->references('id')->on('users')->nullOnDelete();

            $table->unsignedBigInteger('black_player_id')->nullable();
            $table->foreign('black_player_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};

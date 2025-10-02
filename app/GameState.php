<?php

namespace App;

use App\Enums\Color;

class GameState
{
    /**
     * Create a new class instance.
     */
    public Color $activeColor;
    public bool $whiteCastleKingside;
    public bool $whiteCastleQueenside;
    public bool $blackCastleKingside;
    public bool $blackCastleQueenside;
    public ?Square $enPassantTarget;
    public int $halfmoves;
    public int $fullmoves;

    public function __construct()
    {
        //
    }
}

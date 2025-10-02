<?php

namespace App\Enums;

enum PieceType: string
{
    case PAWN = 'p';
    case ROOK = 'r';
    case KNIGHT = 'n';
    case BISHOP = 'b';
    case QUEEN = 'q';
    case KING = 'k';
}

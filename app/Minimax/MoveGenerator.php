<?php

namespace App\Minimax;

use App\Board;
use App\Square;

class MoveGenerator
{
    // Generate all legal moves for active side
    public function generateLegalMoves(Board $board): array
    {
        $moves = [];

        for ($rank = 0; $rank < 8; $rank++) {
            for ($file = 0; $file < 8; $file++) {
                $fromSquare = new Square($file, $rank);
                $piece = $board->getPieceOn($fromSquare);

                if ($piece !== null && $piece->color === $board->gameState->activeColor) {
                    $legalMoves = $board->getLegalMoves($fromSquare);

                    foreach ($legalMoves as $toSquare) {
                        $moves[] = [
                            'from' => $fromSquare,
                            'to' => $toSquare,
                        ];
                    }
                }
            }
        }

        return $moves;
    }
}

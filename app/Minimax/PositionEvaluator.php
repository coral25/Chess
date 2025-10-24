<?php

namespace App\Minimax;

use App\Board;
use App\Enums\Color;
use App\Enums\PieceType;
use App\Piece;
use App\Square;

class PositionEvaluator
{
    // Material values in centipawns
    private const PIECE_VALUES = [
        'p' => 100,  // Pawn
        'n' => 320,  // Knight
        'b' => 330,  // Bishop
        'r' => 500,  // Rook
        'q' => 900,  // Queen
        'k' => 20000, // King
    ];

    // Piece-square tables
    private const PAWN_TABLE = [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5,  5, 10, 25, 25, 10,  5,  5],
        [0,  0,  0, 20, 20,  0,  0,  0],
        [5, -5,-10,  0,  0,-10, -5,  5],
        [5, 10, 10,-20,-20, 10, 10,  5],
        [0,  0,  0,  0,  0,  0,  0,  0]
    ];

    private const KNIGHT_TABLE = [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
    ];

    private const BISHOP_TABLE = [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
    ];

    private const ROOK_TABLE = [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [0,  0,  0,  5,  5,  0,  0,  0]
    ];

    private const QUEEN_TABLE = [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [-5,  0,  5,  5,  5,  5,  0, -5],
        [0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
    ];

    private const KING_MIDDLE_GAME_TABLE = [
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [20, 20,  0,  0,  0,  0, 20, 20],
        [20, 30, 10,  0,  0, 10, 30, 20]
    ];

    private const KING_END_GAME_TABLE = [
        [-50,-40,-30,-20,-20,-30,-40,-50],
        [-30,-20,-10,  0,  0,-10,-20,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-30,  0,  0,  0,  0,-30,-30],
        [-50,-30,-30,-30,-30,-30,-30,-50]
    ];

    // Evaluate position in white's pov, (positive value means white is favored)
    public function evaluate(Board $board): int
    {
        $score = 0;

        for ($rank = 0; $rank < 8; $rank++) {
            for ($file = 0; $file < 8; $file++) {
                $square = new Square($file, $rank);
                $piece = $board->getPieceOn($square);

                if ($piece !== null) {
                    $pieceValue = $this->evaluatePiece($piece, $square, $board);
                    $score += $piece->color === Color::WHITE ? $pieceValue : -$pieceValue;
                }
            }
        }

        return $score;
    }

    // Evaluate a piece, considering its position
    private function evaluatePiece(Piece $piece, Square $square, Board $board): int
    {
        $materialValue = self::PIECE_VALUES[$piece->type->value];
        $positionalValue = $this->getPositionalValue($piece, $square, $board);

        return $materialValue + $positionalValue;
    }

    // Get the corresponding value from the piece-square table
    private function getPositionalValue(Piece $piece, Square $square, Board $board): int
    {
        $file = $square->file;
        $rank = $square->rank;

        // Flip table for black
        if ($piece->color === Color::BLACK) {
            $rank = 7 - $rank;
        }

        $value = match ($piece->type) {
            PieceType::PAWN => self::PAWN_TABLE[$rank][$file],
            PieceType::KNIGHT => self::KNIGHT_TABLE[$rank][$file],
            PieceType::BISHOP => self::BISHOP_TABLE[$rank][$file],
            PieceType::ROOK => self::ROOK_TABLE[$rank][$file],
            PieceType::QUEEN => self::QUEEN_TABLE[$rank][$file],
            PieceType::KING => $this->isEndgame($board)
                ? self::KING_END_GAME_TABLE[$rank][$file]
                : self::KING_MIDDLE_GAME_TABLE[$rank][$file],
        };

        return $value;
    }

    // Determine if in endgame
    private function isEndgame(Board $board): bool
    {
        $totalMaterial = 0;
        $queenCount = 0;

        for ($rank = 0; $rank < 8; $rank++) {
            for ($file = 0; $file < 8; $file++) {
                $piece = $board->getPieceOn(new Square($file, $rank));
                if ($piece !== null && $piece->type !== PieceType::PAWN && $piece->type !== PieceType::KING) {
                    $totalMaterial += self::PIECE_VALUES[$piece->type->value];
                    if ($piece->type === PieceType::QUEEN) {
                        $queenCount++;
                    }
                }
            }
        }

        // Endgame if no queens or only 1 queen and 1 minor piece in value on both sides
        return $queenCount === 0 || $totalMaterial < 2500;
    }
}
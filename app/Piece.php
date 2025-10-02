<?php

namespace App;

use App\Enums\Color;
use App\Enums\PieceType;

class Piece
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public readonly Color $color,
        public readonly PieceType $type,
    ) {
        //
    }

    public function getChar(): string
    {
        return ($this->color == Color::BLACK) ?
            $this->type->value : strtoupper($this->type->value);
    }

    public function canMoveTo(Board $board, Square $from, Square $to): bool
    {
        if (!$to->isValid()) return false;
        if ($from->equals($to)) return false;

        return match ($this->type) {
            PieceType::PAWN => $this->validatePawnMove($board, $from, $to),
            PieceType::ROOK => $this->validateRookMove($board, $from, $to),
            PieceType::KNIGHT => $this->validateKnightMove($board, $from, $to),
            PieceType::BISHOP => $this->validateBishopMove($board, $from, $to),
            PieceType::QUEEN => $this->validateQueenMove($board, $from, $to),
            PieceType::KING => $this->validateKingMove($board, $from, $to),
        };
    }

    private function validatePawnMove(Board $board, Square $from, Square $to): bool
    {
        $direction = $this->color === Color::WHITE ? 1 : -1;
        $startRank = $this->color === Color::WHITE ? 1 : 6;
        $rankDiff = $to->rank - $from->rank;
        $fileDiff = abs($to->file - $from->file);

        // Forward move
        if ($fileDiff === 0) {
            if ($rankDiff === $direction && $board->getPieceOn($to) === null) {
                return true;
            }
            // Double move from starting position
            if (
                $rankDiff === 2 * $direction && $from->rank === $startRank &&
                $board->getPieceOn($to) === null &&
                $board->getPieceOn(new Square($from->file, $from->rank + $direction)) === null
            ) {
                return true;
            }
        }

        // Capture
        if ($fileDiff === 1 && $rankDiff === $direction) {
            $targetPiece = $board->getPieceOn($to);
            if ($targetPiece !== null && $targetPiece->color !== $this->color) {
                return true;
            }
        }

        return false;
    }

    private function validateRookMove(Board $board, Square $from, Square $to): bool
    {
        if ($from->file !== $to->file && $from->rank !== $to->rank) {
            return false;
        }

        return $this->isPathClear($board, $from, $to) &&
            $this->canCaptureOrMoveToEmpty($board, $to);
    }

    private function validateKnightMove(Board $board, Square $from, Square $to): bool
    {
        $rankDiff = abs($to->rank - $from->rank);
        $fileDiff = abs($to->file - $from->file);

        if (($rankDiff === 2 && $fileDiff === 1) || ($rankDiff === 1 && $fileDiff === 2)) {
            return $this->canCaptureOrMoveToEmpty($board, $to);
        }

        return false;
    }

    private function validateBishopMove(Board $board, Square $from, Square $to): bool
    {
        if (abs($to->rank - $from->rank) !== abs($to->file - $from->file)) {
            return false;
        }

        return $this->isPathClear($board, $from, $to) &&
            $this->canCaptureOrMoveToEmpty($board, $to);
    }

    private function validateQueenMove(Board $board, Square $from, Square $to): bool
    {
        return $this->validateRookMove($board, $from, $to) ||
            $this->validateBishopMove($board, $from, $to);
    }

    private function validateKingMove(Board $board, Square $from, Square $to): bool
    {
        $rankDiff = abs($to->rank - $from->rank);
        $fileDiff = abs($to->file - $from->file);

        if ($rankDiff <= 1 && $fileDiff <= 1) {
            return $this->canCaptureOrMoveToEmpty($board, $to);
        }

        return false;
    }

    private function isPathClear(Board $board, Square $from, Square $to): bool
    {
        $rankStep = $to->rank <=> $from->rank;
        $fileStep = $to->file <=> $from->file;

        $currentFile = $from->file + $fileStep;
        $currentRank = $from->rank + $rankStep;

        while ($currentFile !== $to->file || $currentRank !== $to->rank) {
            if ($board->getPieceOn(new Square($currentFile, $currentRank)) !== null) {
                return false;
            }
            $currentFile += $fileStep;
            $currentRank += $rankStep;
        }

        return true;
    }

    private function canCaptureOrMoveToEmpty(Board $board, Square $to): bool
    {
        $targetPiece = $board->getPieceOn($to);
        return $targetPiece === null || $targetPiece->color !== $this->color;
    }
}

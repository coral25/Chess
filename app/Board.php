<?php

namespace App;

use App\Enums\Color;
use App\Enums\PieceType;

class Board
{
    /**
     * Create a new class instance.
     */
    private array $board;
    public GameState $gameState;

    public function __construct()
    {
        $this->board = array_fill(0, 8, array_fill(0, 8, null));
        $this->gameState = new GameState();
    }

    public function getPieceOn(Square $square): ?Piece
    {
        return $this->board[$square->file][$square->rank];
    }

    public function setPieceOn(Square $square, ?Piece $piece): void
    {
        $this->board[$square->file][$square->rank] = $piece;
    }

    public function movePiece(Square $from, Square $to, string $fen): bool
    {
        $this->fromFen($fen);

        $piece = $this->getPieceOn($from);

        if (!$piece) return false;

        if (!$piece->canMoveTo($this, $from, $to)) return false;

        if (!$this->gameState->activeColor === $piece->color) return false;

        if ($piece->type === PieceType::KING && abs($to->file - $from->file) === 2) {
            $this->executeCastling($from, $to);
        } else {
            $this->executeMove($piece, $from, $to);
        }

        return true;
    }

    private function executeMove(Piece $piece, Square $from, Square $to)
    {
        $isCapture = $this->getPieceOn($to) !== null;

        //handle en passant
        if (
            $piece->type === PieceType::PAWN && $this->gameState->enPassantTarget
            && $to->equals($this->gameState->enPassantTarget)
        ) {
            $isCapture = true;
            $capturedPawnRank = $piece->color === Color::WHITE ? $to->rank - 1 : $to->rank + 1;
            $this->setPieceOn(new Square($to->file, $capturedPawnRank), null);
        }

        $this->setPieceOn($to, $piece);
        $this->setPieceOn($from, null);

        $this->updateGameState($piece, $from, $to, $isCapture);
    }

    private function executeCastling(Square $kingFrom, Square $kingTo): void
    {
        $king = $this->getPieceOn($kingFrom);
        $isKingSide = $kingTo->file - $kingFrom->file > 0;

        $rookFrom = new Square($isKingSide ? 7 : 0, $kingFrom->rank);
        $rookTo = new Square($isKingSide ? 5 : 3, $kingFrom->rank);

        $rook = $this->getPieceOn($rookFrom);

        $this->setPieceOn($kingTo, $king);
        $this->setPieceOn($kingFrom, null);

        $this->setPieceOn($rookTo, $rook);
        $this->setPieceOn($rookFrom, null);

        if ($king->color === Color::WHITE) {
            $this->gameState->whiteCastleKingside = false;
            $this->gameState->whiteCastleQueenside = false;
        } else {
            $this->gameState->blackCastleKingside = false;
            $this->gameState->blackCastleQueenside = false;
        }

        $this->gameState->activeColor = $king->color->other();
        $this->gameState->enPassantTarget = null;
        $this->gameState->halfmoves++;

        if ($king->color == Color::BLACK) {
            $this->gameState->fullmoves++;
        }
    }

    private function fromFen(string $fen)
    {
        [$piecePlacement, $activeColor, $castling, $enPassant, $halfmoves, $fullmoves] = explode(' ', trim($fen));

        $this->placePieces($piecePlacement);

        //set game state
        $this->gameState = new GameState();

        $this->gameState->activeColor = Color::from($activeColor);

        $this->gameState->whiteCastleKingside  = str_contains($castling, 'K');
        $this->gameState->whiteCastleQueenside = str_contains($castling, 'Q');
        $this->gameState->blackCastleKingside  = str_contains($castling, 'k');
        $this->gameState->blackCastleQueenside = str_contains($castling, 'q');

        $this->gameState->enPassantTarget = ($enPassant == '-') ? null : Square::fromNotation($enPassant);

        $this->gameState->halfmoves = $halfmoves;
        $this->gameState->fullmoves = $fullmoves;

        return;
    }

    public function toFen(): string
    {
        $fen = [];

        $fen[] = $this->generatePiecePlacement();

        $fen[] = $this->gameState->activeColor->value;

        $castling = '';
        if ($this->gameState->whiteCastleKingside) {
            $castling .= 'K';
        }

        if ($this->gameState->whiteCastleQueenside) {
            $castling .= 'Q';
        }

        if ($this->gameState->blackCastleKingside) {
            $castling .= 'k';
        }

        if ($this->gameState->blackCastleQueenside) {
            $castling .= 'q';
        }

        $fen[] = empty($castling) ? '-' : $castling;

        $fen[] = $this->gameState->enPassantTarget ? $this->gameState->enPassantTarget->toNotation() : '-';

        $fen[] = (string) $this->gameState->halfmoves;

        $fen[] = (string) $this->gameState->fullmoves;

        return implode(' ', $fen);
    }

    public function placePieces(string $piecePlacement)
    {
        $ranks = explode('/', $piecePlacement);

        for ($rank = 7; $rank >= 0; $rank--) {
            $file = 0;
            for ($j = 0; $j < strlen($ranks[7 - $rank]); $j++) {
                $char = $ranks[7 - $rank][$j];
                if (is_numeric($char)) {
                    $file += (int) $char;
                } else {
                    $piece = $this->charToPiece($char);
                    $this->setPieceOn(new Square($file, $rank), $piece);
                    $file++;
                }
            }
        }
    }

    public function generatePiecePlacement(): string
    {
        $ranks = [];

        for ($rank = 7; $rank >= 0; $rank--) {
            $rankString = '';

            $emptySquares = 0;

            for ($file = 0; $file < 8; $file++) {
                $piece = $this->getPieceOn(new Square($file, $rank));
                if ($piece === null) {
                    $emptySquares++;
                } else {
                    if ($emptySquares > 0) {
                        $rankString .= (string) $emptySquares;
                        $emptySquares = 0;
                    }
                    $rankString .= $piece->getChar();
                }
            }
            if ($emptySquares > 0) {
                $rankString .= (string) $emptySquares;
            }

            $ranks[] = $rankString;
        }

        return implode('/', $ranks);
    }

    private function charToPiece(string $char): Piece
    {
        $color = ctype_upper($char) ? Color::WHITE : Color::BLACK;
        $type  = PieceType::from(strtolower($char));
        return new Piece($color, $type);
    }

    private function updateGameState(Piece $piece, Square $from, Square $to, bool $isCapture): void
    {
        //switch color
        $this->gameState->activeColor = $piece->color->other();

        //castling
        $this->updateCastlingRights($piece, $from, $to);

        //en passant target
        if ($piece->type === PieceType::PAWN && abs($to->rank - $from->rank) === 2) {
            $direction = $piece->color === Color::WHITE ? 1 : -1;
            $this->gameState->enPassantTarget = new Square($from->file, $from->rank + $direction);
        } else {
            $this->gameState->enPassantTarget = null;
        }

        //halfmove counter
        if ($piece->type === PieceType::PAWN || $isCapture) {
            $this->gameState->halfmoves = 0;
        } else {
            $this->gameState->halfmoves++;
        }

        //fullmove counter
        if ($piece->color === Color::BLACK) {
            $this->gameState->fullmoves++;
        }
    }
    private function updateCastlingRights(Piece $piece, Square $from, Square $to): void
    {
        //king move
        if ($piece->type === PieceType::KING) {
            if ($piece->color === Color::WHITE) {
                $this->gameState->whiteCastleKingside = false;
                $this->gameState->whiteCastleQueenside = false;
            } else {
                $this->gameState->blackCastleKingside = false;
                $this->gameState->blackCastleQueenside = false;
            }
        }

        //rook move
        if ($piece->type === PieceType::ROOK) {
            if ($piece->color === Color::WHITE && $from->rank === 0) {
                if ($from->file === 7) $this->gameState->whiteCastleKingside = false;
                if ($from->file === 0) $this->gameState->whiteCastleQueenside = false;
            } elseif ($piece->color === Color::BLACK && $from->rank === 7) {
                if ($from->file === 7) $this->gameState->blackCastleKingside = false;
                if ($from->file === 0) $this->gameState->blackCastleQueenside = false;
            }
        }

        //rook capture
        if ($to->rank === 0) {
            if ($piece->color === Color::WHITE) {
                if ($to->file === 7) $this->gameState->whiteCastleKingside = false;
                if ($to->file === 0) $this->gameState->whiteCastleQueenside = false;
            } elseif ($to->rank === 7) {
                if ($to->file === 7) $this->gameState->blackCastleKingside = false;
                if ($to->file === 0) $this->gameState->blackCastleQueenside = false;
            }
        }
    }
}

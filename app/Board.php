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

    public function __construct(string $fen)
    {
        $this->board = array_fill(0, 8, array_fill(0, 8, null));
        $this->fromFen($fen);
    }

    public function getPieceOn(Square $square): ?Piece
    {
        return $this->board[$square->file][$square->rank];
    }

    public function setPieceOn(Square $square, ?Piece $piece): void
    {
        $this->board[$square->file][$square->rank] = $piece;
    }

    public function movePiece(Square $from, Square $to): bool
    {
        $piece = $this->getPieceOn($from);

        if (!$piece) return false;

        if (!$piece->canMoveTo($this, $from, $to)) return false;

        $this->setPieceOn($to, $piece);
        $this->setPieceOn($from, null);

        return true;
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
}

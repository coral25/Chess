<?php

namespace App;

use App\Enums\Color;

class Square
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public readonly int $file,
        public readonly int $rank
    ) {}

    public function isValid(): bool
    {
        return $this->rank >= 0 && $this->rank <= 8 && $this->file >= 0 && $this->file <= 8;
    }

    public function equals(Square $other): bool
    {
        return $this->rank === $other->rank && $this->file === $other->file;
    }

    public static function fromNotation(string $notation): Square
    {
        $rank = (int)$notation[1] - 1;
        $file = ord($notation[0]) - ord('a');
        return new Square($file, $rank);
    }

    public function toNotation(): string
    {
        return chr(ord('a') + $this->file) . ($this->rank + 1);
    }

    public function isAttacked(Board $board, Color $attackerColor): bool
    {
        for ($file = 0; $file < 8; $file++) {
            for ($rank = 0; $rank < 8; $rank++) {
                $square = new Square($file, $rank);
                $piece = $board->getPieceOn($square);
                if ($piece && $piece->color === $attackerColor) {
                    if ($piece->canAttack($board, $square, $this)) return true;
                }
            }
        }
        return false;
    }
}

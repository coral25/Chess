<?php

namespace App\Enums;

enum Color: string
{
    case WHITE = 'w';
    case BLACK = 'b';

    public function other(): Color
    {
        return $this === Color::WHITE ? Color::BLACK : Color::WHITE;
    }
}

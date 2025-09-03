<?php

namespace App\Enums;

enum GameStatus: int
{
    case InProgress = 0;
    case WhiteWin = 1;
    case BlackWin = 2;
    case Draw = 3;
}

<?php

namespace App\Http\Controllers;

use App\Board;
use App\Events\MoveProcessed;
use App\Models\Game;
use App\Models\Move;
use App\Square;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GameController extends Controller
{
    public function index() {}

    public function store(Request $request)
    {
        #todo validate..

        $game = Game::create($request);
        $game->white_player()->associate(Auth::id());
        $game->save();
    }

    public function move(Request $request)
    {
        /*
        * request format:
        *   'movetext' 'game_id' 'player_id'
        */

        //validate


        $move = new Move;

        $game = Game::findOrFail($request->game_id);
        $move_number = $game->moves()->count() + 1;

        $move->movetext = $request->movetext;
        $move->game_id = $request->game_id;
        $move->move_number = $move_number;


        //$fen = moveFen($request->movetext, $request->game_id)


        $fen = $game->fen;

        $board = new Board();

        [$from, $to] = explode(' ', trim($request->movetext));

        $board->movePiece(Square::fromNotation($from), Square::fromNotation($to), $fen);


        $move->fen = $game->fen = $board->toFen();


        $game->save();
        $move->save();

        //dispatch move event
        MoveProcessed::dispatch($game);

        return;
    }
}

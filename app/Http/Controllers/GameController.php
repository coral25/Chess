<?php

namespace App\Http\Controllers;

use App\Board;
use App\Enums\GameStatus;
use App\Events\MoveProcessed;
use App\Minimax\MinimaxEngine;
use App\Models\Game;
use App\Models\Move;
use App\Square;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GameController extends Controller
{
    public function lobby()
    {
        $userId = Auth::id();

        $userGames = Game::with(['white_player', 'black_player'])
            ->where(function ($query) use ($userId) {
                $query->where('white_player_id', $userId)
                    ->orWhere('black_player_id', $userId);
            })
            ->latest()
            ->get();

        $availableGames = Game::with(['white_player'])
            ->whereIn('status', [GameStatus::CreatingPublic->value, GameStatus::CreatingPrivate->value])
            ->where(function ($query) use ($userId) {
                $query->whereNull('white_player_id')
                    ->orWhere('white_player_id', '!=', $userId);
            })
            ->where(function ($query) use ($userId) {
                $query->whereNull('black_player_id')
                    ->orWhere('black_player_id', '!=', $userId);
            })
            ->latest()
            ->get();

        return Inertia::render('lobby', [
            'userGames' => $userGames,
            'availableGames' => $availableGames,
        ]);
    }

    public function history()
    {
        $userId = Auth::id();

        $finishedGames = Game::with(['white_player', 'black_player'])
            ->where(function ($query) use ($userId) {
                $query->where('white_player_id', $userId)
                    ->orWhere('black_player_id', $userId);
            })
            ->whereIn('status', [GameStatus::WhiteWin->value, GameStatus::BlackWin->value, GameStatus::Draw->value])
            ->latest()
            ->get();

        return Inertia::render('match-history', [
            'finishedGames' => $finishedGames,
        ]);
    }

    public function show($id)
    {
        $game = Game::with(['white_player', 'black_player', 'moves' => function ($query) {
            $query->orderBy('move_number');
        }])->findOrFail($id);

        $userId = Auth::id();

        if ($userId !== $game->white_player_id && $userId !== $game->black_player_id) {
            return redirect()->route('lobby')->with('error', 'You are not part of this game.');
        }

        return Inertia::render('game', [
            'game' => $game,
        ]);
    }

    public function review($id)
    {
        $game = Game::with(['white_player', 'black_player', 'moves' => function ($query) {
            $query->orderBy('move_number');
        }])->findOrFail($id);

        $userId = Auth::id();

        if ($userId !== $game->white_player_id && $userId !== $game->black_player_id) {
            return redirect()->route('lobby')->with('error', 'You are not part of this game.');
        }

        return Inertia::render('review', [
            'game' => $game,
        ]);
    }

    public function analyzeMove(Request $request, $id)
    {
        $game = Game::with(['moves' => function ($query) {
            $query->orderBy('move_number');
        }])->findOrFail($id);

        $userId = Auth::id();

        if ($userId !== $game->white_player_id && $userId !== $game->black_player_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $moveNumber = $request->input('move_number');

        if (!$moveNumber || $moveNumber < 1) {
            return response()->json(['error' => 'Invalid move number'], 400);
        }

        // Get the move being analyzed
        $move = $game->moves->firstWhere('move_number', $moveNumber);

        if (!$move) {
            return response()->json(['error' => 'Move not found'], 404);
        }

        // Get the FEN before this move was made
        if ($moveNumber === 1) {
            $previousFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        } else {
            $previousMove = $game->moves->firstWhere('move_number', $moveNumber - 1);
            $previousFen = $previousMove ? $previousMove->fen : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        }

        try {
            $engine = new MinimaxEngine();
            $result = $engine->findBestMove($previousFen, 2);

            return response()->json([
                'move_number' => $move->move_number,
                'actual_move' => $move->movetext,
                'best_move' => $result['move'],
                'evaluation' => $result['evaluation'],
                'is_best' => $move->movetext === $result['move'],
                'nodes' => $result['nodes'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to analyze move: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $game = Game::create([
            'white_player_id' => Auth::id(),
            'fen' => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'status' => GameStatus::CreatingPublic,
        ]);

        return redirect()->route('lobby')->with('success', 'Game created!');
    }

    public function join(Request $request, $id)
    {
        $game = Game::findOrFail($id);
        $userId = Auth::id();

        if (!in_array($game->status, [GameStatus::CreatingPublic, GameStatus::CreatingPrivate])) {
            return redirect()->route('lobby')->with('error', 'This game is no longer available to join.');
        }

        if ($game->white_player_id !== null && $game->black_player_id !== null) {
            return redirect()->route('lobby')->with('error', 'This game is already full.');
        }

        if ($game->white_player_id === $userId || $game->black_player_id === $userId) {
            return redirect()->route('lobby')->with('error', 'You are already in this game.');
        }

        if ($game->white_player_id === null) {
            $game->white_player_id = $userId;
        } elseif ($game->black_player_id === null) {
            $game->black_player_id = $userId;
        }

        if ($game->white_player_id !== null && $game->black_player_id !== null) {
            $game->status = GameStatus::InProgress;
        }

        $game->save();

        return redirect()->route('lobby')->with('success', 'Joined the game!');
    }

    public function move(Request $request)
    {
        /*
        * request format:
        *   'movetext' 'game_id' 'player_id'
        */

        $game = Game::findOrFail($request->game_id);
        $userId = Auth::id();

        //check if player is in the game
        if ($userId !== $game->white_player_id && $userId !== $game->black_player_id) {
            return;
        }
        //check color
        $fenParts = explode(' ', trim($game->fen));
        $activeColor = $fenParts[1];

        if ($activeColor === 'w' && $userId !== $game->white_player_id) {
            return;
        }

        if ($activeColor === 'b' && $userId !== $game->black_player_id) {
            return;
        }

        $fen = $game->fen;

        $board = new Board();

        [$from, $to] = explode(' ', trim($request->movetext));

        $result = $board->movePiece(Square::fromNotation($from), Square::fromNotation($to), $fen);

        // Only save the move if it was successful
        if ($result === 'move made' || $result === 'checkmate' || $result === 'stalemate') {
            $move = new Move;
            $move_number = $game->moves()->count() + 1;

            $move->movetext    = $request->movetext;
            $move->game_id     = $request->game_id;
            $move->move_number = $move_number;
            $move->fen = $game->fen = $board->toFen();

            if ($result === 'checkmate') {
                $fenParts = explode(' ', trim($game->fen));
                $activeColor = $fenParts[1];
                $game->status = $activeColor === 'w' ? GameStatus::BlackWin : GameStatus::WhiteWin;
            } elseif ($result === 'stalemate') {
                $game->status = GameStatus::Draw;
            }

            $game->save();
            $move->save();
        }

        //dispatch move event
        MoveProcessed::dispatch($game, $result);
        return;
    }

    public function resign(Request $request, $id)
    {
        $game = Game::findOrFail($id);
        $userId = Auth::id();

        if ($userId !== $game->white_player_id && $userId !== $game->black_player_id) {
            return redirect()->route('lobby')->with('error', 'You are not part of this game.');
        }

        if ($game->status !== GameStatus::InProgress) {
            return redirect()->route('game.show', $game->id)->with('error', 'This game is not in progress.');
        }

        if ($userId === $game->white_player_id) {
            $game->status = GameStatus::BlackWin;
        } else {
            $game->status = GameStatus::WhiteWin;
        }

        $game->save();

        return redirect()->route('lobby')->with('success', 'Resigned.');
    }

    public function suggestMove(Request $request, $id)
    {
        $game = Game::findOrFail($id);

        $fen = $request->input('fen', $game->fen);
        $depth = $request->input('depth', 3); // Default depth of 3

        try {
            $engine = new MinimaxEngine();
            $result = $engine->findBestMove($fen, $depth);

            return response()->json([
                'move' => $result['move'],
                'evaluation' => $result['evaluation'],
                'nodes' => $result['nodes'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to calculate best move: ' . $e->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Minimax;

use App\Board;
use App\Square;

class MinimaxEngine
{
    private PositionEvaluator $evaluator;
    private MoveGenerator $moveGenerator;
    private int $nodesSearched = 0;
    private ?array $bestMove = null;
    private int $bestEvaluation = 0;

    public function __construct()
    {
        $this->evaluator = new PositionEvaluator();
        $this->moveGenerator = new MoveGenerator();
    }

    public function findBestMove(string $fen, int $depth = 4): array
    {
        $this->nodesSearched = 0;
        $this->bestMove = null;
        $this->bestEvaluation = 0;

        $board = new Board();
        $board->fromFen($fen);
        $legalMoves = $this->moveGenerator->generateLegalMoves($board);

        if (empty($legalMoves)) {
            return [
                'move' => null,
                'evaluation' => 0,
                'nodes' => 0,
                'error' => 'No legal moves available'
            ];
        }

        $isMaximizing = $board->gameState->activeColor->value === 'w';
        $bestScore = $isMaximizing ? PHP_INT_MIN : PHP_INT_MAX;
        $bestMoveFound = null;

        $alpha = PHP_INT_MIN;
        $beta = PHP_INT_MAX;

        foreach ($legalMoves as $move) {
            // Make the move
            $newBoard = clone $board;
            $result = $newBoard->movePiece($move['from'], $move['to'], $fen);

            // Skip if move is illegal
            if ($result !== 'move made') {
                continue;
            }

            // Search this position
            $newFen = $newBoard->toFen();
            $score = $this->minimax($newFen, $depth - 1, !$isMaximizing, $alpha, $beta);

            // Update best move
            if ($isMaximizing && $score > $bestScore) {
                $bestScore = $score;
                $bestMoveFound = $move;
                $alpha = max($alpha, $score);
            } elseif (!$isMaximizing && $score < $bestScore) {
                $bestScore = $score;
                $bestMoveFound = $move;
                $beta = min($beta, $score);
            }
        }

        $this->bestMove = $bestMoveFound;
        $this->bestEvaluation = $bestScore;

        return [
            'move' => $bestMoveFound ? $this->formatMove($bestMoveFound) : null,
            'evaluation' => $bestScore,
            'nodes' => $this->nodesSearched,
        ];
    }

    private function minimax(string $fen, int $depth, bool $isMaximizing, int $alpha, int $beta): int
    {
        $this->nodesSearched++;

        // Reaching depth limit
        if ($depth === 0) {
            $board = new Board();
            $board->fromFen($fen);
            return $this->evaluator->evaluate($board);
        }

        $board = new Board();
        $board->fromFen($fen);
        $legalMoves = $this->moveGenerator->generateLegalMoves($board);

        // Check for end
        if (empty($legalMoves)) {
            if (!$board->hasAnyLegalMoves()) {
                // Checkmate
                return $isMaximizing ? -100000 : 100000;
            }
            // Stalemate
            return 0;
        }

        if ($isMaximizing) {
            $maxEval = PHP_INT_MIN;

            foreach ($legalMoves as $move) {
                $newBoard = clone $board;
                $result = $newBoard->movePiece($move['from'], $move['to'], $fen);

                if ($result === 'illegal move') {
                    continue;
                }

                $newFen = $newBoard->toFen();
                $eval = $this->minimax($newFen, $depth - 1, false, $alpha, $beta);
                $maxEval = max($maxEval, $eval);
                $alpha = max($alpha, $eval);

                // Alpha-beta pruning
                if ($beta <= $alpha) {
                    break;
                }
            }

            return $maxEval;
        } else {
            $minEval = PHP_INT_MAX;

            foreach ($legalMoves as $move) {
                $newBoard = clone $board;
                $result = $newBoard->movePiece($move['from'], $move['to'], $fen);

                if ($result === 'illegal move') {
                    continue;
                }

                $newFen = $newBoard->toFen();
                $eval = $this->minimax($newFen, $depth - 1, true, $alpha, $beta);
                $minEval = min($minEval, $eval);
                $beta = min($beta, $eval);

                // Alpha-beta pruning
                if ($beta <= $alpha) {
                    break;
                }
            }

            return $minEval;
        }
    }

    private function formatMove(array $move): string
    {
        $from = $this->squareToAlgebraic($move['from']);
        $to = $this->squareToAlgebraic($move['to']);
        return "$from $to";
    }

    private function squareToAlgebraic(Square $square): string
    {
        $files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        $file = $files[$square->file];
        $rank = $square->rank + 1;
        return "$file$rank";
    }

    public function getEvaluation(): int
    {
        return $this->bestEvaluation;
    }

    public function getNodesSearched(): int
    {
        return $this->nodesSearched;
    }
}

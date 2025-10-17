import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChessBoard from '@/components/game/chess-board';
import MoveList from '@/components/game/move-list';
import PlayerInfo from '@/components/game/player-info';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';
import { fenToBoard } from '../lib/fen';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Review Game',
        href: '/review',
    },
];

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function Review() {
    const { game, auth } = usePage<SharedData>().props;
    const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(game.moves?.length ?? 0);

    const isPlayerBlack = auth.user.id === game.black_player_id;

    // Get FEN for current move index
    const getCurrentFen = () => {
        if (currentMoveIndex === 0) {
            return INITIAL_FEN;
        }
        if (!game.moves || currentMoveIndex > game.moves.length) {
            return game.fen;
        }
        return game.moves[currentMoveIndex - 1].fen;
    };

    const currentFen = getCurrentFen();
    const board = fenToBoard(currentFen);

    const handleFirst = () => {
        setCurrentMoveIndex(0);
    };

    const handlePrevious = () => {
        if (currentMoveIndex > 0) {
            setCurrentMoveIndex(currentMoveIndex - 1);
        }
    };

    const handleNext = () => {
        if (game.moves && currentMoveIndex < game.moves.length) {
            setCurrentMoveIndex(currentMoveIndex + 1);
        }
    };

    const handleLast = () => {
        setCurrentMoveIndex(game.moves?.length ?? 0);
    };

    const handleMoveClick = (index: number) => {
        setCurrentMoveIndex(index + 1);
    };

    const handleStartClick = () => {
        setCurrentMoveIndex(0);
    };

    const opponentPlayer = isPlayerBlack ? game.white_player : game.black_player;
    const currentPlayer = isPlayerBlack ? game.black_player : game.white_player;
    const opponentName = isPlayerBlack ? 'White Player' : 'Black Player';
    const currentName = isPlayerBlack ? 'Black Player' : 'White Player';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Review Game" />
            <div className="flex min-h-0 items-center justify-center gap-8 p-4">
                <div className="flex flex-col gap-4">
                    <PlayerInfo player={opponentPlayer} defaultName={opponentName} time="" position="top" />

                    <ChessBoard
                        board={board}
                        isPlayerBlack={isPlayerBlack}
                        selectedSquare={null}
                        draggedFrom={null}
                        onSquareClick={() => {}}
                        onDragStart={() => {}}
                        onDragOver={() => {}}
                        onDrop={() => {}}
                        onDragEnd={() => {}}
                    />

                    <PlayerInfo player={currentPlayer} defaultName={currentName} time="" position="bottom" />
                </div>

                <div className="flex flex-col gap-4">
                    <MoveList
                        moves={game.moves}
                        currentMoveIndex={currentMoveIndex}
                        onMoveClick={handleMoveClick}
                        onStartClick={handleStartClick}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle>Navigation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleFirst}
                                        disabled={currentMoveIndex === 0}
                                        title="First move"
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handlePrevious}
                                        disabled={currentMoveIndex === 0}
                                        title="Previous move"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleNext}
                                        disabled={!game.moves || currentMoveIndex >= game.moves.length}
                                        title="Next move"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleLast}
                                        disabled={!game.moves || currentMoveIndex >= game.moves.length}
                                        title="Last move"
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="text-center text-sm text-muted-foreground">
                                    Move {currentMoveIndex} of {game.moves?.length ?? 0}
                                </div>
                                <Button variant="outline" className="w-full" onClick={() => router.get('/history')}>
                                    Back to History
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

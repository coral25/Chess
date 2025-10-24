import ChessBoard from '@/components/game/chess-board';
import MoveList from '@/components/game/move-list';
import PlayerInfo from '@/components/game/player-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fenToBoard } from '../lib/fen';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Review Game',
        href: '/review',
    },
];

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

interface AnalysisData {
    move_number: number;
    actual_move: string;
    best_move: string | null;
    evaluation: number;
    is_best: boolean;
    nodes?: number;
    error?: string;
}

export default function Review() {
    const { game, auth } = usePage<SharedData>().props;
    const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(game.moves?.length ?? 0);
    const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisData | null>(null);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [analysisCache, setAnalysisCache] = useState<Map<number, AnalysisData>>(new Map());

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

    // Fetch analysis when move changes
    useEffect(() => {
        if (currentMoveIndex === 0) {
            setCurrentAnalysis(null);
            return;
        }

        // Check cache first
        if (analysisCache.has(currentMoveIndex)) {
            setCurrentAnalysis(analysisCache.get(currentMoveIndex)!);
            return;
        }

        // Fetch from API
        const fetchAnalysis = async () => {
            setIsLoadingAnalysis(true);
            setCurrentAnalysis(null);

            try {
                const getCookie = (name: string) => {
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2) return parts.pop()?.split(';').shift();
                    return null;
                };

                const xsrfToken = getCookie('XSRF-TOKEN');

                const response = await fetch(route('game.analyze-move', { id: game.id }), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ move_number: currentMoveIndex }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: AnalysisData = await response.json();
                setCurrentAnalysis(data);
                setAnalysisCache((prev) => new Map(prev).set(currentMoveIndex, data));
            } catch (error) {
                console.error('Error fetching analysis:', error);
                setCurrentAnalysis(null);
            } finally {
                setIsLoadingAnalysis(false);
            }
        };

        fetchAnalysis();
    }, [currentMoveIndex, game.id]);

    const opponentPlayer = isPlayerBlack ? game.white_player : game.black_player;
    const currentPlayer = isPlayerBlack ? game.black_player : game.white_player;
    const opponentName = isPlayerBlack ? 'White Player' : 'Black Player';
    const currentName = isPlayerBlack ? 'Black Player' : 'White Player';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Review Game" />
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center gap-8 p-4">
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

                <div className="flex h-full flex-col gap-4 overflow-hidden">
                    <div className="flex-1 overflow-hidden">
                        <MoveList
                            moves={game.moves}
                            currentMoveIndex={currentMoveIndex}
                            onMoveClick={handleMoveClick}
                            onStartClick={handleStartClick}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={handleFirst} disabled={currentMoveIndex === 0} title="First move">
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentMoveIndex === 0} title="Previous move">
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

                        <Card>
                            <CardHeader>
                                <CardTitle>Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {currentMoveIndex === 0 ? (
                                    <div className="text-sm text-muted-foreground">Navigate to a move to see analysis</div>
                                ) : isLoadingAnalysis ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Analyzing position...</span>
                                    </div>
                                ) : currentAnalysis ? (
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            {currentAnalysis.is_best ? (
                                                <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                                            ) : (
                                                <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                                            )}
                                            <div className="flex-1">
                                                <div className="mb-1 text-sm font-medium">
                                                    {currentAnalysis.is_best ? 'Best move played!' : 'Suboptimal move'}
                                                </div>
                                                <div className="mb-2 text-xs text-muted-foreground">
                                                    Move played: <span className="font-mono">{currentAnalysis.actual_move}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {!currentAnalysis.is_best && currentAnalysis.best_move && (
                                            <div className="space-y-1 rounded-md border bg-muted/50 p-3">
                                                <div className="text-xs font-medium">Better move:</div>
                                                <div className="font-mono text-sm font-bold">{currentAnalysis.best_move}</div>
                                            </div>
                                        )}

                                        <div className="pt-1 text-xs text-muted-foreground">
                                            Evaluation: {(currentAnalysis.evaluation / 100).toFixed(2)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">No analysis available</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

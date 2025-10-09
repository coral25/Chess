import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useState } from 'react';
import { fenToBoard } from '../lib/fen';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Game',
        href: '/game',
    },
];

export default function Game() {
    const { game } = usePage<SharedData>().props;
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [draggedFrom, setDraggedFrom] = useState<string | null>(null);

    useEcho('asd', 'MoveProcessed', (e) => {
        console.log(e);
    });

    const board = fenToBoard(game.fen);

    const handleSquareClick = (square: string, piece: string) => {
        if (!selectedSquare) {
            //select piece
            if (piece && piece.trim()) {
                setSelectedSquare(square);
            }
        } else {
            //select target
            const movetext = selectedSquare + ' ' + square;
            router.post('/game/move', {
                game_id: game.id,
                movetext: movetext,
            });
            setSelectedSquare(null);
        }
    };

    const handleDragStart = (square: string, piece: string, e: React.DragEvent) => {
        if (piece && piece.trim()) {
            setDraggedFrom(square);
            e.dataTransfer.effectAllowed = 'move';
        } else {
            e.preventDefault();
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (square: string, e: React.DragEvent) => {
        e.preventDefault();
        if (draggedFrom && draggedFrom !== square) {
            const movetext = draggedFrom + ' ' + square;
            router.post('/game/move', {
                game_id: game.id,
                movetext: movetext,
            });
        }
        setDraggedFrom(null);
    };

    const handleDragEnd = () => {
        setDraggedFrom(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Game" />
            <div className="flex min-h-0 items-center justify-center gap-8 p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                            <div className="text-sm font-medium">{game.black_player?.name || 'Black Player'}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400"></div>
                        </div>
                        <div className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                            <div className="text-lg font-bold">10:00</div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="bg-grey inline-block rounded border border-black">
                            <div className="grid aspect-square w-[min(calc(100vh-16rem),calc(100vw-28rem),600px)] grid-cols-8">
                                {board.map((row, i) =>
                                    row.map((piece, j) => {
                                        const isLight = (i + j) % 2 === 1;
                                        const file = String.fromCharCode(97 + j); // a-h
                                        const rank = 8 - i; // 8-1
                                        const square = `${file}${rank}`;
                                        return (
                                            <div
                                                key={square}
                                                onClick={() => handleSquareClick(square, piece)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(square, e)}
                                                className={
                                                    'flex aspect-square cursor-pointer items-center justify-center transition-colors ' +
                                                    (isLight ? 'bg-white' : 'bg-gray-600') +
                                                    (selectedSquare === square ? ' ring-4 ring-blue-500' : '') +
                                                    (draggedFrom === square ? ' opacity-50' : '')
                                                }
                                            >
                                                {piece && pieceToFileName(piece) && (
                                                    <img
                                                        src={`/pieces/${pieceToFileName(piece)}.svg`}
                                                        alt={piece}
                                                        className="h-[85%] w-[85%] cursor-grab active:cursor-grabbing"
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(square, piece, e)}
                                                        onDragEnd={handleDragEnd}
                                                    />
                                                )}
                                            </div>
                                        );
                                    }),
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                            <div className="text-lg font-bold">10:00</div>
                        </div>
                        <div className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                            <div className="text-sm font-medium">{game.white_player?.name || 'White Player'}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400"></div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="h-128 w-64 overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-3 text-sm font-semibold">Moves</h3>
                        <div className="space-y-1 text-sm">
                            {game.moves && game.moves.length > 0 ? (
                                game.moves.reduce((acc: React.ReactElement[], move, index) => {
                                    const moveNumber = Math.floor(index / 2) + 1;
                                    const isWhiteMove = index % 2 === 0;

                                    if (isWhiteMove) {
                                        acc.push(
                                            <div key={move.id} className="grid grid-cols-3 gap-2">
                                                <span className="text-gray-500">{moveNumber}.</span>
                                                <span>{move.movetext}</span>
                                                <span></span>
                                            </div>,
                                        );
                                    } else {
                                        const lastRow = acc[acc.length - 1];
                                        acc[acc.length - 1] = (
                                            <div key={lastRow.key} className="grid grid-cols-3 gap-2">
                                                <span className="text-gray-500">{moveNumber}.</span>
                                                <span>{game.moves![index - 1].movetext}</span>
                                                <span>{move.movetext}</span>
                                            </div>
                                        );
                                    }
                                    return acc;
                                }, [])
                            ) : (
                                <div className="text-xs text-gray-500">No moves yet</div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                            Draw
                        </button>
                        <button className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                            Resign
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function pieceToFileName(piece: string): string {
    if (!piece || piece.length < 2) return '';
    const color = piece[0] === 'b' ? 'b' : 'w';
    const pieceType = piece[1];
    const map: Record<string, string> = {
        k: 'king',
        q: 'queen',
        r: 'rook',
        b: 'bishop',
        n: 'knight',
        p: 'pawn',
    };
    const pieceName = map[pieceType];
    if (!pieceName) return '';
    return `${pieceName}-${color}`;
}

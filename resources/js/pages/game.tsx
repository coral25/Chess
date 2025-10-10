import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useState } from 'react';
import { fenToBoard } from '../lib/fen';
import ChessBoard from '@/components/game/chess-board';
import PlayerInfo from '@/components/game/player-info';
import MoveList from '@/components/game/move-list';
import GameControls from '@/components/game/game-controls';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Game',
        href: '/game',
    },
];

export default function Game() {
    const { game, auth } = usePage<SharedData>().props;
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
    const [currentFen, setCurrentFen] = useState<string>(game.fen);

    useEcho('asd', 'MoveProcessed', (e: any) => {
        console.log(e);
        if (e.gameId === game.id && e.fen) {
            setCurrentFen(e.fen);
        }
    });

    const board = fenToBoard(currentFen);
    const isPlayerBlack = auth.user.id === game.black_player_id;

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

    const opponentPlayer = isPlayerBlack ? game.white_player : game.black_player;
    const currentPlayer = isPlayerBlack ? game.black_player : game.white_player;
    const opponentName = isPlayerBlack ? 'White Player' : 'Black Player';
    const currentName = isPlayerBlack ? 'Black Player' : 'White Player';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Game" />
            <div className="flex min-h-0 items-center justify-center gap-8 p-4">
                <div className="flex flex-col gap-4">
                    <PlayerInfo player={opponentPlayer} defaultName={opponentName} time="10:00" position="top" />

                    <ChessBoard
                        board={board}
                        isPlayerBlack={isPlayerBlack}
                        selectedSquare={selectedSquare}
                        draggedFrom={draggedFrom}
                        onSquareClick={handleSquareClick}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                    />

                    <PlayerInfo player={currentPlayer} defaultName={currentName} time="10:00" position="bottom" />
                </div>
                <div className="flex flex-col gap-4">
                    <MoveList moves={game.moves} />
                    <GameControls />
                </div>
            </div>
        </AppLayout>
    );
}

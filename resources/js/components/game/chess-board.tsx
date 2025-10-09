import Square from './square';

interface ChessBoardProps {
    board: string[][];
    isPlayerBlack: boolean;
    selectedSquare: string | null;
    draggedFrom: string | null;
    onSquareClick: (square: string, piece: string) => void;
    onDragStart: (square: string, piece: string, e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (square: string, e: React.DragEvent) => void;
    onDragEnd: () => void;
}

export default function ChessBoard({
    board,
    isPlayerBlack,
    selectedSquare,
    draggedFrom,
    onSquareClick,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}: ChessBoardProps) {
    const displayBoard = isPlayerBlack ? board.map((row) => [...row].reverse()).reverse() : board;

    return (
        <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
            <div className="bg-grey inline-block rounded border border-black">
                <div className="grid aspect-square w-[min(calc(100vh-16rem),calc(100vw-28rem),600px)] grid-cols-8">
                    {displayBoard.map((row, displayI) =>
                        row.map((piece, displayJ) => {
                            const i = isPlayerBlack ? 7 - displayI : displayI;
                            const j = isPlayerBlack ? 7 - displayJ : displayJ;
                            const isLight = (i + j) % 2 === 1;
                            const file = String.fromCharCode(97 + j); // a-h
                            const rank = 8 - i; // 8-1
                            const square = `${file}${rank}`;
                            return (
                                <Square
                                    key={square}
                                    square={square}
                                    piece={piece}
                                    isLight={isLight}
                                    isSelected={selectedSquare === square}
                                    isDragging={draggedFrom === square}
                                    onClick={onSquareClick}
                                    onDragStart={onDragStart}
                                    onDragOver={onDragOver}
                                    onDrop={onDrop}
                                    onDragEnd={onDragEnd}
                                />
                            );
                        }),
                    )}
                </div>
            </div>
        </div>
    );
}

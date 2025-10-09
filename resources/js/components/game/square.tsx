interface SquareProps {
    square: string;
    piece: string;
    isLight: boolean;
    isSelected: boolean;
    isDragging: boolean;
    onClick: (square: string, piece: string) => void;
    onDragStart: (square: string, piece: string, e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (square: string, e: React.DragEvent) => void;
    onDragEnd: () => void;
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

export default function Square({ square, piece, isLight, isSelected, isDragging, onClick, onDragStart, onDragOver, onDrop, onDragEnd }: SquareProps) {
    const getBackgroundColor = () => {
        if (isSelected) {
            return 'bg-green-300';
        }
        return isLight ? 'bg-white' : 'bg-gray-600';
    };

    return (
        <div
            onClick={() => onClick(square, piece)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(square, e)}
            className={
                'flex aspect-square cursor-pointer items-center justify-center transition-colors ' +
                getBackgroundColor() +
                (isDragging ? ' opacity-50' : '')
            }
        >
            {piece && pieceToFileName(piece) && (
                <img
                    src={`/pieces/${pieceToFileName(piece)}.svg`}
                    alt={piece}
                    className="h-[85%] w-[85%] cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => onDragStart(square, piece, e)}
                    onDragEnd={onDragEnd}
                />
            )}
        </div>
    );
}

import type { Move } from '@/types';

interface MoveListProps {
    moves?: Move[];
    currentMoveIndex?: number;
    onMoveClick?: (index: number) => void;
    onStartClick?: () => void;
}

export default function MoveList({ moves, currentMoveIndex, onMoveClick, onStartClick }: MoveListProps) {
    const isInteractive = onMoveClick !== undefined;

    return (
        <div className="h-128 w-64 overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-sm font-semibold">Moves</h3>
            <div className="space-y-1 text-sm">
                {isInteractive && onStartClick && (
                    <button
                        onClick={onStartClick}
                        className={`w-full rounded px-2 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            currentMoveIndex === 0 ? 'bg-blue-500 text-white hover:bg-blue-600' : ''
                        }`}
                    >
                        Start Position
                    </button>
                )}
                {moves && moves.length > 0 ? (
                    moves.reduce((acc: React.ReactElement[], move, index) => {
                        const moveNumber = Math.floor(index / 2) + 1;
                        const isWhiteMove = index % 2 === 0;

                        if (isWhiteMove) {
                            const whiteHighlighted = currentMoveIndex === index + 1;
                            acc.push(
                                <div key={move.id} className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500">{moveNumber}.</span>
                                    {isInteractive ? (
                                        <button
                                            onClick={() => onMoveClick(index)}
                                            className={`rounded px-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                whiteHighlighted ? 'bg-blue-500 text-white hover:bg-blue-600' : ''
                                            }`}
                                        >
                                            {move.movetext}
                                        </button>
                                    ) : (
                                        <span>{move.movetext}</span>
                                    )}
                                    <span></span>
                                </div>,
                            );
                        } else {
                            const lastRow = acc[acc.length - 1];
                            const whiteHighlighted = currentMoveIndex === index;
                            const blackHighlighted = currentMoveIndex === index + 1;
                            acc[acc.length - 1] = (
                                <div key={lastRow.key} className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500">{moveNumber}.</span>
                                    {isInteractive ? (
                                        <>
                                            <button
                                                onClick={() => onMoveClick(index - 1)}
                                                className={`rounded px-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                    whiteHighlighted ? 'bg-blue-500 text-white hover:bg-blue-600' : ''
                                                }`}
                                            >
                                                {moves![index - 1].movetext}
                                            </button>
                                            <button
                                                onClick={() => onMoveClick(index)}
                                                className={`rounded px-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                    blackHighlighted ? 'bg-blue-500 text-white hover:bg-blue-600' : ''
                                                }`}
                                            >
                                                {move.movetext}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span>{moves![index - 1].movetext}</span>
                                            <span>{move.movetext}</span>
                                        </>
                                    )}
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
    );
}

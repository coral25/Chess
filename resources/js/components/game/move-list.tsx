import type { Move } from '@/types';

interface MoveListProps {
    moves?: Move[];
}

export default function MoveList({ moves }: MoveListProps) {
    return (
        <div className="h-128 w-64 overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-sm font-semibold">Moves</h3>
            <div className="space-y-1 text-sm">
                {moves && moves.length > 0 ? (
                    moves.reduce((acc: React.ReactElement[], move, index) => {
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
                                    <span>{moves![index - 1].movetext}</span>
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
    );
}

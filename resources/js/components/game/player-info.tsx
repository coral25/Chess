import type { User } from '@/types';

interface PlayerInfoProps {
    player?: User;
    defaultName: string;
    time: string;
    position: 'top' | 'bottom';
}

export default function PlayerInfo({ player, defaultName, time, position }: PlayerInfoProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            {position === 'bottom' && (
                <div className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-lg font-bold">{time}</div>
                </div>
            )}
            <div className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-sm font-medium">{player?.name || defaultName}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400"></div>
            </div>
            {position === 'top' && (
                <div className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-lg font-bold">{time}</div>
                </div>
            )}
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

interface GameControlsProps {
    gameId: number;
}

export default function GameControls({ gameId }: GameControlsProps) {
    const handleResign = () => {
        if (confirm('Are you sure you want to resign? This will end the game.')) {
            router.post(`/game/${gameId}/resign`);
        }
    };

    return (
        <div className="flex gap-2">
            <Button variant="outline" className="flex-1" disabled>
                Draw
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleResign}>
                Resign
            </Button>
        </div>
    );
}

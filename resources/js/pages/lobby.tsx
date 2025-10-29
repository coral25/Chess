import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Game, type SharedData } from '@/types';
import { GameStatus } from '@/types/enums';
import { Head, router, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lobby',
        href: '/lobby',
    },
];

export default function Lobby() {
    const { availableGames, userGames } = usePage<SharedData & { availableGames: Game[]; userGames: Game[] }>().props;

    const handleCreateGame = () => {
        router.post('/game/create');
    };

    const handleJoinGame = (gameId: number) => {
        router.post(`/game/${gameId}/join`);
    };

    const handleViewGame = (gameId: number) => {
        router.get(`/game/${gameId}`);
    };

    const filteredUserGames = userGames?.filter(
        (game) => game.status === GameStatus.CreatingPublic || game.status === GameStatus.CreatingPrivate || game.status === GameStatus.InProgress,
    );

    const userCreatingGames = filteredUserGames?.filter(
        (game) => game.status === GameStatus.CreatingPublic || game.status === GameStatus.CreatingPrivate,
    );
    const userActiveGames = filteredUserGames?.filter((game) => game.status === GameStatus.InProgress);

    const getGameStatusBadge = (game: Game) => {
        switch (game.status) {
            case GameStatus.CreatingPublic:
                return (
                    <Badge variant="secondary" className="gap-1">
                        Creating
                    </Badge>
                );
            case GameStatus.CreatingPrivate:
                return (
                    <Badge variant="secondary" className="gap-1">
                        Creating (Private)
                    </Badge>
                );
            case GameStatus.InProgress:
                return (
                    <Badge variant="default" className="gap-1">
                        In Progress
                    </Badge>
                );
            default:
                return null;
        }
    };

    const getGameDescription = (game: Game) => {
        const hasWhite = game.white_player_id !== null;
        const hasBlack = game.black_player_id !== null;

        if (hasWhite && hasBlack) {
            return 'Game in progress';
        } else if (hasWhite || hasBlack) {
            return 'Waiting for opponent';
        } else {
            return 'No players yet';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Game Lobby" />
            <div className="container mx-auto max-w-6xl space-y-8 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Game Lobby</h1>
                        <p className="text-muted-foreground">Create a new game or join an existing one</p>
                    </div>
                    <Button onClick={handleCreateGame} size="lg">
                        Create New Game
                    </Button>
                </div>

                {userCreatingGames && userCreatingGames.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Your Games Being Created</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {userCreatingGames.map((game) => (
                                <Card key={game.id} className="transition-colors hover:border-primary">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>Game #{game.id}</span>
                                            {getGameStatusBadge(game)}
                                        </CardTitle>
                                        <CardDescription>{getGameDescription(game)}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">White:</span>
                                                <span className="text-muted-foreground">{game.white_player?.name || 'Waiting...'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Black:</span>
                                                <span className="text-muted-foreground">{game.black_player?.name || 'Waiting...'}</span>
                                            </div>
                                        </div>
                                        <Button onClick={() => handleViewGame(game.id)} className="w-full" variant="secondary">
                                            View Game
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {userActiveGames && userActiveGames.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Your Active Games</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {userActiveGames.map((game) => (
                                <Card key={game.id} className="transition-colors hover:border-primary">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>Game #{game.id}</span>
                                            {getGameStatusBadge(game)}
                                        </CardTitle>
                                        <CardDescription>{getGameDescription(game)}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">White:</span>
                                                <span className="text-muted-foreground">{game.white_player?.name || 'Waiting...'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Black:</span>
                                                <span className="text-muted-foreground">{game.black_player?.name || 'Waiting...'}</span>
                                            </div>
                                        </div>
                                        <Button onClick={() => handleViewGame(game.id)} className="w-full" variant="default">
                                            Continue Game
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {availableGames && availableGames.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Available Games</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {availableGames.map((game) => (
                                <Card key={game.id} className="transition-colors hover:border-primary">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>Game #{game.id}</span>
                                            {getGameStatusBadge(game)}
                                        </CardTitle>
                                        <CardDescription>{getGameDescription(game)}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2 text-sm">
                                            {game.white_player && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">White:</span>
                                                    <span className="text-muted-foreground">{game.white_player.name}</span>
                                                </div>
                                            )}
                                            {game.black_player && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Black:</span>
                                                    <span className="text-muted-foreground">{game.black_player.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <Button onClick={() => handleJoinGame(game.id)} className="w-full" variant="default">
                                            Join Game
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
                {(!availableGames || availableGames.length === 0) &&
                    (!userCreatingGames || userCreatingGames.length === 0) &&
                    (!userActiveGames || userActiveGames.length === 0) && (
                        <Card className="py-12">
                            <CardContent className="flex flex-col items-center justify-center text-center">
                                <h3 className="mb-2 text-lg font-semibold">No games available</h3>
                                <p className="mb-4 text-sm text-muted-foreground">Create a game!</p>
                                <Button onClick={handleCreateGame}>Create New Game</Button>
                            </CardContent>
                        </Card>
                    )}
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Game, type SharedData } from '@/types';
import { GameStatus } from '@/types/enums';
import { Head, router, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Match History',
        href: '/history',
    },
];

export default function MatchHistory() {
    const { finishedGames, auth } = usePage<SharedData & { finishedGames: Game[] }>().props;

    const getGameStatusBadge = (game: Game) => {
        switch (game.status) {
            case GameStatus.WhiteWin:
                return (
                    <Badge variant="default" className="gap-1">
                        White Won
                    </Badge>
                );
            case GameStatus.BlackWin:
                return (
                    <Badge variant="default" className="gap-1">
                        Black Won
                    </Badge>
                );
            case GameStatus.Draw:
                return (
                    <Badge variant="secondary" className="gap-1">
                        Draw
                    </Badge>
                );
            default:
                return null;
        }
    };

    const getGameResult = (game: Game) => {
        const userId = auth.user?.id;

        if (game.status === GameStatus.Draw) {
            return { text: 'Draw', variant: 'secondary' as const };
        }

        if (game.status === GameStatus.WhiteWin) {
            if (game.white_player_id === userId) {
                return { text: 'Victory', variant: 'default' as const };
            } else {
                return { text: 'Defeat', variant: 'destructive' as const };
            }
        }

        if (game.status === GameStatus.BlackWin) {
            if (game.black_player_id === userId) {
                return { text: 'Victory', variant: 'default' as const };
            } else {
                return { text: 'Defeat', variant: 'destructive' as const };
            }
        }

        return { text: 'Unknown', variant: 'secondary' as const };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Match History" />
            <div className="container mx-auto max-w-6xl space-y-8 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Match History</h1>
                        <p className="text-muted-foreground">View your completed games</p>
                    </div>
                </div>

                {finishedGames && finishedGames.length > 0 ? (
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {finishedGames.map((game) => {
                                const result = getGameResult(game);
                                return (
                                    <Card key={game.id} className="transition-colors hover:border-primary">
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>Game #{game.id}</span>
                                                {getGameStatusBadge(game)}
                                            </CardTitle>
                                            <CardDescription>{game.updated_at && formatDate(game.updated_at)}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">White:</span>
                                                    <span className="text-muted-foreground">{game.white_player?.name || 'Unknown'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Black:</span>
                                                    <span className="text-muted-foreground">{game.black_player?.name || 'Unknown'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={result.variant} className="w-full justify-center">
                                                    {result.text}
                                                </Badge>
                                            </div>
                                            <Button onClick={() => router.get(`/game/${game.id}/review`)} className="w-full" variant="outline">
                                                Review Game
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <Card className="py-12">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <h3 className="mb-2 text-lg font-semibold">No completed games yet</h3>
                            <p className="mb-4 text-sm text-muted-foreground">Your match history will appear here once you finish some games.</p>
                            <Button onClick={() => router.get('/lobby')}>Go to Lobby</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

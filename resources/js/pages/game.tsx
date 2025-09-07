import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { fenToBoard } from '../lib/fen';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Game',
        href: '/game',
    },
];

export default function Game() {
    const { game } = usePage<SharedData>().props;
    useEcho('asd', 'MoveProcessed', (e) => {
        console.log(e);
    });

    const board = fenToBoard(game.fen);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Game" />
            <div className="grid gap-4 md:grid-cols-2">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Form action="/game/move" method="post" transform={(data) => ({ ...data, game_id: game.id })}>
                        <Input name="movetext" placeholder="..." />
                        <Button type="submit">asd</Button>
                    </Form>
                </div>
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="bg-grey inline-block rounded border border-black">
                        <div className="grid h-128 w-128 grid-cols-8">
                            {board.map((row, i) =>
                                row.map((piece, j) => {
                                    const isLight = (i + j) % 2 === 1;
                                    return (
                                        <div
                                            key={i + '-' + j}
                                            className={
                                                'twxt flex h-16 w-16 items-center justify-center text-6xl font-extrabold text-shadow-md ' +
                                                (piece[0] === 'b' ? 'text-black text-shadow-white' : 'text-white text-shadow-black') +
                                                ' ' +
                                                (isLight ? 'bg-white' : 'bg-gray-600')
                                            }
                                        >
                                            {piece ? pieceToUnicode(piece[1]) : ''}
                                        </div>
                                    );
                                }),
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function pieceToUnicode(piece: string): string {
    const map: Record<string, string> = {
        k: '♔',
        q: '♕',
        r: '♖',
        b: '♗',
        n: '♘',
        p: '♙',
    };
    return map[piece] || '';
}

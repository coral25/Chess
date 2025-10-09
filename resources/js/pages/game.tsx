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
                                    const file = String.fromCharCode(97 + j); // a-h
                                    const rank = 8 - i; // 8-1
                                    const square = `${file}${rank}`;
                                    return (
                                        <div
                                            key={square}
                                            className={
                                                'flex h-16 w-16 items-center justify-center ' +
                                                (isLight ? 'bg-white' : 'bg-gray-600')
                                            }
                                        >
                                            {piece && pieceToFileName(piece) && (
                                                <img
                                                    src={`/pieces/${pieceToFileName(piece)}.svg`}
                                                    alt={piece}
                                                    className="h-14 w-14"
                                                />
                                            )}
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

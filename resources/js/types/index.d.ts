import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface Move {
    id: number;
    game_id: number;
    move_number: number;
    movetext: string;
    fen: string;
    created_at: string;
    updated_at: string;
}

export interface MoveProcessedEvent {
    gameId: number;
    fen: string;
    message: string;
}

export interface Game {
    id: number;
    white_player_id: number | null;
    black_player_id: number | null;
    fen: string;
    status: GameStatus;
    white_player?: User;
    black_player?: User;
    moves?: Move[];
    created_at: string;
    updated_at: string;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    game: Game;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

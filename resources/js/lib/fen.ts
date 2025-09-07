// FEN to board array utility
export function fenToBoard(fen: string): string[][] {
    const rows = fen.split(' ')[0].split('/');
    return rows.map((row) => {
        const result: string[] = [];
        for (const char of row) {
            if (/[1-8]/.test(char)) {
                for (let i = 0; i < parseInt(char); i++) result.push(' ');
            } else {
                if (/[a-z]/.test(char)) {
                    result.push('b' + char);
                } else if (/[A-Z]/.test(char)) {
                    result.push('w' + char.toLowerCase());
                } else {
                    throw new Error('Invalid FEN character: ' + char);
                }
            }
        }
        return result;
    });
}

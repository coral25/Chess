export default function GameControls() {
    return (
        <div className="flex gap-2">
            <button className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                Draw
            </button>
            <button className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                Resign
            </button>
        </div>
    );
}

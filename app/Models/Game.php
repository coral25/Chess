<?php

namespace App\Models;

use App\Enums\GameStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'fen',
        'white_player_id',
        'black_player_id',
    ];

        /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => GameStatus::class,
        ];
    }

    public function white_player(): BelongsTo {
        return $this->belongsTo(User::class , 'white_player_id')->withDefault([
            'name' => 'deleted user'
        ]);
    }

    public function black_player(): BelongsTo {
        return $this->belongsTo(User::class , 'black_player_id')->withDefault([
            'name' => 'deleted user'
        ]);
    }

    public function moves(): HasMany {
        return $this->hasMany(Move::class);
    }
}

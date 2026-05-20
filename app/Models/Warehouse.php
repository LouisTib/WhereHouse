<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    use HasFactory;

    protected $fillable = [
        'warehouse_name',
        'user_id',
        'grid_width',
        'grid_height',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'warehouse_user')->withTimestamps();
    }

    public function sections()
    {
        return $this->hasMany(Section::class);
    }

    public function products()
    {
        return $this->hasManyThrough(Product::class, Section::class);
    }

    public function hasAccess($userId)
    {
        return $this->users()->where('user_id', $userId)->exists();
    }
}
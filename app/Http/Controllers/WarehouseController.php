<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        $warehouses = auth()->user()->warehouses()->get(['warehouses.id', 'warehouses.warehouse_name', 'warehouses.user_id']);

        if ($request->wantsJson()) {
            return response()->json(['warehouses' => $warehouses]);
        }

        return view('dashboard', compact('warehouses'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'warehouse_name' => 'required|string|max:255',
            'grid_width'     => 'integer|min:5|max:100',
            'grid_height'    => 'integer|min:5|max:100',
        ]);

        $warehouse = Warehouse::create([
            'warehouse_name' => $request->warehouse_name,
            'user_id'        => auth()->id(),
            'grid_width'     => $request->input('grid_width', 30),
            'grid_height'    => $request->input('grid_height', 20),
        ]);

        $warehouse->users()->attach(auth()->id());

        return response()->json(['success' => true, 'warehouse' => $warehouse]);
    }

    public function destroy(Request $request, $id)
    {
        $warehouse = Warehouse::findOrFail($id);

        if (!$warehouse->hasAccess(auth()->id())) {
            return response()->json(['success' => false, 'message' => 'Access denied'], 403);
        }

        $warehouse->delete();

        return response()->json(['success' => true]);
    }

    public function show($id)
    {
        $warehouse = Warehouse::findOrFail($id);

        if (!$warehouse->hasAccess(auth()->id())) {
            abort(403, 'You do not have access to this warehouse');
        }

        return view('grid', compact('warehouse'));
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'warehouse_name' => 'sometimes|string|max:255',
                'grid_width'     => 'sometimes|integer|min:5|max:100',
                'grid_height'    => 'sometimes|integer|min:5|max:100',
            ]);

            $warehouse = Warehouse::findOrFail($id);

            if (!$warehouse->hasAccess(auth()->id())) {
                return response()->json(['success' => false, 'message' => 'Access denied'], 403);
            }

            $newWidth  = $request->input('grid_width',  $warehouse->grid_width);
            $newHeight = $request->input('grid_height', $warehouse->grid_height);

            $outOfBounds = $warehouse->sections()
                ->where(function ($q) use ($newWidth, $newHeight) {
                    $q->where('grid_x', '>=', $newWidth)
                      ->orWhere('grid_y', '>=', $newHeight);
                })->count();

            $warehouse->update([
                'warehouse_name' => $request->input('warehouse_name', $warehouse->warehouse_name),
                'grid_width'     => $newWidth,
                'grid_height'    => $newHeight,
            ]);

            return response()->json([
                'success'       => true,
                'warehouse'     => $warehouse,
                'out_of_bounds' => $outOfBounds,
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
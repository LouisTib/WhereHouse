<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\Warehouse;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function store(Request $request, $warehouseId)
    {
        try {
            $warehouse = Warehouse::findOrFail($warehouseId);

            if (!$warehouse->hasAccess(auth()->id())) {
                return response()->json(['success' => false, 'message' => 'Access denied'], 403);
            }

            $request->validate([
                'section_name' => 'required|string|max:255',
                'grid_x' => 'nullable|integer|min:0|max:' . ($warehouse->grid_width - 1),
                'grid_y' => 'nullable|integer|min:0|max:' . ($warehouse->grid_height - 1),
            ]);

            $section = Section::create([
                'section_name' => $request->section_name,
                'user_id'      => auth()->id(),
                'warehouse_id' => $warehouse->id,
                'grid_x'       => $request->grid_x,
                'grid_y'       => $request->grid_y,
            ]);

            return response()->json(['success' => true, 'section' => $section]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error creating section: ' . $e->getMessage()], 500);
        }
    }

    public function index($warehouseId)
    {
        try {
            $warehouse = Warehouse::findOrFail($warehouseId);

            if (!$warehouse->hasAccess(auth()->id())) {
                return response()->json(['success' => false, 'message' => 'Access denied'], 403);
            }

            return response()->json(['sections' => $warehouse->sections]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error loading sections'], 500);
        }
    }

    public function destroy($warehouseId, $sectionId)
    {
        try {
            $warehouse = Warehouse::findOrFail($warehouseId);

            if (!$warehouse->hasAccess(auth()->id())) {
                return response()->json(['success' => false, 'message' => 'Access denied'], 403);
            }

            $section = $warehouse->sections()->findOrFail($sectionId);
            $section->delete();

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error deleting section'], 500);
        }
    }

    public function updatePosition(Request $request, $warehouseId, $sectionId)
    {
        try {
            $warehouse = Warehouse::findOrFail($warehouseId);

            if (!$warehouse->hasAccess(auth()->id())) {
                return response()->json(['success' => false, 'message' => 'Access denied'], 403);
            }

            $request->validate([
                'grid_x' => 'required|integer|min:0|max:' . ($warehouse->grid_width - 1),
                'grid_y' => 'required|integer|min:0|max:' . ($warehouse->grid_height - 1),
            ]);

            $section = $warehouse->sections()->findOrFail($sectionId);
            $section->update(['grid_x' => $request->grid_x, 'grid_y' => $request->grid_y]);

            return response()->json(['success' => true, 'section' => $section]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error updating position: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $warehouseId, $sectionId)
    {
        try {
            $request->validate(['section_name' => 'required|string|max:255']);

            $warehouse = Warehouse::findOrFail($warehouseId);

            if (!$warehouse->hasAccess(auth()->id())) {
                return response()->json(['success' => false, 'message' => 'Access denied'], 403);
            }

            $section = $warehouse->sections()->findOrFail($sectionId);
            $section->update(['section_name' => $request->section_name]);

            return response()->json(['success' => true, 'section' => $section]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error updating section: ' . $e->getMessage()], 500);
        }
    }
}
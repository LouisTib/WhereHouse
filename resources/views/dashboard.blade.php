@extends('layouts.template')

@section('title', 'Dashboard')

@section('head')
    <link rel="stylesheet" href="{{ asset('css/dashboard.css') }}?v={{ time() }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">
@endsection

@section('content')

    <div class="dashboard">

        <div class="dashboard-header-actions">
            <div class="dashboard-left">
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createWarehouseModal">
                    + Create Warehouse
                </button>
            </div>
            <div class="dashboard-right">
                <div class="dashboard-search-wrapper">
                    <input type="text" id="dashboardSearchInput" placeholder="Search products...">
                </div>
                <a href="{{ route('profile.edit') }}">
                    <button type="button">Profile</button>
                </a>
                <form method="POST" action="{{ route('logout') }}" style="margin: 0;">
                    @csrf
                    <button type="submit">Log Out</button>
                </form>
            </div>
        </div>

        <div class="warehouse-sections-container">
            <div class="warehouse-section">
                <h3 class="section-title">My Warehouses</h3>
                <div class="warehouse-list" id="myWarehouses"></div>
            </div>
            <div class="warehouse-section">
                <h3 class="section-title">Shared With Me</h3>
                <div class="warehouse-list" id="sharedWarehouses"></div>
            </div>
        </div>

    </div>

    <!-- Create Warehouse Modal -->
    <div class="modal fade" id="createWarehouseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Create New Warehouse</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <input type="text" class="form-control" id="warehouseName" placeholder="Warehouse name">
                    </div>
                    <div class="mb-3">
                        <label for="warehouseWidth" class="form-label"
                            style="color:var(--text-secondary); font-size:0.9rem;">
                            Grid Width (columns)
                        </label>
                        <input type="number" class="form-control" id="warehouseWidth" min="5" max="100"
                            value="30">
                    </div>
                    <div class="mb-3">
                        <label for="warehouseHeight" class="form-label"
                            style="color:var(--text-secondary); font-size:0.9rem;">
                            Grid Height (rows)
                        </label>
                        <input type="number" class="form-control" id="warehouseHeight" min="5" max="100"
                            value="20">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="createWarehouseBtn">Create Warehouse</button>
                </div>
            </div>
        </div>
    </div>

@endsection

@section('scripts')
    <script src="{{ asset('js/dashboard.js') }}?v={{ time() }}"></script>
@endsection

<?php $__env->startSection('title', 'Dashboard'); ?>

<?php $__env->startSection('head'); ?>
    <link rel="stylesheet" href="<?php echo e(asset('css/dashboard.css')); ?>?v=<?php echo e(time()); ?>">

    <!-- CSRF token for AJAX requests -->
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
<?php $__env->stopSection(); ?>

<?php $__env->startSection('content'); ?>

    <div class="dashboard">

        <div class="dashboard-right">
            <a href="<?php echo e(route('profile.edit')); ?>">
                <button type="button">Profile</button>
            </a>
        </div>

        <div class="dashboard-right">
            <form method="POST" action="<?php echo e(route('logout')); ?>">
                <?php echo csrf_field(); ?>
                <button type="submit">Log Out</button>
            </form>
        </div>

        <div class="dashboard-left">
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createWarehouseModal">
                Create Warehouse
            </button>
        </div>

    </div>

    <!-- Modal for Creating Warehouse -->
    <div class="modal fade" id="createWarehouseModal" tabindex="-1" aria-labelledby="createWarehouseModalLabel"
        aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="createWarehouseModalLabel">Create New Warehouse</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="text" class="form-control" id="warehouseName" placeholder="Enter warehouse name">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="createWarehouseBtn">Create</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Warehouse Sections Container -->
    <div class="warehouse-sections-container">
        <!-- My Warehouses Section -->
        <div class="warehouse-section">
            <h3 class="section-title">My Warehouses</h3>
            <div class="warehouse-list my-warehouses" id="myWarehouses">
                <!-- My warehouses will be loaded here by JavaScript -->
            </div>
        </div>

        <!-- Shared Warehouses Section -->
        <div class="warehouse-section">
            <h3 class="section-title">Shared With Me</h3>
            <div class="warehouse-list shared-warehouses" id="sharedWarehouses">
                <!-- Shared warehouses will be loaded here by JavaScript -->
            </div>
        </div>
    </div>

<?php $__env->stopSection(); ?>

<?php $__env->startSection('scripts'); ?>
    <script src="<?php echo e(asset('js/dashboard.js')); ?>?v=<?php echo e(time()); ?>"></script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.template', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\louis\vscodeprojects\FinalProject\WhereHouse\resources\views/dashboard.blade.php ENDPATH**/ ?>
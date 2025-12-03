

<?php $__env->startSection('title', 'Contact'); ?>

<?php $__env->startSection('head'); ?>
    <link rel="stylesheet" href="<?php echo e(asset('css/contact.css')); ?>?v=<?php echo e(time()); ?>">
    <style>
        body {
            background-image: url('<?php echo e(asset('images/ContactBackground.png')); ?>');
            background-size: cover;
        }
    </style>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('content'); ?>
    <div class="contact">
        <h1>Contact</h1>
        <p>Need assistance or have questions? We're here to help! Reach out and our team will
            respond as quickly as possible to assist you.</p>
        <a href="mailto:louistiboldo@gmail.com"> Email us</a>

    </div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.template', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\louis\vscodeprojects\FinalProject\WhereHouse\resources\views/contact.blade.php ENDPATH**/ ?>
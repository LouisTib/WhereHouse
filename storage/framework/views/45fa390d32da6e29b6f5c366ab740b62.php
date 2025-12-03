

<?php $__env->startSection('title', 'About'); ?>

<?php $__env->startSection('head'); ?>
    <link rel="stylesheet" href="<?php echo e(asset('css/about-t.css')); ?>?v=<?php echo e(time()); ?>">
    <style>
        body {
            background-image: url('<?php echo e(asset('images/AboutBackground.png')); ?>');
            background-size: cover;
        }
    </style>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('content'); ?>
    <div class="about">
        <h1>About</h1>
        <p>This project was developed for "CIS-3308 - Web Application Programming."</p>
        <h1>Developers</h1>
        <div class="boxes">
            <div class="box">
                <h1>Louis Tiboldo</h1>
                <p>Full-stack developer responsible <br> for overall functionality <br> and debugging.
                </p>
            </div>
            <div class="box">
                <h1>Kolby Hart</h1>
                <p>Front-end developer responsible <br> for layout, design, and <br> visual appeal.</p>
            </div>
            <div class="box">
                <h1>Terence Win</h1>
                <p>Back-end developer responsible <br> for the API and database <br> integration.</p>
            </div>
        </div>
        <h1>Purpose</h1>
        <p>Our goal is to aid business owners and workers, allowing for an efficent way to keep track of products along with
            providing a visual aspect for workers to locate products. This results in a more efficient work environment that
            saves money in the longrun.
        </p>



    </div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.template', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\louis\vscodeprojects\FinalProject\WhereHouse\resources\views/about.blade.php ENDPATH**/ ?>
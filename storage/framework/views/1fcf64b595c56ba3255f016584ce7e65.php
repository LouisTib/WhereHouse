<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

    
    <style>
        *,
        ul,
        p {
            margin: 0;
            padding: 0;
        }

        .ms-3,
        .ms-4 {
            margin: 0 !important;
        }
    </style>

    
    <?php echo $__env->yieldContent('head'); ?>

    <link rel="stylesheet" href="<?php echo e(asset('css/template.css')); ?>?v=<?php echo e(time()); ?>">

    
    <title><?php echo $__env->yieldContent('title', 'WhereHouse'); ?></title>


</head>

<body>
    
    <header class="header">
        <h1 class="title">WHEREHOUSE</h1>
        <nav class="pages">
            <ul>
                <li><a href="<?php echo e(route('home')); ?>">Home</a></li>
                <li><a href="<?php echo e(route('login')); ?>">Login</a></li>
                <li><a href="<?php echo e(route('contact')); ?>">Contact</a></li>
                <li><a href="<?php echo e(route('about')); ?>">About</a></li>
            </ul>
        </nav>
    </header>

    
    <main class="content">
        <?php echo $__env->yieldContent('content'); ?>
    </main>

    
    <footer class="footer">
        <p>© <?php echo e(date('Y')); ?> WhereHouse. All rights reserved.</p>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Page-specific JavaScript files -->
    <?php echo $__env->yieldContent('scripts'); ?> <!-- This will load scripts like dashboard.js for the dashboard page -->

</body>

</html>
<?php /**PATH C:\Users\louis\vscodeprojects\FinalProject\WhereHouse\resources\views/layouts/template.blade.php ENDPATH**/ ?>
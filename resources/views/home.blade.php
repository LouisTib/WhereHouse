@extends('layouts.template')

@section('title', 'Home')

@section('head')
    <link rel="stylesheet" href="{{ asset('css/home.css') }}?v={{ time() }}">
@endsection

@section('content')

    <!-- Hero Section -->
    <section class="intro">
        <div class="intro-text">
            <h1>Welcome to WhereHouse</h1>
            <p>Locate products with ease and efficiency</p>
            <div class="intro-button">
                <a href="{{ route('register') }}">Register Your Account</a>
            </div>
        </div>
        <img src="{{ asset('images/WhereHouse.png') }}" alt="WhereHouse Logo - warehouse management platform">
    </section>

    <!-- What is WhereHouse Section -->
    <section class="section1">
        <div class="section1-text">
            <h2>What is WhereHouse?</h2>
            <p>WhereHouse is a web app that provides a visual 2D layout of warehouses for workers to easily locate products.
            </p>
        </div>
        <img src="{{ asset('images/What.png') }}" alt="WhereHouse feature overview">
    </section>

    <!-- How It Works Section -->
    <section class="section2">
        <div class="section2-text">
            <h2>How Does WhereHouse Work?</h2>
        </div>
        <div class="boxes">
            <article class="box">
                <h3>Create a Warehouse</h3>
                <p>Register with us to create warehouses and utilize our simplistic 2D grid layout.</p>
            </article>
            <article class="box">
                <h3>Add Products</h3>
                <p>Add storage sections to your warehouse along with the products located in them.</p>
            </article>
            <article class="box">
                <h3>Find Products</h3>
                <p>Workers can log in and easily locate products in your warehouse with our search functionality.</p>
            </article>
        </div>
    </section>

    <!-- Why Choose WhereHouse Section -->
    <section class="section3">
        <div class="section3-text">
            <h2>Why Choose WhereHouse?</h2>
            <p>WhereHouse simplifies and speeds up the time it takes for workers to complete tasks at hand, whether it be
                fulfilling orders or moving inventory.</p>
        </div>
        <img src="{{ asset('images/Why.png') }}" alt="Benefits of using WhereHouse">
    </section>

@endsection

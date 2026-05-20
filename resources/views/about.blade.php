@extends('layouts.template')

@section('title', 'About')

@section('head')
    <link rel="stylesheet" href="{{ asset('css/about-t.css') }}?v={{ time() }}">
@endsection

@section('content')
    <div class="about">
        <div class="about-card">
            <h1>About</h1>
            <p>This project was developed for "CIS-3308 - Web Application Programming."</p>

            <h1>Developers</h1>

            <div class="boxes">
                <div class="box">
                    <h1>Louis Tiboldo</h1>
                    <p>Full-stack developer responsible for overall functionality and debugging.</p>
                </div>

                <div class="box">
                    <h1>Kolby Hart</h1>
                    <p>Front-end developer responsible for layout, design, and visual appeal.</p>
                </div>

                <div class="box">
                    <h1>Terence Win</h1>
                    <p>Back-end developer responsible for the API and database integration.</p>
                </div>
            </div>

            <h1>Purpose</h1>

            <p>
                Our goal is to aid business owners and workers, allowing for an efficient
                way to keep track of products along with providing a visual aspect for
                workers to locate products. This results in a more efficient work
                environment that saves money in the long run.
            </p>
        </div>
    </div>
@endsection

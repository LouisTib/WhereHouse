@extends('layouts.template')

@section('title', 'Contact')

@section('head')
    <link rel="stylesheet" href="{{ asset('css/contact.css') }}?v={{ time() }}">
    <style>
        .contact {
            background-image: url('{{ asset('images/ContactBackground.png') }}');
        }
    </style>
@endsection

@section('content')
    <div class="contact">
        <div class="contact-card">
            <div class="contact-content">
                <h1>Get in Touch</h1>
                <p>Need assistance or have questions? We're here to help! Reach out to our team and we'll respond as quickly
                    as possible.</p>
                <a href="mailto:louistiboldo@gmail.com">
                    ✉️ Email Us
                </a>
            </div>
        </div>
    </div>
@endsection

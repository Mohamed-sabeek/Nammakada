# NammaKada

NammaKada is a comprehensive e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS. It supports both a robust customer-facing application for browsing and purchasing products, and a full-featured admin portal for managing the entire store.

## Features

- **Customer Portal**: Browse products, manage cart, checkout, view order history and track order status.
- **Admin Portal**: Manage products, categories, orders, customers, and view business analytics.
- **Real-time Notifications**: Custom built notification system for both customers and admins.
- **Responsive Design**: Mobile-friendly, beautiful user interface with modern micro-animations and layouts.
- **Authentication**: JWT-based secure authentication for customers and administrators.

## Tech Stack

- **Frontend**: React (Vite), React Router, Tailwind CSS, Phosphor Icons
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT)
- **Image Storage**: Cloudinary

## Getting Started

### Prerequisites
- Node.js
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies for the server:
   ```bash
   cd server
   npm install
   ```
3. Install dependencies for the client:
   ```bash
   cd client
   npm install
   ```
4. Configure your `.env` files in both the `server` and `client` directories by copying the `.env.example` templates.
5. Run the development servers:
   - Server: `npm run dev`
   - Client: `npm run dev`

## Project Structure
- `/client`: React Vite frontend application
- `/server`: Node.js Express backend API

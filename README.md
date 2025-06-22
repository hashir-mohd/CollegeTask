# Student Data Sharing App

## Overview

The **Student Data Sharing App** is a web application designed to securely generate shareable links for student data. It features an admin panel for generating these links and a public page for viewing the shared data. The app is built using modern web technologies, including React, Redux Toolkit, and TypeScript, and is powered by a Vite development environment.

## Features

- **Admin Panel**: Allows authenticated users to generate shareable links for student data.
- **Public Share Page**: Enables anyone with a valid share link to view the shared student data.
- **Authentication**: Secure login system with token-based authentication.
- **Token Refresh**: Automatically refreshes expired tokens to maintain user sessions.
- **Search and Filter**: Filter student data by email on the share page.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS.

## Tech Stack

- **Frontend**: React, Redux Toolkit, TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **API Communication**: Fetch API with token-based authentication

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd student-data-sharing-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup env file:
   ```bash
   create .env file and write this:
   VITE_API_BASE_URL=
   use your backend url
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open the app in your browser at `http://localhost:5173`.

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the app for production.
- `npm run preview`: Preview the production build.


## Usage

### Admin Panel

1. Log in using the admin credentials.
2. Generate a shareable link for student data.
3. Copy the link and share it with others.

### Share Page

1. Open the shareable link in a browser.
2. View the student data associated with the link.
3. Use the email filter to search for specific students.

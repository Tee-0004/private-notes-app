# Private Notes App

A secure, full-stack personal notes application that allows users to create, manage and organise their private notes. Each user can access and manage their own notes after signing in.

## Project Overview

The Private Notes App was developed as a full-stack application using React for the frontend and Node.js with Express for the backend.

The application uses Supabase for user authentication and PostgreSQL database services. Authentication is handled using JSON Web Tokens (JWTs) stored in HTTP-only cookies to help protect user sessions.

## Live Application

- **Frontend:** https://private-notes-app-tebogo.netlify.app
- **Backend API:** https://private-notes-app-zyce.onrender.com
- **GitHub Repository:** https://github.com/Tee-0004/private-notes-app

## Features

### User Authentication
- User registration.
- User login and logout.
- Secure password authentication through Supabase.
- JWT-based authentication.
- HTTP-only cookie session management.
- Protected routes for authenticated users.

### Notes Management
- Create personal notes.
- View saved notes.
- Edit existing notes.
- Delete notes.
- Add notes to favourites.
- Archive notes.
- Restore archived notes.
- Search and organise notes.

### Dashboard
- Personalised dashboard greeting.
- Notes overview.
- Total notes statistics.
- Recently created notes information.
- Last updated information.
- Navigation between notes, favourites and archived notes.

## Technologies Used

### Frontend
- React.js
- Vite
- Tailwind CSS
- JavaScript
- React Router DOM

### Backend
- Node.js
- Express.js
- JavaScript
- REST API
- Cookie-based authentication

### Database and Authentication
- Supabase Authentication
- PostgreSQL
- JSON Web Tokens (JWT)
- HTTP-only cookies

### Development and Deployment Tools
- Visual Studio Code
- Git and GitHub
- Postman
- Netlify
- Render

## Application Architecture

The application follows a client-server architecture.

**Frontend:** React provides the user interface and communicates with the backend through API requests.

**Backend:** Node.js and Express handle API requests, authentication, authorisation and notes management.

**Database:** Supabase provides authentication services and PostgreSQL database storage.

**Authentication flow:**

1. A user registers or logs in.
2. Supabase authenticates the user's credentials.
3. The backend receives the authentication token.
4. The token is stored in an HTTP-only cookie.
5. Protected API requests include the authentication cookie.
6. The backend verifies the user's identity before allowing access to protected resources.

## Security

The application implements several security measures:

- HTTP-only cookies prevent client-side JavaScript from directly accessing the authentication token.
- Secure cookie settings are used in production.
- SameSite cookie configuration supports cross-site authentication.
- Protected backend routes require authentication.
- User-specific access controls help ensure that users can only manage their own notes.
- Environment variables are used to store sensitive configuration values.

## Project Structure

```text
private-notes-app/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── server.js
│
└── README.md
```

## Installation and Setup

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Tee-0004/private-notes-app.git
```

### 2. Navigate into the project

```bash
cd private-notes-app
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

### 4. Start the frontend

```bash
npm run dev
```

### 5. Install Backend Dependencies

Open another terminal and navigate to the backend directory:

```bash
cd backend
npm install
```

### 6. Start the Backend

For development:

```bash
npm run dev
```

To start the backend normally:

```bash
npm start
```

## Environment Variables

The backend requires Supabase configuration.

Create a `.env` file in the backend directory and configure the required variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Use your own Supabase project values.

Never commit `.env` files, passwords, private keys or service role keys to GitHub.

## API Overview

The backend exposes REST API endpoints for authentication and notes management.

The API includes functionality for:

- User registration.
- User login.
- User logout.
- Retrieving notes.
- Creating notes.
- Updating notes.
- Deleting notes.
- Managing favourites.
- Managing archived notes.

Protected endpoints require a valid authenticated session.

## Deployment

The application is deployed using:

- **Netlify:** Frontend hosting.
- **Render:** Backend hosting.
- **Supabase:** Authentication and database services.

The frontend communicates with the deployed backend through the `/api` route.

## Future Improvements

Possible future enhancements include:

- Password reset functionality.
- Additional note organisation features.
- Improved filtering and sorting.
- Additional security enhancements.
- Responsive design improvements.

## Author

Developed by **Tebogo Letshokgohla**.

Private Notes App — A personal space for thoughts, ideas and organisation.
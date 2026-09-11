# Real Estate Listings Management (MEAN Stack)

This is a full-stack web application for browsing and managing real estate listings, built with the MEAN Stack (MongoDB, Express, Angular 17, Node.js).

## Features

- **Authentication**: Agent registration and login using JWT.
- **Listings Management**: CRUD operations for real estate properties.
- **Image Upload**: Upload multiple images per listing using Multer.
- **Advanced Search & Filtering**: Filter by keyword, city, category, and price range.
- **Favorites System**: Users can save and track their favorite properties.
- **Messaging & Notifications**: Built-in messaging system to contact publishers with real-time toaster notifications.
- **Publisher Profiles**: Publishers can manage their contact information (Phone, Contact Email, Facebook).
- **Sorting & Pagination**: View listings by newest or price with clean sliding-window pagination.
- **Responsive UI**: Fully mobile-responsive interface built with TailwindCSS for a premium and modern aesthetic.

## Architecture

- `backend/`: Node.js + Express API server connecting to MongoDB using Mongoose.
- `frontend/`: Angular 17 application using standalone components and TailwindCSS.

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB (Local or Atlas)
- Angular CLI (`npm i -g @angular/cli`)

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd mean-project/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the `backend/` directory based on `.env.example`.
   - Update `MONGO_URI` with your MongoDB connection string if necessary.
4. Seed the database with Property Categories:
   ```bash
   node seeder.js
   ```
5. Start the server:
   ```bash
   node index.js
   ```
   *The backend will run on http://localhost:5000*

### 2. Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd mean-project/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   ng serve
   ```
   *The frontend will be available at http://localhost:4200*

## Testing API

You can test the API using Postman or Thunder Client on the following routes:

- **Auth**
  - `POST /api/auth/register` - Create an account
    ```json
    {
      "name": "Test Agent",
      "email": "test@test.com",
      "password": "password123",
      "role": "agent"
    }
    ```
  - `POST /api/auth/login` - Authenticate
    ```json
    {
      "email": "test@test.com",
      "password": "password123"
    }
    ```
  - `PUT /api/auth/profile` - Update publisher contact info (Requires Bearer token)
    ```json
    {
      "phone": "+1234567890",
      "contactEmail": "contact@test.com",
      "facebookLink": "https://facebook.com/test"
    }
    ```

- **Categories**
  - `GET /api/categories` - Fetch all categories

- **Listings**
  - `GET /api/listings?limit=10&page=1` - Fetch all listings (with pagination/filters)
  - `GET /api/listings/:id` - Fetch single listing details
  - `POST /api/listings` - Create listing (Requires Bearer token and `multipart/form-data` with images and details like title, description, price, city)

- **Messages**
  - `POST /api/messages` - Send a message to a publisher
    ```json
    {
      "listingId": "INSERT_LISTING_ID_HERE",
      "senderName": "John Doe",
      "senderEmail": "john@example.com",
      "senderPhone": "123123123",
      "messageText": "I'm interested in this property."
    }
    ```
  - `GET /api/messages` - Get user's received messages (Requires Bearer token)
  - `GET /api/messages/unread-count` - Poll for unread message notifications (Requires Bearer token)

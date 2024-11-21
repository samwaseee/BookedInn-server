# BookedInn Server

This is the backend server for the BookedInn application. It provides API endpoints for managing rooms, bookings, reviews, and a restaurant menu. The server is built using Node.js, Express, MongoDB, and JWT for authentication.

> **[Client-side](https://github.com/samwaseee/BookedInn-client)**

## Features

- **Room Management**: Fetch available rooms, get details, and update room information.
- **User Authentication**: Login, JWT-based authentication, and logout.
- **Bookings Management**: Secure booking management for authenticated users.
- **Reviews Management**: Add and fetch reviews for rooms.
- **Restaurant Menu**: Fetch menu items for the associated restaurant.

## Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB** (with Mongoose)
- **JWT** for token-based authentication
- **dotenv** for environment variable management
- **CORS** for handling cross-origin requests

## Environment Variables

The following environment variables need to be configured in a `.env` file:

```
PORT=<Server port (default: 5000)>
DB_USER=<Your MongoDB username>
DB_PASS=<Your MongoDB password>
ACCESS_TOKEN_SECRET=<Your JWT secret key>
NODE_ENV=<development or production>
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/samwaseee/BookedInn-server.git
   cd BookedInn-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file and adding the required values.

4. Start the server:

   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- **POST** `/jwt`: Generate a JWT token.
- **POST** `/logout`: Clear the JWT token.

### Rooms

- **GET** `/rooms`: Fetch all rooms (optional query parameters: `minPrice`, `maxPrice`).
- **GET** `/rooms/:id`: Fetch details of a specific room.
- **POST** `/rooms/:id`: Add a review to a room.
- **PATCH** `/rooms/:id`: Update room availability.

### Reviews

- **GET** `/Review`: Fetch all reviews (sorted by time).
- **GET** `/Review/:roomId`: Fetch reviews for a specific room.
- **POST** `/Review`: Add a new review.

### Menu

- **GET** `/menu`: Fetch the restaurant menu.

### Bookings (Protected)

- **GET** `/bookings`: Fetch bookings for the authenticated user (requires email query parameter).
- **GET** `/bookings/:id`: Fetch a specific booking.
- **POST** `/bookings`: Create a new booking.
- **PATCH** `/bookings/:id`: Update a booking's check-in date.
- **DELETE** `/bookings/:id`: Delete a booking.

## Middleware

- **CORS**: Configured for specific origins.
- **JWT Authentication**: Protects sensitive routes.

## Database

This project uses MongoDB with collections for:

- Rooms (`rooms`)
- Bookings (`bookings`)
- Reviews (`reviews`)
- Menu (`resturantMenu`)

Ensure that the database is properly configured and accessible.

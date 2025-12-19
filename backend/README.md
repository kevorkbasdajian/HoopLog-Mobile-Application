# HoopLog - Backend API

**Author:** Kevork Basdajian  
**Course:** CSC 279: Mobile Application Programming  
**University:** Haigazian University  
**Professor:** Joe Hannoush

---

## Table of Contents

- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Postman Collection](#postman-collection)
- [Additional Notes](#additional-notes)


---

## Introduction

This is the backend API for HoopLog, a mobile application designed to help basketball players organize, track, and improve their training routines. The backend provides RESTful API endpoints for user authentication, session management, quotes, and user settings.

The API is built with Express.js, uses Prisma as an ORM with PostgreSQL (Supabase), and implements JWT-based authentication with bcrypt password hashing.

---

## Tech Stack

- **Runtime:** Node.js v22.19.0
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **File Storage:** Supabase Storage
- **Environment Management:** dotenv
- **File Upload:** Multer

---

## Project Structure

```
backend/
│
├── controllers/
│   ├── authController.js
│   ├── sessionsController.js
│   ├── quotesController.js
│   ├── settingsController.js
│   └── userController.js
│
├── services/
│   ├── authService.js
│   ├── sessionsService.js
│   ├── quotesService.js
│   ├── settingsService.js
│   ├── userService.js
│   └── uploadService.js
│
├── routes/
│   ├── authRoutes.js
│   ├── sessionRoutes.js
│   ├── quoteRoutes.js
│   ├── settingsRoutes.js
│   └── userRoutes.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── upload.js
│
├── db/
│   └── prismaClient.js
│
├── config/
│   └── index.js
│
├── utils/
│   └── supabase.js
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js (optional)
│
├── postman/
│   └── HoopLog_API.postman_collection.json
│
├── .env
├── .env.example
├── package.json
├── server.js
└── README.md
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** v22.19.0 or higher 
- **npm:** Comes with Node.js
- **Supabase Account:** 
- **Git:** For cloning the repository

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hooplog-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Required Packages

If not already in `package.json`, install these core dependencies:

```bash
npm install express cors dotenv prisma @prisma/client bcryptjs jsonwebtoken multer uuid
npm install @prisma/adapter-pg
npm install @supabase/supabase-js
npm install --save-dev nodemon
```

---

## Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

### Configuration

Update the `.env` file with your actual values:

```env
# Database - PostgreSQL connection string from Supabase
DATABASE_URL=postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# Authentication - Generate a secure random string
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters_long

# Server
PORT=8080

# Supabase - Get these from your Supabase project settings
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_KEY=your_supabase_anon_or_service_key
SUPABASE_BUCKET_AVATARS=avatars
SUPABASE_BUCKET_SESSION=session-photos
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Settings** → **Database**
   - Copy the **Connection String** (Transaction mode) for `DATABASE_URL`
4. Navigate to **Settings** → **API**
   - Copy the **Project URL** for `SUPABASE_URL`
   - Copy the **anon/public key** for `SUPABASE_KEY`
5. Navigate to **Storage** and create two buckets:
   - `avatars` (for user profile pictures)
   - `session-photos` (for session images)
   - Make both buckets **public** for read access



---

## Database Setup

### Important: Prisma with Supabase Configuration

Due to connection pooling issues with Supabase, you need to use the Prisma PostgreSQL adapter. The `prismaClient.js` should look like this:

```javascript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
});
```

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Run Database Migrations

The database schema was applied using Prisma during development (`prisma db push`). Prisma migrations (`prisma migrate`) are supported and may be used in production environments.

### 3. Verify Database Schema

Check if tables were created successfully:

```bash
npx prisma studio
```

---

## Seeding Initial Data

An initial attempt was made to seed the database using a Prisma seed script. However, due to compatibility issues during development, the seed script could not be executed successfully. As a result, the initial data (motivational quotes and prebuilt training sessions) was inserted manually using Prisma Studio (option 2).

### Option 1: Using Seed Script 

Create `prisma/seed.js`:

```javascript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed Quotes
  const quotes = [
    { quote: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
    { quote: "The only way to prove you're a good sport is to lose.", author: "Ernie Banks" },
    { quote: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    // Add more quotes...
  ];

  for (const quoteData of quotes) {
    await prisma.quote.create({ data: quoteData });
  }

  // Seed Prebuilt Sessions
  const sessions = [
    {
      title: "Free Throw Fundamentals",
      type: "Shooting",
      duration: 30,
      difficulty: "Easy",
      intensity: 3,
      description: "Master the basics of free throw shooting...",
      image: "https://your-image-url.com/session1.jpg",
      ownerId: null, // null means it's a prebuilt session
    },
    // Add more sessions...
  ];

  for (const sessionData of sessions) {
    await prisma.sessionData.create({ data: sessionData });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

Run the seed:

```bash
npx prisma db seed
```

### Option 2: Manual Insertion via Prisma Studio

If the seed script doesn't work:

1. Open Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Navigate to the `Quote` table and add quotes manually
3. Navigate to the `SessionData` table and add prebuilt sessions (leave `ownerId` as `null`)

### Option 3: Direct SQL via Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Run INSERT statements directly:

```sql
INSERT INTO "Quote" (quote, author, "createdAt", "updatedAt")
VALUES 
  ('Hard work beats talent when talent doesn''t work hard.', 'Tim Notke', NOW(), NOW()),
  ('You miss 100% of the shots you don''t take.', 'Wayne Gretzky', NOW(), NOW());

INSERT INTO "SessionData" (title, type, duration, difficulty, intensity, description, image, "ownerId", "createdAt", "updatedAt")
VALUES
  ('Free Throw Fundamentals', 'Shooting', 30, 'Easy', 3, 'Master the basics of free throw shooting', 'https://example.com/image.jpg', NULL, NOW(), NOW());
```

---

## Running the Server

### Development Mode (with auto-restart)

```bash
npm run dev
```

The server will start on `http://localhost:8080` (or the port specified in `.env`).

You should see:

```
Server running on http://localhost:8080
```

---

## API Documentation

### Base URL

```
http://localhost:8080
```

### Authentication Endpoints

#### 1. Sign Up

- **POST** `/auth/signup`
- **Body:**
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:**
  ```json
  {
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "avatar": "",
      "phone": ""
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 2. Login

- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:** Same as Sign Up

---

### Session Endpoints

All session endpoints (except `/sessions/prebuilt`) require authentication via Bearer token.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

#### 1. Get Prebuilt Sessions

- **GET** `/sessions/prebuilt`
- **Query Parameters:** `title`, `type`, `difficulty` (all optional)
- **Response:**
  ```json
  [
    {
      "id": 1,
      "title": "Free Throw Fundamentals",
      "type": "Shooting",
      "duration": 30,
      "difficulty": "Easy",
      "intensity": 3,
      "description": "Master the basics...",
      "image": "https://...",
      "ownerId": null
    }
  ]
  ```

#### 2. Get My Sessions (Subscribed)

- **GET** `/sessions/mylist`
- **Query Parameters:** `title`, `type`, `difficulty`, `favorite` (all optional)
- **Response:**
  ```json
  [
    {
      "id": 1,
      "userId": 1,
      "sessionId": 5,
      "progress": 60,
      "favorite": true,
      "session": {
        "id": 5,
        "title": "Ball Handling Drills",
        // ... other session fields
      }
    }
  ]
  ```

#### 3. Get Session by ID

- **GET** `/sessions/:id`
- **Response:** Single session object

#### 4. Create Session

- **POST** `/sessions`
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `title`: string
  - `type`: string
  - `duration`: number
  - `difficulty`: string
  - `intensity`: number
  - `description`: string
  - `image`: file (optional)

#### 5. Subscribe to Session

- **POST** `/sessions/:id/subscribe`
- **Response:** UserSessionProgress object

#### 6. Unsubscribe from Session

- **DELETE** `/sessions/:id/unsubscribe`

#### 7. Toggle Favorite

- **POST** `/sessions/:id/favorite`
- **Body:**
  ```json
  {
    "favorite": true
  }
  ```

#### 8. Update Progress

- **PUT** `/sessions/:id/progress`
- **Body:**
  ```json
  {
    "progress": 75
  }
  ```

#### 9. Update Session Data

- **PUT** `/sessions/:id`
- **Body:** Session fields to update
- **Note:** Only owner can update

#### 10. Delete Session

- **DELETE** `/sessions/:id`
- **Note:** Only owner can delete

#### 11. Reset All Progress

- **POST** `/sessions/reset-progress`

---

### Quote Endpoint

#### Get Random Quote

- **GET** `/quote/random`
- **Requires:** Authentication
- **Response:**
  ```json
  {
    "id": 5,
    "quote": "You miss 100% of the shots you don't take.",
    "author": "Wayne Gretzky"
  }
  ```

---

### User Endpoints

#### Update Profile

- **PUT** `/user/profile`
- **Requires:** Authentication
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `fullName`: string
  - `phone`: string
  - `avatar`: file (optional)

---

### Settings Endpoints

#### Get Settings

- **GET** `/settings`
- **Requires:** Authentication
- **Response:**
  ```json
  {
    "id": 1,
    "userId": 1,
    "motivationalQuotes": true,
    "vibrationEffects": false
  }
  ```

#### Update Settings

- **PUT** `/settings`
- **Requires:** Authentication
- **Body:**
  ```json
  {
    "motivationalQuotes": true,
    "vibrationEffects": true
  }
  ```

---

## Postman Collection

A complete Postman collection for testing all API endpoints is available in the repository.

### Location
```
postman/HoopLog_API.postman_collection.json
```

### Import Instructions

1. Open Postman
2. Click **Import** in the top left
3. Select the file from the `postman/` directory
4. The collection will be imported with all endpoints organized in folders

### Collection Structure

- **Authentication** - Sign Up, Login
- **Sessions** - All session-related endpoints
- **Quotes** - Random quote retrieval
- **User** - Profile management
- **Settings** - User settings management

---

## Additional Notes

### Database Schema Overview

The application uses four main models:

1. **User**: Stores user authentication and profile data
2. **SessionData**: Stores training sessions (both prebuilt and user-created)
3. **UserSessionProgress**: Junction table linking users to sessions with progress tracking
4. **Quote**: Stores motivational quotes
5. **Setting**: Stores user-specific app settings

### Security Considerations

- Passwords are hashed using bcrypt (salt rounds: 10)
- JWT tokens expire after 7 days
- Protected routes validate tokens via middleware
- File uploads are limited to 5MB
- User can only edit/delete their own sessions


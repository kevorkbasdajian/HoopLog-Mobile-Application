# HoopLog - Mobile Application

**Author:** Kevork Basdajian  
**Course:** CSC 279: Mobile Application Programming  
**University:** Haigazian University  
**Professor:** Joe Hannoush

---

## Table of Contents

- [Introduction](#introduction)
- [Project Evolution](#project-evolution)
- [Tech Stack](#tech-stack)
- [Features Overview](#features-overview)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [App Walkthrough](#app-walkthrough)
- [Data Management](#data-management)
- [Backend Integration](#backend-integration)
- [Project Structure](#project-structure)
- [Known Issues & Limitations](#known-issues--limitations)
- [Future Enhancements](#future-enhancements)

---

## Introduction

HoopLog is a full-stack mobile application designed to help basketball players organize, track, and improve their training routines. The app allows users to log drills, explore predefined sessions, create custom workouts, and monitor their progress through an intuitive interface.

This project demonstrates modern mobile development practices, combining React Native with Expo for the frontend and a robust Express + Prisma backend for data persistence and user authentication.

---

## Project Evolution

### Project 1 → Final Project

This application evolved from Project 1 in the following ways:

**Project 1 (Local Storage):**
- Authentication credentials stored in Expo SecureStore
- Sessions managed with AsyncStorage
- No real backend or database
- Simulated API calls

**Final Project (Full-Stack):**
- Real REST API backend with Express
- PostgreSQL database via Supabase
- JWT-based authentication with bcrypt password hashing
- Centralized API layer with proper error handling
- File uploads to Supabase Storage
- Protected routes and proper authorization
- Session subscriptions and progress tracking
- Multi-user support with data isolation

---

## Tech Stack

### Frontend
- **Framework:** React Native with Expo SDK
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **State Management:** React Context API (AuthContext)
- **Secure Storage:** Expo SecureStore
- **HTTP Client:** Native Fetch API
- **Animations:** Lottie, React Native Reanimated
- **UI Components:** Custom components with React Native core
- **Form Validation:** Formik + Yup
- **Audio/Video:** Expo AV
- **Image Handling:** Expo Image Picker

### Backend
- **Runtime:** Node.js v22.19.0
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma with PostgreSQL adapter
- **Authentication:** JWT + bcrypt
- **File Storage:** Supabase Storage
- **API Architecture:** RESTful

---

## Features Overview

### 1. Authentication & Authorization
- Secure user registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Token persistence via Expo SecureStore
- Automatic token attachment to API requests
- Session expiration handling

### 2. Session Management
-**HomePage:** View Subscribed sessions and track progress
- **Explore Prebuilt Sessions:** Browse professionally designed training drills
- **Create Custom Sessions:** Design personalized workouts with image uploads
- **Subscribe/Unsubscribe:** Add or remove sessions from your training list
- **Progress Tracking:** Monitor completion percentage for each session
- **Favorites System:** Mark sessions for quick access
- **Advanced Filtering:** Search and filter by title, type, difficulty, and favorites
- **Edit/Delete:** Full CRUD operations on user-created sessions

### 3. User Profile & Settings
- Update profile information (name, phone)
- Upload and change profile avatar
- App preferences:
  - Toggle motivational quotes
  - Toggle vibration feedback
- Settings synced with backend

### 4. Motivational Quotes
- Random quote generation from backend database
- Context-aware display (user setting controlled)
- Beautiful modal presentation

### 5. UI/UX Features
- Loading states for all network operations
- Comprehensive error handling with user-friendly messages
- Smooth animations and transitions
- Gradient backgrounds and modern design
- Keyboard-aware forms
- Empty states with helpful messaging
- Responsive layouts

---

## Installation & Setup

### Prerequisites

- **Node.js:** v18+ 
- **Expo CLI:** `npm install -g expo-cli`
- **Backend Server:** Running HoopLog backend (see backend README)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hooplog-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npx expo start
```

---

## Configuration

### Backend URL Configuration

Update the API URL in `config/api.js` to match your backend:

```javascript
export const API_URL = "http://192.168.1.6:8080"; // Change to your backend URL
```

**Important:**
- For iOS Simulator: Use `http://localhost:8080`
- For Android Emulator: Use `http://10.0.2.2:8080`
- For Physical Device: Use your computer's local IP (e.g., `http://192.168.1.6:8080`)

---

## App Walkthrough

### Navigation Architecture

The app uses a two-tier navigation structure:

#### 1. Authentication Stack (Pre-Login)
- **Landing Page:** Welcome screen with app introduction
- **Login Page:** User authentication
- **SignUp Page:** New user registration
- **IntroVideo Page:** Onboarding video experience

#### 2. Main Stack (Post-Login)
Combines Bottom Tab Navigator + Stack Navigator:

**Bottom Tabs:**
- **Home Tab:** My sessions, quick actions, search/filter
- **Explore Tab:** Browse prebuilt sessions

**Stack Screens:**
- **Profile:** User information and avatar
- **Settings:** App preferences
- **Session Detail:** Full session information with edit/delete
- **Create Session:** Form for creating/editing sessions

---

### Screen Details

#### Landing Page
- Animated logo and branding
- Smooth fade-in transitions
- Sound effects on interaction
- Navigation to login

**Key Features:**
- LottieView animations
- Timed component sequences
- Audio feedback via Expo AV

---

#### Login Page
- Email and password authentication
- Form validation with Formik + Yup
- Keyboard-aware scrolling
- Error messaging for invalid credentials
- Secure token storage

**API Integration:**
```javascript
POST /auth/login
Body: { email, password }
Response: { user, token }
```

---

#### SignUp Page
- User registration with full name, email, password
- Email uniqueness validation
- Password strength requirements
- Info hints for each field
- Automatic settings creation

**API Integration:**
```javascript
POST /auth/signup
Body: { fullName, email, password }
Response: { user, token }
```

---

#### IntroVideo Page
- Background video with overlay
- Sequential audio playback
- Animated blur effects
- Smooth transition to main app

---

#### Home Page
The central hub of the application.

**Features:**
- User avatar display (from backend)
- Quick action cards with gradients
- Search and filter interface
- Session list with favorites
- Loading and error states
- Empty state handling
- Motivational quote button

**API Integration:**
```javascript
GET /sessions/mylist
Query: { title?, type?, difficulty?, favorite? }

POST /sessions/:id/favorite
Body: { favorite: boolean }

DELETE /sessions/:id/unsubscribe
```

**Data Flow:**
1. On mount/focus: Fetch user's subscribed sessions
2. Transform response data to match app structure
3. Store in local state for filtering
4. Re-fetch on navigation focus (always fresh data)

---

#### Explore Page
Browse and subscribe to prebuilt sessions.

**Features:**
- list view of all prebuilt sessions
- One-tap subscription
- Visual feedback for actions

**API Integration:**
```javascript
GET /sessions/prebuilt
Query: { title?, type?, difficulty? }

POST /sessions/:id/subscribe
```

---

#### Session Detail Page
Comprehensive view of a single session.

**Features:**
- Full session information display
- Progress tracker with visual indicator
- Edit button
- Delete button (custom-built sessions only)
- Favorite toggle
- Unsubscribe option
- Image display

**API Integration:**
```javascript
GET /sessions/:id

PUT /sessions/:id
Body: { session data }

PUT /sessions/:id/progress
Body: { progress: number }

DELETE /sessions/:id
```

---

#### Create/Edit Session Page
Form for creating or editing training sessions.

**Features:**
- Image picker (camera or library)
- Text inputs for all session fields
- Form validation
- Multi-part form data submission
- Edit mode with pre-filled data

**API Integration:**
```javascript
POST /sessions
Content-Type: multipart/form-data
Body: FormData with session fields + image

PUT /sessions/:id
Body: { session data }
```

**Image Upload Flow:**
1. User selects image via Expo Image Picker
2. Convert to Blob/File object
3. Append to FormData
4. POST to backend
5. Backend uploads to Supabase Storage
6. Returns public URL
7. URL stored in database

---

#### Profile Page
User information management.

**Features:**
- Display current user info
- Avatar upload with image picker
- Full name editing
- Phone number editing

**API Integration:**
```javascript
PUT /user/profile
Content-Type: multipart/form-data
Body: { fullName, phone, avatar? }
```

---

#### Settings Page
App preferences and session management.

**Features:**
- Motivational quotes toggle
- Vibration effects toggle
- Reset all progress button
- Confirmation dialogs
- Immediate feedback
- Logout functionality

**API Integration:**
```javascript
GET /settings
Response: { motivationalQuotes, vibrationEffects }

PUT /settings
Body: { motivationalQuotes?, vibrationEffects? }

POST /sessions/reset-progress
```

---

## Data Management

### Authentication Flow

1. **Login/Signup:**
   - User submits credentials
   - API returns user object + JWT token
   - Token stored in Expo SecureStore
   - User object stored in SecureStore
   - AuthContext updated

2. **Persistence:**
   - On app launch, check SecureStore for token
   - If valid token exists, auto-login
   - Fetch user settings from backend

3. **Protected Routes:**
   - Every API call (excpet Signup and Login) attaches Bearer token
   - Backend middleware validates token
   - Invalid/expired token → logout + redirect

4. **Logout:**
   - Clear SecureStore
   - Clear AuthContext
   - Navigate to Login

### Session Data Flow

**Project 1 (Local Storage):**
```javascript
// Sessions stored in AsyncStorage
const sessions = await AsyncStorage.getItem('@hooplog_sessions');
```

**Final Project (Backend):**
```javascript
// Sessions fetched from API on every screen focus
const result = await sessionsAPI.getMyList();
// Transform and store in component state
setSessions(transformedSessions);
```

**Key Improvements:**
- No local data caching (always fresh from server)
- Proper error handling with user feedback
- Loading states during fetch
- Automatic retry on network errors

### State Management Strategy

**Global State (AuthContext):**
- User authentication status
- User profile data
- App settings (quotes, vibration)
- Login/logout methods

**Local Component State:**
- Session lists
- Filtered sessions
- Loading indicators
- Error messages
- UI state (modals, toggles)

---

## Backend Integration

### Centralized API Layer

All network requests go through `config/api.js`:

```javascript
export const apiCall = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  // Error handling and JSON parsing
  return { success, data, error };
};
```

### Error Handling Pattern

Every API call follows this pattern:

```javascript
try {
  setIsLoading(true);
  setError(null);
  
  const result = await sessionsAPI.someEndpoint();
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  // Handle success
} catch (error) {
  console.log("Error:", error);
  setError(error.message || "Something went wrong");
} finally {
  setIsLoading(false);
}
```

### Data Transformation

Backend responses are transformed to match app structure:

```javascript
export const transformSessionData = (sessionData) => {
  return {
    id: sessionData.id,
    title: sessionData.title,
    // ... other fields
    image: sessionData.image?.startsWith("http")
      ? { uri: sessionData.image }
      : { uri: `${API_URL}${sessionData.image}` },
  };
};
```

---

## Project Structure

```
hooplog-frontend/
│
├── app/
│   ├── index.js                    # Entry point
│   │
│   ├── screens/
│   │   ├── LandingPage.js          # Welcome screen
│   │   ├── LoginPage.js            # Authentication
│   │   ├── SignUpPage.js           # Registration
│   │   ├── EntrySuccessPage.js     # Onboarding video
│   │   ├── HomePage.js             # Main dashboard
│   │   ├── ExploreSessionsPage.js  # Prebuilt sessions
│   │   ├── SessionDetailPage.js    # Session details
│   │   ├── CreateSessionPage.js    # Create/edit form
│   │   ├── ProfilePage.js          # User profile
│   │   └── SettingsPage.js         # App settings
│   │
│   └── navigation/
│       ├── AppNavigator.js         # Root navigator
│       ├── AuthStack.js            # Pre-login screens
│       └── MainStack.js            # Post-login screens
│
├── assets/
│   ├── animations/                 # Lottie JSON files
│   ├── fonts/                      # Custom fonts
│   ├── images/                     # Static images
│   ├── sounds/                     # Audio files
│
├── components/
│   ├── Button.js                   # Reusable button
│   ├── Icon.js                     # Icon wrapper
│   ├── Quotes.js                   # Quote modal
│   ├── SearchAndFilter.js          # Search/filter UI
│   └── SessionCard.js              # Session list item
│
├── config/
│   └── api.js                      # API client & endpoints
│
├── constants/
│   ├── colors.js                   # Color palette
│   └── fonts.js                    # Font definitions
│
├── context/
│   └── AuthContext.js              # Auth state management
│
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## Known Issues & Limitations

### 1. Local Development Only

Currently, the backend is running locally. For production deployment:
- Backend needs to be hosted (Render, Railway, Vercel)
- Update `API_URL` to production URL
- Configure CORS for production domain

### 3. Image Upload Size Limit

File uploads are limited to 5MB. Large images may fail silently.

### 4. Progress Tracking

Progress is a simple percentage field. Future enhancements:
- Detailed workout logs (sets, reps, duration)
- Progress charts and analytics
- Session history timeline

### 5. Real-Time Updates

Changes made by other users or devices aren't reflected in real-time:
- Implement WebSocket connections
- Add push notifications
- Poll for updates at intervals


---

## Future Enhancements

### Phase 1: Performance & UX
- [ ] Implement data caching with AsyncStorage
- [ ] Add pull-to-refresh on all list screens
- [ ] Skeleton loading screens
- [ ] Image compression before upload

### Phase 2: Features
- [ ] Social features (share sessions, follow users)
- [ ] Workout calendar and scheduling
- [ ] Detailed progress analytics with charts
- [ ] Video tutorial integration
- [ ] Timer/stopwatch during sessions
- [ ] Achievements and badges


---

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up creates new account
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error
- [ ] Token persists across app restarts
- [ ] Logout clears session

**Sessions:**
- [ ] Fetch and display user sessions
- [ ] Search filters sessions correctly
- [ ] Subscribe to prebuilt session
- [ ] Create new session with image
- [ ] Edit own session
- [ ] Delete own session
- [ ] Cannot edit/delete/view others' sessions
- [ ] Toggle favorite updates UI and backend
- [ ] Progress updates persist

**Profile & Settings:**
- [ ] Update profile information
- [ ] Upload new avatar
- [ ] Settings toggles save to backend
- [ ] Reset progress clears all data

**Error Handling:**
- [ ] Network errors show friendly message
- [ ] Invalid token redirects to login
- [ ] Form validation prevents invalid submissions
- [ ] File upload errors are caught

### Testing with Backend

1. Start backend server: `npm run dev` (in backend directory)
2. Verify server is running: http://localhost:8080
3. Update frontend `API_URL` to match
4. Test all endpoints via app UI
5. Check backend logs for errors
6. Verify database updates in Prisma Studio

---


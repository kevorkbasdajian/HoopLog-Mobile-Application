# HoopLog - Mobile Application

**Author:** Kevork Basdajian <br>
**Course:** CSC 279: Mobile Application Programming <br>
**University:** Haigazian University <br>
**Professor:** Joe Hannoush

---

## Introduction

HoopLog is a mobile application designed to help basketball players organize, track, and improve their training routines. The app allows users to log drills, explore predefined sessions, create custom workouts, and monitor their progress, all through a clean interface and consistent styling to ensure a smooth user experience.

HoopLog was developed using React Native + Expo, with persistent local storage, secure authentication, and a modern UI/UX across all screens.

---

## App Walkthrough & Features

The application is built upon several integrated functionalities and features, each serving a specific purpose.

### Navigation

To facilitate proper traversal between pages, the application is divided into two main segments:

- #### Authentication Stack (First Part)

  Built with React Navigation (Native Stack), this stack includes the Landing, Login, SignUp, and IntroVideo pages.

- #### Main Stack (Second Part)

  Once a user is authenticated, the Main Stack is accessible, which is built using a combination of a Bottom Tab Navigator and a Stack Navigator:

  - The Bottom Tab Navigator provides quick access to the Home and Explore pages.
  - Other members of the Main Stack include the Profile, Settings, Item Details, and CreateItem pages.

## Landing Page

Greets new users by displaying the application's logo and a brief purpose of the app. It directs the user to the Login Page to begin exploring the app.

### Main Features

- **_Animations_**:
  Page components use controlled fade, scale, and slide effects to enhance user experience and provide dynamic behavior. Timed sequences guide the appearance of the logo, title, subtitle, and buttons
- **_LottieView animation_**:
  A LottieView component is used to display smooth, looped animations, adding dynamic visual effects.
- **_Sound effects_**:
  A sound is played when the user clicks the “Get Started" button to intrigue the user and enhance the experience.

## Login Page

Users input an email and password combination on this page for validation. First-time users can navigate to the signup page to create a new account.

### Main Features

- **_Form validation using Formik and Yup_**: Handles structured input validation providing clear error messages for email and password fields.
- **_Secure authentication using Expo SecureStore_**: Expo-secure-store is used to safely store and retrieve user credentials and tokens.
- **_Keyboard-aware handling_**: “KeyboardAvoidingView” and “TouchableWithoutFeedback” ensure smooth interactions when the keyboard is open.

## SignUp Page

Prompts the user to create an account by inputting the required fields.

### Main Features

- **_Validation_**: Like the Login Page, validations ensure proper workflow, such as enforcing that “One email is associated with one account only”.
- **_Input hints_**: Each form field includes an optional info hint that users can toggle by pressing an info icon. These hints guide proper input, such as password requirements or full name format.

## IntroVideo Page

Displays a short video featuring a player practicing his skills.

### Main Features

- **_Background video_**: A muted video plays in the background to create a dynamic and immersive experience.
- **_Sequenced audio_**: Introductory and announcement sounds are played sequentially using expo-av for a richer user experience.
- **_Blur effects_**: BlurView with animated intensity is applied over the video to emphasize the logo and text during transitions.

## Home Page

This is the central page, where users can navigate from to their Profile details and then to Settings. They can also search and filter their list of sessions, explore the built-in sessions that come with the app, and create new ones.

### Main Features

- **_Persistent storage via AsyncStorage_**: Sessions, Favorites, and user profile are loaded and saved using “AsyncStorage”, ensuring that data persists between navigation and after app restarts.
- **_Loading and empty states_**: The app displays a loading message while sessions are being retrieved. It also shows an Empty State (with an icon and a message) when no sessions exist.
- **_Quick action cards_**: Contains two links: One to the explore page and one to the create page. Each card has a gradient background, animated Lottie graphics, and a navigation arrow.
- **_Search and filter capabilities_**: Allows searching and filtering the sessions.
  - A live search bar allows users to find sessions by name, instantly updating the displayed list.
  - A structured modal interface provides advanced filtering controls: Session Type Filter, Difficulty Filter, and Favorites Toggle.
  - Active filters are visually displayed as removable “chips” under the search bar, providing clear feedback.
  - A numeric badge on the filter icon indicates the number of active filters.

## Explore Page

Displays the built-in sessions that are always present in the app. Users can add these sessions to their list, after which they can be viewed in the Home page.

## ItemDetail Page

Shows full details of a selected session.
If the item belongs to the user, editing and deleting options appear.

## CreateItem Page

Allows users to create or edit custom sessions. The same page is used for editing an existing session, with the session data pre-filled.

### Main Features

- **_Image Picker_**: Opens a modal offering two options: take a photo or choose from the library. A pencil icon overlays the selected image for editing. Proper validation ensures that an image must be selected.
- **_Progress Tracker_**: An interactive slider system that includes progress badge, a color-coded progress bar, quick buttons, and fine controls for manual inputs.

## Profile & Settings Page

Allows modification of personal information and adjustment of app preferences through toggles.

---

## Data Models

The HoopLog data model is centered around two main entities: **User** and **Session**.
It combines local persistence for user-generated data and basic authentication credentials for login and access control.

### User Model

Each user is identified through their email and password, which are securely handled during login and registration.
The model ensures that only authenticated users can access and manage their stored sessions.

| Field            | Type   | Description       |
| ---------------- | ------ | ----------------- |
| Email            | String | Unique identifier |
| Password         | String | Securely stored   |
| Username         | String | Display name      |
| Photo            | Object | Profile image     |
| Telephone Number | Number | Contact number    |

---

### Session Model

Each session represents a predefined or user-created basketball drill.
Sessions are stored locally using AsyncStorage under the key @hooplog_sessions, allowing offline persistence.

| Field      | Type   | Description            |
| ---------- | ------ | ---------------------- |
| Id         | String | Unique identifier      |
| Title      | String | Drill or session title |
| Type       | String | Category               |
| Difficulty | String | Easy / Medium / Hard   |
| Duration   | Number | Minutes                |
| Intensity  | Number | Physical effort rating |
| Image      | Object | Image asset            |

---

### Quote Model

The Quote model has the attributes quote and owner, which are used to realize the random quote genertaion feature of the application.

---

## Issues & Limitations

While HoopLog functions effectively for single-user session tracking and exploration, the current implementation has several limitations and known issues:

### 1. Single-Account Limitation

The app currently supports only one user at a time. User credentials are stored locally in SecureStore, meaning that creating or logging into a second account will overwrite the existing credentials.

### 2. Session Progress Tracking

Currently, the app does not allow users to post or track the progress and outcomes of their sessions. Adding this feature could improve user engagement by enabling users to monitor their performance over time and share achievements.

### 3. Intro Sequence Timing

The intro video uses hardcoded timeouts (setTimeout) for transitions and navigation, which may cause timing inconsistencies on slower devices.

---

## Project Structure

Project directory layout for this application:

```
HoopLog-Mobile-Application/
│
├── app/
│   ├── index.js
│   ├── screens/
│   │   ├── LandingPage.js
│   │   ├── LoginPage.js
│   │   ├── SignUpPage.js
│   │   ├── EntrySuccessPage.js
│   │   ├── HomePage.js
│   │   ├── CreateSessionPage.js
│   │   ├── ProfilePage.js
│   │   ├── SettingsPage.js
│   │   ├── ExploreSessionsPage.js
│   │   └── SessionDetailPage.js
│   └── navigation/
│       ├── AppNavigator.js
│       ├── MainStack.js
│       └── AuthStack.js
│
├── assets/
│   ├── animations/
│   ├── fonts/
│   ├── images/
│   ├── sounds/
│   └── videos/
│
├── components/
│   ├── Button.js
│   ├── Icon.js
│   ├── Quotes.js
│   ├── SearchAndFilter.js
│   └── SessionCard.js
│
├── constants/
│   ├── colors.js
│   ├── fonts.js
│   ├── quotesData.js
│   └── sessionData.js



```

---

## Future Enhancements

Potential future improvements include:

- Geotagging for individual sessions.
- Proper authentication of users.
- Advanced session tracking mechanisms.
- Performance summaries and progress charts.
- Notifications for upcoming sessions or reminders.

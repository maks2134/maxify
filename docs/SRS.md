# Software Requirements Specification (SRS) for Moxify

---

# Table of Contents
1 [Introduction](#introduction)  
1.1 [Purpose](#purpose)  
1.2 [Business Requirements](#business-requirements)  
1.2.1 [Background](#background)  
1.2.2 [Business Opportunities](#business-opportunities)  
1.2.3 [Project Scope](#project-scope)  
1.3 [Analogs](#analogs)  
2 [User Requirements](#user-requirements)  
2.1 [Software Interfaces](#software-interfaces)  
2.2 [User Interface](#user-interface)  
2.3 [User Characteristics](#user-characteristics)  
2.3.1 [User Classes](#user-classes)  
2.3.2 [Application Audience](#application-audience)  
2.3.2.1 [Primary Audience](#primary-audience)  
2.3.2.2 [Secondary Audience](#secondary-audience)  
2.4 [Assumptions and Dependencies](#assumptions-and-dependencies)  
3 [System Requirements](#system-requirements)  
3.1 [Functional Requirements](#functional-requirements)  
3.1.1 [Core Functions](#core-functions)  
3.1.1.1 [New User Registration](#user-registration)  
3.1.1.2 [User Login and Logout](#user-login-logout)  
3.1.1.3 [Audio Track Upload](#track-upload)  
3.1.1.4 [Personal Track Library Management](#track-management)  
3.1.1.5 [Playlist Creation and Management](#playlist-management)  
3.1.1.6 [Music Playback](#music-playback)  
3.1.1.7 [Library Search](#search-functionality)  
3.1.2 [Constraints and Exclusions](#constraints-and-exclusions)  
3.2 [Non-Functional Requirements](#non-functional-requirements)  
3.2.1 [Quality Attributes](#quality-attributes)  
3.2.1.1 [Usability Requirements](#usability-requirements)  
3.2.1.2 [Security Requirements](#security-requirements)  
3.2.1.3 [Performance Requirements](#performance-requirements)  
3.2.2 [External Interfaces](#external-interfaces)  
3.2.3 [Constraints](#constraints)  
3.2.4 [Architectural Requirements](#architectural-requirements)  

<a name="introduction"/>

# 1 Introduction

<a name="purpose"/>

## 1.1 Purpose
This document describes the functional and non-functional requirements for the web application "Moxify" – a Spotify-like analog built with a modern microservices architecture. This document is intended for the development team who will implement and test the application, and for the instructor evaluating the project.

<a name="business-requirements"/>

## 1.2 Business Requirements

<a name="background"/>

### 1.2.1 Background
Music is an integral part of modern life. Users often want to have their own, personalized music collections, gathered from various sources, rather than relying on the algorithms and catalogs of major streaming services. Existing solutions are either commercial with limitations or too complex to set up and use. Furthermore, listening to a personal collection often requires a constant internet connection to access cloud services or a complex file synchronization process between devices.

<a name="business-opportunities"/>

### 1.2.2 Business Opportunities
Moxify provides users with a simple and convenient platform to create and manage their personal music library in an "all-in-one" format. Users can upload their own audio files, structure them into playlists, and access them through a unified web interface from any device. This solves the problem of music collection fragmentation across different devices and services. The microservices architecture ensures scalability and maintainability.

<a name="project-scope"/>

### 1.2.3 Project Scope
The "Moxify" application is a web service that allows registered users to upload audio files, create personal playlists, and listen to their collection through a browser. Functionality for unauthenticated users is not provided. The project is educational and does not imply monetization, commercial use, or integration with music content rights holders.

<a name="analogs"/>

## 1.3 Analogs
*   **Spotify / Apple Music / Yandex Music:** Major commercial streaming services. Their key difference is providing access to vast music catalogs via subscription. Moxify focuses on the user's personal collection, not on providing access to a shared catalog.
*   **Plex / Jellyfin:** Media servers that allow organizing a personal collection of media files, including music. Their drawback is the complexity of initial server setup and the need for own hosting hardware. Moxify offers a simpler and more accessible SaaS (Software as a Service) model for the specific task of music management.
*   **Google Play Music (discontinued):** Previously allowed uploading up to 50,000 personal tracks and playing them alongside the service's catalog. Moxify focuses exclusively on user's personal uploads.

<a name="user-requirements"/>

# 2 User Requirements

<a name="software-interfaces"/>

## 2.1 Software Interfaces
*   **Backend Services:** Multiple microservices written in Go (Golang).
*   **Frontend:** Next.js application with TypeScript and Tailwind CSS.
*   **API Communication:** RESTful APIs and potentially gRPC for inter-service communication.
*   **Data Storage:** PostgreSQL database for persistent storage of metadata (users, tracks, playlists).
*   **File Storage:** Audio files stored in a dedicated object storage service or filesystem, with paths referenced in PostgreSQL.
*   **Authentication:** JWT (JSON Web Tokens) for securing API endpoints.

<a name="user-interface"/>

## 2.2 User Interface
Graphical mockups of the user interface are presented below. They illustrate the key application screens.

**Application Login Window.**
![Login Window](/docs/mockups/login.jpeg)

**New User Registration Window.**
![Registration Window](/docs/mockups/register.jpeg)

**Main Application Window (Track Library).**
![Main Window - Library](/docs/mockups/library.jpeg)

**Playlist View and Management Window.**
![Playlist Management](/docs/mockups/playlist.jpeg)

**New Track Upload Window.**
![Upload Track](/docs/mockups/upload.jpeg)

<a name="user-characteristics"/>

## 2.3 User Characteristics

<a name="user-classes"/>

### 2.3.1 User Classes

| User Class | Description |
| :--- | :--- |
| Unauthenticated User (Guest) | A user who is not logged in. Can only view the login and registration pages. |
| Authenticated User | A user who has successfully logged in. Has full access to functionality for managing their personal library and playlists. |

<a name="application-audience"/>

### 2.3.2 Application Audience

<a name="primary-audience"/>

#### 2.3.2.1 Primary Audience
People who collect their own digital music collections (in MP3, FLAC, AAC, etc. formats) and want convenient, centralized, and anywhere-accessible access to them.

<a name="secondary-audience"/>

#### 2.3.2.2 Secondary Audience
Audiophiles wanting to experiment with their own music server; developers interested in modern stacks involving Go microservices, Next.js, and PostgreSQL.

<a name="assumptions-and-dependencies"/>

## 2.4 Assumptions and Dependencies
1.  The application assumes the user uploads audio files for which they have the rights.
2.  Streaming functionality depends on the user's browser supporting the audio file format.
3.  A stable internet connection is required to upload tracks and for the frontend to communicate with backend services.
4.  An internet connection is required to play music (unless files are cached by the browser).
5.  The PostgreSQL database and any other dependent services (e.g., object storage) are available and accessible.

<a name="system-requirements"/>

# 3 System Requirements

<a name="functional-requirements"/>

## 3.1 Functional Requirements

<a name="core-functions"/>

### 3.1.1 Core Functions

<a name="user-registration"/>

#### 3.1.1.1 New User Registration
**Description.** The user must be able to create a new account to access the application's functionality.

| Function | Requirements |
| :--- | :--- |
| Data Input | The Next.js frontend must provide a form for entering a username, email address, password, and password confirmation. |
| API Call | Form submission triggers a POST request to the Go User Service API endpoint (e.g., `/api/v1/users/register`). |
| Data Validation | The Go User Service must validate the uniqueness of the username and email against the PostgreSQL `users` table, check password compliance, and ensure password fields match. |
| Error Handling | The service returns appropriate HTTP error codes and messages, which the Next.js frontend displays. |
| Account Creation | Upon successful validation, the service creates a user record in PostgreSQL, hashes the password (using bcrypt), and returns a success response. The frontend redirects to login. |

<a name="user-login-logout"/>

#### 3.1.1.2 User Login and Logout
**Description.** A registered user must be able to log in and log out of the system.

| Function | Requirements |
| :--- | :--- |
| Authentication | The Next.js frontend sends login credentials to the Go Auth Service API (e.g., `/api/v1/auth/login`). The service verifies them against PostgreSQL. |
| JWT Generation & Session | Upon success, the Auth Service generates a JWT containing the user ID and roles. This token is stored securely (e.g., in an HTTP-only cookie) by the frontend and included in subsequent API requests. |
| Logout | The frontend clears the authentication token, and the Go service may optionally blacklist the JWT if needed. |

<a name="track-upload"/>

#### 3.1.1.3 Audio Track Upload
**Description.** An authenticated user must be able to upload audio files to their library.

| Function | Requirements |
| :--- | :--- |
| File Selection | The Next.js frontend provides an interface for selecting files, potentially using a library like `react-dropzone`. |
| API Call | The file(s) are sent via a multipart/form-data POST request to the Go Track Service (e.g., `/api/v1/tracks/upload`), including the JWT in the Authorization header. |
| Metadata Extraction | The Track Service should attempt to extract metadata (ID3 tags) from the file. |
| File Validation & Storage | The service validates file type/size. The file content is saved to the configured storage (filesystem/object storage). |
| Database Update | Metadata (title, artist, duration, file path, user ID) is stored in the PostgreSQL `tracks` table. |

<a name="track-management"/>

#### 3.1.1.4 Personal Track Library Management
**Description.** The user must be able to view and delete tracks from their library.

| Function | Requirements |
| :--- | :--- |
| View Library | The Next.js frontend fetches the user's tracks by calling the Go Track Service API (e.g., `GET /api/v1/tracks?user_id=<userId>`). The service queries the PostgreSQL `tracks` table. |
| Delete Track | A delete action calls the Track Service API (e.g., `DELETE /api/v1/tracks/:id`). The service deletes the record from PostgreSQL *and* the corresponding file from storage. |

<a name="playlist-management"/>

#### 3.1.1.5 Playlist Creation and Management
**Description.** The user must be able to create playlists and manage their content.

| Function | Requirements |
| :--- | :--- |
| Create Playlist | The frontend calls the Go Playlist Service (e.g., `POST /api/v1/playlists` with `{"name": "My Playlist"}`). The service creates an entry in the PostgreSQL `playlists` table. |
| Manage Tracks | Endpoints like `POST /api/v1/playlists/:id/tracks` add associations in a junction table (e.g., `playlist_tracks`) in PostgreSQL. |
| View Playlists | The Playlist Service handles queries to retrieve playlists and their associated tracks via PostgreSQL JOINs or multiple queries. |

<a name="music-playback"/>

#### 3.1.1.6 Music Playback
**Description.** The user must be able to play audio tracks from their library and playlists.

| Function | Requirements |
| :--- | :--- |
| Get Stream URL | The Next.js frontend retrieves a URL for the audio file (e.g., from the Track Service response or by constructing it based on a file path or endpoint). |
| Streaming Endpoint | A Go service (perhaps the Track Service) provides an endpoint (e.g., `GET /api/v1/tracks/:id/stream`) that serves the audio file. This endpoint must support the `Range` header for seeking and require JWT authentication. |
| Frontend Player | The Next.js app uses the HTML5 `<audio>` element or a library like `react-h5-audio-player` to play the stream from the Go endpoint. |

<a name="search-functionality"/>

#### 3.1.1.7 Library Search
**Description.** The user must be able to search for tracks and playlists by title or artist name.

| Function | Requirements |
| :--- | :--- |
| Search Query | The Next.js frontend sends the search query to a dedicated search API endpoint (e.g., `GET /api/v1/search?q=query`). |
| Backend Search | A Go Search Service (or an endpoint within an existing service) performs a query on the PostgreSQL `tracks` and `playlists` tables using `ILIKE` or full-text search capabilities. |
| Results Display | The filtered results are returned to the frontend for display. |

<a name="constraints-and-exclusions"/>

### 3.1.2 Constraints and Exclusions
1.  The application does not handle automatic downloading or fetching of music from external sources. All tracks are uploaded by the user themselves.
2.  The application does not support social features (sharing, collaborative playlists, following) within the MVP.
3.  There is no function to edit track metadata directly within the application.
4.  There is no offline mode for downloading music to the device (caching is handled arbitrarily by the browser).
5.  Advanced search features like fuzzy matching or audio analysis are out of scope for MVP.

<a name="non-functional-requirements"/>

## 3.2 Non-Functional Requirements

<a name="quality-attributes"/>

### 3.2.1 Quality Attributes

<a name="usability-requirements"/>

#### 3.2.1.1 Usability Requirements
1.  The Next.js interface should be intuitive, responsive (using Tailwind CSS), and familiar to users of modern streaming services.
2.  The track upload process should be simple and involve a minimal number of steps.
3.  Navigation between sections (Library, Playlists) should be clear and easily accessible.

<a name="security-requirements"/>

#### 3.2.1.2 Security Requirements
1.  User passwords must be hashed in PostgreSQL using bcrypt.
2.  API access must be restricted based on JWT authentication. A user cannot retrieve or modify another user's data. Go services must validate the JWT and user permissions for each relevant request.
3.  Access to audio file streaming endpoints must be protected by JWT validation.
4.  Next.js API routes handling sensitive operations should validate session/tokens before calling Go services.
5.  Environment variables should be used for secrets (JWT keys, DB passwords).

<a name="performance-requirements"/>

#### 3.2.1.3 Performance Requirements
1.  The Next.js frontend should leverage its built-in optimizations (Image, Link components) for fast page loads.
2.  Go microservices should be efficient and have low response latency (< 100ms for most API calls).
3.  Audio streaming should start promptly upon track selection, with minimal buffering time. The Go streaming endpoint must efficiently handle `Range` requests.
4.  Database queries in Go should be optimized to avoid N+1 query problems, especially when loading playlists with tracks.

<a name="external-interfaces"/>

### 3.2.2 External Interfaces
1.  The Next.js application must be accessible from modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).
2.  The user interface must be responsive and adapt to different screen sizes (desktop, tablet, mobile).

<a name="constraints"/>

### 3.2.3 Constraints
1.  The backend must be implemented as microservices in Go.
2.  The primary data store for metadata must be PostgreSQL.
3.  The frontend must be implemented using Next.js, TypeScript, and Tailwind CSS.
4.  The MVP must be developed within the timeframe and scope of the university course project.

<a name="architectural-requirements"/>

### 3.2.4 Architectural Requirements
1.  **Microservices:** The system shall be composed of loosely coupled Go services (e.g., User Service, Auth Service, Track Service, Playlist Service).
2.  **Database:** PostgreSQL shall be used as the primary relational database for all services. Each service may own its related tables(s).
3.  **API Gateway:** An API Gateway pattern might be employed (potentially using a Go framework like `go-kit` or `gin` with grouping) to route requests to the appropriate microservice, though direct client-to-service communication is also acceptable for MVP.
4.  **Frontend:** The frontend shall be a Next.js application using TypeScript for type safety and Tailwind CSS for styling. It will consume the APIs provided by the Go microservices.
5.  **Inter-service Communication:** Communication between Go microservices (if required) should use well-defined protocols, potentially REST HTTP APIs or gRPC for performance-critical paths.
6.  **Authentication:** JWT shall be the mechanism for authentication and authorization across services. The token should be generated by a dedicated Auth Service and validated by other services.

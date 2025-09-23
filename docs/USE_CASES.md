# Maxify - Use Case Analysis

## Actors
1.  **Unauthenticated User (Guest)**: A user who has not logged in. Can only access the login and registration pages.
2.  **Authenticated User**: A registered user who has successfully logged into the system. This is the primary actor for all core functionalities.


## Use Case Scenarios

### UC1: Register New Account

**Actor:** Unauthenticated User
**Precondition:** The user is not logged in and is on the application's landing page.
**Flow of Events:**
1.  The user clicks the "Register" link.
2.  The Next.js frontend displays a registration form with fields for `Username`, `Email`, `Password`, and `Confirm Password`.
3.  The user fills in the form and submits it.
4.  The frontend performs basic client-side validation (e.g., email format, password matching).
5.  The frontend sends a `POST /api/v1/users` request to the User Service with the form data.
6.  The User Service receives the request:
    a. Validates that the username and email are unique by querying the PostgreSQL database.
    b. Hashes the password using bcrypt.
    c. Persists the new user record (`username`, `email`, `password_hash`) in the `users` table.
7.  The service returns a `201 Created` status on success.
8.  The frontend receives the response, displays a success message, and redirects the user to the login page.
    **Alternative Flow (A):** Validation fails (e.g., username taken, weak password).
    *   6a. The User Service returns a `4xx` error (e.g., `409 Conflict`, `400 Bad Request`) with a descriptive message.
    *   6b. The frontend displays the error message to the user without redirecting.
        **Postcondition:** A new user account is created in the system.

### UC2: Login

**Actor:** Unauthenticated User
**Precondition:** The user is on the login page.
**Flow of Events:**
1.  The user enters their `Username` and `Password` and clicks "Login".
2.  The frontend sends a `POST /api/v1/auth/login` request to the Auth Service with the credentials.
3.  The Auth Service receives the request:
    a. Finds the user by `username` in the database.
    b. Uses bcrypt to compare the provided password with the stored hash.
4.  If the credentials are valid, the service generates a JWT containing the user's ID.
5.  The JWT is set as an HTTP-only cookie in the response (or returned in the response body for the frontend to store).
6.  The frontend receives the token, stores it (if not a cookie), and redirects the user to the main library page.
    **Alternative Flow (A):** Invalid credentials.
    *   4a. The Auth Service returns a `401 Unauthorized` status.
    *   4b. The frontend displays a generic "Invalid login credentials" message.
        **Postcondition:** The user is authenticated, and a session is active.

### UC3: Upload Audio Track

**Actor:** Authenticated User
**Precondition:** The user is logged in and on the library or upload page.
**Flow of Events:**
1.  The user clicks an "Upload" button.
2.  The frontend renders a file selection dialog (e.g., using `react-dropzone`).
3.  The user selects one or more audio files (`*.mp3`, `*.flac`, etc.) and confirms.
4.  The frontend creates a `multipart/form-data` request for each file and sends it to `POST /api/v1/tracks/upload`. The request includes the user's JWT in the `Authorization` header.
5.  The Track Service receives the request:
    a. Validates the JWT.
    b. Validates the file type and size.
    c. Saves the file bytes to the configured storage (e.g., local disk, S3).
    d. Attempts to extract metadata (ID3 tags) from the file. Uses defaults (filename) if extraction fails.
    e. Creates a new record in the `tracks` table (`title`, `artist`, `duration`, `file_path`, `user_id`).
6.  The service returns a `201 Created` status with the created track data.
7.  The frontend receives the response and updates the UI to show the new track in the user's library.
    **Alternative Flow (A):** Invalid or corrupt file.
    *   5b/5d. The Track Service returns a `400 Bad Request` error.
    *   5e. The frontend displays an error message specific to the upload failure.
        **Postcondition:** A new track is added to the user's library and is available for playback and playlist addition.

### UC4: Add Track to Playlist

**Actor:** Authenticated User
**Precondition:** The user is viewing their library or a playlist. At least one track and one playlist exist.
**Flow of Events:**
1.  The user selects a track from their library. The UI provides an "Add to Playlist" button or menu option.
2.  The user clicks it, and the frontend displays a modal with a list of their existing playlists.
3.  The user selects the target playlist and confirms.
4.  The frontend sends a `POST /api/v1/playlists/{playlistId}/tracks` request to the Playlist Service. The request body contains `{ "trackId": "123" }`. The JWT is included in the header.
5.  The Playlist Service receives the request:
    a. Validates the JWT and that the user owns the specified playlist.
    b. Checks that the user owns the specified track.
    c. Inserts a new record into the `playlist_tracks` junction table, potentially calculating a new `order` value.
6.  The service returns a `200 OK` or `204 No Content` status.
7.  The frontend closes the modal and may update the UI to reflect the change (e.g., a notification, or instantly updating the playlist view if it's open).
    **Alternative Flow (A):** User does not own the track or playlist.
    *   5a/5b. The service returns a `403 Forbidden` or `404 Not Found` error.
    *   5c. The frontend displays an error message like "Track or playlist not found".
        **Postcondition:** The selected track is added to the end of the specified playlist.
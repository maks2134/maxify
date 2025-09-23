# Maxify - Domain Model Class Diagram

## Overview
This document describes the key entities and their relationships within the Maxify application domain, based on the Software Requirements Specification (SRS). This model serves as a conceptual foundation for the system's database schema and object-oriented design.

## Class Diagram Schema

![Diagrama](/docs/schema/uml_trpo.png)

## Class Diagram Description

The core domain of Maxify revolves around user management, audio content, and personal collections. The main entities are:

*   **`User`**: The central actor. All content is owned and scoped to a specific user.
*   **`Track`**: Represents an uploaded audio file and its metadata.
*   **`Playlist`**: A user-created collection of tracks.
*   **`AuthToken`**: Represents a valid session for an authenticated user.

The following diagram illustrates the relationships between these entities:


### Key Relationships Explained:

1.  **User - AuthToken (One-to-Many)**:
    *   A single `User` can have many active `AuthToken` sessions (e.g., logged in on multiple devices). Each `AuthToken` belongs to exactly one `User`.

2.  **User - Track (One-to-Many)**:
    *   A `User` owns and uploads many `Track` objects. Each `Track` is owned by a single `User`.

3.  **User - Playlist (One-to-Many)**:
    *   A `User` creates many `Playlist` objects. Each `Playlist` is owned by a single `User`.

4.  **Playlist - Track (Many-to-Many)**:
    *   This relationship is implemented through an associative entity (`PlaylistTrack`), often called a junction table.
    *   A `Playlist` can contain many `Track` items.
    *   A `Track` can be added to many different `Playlist` items.
    *   The `PlaylistTrack` entity can hold additional attributes like `order` (for custom playlist sorting).

### Attributes:
*   **`User`**: `id` (Primary Key), `username`, `email`, `password_hash`, `created_at`.
*   **`Track`**: `id` (PK), `title`, `artist`, `duration_seconds`, `file_path`, `user_id` (Foreign Key to User).
*   **`Playlist`**: `id` (PK), `name`, `user_id` (FK to User).
*   **`PlaylistTrack`**: `playlist_id` (Composite FK to Playlist), `track_id` (Composite FK to Track), `order`.
*   **`AuthToken`**: `id` (PK), `token`, `user_id` (FK to User), `expires_at`.

This model ensures data isolation between users and provides a flexible structure for managing music collections.
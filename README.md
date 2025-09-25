# Maxify

[![Go Version](https://img.shields.io/badge/Go-1.25%2B-blue)](https://golang.org/)
[![Gin Framework](https://img.shields.io/badge/Framework-Gin-green)](https://gin-gonic.com/)

**Maxify** is a learning project, a minimum viable product (MVP) Spotify-like application, built with Go. It allows users to manage their personal music library: upload tracks, create playlists, and stream music through a web interface.

## 🚀 Features (MVP)

-   **🔐 Authentication & Authorization:** User registration and login using JWT tokens.
-   **🎵 Track Management:** Upload audio files and store their metadata (title, artist, duration).
-   **📋 Playlist Management:** Create, view, and delete playlists. Add and remove tracks from playlists.
-   ▶️ **Music Playback:** Stream audio files through a web-based player.
-   🔍 **Basic Search:** Search through your personal library of tracks and playlists.

## 🛠️ Tech Stack

-   **Backend:** [Go](https://golang.org/)
-   **Web Framework:** [Gin](https://gin-gonic.com/)
-   **Database:** [PostgreSql](https://www.postgresql.org/])
-   **Authentication:** [JWT](https://jwt.io/) (using `golang-jwt/jwt`)
-   **Password Hashing:** `golang.org/x/crypto/bcrypt`
-   **Frontend:** Server-side rendering with NextJS, tailwind.
-   **File Storage:** Local filesystem (`uploads` directory)

## 📄 Documentation

-   **Software Requirements Specification:** [SRS](./docs/SRS.md)
-   **Domain Model:** [DM](./docs/DOMAIN_MODEL.md)
-   **Glossary:** [GL](./docs/GLOSSARY.md)
-   **Use Cases:** [UC](./docs/USE_CASES.md)
-   **Sequence diagrams:** [SD](./docs/SEQUENCE_DIAGRAMS.md)
-   **State diagrams:** [SD](./docs/STATE_DIAGRAMS.md)
-   **Activity diagrams:** [AD](./docs/ACTIVITY_DIAGRAMS.md)
-   **Component diagrams:** [CD](./docs/COMPONENT_DIAGRAMS.md)
-   **Deployment diagrams:** [DD](./docs/DEPLOYMENT_DIAGRAMS.md)


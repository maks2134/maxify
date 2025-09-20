# Maxify - Glossary of Key Terms

**Account (User Account)**
A unique identity within the Maxify system, created during registration. It is associated with a user's personal library, playlists, and authentication credentials.

**Authentication**
The process of verifying a user's identity, typically by validating a username and password combination. Successful authentication results in the issuance of a session token (JWT).

**Authorization**
The process of determining and enforcing what actions an authenticated user is permitted to perform (e.g., accessing their own tracks, modifying their own playlists).

**JWT (JSON Web Token)**
A compact, URL-safe means of representing claims to be transferred between two parties. In Maxify, it is used as a session token to prove a user's authenticated state without repeatedly sending credentials.

**Metadata (Track Metadata)**
Descriptive data about an audio file. For Maxify, this includes properties such as `title`, `artist`, and `duration`, which may be extracted from the file's ID3 tags during upload.

**Microservice**
A small, independent, and loosely coupled service that implements a specific business capability (e.g., User Service, Track Service). Maxify's backend is composed of multiple Go-based microservices.

**Playlist**
A user-defined ordered collection of audio tracks.

**Streaming (Audio Streaming)**
The method of delivering audio content continuously from the server to the client player, allowing playback to begin before the entire file has been transmitted. Requires support for HTTP `Range` requests.

**Track**
An audio file (e.g., MP3, FLAC) uploaded by a user to their personal library. The term refers to the digital file itself and its associated metadata stored in the database.

**Upload**
The process of transferring an audio file from the user's local device to the Maxify server's storage, followed by metadata extraction and database registration.
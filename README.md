# 🎵 Maxify - Personal Music Streaming Service

[![Go Version](https://img.shields.io/badge/Go-1.21%2B-blue)](https://golang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com/)

**Maxify** is a full-stack personal music streaming service built with modern technologies. It allows users to upload, organize, and stream their personal music collection through a beautiful web interface.

## 🚀 Features

### 🎵 **Music Management**
- Upload audio files (MP3, WAV, FLAC, AAC, OGG, M4A)
- Automatic metadata extraction
- Personal music library organization
- Advanced search functionality

### 📋 **Playlist System**
- Create and manage custom playlists
- Add/remove tracks from playlists
- Playlist sharing and organization
- Drag & drop playlist management

### ▶️ **Audio Player**
- Web-based audio player with full controls
- Play/pause, skip, seek functionality
- Volume control
- Queue management
- Real-time progress tracking

### 🔐 **Authentication & Security**
- JWT-based authentication
- Secure user registration and login
- Protected routes and API endpoints
- Password hashing with bcrypt

### 🎨 **Modern UI/UX**
- Responsive design with Tailwind CSS
- Beautiful components with shadcn/ui
- Dark/light theme support
- Mobile-friendly interface
- Real-time notifications

## 🛠️ Tech Stack

### Backend (Go)
- **Framework:** [Gin](https://gin-gonic.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Cache:** [Redis](https://redis.io/)
- **ORM:** [GORM](https://gorm.io/)
- **Authentication:** JWT with [golang-jwt](https://github.com/golang-jwt/jwt)
- **File Storage:** Local filesystem

### Frontend (Next.js)
- **Framework:** [Next.js 14](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 📁 Project Structure

```
maxify/
├── server/                 # Go backend
│   ├── cmd/server/        # Application entry point
│   ├── internal/          # Internal packages
│   │   ├── config/        # Configuration management
│   │   ├── database/      # Database connections
│   │   ├── models/        # Data models
│   │   ├── services/      # Business logic
│   │   ├── controllers/   # HTTP handlers
│   │   ├── middleware/    # HTTP middleware
│   │   └── routes/        # Route definitions
│   ├── docker-compose.yml # Docker services
│   ├── go.mod            # Go dependencies
│   └── Makefile          # Build commands
├── client/                # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   └── lib/          # Utilities and API client
│   ├── package.json      # Node.js dependencies
│   └── tailwind.config.js # Tailwind configuration
└── docs/                 # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Go 1.21+
- Node.js 18+
- Docker and Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd maxify
```

### 2. Start Backend Services

```bash
cd server

# Copy environment file
cp env.example .env

# Start PostgreSQL and Redis
docker-compose up -d

# Install Go dependencies
go mod tidy

# Run the server
go run cmd/server/main.go
```

The backend will be available at `http://localhost:8080`

### 3. Start Frontend

```bash
cd client

# Copy environment file
cp env.local.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Access the Application

1. Open `http://localhost:3000` in your browser
2. Register a new account or login
3. Upload your first audio file
4. Create playlists and start streaming!

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### User Endpoints

- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/stats` - Get user statistics

### Track Endpoints

- `POST /api/v1/tracks/upload` - Upload audio file
- `GET /api/v1/tracks` - Get user's tracks
- `GET /api/v1/tracks/:id` - Get specific track
- `DELETE /api/v1/tracks/:id` - Delete track
- `GET /api/v1/tracks/:id/stream` - Stream audio file

### Playlist Endpoints

- `POST /api/v1/playlists` - Create playlist
- `GET /api/v1/playlists` - Get user's playlists
- `GET /api/v1/playlists/:id` - Get specific playlist
- `PUT /api/v1/playlists/:id` - Update playlist
- `DELETE /api/v1/playlists/:id` - Delete playlist
- `POST /api/v1/playlists/:id/tracks` - Add track to playlist
- `DELETE /api/v1/playlists/:id/tracks/:trackId` - Remove track from playlist

### Search Endpoints

- `GET /api/v1/search?q=query` - General search
- `GET /api/v1/search/tracks?q=query` - Search tracks
- `GET /api/v1/search/playlists?q=query` - Search playlists
- `GET /api/v1/search/suggestions?q=query` - Get search suggestions

## 🐳 Docker Deployment

### Backend Services

```bash
cd server
docker-compose up -d
```

### Production Build

```bash
# Build backend
cd server
go build -o bin/maxify cmd/server/main.go

# Build frontend
cd client
npm run build
```

## 🧪 Testing

### Backend Tests

```bash
cd server
go test ./...
```

### Frontend Tests

```bash
cd client
npm test
```

## 📝 Development

### Backend Development

```bash
cd server
go run cmd/server/main.go
```

### Frontend Development

```bash
cd client
npm run dev
```

### Code Formatting

```bash
# Backend
cd server
go fmt ./...

# Frontend
cd client
npm run lint
npm run format
```

## 🔧 Configuration

### Backend Configuration

Edit `server/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=maxify_user
DB_PASSWORD=maxify_password
DB_NAME=maxify

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

PORT=8080
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50MB
```

### Frontend Configuration

Edit `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## 📄 Documentation

- **Software Requirements Specification:** [SRS](./docs/SRS.md)
- **Domain Model:** [DM](./docs/DOMAIN_MODEL.md)
- **Use Cases:** [UC](./docs/USE_CASES.md)
- **Architecture Diagrams:** [Component](./docs/COMPONENT_DIAGRAMS.md), [Deployment](./docs/DEPLOYMENT_DIAGRAMS.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes only.

## 🙏 Acknowledgments

- [Gin](https://gin-gonic.com/) - HTTP web framework
- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Beautiful icons

## 🔮 Future Enhancements

- [ ] Cloud storage integration (AWS S3, Google Cloud)
- [ ] Real-time collaboration features
- [ ] Advanced audio analysis and recommendations
- [ ] Mobile app (React Native)
- [ ] Social features (sharing, following)
- [ ] Podcast support
- [ ] Offline mode with PWA
- [ ] Advanced search with full-text search
- [ ] Audio transcoding and format conversion
- [ ] Analytics and usage statistics
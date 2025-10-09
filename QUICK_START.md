# 🚀 Быстрый старт Maxify

## Предварительные требования

- Go 1.21+
- Node.js 18+
- Docker и Docker Compose
- Git

## Шаги для запуска

### 1. Клонирование и настройка

```bash
# Клонируйте репозиторий
git clone <your-repo-url>
cd maxify
```

### 2. Запуск серверной части

```bash
cd server

# Скопируйте файл конфигурации
cp env.example .env

# Запустите PostgreSQL и Redis через Docker
docker-compose up -d

# Установите Go зависимости
go mod tidy

# Запустите сервер
go run cmd/server/main.go
```

Сервер будет доступен на `http://localhost:8080`

### 3. Запуск клиентской части

```bash
# В новом терминале
cd client

# Скопируйте файл конфигурации
cp env.local.example .env.local

# Установите зависимости
npm install

# Запустите клиент
npm run dev
```

Клиент будет доступен на `http://localhost:3000`

## Проверка работы

### 1. Проверка здоровья сервиса

```bash
curl http://localhost:8080/health
```

Ожидаемый ответ:
```json
{"status":"ok"}
```

### 2. Регистрация пользователя

Откройте `http://localhost:3000` в браузере и:

1. Нажмите "Sign up"
2. Заполните форму регистрации
3. Нажмите "Create account"

### 3. Загрузка трека

1. Нажмите "Upload" в навигации
2. Перетащите аудио файл или нажмите для выбора
3. Нажмите "Upload All"

### 4. Создание плейлиста

1. Перейдите в "Playlists"
2. Нажмите "Create Playlist"
3. Введите название и описание
4. Нажмите "Create"

### 5. Воспроизведение музыки

1. На главной странице нажмите кнопку воспроизведения на любом треке
2. Используйте плеер внизу экрана для управления

## Структура проекта

```
maxify/
├── server/          # Go backend
│   ├── cmd/        # Точка входа
│   ├── internal/   # Внутренние пакеты
│   ├── docker-compose.yml
│   └── .env
├── client/         # Next.js frontend
│   ├── src/       # Исходный код
│   ├── package.json
│   └── .env.local
└── docs/          # Документация
```

## API Endpoints

### Аутентификация
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `POST /api/v1/auth/logout` - Выход

### Пользователи
- `GET /api/v1/users/profile` - Профиль пользователя
- `PUT /api/v1/users/profile` - Обновление профиля
- `GET /api/v1/users/stats` - Статистика пользователя

### Треки
- `POST /api/v1/tracks/upload` - Загрузка трека
- `GET /api/v1/tracks` - Список треков
- `GET /api/v1/tracks/:id` - Получение трека
- `DELETE /api/v1/tracks/:id` - Удаление трека
- `GET /api/v1/tracks/:id/stream` - Стриминг трека

### Плейлисты
- `POST /api/v1/playlists` - Создание плейлиста
- `GET /api/v1/playlists` - Список плейлистов
- `GET /api/v1/playlists/:id` - Получение плейлиста
- `PUT /api/v1/playlists/:id` - Обновление плейлиста
- `DELETE /api/v1/playlists/:id` - Удаление плейлиста
- `POST /api/v1/playlists/:id/tracks` - Добавление трека в плейлист
- `DELETE /api/v1/playlists/:id/tracks/:trackId` - Удаление трека из плейлиста

### Поиск
- `GET /api/v1/search?q=query` - Общий поиск
- `GET /api/v1/search/tracks?q=query` - Поиск треков
- `GET /api/v1/search/playlists?q=query` - Поиск плейлистов
- `GET /api/v1/search/suggestions?q=query` - Предложения поиска

## Остановка сервисов

```bash
# Остановить клиент (Ctrl+C)
# Остановить сервер (Ctrl+C)
# Остановить базы данных
cd server
docker-compose down
```

## Логи и отладка

```bash
# Просмотр логов Docker сервисов
cd server
docker-compose logs postgres
docker-compose logs redis

# Просмотр логов сервера
# Логи выводятся в консоль при запуске

# Просмотр логов клиента
cd client
npm run dev
# Логи выводятся в консоль браузера
```

## Возможные проблемы

### 1. Порт уже занят
Если порт 8080 занят, измените его в `server/.env`:
```
PORT=8081
```

Если порт 3000 занят, измените его в `client/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
```

### 2. Базы данных не запускаются
```bash
cd server
docker-compose down -v
docker-compose up -d
```

### 3. Ошибки подключения к базе данных
Убедитесь, что PostgreSQL запущен:
```bash
cd server
docker-compose ps
```

### 4. Проблемы с правами доступа к файлам
```bash
cd server
mkdir -p uploads
chmod 755 uploads
```

### 5. Ошибки сборки клиента
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

## Следующие шаги

1. Изучите полную документацию в `README.md`
2. Настройте переменные окружения
3. Изучите архитектуру в папке `docs/`
4. Начните разработку новых функций

## Поддерживаемые форматы аудио

- MP3
- WAV
- FLAC
- AAC
- OGG
- M4A

Максимальный размер файла: 50MB

## Особенности

- ✅ JWT аутентификация
- ✅ Загрузка и стриминг аудио
- ✅ Управление плейлистами
- ✅ Поиск по библиотеке
- ✅ Адаптивный дизайн
- ✅ Современный UI с shadcn/ui
- ✅ TypeScript для типобезопасности
- ✅ Микросервисная архитектура

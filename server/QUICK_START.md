# 🚀 Быстрый старт Maxify

## Предварительные требования

- Go 1.21+
- Docker и Docker Compose
- Git

## Шаги для запуска

### 1. Клонирование и настройка

```bash
# Клонируйте репозиторий (если еще не сделали)
git clone <your-repo-url>
cd maxify

# Скопируйте файл конфигурации
cp env.example .env
```

### 2. Запуск баз данных

```bash
# Запустите PostgreSQL и Redis через Docker
docker-compose up -d

# Проверьте, что сервисы запустились
docker-compose ps
```

### 3. Установка зависимостей

```bash
# Установите Go зависимости
go mod tidy
```

### 4. Запуск приложения

```bash
# Запустите сервер
go run cmd/server/main.go
```

Или используйте Makefile:

```bash
# Запуск всего (базы данных + приложение)
make start

# Или по отдельности
make docker-up  # Запуск баз данных
make run        # Запуск приложения
```

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

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Вход в систему

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Сохраните полученный токен для следующих запросов.

### 4. Загрузка трека

```bash
curl -X POST http://localhost:8080/api/v1/tracks/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/audio/file.mp3"
```

### 5. Получение списка треков

```bash
curl -X GET http://localhost:8080/api/v1/tracks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Структура API

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
# Остановить приложение (Ctrl+C)
# Остановить базы данных
make stop
# или
docker-compose down
```

## Логи и отладка

```bash
# Просмотр логов Docker сервисов
docker-compose logs postgres
docker-compose logs redis

# Просмотр логов приложения
# Логи выводятся в консоль при запуске
```

## Возможные проблемы

### 1. Порт уже занят
Если порт 8080 занят, измените его в `.env` файле:
```
PORT=8081
```

### 2. Базы данных не запускаются
```bash
# Очистите Docker volumes
docker-compose down -v
docker-compose up -d
```

### 3. Ошибки подключения к базе данных
Убедитесь, что PostgreSQL запущен:
```bash
docker-compose ps
```

### 4. Проблемы с правами доступа к файлам
```bash
# Создайте директорию uploads с правильными правами
mkdir -p uploads
chmod 755 uploads
```

## Следующие шаги

1. Изучите полную документацию в `README.md`
2. Настройте переменные окружения в `.env`
3. Изучите архитектуру в папке `docs/`
4. Начните разработку фронтенда на Next.js

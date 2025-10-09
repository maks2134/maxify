# 🔍 Руководство по отладке проблем с API

## Проблема
Не создаются плейлисты и не загружаются треки в клиентском приложении.

## Шаги для отладки

### 1. Проверка сервера

```bash
# Убедитесь, что сервер запущен
cd server
go run cmd/server/main.go

# Проверьте здоровье сервера
curl http://localhost:8080/health
# Ожидаемый ответ: {"status":"ok"}
```

### 2. Проверка базы данных

```bash
# Убедитесь, что PostgreSQL и Redis запущены
cd server
docker-compose ps

# Если не запущены, запустите их
docker-compose up -d
```

### 3. Тестирование API напрямую

```bash
# Регистрация пользователя
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Сохраните полученный токен и используйте его в следующих запросах

# Получение треков
curl -X GET "http://localhost:8080/api/v1/tracks/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Создание плейлиста
curl -X POST "http://localhost:8080/api/v1/playlists" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Playlist","description":"My test playlist"}'
```

### 4. Проверка клиента

```bash
# Убедитесь, что клиент запущен
cd client
npm run dev

# Откройте http://localhost:3000/test для тестирования API
```

### 5. Проверка консоли браузера

1. Откройте Developer Tools (F12)
2. Перейдите на вкладку Console
3. Попробуйте создать плейлист или загрузить треки
4. Проверьте логи API запросов

### 6. Проверка Network вкладки

1. Откройте Developer Tools (F12)
2. Перейдите на вкладку Network
3. Попробуйте создать плейлист
4. Проверьте, отправляются ли запросы и какие ответы приходят

## Возможные проблемы и решения

### Проблема 1: CORS ошибки
**Симптомы:** Ошибки в консоли типа "CORS policy" или "Access-Control-Allow-Origin"
**Решение:** Проверьте настройки CORS в server/internal/routes/routes.go

### Проблема 2: 401 Unauthorized
**Симптомы:** Запросы возвращают 401 ошибку
**Решение:** 
- Проверьте, что токен сохраняется в localStorage
- Убедитесь, что токен передается в заголовке Authorization
- Проверьте, что токен не истек

### Проблема 3: 500 Internal Server Error
**Симптомы:** Запросы возвращают 500 ошибку
**Решение:**
- Проверьте логи сервера
- Убедитесь, что база данных подключена
- Проверьте, что все зависимости установлены

### Проблема 4: Запросы не отправляются
**Симптомы:** В Network вкладке нет запросов
**Решение:**
- Проверьте, что API URL настроен правильно в .env.local
- Убедитесь, что клиент может подключиться к серверу
- Проверьте, что нет ошибок JavaScript в консоли

## Логирование для отладки

В клиенте добавлено логирование в:
- `src/lib/api.ts` - логи всех API запросов и ответов
- `src/app/page.tsx` - логи загрузки треков
- `src/app/playlists/page.tsx` - логи создания плейлистов

## Тестовая страница

Создана тестовая страница по адресу `/test` для проверки API:
- Тестирует получение треков
- Тестирует получение плейлистов  
- Тестирует создание плейлиста
- Показывает подробные результаты

## Проверка переменных окружения

```bash
# В клиенте
cd client
cat .env.local
# Должно быть: NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# В сервере
cd server
cat .env
# Проверьте настройки базы данных
```

## Перезапуск сервисов

Если проблемы продолжаются:

```bash
# Остановите все сервисы
cd server
docker-compose down
pkill -f "go run"

# Запустите заново
docker-compose up -d
go run cmd/server/main.go

# В другом терминале
cd client
npm run dev
```

# 🚨 Устранение неполадок

## Проблема: Не создаются плейлисты и не загружаются треки

### Быстрая проверка

1. **Убедитесь, что сервер запущен:**
   ```bash
   cd server
   go run cmd/server/main.go
   ```

2. **Убедитесь, что базы данных запущены:**
   ```bash
   cd server
   docker-compose up -d
   ```

3. **Убедитесь, что клиент запущен:**
   ```bash
   cd client
   npm run dev
   ```

### Пошаговая диагностика

#### Шаг 1: Проверьте консоль браузера
1. Откройте http://localhost:3000
2. Нажмите F12 для открытия Developer Tools
3. Перейдите на вкладку Console
4. Попробуйте создать плейлист
5. Проверьте, есть ли ошибки в консоли

#### Шаг 2: Проверьте Network вкладку
1. В Developer Tools перейдите на вкладку Network
2. Попробуйте создать плейлист
3. Проверьте, отправляются ли запросы к серверу
4. Посмотрите на статус ответов (200, 401, 500, etc.)

#### Шаг 3: Используйте тестовую страницу
1. Откройте http://localhost:3000/test
2. Нажмите "Test API"
3. Посмотрите на результаты тестирования

### Частые проблемы и решения

#### ❌ Ошибка: "Failed to load tracks"
**Причина:** Проблема с подключением к API
**Решение:**
1. Проверьте, что сервер запущен на порту 8080
2. Проверьте файл `.env.local` в папке client
3. Убедитесь, что нет CORS ошибок

#### ❌ Ошибка: "401 Unauthorized"
**Причина:** Проблема с аутентификацией
**Решение:**
1. Выйдите из системы и войдите заново
2. Проверьте, что токен сохраняется в localStorage
3. Очистите localStorage и попробуйте снова

#### ❌ Ошибка: "Failed to create playlist"
**Причина:** Проблема с API или базой данных
**Решение:**
1. Проверьте логи сервера
2. Убедитесь, что PostgreSQL запущен
3. Попробуйте перезапустить сервер

### Команды для перезапуска

```bash
# Остановить все
cd server
docker-compose down
pkill -f "go run"

# Запустить заново
docker-compose up -d
go run cmd/server/main.go

# В новом терминале
cd client
npm run dev
```

### Проверка логов

#### Серверные логи
Логи сервера отображаются в терминале, где запущен `go run cmd/server/main.go`

#### Клиентские логи
1. Откройте Developer Tools (F12)
2. Перейдите на вкладку Console
3. Все API запросы и ошибки логируются в консоль

### Тестирование API напрямую

```bash
# Регистрация
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'

# Получение треков (замените TOKEN на полученный токен)
curl -X GET "http://localhost:8080/api/v1/tracks/" \
  -H "Authorization: Bearer TOKEN"

# Создание плейлиста
curl -X POST "http://localhost:8080/api/v1/playlists" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test playlist"}'
```

### Если ничего не помогает

1. Убедитесь, что все зависимости установлены:
   ```bash
   cd server && go mod tidy
   cd client && npm install
   ```

2. Проверьте версии:
   - Go 1.21+
   - Node.js 18+
   - Docker и Docker Compose

3. Попробуйте очистить кеш:
   ```bash
   cd client
   rm -rf .next
   npm run build
   ```

4. Перезапустите Docker:
   ```bash
   cd server
   docker-compose down -v
   docker-compose up -d
   ```

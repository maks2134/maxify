.PHONY: build run test clean docker-up docker-down

# Build the application
build:
	go build -o bin/maxify cmd/server/main.go

# Run the application
run:
	go run cmd/server/main.go

# Run tests
test:
	go test -v ./...

# Clean build artifacts
clean:
	rm -rf bin/
	rm -rf uploads/

# Start Docker services
docker-up:
	docker-compose up -d

# Stop Docker services
docker-down:
	docker-compose down

# Start everything (Docker + app)
start: docker-up
	sleep 5
	$(MAKE) run

# Stop everything
stop: docker-down

# Install dependencies
deps:
	go mod tidy
	go mod download

# Format code
fmt:
	go fmt ./...

# Lint code
lint:
	golangci-lint run

# Generate documentation
docs:
	godoc -http=:6060

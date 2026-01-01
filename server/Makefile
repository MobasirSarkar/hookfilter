include .env
export

.PHONY: \
	run-dev \
	run-prod \
	migrate-up \
	migrate-down \
	generate-tables \
	docker-up \
	docker-down \
	docker-volumes-down

run-dev:
	air -c air.toml

run-prod:
	go run ./cmd/*.go

migrate-up:
	migrate -path ./sql/migrations -database "$(DB_DSN)" up

migrate-down:
	migrate -path ./sql/migrations -database "$(DB_DSN)" down

generate-tables:
	sqlc generate

docker-up:
	docker-compose -f ./docker/docker-compose.yml up -d

docker-down:
	docker-compose -f ./docker/docker-compose.yml down

docker-volumes-down:
	docker-compose -f ./docker/docker-compose.yml down -v

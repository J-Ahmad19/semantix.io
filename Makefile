.PHONY: up down backend frontend

up:
	docker-compose up -d

down:
	docker-compose down

backend:
	cd backend && uvicorn src.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

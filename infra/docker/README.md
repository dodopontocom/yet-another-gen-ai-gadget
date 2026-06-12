# Bolão da Família - Docker Infrastructure

## Ambientes Disponíveis

### 1. Desenvolvimento (Dev)
Usa MongoDB local em container, hot-reloading para frontend e backend.

**Como rodar:**
```bash
docker compose -f infra/docker/docker-compose.dev.yml up --build
```

**Acessos:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- MongoDB: mongodb://localhost:27017/bolao_db

### 2. Produção (Prod)
Otimizado para deploy, usa MongoDB Atlas, Nginx servindo frontend.

**Como rodar:**
Primeiro crie um arquivo `.env` na pasta `infra/docker/` usando o `.env.example` como base:
```bash
cp infra/docker/.env.example infra/docker/.env
```

Edite o arquivo `.env` com suas credenciais do MongoDB Atlas e PIN.

Depois execute:
```bash
docker compose -f infra/docker/docker-compose.prod.yml up -d --build
```

**Acessos:**
- Frontend: http://localhost
- Backend: http://localhost:3001

**Parar containers:**
```bash
docker compose -f infra/docker/docker-compose.prod.yml down
```

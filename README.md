# Gestão Biotério

Sistema de gestão para biotério com cadastro de animais, alimentação, biometria e rotinas.

## Stack

- **Backend:** ASP.NET Core + EF Core (SQL Server) + CQRS (MediatR) + Clean Architecture
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Auth:** Keycloak (UCDB)

## Iniciar Dev

### 1. Backend

```bash
cd Backend
dotnet run --project Gestao-Bioterio.Api
```

URL: `http://localhost:5279` | Swagger: `http://localhost:5279/swagger`

> A connection string está em `Gestao-Bioterio.Api/appsettings.json`. Migration é aplicada automaticamente no startup.

### 2. Frontend

```bash
cd Frontend
npm run dev
```

URL: `http://localhost:5173`

### 3. Popular dados de teste

```bash
cd Frontend
npm run dev:initdata
```

> Requer backend rodando com dados de autenticação configurados.

### Rodar testes

```bash
cd Backend
dotnet test
```

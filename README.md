# PLATAFORMA WEB DE APRENDIZADO

## O que foi usado? 

**Backend:** Node.js + NestJS

**Frontend:** React + Vite + Chakra UI

**Bando de dados:** PostgreSQL

## Pré-requisitos

- Node.js v20+
- npm v9+ ou Yarn 1.22+
- Docker e Docker Compose
- Ambiente de desenvolvimento (VS Code recomendado)

## Como rodar?
**Na pasta raiz do projeto**
- Copie e cole o arquivo .env.example e renomeie para .env. (Comando abaixo)
```bash
cp .env.example .env
```
- Builde e inicie o banco de dados.
```bash
docker-compose build
docker-compose up -d
```
**Nas pastas frontend e backend**

- Copie e cole o arquivo .env.example e renomeie para .env. (Comando abaixo)
```bash
cp .env.example .env
```
- Instale as dependências
```bash
yarn install
```

**Na pasta backend**

- Inicie o servidor. 
```bash
yarn start:dev
```

**Na pasta frontedn**

- Inicie o react.
```bash
yarn dev
```

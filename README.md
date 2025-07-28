# API FastFeet

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

## 📖 Sobre o Projeto

Esta é a API para a **FastFeet**, uma aplicação de logística fictícia. O projeto foi desenvolvido como parte do **Desafio 04 do treinamento Ignite da Rocketseat**, com foco em praticar conceitos de desenvolvimento back-end em um ambiente Node.js.

A API é responsável por gerenciar entregadores, destinatários e encomendas, além de implementar um sistema completo de autenticação, autorização e testes automatizados para garantir a qualidade e a robustez do código.

## ✨ Funcionalidades Implementadas

O projeto implementa 100% dos requisitos funcionais do desafio:

* **📦 CRUD Completo:** Gerenciamento total de Entregadores, Destinatários e Encomendas.
* **🔐 Autenticação e Autorização:** Sistema de login com CPF/Senha via JWT e controle de acesso baseado em papéis (Admin).
* **🛵 Funcionalidades do Entregador:** Rotas específicas para um entregador listar suas próprias encomendas e encontrar entregas próximas.
* **🔔 Notificações por Eventos:** Arquitetura desacoplada com eventos de domínio para notificar sobre alterações no status das encomendas.
* **🛡️ Segurança:** Hash de senhas com `bcrypt` e validação de dados de entrada com `class-validator`.
* **🧪 Testes Automatizados:** Cobertura de testes unitários e End-to-End (E2E) para as principais funcionalidades.

## 🛠️ Tecnologias Utilizadas

* **Node.js**
* **NestJS**
* **TypeScript**
* **Prisma**
* **PostgreSQL**
* **Docker & Docker Compose**
* **Passport.js (JWT & Local Strategy)**
* **Jest:** Para testes unitários e E2E.
* **Supertest:** Para requisições HTTP nos testes E2E.

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para executar a aplicação em seu ambiente local.

### Pré-requisitos

* [Node.js](https://nodejs.org/en/) (v20 ou superior)
* [Docker](https://www.docker.com/get-started/) e [Docker Compose](https://docs.docker.com/compose/install/)
* [Git](https://git-scm.com/)

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/fastfeet-api.git](https://github.com/seu-usuario/fastfeet-api.git)
    ```

2.  **Acesse a pasta do projeto:**
    ```bash
    cd fastfeet-api
    ```

3.  **Crie os arquivos de variáveis de ambiente:**
    Copie o arquivo de exemplo `.env.example` (se não existir, crie os arquivos manualmente) para `.env` e `.env.test`.
    ```bash
    cp .env.example .env
    cp .env.example .env.test
    ```
    * No arquivo `.env`, o conteúdo deve ser:
        ```env
        DATABASE_URL="postgresql://docker:docker@localhost:5433/fastfeet?schema=public"
        ```
    * No arquivo `.env.test`, o nome do banco de dados deve ser diferente:
        ```env
        DATABASE_URL="postgresql://docker:docker@localhost:5433/fastfeet_test?schema=public"
        ```

4.  **Instale as dependências:**
    ```bash
    npm install
    ```

5.  **Inicie os containers Docker (API + Banco de Dados):**
    ```bash
    docker-compose up --build
    ```

6.  **Rode as migrações do banco de dados:**
    Com os containers rodando, abra um **novo terminal** e execute as migrações para os dois bancos de dados:
    ```bash
    # Migração para o banco de desenvolvimento
    npx prisma migrate dev

    # Migração para o banco de teste
    npm run test:migrate
    ```

Pronto! A API estará rodando em `http://localhost:3000`.

## 🧪 Como Rodar os Testes

O projeto possui uma suíte completa de testes unitários e E2E.

* **Para rodar os testes unitários:**
    ```bash
    npm run test
    ```
* **Para rodar os testes End-to-End:**
    ```bash
    npm run test:e2e
    ```

## 📚 Rotas da API

A seguir estão as rotas disponíveis na API. Rotas protegidas exigem um `access_token` JWT no cabeçalho `Authorization: Bearer <token>`.

### Autenticação

* `POST /auth/login`
    * **Descrição:** Autentica um usuário e retorna um token de acesso.

### Usuários / Entregadores (`/users`)

* `POST /users` **[ADMIN]**: Cria um novo usuário.
* `GET /users` **[ADMIN]**: Lista todos os usuários.
* `GET /users/:id` **[ADMIN]**: Busca um usuário por ID.
* `PATCH /users/:id` **[ADMIN]**: Atualiza um usuário.
* `DELETE /users/:id` **[ADMIN]**: Deleta um usuário.

### Destinatários (`/recipients`)

* `POST /recipients` **[ADMIN]**: Cria um novo destinatário.
* `GET /recipients` **[ADMIN]**: Lista todos os destinatários.
* `GET /recipients/:id` **[ADMIN]**: Busca um destinatário por ID.
* `PATCH /recipients/:id` **[ADMIN]**: Atualiza um destinatário.
* `DELETE /recipients/:id` **[ADMIN]**: Deleta um destinatário.

### Encomendas (`/orders`)

* `POST /orders` **[ADMIN]**: Cria uma nova encomenda.
* `GET /orders` **[ADMIN]**: Lista todas as encomendas.
* `GET /orders/my-deliveries` **[ENTREGADOR]**: Lista as encomendas do entregador logado.
* `GET /orders/nearby` **[PROTEGIDO]**: Lista encomendas próximas com base na cidade e bairro.
* `GET /orders/:id` **[PROTEGIDO]**: Busca uma encomenda por ID.
* `PATCH /orders/:id` **[ADMIN]**: Atualiza uma encomenda.
* `DELETE /orders/:id` **[ADMIN]**: Deleta uma encomenda.

## 📄 Licença

Este projeto está sob a licença MIT.
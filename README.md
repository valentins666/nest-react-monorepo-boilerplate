# Nest-React Monorepo Boilerplate

This repository is a monorepo boilerplate using Nx, NestJS, Knex, and React. It includes a backend application built with NestJS and Knex, and a frontend application built with React.

## Project Structure

```
│── apps/
│   ├── backend/       # NestJS API
|   |       |── src/           # Source files
|   |       |── .env.example   # Backend environment variables definition
│   ├── frontend/      # React App
|   |       |── src/           # Source files
|   |       |── .env.example   # Frontend environment variables definition
│── Shared/            # Shared Libraries, i.e global interfaces.
│── Scripts/           # Custom script files, i.e deployment scripts.
│── nx.json            # Nx configuration
│── package.json       # Dependencies & scripts
│── tsconfig.json      # TypeScript configuration

```

## Getting Started

### Prerequisites

- Node.js (v20.x)
- Docker
- AWS CLI (configured with appropriate credentials)

### Installation

```sh
npm install
```

### Testing

To run tests:

```sh
npm test
```

### Linting

To lint the code:

```sh
npm run lint
```

### Formatting

To format the code:

```sh
npm run format
```

### Prepare Husky

To make husky ready to check:

```sh
npm run prepare
```

## Setting Up Environment Variables

#### Local Development Environment Variables
1. Create a `.env` file in the `apps/backend` directory by copying the `.env.example` file:

```sh
cp apps/backend/.env.example apps/backend/.env
```

2. Create a `.env` file in the `apps/frontend` directory by copying the `.env.example` file:

```sh
cp apps/frontend/.env.example apps/frontend/.env
```

3. Update the `.env` files with your specific configuration.

#### Deployment Environment Variables
There might be `dev`, `staging`, `prod` production deployment. Each deployment should has own env files. `.env.dev`, `.env.staging`, `.env.prod`

1. Create a `.env.<environment>` file in the `apps/backend` directory by copying the `.env.example` file:

```sh
cp apps/backend/.env.example apps/backend/.env.<environment>
```

2. Create a `.env.<environment>` file in the `apps/frontend` directory by copying the `.env.example` file:

```sh
cp apps/frontend/.env.example apps/frontend/.env.<environment>
```

3. Update the `.env.<environment>` files with your specific configuration.

## Database Migrations

#### Setup Database Server
PostgresSQL DB is used for now, but other database servers can be integrated in future.
```sh
npm run deploy:database            # Local
npm run deploy:database:dev        # Dev Server
npm run deploy:database:staging    # Staging Server
npm run deploy:database:prod       # Production Server
```
#### Make && Migrate && Rollback Migrations
To create a new migration:

```sh
npm run makemigrations
```

To run migrations:

```sh
npm run migrate            # Migrate to Local DB
npm run migrate:dev        # Migrate to Dev Server
npm run migrate:staging    # Migrate to Staging Server
npm run migrate:prod       # Migrate to Production Server
```

To rollback migrations:

```sh
npm run rollback            # Rollback to Local DB
npm run rollback:dev        # Rollback to Dev Server
npm run rollback:staging    # Rollback to Staging Server
npm run rollback:prod       # Rollback to Production Server
```

## Running the Applications in Local

#### Backend

To start the backend application:

```sh
npm run start:backend
```

#### Frontend

To start the frontend application:

```sh
npm run start:frontend
```

#### Both Backend and Frontend

To start both backend and frontend applications simultaneously:

```sh
npm start
```

## Building the Applications in Local

#### Backend

To build the backend application:

```sh
npm run build:backend
```

#### Frontend

To build the frontend application:

```sh
npm run build:frontend
```

## Deploying the Applications

#### Deploying the Backend

To deploy the backend application to local and AWS ECS:

```sh
npm run deploy:backend          # To Local
npm run deploy:backend:dev      # To Dev Server
npm run deploy:backend:staging  # To Staging Server
npm run deploy:backend:prod     # To Production server
```

#### Deploying the Frontend

To deploy the frontend application to local, AWS S3 and CloudFront:

```sh
npm run deploy:frontend          # To Local
npm run deploy:frontend:dev      # To Dev Server
npm run deploy:frontend:staging  # To Staging Server
npm run deploy:frontend:prod     # To Production server
```

## License

This project is licensed under the MIT License.

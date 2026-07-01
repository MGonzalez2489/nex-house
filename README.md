NexHouse Monorepo

Neighborhood management and automated financial control SaaS for condominiums. This project is structured as a scalable and intelligent monorepo using NX.

🚀 Technology Stack

Monorepo Manager: NX

Frontend: Angular (PrimeNG / Tailwind CSS)

Backend: NestJS (TypeORM / WebSockets)

Database: MySQL / Redis (Planned Cache Infrastructure)

Containerization: Docker & Docker Compose

🛠️ Prerequisites

Node.js (LTS version recommended)

Package Manager: npm

Docker & Docker Compose (Installed and running)

📦 Containerized Environment (Docker)

This project features full containerization for local development and services isolation via Docker Compose, bound inside a unified internal bridge network.

Available Services

api: NestJS Backend application wrapper.

db: MySQL persistent relational engine storage cluster.

Managing the Infrastructure

To build and launch the active services container pool in detached mode:

docker compose up --build -d

To safely halt container streams and preserve storage volumes:

docker compose down

🤝 Commit Standard (Husky & Commitlint)

To ensure a clean, semantic, and automated Git history, this project utilizes Husky to intercept local commits and Commitlint to validate that they follow the Conventional Commits specification.

📌 How to write a valid commit?

Each commit message must be structured with a type, an optional scope, and a description:

type(scope): lowercase brief description

Allowed Types (type):

feat: A new feature for the user (e.g., a new table, a new endpoint).

fix: A bug resolution (e.g., fixing a typo in the database, fixing a validation).

docs: Changes exclusively in the documentation (e.g., updating this README).

style: Changes that do not affect the meaning of the code (white-space, Prettier formatting, missing semi-colons).

refactor: A code change that neither fixes a bug nor adds a feature (code optimization).

test: Adding missing tests or correcting existing tests (Jest).

chore: Changes to the build process or auxiliary tools and libraries (e.g., installing dependencies).

📝 Correct Examples (Green Light 🟢)

feat(finance): add support for direct manual transactions

fix(db): change size data type from text to bigint in file table

chore(husky): configure commitlint and git hooks

docs: create initial readme with husky guide

❌ Incorrect Examples (Rejected by Husky 🔴)

fixed the front door (Missing the type and required conventional structure)

Fix: Resolve Bug (The type must be strictly lowercase, and no space is allowed before the colon)

feat: Added The Endpoint (The description must start in lowercase)

⚙️ Local Development

Installing Dependencies

Make sure to install all dependencies at the root of the monorepo:

npm install

Husky Lifecycle (Automatic)

The Husky script is configured within the prepare event of npm. Every time you run npm install in a fresh environment, Husky will automatically configure itself transparently.

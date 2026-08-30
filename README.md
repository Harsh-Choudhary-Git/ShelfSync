# ShelfSync - Full-Stack Library Management & Circulation System

[![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java 21+](https://img.shields.io/badge/Java-21%2B%20%2F%2022-orange.svg)](https://www.oracle.com/java/)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

ShelfSync is a full-stack, enterprise-grade **Library Management System (LMS)** designed as a clean, modular monolith. It provides complete cataloguing, inventory management, dynamic lending rules, automated fine calculations, first-come first-served reservation queues, and role-based access control for **Administrators**, **Librarians**, and **Library Members**.

---

## 📸 Architecture & Design Highlights

* **Role-Based Portals**: Dedicated, secured interfaces for `ADMIN`, `LIBRARIAN`, and `MEMBER`.
* **One-Click Demo Switcher**: Instant switching between Admin, Librarian, and Member demo accounts in the top navigation bar and login screen.
* **Dynamic Circulation Rules**: Configurable borrowing durations, fine rates per overdue day, and maximum simultaneous checkout limits.
* **Automated Overdue & Penalty Engine**: Real-time overdue date computation and fine assessment upon book returns.
* **First-Come Waitlist Queue**: Reservation management with queue positions and one-click fulfillment when copies return.
* **Inventory Safeguards**: Enforced inventory invariants (`availableCopies <= totalCopies`) preventing over-borrowing and invalid stock states.

---

## 🛠️ Technology Stack

### Backend
* **Language & Runtime**: Java 21 / Java 22
* **Framework**: Spring Boot 3.3.3 (Spring Web, Spring Data JPA, Spring Security, Validation)
* **Security & Auth**: Stateless JWT (HMAC-SHA256 via JJWT 0.12.5) with BCrypt password hashing
* **Persistence & ORM**: Hibernate 6 / JPA with PostgreSQL (and H2 for in-memory integration test suite)
* **Build Tool**: Gradle & Maven (`build.gradle` & `pom.xml`)

### Frontend
* **UI Framework**: React 19 + TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS + Glassmorphism aesthetic tokens
* **Routing**: React Router DOM v6
* **Icons & Notifications**: Lucide React + custom Toast notification context
* **HTTP Client**: Axios with automatic JWT interceptors

### Database & DevOps
* **Database**: PostgreSQL 16
* **Containerization**: Multi-stage Dockerfiles + `docker-compose.yml`
* **Configuration**: Environment variables with `.env.example`

---

## 👥 User Roles & Initial Demo Credentials

The application includes a `DataInitializerService` that automatically seeds realistic demo data on startup (including books, authors, publishers, categories, active/overdue loans, unpaid fines, and reservations):

| Role | Username | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` | `admin@shelfsync.com` | `Admin@123` | Full system control, user & librarian management, circulation settings, global metrics. |
| **LIBRARIAN** | `librarian1` | `sarah.jenkins@shelfsync.com` | `Lib@123` | Catalog CRUD, issue/return circulation desk, member lookup, reservation fulfillment, fine collection. |
| **LIBRARIAN** | `librarian2` | `marcus.vance@shelfsync.com` | `Lib@123` | Catalog and circulation desk staff. |
| **MEMBER** | `member1` | `alex.rivera@example.com` | `Mem@123` | Browse catalog, reserve books, view personal active/past loans, settle fines online, manage profile. |
| **MEMBER** | `member2` | `emily.chen@example.com` | `Mem@123` | Member account with sample active loans and overdue fees. |
| **MEMBER** | `member3` | `jordan.taylor@example.com` | `Mem@123` | Member account with sample waitlist reservation holds. |

---

## 🚀 Getting Started

### Option 1: Run with Docker Compose (Recommended)

Make sure Docker and Docker Compose are installed and running:

```bash
# 1. Clone the repository
git clone https://github.com/Harsh-Choudhary-Git/ShelfSync.git
cd ShelfSync

# 2. Copy environment file (optional, defaults are baked in)
cp .env.example .env

# 3. Build and launch all containers (Postgres, Backend, Frontend)
docker compose up --build
```

* **Frontend Web App**: [http://localhost](http://localhost) (or [http://localhost:5173](http://localhost:5173) in dev)
* **Backend REST API**: [http://localhost:8080/api](http://localhost:8080/api)
* **PostgreSQL Database**: `localhost:5432` (`shelfsync` / `shelfsync_user` / `shelfsync_secure_password`)

---

### Option 2: Run Locally (Development Mode)

#### Prerequisites
* **Java 21 or Java 22** (`java -version`)
* **Node.js 18+ and npm** (`node -v`)
* **PostgreSQL 15+** (or use H2 test profile)

#### 1. Start the Backend
```bash
cd backend

# Run automated tests to verify setup
./gradlew test

# Start the Spring Boot application (seeds demo data on startup)
./gradlew bootRun
```
*The backend starts at `http://localhost:8080`.*

#### 2. Start the Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*The frontend starts at `http://localhost:5173`.*

---

## 🧪 Running Automated Tests

ShelfSync features a comprehensive automated test suite covering unit tests for authentication, book catalog management, loans and circulation, reservations, overdue fine calculations, and end-to-end integration tests using an in-memory database:

```bash
cd backend
./gradlew test
```

### Verified Test Classes:
* `AuthServiceTest`: Registration, duplicate username/email prevention, JWT generation.
* `BookServiceTest`: Book creation, ISBN validation, inventory availability checks.
* `LoanServiceTest`: Loan checkout, maximum loan limit enforcement, return processing, overdue calculation.
* `ReservationServiceTest`: Queue placement, duplicate active hold prevention, reservation fulfillment.
* `FineServiceTest`: Fine generation, payment processing via Card/Cash/Online.
* `ShelfSyncIntegrationTest`: Full HTTP endpoint integration test with Spring Boot Test & MockMvc.

---

## 📡 REST API Documentation

All API endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <jwt_token>` header.

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/login`: Authenticate with username/email & password, returns JWT and user profile.
* `POST /api/auth/register`: Public registration for new members.
* `GET /api/auth/me`: Get current authenticated user profile.

### 📚 Books Catalog (`/api/books`)
* `GET /api/books`: List books with search, category filter, author filter, and availability filters.
* `GET /api/books/{id}`: Get detailed book information.
* `POST /api/books`: Create new book (Librarian/Admin).
* `PUT /api/books/{id}`: Update book information (Librarian/Admin).
* `DELETE /api/books/{id}`: Delete book from catalog (Librarian/Admin).

### 🏷️ Meta Entities (`/api/authors`, `/api/publishers`, `/api/categories`)
* `GET /api/authors`: List and search authors.
* `POST /api/authors`: Create author (Librarian/Admin).
* `GET /api/publishers`: List publishers.
* `POST /api/publishers`: Create publisher (Librarian/Admin).
* `GET /api/categories`: List categories and genres.
* `POST /api/categories`: Create category (Librarian/Admin).

### 📖 Circulation & Loans (`/api/loans`)
* `GET /api/loans`: List all loans with status filters (Librarian/Admin).
* `GET /api/loans/my-loans`: List current member's loans (Member).
* `POST /api/loans/issue`: Issue book to member with due date receipt (Librarian/Admin).
* `POST /api/loans/{id}/return`: Process book return and assess overdue fines (Librarian/Admin).
* `POST /api/loans/sync-overdue`: Scan and flag overdue loans (Librarian/Admin).

### 🔖 Reservations (`/api/reservations`)
* `GET /api/reservations`: List reservations queue (Librarian/Admin).
* `GET /api/reservations/my-reservations`: List member's active reservations (Member).
* `POST /api/reservations`: Place reservation on a book (Member/Librarian).
* `POST /api/reservations/{id}/cancel`: Cancel reservation.
* `POST /api/reservations/{id}/fulfill`: Mark copy ready and fulfill reservation (Librarian/Admin).

### 💵 Fines & Penalties (`/api/fines`)
* `GET /api/fines`: List all fines and fee statuses (Librarian/Admin).
* `GET /api/fines/my-fines`: List member's fines balance (Member).
* `POST /api/fines/{id}/pay`: Settle fine via Card, Cash, or Online payment.

### 📊 Dashboard & System Settings (`/api/dashboard`, `/api/settings`)
* `GET /api/dashboard/admin`: System-wide KPI metrics and recent audit feeds.
* `GET /api/dashboard/librarian`: Circulation desk KPIs, pending returns, and reservations.
* `GET /api/dashboard/member`: Personal borrowing stats, due dates, and fine balances.
* `GET /api/settings`: Get all library circulation rules (Admin).
* `PUT /api/settings/{key}`: Update borrowing duration, fine rate, or max loan rules (Admin).

---

## 🛡️ License

This project is licensed under the MIT License.

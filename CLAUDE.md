# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QLCV EVNGENCO1 — hệ thống quản lý công việc nội bộ của EVNGENCO1. Backend Django + DRF, frontend React monorepo. Custom runtime image được build từ `backend/Dockerfile.custom` overlay lên một base image (set bằng build arg `BASE_IMAGE`).

## Architecture

**Monorepo** with two main parts:

- **`/backend`** — Django 4.2 + DRF REST API (Python). Runs as Gunicorn/Uvicorn ASGI. Celery workers for async tasks. PostgreSQL, Redis (Valkey), RabbitMQ, MinIO (S3).
- **`/frontend`** — pnpm workspace + Turborepo. React 18 + React Router 7 + Vite. MobX for state management.

### Frontend Structure

**Apps** (`frontend/apps/`):
- `web` (port 3000) — Main UI
- `admin` (port 3001) — Admin panel
- `space` (port 3002) — Public project space
- `live` (port 3100) — Real-time collaboration server (Node.js/Express + HocusPocus/Y.js, NOT React)

**Shared packages** (`frontend/packages/`): `@qlcv/ui`, `@qlcv/services`, `@qlcv/hooks`, `@qlcv/i18n`, `@qlcv/types`, `@qlcv/utils`, `@qlcv/constants`, `@qlcv/editor` (Tiptap-based), `@qlcv/propel`, `@qlcv/shared-state`, `@qlcv/decorators`, `@qlcv/logger`, `@qlcv/tailwind-config`, `@qlcv/typescript-config`, `@qlcv/codemods`

### GENCO1 Customization Layer

`backend/Dockerfile.custom` overlays the following custom files on top of the base image:
- `qlcv/license/` — Custom licensing (models, API, urls, utils, migrations)
- `qlcv/authentication/views/` — Patched email/check views for app and space
- `qlcv/db/models/project.py` — Modified project model
- `qlcv/db/migrations/` — Custom migrations
- `qlcv/app/views/workspace/base.py` — Patched workspace view

When modifying backend code, check whether the file is one of these overlaid files. Changes to non-overlaid files won't take effect in the Docker build.

### Docker Services

Full stack via `docker-compose.yml`: web, admin, space, live, api, worker, beat-worker, migrator, qlcv-db (PostgreSQL 15), qlcv-redis (Valkey 7), qlcv-mq (RabbitMQ 3.13), qlcv-minio, proxy. Access at port 8080 (HTTP) / 8443 (HTTPS).

## Common Commands

### Full Stack (Docker)
```bash
docker-compose up                    # Start all services
docker-compose up --build            # Rebuild and start
docker-compose up -d api worker      # Start specific services
```

### Frontend Development
```bash
cd frontend
pnpm install                         # Install dependencies
pnpm dev                             # Dev server (all apps, concurrency=18)
pnpm build                           # Production build (all apps)
pnpm check                           # Run format + lint + type checks
pnpm fix                             # Auto-fix format + lint
pnpm check:types                     # Type checking only
pnpm check:lint                      # Lint only (oxlint)
```

### Backend Development
```bash
cd backend
pip install -r requirements/local.txt         # Install dev dependencies
python manage.py runserver                     # Dev server
python manage.py migrate                       # Run migrations
python manage.py makemigrations                # Generate migrations
ruff check .                                   # Lint
ruff format .                                  # Format
```

### Backend Tests
```bash
cd backend
pip install -r requirements/test.txt
python manage.py test
```

## IMPORTANT Rules

### No Django Migrations — Init DB Only

**KHÔNG tạo migration files mới.** Tất cả thay đổi schema phải được gộp trực tiếp vào migration gốc (0001_initial.py hoặc migration sớm nhất liên quan). Lý do:
- Đây là first version, chưa có production data cần preserve
- Hệ thống luôn deploy từ zero (DB trống → migrate → schema đúng ngay)
- Tránh tích lũy migration chain phức tạp

Khi thay đổi model:
1. Sửa model code (ví dụ `qlcv/db/models/project.py`)
2. Tìm migration gốc chứa model đó (ví dụ `qlcv/db/migrations/0001_initial.py`)
3. Sửa trực tiếp trong migration gốc (thay đổi field definition, thêm CreateModel, v.v.)
4. **KHÔNG** chạy `makemigrations` để tạo migration mới

### i18n — Bắt buộc song ngữ Tiếng Việt + Tiếng Anh

Tất cả text hiển thị cho user (labels, placeholders, messages, toasts, errors) **phải hỗ trợ đầy đủ 2 ngôn ngữ**:
- **Tiếng Việt (vi)**: có dấu đầy đủ, là ngôn ngữ mặc định
- **Tiếng Anh (en)**: fallback

Áp dụng cho:
- Frontend: dùng hệ thống i18n có sẵn (`@qlcv/i18n`, `useTranslation()`)
- Backend: error messages trả về qua API nên dùng error codes, frontend map sang ngôn ngữ phù hợp
- God Mode admin app: hiện tại hardcode tiếng Anh — khi sửa/thêm text mới, phải chuyển sang dùng i18n

Quy tắc đặt key: `module.section.action` (ví dụ: `admin.users.create_success`, `admin.users.email_required`)

## Code Style

- **Frontend**: oxlint + oxfmt (configured in `.oxlintrc.json` / `.oxfmtrc.json`). Husky pre-commit hooks run lint-staged.
- **Backend**: Ruff (line-length=120, double quotes, spaces). Config in `pyproject.toml`. Migrations excluded from linting.
- **Node**: Requires >=22.18.0 (pinned in `.mise.toml`). Package manager: pnpm 10.32.1.

## Environment

Copy `.env.example` files in `backend/` and each `frontend/apps/*/` directory. Key variables:
- `VITE_API_BASE_URL` — Backend API URL (default: `http://localhost:8000`)
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL`, `AMQP_URL` — Redis and RabbitMQ URLs
- `AWS_S3_ENDPOINT_URL` — MinIO/S3 endpoint

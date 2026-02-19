# PayFlow

> A full-stack friend group expense tracker. Log shared expenses, see live balances, and settle up — all in one place.

---

## The Problem It Solves

When a group of friends split dinners, Ubers, and groceries, keeping track of who owes what gets messy fast. PayFlow gives the group a single place to log expenses, calculate live balances, and mark debts as settled when money changes hands.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                             │
│              React + Vite (port 3000)                   │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────────┐
│              Python FastAPI Gateway (port 8000)          │
│         /expenses, /balance, /health, /metrics           │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────────┐
│           Java Spring Boot Service (port 8080)           │
│       ExpenseController → ExpenseService → Cassandra     │
└────────────────────────┬────────────────────────────────┘
                         │ CQL (port 9042)
┌────────────────────────▼────────────────────────────────┐
│                  Cassandra 4.1                           │
│              keyspace: payflow                           │
└─────────────────────────────────────────────────────────┘
         ▲                          ▲
         │ scrape                   │ scrape
┌────────┴──────────┐    ┌──────────┴────────┐
│  /actuator/       │    │    /metrics        │
│  prometheus       │    │  (FastAPI)         │
└───────────────────┘    └───────────────────┘
         └──────────────┬──────────────────────
                        │
              ┌─────────▼─────────┐
              │  Prometheus 9090  │
              └───────────────────┘
```

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React 19, Vite 7, Tailwind CSS, Recharts|
| API Gateway  | Python 3.11, FastAPI, httpx             |
| Backend      | Java 17, Spring Boot 3.2, Spring Data Cassandra |
| Database     | Apache Cassandra 4.1                    |
| Monitoring   | Prometheus, Micrometer                  |
| Container    | Docker, Docker Compose                  |
| Orchestration| Kubernetes + HPA                        |
| CI/CD        | GitHub Actions                          |

---

## Quick Start

```bash
git clone https://github.com/kphilippp/pay-flow.git
cd pay-flow
docker-compose up --build
```

Wait ~60 seconds for Cassandra to initialize. Services:

| Service      | URL                              |
|--------------|----------------------------------|
| Frontend     | http://localhost:3000            |
| API Gateway  | http://localhost:8000            |
| API Docs     | http://localhost:8000/docs       |
| Prometheus   | http://localhost:9090            |

---

## Example API Calls

```bash
# Health check
curl http://localhost:8000/health

# Create an expense
curl -X POST http://localhost:8000/expenses \
  -H "Content-Type: application/json" \
  -d '{"paidBy":"kevin","totalAmount":60,"description":"Torchys Dinner","splitWith":["kevin","alex","priya"]}'

# Get expenses for a user
curl http://localhost:8000/expenses/user/kevin

# Get balance for a user
curl http://localhost:8000/balance/kevin

# Settle an expense
curl -X PUT http://localhost:8000/expenses/{id}/settle
```

---

## Running Tests

**Java (expense-service):**
```bash
cd expense-service
mvn clean test
# 8 tests: 4 controller (MockMvc) + 4 service (Mockito)
```

**Python (api-gateway):**
```bash
cd api-gateway
pip install -r requirements.txt
pytest test_main.py -v
# 4 tests: health, metrics, empty body, 404
```

---

## CI/CD Pipeline

GitHub Actions runs on every push to `main`:

1. **test-java** — runs `mvn clean test` on the expense-service
2. **test-python** — runs `pytest test_main.py` on the api-gateway
3. **build-docker** — builds all 3 Docker images (only runs if both test jobs pass)

An automated workflow also commits a realistic log entry to `logs/build-history.log` on a weekday schedule to simulate active development.

---

## Kubernetes Deployment

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check pods
kubectl get pods

# Check HPA (scales expense-service 2–6 replicas at 60% CPU)
kubectl get hpa
```

Manifests:
- `k8s/expense-service.yaml` — Deployment (2 replicas) + Service
- `k8s/api-gateway.yaml` — Deployment + Service
- `k8s/cassandra.yaml` — StatefulSet + Service (persistent volume)
- `k8s/hpa.yaml` — HorizontalPodAutoscaler for expense-service

---

## Screenshots

| Dashboard | Expenses | Add Expense | Prometheus |
|-----------|----------|-------------|------------|
| _(balance cards + who owes who)_ | _(full list + filters)_ | _(modal with live split preview)_ | _(targets UP)_ |

---

## How It Works

The core algorithm is `ExpenseService.getBalanceForUser()`. For each PENDING expense involving a user:

- **If the user paid:** everyone else in `splitWith` owes them `totalAmount / splitWith.size()`
- **If the user is in `splitWith` but didn't pay:** they owe the payer their share

Multiple expenses between the same two people accumulate in a balance map using `Map.merge`. The result is `{person → netAmount}` where positive = they owe you and negative = you owe them.

Edge case handled: the payer is also in `splitWith` (common — you split the bill too, so your own share isn't a debt).

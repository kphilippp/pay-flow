from fastapi import FastAPI, HTTPException
from prometheus_fastapi_instrumentator import Instrumentator
import httpx
import os

app = FastAPI(title="PayFlow API Gateway")
Instrumentator().instrument(app).expose(app)

EXPENSE_SERVICE = os.getenv("EXPENSE_SERVICE_URL", "http://localhost:8080")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/expenses")
async def create_expense(expense: dict):
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{EXPENSE_SERVICE}/expenses", json=expense)
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return res.json()


@app.get("/expenses/{expense_id}")
async def get_expense(expense_id: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{EXPENSE_SERVICE}/expenses/{expense_id}")
        if res.status_code == 404:
            raise HTTPException(status_code=404, detail="Expense not found")
        return res.json()


@app.get("/expenses/user/{user_id}")
async def get_user_expenses(user_id: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{EXPENSE_SERVICE}/expenses/user/{user_id}")
        return res.json()


@app.get("/balance/{user_id}")
async def get_balance(user_id: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{EXPENSE_SERVICE}/expenses/balance/{user_id}")
        return res.json()


@app.put("/expenses/{expense_id}/settle")
async def settle(expense_id: str):
    async with httpx.AsyncClient() as client:
        res = await client.put(f"{EXPENSE_SERVICE}/expenses/{expense_id}/settle")
        return res.json()

# routers/health.py
from fastapi import APIRouter

router = APIRouter(tags=["system"])


@router.get("/")
async def root():
    return {"message": "Hello World"}


@router.get("/health")
async def health():
    return {"status": "ok"}

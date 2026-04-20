from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional


app = FastAPI(title="Student API", description="FastAPI learn Demo", version="0.1.0")


class StudentQuery(BaseModel):
    name: str = Field(
        ..., min_length=1, max_length=50, description="The name of the student"
    )
    age: Optional[int] = Field(None, ge=0, le=150, description="age of the student")


class StudentResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str


FAKE_DB: dict[int, dict] = {
    1: {"id": 1, "name": "John", "age": 20, "gender": "male", "secret": "password123"},
    2: {"id": 2, "name": "Jane", "age": 19, "gender": "female", "secret": "abc432"},
    3: {"id": 3, "name": "Bob", "age": 21, "gender": "male", "secret": "987dcs"},
}


def verify_token(token: str = "dev-token") -> str:
    """_summary_

    参数来自 Query String： GET /student?token=xxx
    实际项目中会从 Hearder 的Authorization中获取 token
    """
    if token != "dev-token":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is not valid, please login again",
        )
    return token

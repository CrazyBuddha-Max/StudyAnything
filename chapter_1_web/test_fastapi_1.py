import uvicorn

from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from fastapi import Request
from fastapi.responses import JSONResponse

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


router = APIRouter(prefix="/api/v1/students", tags=["student manegement"])


@router.get("", response_model=list[StudentResponse], summary="Get all students")
async def list_students(current_token: str = Depends(verify_token)):
    return list(FAKE_DB.values())


@router.get(
    "/{student_id}", response_model=StudentResponse, summary="Select student info by ID"
)
async def get_student(student_id: int):
    student = FAKE_DB.get(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student ID={student_id} not found",
        )
    return student


@router.post(
    "",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new student",
)
async def create_student(data: StudentQuery):  # -> dict[str, Any]:
    new_id = max(FAKE_DB.keys()) + 1
    new_student = {
        "id": new_id,
        "name": data.name,
        "age": data.age or 18,
        "gender": "unkonwn",
        "secret": "hidden",
    }
    FAKE_DB[new_id] = new_student
    return new_student


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "code": exc.status_code,
            "message": exc.detail,
            "path": str(request.url),
        },
    )


app.include_router(router)


@app.get("/", tags=["basic"])
async def root() -> dict[str, str]:
    return {"message": "Hello World"}


@app.get("/health", tags=["basic"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

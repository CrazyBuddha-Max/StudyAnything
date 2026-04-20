# test anything
from pydantic import BaseModel
import fastapi
import uvicorn

app = fastapi.FastAPI()


class StudentQuery(BaseModel):
    name: str
    
    
@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Hello World"}   


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/studentInfo")
async def student_info(data: StudentQuery):
    return {"name": data.name, "age": 20, "gender": "male"}


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)

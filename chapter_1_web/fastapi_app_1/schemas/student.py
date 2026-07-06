from pydantic import BaseModel, Field


class StudentCreate(BaseModel):
    name: str = Field(
        ..., min_length=1, max_length=50, description="name of the student"
    )
    age: int = Field(..., ge=0, le=150, description="age of the student")
    gender: str = Field(
        ..., pattern="^(male|female|other)$", description="gender of the student"
    )


class StudentResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: str

    model_config = {"from_attributes": True}


class StudentUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=50)
    age: int | None = Field(None, ge=0, le=150)
    gender: str | None = Field(None, pattern="^(male|female|other)$")

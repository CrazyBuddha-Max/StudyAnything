from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from repositories.student import StudentRepository
from schemas.student import StudentCreate, StudentUpdate
from models.student import Student


class StudentService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = StudentRepository(db)

    async def get_all(self) -> list[Student]:
        return await self.repo.find_all()

    async def get_by_id(self, student_id: int) -> Student:
        student = await self.repo.find_by_id(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student ID={student_id} not found",
            )
        return student

    async def create(self, data: StudentCreate) -> Student:
        return await self.repo.create(data)

    async def update(self, student_id: int, data: StudentUpdate) -> Student:
        student = await self.get_by_id(student_id)
        return await self.repo.update(student, data)

    async def delete(self, student_id: int) -> dict:
        deleted = await self.repo.delete(student_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student ID={student_id} not found",
            )
        return {"message": f"学生 ID={student_id} 已删除"}

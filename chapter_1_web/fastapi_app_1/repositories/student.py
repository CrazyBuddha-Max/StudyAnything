from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.student import Student
from schemas.student import StudentCreate, StudentUpdate
from typing import Optional


class StudentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def find_all(self) -> list[Student]:
        result = await self.db.execute(select(Student))
        return result.scalars().all()

    async def find_by_id(self, student_id: int) -> Optional[Student]:
        result = await self.db.execute(select(Student).where(Student.id == student_id))
        return result.scalar_one_or_none()

    async def create(self, data: StudentCreate) -> Student:
        pass

    async def update(self, student: Student, data: StudentUpdate) -> Student:
        pass

    async def delete(self, student: Student) -> Student:
        pass

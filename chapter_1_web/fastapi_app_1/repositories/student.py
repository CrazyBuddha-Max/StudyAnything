from models.student import Student
from schemas.student import StudentCreate, StudentUpdate
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession


class StudentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def find_all(self) -> list[Student]:
        result = await self.db.execute(select(Student))
        return result.scalars().all()

    async def find_by_id(self, student_id: str) -> Student | None:
        result = await self.db.execute(select(Student).where(Student.id == student_id))
        return result.scalar_one_or_none()

    async def create(self, data: StudentCreate) -> Student:
        student = Student(**data.model_dump())
        self.db.add(student)
        await self.db.flush()  # 写入不提交，让id自增生效
        await self.db.refresh(student)  # 刷新对象，获得数据库生成的id
        return student

    async def update(self, student: Student, data: StudentUpdate) -> Student:
        update_data = data.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(student, field, value)
        await self.db.flush()
        await self.db.refresh(student)
        return student

    async def delete(self, student_id: str) -> bool:
        result = await self.db.execute(delete(Student).where(Student.id == student_id))
        return result.rowcount > 0

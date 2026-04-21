from database import get_db
from fastapi import APIRouter, Depends
from schemas.student import StudentCreate, StudentResponse, StudentUpdate
from services.student import StudentService
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/students", tags=["学生管理"])

# 每个路由函数通过 Depends(get_db) 获得独立的数据库 Session
# 类比 Spring 的 @Transactional 自动管理事务


@router.get("", response_model=list[StudentResponse])
async def list_students(db: AsyncSession = Depends(get_db)):
    return await StudentService(db).get_all()


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: int, db: AsyncSession = Depends(get_db)):
    return await StudentService(db).get_by_id(student_id)


@router.post("", response_model=StudentResponse, status_code=201)
async def create_student(data: StudentCreate, db: AsyncSession = Depends(get_db)):
    return await StudentService(db).create(data)


@router.patch("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int, data: StudentUpdate, db: AsyncSession = Depends(get_db)
):
    return await StudentService(db).update(student_id, data)


@router.delete("/{student_id}")
async def delete_student(student_id: int, db: AsyncSession = Depends(get_db)):
    return await StudentService(db).delete(student_id)

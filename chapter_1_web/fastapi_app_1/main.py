from contextlib import asynccontextmanager
from fastapi import FastAPI
from database import engine, Base
from routers import student, health


# lifespan 管理应用启动/关闭时的资源
# 类比 Spring 的 @PostConstruct / @PreDestroy
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时：自动建表（生产环境用 Alembic 迁移，不用这个）
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("数据库表初始化完成")
    yield  # 应用运行中
    # 关闭时：释放连接池
    await engine.dispose()
    print("数据库连接池已关闭")


app = FastAPI(title="Student API", lifespan=lifespan)

app.include_router(student.router)
app.include_router(health.router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

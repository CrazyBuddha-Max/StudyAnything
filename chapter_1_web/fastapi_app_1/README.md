第一步：确认 MySQL 服务已启动
bash# Mac
brew services start mysql

# Windows（管理员权限）
net start mysql

# Linux
sudo systemctl start mysql

第二步：创建数据库
sql-- 登录 MySQL
mysql -u root -p

-- 创建数据库，字符集指定 utf8mb4 支持中文和emoji
CREATE DATABASE student_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 确认创建成功
SHOW DATABASES;

-- 退出
EXIT;

第三步：确认 .env 配置正确
envDB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的真实密码
DB_NAME=student_db

第四步：确认依赖都装了
bashpip install fastapi uvicorn sqlalchemy aiomysql pydantic-settings python-dotenv

第五步：执行 main.py
python main.py
启动成功你会看到：
数据库表初始化完成
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
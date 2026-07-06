import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStudents,
  createStudent,
  deleteStudent,
  updateStudent,
} from "./api";
import { AnimatedList, AnimatedItem } from "./components/AnimatedList";
import { ShimmerButton } from "./components/ShimmerButton";
import { MagicCard } from "./components/MagicCard";
import { NumberTicker } from "./components/NumberTicker";

function StudentForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || { name: "", age: "", gender: "male" },
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, age: Number(form.age) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <MagicCard className="mb-6 max-w-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            {initial ? "编辑学生" : "新增学生"}
          </h2>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">姓名</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">年龄</label>
            <input
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              required
              min={0}
              max={150}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">性别</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div className="flex gap-3">
            <ShimmerButton type="submit">
              {initial ? "保存修改" : "确认新增"}
            </ShimmerButton>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </MagicCard>
    </motion.div>
  );
}

function StudentCard({ student, onDelete, onEdit }) {
  return (
    <MagicCard>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {student.name}
          </h2>
          <p className="text-gray-500 text-sm">年龄：{student.age}</p>
          <p className="text-gray-500 text-sm">
            性别：
            {student.gender === "male"
              ? "男"
              : student.gender === "female"
                ? "女"
                : "其他"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(student)}
            className="text-blue-400 hover:text-blue-600 text-sm transition-colors"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(student.id)}
            className="text-red-400 hover:text-red-600 text-sm transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </MagicCard>
  );
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError("");
    try {
      setStudents(await getStudents());
    } catch {
      setError("加载失败，请确认后端服务已启动");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("确认删除？")) return;
    try {
      await deleteStudent(id);
      setStudents(students.filter((s) => s.id !== id));
    } catch {
      alert("删除失败");
    }
  };

  const handleEdit = (student) => {
    setEditTarget(student);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editTarget) {
        const updated = await updateStudent(editTarget.id, formData);
        setStudents(
          students.map((s) => (s.id === editTarget.id ? updated : s)),
        );
      } else {
        const created = await createStudent(formData);
        setStudents([...students, created]);
      }
      setShowForm(false);
      setEditTarget(null);
    } catch {
      alert(editTarget ? "更新失败" : "新增失败");
    }
  };

  const filteredStudents = students.filter((s) => s.name.includes(search));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">学生信息管理系统</h1>
          {/* 数字滚动显示学生总数 */}
          <p className="text-gray-500 mt-1">
            共 <NumberTicker value={students.length} /> 名学生
          </p>
        </motion.div>

        {/* 操作栏 */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="搜索学生姓名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
          <ShimmerButton
            onClick={() => {
              setEditTarget(null);
              setShowForm(true);
            }}
          >
            + 新增学生
          </ShimmerButton>
        </div>

        {/* 表单（有动画） */}
        <AnimatePresence>
          {showForm && (
            <StudentForm
              initial={editTarget}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditTarget(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* 状态提示 */}
        {loading && <p className="text-gray-400 text-center py-8">加载中...</p>}
        {error && <p className="text-red-400 text-center py-8">{error}</p>}

        {/* 学生列表（有动画） */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4">
            <AnimatedList>
              {filteredStudents.map((student) => (
                <AnimatedItem key={student.id} id={student.id}>
                  <StudentCard
                    student={student}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                </AnimatedItem>
              ))}
            </AnimatedList>
            {filteredStudents.length === 0 && (
              <p className="text-gray-400 text-center py-8">暂无学生数据</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

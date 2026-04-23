const BASE = "/api/v1/students";

// 查询所有学生
export async function getStudents() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("获取学生列表失败");
  return res.json();
}

// 创建学生
export async function createStudent(data) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("创建学生失败");
  return res.json();
}

// 删除学生
export async function deleteStudent(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("删除学生失败");
  return res.json();
}

// 更新学生
export async function updateStudent(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("更新学生失败");
  return res.json();
}

// 将此 Java 代码转换为地道的 JavaScript：


// String name = "John";
// int age = 25;
// final String CITY = "New York";
// boolean isActive = true;

const name = "John"
const age = 25
const CITY = "New York"
const isActive = true

// 练习 2：类型转换
// 修复类型强制转换问题
function add(a, b) {
    return Number(a) + Number(b);  // 应该相加数字，而不是连接字符串
}

console.log(add(5, "10"));  // 应该输出 15，而不是 "510"

// 练习 3：Null/Undefined 处理
// 编写一个处理 null/undefined 值的函数
function getDisplayName(user) {
    // 如果 user 存在且有 name，返回 user.name
    // 否则返回 "Guest"
    if (user && user.name) {
        return user.name;
    }
    return "Guest";
}

// 练习 4：类型检查
// 编写一个处理不同类型的函数
function processValue(value) {
    // 如果是 string：返回大写
    // 如果是 number：返回双倍
    // 如果是 boolean：返回取反
    // 如果是 array：返回长度
    // 否则：返回 "unknown"
    if (typeof value === "string") {
        return value.toUpperCase();
    } else if (typeof value === "number") {
        return value * 2;
    } else if (typeof value === "boolean") {
        return !value;
    } else if (Array.isArray(value)) {
        return value.length;
    } else {
        return "unknown";
    }
}
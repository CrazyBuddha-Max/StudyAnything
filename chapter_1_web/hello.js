// JavaScript - typeof 运算符
let num = 42;
let str = "hello";
let bool = true;
let obj = { name: "John" };
let arr = [1, 2, 3];
let func = function() {};
let nothing = null;
let undef = undefined;

console.log(typeof num);    // "number"
console.log(typeof str);    // "string"
console.log(typeof bool);   // "boolean"
console.log(typeof obj);    // "object"
console.log(typeof arr);    // "object"（数组是对象！）
console.log(typeof func);   // "function"
console.log(typeof nothing); // "object"（历史 bug！）
console.log(typeof undef);   // "undefined"

// 检查 null（需要特殊处理）
function isNull(value) {
    return value === null;
}

// 检查数组
function isArray(value) {
    return Array.isArray(value);
}

// 检查 NaN
function isNaNCheck(value) {
    return Number.isNaN(value);
}

// 模式：类型检查
function process(value) {
    if (typeof value === "string") {
        console.log("Processing string:", value.toUpperCase());
    } else if (typeof value === "number") {
        console.log("Processing number:", value * 2);
    } else if (Array.isArray(value)) {
        console.log("Processing array:", value.length);
    } else if (value === null) {
        console.log("Processing null value");
    } else {
        console.log("Unknown type");
    }
}

process("hello");  // "Processing string: HELLO"
process(42);       // "Processing number: 84"
process([1, 2, 3]); // "Processing array: 3"
process(null);     // "Processing null value"
## 类型

### 内置类型

`JavaScript` 有七种内置类型：

- 空值（`null`）
- 未定义（`undefined`）
- 布尔值（ `boolean`）
- 数字（`number`）
- 字符串（`string`）
- 对象（`object`）
- 符号（`symbol`，`ES6` 中新增）

**除对象之外，其他统称为“基本类型”。**

`typeof` 运算符来查看值的类型，返回的是类型的字符串值。

```javascript
typeof undefined === "undefined";   // true
typeof true === "boolean";          // true
typeof 42 === "number";             // true
typeof "42" === "string";           // true
typeof { life: 42 } === "object";   // true

// ES6中新加入的类型
typeof Symbol() === "symbol";       // true
```

**`null` 比较特殊：**

```javascript
typeof null === "object";           // true
```

用 `typeof` 复合条件来检测 `null` 值的类型：

```javascript
var a = null;
(!a && typeof a === "object");     // true
```

其他情况

```javascript
typeof function a(){ /* .. */ } === "function"; // true
```

`function`（函数）是 `object` 的一个“子类型”，函数是“可调用对象”。

函数不仅是对象，还可以拥有属性。

```javascript
function a(b,c) {
  /* .. */
}

a.length; // 2
```

函数的 `length` 属性获取的是形参的个数，但是形参的数量不包括剩余参数个数，而且仅包括第一个具有默认值之前的参数个数，看下面的例子。

```javascript
((a, b, c) => {}).length; 
// 3

((a, b, c = 3) => {}).length; 
// 2 

((a, b = 2, c) => {}).length; 
// 1 

((a = 1, b, c) => {}).length; 
// 0 

((...args) => {}).length; 
// 0

const fn = (...args) => {
  console.log(args.length);
} 
fn(1, 2, 3)
// 3
```

`JavaScript` 支持数组，它也是 `object` 的一个“子类型”：

```javascript
typeof [1,2,3] === "object"; // true
```

### 值和类型

`JavaScript` 中的变量是没有类型的，只有值才有。变量可以随时持有任何类型的值。

#### 1.`undefined` 和 `undeclared`

`undefined`：已在作用域中声明但还没有赋值的变量

`undeclared`：还没有在作用域中声明过的变量

```javascript
var a;

a; // undefined
b; // ReferenceError: b is not defined

typeof a; // "undefined"
typeof b; // "undefined"
```

对于 `undeclared`变量，`typeof` 照样返回 "`undefined`"。这是因为 `typeof` 有一个特殊的安全防范机制。

#### 2.`typeof Undeclared`

安全防范机制对在浏览器中运行的 `JavaScript` 代码来说很有帮助的。

例子：在程序中使用全局变量 `DEBUG` 作为“调试模式”的开关。在输出调试信息到控制台之前，我们会检查 `DEBUG` 变量是否已被声明。顶层的全局变量声明 `var DEBUG = true` 只在 `debug.js` 文件中才有，而该文件只在开发和测试时才被加载到浏览器，在生产环 境中不予加载。

问题是如何在程序中检查全局变量 `DEBUG` 才不会出现 `ReferenceError` 错误。这时 `typeof` 的安全防范机制就成了我们的好帮手：

```javascript
// 这样会抛出错误
if (DEBUG) {
 console.log( "Debugging is starting" );
}
// 这样是安全的
if (typeof DEBUG !== "undefined") {
 console.log( "Debugging is starting" );
}
```


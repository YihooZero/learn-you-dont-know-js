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


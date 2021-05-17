## 语法

### 一、语句和表达式

```javascript
var a = 3 * 6;
var b = a;
b;
```

`3 * 6` 是一个表达式（结果为 `18`）。第二行的 `a` 也是一个表达式，第三行的 `b` 也是。 表达式 `a` 和 `b` 的结果值都是 18。

`var a = 3 * 6` 和 `var b = a` 称为“声明语句” ，因为它们声明了变量（还可以为其赋值）。`a = 3 * 6` 和 `b = a`（不带 `var`）叫作“赋值表达式”。

第三行代码中只有一个表达式 `b`，同时它也是一个语句。这样的情况通常叫作“表达式语句”。

#### 1.语句的结果值

规范定义 `var` 的结果值是 `undefined`。如果在控制台中输入 `var a = 42` 会得到结果值 `undefined`，而非 `42`。

代码块的结果值就如同一个隐式的返回，即返回最后一个语句的结果值。

```javascript
var b;
if (true) {
  b = 4 + 38;
}
```

在控制台上代码应该会显示 `42`，即最后一个语句 / 表达式 `b = 4 + 38` 的结果值。

#### 2.表达式的副作用

```javascript
var a = 42;
var b = a++;

a; // 43
b; // 42
```

`a++` 首先返回变量 `a` 的当前值 `42`（再将该值赋给 `b`），然后将 `a` 的值加 `1`

```javascript
var a = 42;

a++; // 42
a;   // 43

++a; // 44
a;   // 44
```

`++` 在前面时，如 `++a`，它的副作用（将 `a` 递增）产生在表达式返回结果值之前，而 `a++` 的副作用则产生在之后。

#### 3.上下文规则

##### 大括号

下面两种情况会用到大括号 `{ .. }`：

- 对象常量

  ```javascript
  var a = {
    foo: bar()
  };
  ```

  `{ .. }` 被赋值给 `a`，因而它是一个对象常量。

- 标签

  ```javascript
  {
    foo: bar()
  }
  ```

  这里涉及 `JavaScript` 中一个不太为人知的特性，叫作“标签语句” 。`foo` 是语句 `bar()` 的标签。

  ```javascript
  // 标签为foo的循环
  foo: for (var i=0; i<4; i++) {
    for (var j=0; j<4; j++) {
      // 如果j和i相等，继续外层循环
      if (j == i) {
        // 跳转到foo的下一个循环
        continue foo;
      }
      // 跳过奇数结果
      if ((j * i) % 2 == 1) {
        // 继续内层循环（没有标签的）
        continue;
      }
      console.log( i, j );
    }
  }
  
  // 1 0
  // 2 0
  // 2 1
  // 3 0
  // 3 2
  ```

  `contine foo` 并不是指“跳转到标签 `foo` 所在位置继续执行”，而是“执行 `foo` 循环的下一轮循环”。

  上例中 `continue` 跳过了循环 `3 1`，`continue foo`（带标签的循环跳转） 跳过了循环 `1 1` 和 `2 2`。

  带标签的循环跳转一个更大的用处在于，和 `break __` 一起使用可以实现从内层循环跳转到 外层循环。

  ```javascript
  // 标签为foo的循环
  foo: for (var i=0; i<4; i++) {
    for (var j=0; j<4; j++) {
      if ((i * j) >= 3) {
        console.log( "stopping!", i, j );
        break foo;
      }
      console.log( i, j );
    }
  }
  
  // 0 0
  // 0 1
  // 0 2
  // 0 3
  // 1 0
  // 1 1
  // 1 2
  // Stop! 1 3
  ```

  `break foo` 不是指“跳转到标签 `foo` 所在位置继续执行”，而是“跳出标签 `foo` 所在的循环 / 代码块，继续执行后面的代码”。

  标签也能用于非循环代码块，但只有 `break` 才可以。我们可以对带标签的代码块使用 `break ___`，但是不能对带标签的非循环代码块使用 `continue ___`，也不能对不带标签的代码块使用 `break`：

  ```javascript
  // 标签为bar的代码块
  function foo() {
    bar: {
      console.log( "Hello" );
      break bar;
      console.log( "never runs" );
    }
    console.log( "World" );
  }
  
  foo();
  // Hello
  // World
  ```

##### 代码块

```javascript
[] + {}; // "[object Object]"
{} + []; // 0
```

第一行代码中，`{}` 出现在 `+` 运算符表达式中，因此它被当作一个值（空对象）来处理。`[]` 会被强制类型转换为 `""`，而 `{}` 会被强制类型转换为 `"[object Object]"`。

但在第二行代码中，**`{}` 被当作一个独立的空代码块（不执行任何操作）**。代码块结尾不需要分号，所以这里不存在语法上的问题。最后 `+ []` 将 `[]` 显式强制类型转换为 `0`。

#####  对象解构

`{ a, b }` 实际上是 `{ a: a, b: b }` 的简化版本，两者均可，只不过 `{ a, b }` 更简洁。

`{ .. }` 还可以用作函数命名参数的对象解构， 方便隐式地用对象属性赋值：

```javascript
function foo({ a, b, c }) {
  // 不再需要这样:
  // var a = obj.a, b = obj.b, c = obj.c
  console.log( a, b, c );
}

foo( {
  c: [1,2,3],
  a: 42,
  b: "foo"
} ); // 42 "foo" [1, 2, 3]
```

##### else if 和可选代码块

作者认为 `JavaScript` 没有 `else if`，但 `if` 和 `else` 只包含单条语句的时候可以省略代码块的 `{ }`。

我们经常用到的 `else if` 实际上是这样的：

```javascript
if (a) {
  // ..
}
else {
  if (b) {
  // ..
  }
  else {
  // ..
  }
}
```

`if (b) { .. } else { .. }` 实际上是跟在 `else` 后面的一个单独的语句，所以带不带 `{ }` 都可以。换句话说，`else if` 不符合前面介绍的编码规范，`else` 中是一个单独的 `if` 语句。

### 二、运算符优先级

**逗号操作符** 对它的每个操作数求值（从左到右），并返回最后一个操作数的值。

```javascript
let x = 1;

x = (x++, x);
console.log(x); // 2

x = (2, 3);
console.log(x); // 3
```

```javascript
var a = 42, b;
b = ( a++, a );
a; // 43
b; // 43
```

如果去掉 `( )` 会出现什么情况：

```javascript
var a = 42, b;
b = a++, a;
a; // 43
b; // 42
```

上面两个例子中 `b` 的值不一样，因为运算符的优先级比 `=` 低。所以 `b = a++`, `a` 其实可以理解为 `(b = a++), a`。前面说过 `a++` 有后续副作用，所以 `b` 的值是 `++` 对 `a` 做递增之前的值 `42`。

`a && b || c` 执行的是  `(a && b) || c` 还是 `a && (b || c)` ？

```javascript
(false && true) || true; // true
false && (true || true); // false

false && true || true;   // true
```

> `&&` 先执行，然后是 `||`

执行顺序是否就一定是从左到右呢？

```javascript
true || false && false;   // true

(true || false) && false; // false
true || (false && false); // true
```

这说明 `&&` 运算符先于 `||` 执行，而且执行顺序并非我们所设想的从左到右。原因就在于 **运算符优先级**。

#### 1.短路

 对 `&&` 和 `||` 来说，如果从左边的操作数能够得出结果，就可以忽略右边的操作数。我们将这种现象称为 **“短路”**（即执行最短路径）。

以 `a && b` 为例，如果 `a` 是一个假值，足以决定 `&&` 的结果，就没有必要再判断 `b` 的值。同样对于 `a || b`，如果 `a` 是一个真值，也足以决定 `||` 的结果，也就没有必要再判断 `b` 的值。

#### 2.更强的绑定

```javascript
a && b || c ? c || b ? a : c && b : a
// 其中 ? : 运算符的优先级比 && 和 || 高还是低呢？执行顺序是这样？
// 是执行一 ?
a && b || (c ? c || (b ? a : c) && b : a)

// 还是执行二 ?
(a && b || c) ? (c || b) ? a : (c && b) : a
```

答案是执行二。因为 `&&` 运算符的优先级高于 `||`，而 `||` 的优先级又高于 `? :`。

#### 3.关联

`&&` 和 `||` 运算符先于 `? :` 执行，那么如果多个相同优先级的运算符同时出现，又该如何处理呢？

`a && b && c` 这样的表达式就涉及组合（隐式），这意味着 `a && b` 或 `b && c` 会先执行。

从技术角度来说，因为 `&&` 运算符是左关联（`||` 也是），所以 `a && b && c` 会被处理为 `(a && b) && c`。不过右关联 `a && (b && c)` 的结果也一样。

> 如果 `&&` 是右关联的话会被处理为 `a && (b && c)`。**但这并不意味着 `c` 会在 `b` 之前执行**。**右关联不是指从右往左执行，而是指从右往左组合**。任何时候， 不论是组合还是关联，**严格的执行顺序都应该是从左到右，`a`，`b`，然后 `c`**。

三元运算符或者条件运算符：

```javascript
a ? b : c ? d : e;

// 执行一
a ? b : (c ? d : e)
// 执行二
(a ? b : c) ? d : e
```

`? :` 是右关联，因此会执行一代码。

另一个右关联（组合）的例子是 `=` 运算符：

```javascript
var a, b, c;
a = b = c = 42;
```

它首先执行 `c = 42`，然后是 `b = ..`，最后是 `a = ..`。因为是右关联，所以它实际上是这样来处理的：`a = (b = (c = 42))`。

更为复杂的赋值表达式的例子：

```javascript
var a = 42;
var b = "foo";
var c = false;

var d = a && b || c ? c || b ? a : c && b : a;

d; // 42
```

根据组合规则将上面的代码分解如下：

```javascript
((a && b) || c) ? ((c || b) ? a : (c && b)) : a
```

通过缩进显式让代码更容易理解：

```javascript
(
  (a && b)
    ||
  c
)
  ?
(
  (c || b)
    ?
  a
    :
  (c && b)
)
  :
a
```

执行顺序：

1. `(a && b)` 结果为 `"foo"`。
2. `"foo" || c` 结果为 `"foo"`。
3. 第一个 `?` 中，`"foo"` 为真值。
4.  `(c || b)` 结果为 `"foo"`。
5. 第二个 `?` 中，`"foo"` 为真值。
6. `a` 的值为 `42`。

#### 4.释疑

在编写程序时既要依赖运算符优先级 / 关联规则，也要适当使用 `( )` 自行控制方式。

如果运算符优先级 / 关联规则能够令代码更为简洁，就使 用运算符优先级 / 关联规则；而如果 `( )` 有助于提高代码可读性，就使用 `( )`。

### 三、自动分号

有时 `JavaScript` 会自动为代码行补上缺失的分号，即自动分号插入。

请注意，`ASI` 只在换行符处起作用，而不会在代码行的中间插入分号。

如果 `JavaScript` 解析器发现代码行可能因为缺失分号而导致错误，那么它就会自动补上分号。并且，只有在代码行末尾与换行符之间除了空格和注释之外没有别的内容时，它才会这样做。

```javascript
var a = 42, b
c;
```

如果 `b` 和 `c` 之间出现 `,` 的话（即使另起一行），`c` 会被作为 `var` 语句的一部分来处理。在上例中，`JavaScript` 判断 `b` 之后应该有 `;`，所以 `c;` 被处理为一个独立的表达式语句。

### 四、错误

#### 提前使用变量

`TDZ`（暂时性死区）指的是由于代码中的变量还没有初始化而不能被引用的情况。

```javascript
{
  a = 2; // ReferenceError!
  let a;
}
```

`a = 2` 试图在 `let a` 初始化 `a` 之前使用该变量（其作用域在 `{ .. }` 内），这里就是 `a` 的 `TDZ`，会产生错误。

对未声明变量使用 `typeof` 不会产生错误，但在 `TDZ` 中却会报错：

```javascript
{
  typeof a; // undefined
  typeof b; // ReferenceError! (TDZ)
  let b;
}
```

### 五、函数参数

在 `ES6` 中，如果参数被省略或者值为 `undefined`，则取该参数的默认值：

```javascript
function foo( a = 42, b = a + 1 ) {
  console.log( a, b );
}

foo();            // 42 43
foo( undefined ); // 42 43
foo( 5 );         // 5 6
foo( void 0, 7 ); // 42 7
foo( null );      // null 1
```

对 `ES6` 中的参数默认值而言，参数被省略或被赋值为 `undefined` 效果都一样，都是取该参数的默认值。然而某些情况下，它们之间还是有区别的：

```javascript
function foo( a = 42, b = a + 1 ) {
  console.log(
    arguments.length, a, b,
    arguments[0], arguments[1]
  );
}

foo();                // 0 42 43 undefined undefined
foo( 10 );            // 1 10 11 10 undefined
foo( 10, undefined ); // 2 10 11 10 undefined
foo( 10, null );      // 2 10 null 10 null
```

虽然参数 `a` 和 `b` 都有默认值，但是函数不带参数时，`arguments` 数组为空。相反，如果向函数传递 `undefined` 值，则 `arguments` 数组中会出现一个值为 `undefined` 的单元，而不是默认值。

`ES6` 参数默认值会导致 `arguments` 数组和相对应的命名参数之间出现偏差，`ES5` 也会出现这种情况：

```javascript
function foo(a) {
  a = 42;
  console.log( arguments[0] );
}

foo( 2 ); // 42 (linked)
foo();    // undefined (not linked)
```

向函数传递参数时，`arguments` 数组中的对应单元会和命名参数建立关联（linkage）以得到相同的值。相反，不传递参数就不会建立关联。

但是，在严格模式中并没有建立关联这一说：

```javascript
function foo(a) {
  "use strict";
  a = 42;
  console.log( arguments[0] );
}

foo( 2 ); // 2 (not linked)
foo();    // undefined (not linked)
```

### 六、try..finally

`finally` 中的代码总是会在 `try` 之后执行，如果有 `catch` 的话则在 `catch` 之后执行。也可以将 `finally` 中的代码看作一个回调函数，即无论出现什么情况最后一定会被调用。

`finally` 中的 `return` 会覆盖 `try` 和 `catch` 中 `return` 的返回值：

```javascript
function foo() {
  try {
    return 42;
  }
  finally {
    // 没有返回语句，所以没有覆盖
  }
}

function bar() {
  try {
    return 42;
  }
  finally {
    // 覆盖前面的 return 42
    return;
  }
}

function baz() {
  try {
    return 42;
  }
  finally {
    // 覆盖前面的 return 42
    return "Hello";
  }
}

foo(); // 42
bar(); // undefined
baz(); // Hello
```

通常来说，在函数中省略 `return` 的结果和 `return;` 及 `return undefined;` 是一样的，但是在 `finally` 中省略 `return` 则会返回前面的 `return` 设定的返回值。

### 七、switch

`switch`可以看作是 `if..else if..else..` 的简化版本：

```javascript
switch (a) {
  case 2:
    // 执行一些代码
    break;
  case 42:
    // 执行另外一些代码
    break;
  default:
    // 执行缺省代码
}
```

首先，`a` 和 `case` 表达式的匹配算法与 `===` 相同。通常 `case` 语句中的 `switch` 都是简单值，所以这并没有问题。

然而，有时可能会需要通过强制类型转换来进行相等比较（即 `==`），这时就需要做一些特殊处理：

```javascript
var a = "42";

switch (true) {
  case a == 10:
    console.log( "10 or '10'" );
    break;
  case a == 42;
    console.log( "42 or '42'" );
    break;
  default:
    // 永远执行不到这里
}
// 42 or '42'
```

### 八、附录

#### 1.全局 DOM 变量

有一个不太为人所知的事实是：由于浏览器演进的历史遗留问题，在创建带有 `id` 属性的 `DOM` 元素时也会创建同名的全局变量。例如：

```javascript
<div id="foo"></div>

if (typeof foo == "undefined") {
  foo = 42;         // 永远也不会运行
}
console.log( foo ); // HTML元素
```


## 值

### 数组

1. 使用 `delete` 运算符可以将单元从数组中删除，单元删除后，数组的 length 属性并不会发生变化。

   ```javascript
   var array = [1, 2, 3];
   delete array[1];
   
   console.log(array);         // [1, empty, 3] 特别注意empty是一个空的，占位符，理解为"空白单元"
   console.log(array[1]);      // undefined
   console.log(array.length);  // 3
   ```

   `array[1]` 的值为 `undefined`，但这与将其显式赋值为 `undefined（a[1] = undefined）`还是有所区别。

   `TODO:` 解释原因？

2. 数组也是对象，也可以包含字符串键值和属性（但这些并不计算在数组长度内）。

   ```javascript
   var a = [ ];
   
   a[0] = 1;
   a["foobar"] = 2;
   
   a.length;     // 1
   a["foobar"];  // 2
   a.foobar;     // 2
   ```

3. 如果字符串键值能够被强制类型转换为十进制数字的话，它就会被当作数字索引来处理。

   ```javascript
   var a = [ ];
   
   a["13"] = 42;
   
   a.length; // 14
   ```

#### 类数组

哪些是类数组： `DOM` 元素列表，`arguments` 对象等。

如何将类数组转化为数组？

1.工具函数 `slice(..)` 转换

```javascript
function foo() {
 var arr = Array.prototype.slice.call( arguments );
 arr.push( "bam" );
 console.log( arr );
}
foo( "bar", "baz" ); // ["bar","baz","bam"]
```

2.`ES6` 内置工具函数 `Array.from(..)` 

```javascript
var arr = Array.from( arguments );
```

### 字符串

`JavaScript` 中字符串是不可变的，字符串不可变是指字符串的成员函数不会改变其原始值，而是创建并返回一个新的字符串。

许多数组函数用来处理字符串很方便。虽然字符串没有这些函数，但可以通过“借用”数组的非变更方法来处理字符串：

```javascript
var a = "foo";

a.join; // undefined
a.map;  // undefined

var c = Array.prototype.join.call( a, "-" );
var d = Array.prototype.map.call( a, function(v){
 return v.toUpperCase() + ".";
} ).join( "" );

c; // "f-o-o"
d; // "F.O.O."
```

数组有一个字符串没有的可变更成员函数 `reverse()`：

```javascript
a.reverse;   // undefined

b.reverse(); // ["!","o","O","f"]
b;           // ["f","O","o","!"]
```

字符串无法"借用"数组的可变更成员函数 `reverse`，因为字符串是不可变的。

一个变通（破解）的办法是先将字符串转换为数组，待处理完后再将结果转换回字符串：

```javascript
var c = a
 // 将a的值转换为字符数组
 .split( "" )
 // 将数组中的字符进行倒转
 .reverse()
 // 将数组中的字符拼接回字符串
 .join( "" );

c; // "oof"
```

### 数字

`JavaScript` 中的“整数”就是没有小数的十进制数。

```javascript
var a = 1.0;
var b = 1;

a === b  // true
```

#### 1.数字的语法

小数点前面的 `0` 可以省略，小数点后小数部分最后面的 `0` 也可以省略：

```javascript
var a = 0.42;
var b = .42;

var a = 42.0;
var b = 42.;
```

默认情况下大部分数字都以十进制显示，小数部分最后面的 `0` 被省略：

```javascript
var a = 42.300;
var b = 42.0;

a; // 42.3
b; // 42
```

**`.`  运算符**

注意：它是一个有效的数字字符，会被优先识别为数字字面量的一部分，然后才是对象属性访问运算符。

```javascript
// 无效语法：
42.toFixed( 3 );   // SyntaxError

// 下面的语法都有效：
(42).toFixed( 3 ); // "42.000"
0.42.toFixed( 3 ); // "0.420"
42..toFixed( 3 );  // "42.000"
42 .toFixed(3);    // "42.000"
```

`42.toFixed(3)` 是无效语法，因为 `.` 被视为常量 `42.` 的一部分，所以没有 `.` 属性访问运算符来调用 `toFixed` 方法。

`42..toFixed( 3 )` 则没有问题，因为第一个 `.` 被视为 `number` 的一部分，第二个 `.` 是属性访问运算符。

#### 2.较小数值

`JavaScript` 中的数字类型是基于 `IEEE 754` 标准来实现的，该标准通常也被称为“浮点数”。`JavaScript` 使用的是“双精度”格式（即 64 位二进制）。

二进制浮点数最大的问题是会出现如下问题：

```javascript
0.1 + 0.2 === 0.3; // false
```

简单来说，二进制浮点数中的 `0.1` 和 `0.2` 并不是十分精确，它们相加的结果并非刚好等于 `0.3`，而是一个比较接近的数字 `0.30000000000000004`，所以条件判断结果为 `false`。

如何判断 `0.1 + 0.2` 和 `0.3` 是否相等？

最常见的方法是设置一个误差范围值，通常称为“机器精度”，对 `JavaScript` 的数字来说，这个值通常是 `2^-52 (2.220446049250313e-16)`。

从 `ES6` 开始，该值定义在 `Number.EPSILON` 中，`ES6` 之前版本的 `polyfill`：

```javascript
if (!Number.EPSILON) {
 Number.EPSILON = Math.pow(2,-52);
}
```

可以使用 `Number.EPSILON` 来比较两个数字是否相等（在指定的误差范围内）：

```javascript
function numbersCloseEnoughToEqual(n1,n2) {
 return Math.abs( n1 - n2 ) < Number.EPSILON;
}

var a = 0.1 + 0.2;
var b = 0.3;

numbersCloseEnoughToEqual( a, b );                 // true
numbersCloseEnoughToEqual( 0.0000001, 0.0000002 ); // false
```

能够呈现的最大浮点数大约是 `1.798e+308`（这是一个相当大的数字），它定义在 `Number. MAX_VALUE` 中。最小浮点数定义在 `Number.MIN_VALUE` 中，大约是 `5e-324`，它不是负数，但无限接近于 `0` ！

#### 3.整数的安全范围

能够被“安全”呈现的最大整数是 `2^53 - 1`，即 `9007199254740991`，在 `ES6` 中被定义为 `Number.MAX_SAFE_INTEGER`。

最小整数是 `-9007199254740991`，在 `ES6` 中被定义为 `Number. MIN_SAFE_INTEGER`。

#### 4.整数检测

要检测一个值是否是**整数**，可以使用 `ES6` 中的 `Number.isInteger(..)` 方法：

```javascript
Number.isInteger( 42 );     // true
Number.isInteger( 42.000 ); // true
Number.isInteger( 42.3 );   // false
```

`ES6` 之前的版本 `polyfill`：

```javascript
if (!Number.isInteger) {
  Number.isInteger = function(num) {
    return typeof num == "number" && num % 1 == 0;
  };
}
```

要检测一个值是否是**安全的整数**，可以使用 `ES6` 中的 `Number.isSafeInteger(..)` 方法：

```javascript
Number.isSafeInteger( Number.MAX_SAFE_INTEGER ); // true
Number.isSafeInteger( Math.pow( 2, 53 ) );       // false
Number.isSafeInteger( Math.pow( 2, 53 ) - 1 );   // true
```

`ES6` 之前的版本 `polyfill` ：

```javascript
if (!Number.isSafeInteger) {
  Number.isSafeInteger = function(num) {
    return Number.isInteger( num ) &&
      Math.abs( num ) <= Number.MAX_SAFE_INTEGER;
  };
}
```

### 特殊数值

#### 1.不是值得值

`undefined` 类型只有一个值，即 `undefined`。`null` 类型也只有一个值，即 `null`。它们的名称既是类型也是值。

`undefined` 和 `null` 常被用来表示“空的”值或“不是值”的值。

- `null` 指空值（`empty value`）
- `undefined` 指没有值（`missing value`）

或者说：

- `undefined` 指从未赋值
- `null` 指曾赋过值，但是目前没有值

`null` 是一个特殊关键字，不是标识符，我们不能将其当作变量来使用和赋值。然而 `undefined` 却是一个标识符，可以被当作变量来使用和赋值。

#### 2.`undefined`

在非严格模式下，我们可以为全局标识符 `undefined` 赋值：

```javascript
function foo() {
 undefined = 2; // 非常糟糕的做法！
}
foo();

function foo() {
 "use strict";
 undefined = 2; // TypeError!
}
foo();
```

在非严格和严格两种模式下，我们可以声明一个名为 `undefined` 的局部变量。

```javascript
function foo() {
 "use strict";
 var undefined = 2;
 console.log( undefined ); // 2
}
foo();
```

**永远不要重新定义 `undefined`。**

##### void 运算符

表达式 `void ___` 没有返回值，因此返回结果是 `undefined`。`void` 并不改变表达式的结果， 只是让表达式不返回值：

```javascript
var a = 42;

console.log( void a, a ); // undefined 42
```

按惯例我们用 `void 0` 来获得 `undefined`。`void true`、`void 0`、`void 1` 和 `undefined` 之间并没有实质上的区别。

`void` 运算符在其他地方也能派上用场，比如不让表达式返回任何结果（即使其有副作用）。

```javascript
function doSomething() {
  // 注： APP.ready 由程序自己定义
  if (!APP.ready) {
  // 稍后再试
    return void setTimeout( doSomething,100 );
  }
    
  var result;
  // 其他
  return result;
}

// 现在可以了吗？
if (doSomething()) {
 // 立即执行下一个任务
}
```

这里 `setTimeout(..)` 函数返回一个数值（计时器间隔的唯一标识符，用来取消计时），但是为了确保 `if` 语句不产生误报，我们要 `void` 掉它。

也可以分开操作，效果都一样，只是没有使用 `void` 运算符：

```javascript
if (!APP.ready) {
  // 稍后再试
  setTimeout( doSomething,100 );
  return;
}
```

总之，如果要将代码中的值（如表达式的返回值）设为 `undefined`，就可以使用 `void`。

#### 3.特殊的数字

##### 1.不是数字的数字

如果数学运算的操作数不是数字类型（或者无法解析为常规的十进制或十六进制数字）， 就无法返回一个有效的数字，这种情况下返回值为 `NaN`。

`NaN` 意指“不是一个数字”（`not a number`）。将它理解为“无效数值”“失败数值”或者“坏数值”可能更准确些。

```javascript
var a = 2 / "foo";     // NaN

typeof a === "number"; // true
```

> “不是数字的数字”仍然是数字类型。

`NaN` 是一个特殊值，它和自身不相等，是唯一一个非自反的值。而 `NaN != NaN` 为 `true`。

```javascript
var a = 2 / "foo";

a == NaN;  // false
a === NaN; // false
```

如何判断是否为 `NaN`？

- 内建的全局工具函数 `isNaN(..)`

  ```javascript
  var a = 2 / "foo";
  
  isNaN( a ); // true
  ```

  问题：“检查参数是否不是 `NaN`，也不是数字”，结果并不太准确。

  ```javascript
  var a = 2 / "foo";
  var b = "foo";
  
  a; // NaN
  b; "foo"
  
  window.isNaN( a ); // true
  window.isNaN( b ); // true——晕！
  // 很明显 "foo" 不是一个数字，但是它也不是 NaN
  ```
  
- `ES6` 工具函数 `Number.isNaN(..)`。`ES6` 之前的浏览器的 `polyfill`：

  ```javascript
  if (!Number.isNaN) {
    Number.isNaN = function(n) {
      return (
        typeof n === "number" &&
        window.isNaN( n )
      );
    };
  }
  
  var a = 2 / "foo";
  var b = "foo";
  
  Number.isNaN( a ); // true
  Number.isNaN( b ); // false——好！
  ```

- 更简单的方法一种方法，利用 `NaN` 不等于自身这个特点。**`NaN` 是 `JavaScript` 中唯 一一个不等于自身的值**。

  ```javascript
  if (!Number.isNaN) {
    Number.isNaN = function(n) {
      return n !== n;
    };
  }
  ```

##### 2.无穷数

`JavaScript` 使用有限数字表示法（**`IEEE 754` 浮点数**），和纯粹的数学运算不同，`JavaScript` 的运算结果有可能溢出，此时结果为 `Infinity` 或者 `-Infinity`。

```javascript
var a = 1 / 0; // Infinity
var b = -1 / 0; // -Infinity
```

`Infinity`：`Number.POSITIVE_INfINITY`；

`-Infinity`：`Number.NEGATIVE_ INfINITY`；

计算结果一旦溢出为无穷数（`infinity`）就无法再得到有穷数。换句话说，就是你可以从有穷走向无穷，但无法从无穷回到有穷。

> `Infinity`/ `Infinity` 是一个未定义操作，结果为 `NaN`。
>
> 有穷正数除以 `Infinity`，结果是 `0`。
>
> 有穷负数除以 `Infinity`，结果时 `-0`。

##### 3.零值

`JavaScript` 有一个常规的 `0`（也叫作 `+0`）和一个 `-0`。

```javascript
var a = 0 / -3; // -0
var b = 0 * -3; // -0
```

**加法和减法运算不会得到负零。**

根据规范，对负零进行字符串化会返回 `"0"`：

```javascript
var a = 0 / -3;

// 至少在某些浏览器的控制台中显示是正确的
a;                   // -0

// 但是规范定义的返回结果是这样！
a.toString();        // "0"
a + "";              // "0"
String( a );         // "0"

// JSON也如此，很奇怪
JSON.stringify( a ); // "0"
```

如果反过来将其从字符串转换为数字，得到的结果是准确的：

```javascript
+"-0";              // -0
Number( "-0" );     // -0
JSON.parse( "-0" ); // -0
```

> 注意：`JSON.stringify(-0)` 返回 `"0"`，而 `JSON.parse("-0")` 返回 `-0`。

负零的比较操作：

```javascript
var a = 0;
var b = 0 / -3;

a == b;   // true
-0 == 0;  // true

a === b;  // true
-0 === 0; // true

0 > -0;   // false
a > b;    // false
```

如何区分 `-0` 和 `0` ？

```javascript
function isNegZero(n) {
  n = Number( n );
  return (n === 0) && (1 / n === -Infinity);
}

isNegZero( -0 );     // true
isNegZero( 0 / -3 ); // true
isNegZero( 0 );      // false
```

#### 4.特殊等式

`NaN` 和 `-0` 在相等比较时的表现有些特别。由于 `NaN` 和自身不相等，所以必须使用 `ES6` 中的 `Number.isNaN(..)`（或者 `polyfill`）。而 `-0` 等于 `0`（对于 `===` 也是如此），因此我们必须使用 `isNegZero(..)` 这样的工具函数。

`ES6` 中新加入了一个工具方法 `Object.is(..)` 来判断两个值是否绝对相等，可以用来处理 上述所有的特殊情况：

```javascript
var a = 2 / "foo";
var b = -3 * 0;

Object.is( a, NaN ); // true
Object.is( b, -0 );  // true
Object.is( b, 0 );   // false
```

`ES6` 之前的版本，`Object.is(..)` 有一个简单的 `polyfill`：

```javascript
if (!Object.is) {
  Object.is = function(v1, v2) {
    // 判断是否是-0
    if (v1 === 0 && v2 === 0) {
      return 1 / v1 === 1 / v2;
    }
    // 判断是否是NaN
    if (v1 !== v1) {
      return v2 !== v2;
    }
    // 其他情况
    return v1 === v2;
  };
}
```

### 值和引用

```javascript
var a = 2;
var b = a; // b是a的值的一个复本
b++;
a; // 2
b; // 3

var c = [1,2,3];
var d = c; // d是[1,2,3]的一个引用
d.push( 4 );
c; // [1,2,3,4]
d; // [1,2,3,4]
```

简单值（即标量基本类型值）总是通过 **值复制** 的方式来赋值 / 传递，包括 `null`、`undefined`、字符串、数字、布尔和 `ES6` 中的 `symbol`。

复合值 ——对象（包括数组和封装对象）和函数，则总是通过 **引用复制** 的方式来赋值 / 传递。

引用指向的是值本身而非变量，所以一个引用无法更改另一个引用的指向。

```javascript
var a = [1,2,3];
var b = a;
a; // [1,2,3]
b; // [1,2,3]

// 然后
b = [4,5,6];
a; // [1,2,3]
b; // [4,5,6]
```

`b=[4,5,6]` 并不影响 `a` 指向值 `[1,2,3]`，除非 `b` 不是指向数组的引用，而是指向 `a` 的指针， 但在 `JavaScript` 中不存在这种情况！

函数参数经常会让人感到困惑：

```javascript
function foo(x) {
 x.push( 4 );
 x; // [1,2,3,4]
    
 // 然后
 x = [4,5,6];
 x.push( 7 );
 x; // [4,5,6,7]
}

var a = [1,2,3];
foo( a );

a; // 是[1,2,3,4]，不是[4,5,6,7]
```

向函数传递 `a` 的时候，实际是将引用 `a` 的一个复本赋值给 `x`，而 `a` 仍然指向 `[1,2,3]`。 在函数中我们可以通过引用 `x` 来更改数组的值（`push(4)` 之后变为 `[1,2,3,4]`）。但 `x = [4,5,6]` 并不影响 `a` 的指向，所以 `a` 仍然指向 `[1,2,3,4]`。

不能通过引用 `x` 来更改引用 `a` 的指向，只能更改 `a` 和 `x` 共同指向的值。

如果要将 `a` 的值变为 `[4,5,6,7]`，必须更改 `x` 指向的数组，而不是为 `x` 赋值一个新的数组。

```javascript
function foo(x) {
  x.push( 4 );
  x; // [1,2,3,4]
    
  // 然后
  x.length = 0; // 清空数组
  x.push( 4, 5, 6, 7 );
  x; // [4,5,6,7]
}

var a = [1,2,3];
foo( a );

a;  // 是[4,5,6,7]，不是[1,2,3,4]
```

> `x.length = 0` 和 `x.push(4,5,6,7)` 并没有创建一个新的数组，而是更改了当前的数组。于是 `a` 指向的值变成了 `[4,5,6,7]`。

**NOTE:** 将基本类型值封装到对应的数字封装对象中，虽然传递的是指向数字对象的引用复本，但并不能通过它来更改其中的基本类型值：

```javascript
function foo(x) {
  x = x + 1;
  x; // 3
}
var a = 2;
var b = new Number( a ); // Object(a)也一样

foo( b );
console.log( b ); // 是2，不是3
```

原因是 **基本类型值是不可更改的**（字符串和布尔也是如此）。如果一个数字对象的标量基本类型值是 `2`，那么该值就不能更改，除非创建一个包含新值的数字对象。 `x = x + 1` 中，`x` 中的标量基本类型值 `2` 从数字对象中拆封（或者提取）出来后，`x` 就神不知鬼不觉地从引用变成了数字对象，它的值为 `2 + 1` 等于 `3`。然而函数外的 `b` 仍然指向原来那个值为 `2` 的数字对象。
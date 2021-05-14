## 原生函数

常用的原生函数有：

- `String()` 
- `Number()` 
- `Boolean()` 
- `Array()` 
- `Object()` 
- `Function()` 
- `RegExp()` 
- `Date()` 
- `Error()` 
- `Symbol()`——`ES6` 中新加入的！

原生函数可以被当作构造函数来使用，但是有些注意点：

```javascript
var a = new String( "abc" );

typeof a; // 是"object"，不是"String"

a instanceof String; // true

Object.prototype.toString.call( a ); // "[object String]"
```

> `new String("abc")` 创建的是字符串 `"abc"` 的封装对象，而非基本类型值 `"abc"`。

### 内部属性 [[Class]]

所有 `typeof` 返回值为 `"object"` 的对象（如数组）都包含一个内部属性 `[[Class]]`。这个属性无法直接访问， 一般通过 `Object.prototype.toString(..)` 来查看。

```javascript
Object.prototype.toString.call( [1,2,3] );
// "[object Array]"

Object.prototype.toString.call( /regex-literal/i );
// "[object RegExp]"
```

> 数组的内部 `[[Class]]` 属性值是 `"Array"`，正则表达式的值是 `"RegExp"`。多数情况下，**对象的内部 `[[Class]]` 属性和创建该对象的内建原生构造函数相对应**。

`null` 和 `undefined` 的内部 `[[Class]]` 属性：

```javascript
Object.prototype.toString.call( null );
// "[object Null]"

Object.prototype.toString.call( undefined );
// "[object Undefined]"
```

> 虽然 `Null()` 和 `Undefined()` 这样的原生构造函数并不存在，但是内部 `[[Class]]` 属性值仍然是 `"Null"` 和 `"Undefined"`。

其他基本类型值（如字符串、数字和布尔）内部 `[[Class]]` 属性：

```javascript
Object.prototype.toString.call( "abc" );
// "[object String]"

Object.prototype.toString.call( 42 );
// "[object Number]"

Object.prototype.toString.call( true );
// "[object Boolean]"
```

> 上示例中基本类型值被 **各自的封装对象自动包装**，所以它们的内部 `[[Class]]` 属性值分别为 `"String"`、`"Number"` 和 `"Boolean"`。

### 封装对象包装

由于基本类型值没有 `.length` 和 `.toString()` 这样的属性和方法，需要通过封装对象才能访问，此时 `JavaScript` 会自动为基本类型值包装一个封装对象：

```javascript
var a = "abc";

a.length;        // 3
a.toUpperCase(); // "ABC"
```

> 一般情况下，我们不需要直接使用封装对象。最好的办法是让 `JavaScript` 引擎自己决定什么时候应该使用封装对象。

#### 封装对象释疑

`Boolean`注意点 ：

```javascript
var a = new Boolean( false );

if (!a) {
 console.log( "Oops" ); // 执行不到这里
}
```

为 `false` 创建了一个封装对象，然而该对象是真值，所以这里使用封装对象得到的结果和使用 `false` 截然相反。

如果想要自行封装基本类型值，可以使用 `Object(..)` 函数（不带 `new` 关键字）：

```javascript
var a = "abc";
var b = new String( a );
var c = Object( a );

typeof a; // "string"
typeof b; // "object"
typeof c; // "object"

b instanceof String; // true
c instanceof String; // true

Object.prototype.toString.call( b ); // "[object String]"
Object.prototype.toString.call( c ); // "[object String]"
```

### 拆封

如果想要得到封装对象中的基本类型值，可以使用 `valueOf()` 函数：

```javascript
var a = new String( "abc" );
var b = new Number( 42 );
var c = new Boolean( true );

a.valueOf(); // "abc"
b.valueOf(); // 42
c.valueOf(); // true
```

在需要用到封装对象中的基本类型值的地方会发生隐式拆封：

```javascript
var a = new String( "abc" );
var b = a + ""; // b的值为"abc"

typeof a; // "object"
typeof b; // "string"
```

### 原生函数作为构造函数

对于数组（`array`）、对象（`object`）、函数（`function`）和正则表达式，我们通常喜欢以常量的形式来创建它们。实际上，使用常量和使用构造函数的效果是一样的（创建的值都是通过封装对象来包装）。

#### 1. `Array(..)`

```javascript
var a = new Array( 1, 2, 3 );
a; // [1, 2, 3]

var b = [1, 2, 3];
b; // [1, 2, 3]
```

> 构造函数 `Array(..)` 不要求必须带 `new` 关键字。不带时，它会被自动补上。 因此 `Array(1,2,3)` 和 `new Array(1,2,3)` 的效果是一样的。

我们将包含至少一个“空单元”的数组称为 **“稀疏数组”**。

`Array` 构造函数只带一个数字参数的时候，该参数会被作为数组的预设长度（`length`），而非只充当数组中的一个元素。

```javascript
var a = new Array( 3 );
a.length; // 3
a;

var c = [];
c.length = 3;
c
```

`a` 和 `c` 均创建了 `length` 为3的"空单元"数组，`a` 在 `Chrome` 中显示为 [ `empty` x 3 ]；在 `FireFox` 中显示为 [<3 `empty slots`>]

```javascript
  var a = [,,,];
  var b = [1,,,];
  var c = [,,,2];
  var d = [1,,,2];

  console.log(a); // chrome:[empty × 3];       fireFox:[ <3 empty slots> ]
  console.log(b); // chrome:[1, empty × 2];    fireFox:[ 1, <2 empty slots> ]
  console.log(c); // chrome:[empty × 3, 2];    fireFox:[ <3 empty slots>, 2 ]
  console.log(d); // chrome:[1, empty × 2, 2]; fireFox:[ 1, <2 empty slots>, 2 ]
```

若最后一位为"空单元"，计算 `length` 属性的长度可省略最后的 `,` ， 原因是从 `ES5` 规范开始就允许在列表（数组值、属性列表等）末尾多加一个逗号（在实际处理中会被忽略不计）。

```javascript
var a = new Array(3);
var b = [undefined, undefined, undefined];

a.join( "-" ); // "--"
b.join( "-" ); // "--"

a.map(function(v,i){ return i; }); // [ empty × 3 ]
b.map(function(v,i){ return i; }); // [ 0, 1, 2 ]
```

`a.map(..)` 之所以执行失败，是因为数组中并不存在任何单元，所以 `map(..)` 无从遍历。而 `join(..)` 却不一样，它的具体实现可参考下面的代码：

```javascript
function fakeJoin(arr,connector) {
  var str = "";
  for (var i = 0; i < arr.length; i++) {
    if (i > 0) {
      str += connector;
    }
    if (arr[i] !== undefined) {
      str += arr[i];
    }
  }
  return str;
}

var a = new Array( 3 );
fakeJoin( a, "-" ); // "--"
```

`join(..)` 首先假定数组不为空，然后通过 `length` 属性值来遍历其中的元 素。而 `map(..)` 并不做这样的假定，因此结果也往往在预期之外，并可能导致失败。

可以通过下述方式来创建包含 `undefined` 单元（而非“空单元”）的数组：

```javascript
var a = Array.apply( null, { length: 3 } );
a; // [ undefined, undefined, undefined ]
```

#### 2.`Object(..)`、`Function(..)` 和 `RegExp(..)`

除非万不得已，否则尽量不要使用 `Object(..)/Function(..)/RegExp(..)`：

```javascript
var c = new Object();
c.foo = "bar";
c; // { foo: "bar" }

var d = { foo: "bar" };
d; // { foo: "bar" }

var e = new Function( "a", "return a * 2;" );
var f = function(a) { return a * 2; }
function g(a) { return a * 2; }

var h = new RegExp( "^a*b+", "g" );
var i = /^a*b+/g;
```

#### 3.`Date(..)` 和 `Error(..)`

- `Date(..)` 

  相较于其他原生构造函数，`Date(..)` 和 `Error(..)` 的用处要大很多，因为没有对应的常量 形式来作为它们的替代。

  **创建日期对象必须使用 `new Date()`**。`Date(..)` 可以带参数，用来指定日期和时间，而不带参数的话则使用当前的日期和时间。

  `ES5` 开始引入了一个更简单的方法，即静态函数 `Date.now()`。`ES5` 之前`polyfill`：

  ```javascript
  if (!Date.now) {
    Date.now = function(){
      return (new Date()).getTime();
    };
  }
  ```

- `Error(..)`

  构造函数 `Error(..)`（与前面的 `Array()` 类似）带不带 `new` 关键字都可。

#### 4.`Symbol(..)`

**`Symbol` 并非对象，而是一种简单标量基本类型。**

`Symbol` 是具有唯一性的特殊值（并非绝对），用它来命名对象属性不容易导致重名。

可以使用 `Symbol(..)` 原生构造函数来自定义符号。但它比较特殊，不能带 `new` 关键字，否则会出错：

```javascript
var mysym = Symbol( "my own symbol" );
mysym;            // Symbol(my own symbol)
mysym.toString(); // "Symbol(my own symbol)"
typeof mysym;     // "symbol"

var a = { };
a[mysym] = "foobar";

Object.getOwnPropertySymbols( a );
// [ Symbol(my own symbol) ]
```

#### 5.原生原型

原生构造函数有自己的 `.prototype` 对象，如 `Array.prototype`、`String.prototype` 等。

约定将 `String.prototype.XYZ` 简写为 `String#XYZ`

- `String#indexOf(..)`

  在字符串中找到指定子字符串的位置。

- `String#charAt(..)`

  获得字符串指定位置上的字符。

- `String#substr(..)、String#substring(..) 和 String#slice(..)`

  获得字符串的指定部分。

- `String#toUpperCase()` 和 `String#toLowerCase()`

  将字符串转换为大写或小写。

- `String#trim()`

  去掉字符串前后的空格，返回新的字符串。

**以上方法并不改变原字符串的值，而是返回一个新字符串。**

有些原生原型并非普通对象那么简单：

```javascript
typeof Function.prototype;       // "function"
Function.prototype();            // 空函数！

RegExp.prototype.toString();     // "/(?:)/"——空正则表达式
"abc".match( RegExp.prototype ); // [""]

Array.isArray( Array.prototype ); // true
Array.prototype.push( 1, 2, 3 ); // 3
Array.prototype; // [1,2,3]
// 需要将Array.prototype设置回空，否则会导致问题！
Array.prototype.length = 0;
```

> `Function.prototype` 是一个函数，`RegExp.prototype` 是一个正则表达式，而 `Array. prototype` 是一个数组。

##### 将原型作为默认值

`Function.prototype` 是一个空函数，`RegExp.prototype` 是一个“空”的正则表达式（无任何匹配），而 `Array.prototype` 是一个空数组。对未赋值的变量来说，它们是很好的默认值。

```javascript
function isThisCool(vals,fn,rx) {
  vals = vals || Array.prototype;
  fn = fn || Function.prototype;
  rx = rx || RegExp.prototype;
  return rx.test(
    vals.map( fn ).join( "" )
  );
}

isThisCool(); // true

isThisCool(
  ["a","b","c"],
  function(v){ return v.toUpperCase(); },
  /D/
);           // false
```

**好处：** `.prototype` 已被创建并且仅创建一次。 相反， 如 果 将 `[]、 function(){}` 和 `/(?:)/` 作为默认值，则每次调用 `isThisCool(..)` 时它们都会被创建一次 （具体创建与否取决于 `JavaScript` 引擎，稍后它们可能会被垃圾回收），这样无疑会造成内存和 CPU 资源的浪费。

**注意点：** 如果默认值随后会被更改，那就不要使用 `.prototype`，这样可能会导致一系列问题。
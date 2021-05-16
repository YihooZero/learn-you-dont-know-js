## 强制类型转换

### 值类型转换

`JavaScript` 中的强制类型转换总是返回标量基本类型值，如字符串、数字和布尔值，不会返回对象和函数。“封装”是为标量基本类型值封装一个相应类型的对象，但这并非严格意义上的强制类型转换。

**类型转换：隐式强制类型转换 + 显式强制类型转换**

```javascript
var a = 42;
var b = a + "";      // 隐式强制类型转换
var c = String( a ); // 显式强制类型转换
```

### 抽象值操作

#### 1.`ToString`

```javascript
// 1.07 连续乘以七个 1000
var a = 1.07 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;

// 七个1000一共21位数字
a.toString();        // "1.07e21"
String(null);        // "null"
String(undefined);   // "undefined"
String(true);        // "true"
String({});          // "[object Object]"
```

数组的默认 `toString()` 方法经过了重新定义，将所有单元字符串化以后再用 "`,`" 连接起来：

```javascript
var array = [1, 2, 3];
array.toString();   // "1,2,3"
```

##### `JSON` 字符串化

工具函数 `JSON.stringify(..)` 在将 `JSON` 对象序列化为字符串时也用到了 `ToString`。

对大多数简单值来说，`JSON` 字符串化和 `toString()` 的效果基本相同，只不过序列化的结果总是字符串：

```javascript
JSON.stringify( 42 );   // "42"
JSON.stringify( "42" ); // "\"42\"" （含有双引号的字符串）
JSON.stringify( null ); // "null"
JSON.stringify( true ); // "true"
```

所有安全的 `JSON` 值都可以使用 `JSON.stringify(..)` 字符串化。不安全的 `JSON` 值包括 **`undefined`、`function`、`symbol （ES6+）`和包含循环引用（对象之间相互引用，形成一个无限循环）的对象**。

`JSON.stringify(..)` 在对象中遇到 `undefined`、`function` 和 `symbol` 时会自动将其忽略，在数组中则会返回 `null`（以保证单元位置不变）。

```javascript
JSON.stringify( undefined );    // undefined
JSON.stringify( function(){} ); // undefined
JSON.stringify(
  [1,undefined,function(){},4]
);                              // "[1,null,null,4]"
JSON.stringify(
  { a:2, b:function(){} }
);                              // "{"a":2}"
```

如果对象中定义了 `toJSON()` 方法，`JSON` 字符串化时会首先调用该方法，然后用它的返回值来进行序列化。

如果要对含有非法 `JSON` 值的对象做字符串化，或者对象中的某些值无法被序列化时，就需要定义 `toJSON()` 方法来返回一个安全的 `JSON` 值。

```javascript
var o = { };
var a = {
  b: 42,
  c: o,
  d: function(){}
};

// 在a中创建一个循环引用
o.e = a;

// 循环引用在这里会产生错误
// JSON.stringify( a );

// 自定义的JSON序列化
a.toJSON = function() {
  // 序列化仅包含b
  return { b: this.b };
};

JSON.stringify( a ); // "{"b":42}"
```

> `toJSON()` 应该“返回一个能够被字符串化的安全的 `JSON` 值”，而不是“返回 一个 `JSON` 字符串”。

###### `JSON.stringify(..)` 有用的功能

可以向 `JSON.stringify(..)` 传递一个可选参数 `replacer`，它可以是数组或者函数，用来指定对象序列化过程中哪些属性应该被处理，哪些应该被排除，和 `toJSON()` 很像。

1. 如果 `replacer` 是一个数组，那么它必须是一个字符串数组，其中包含序列化要处理的对象的属性名称，除此之外其他的属性则被忽略。

   ```javascript
   var a = {
     b: 42,
     c: "42",
     d: [1,2,3]
   };
   
   JSON.stringify( a, ["b","c"] ); // "{"b":42,"c":"42"}"
   ```

2. 如果 `replacer` 是一个函数，它会对对象本身调用一次，然后对对象中的每个属性各调用 一次，每次传递两个参数，键和值。如果要忽略某个键就返回 `undefined`，否则返回指定的值。

   ```javascript
   var a = {
     b: 42,
     c: "42",
     d: [1,2,3]
   };
   
   JSON.stringify( a, function(k,v){
     if (k !== "c") return v;
   } );
   // "{"b":42,"d":[1,2,3]}"
   ```

`JSON.stringify` 还有一个可选参数 `space`，用来指定输出的缩进格式。

#### 2.`ToNumber`

| 原始值            | Number(...) |
| ----------------- | ----------- |
| `true`            | 1           |
| `false`           | 0           |
| `''`              | 0           |
| `null`            | 0           |
| `undefined`       | `NaN`       |
| `[]`              | 0           |
| `['1']`           | 1           |
| `{}`              | `NaN`       |
| `['abc']`         | `NaN`       |
| `['1', '2', '3']` | `NaN`       |

对象（包括数组）会首先将值转换为相应的基本类型值，其会检查该值是否有 `valueOf()` 方法。如果有并且返回基本类型值，就使用该值进行强制类型转换。如果没有就使用 `toString()` 的返回值（如果存在）来进行强制类型转换。

如果 `valueOf()` 和 `toString()` 均不返回基本类型值，会产生 `TypeError` 错误。

```javascript
var a = {
  valueOf: function(){
    return "42";
  }
};
var b = {
  toString: function(){
    return "42";
  }
};
var c = [4,2];
c.toString = function(){
  return this.join( "" ); // "42"
};

Number( a ); // 42
Number( b ); // 42
Number( c ); // 42
```

#### 3.`ToBoolean`

##### 1.假值

以下这些是假值：

- `undefined`
- `null`
- `false`
- `+0`、`-0` 和 `NaN`
- `""`

[JavaScript语言精粹](https://github.com/YihooZero/learn-javascript-the-good-parts/tree/main/charpter02) 也有相同归纳！

##### 2.假值对象

```javascript
var a = new Boolean( false );
var b = new Number( 0 );
var c = new String( "" );

var d = Boolean( a && b && c );
d; // true

var e = a && b && c;
e === c // true
```

`d` 为 `true`，说明 `a、b、c` 都为 `true`。若 `Boolean(..)` 不对 `a && b && c` 进行封装，运算符得到的结果就是 `c` 对象。

##### 3.真值

真值就是假值列表之外的值。

```javascript
var a = "false";
var b = "0";
var c = "''";

var d = Boolean( a && b && c );
d; // true;
```

**除 `""` 外，其他的字符串均为真值。**

```javascript
var a = [];           // 空数组——是真值还是假值？
var b = {};           // 空对象——是真值还是假值？
var c = function(){}; // 空函数——是真值还是假值？

var d = Boolean( a && b && c );
d; // true;
```

### 显式强制类型转换

#### 1.字符串和数字之间的显式转换

字符串和数字之间的转换是通过 `String(..)` 和 `Number(..)` 这两个内建函数（原生构造函数）来实现的，请注意它们前面没有 `new` 关键字，并不创建封装对象。

```javascript
var a = 42;
var b = String( a );

var c = "3.14";
var d = Number( c );

b; // "42"
d; // 3.14
```

也可以通过 `.toString()` 和 `+` （运算符的一元形式）来进行转换。

```javascript
var a = 42;
var b = a.toString();

var c = "3.14";
var d = +c;

b; // "42"
d; // 3.14
```

> `toString()` 涉及隐式转换。因为 `toString()` 对 `42` 这样的基本类型值不适用，所以 `JavaScript` 引擎会自动为 `42` 创建一个封装对象，然后对该对象调用 `toString()`。

##### 日期显式转换为数字

一元运算符 `+` 的另一个常见用途是将日期（`Date`）对象强制类型转换为数字，返回结果为 `Unix` 时间戳，以毫秒为单位（从 1970 年 1 月 1 日 `00:00:00 UTC` 到当前时间）：

经常用下面的方法来获得当前的时间戳，例如：

```javascript
var timestamp = +new Date();
```

更加显示的方法将日期对象转换为时间戳方法：

```javascript
var timestamp = new Date().getTime();
// var timestamp = (new Date()).getTime();
// var timestamp = (new Date).getTime();
```

`ES5` 中新加入的静态方法 `Date.now()`：

```javascript
var timestamp = Date.now();
```

老版本浏览器 `Date.now()` 的 `polyfill`：

```javascript
if (!Date.now) {
  Date.now = function() {
    return +new Date();
  };
}
```

##### 奇特的 ~ 运算符

`~x` 大致等同于 `-(x+1)`。

```javascript
~42; // -(42+1) ==> -43
```

在 `-(x+1)` 中唯一能够得到 `0`（或者严格说是 `-0`）的 `x` 值是 `-1`。也就是说如果 `x` 为 `-1` 时，`~` 和一些数字值在一起会返回假值 `0`，其他情况则返回真值。

`~` 和 `indexOf()` 一起可以将结果强制类型转换（实际上仅仅是转换）为真 / 假值：

```javascript
var a = "Hello World";

~a.indexOf( "lo" );         // -4 <-- 真值!

if (~a.indexOf( "lo" )) {   // true
 // 找到匹配！
}

~a.indexOf( "ol" );         // 0 <-- 假值!
!~a.indexOf( "ol" );        // true

if (!~a.indexOf( "ol" )) {  // true
 // 没有找到匹配！
}
```

> 如果 `indexOf(..)` 返回 `-1`，`~` 将其转换为假值 `0`，其他情况一律转换为真值。

##### 字位截除

`~~` 可以用来截除数字值的小数部分。`x | 0` 也能达到同样的效果。

```javascript
Math.floor( -49.6 ); // -50
~~-49.6;             // -49
-49.6 | 0;           // -49

~~49.6;              // 49
49.6 | 0;            // 49
```

#### 2.显式解析数字字符串

解析允许字符串中含有非数字字符，解析按从左到右的顺序，如果遇到非数字字符就停止。而转换不允许出现非数字字符，否则会失败并返回 `NaN`。

```javascript
var a = "42";
var b = "42px";

Number( a );    // 42
parseInt( a );  // 42

Number( b );    // NaN
parseInt( b );  // 42

Number('a1');   // NaN
parseInt('a1'); // NaN
```

##### 解析非字符串

`parseInt` 非常规使用：

```javascript
parseInt( new String( "42") );   // 42

var a = {
  num: 21,
  toString: function() { return String( this.num * 2 ); }
};
parseInt( a );  // 42
```

```javascript
parseInt( 1/0, 19 ); // 18
```

如何理解这段代码：`parseInt(..)` 先将参数强制类型转换为字符串再进行解析，`1/0`被解析为字符串`"Infinity"`，再回到基数 `19`，它的有效数字字符范围是 `0-9` 和 `a-i`。

`parseInt(1/0, 19)` 实际上是 `parseInt("Infinity", 19)`。第一个字符是 "`I`"，以 `19` 为基数时值为 `18`。第二个字符 "`n`" 不是一个有效的数字字符，解析到此为止。

此外还有一些看起来奇怪但实际上解释得通的例子：

```javascript
parseInt( 0.000008 );     // 0 ("0" 来自于 "0.000008")
parseInt( 0.0000008 );    // 8 ("8" 来自于 "8e-7")
parseInt( false, 16 );    // 250 ("fa" 来自于 "false")
parseInt( parseInt, 16 ); // 15 ("f" 来自于 "function..")

parseInt( "0x10" );   // 16
parseInt( "103", 2 ); // 2
```

#### 3.显式转换为布尔值

`Boolean(..)`（不带 `new`）是显式的 `ToBoolean` 强制类型转换。

显式强制类型转换为布尔值最常用的方法是 `!!`。

### 隐式强制类型转换

隐式强制类型转换的作用是减少冗余，让代码更简洁。

#### 1.字符串和数字之间的隐式强制类型转换

`+` 运算符即能用于数字加法，也能用于字符串拼接。

```javascript
var a = "42";
var b = "0";

var c = 42;
var d = 0;

a + b; // "420"
c + d; // 42
```

```javascript
var a = [1,2];
var b = [3,4];

a + b; // "1,23,4"
```

为了将值转换为相应的基本类型值，抽象操作 `ToPrimitive`会首先 （通过内部操作 `DefaultValue`）检查该值是否有 `valueOf()` 方法。 如果有并且返回基本类型值，就使用该值进行强制类型转换。如果没有就使用 `toString()` 的返回值（如果存在）来进行强制类型转换。

> 如果某个操作数是字符串或者能够通过以下步骤转换为字符串的话，`+` 将进行拼接操作。如果其中一个操作数是对象（包括数组），则首先对其调用 `ToPrimitive` 抽象操作，该抽象操作再调用 `[[DefaultValue]]`，以数字作为上下文。
>
> 因为数组的 `valueOf()` 操作无法得到简单基本类型值，于是它转而调用 `toString()`。因此上例中的两个数组变成了 `"1,2"` 和 `"3,4"`。`+` 将它们拼接后返回 `"1,23,4"`。

可以将数字和空字符串 `""` 相 `+` 来将其转换为字符串：

```javascript
var a = 42;
var b = a + "";

b; // "42"
```

**`a + ""`（隐式）和前面的 `String(a)`（显式）之间有一个细微的差别** ：`a + ""` 会对 `a` 调用 `valueOf()` 方法，然后通过 `ToString` 抽象操作将返回值转换为字符串。而 `String(a)` 则是直接调用 `ToString()`。

```javascript
var a = {
 valueOf: function() { return 42; },
 toString: function() { return 4; }
};

a + "";      // "42"

String( a ); // "4"
```

从字符串强制类型转换为数字：

```javascript
var a = "3.14";
var b = a - 0;

b; // 3.14
```

`-` 是数字减法运算符，因此 `a - 0` 会将 `a` 强制类型转换为数字。也可以使用 `a * 1` 和 `a / 1`，因为这两个运算符也只适用于数字。

```javascript
var a = [3];
var b = [1];

a - b; // 2

var c = [3, 1];
var d = [1];

c - d; // NaN
```

为了执行减法运算，`a` 和 `b` 都需要被转换为数字，它们首先被转换为字符串（通过 `toString()`），然后再转换为数字。

#### 2.布尔值到数字的隐式强制类型转换

在将某些复杂的布尔逻辑转换为数字加法的时候，隐式强制类型转换能派上大用场。

```javascript
function onlyOne(a,b,c) {
  return !!((a && !b && !c) ||
    (!a && b && !c) || (!a && !b && c));
}

var a = true;
var b = false;

onlyOne( a, b, b ); // true
onlyOne( b, a, b ); // true
onlyOne( a, b, a ); // false
```

如果其中有且仅有一个参数为 `true`，则 `onlyOne(..)` 返回 `true`。但如果有多个参数时（`4` 个、`5` 个，甚至 `20` 个），用上面的代码就很难处理了。这时就可以使用从布尔值到数字（`0` 或 `1`）的强制类型转换：

```javascript
function onlyOne() {
  var sum = 0;
  for (var i=0; i < arguments.length; i++) {
    // 跳过假值，和处理0一样，但是避免了NaN
    if (arguments[i]) {
      sum += arguments[i];
    }
  }
  return sum == 1;
}

var a = true;
var b = false;

onlyOne( b, a );             // true
onlyOne( b, a, b, b, b );    // true
onlyOne( b, b );             // false
onlyOne( b, a, b, b, b, a ); // false
```

通过 `sum += arguments[i]` 中的隐式强制类型转换，将真值（`true/truthy`）转换为 `1` 并进行累加。如果有且仅有一个参数为 `true`，则结果为 `1`；否则不等于 `1`，`sum == 1` 条件不成立。

同样的功能也可以通过显式强制类型转换来实现：

```javascript
function onlyOne() {
  var sum = 0;
  for (var i=0; i < arguments.length; i++) {
    sum += Number( !!arguments[i] );
  }
  return sum === 1;
}
```

`!!arguments[i]` 首先将参数转换为 `true` 或 `false`。因此非布尔值参数在这里也是可以的， 比如：`onlyOne("42", 0)`（否则的话，字符串会执行拼接操作，这样结果就不对了）。转换为布尔值以后，再通过 `Number(..)` 显式强制类型转换为 `0` 或 `1`。

#### 3.隐式强制类型转换为布尔值

下面的情况会发生布尔值隐式强制类型转换:

- `if (..)` 语句中的条件判断表达式。
- `for ( .. ; .. ; .. )` 语句中的条件判断表达式（第二个）。
- `while (..)` 和 `do..while(..)` 循环中的条件判断表达式。
- `? :` 中的条件判断表达式。
- 逻辑运算符 `||`（逻辑或）和 `&&`（逻辑与）左边的操作数（作为条件判断表达式）。

#### 4.|| 和 &&

`&&` 和 `||` 运算符的返回值并不一定是布尔类型，而是两个操作数**其中一个的值**。

```javascript
var a = 42;
var b = "abc";
var c = null;

a || b; // 42
a && b; // "abc"

c || b; // "abc"
c && b; // null
```

换一个角度理解：

```javascript
a || b;
// 大致相当于(roughly equivalent to):
a ? a : b;

a && b;
// 大致相当于(roughly equivalent to):
a ? b : a;
```

#### 5.符号的强制类型转换

`ES6` 允许从符号(`Symbol`)到字符串的显式强制类型转换，然而隐式强制类型转换会产生错误：

```javascript
var s1 = Symbol( "cool" );
String( s1 ); // "Symbol(cool)"

var s2 = Symbol( "not cool" );
s2 + ""; // TypeError
```

符号不能够被强制类型转换为数字（显式和隐式都会产生错误），但可以被强制类型转换为布尔值（显式和隐式结果都是 true）。

### 宽松相等和严格相等

宽松相等（loose equals）`==` 和严格相等（strict equals）`===` 都用来判断两个值是否“相等”。

`==` 允许在相等比较中进行强制类型转换，而 `===` 不允许。

#### 1.相等比较操作的性能

如果两个值的类型不同，我们就需要考虑有没有强制类型转换的必要，有就用 `==`，没有就用 `===`，不用在乎性能。

#### 2.抽象相等

如果两个值的类型相同，就仅比较它们是否相等。例如，`42` 等于 `42`，`"abc"` 等于 `"abc"`。

**有几个非常规的情况需要注意：**

- `NaN` 不等于 `NaN`
- `+0` 等于 `-0`

`==` 在比较两个不同类型的值时会发生 **隐式** 强制类型转换，会将其中之一或两者都转换为相同的类型后再进行比较。

##### 字符串和数字之间的相等比较

```javascript
var a = 42;
var b = "42";

a === b; // false
a == b;  // true
```

因为没有强制类型转换，所以 `a === b` 为 `false`，`42` 和 `"42"` 不相等。

而 `a == b` 是宽松相等，即如果两个值的类型不同，则对其中之一或两者都进行强制类型转换。

具体怎么转换？是 `a` 从 `42` 转换为字符串，还是 `b` 从 `"42"` 转换为数字？`ES5` 规范定义如下：

(1) 如果 `Type(x)` 是数字，`Type(y)` 是字符串，则返回 `x == ToNumber(y)` 的结果。

(2) 如果 `Type(x)` 是字符串，`Type(y)` 是数字，则返回 `ToNumber(x) == y` 的结果。

##### 其他类型和布尔类型之间的相等比较

```javascript
var a = "42";
var b = true;

a == b; // false
```

`ES5` 规范定义如下：

(1) 如果 `Type(x)` 是布尔类型，则返回 `ToNumber(x) == y` 的结果；

(2) 如果 `Type(y)` 是布尔类型，则返回 `x == ToNumber(y)` 的结果。

##### null 和 undefined 之间的相等比较

`null` 和 `undefined` 之间的 `==` 也涉及隐式强制类型转换。`ES5` 规范规定：

(1) 如果 `x` 为 `null`，`y` 为 `undefined`，则结果为 `true`。

(2) 如果 `x` 为 `undefined`，`y` 为 `null`，则结果为 `true`。

在 `==` 中 `null` 和 `undefined` 相等（它们也与其自身相等），除此之外其他值都不存在这种情况。

在 `==` 中 `null` 和 `undefined` 是一回事，可以相互进行隐式强制类型转换：

```javascript
var a = null;
var b;

a == b;    // true
a == null; // true
b == null; // true

a == false; // false
b == false; // false
a == "";    // false
b == "";    // false
a == 0;     // false
b == 0;     // false
```

##### 对象和非对象之间的相等比较

对象（对象 / 函数 / 数组）和标量基本类型（字符串 / 数字 / 布尔值）之间的相等比较，`ES5` 规范做如下规定：

(1) 如果 `Type(x)` 是字符串或数字，`Type(y)` 是对象，则返回 `x == ToPrimitive(y)` 的结果；

(2) 如果 `Type(x)` 是对象，`Type(y)` 是字符串或数字，则返回 `ToPrimitive(x) == y` 的结果。

```javascript
var a = 42;
var b = [ 42 ];

a == b; // true
```

`[ 42 ]` 首先调用 `ToPrimitive` 抽象操作，返回 `"42"`，变成 `"42" == 42`，然后又变成 `42 == 42`，最后二者相等。

“拆封”即“打开”封装对象（如 `new String("abc")`），返回其中的基本数据类型值（`"abc"`）。`==` 中的 `ToPrimitive` 强制类型转换也会发生这样的情况：

```javascript
var a = "abc";
var b = Object( a ); // 和new String( a )一样

a === b;             // false
a == b;              // true
```

`a == b` 结果为 `true`，因为 `b` 通过 `ToPrimitive` 进行强制类型转换（也称为“拆封”），并返回标量基本类型值 `"abc"`，与 `a` 相等。

但有一些值不这样，原因是 `==` 算法中其他优先级更高的规则。例如：

```javascript
var a = null;
var b = Object( a ); // 和Object()一样
a == b;              // false

var c = undefined;
var d = Object( c ); // 和Object()一样
c == d;              // false

var e = NaN;
var f = Object( e ); // 和new Number( e )一样
e == f;              // false
```

因为没有对应的封装对象，所以 `null` 和 `undefined` 不能够被封装，`Object(null)` 和 `Object()` 均返回一个常规对象。

`NaN` 能够被封装为数字封装对象，但拆封之后 `NaN == NaN` 返回 `false`，因为 `NaN` 不等于 `NaN` 。

#### 3.比较少见的情况

##### 返回其他数字

```javascript
Number.prototype.valueOf = function() {
  return 3;
};

new Number( 2 ) == 3; // true
```

`2 == 3` 不会有这种问题，因为 `2` 和 `3` 都是数字基本类型值，不会调用 `Number.prototype.valueOf()` 方法。而 `Number(2)` 涉及 `ToPrimitive` 强制类型转换，因此会调用 `valueOf()`。

```javascript
var i = 2;

Number.prototype.valueOf = function() {
  return i++;
};

var a = new Number( 42 );
if (a == 2 && a == 3) {
  console.log( "Yep, this happened." );
}
```

如果让 `a.valueOf()` 每次调用都产生副作用，比如第一次返回 `2`，第二次返回 `3`，就会出现这种不可思议的情况。

##### 假值的相等比较

```javascript
"0" == null;        // false
"0" == undefined;   // false
"0" == false;       // true -- 晕！
"0" == NaN;         // false
"0" == 0;           // true
"0" == "";          // false

false == null;      // false
false == undefined; // false
false == NaN;       // false
false == 0;         // true -- 晕！
false == "";        // true -- 晕！
false == [];        // true -- 晕！
false == {};        // false

"" == null;         // false
"" == undefined;    // false
"" == NaN;          // false
"" == 0;            // true -- 晕！
"" == [];           // true -- 晕！
"" == {};           // false

0 == null;          // false
0 == undefined;     // false
0 == NaN;           // false
0 == [];            // true -- 晕！
0 == {};            // false
```

##### 极端情况

```javascript
[] == ![] // true
```

根据 `ToBoolean` 规则，它会进行布尔值的显式强制类型转换（同时反转奇偶校验位）。所以 `[] == ![]` 变成了 `[] == false`。前面我们讲过 `false == []`，最后的结果就顺理成章了。

```javascript
2 == [2];     // true
"" == [null]; // true
```

`==` 右边的值 `[2]` 和 `[null]` 会进行 `ToPrimitive` 强制类型转换， 以便能够和左边的基本类型值（`2` 和 `""`）进行比较。因为数组的 `valueOf()` 返回数组本身， 所以强制类型转换过程中数组会进行字符串化。

第一行中的 `[2]` 会转换为 `"2"`，然后通过 `ToNumber` 转换为 `2`。第二行中的 `[null]` 会直接转换为 `""`。 所以最后的结果就是 `2 == 2` 和 `"" == ""`。

```javascript
42 == "43";         // false
"foo" == 42;        // false
"true" == true;     // false

42 == "42";         // true
"foo" == [ "foo" ]; // true
```

##### 安全运用隐式强制类型转换

以下两个原则可以让我们在运用 `==` 时有效地避免出错:

- 如果两边的值中有 `true` 或者 `false`，千万不要使用 `==`。
- 如果两边的值中有 `[]`、`""` 或者 `0`，尽量不要使用 `==`。

有一种情况下强制类型转换是绝对安全的，那就是 `typeof` 操作。`typeof` 总是返回七个字符串之一，其中没有空字符串。所以在类型检查过程中不会发生隐式强制类型转换。`typeof x == "function"` 是 `100%` 安全的，和 `typeof x === "function"` 一样。事实上两者在规范中是一回事。

[**`JavaScript` 中的相等比较图**](https://dorey.github.io/JavaScript-Equality-Table/unified/)

### 抽象关系比较

`ES5` 规范节定义了“抽象关系比较”，分为两个部分：比较双方都是字符串（后半部分）和其他情况（前半部分）。

比较双方首先调用 `ToPrimitive`，如果结果出现非字符串，就根据 `ToNumber` 规则将双方强制类型转换为数字来进行比较：

```javascript
var a = [ 42 ];
var b = [ "43" ];

a < b; // true
b < a; // false
```

如果比较双方都是字符串，则按字母顺序来进行比较：

```javascript
var a = [ "42" ];
var b = [ "043" ];

a < b; // false
```

`a` 和 `b` 并没有被转换为数字，因为 `ToPrimitive` 返回的是字符串，所以这里比较的是 `"42"` 和 `"043"` 两个字符串，它们分别以 `"4"` 和 `"0"` 开头。因为 `"0"` 在字母顺序上小于 `"4"`，所以 最后结果为 `false`。

同理：

```javascript
var a = [ 4, 2 ];
var b = [ 0, 4, 3 ];

a < b; // false
```

`a` 转换为 `"4, 2"`，`b` 转换为 `"0, 4, 3"`，同样是按字母顺序进行比较。

**奇怪的例子**：

```javascript
var a = { b: 42 };
var b = { b: 43 };

a < b;  // false
a == b; // false
a > b;  // false

a <= b; // true
a >= b; // true
```

因为根据规范 `a <= b` 被处理为 `b < a`，然后将结果反转。因为 `b < a` 的结果是 `false`，所以 `a <= b` 的结果是 `true`。

这可能与我们设想的大相径庭，即 `<=` 应该是“小于或者等于”。实际上 `JavaScript` 中 `<=` 是 “不大于”的意思（即 `!(a > b)`，处理为 `!(b < a)`）。同理，`a >= b` 处理为 `!(b <= a)`。
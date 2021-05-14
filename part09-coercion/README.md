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

##### 1. 假值

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

`d` 为 `true`，说明 `a、b、c` 都为 `true`。若 `Boolean(..)` 不对 a && b && c 进行封装，运算符得到的结果就是 `c` 对象。

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


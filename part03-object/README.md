## 对象

### 语法

对象可以通过两种形式定义：声明（文字）形式和构造形式。

```javascript
// 声明形式
var myObj = {
  key: value
  // ...
};
// 构造形式
var myObj = new Object();
myObj.key = value;
```

### 类型

在`JavaScript`中一共有七种主要类型（`Symbol`是`ES6`一种新加的类型）

- `string`
- `number`
- `boolean`
- `null`
- `undefined`
- `object`
- `Symbol`

简单基本类型：`string`、`boolean`、`number`、`null` 、`undefined` 和 `Symbol`

### 内置对象

`JavaScript` 中还有一些对象子类型，通常被称为内置对象

- `String`
- `Number`
- `Boolean`
- `Object`
- `Function`
- `Array`
- `Date`
- `RegExp`
- `Error`

原始值 `"I am a string"` 并不是一个对象，它只是一个字面量，并且是一个不可变的值。 如果要在这个字面量上执行一些操作，比如获取长度、访问其中某个字符等，那需要将其转换为 `String` 对象。

幸好，在必要时语言会自动把字符串字面量转换成一个 `String` 对象，也就是说你并不需要显式创建一个对象。

```javascript
var strPrimitive = "I am a string";
console.log( strPrimitive.length ); // 13
console.log( strPrimitive.charAt( 3 ) ); // "m"
```

使用以上两种方法，我们都可以直接在字符串字面量上访问属性或者方法，之所以可以这样做，是因为引擎自动把字面量转换成 `String` 对象，所以可以访问属性和方法。对于数值字面量和布尔字面量也是如此。

`null` 和 `undefined` 没有对应的构造形式，它们只有文字形式。相反，`Date`只有构造，没有文字形式。

对于 `Object`、`Array`、`Function` 和 `RegExp`（正则表达式）来说，无论使用文字形式还是构造形式，它们都是对象，不是字面量。

### 内容

```javascript
var myObject = {
  a: 2
};
myObject.a; // 2
myObject["a"]; // 2
```

`.a` 语法通 常被称为“属性访问”，`["a"]` 语法通常被称为“键访问”

区别：`.` 操作符要求属性名满足标识符的命名规范，而 `[".."]` 语法 可以接受任意 `UTF-8/Unicode` 字符串作为属性名。如果要引用名称为 `"Super-Fun!"` 的属性，那就必须使用 `["Super-Fun!"]` 语法访问，因为 `Super-Fun!` 并不是一个有效 的标识符属性名。

在对象中，属性名永远都是字符串。如果你使用 `string`（字面量）以外的其他值作为属性名，那它首先会被转换为一个字符串。

```javascript
var myObject = { };
myObject[true] = "foo";
myObject[3] = "bar";
myObject[myObject] = "baz";

myObject["true"]; // "foo"
myObject["3"]; // "bar"
myObject["[object Object]"]; // "baz"
```


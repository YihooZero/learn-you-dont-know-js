## 语法

```javascript
function foo(x = 11, y = 31) {
  console.log( x + y );
}

foo();               // 42
foo( 5, 6 );         // 11
foo( 0, 42 );        // 42

foo( 5 );            // 36
foo( 5, undefined ); // 36 <-- 丢了undefined
foo( 5, null );      // 5 <-- null被强制转换为0

foo( undefined, 6 ); // 17 <-- 丢了undefined
foo( null, 6 );      // 6 <-- null被强制转换为0
```

**`undefined` 意味着缺失。也就是说，`undefined` 和缺失是无法区别的，至少对于函数参数来说是如此。`null` 被强制转换为 `0` 。**

### 默认参数值

#### 默认值表达式

```javascript
var w = 1, z = 2;

function foo( x = w + 1, y = x + 1, z = z + 1 ) {
  console.log( x, y, z );
}

foo(); // ReferenceError
```

> `w + 1` 默认值表达式中的 `w` 在形式参数列表作用域中寻找 `w`，但是没有找到，所以就使用外层作用域的 `w`。接下来，`x + 1` 默认值表达式中的 `x` 找到了形式参数作用域中的 `x`，很幸运这里 `x` 已经初始化了，所以对 `y` 的赋值可以正常工作。
>
>  但是，`z + 1` 中的 `z` 发现 `z` 是一个此刻还没初始化的参数变量，所以它永远不会试图从外层作用域寻找 `z`。

有一个不为人知但是很有用的技巧可以使用：**`Function.prototype` 本身就是一个没有操作的空函数**。

### 解构

解构一般是指 **将值从数组`Array`或属性从对象`Object`提取到不同的变量中** ，当解构其他类型时，也是先将其他类型值转换为`Array`或者`Object`

```javascript
const [a, b, c] = 'hello'
// a = 'h', b = 'e', c = 'l'
  
const {toString: d} = true
console.log(d === Boolean.prototype.toString) // true
```

**默认值赋值**

```javascript
var {a = 1, b = 2} = {}
// a = 1, b = 2

var {a = 1, b = 2} = {a: 'hello'}
// a = 'hello', b = 2
```

**解构默认值＋参数默认值**

```javascript
function f6({ x = 10 } = {}, { y } = { y: 10 }) {
  console.log( x, y );
}

f6();                       // 10 10
f6( undefined, undefined ); // 10 10
f6( {}, undefined );        // 10 10

f6( {}, {} );              // 10 undefined
f6( undefined, {} );       // 10 undefined

f6( { x: 2 }, { y: 3 } );  // 2 3
```

比较一下 `{ y } = { y: 10 }` 和 `{ x = 10 } = {}`:

对于 `x` 这种形式的用法来说，如果第一个函数参数省略或者是 `undefined`，就会应用 `{}` 空对象默认值。然后，在第一个参数位置传入的任何值——或者是默认 `{}` 或者是你传入的任何值——都使用 `{ x = 10 }` 来解构，这会检查是否有 `x` 属性，如果没有（或者 `undefined`)，就会为名为 `x` 的参数应用默认值 10。

**嵌套默认：解构并重组**

```javascript
var defaults = {
  options: {
    remove: true,
    enable: false,
    instance: {}
  },
  log: {
    warn: true,
    error: true
  }
};
```

假设你有一个名为 `config` 的对象，已经有了一部分值，但可能不是全部，现在你想要把所有空槽的位置用默认值设定，但又不想覆盖已经存在的部分：

```javascript
var config = {
  options: {
    remove: false,
    instance: null
  }
};
```

一般手工实现：

```javascript
config.options = config.options || {};
config.options.remove = (config.options.remove !== undefined) ?
  config.options.remove : defaults.options.remove;
config.options.enable = (config.options.enable !== undefined) ?
  config.options.enable : defaults.options.enable;
...
```

带默认值的 `ES6` 对象解构能够帮助实现这一点：

```javascript
config.options = config.options || {};
config.log = config.log || {};

({
  options: {
    remove: config.options.remove = defaults.options.remove,
    enable: config.options.enable = defaults.options.enable,
    instance: config.options.instance = defaults.options.instance
  } = {},
  log: {
    warn: config.log.warn = defaults.log.warn,
    error: config.log.error = defaults.log.error
  } = {}
} = config);
```

另外一种实现方式：

```javascript
// 把defaults合并进config
{
  // (带默认值赋值的)解构
  let {
    options: {
      remove = defaults.options.remove,
      enable = defaults.options.enable,
      instance = defaults.options.instance
    } = {},
    log: {
      warn = defaults.log.warn,
      error = defaults.log.error
    } = {}
  } = config;
  // 重组
  config = {
    options: { remove, enable, instance },
    log: { warn, error }
  };
}
```

**模板字面量**

```javascript
function tag(strings, ...values) {
  return strings.reduce( function(s,v,idx){
    return s + (idx > 0 ? values[idx-1] : "") + v;
  }, "" );
}

var desc = "awesome";

var text = tag`Everything is ${desc}!`;

console.log( text ); // Everything is awesome!
```

高阶用法:

```javascript
function dollabillsyall(strings, ...values) {
  return strings.reduce(function (s, v, idx) {
    if (idx > 0) {
      if (typeof values[idx - 1] == "number") {
        // 看，这里也使用了插入字符串字面量！
        s += `$${values[idx - 1].toFixed(2)}`;
      } else {
        s += values[idx - 1];
      }
    }
    return s + v;
  }, "");
}

var amt1 = 11.99,
    amt2 = amt1 * 1.08,
    name = "Kyle";

var text = dollabillsyall
  `Thanks for your purchase, ${name}! Your
  product cost was ${amt1}, which with tax
  comes out to ${amt2}.`

console.log(text);
// Thanks for your purchase, Kyle! Your
// product cost was $11.99, which with tax
// comes out to $12.95.
```

通过 `.raw` 属性访问原始字符串值：

```javascript
function showraw(strings, ...values) {
  console.log( strings );
  console.log( strings.raw );
} 

showraw`Hello\nWorld`;
// [ "Hello
// World" ]
// [ "Hello\nWorld" ]
```

`ES6` 提供了一个内建函数可以用作字符串字面量标签：`String.raw(..)`。它就是传出 `strings` 的原始版本：

```javascript
console.log( `Hello\nWorld` );
// Hello
// World

console.log( String.raw`Hello\nWorld` );
// Hello\nWorld 

String.raw`Hello\nWorld`.length;
// 12
```


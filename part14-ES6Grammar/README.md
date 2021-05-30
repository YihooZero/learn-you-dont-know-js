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

有一个不为人知但是很有用的技巧可以使用：**`Function. prototype` 本身就是一个没有操作的空函数**。

### 解构

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

{
  options: {
    remove: config.options.remove = default.options.remove,
    enable: config.options.enable = default.options.enable,
    instance: config.options.instance =
    default.options.instance
  } = {},
  log: {
    warn: config.log.warn = default.log.warn,
    error: config.log.error = default.log.error
  } = {}
} = config;
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
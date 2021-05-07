# THIS

## 1. THIS是什么

`this` 是在运行时进行绑定的，并不是在编写时绑定，它的上下文取决于函数调用时的各种条件。`this` 的绑定和函数声明的位置没有任何关系，只取决于函数的调用方式

当一个函数被调用时，会创建一个活动记录（有时候也称为执行上下文）。这个记录会包含函数在哪里被调用（调用栈）、函数的调用方法、传入的参数等信息。`this` 就是记录的其中一个属性，会在函数执行的过程中用到。

**`this` 实际上是在函数被调用时发生的绑定，它指向什么完全取决于函数在哪里被调用。**

## 2. 绑定规则

### 默认绑定

最常用的函数调用类型：独立函数调用。可以把这条规则看作是无法应用其他规则时的默认规则。

```javascript
function foo() {
  console.log( this.a );
}
var a = 2;
foo(); // 2

// 如果使用严格模式（strict mode），那么全局对象将无法使用默认绑定，因此 this 会绑定到 undefined
function foo() {
  "use strict";
  console.log( this.a );
}
var a = 2;
foo(); // TypeError: Cannot read property 'a' of undefined

function foo() {
  console.log( this.a );
}
var a = 2;
(function(){
  "use strict";
  foo(); // 2
})();
// 虽然 this 的绑定规则完全取决于调用位置，但是只有 foo() 运行在非 strict mode 下时，默认绑定才能绑定到全局对象；严格模式与 foo()的调用位置无关
```

到当调用 `foo()` 时，`this.a` 被解析成了全局变量 `a`。为什么？因为在本例中，函数调用时应用了 `this` 的`默认绑定`，因此 this 指向全局对象。

怎么知道这里应用了默认绑定呢？可以通过分析调用位置来看看 `foo()` 是如何调用的。在代码中，`foo()` 是直接使用不带任何修饰的函数引用进行调用的，因此只能使用`默认绑定`，无法应用其他规则。

### 隐式绑定

调用位置是否有上下文对象，或者说是否被某个对象拥有或者包含。当函数引用有上下文对象时，隐式绑定规则会把函数调用中的 `this` 绑定到这个上下文对象

**对象属性引用链中只有最顶层或者说最后一层会影响调用位置，代码如下：**

```javascript
function foo() {
  console.log( this.a );
}
var obj2 = {
  a: 42,
  foo: foo
};
var obj1 = {
  a: 2,
  obj2: obj2
};
obj1.obj2.foo(); // 42
```

#### 隐式丢失

一个最常见的 `this` 绑定问题就是被隐式绑定的函数会丢失绑定对象，也就是说它会应用默认绑定，从而把 `this` 绑定到全局对象或者 `undefined` 上，取决于是否是严格模式

```javascript
function foo() {
  console.log( this.a );
}
var obj = {
  a: 2,
  foo: foo
};
var bar = obj.foo;      // 函数别名！
var a = "oops, global"; // a 是全局对象的属性
bar();                  // "oops, global"
```

虽然 `bar` 是 `obj.foo` 的一个引用，但是实际上，它引用的是 `foo` 函数本身，因此此时的 `bar()` 其实是一个不带任何修饰的函数调用，因此应用了默认绑定

------

```javascript
function foo() {
  console.log( this.a );
}
function doFoo(fn) {
  // fn 其实引用的是 foo
  fn(); // <-- 调用位置！
}
var obj = {
  a: 2,
  foo: foo
};
var a = "oops, global"; // a 是全局对象的属性
doFoo( obj.foo );       // "oops, global"

```

参数传递其实就是一种隐式赋值，因此我们传入函数时也会被隐式赋值，所以结果和上一个例子一样

------

```javascript
function foo() {
  console.log( this.a );
}
var obj = {
  a: 2,
  foo: foo
};
var a = "oops, global";     // a 是全局对象的属性
setTimeout( obj.foo, 100 ); // "oops, global"
```

`JavaScript` 环境中内置的 `setTimeout()` 函数实现和下面的伪代码类似：

```javascript
function setTimeout(fn,delay) {
  // 等待 delay 毫秒
  fn(); // <-- 调用位置！
}
```

回调函数丢失 `this` 绑定是非常常见的

### 显式绑定

通过`call(..)` 或者 `apply(..)`方法。第一个参数是一个对象，在调用函数时将这个对象绑定到`this`。因为直接指定`this`的绑定对象，称之为显示绑定。

```javascript
function foo() {
  console.log( this.a );
}
var obj = {
  a:2
};
foo.call( obj ); // 2
```

如果你传入了一个原始值（字符串类型、布尔类型或者数字类型）来当作 `this` 的绑定对 象，这个原始值会被转换成它的对象形式（也就是 `new String(..)`、`new Boolean(..)` 或者 `new Number(..)`）。这通常被称为**“装箱”**

#### 显式绑定仍然无法解决丢失绑定问题，如下方案可以解决

##### 1.硬绑定

```javascript
function foo() {
  console.log( this.a );
}
var obj = {
  a:2
};
var bar = function() {
  foo.call( obj );
};
bar();                  // 2
setTimeout( bar, 100 ); // 2
// 硬绑定的 bar 不可能再修改它的 this
bar.call( window );     // 2
```

创建函数 `bar()`，并在它的内部手动调用 了 `foo.call(obj)`，因此强制把 `foo` 的 `this` 绑定到了 `obj`。无论之后如何调用函数 `bar`，它总会手动在 `obj` 上调用 `foo`

------

硬绑定的典型应用场景就是创建一个包裹函数，传入所有的参数并返回接收到的所有值：

```javascript
function foo(something) {
  console.log( this.a, something );
  return this.a + something;
}
var obj = {
  a:2
};
var bar = function() {
  return foo.apply( obj, arguments );
};
var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

------

另一种使用方法是创建一个 `i` 可以重复使用的辅助函数：

```javascript
function foo(something) {
  console.log( this.a, something );
  return this.a + something;
}
// 简单的辅助绑定函数
function bind(fn, obj) {
  return function() {
    return fn.apply( obj, arguments );
  };
}
var obj = {
  a:2
};
var bar = bind( foo, obj );
var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

------

在 `ES5` 中提供了内置的方法 `Function.prototype.bind`，它的用法如下：

```javascript
function foo(something) {
  console.log( this.a, something );
  return this.a + something;
}
var obj = {
  a:2
};
var bar = foo.bind( obj );
var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

##### 2. API调用的"上下文"

及 `JavaScript` 语言和宿主环境中许多新的内置函数，都提供了一 个可选的参数，通常被称为“上下文”`（context）`，其作用和 `bind(..)` 一样，确保你的回调 函数使用指定的 `this`。比如`Array.prototype.every()、Array.prototype.filter()、Array.prototype.find()`等方法。

```javascript
function foo(el) {
  console.log( el, this.id );
}
var obj = {
  id: "awesome"
};
// 调用 foo(..) 时把 this 绑定到 obj
[1, 2, 3].forEach( foo, obj );
// 1 awesome 2 awesome 3 awesome
```

### new 绑定

使用 `new` 来调用函数，或者说发生构造函数调用时，会自动执行下面的操作。 

1. 创建（或者说构造）一个全新的对象。
2. 这个新对象会被执行 [[ 原型 ]] 连接。
3. 这个新对象会绑定到函数调用的 `this`。
4. 如果函数没有返回其他对象，那么 `new` 表达式中的函数调用会自动返回这个新对象。

## 3. 优先级

显式绑定的优先级高于隐式绑定，示例如下：

```javascript
function foo() {
  console.log( this.a );
}
var obj1 = {
  a: 2,
  foo: foo
};
var obj2 = {
  a: 3,
  foo: foo
};
obj1.foo(); // 2
obj2.foo(); // 3
obj1.foo.call( obj2 ); // 3
obj2.foo.call( obj1 ); // 2
```

`new` 绑定比隐式绑定优先级高，示例如下：

```javascript
function foo(something) {
  this.a = something;
}
var obj1 = {
  foo: foo
};
var obj2 = {};
obj1.foo( 2 );
console.log( obj1.a );     // 2
obj1.foo.call( obj2, 3 );
console.log( obj2.a );     // 3
var bar = new obj1.foo( 4 );
console.log( obj1.a );     // 2
console.log( bar.a );      // 4
```

`bar` 被硬绑定到 `obj1` 上，但是 `new bar(3)` 并没有像我们预计的那样把 `obj1.a` 修改为 `3`。相反，`new` 修改了硬绑定（到 `obj1` 的）调用 `bar(..)` 中的 `this`。因为使用了 `new` 绑定，我们得到了一个名字为 `baz` 的新对象，并且 `baz.a` 的值是 `3`，示例如下：

```javascript
function foo(something) {
  this.a = something;
}
var obj1 = {};
var bar = foo.bind( obj1 );
bar( 2 );
console.log( obj1.a );   // 2
var baz = new bar(3);
console.log( obj1.a );   // 2
console.log( baz.a );    // 3
```

要在 `new` 中使用硬绑定函数，主要目的是预先设置函数的一些参数，这样在使用 `new` 进行初始化时就可以只传入其余的参数，实例如下：

```javascript
function foo(p1,p2) {
  this.val = p1 + p2;
}
// 之所以使用 null 是因为在本例中我们并不关心硬绑定的 this 是什么
// 反正使用 new 时 this 会被修改
var bar = foo.bind( null, "p1" );
var baz = new bar( "p2" );
baz.val; // p1p2
```

## 4.判断this

现在我们可以根据优先级来判断函数在某个调用位置应用的是哪条规则。可以按照下面的 顺序来进行判断：

1. 函数是否在 `new` 中调用（`new` 绑定）？如果是的话 `this` 绑定的是新创建的对象。 

   ```javascript
   var bar = new foo()
   ```

2. 函数是否通过 `call、apply`（显式绑定）或者硬绑定调用？如果是的话，`this` 绑定的是 指定的对象。

   ```javascript
   var bar = foo.call(obj2)
   ```

3. 函数是否在某个上下文对象中调用（隐式绑定）？如果是的话，`this` 绑定的是那个上 下文对象。

   ```javascript
   var bar = obj1.foo()
   ```

4. 如果都不是的话，使用默认绑定。如果在严格模式下，就绑定到 undefined，否则绑定到 全局对象。

   ```javascript
   var bar = foo()
   ```

就是这样。对于正常的函数调用来说，理解了这些知识你就可以明白 this 的绑定原理了。 不过……凡事总有例外。


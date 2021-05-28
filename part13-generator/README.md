## 生成器

**迭代消息传递**

```javascript
function *foo(x) {
  var y = x * (yield);
  return y;
}

var it = foo( 6 );

// 启动foo(..)
it.next();

var res = it.next( 7 );
res.value; // 42
```

> 一般来说，需要的 `next(..)` 调用要比 `yield` 语句多一个，上面的代码片段有一个 `yield` 和两个 `next(..)` 调用。

为什么会有这个不匹配？

因为第一个 `next(..)` 总是启动一个生成器，并运行到第一个 `yield` 处。不过，是第二个 `next(..)` 调用完成第一个被暂停的 `yield` 表达式，第三个 `next(..)` 调用完成第二个 `yield`， 以此类推。

**双向传递消息**

```javascript
function *foo(x) {
  var y = x * (yield "Hello"); // <-- yield一个值！
  return y;
}

var it = foo( 6 );

var res = it.next(); // 第一个next()，并不传入任何东西
res.value; // "Hello"

res = it.next( 7 ); // 向等待的yield传入7
res.value; // 42
```

> 并没有向第一个 `next()` 调用发送值，这是有意为之。只有暂停的 `yield` 才能接受这样一个通过 `next(..)` 传递的值，而在生成器的起始处我们调用第一个 `next()` 时，还没有暂停的 `yield` 来接受这样一个值。**规范和所有兼容浏览器都会默默丢弃传递给第一个 next() 的任何东西。**

第一个 `next()` 调用（没有参数的）基本上就是在提出一个问题：“生成器 `*foo(..)` 要给我的下一个值是什么”。谁来回答这个问题呢？第一个 `yield "hello"` 表达式。 

看见了吗？这里没有不匹配。 

根据你认为提出问题的是谁，`yield` 和 `next(..)` 调用之间要么有不匹配，要么没有。 

但是，稍等！与 `yield` 语句的数量相比，还是多出了一个额外的 `next()`。所以，最后一个 `it.next(7)` 调用再次提出了这样的问题：生成器将要产生的下一个值是什么。但是，再没有 `yield` 语句来回答这个问题了，是不是？那么谁来回答呢？ 

`return` 语句回答这个问题！ 

如果你的生成器中没有 `return` 的话——在生成器中和在普通函数中一样，`return` 当然不 是必需的——总有一个假定的 / 隐式的 `return`;（也就是 `return undefined`;），它会在默认情况下回答最后的 `it.next(7)` 调用提出的问题。

**多个迭代器交替执行**

```javascript
var a = 1;
var b = 2;

function *foo() {
  a++;
  yield;
  b = b * a;
  a = (yield b) + 3;
}

function *bar() {
  b--;
  yield;
  a = (yield 8) + b;
  b = a * (yield 2);
}

function step(gen) {
  var it = gen();
  var last;
  return function() {
    // 不管yield出来的是什么，下一次都把它原样传回去！
    last = it.next( last ).value;
  };
}

var s1 = step( foo );
var s2 = step( bar );
s2(); // b--;
s2(); // yield 8
s1(); // a++;
s2(); // a = 8 + b;
      // yield 2
s1(); // b = b * a;
      // yield b
s1(); // a = b + 3;
s2(); // b = a * 2;

console.log(a, b);
```

```javascript
/**
 * 自己在脑海中执行结果如下
 * fLast 表示执行 last = it.next( last ).value 前last的值
 * tLast 表示执行 last = it.next( last ).value 后last的值
 */
s2(); // b--;        a: 1, b: 1, fLast: undefined, tLast: undefined
s2(); // yield 8     a: 1, b: 1, fLast: undefined, tLast: 8
s1(); // a++;        a: 2, b: 1, fLast: undefined, tLast: undefined
s2(); // a = 8 + b;  a: 9, b: 1, fLast: 8, tLast: 2
      // yield 2
s1(); // b = b * a;  a: 9, b: 9, fLast: undefined, tLast: 9
      // yield b
s1(); // a = b + 3;  a: 12, b: 9, fLast: 9, tLast: undefined
s2(); // b = a * 2;  a: 12, b: 24, fLast: 2, tLast: undefined

console.log(a, b); // 12, 24
```

实际执行结果:  `console.log(a, b)` 打印为 `12, 18`。**需要特别注意 `b = a * (yield 2)`；执行第三个 `s2()` 方法时，程序运行到 `*` 这里的时候停止了，此时`a`已经获取到值了，另外需要注意的是虽然 `s1` 和 `s2` 交替运行，但是 `last` 仍然保持着各自迭代器的值** ，具体代码如下：

```javascript
function* bar() {
  b--;
  yield;
  a = (yield 8) + b;
  console.log("这个时候的a", a); //9
  b = console.log("a到底是几==",a) * (yield 2);
  //因为程序运行到*这里的时候停止了，所以此时a已经获取到值了
  //假如写成下面这样
  //b = (yield 2)*a;结果就不一样了，同样函数在*这里停止，重新运行之后a才获取，此时就变成了12,24
}
```

生成器 `yield` 暂停的特性意味着我们不仅能够从异步函数调用得到看似同步的返回值，还可以同步捕获来自这些异步函数调用的错误！

```javascript
function foo(x,y) {
  ajax(
    "http://some.url.1/?x=" + x + "&y=" + y,
    function(err,data){
      if (err) {
        // 向*main()抛出一个错误
        it.throw( err );
      }
      else {
        // 用收到的data恢复*main()
        it.next( data );
      }
    }
  );
}

function *main() {
  try {
    var text = yield foo( 11, 31 ); 
    console.log( text );
  }
  catch (err) {
    console.error( err );
  }
}

var it = main();

// 这里启动！
it.next();
```

获得 `Promise` 和生成器最大效用的最自然的方法就是 `yield` 出来一个 `Promise`，然后通过这个 `Promise` 来控制生成器的迭代器。

```javascript
function foo(x,y) {
  return request(
    "http://some.url.1/?x=" + x + "&y=" + y
  );
}

function *main() {
  try {
    var text = yield foo( 11, 31 );
    console.log( text );
  }
  catch (err) {
    console.error( err );
  }
}

var it = main();

var p = it.next().value;

// 等待promise p决议
p.then(
  function(text){
    it.next( text );
  },
  function(err){
    it.throw( err );
  }
); 
```

**消息委托**

`yield` 委托不只用于迭代器控制工作，也用于双向消息传递工作：

```javascript
function *foo() {
  console.log( "inside *foo():", yield "B" );
  console.log( "inside *foo():", yield "C" );
  return "D";
}

function *bar() {
  console.log( "inside *bar():", yield "A" );
  // yield委托！
  console.log( "inside *bar():", yield *foo() );
  console.log( "inside *bar():", yield "E" );
  return "F";
}

var it = bar();

console.log( "outside:", it.next().value );
// outside: A

console.log( "outside:", it.next( 1 ).value );
// inside *bar(): 1
// outside: B

console.log( "outside:", it.next( 2 ).value );
// inside *foo(): 2
// outside: C

console.log( "outside:", it.next( 3 ).value );
// inside *foo(): 3
// inside *bar(): D
// outside: E

console.log( "outside:", it.next( 4 ).value );
// inside *bar(): 4
// outside: F
```

**异常也被委托！**

和 `yield` 委托透明地双向传递消息的方式一样，错误和异常也是双向传递的：

```javascript
function *foo() {
  try {
    yield "B";
  }
  catch (err) {
    console.log( "error caught inside *foo():", err );
  }
  yield "C";
  throw "D";
}

function *bar() {
  yield "A";
  try {
    yield *foo();
  }
  catch (err) {
    console.log( "error caught inside *bar():", err );
  }
  yield "E";
  yield *baz();
  // 注：不会到达这里！
  yield "G";
}

function *baz() {
  throw "F";
}

var it = bar();

console.log( "outside:", it.next().value );
// outside: A

console.log( "outside:", it.next( 1 ).value );
// outside: B

console.log( "outside:", it.throw( 2 ).value );
// error caught inside *foo(): 2
// outside: C

console.log( "outside:", it.next( 3 ).value );
// error caught inside *bar(): D
// outside: E

try {
  console.log( "outside:", it.next( 4 ).value );
}
catch (err) {
  console.log( "error caught outside:", err );
}
// error caught outside: F
```

生成器内部的代码是以自然的同步 / 顺序方式表达任务的一系列步骤。其技巧在于，我们把可能的异步隐藏在了关键字 `yield` 的后面， 把异步移动到控制生成器的迭代器的代码部分。

生成器为异步代码保持了顺序、同步、阻塞的代码模式，这使得大脑可以更自然地追踪代码，解决了基于回调的异步的两个关键缺陷之一。
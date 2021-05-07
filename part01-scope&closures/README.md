#### charpter1：作用域是什么

**演员表**

- 引擎

  从头到位负责整个JavaScript程序的编译及执行过程

- 编译器

  负责语法分析及代码生成等脏活累活

- 作用域

  负责收集并维护由所有声明的标识符（变量）组成的一系列查询，并实施一套非常严格的规则，确定当前执行的代码对这些标识符的访问权限

**总结：** 变量的赋值操作会执行两个动作，首先编译器会在当前作用域中声明一个变量（如果之前没有声明过），然后在运行时引擎会在作用域中查找该变量，如果能够找到就会对它赋值。

> LHS查询是试图找到变量的容器本身，从而可以对其赋值；RHS查询是取到其原值，得到某某某值。
>
> ```javascript
> console.log(a)
> // 其中对a的引用是一个RHS引用，因为这里没有对a赋任何值，相应的，需要查找并取得a的值，这样才能将值传递给console.log(...)
> a = 2;
> // 这里对a的引用是LHS引用，因为实际上我们不关心当前值是什么，只想为=2这个赋值操作找到一个目标
> 
> function foo(a) {
>     var b = a;
>     return a + b;
> }
> var c = foo(2);
> // 1、LHS查询(3处)
> // c = ..; a = 2(隐式变量分配); b = ..
> // 2、RHS查询(4处)
> // foo(2); ... = 2; a..; ..b
> ```
>
> 容易混淆的一个例子
>
> ```javascript
> var a = 1;
> console.log(a+b);
> var b = 1;
> // NaN
> // b会进行RHS查询, 由于变量提升的缘故，此时b对应为undefined,1+undefined，自然打印为NaN
> var a = 1;
> console.log(a+b);
> b = 1;
> // 报错: ReferenceError: b is not defined
> // 此处b会进行RHS查询，当其在当前和相关作用域都无法找到所需变量时，引擎会抛出ReferenceError错误
> ```
>
> 不成功的RHS引用会导致抛出ReferenceError异常。不成功的LHS引用会导致自动隐式地创建一个全局变量(非严格模式下)，该变量使用LHS引用的目标作为标识符，或者抛出ReferenceError异常(严格模式下)

#### charpter2：词法作用域

```javascript
var obj = {
  a: 1,
  b: 2
};
with(obj) {
  a = 2;
  b = 3;
  c = 4;
}
console.log(obj);       // { a: 2, b: 3 }
console.log(window.c);  // 4
```

**理解：** 当把`obj`传给`with`时，`with`所声明的作用域是`obj`，`obj`作用域中含有同`obj.a、obj.b`属性相同的标识符，但是没有`c`标识符，因此就行了正常的LHS标识符查找。`obj`作用域，全局作用域都没有找到标识符`c`，因此当`c=4`时，自动创建了一个全局变量（非严格模式）

**知识点：** `eval(...)`函数如果接受了含有一个或多个声明的代码，就会修改其所处的词法作用域，而`with`声明实际上是根据你传递给它的对象凭空创建了一个全新的词法作用域。

#### charpter3：函数作用域和块作用域

- 区分函数声明和表达式

  最简单的方法是看`function`关键字出现在声明中的位置(不仅仅是一行代码，而是整个声明中的位置)。如果`function`是声明中的第一个词，那么就是一个函数声明，否则就是一个函数表达式。

  ```javascript
  // 代码片段1
  function foo() {
    var a = 1;
    console.log(a);
  }
  foo();
  
  // 代码片段2
  (function foo() {
    var a = 1
    console.log(a);
  })()
  // 函数被当做函数表达式来处理
  ```

- 函数声明和表达式最重要的区别是它们的名称标识符将会绑定在何处

  代码片段1中`foo`被绑定在所在作用域中，可以直接通过`foo()`来调用它。代码片段2中`foo`被绑定在函数表达式自身的函数中而不是所在作用域中。(代码片段2中的`foo`只能在函数体中被访问，外部作用域不行)


#### charpter4：提升

- ```javascript
  // 代码片段1
  a = 2;
  var a;
  console.log( a ); // 2
  
  // 代码片段2
  console.log( a ); // undefined
  var a = 2;
  ```

  变量和函数在内的所有声明都会在任何代码被执行前首先被处理。当你看到 `var a = 2;` 时，可能会认为这是一个声明。但 JavaScript 实际上会将其看成两个 声明：`var a;` 和 `a = 2;`。第一个定义声明是在编译阶段进行的。第二个赋值声明会被留在 原地等待执行阶段

  `代码片段1`会进行如下处理:

  ```javascript
  var a;
  a = 2;
  console.log( a );
  ```

  `代码片段2`会进行如下处理:

  ```javascript
  var a;
  console.log( a );
  a = 2;
  ```

  **函数声明提升：**

  ```javascript
  foo();
  function foo() {
    console.log( a ); // undefined
    var a = 2;
  }
  ```

  以上代码会做如下处理：

  ```javascript
  function foo() {
    var a;
    console.log( a ); // undefined
    a = 2;
  }
  foo();
  ```

  **函数声明会被提升，但是函数表达式却不会被提升**

  ```javascript
  foo(); // 不是 ReferenceError, 而是 TypeError!
  var foo = function bar() {
    // ...
  };
  ```

  > ReferenceError：引用错误，在尝试引用一个不存在当前作用域中的变量/常量时产生的错误
  >
  > TypeError ：会发生在值的类型不符合预期时，在对值的操作方法不存在或并未正确的定义时，TypeError 就会被返回

  ```javascript
  foo(); // TypeError
  bar(); // ReferenceError
  var foo = function bar() {
    // ...
  };
  ```

  以上代码片段提升后，实际会被理解为以下形式

  ```javascript
  var foo;
  foo(); // TypeError
  bar(); // ReferenceError
  foo = function() {
    var bar = ...self...
    // ...
  }
  ```

- 函数声明和变量声明都会被提升，但是函数会首先被提升，然后才是变量

  ```javascript
  foo(); // 1
  var foo;
  function foo() {
    console.log( 1 );
  }
  foo = function() {
    console.log( 2 );
  };
  ```

  以上代码会输出1不是2！这个代码片段会被引擎理解为如下形式：

  ```javascript
  function foo() {
    console.log( 1 );
  }
  foo(); // 1
  foo = function() {
    console.log( 2 );
  };
  ```

  尽管重复的 **var** 声明会被忽略掉，但**出现在后面的函数声明还是可以覆盖前面的**

  ```javascript
  foo(); // 3
  function foo() {
    console.log( 1 );
  }
  var foo = function() {
    console.log( 2 );
  };
  function foo() {
    console.log( 3 );
  }
  ```

- 一个普通块内部的函数声明通常会被提升到所在作用域的顶部，这个过程不会像下面的代码暗示的那样可以被条件判断所控制：

  ```javascript
  foo(); // TypeError:foo is not a function
  var a = true;
  if (a) {
    function foo() { console.log("a"); }
  }
  else {
    function foo() { console.log("b"); }
  }
  ```

  > 老版本中两个`foo`函数会被提升，第二个`foo`函数会覆盖第一个，因此`foo()`执行结果是`b`；
  >
  > 新版本中`if`块内仅提升函数声明，但未包含实际函数的隐藏值，因此`foo()`执行结果是`TypeError`

  ```javascript
  var a = true;
  if (a) {
    function foo() { console.log("a"); }
  }
  else {
    function foo() { console.log("b"); }
  }
  foo() // a
  // TODO:测试一下edge、ie浏览器中的实现
  ```

  > `JavaScript高级程序设计(第3版)`在第`176`页解释道：这在 `ECMAScript` 中属于无效语法， `JavaScript` 引擎会尝试修正错误，将其转换为合理的状态。大多数浏览器会返回第二个声明，忽略`condition`； `Firefox` 会在 `condition` 为 `true` 时返回第一个声明。（只针对作者当时写书时浏览器的实现）

  **目前Chrome、FireFox、Edge、IE11浏览器已经按照我们的预期实现了，IE10会返回第二个声明。注意不要使用这种方式，在未来的JavaScript版本中有可能还会发生变化，应该尽可能避免在块内部声明函数**

#### charpter5：作用域闭包

- 当函数可以记住并访问所在的词法作用域，即使函数是在当前词法作用域之外执行，这时 就产生了闭包。
  - 闭包使得函数可以继续访问定义是的词法作用域
  - 无论通过何种手段将内部函数传递到所在的词法作用域以外，它都会持有对原始定义作用域的引用，无论在何处执行这个函数都会使用闭包

- 循环和闭包

  ```javascript
  for (var i=1; i<=5; i++) {
    setTimeout( function timer() {
      console.log( i );
    }, i*1000 );
  }
  // 这段代码在运行时会以每秒一次的频率输出五次6
  ```

  > 原因：尽管循环中的五个函数是在各个迭代中分别定义的， 但是它们都被封闭在一个共享的全局作用域中，因此实际上只有一个 `i`

  ```javascript
  function createFunctions(){
    var result = new Array();
    for (var i=0; i < 10; i++){
      result[i] = function(){
        return i;
      };
    }
    return result;
  }
  // 表面上看，似乎每个函数都应该返自己的索引值，即位置 0 的函数返回 0，位置 1 的函数返回 1，以此类推。但实际上，每个函数都返回 10
  ```

  > 原因：因为每个函数的作用域链中都保存着 `createFunctions()` 函数的活动对象 ， 所以它们引用的都一 个变量 `i` 。 当 `createFunctions()` 函数返回后，变量 `i` 的值是 `10`，此时每个函数都引用着保存变量 `i` 的同一个变量对象，所以在每个函数内部 `i` 的值都是 `10`  

  **解决方式**

  ```javascript
  // 解决方式一
  for (var i=1; i<=5; i++) {
    (function() {
      var j = i;
      setTimeout( function timer() {
        console.log( j );
      }, j*1000 );
    })();
  }
  // 解决方式二
  for (var i=1; i<=5; i++) {
    (function(j) {
      setTimeout( function timer() {
        console.log( j );
      }, j*1000 );
    })( i );
  }
  // 解决方式三
  for (var i=1; i<=5; i++) {
    let j = i; // 是的， 闭包的块作用域！
    setTimeout( function timer() {
      console.log( j );
    }, j*1000 );
  }
  // 解决方式四
  for (let i=1; i<=5; i++) {
    setTimeout( function timer() {
      console.log( i );
    }, i*1000 );
  }
  ```
  
- 模块模式需要具备的两个条件
  1. 必须有外部的封闭函数， 该函数必须至少被调用一次（每次调用都会创建一个新的模块实例）。  
     
  2. 封闭函数必须返回至少一个内部函数， 这样内部函数才能在私有作用域中形成闭包， 并且可以访问或者修改私有的状态。  
     
  3. [模块模式代码传送门](https://github.com/YihooZero/learn-you-dont-know-js/blob/main/part01-scope%26closures/1module.js)
  
  4. [现代的模块机制代码传送门](https://github.com/YihooZero/learn-you-dont-know-js/blob/main/part01-scope%26closures/2module.js)
  
  5. 未来的模块机制（目前运用的正是此模式，作者编写此书时此模式还没有盛行）
  
     ```javascript
     	// 与4现代的模块机制作比较，更易阅读和理解
     	// bar.js
         function hello(who) {
           return "Let me introduce: " + who;
         }
         export hello;
     
     	// foo.js
     	// 仅从 "bar" 模块导入 hello()
         import hello from "bar";
         var hungry = "hippo";
         function awesome() {
           console.log(
             hello( hungry ).toUpperCase()
           );
         }
         export awesome;
     
     	// baz.js
     	// 导入完整的 "foo" 和 "bar" 模块
     	import foo from "foo";
      	import bar from "bar";
     	console.log(
     	  bar.hello( "rhino" )
     	);             // Let me introduce: rhino
     	foo.awesome(); // LET ME INTRODUCE: HIPPO
     ```
  
     


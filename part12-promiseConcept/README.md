## Promise

粗糙的基于回调方法处理异步问题（未来值），确保输出是可预测的，但是缺少代码优雅度：

```javascript
function add(getX,getY,cb) {
  var x, y;
  getX( function(xVal){
    x = xVal;
    // 两个都准备好了？
    if (y != undefined) {
      cb( x + y ); // 发送和
    }
  } );
  getY( function(yVal){
    y = yVal;
    // 两个都准备好了？
    if (x != undefined) {
      cb( x + y ); // 发送和
    }
  } );
}

// fetchX() 和fetchY()是同步或者异步函数
add( fetchX, fetchY, function(sum){
  console.log( sum ); // 是不是很容易？
} ); 
```

通过 `Promise` 函数表达上述 `x + y` 的例子：

```javascript
function add(xPromise,yPromise) {
  // Promise.all([ .. ])接受一个promise数组并返回一个新的promise，
  // 这个新promise等待数组中的所有promise完成
  return Promise.all( [xPromise, yPromise] )
  // 这个promise决议之后，我们取得收到的X和Y值并加在一起
  .then( function(values){
    // values是来自于之前决议的promise的消息数组
    return values[0] + values[1];
  } );
}

// fetchX()和fetchY()返回相应值的promise，可能已经就绪，
// 也可能以后就绪
add( fetchX(), fetchY() )

// 我们得到一个这两个数组的和的promise
// 现在链式调用 then(..)来等待返回promise的决议
.then( function(sum){
  console.log( sum ); // 这更简单！
} ); 
```

> 在 `add(..)` 内部，`Promise.all([ .. ])` 调用创建了一个 `promise`（这个 `promise` 等待 `promiseX` 和 `promiseY` 的决议）。链式调用 `.then(..)` 创建了另外一个 `promise`。这个 `promise` 由 `return values[0] + values[1]` 这一 行立即决议（得到加运算的结果）。因此，链 `add(..)` 调用终止处的调用 `then(..)`——在代码结尾处——实际上操作的是返回的第二个 `promise`，而不是由 `Promise.all([ .. ])` 创建的第一个 `promise`。还有，尽管第二个 `then(..)` 后面没有链接任何东西，但它实际上也创建了一个新的 `promise`， 如果想要观察或者使用它的话就可以看到。

**`Promise` 决议后就是外部不可变的值，我们可以安全地把这个值传递给第三方，并确信它不会被有意无意地修改。特别是对于多方查看同一个 `Promise` 决议的情况，尤其如此。一方不可能影响另一方对 `Promise` 决议的观察结果。这是 `Promise` 设计中最基础和最重要的因素。**

```javascript
var p3 = new Promise( function(resolve,reject){
  resolve( "B" );
} );

var p1 = new Promise( function(resolve,reject){
  resolve( p3 );
} );

var p2 = new Promise( function(resolve,reject){
  resolve( "A" );
} );

p1.then( function(v){
  console.log( v );
} ); 

p2.then( function(v){
  console.log( v );
} );
// A B <-- 而不是像你可能认为的B A
```

`p1` 不是用立即值而是用另一个 `promise p3` 决 议，后者本身决议为值 `"B"`。**规定的行为是把 `p3` 展开到 `p1`，但是是异步地展开**。所以，在异步任务队列中，`p1` 的回调排在 `p2` 的回调之后。

```javascript
function foo(x) {
  // 开始做一些可能耗时的工作
  // 构造并返回一个promise
  return new Promise( function(resolve,reject){
    // 最终调用resolve(..)或者reject(..)
    // 这是这个promise的决议回调
  } );
}

// 用于超时一个Promise的工具
function timeoutPromise(delay) {
  return new Promise( function(resolve,reject){
    setTimeout( function(){
      reject( "Timeout!" );
    }, delay );
  } );
}

// 设置foo()超时
Promise.race( [
  foo(), // 试着开始foo()
  timeoutPromise( 3000 ) // 给它3秒钟
] )
.then(
  function(){
    // foo(..)及时完成！
  }, 

  function(err){
    // 或者foo()被拒绝，或者只是没能按时完成
    // 查看err来了解是哪种情况
  }
); 
```

可以保证一个 `foo()` 有一个输出信号，防止其永久挂住程序。

如果向 `Promise.resolve(..)` 传递一个非 `Promise`、非 `thenable` 的立即值，就会得到一个用这个值填充的 `promise`。下面这种情况下，`promise p1` 和 `promise p2` 的行为是完全一样的：

```javascript
var p1 = new Promise( function(resolve,reject){
  resolve( 42 );
} );

var p2 = Promise.resolve( 42 );
```

如果向 `Promise.resolve(..)` 传递一个真正的 `Promise`，就只会返回同一个 `promise`：

```javascript
var p1 = Promise.resolve( 42 );

var p2 = Promise.resolve( p1 );

p1 === p2; // true
```

假设我们要调用一个工具 `foo(..)`，且并不确定得到的返回值是否是一个可信任的行为良好的 `Promise`，但我们可以知道它至少是一个 `thenable`。`Promise.resolve(..)` 提供了可信任的 `Promise` 封装工具，可以链接使用：

```javascript
// 不要只是这么做：
foo( 42 )
.then( function(v){
  console.log( v );
} );

// 而要这么做：
Promise.resolve( foo( 42 ) )
.then( function(v){
  console.log( v );
} );
```

> 对于用 `Promise.resolve(..)` 为所有函数的返回值（不管是不是 `thenable`） 都封装一层。另一个好处是，这样做很容易把函数调用规范为定义良好的异步任务。如果 `foo(42)` 有时会返回一个立即值，有时会返回 `Promise`，那么 `Promise.resolve( foo(42) )` 就能够保证总会返回一个 `Promise` 结果。


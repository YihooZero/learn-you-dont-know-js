## 异步：现在与将来

### 分块的程序

#### 异步控制台

在某些条件下，某些浏览器的 `console.log(..)` 并不会把传入的内容立即输出。出现这种情况的主要原因是，在许多程序（不只是 `JavaScript`）中，`I/O` 是非常低速的阻塞部分。所以，（从页面 /`UI` 的角度来说）浏览器在后台异步处理控制台 `I/O` 能够提高性能，这时用户甚至可能根本意识不到其发生。

```javascript
var a = {
  index: 1
};

// 然后
console.log( a ); // ??
// 再然后
a.index++;
```

多数情况下，前述代码在开发者工具的控制台中输出的对象表示与期望是一致的。但是， 这段代码运行的时候，浏览器可能会认为需要把控制台 `I/O` 延迟到后台，在这种情况下， 等到浏览器控制台输出对象内容时，`a.index++` 可能已经执行，因此会显示 `{ index: 2 }`。

如果在调试的过程中遇到对象在 `console.log(..)` 语句之后被修改，可你却看到了意料之外的结果， 要意识到这可能是这种 `I/O` 的异步化造成的。

如果遇到这种少见的情况，最好的选择是在 `JavaScript` 调试器中使用断点， 而不要依赖控制台输出。次优的方案是把对象序列化到一个字符串中，以强 制执行一次“快照”，比如通过 `JSON.stringify(..)`。

### 事件循环

事件循环，下面这段伪代码可以理解这个概念 :

```javascript
// eventLoop是一个用作队列的数组
// （先进，先出）
var eventLoop = [ ];
var event;

// “永远”执行
while (true) {
  // 一次tick
  if (eventLoop.length > 0) {
  // 拿到队列中的下一个事件
    event = eventLoop.shift();
    // 现在，执行下一个事件
    try {
      event();
    }
    catch (err) {
      reportError(err);
    }
  }
}
```

可以看到，有一个用 `while` 循环实现的持续运行的循环，循环的每一轮称为一个 `tick`。 对每个 `tick` 而言，如果在队列中有等待事件，那么就会从队列中摘下一个事件并执行。这 些事件就是你的回调函数。

`setTimeout(..)` 并没有把你的回调函数挂在事件循环队列中。它所做的是设定一个定时器。当定时器到时后，环境会把你的回调函数放在事件循环中，这样，在未来某个时刻的 `tick` 会摘下并执行这个回调。

如果这时候事件循环中已经有 `20` 个项目了会怎样呢？你的回调就会等待。它得排在其他项目后面—— **通常没有抢占式的方式支持直接将其排到队首**。这也解释了为什么 `setTimeout(..)` 定时器的精度可能不高。大体说来，只能确保你的回调函数不会在指定的时间间隔之前运行，但可能会在那个时刻运行，也可能在那之后运行，要根据事件队列的状态而定。

### **JavaScript 是单线程运行的**
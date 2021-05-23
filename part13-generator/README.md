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


## 代码组织

### 迭代器

**自定义迭代器**

可以构造自己的迭代器！要使得它们能够与 `ES6` 的消费者工具（比如，`for..of` 循环以及 `...` 运算符）互操作，所需要做的就是使其遵循适当的接口。

构造一个迭代器来产生一个无限斐波纳契序列：

```javascript
var Fib = {
  [Symbol.iterator]() {
    var n1 = 1, n2 = 1;
    return {
      // 使迭代器成为iterable
      [Symbol.iterator]() {
        return this;
      },
      next() {
        var current = n2;
        n2 = n1;
        n1 = n1 + current;
        return {value: current, done: false};
      },
      return(v) {
        console.log(
          "Fibonacci sequence abandoned."
        );
        return {value: v, done: true};
      }
    };
  }
};

for (var v of Fib) {
  console.log(v);
  if (v > 50) break;
}
// 1 1 2 3 5 8 13 21 34 55
// Fibonacci sequence abandoned.
```

接下来考虑一个迭代器，它的设计意图是用来在一系列（也就是一个队列）动作上运行， 一次一个条目：

```javascript
var tasks = {
  [Symbol.iterator]() {
    var steps = this.actions.slice();
    return {
      // 使迭代器成为iterable
      [Symbol.iterator]() {
        return this;
      },
      next(...args) {
        if (steps.length > 0) {
          let res = steps.shift()(...args);
          return {value: res, done: false};
        } else {
          return {done: true}
        }
      },
      return(v) {
        steps.length = 0;
        return {value: v, done: true};
      }
    };
  },
  actions: []
};

tasks.actions.push(
  function step1(x) {
    console.log("step 1:", x);
    return x * 2;
  },
  function step2(x, y) {
    console.log("step 2:", x, y);
    return x + (y * 2);
  },
  function step3(x, y, z) {
    console.log("step 3:", x, y, z);
    return (x * y) + z;
  }
);

var it = tasks[Symbol.iterator]();

it.next(10); // step 1: 10
// { value: 20, done: false }

it.next(20, 50); // step 2: 20 50
// { value: 120, done: false }

it.next(20, 50, 120); // step 3: 20 50 120
// { value: 1120, done: false }

it.next(); // { done: true }
```

可以创造性地定义一个迭代器来表示单个数据上的元操作。可以为数字定义一个迭代器，默认范围是从 0 到（或者对于负数来说，向下到）关注的数字。

```javascript
if (!Number.prototype[Symbol.iterator]) {
  Object.defineProperty(
    Number.prototype,
    Symbol.iterator,
    {
      writable: true,
      configurable: true,
      enumerable: false,
      value: function iterator() {
        var i, inc, done = false, top = +this;
        // 正向还是反向迭代？
        inc = 1 * (top < 0 ? -1 : 1);
        return {
          // 使得迭代器本身成为iterable!
          [Symbol.iterator]() {
            return this;
          },
          next() {
            if (!done) {
              // 初始迭代总是0
              if (i == null) {
                i = 0;
              }
              // 正向迭代
              else if (top >= 0) {
                i = Math.min(top, i + inc);
              }
              // 反向迭代
              else {
                i = Math.max(top, i + inc);
              }
              // 本次迭代后结束？
              if (i == top) done = true;
              return {value: i, done: false};
            } else {
              return {done: true};
            }
          }
        };
      }
    }
  );
}

for (var i of 3) {
  console.log(i);
}
// 0 1 2 3
[...-3]; // [0,-1,-2,-3]
```


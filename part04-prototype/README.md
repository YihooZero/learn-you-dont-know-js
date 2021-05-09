### 原型

#### 1. [[ Prototype ]]

```javascript
var anotherObject = {
  a:2
};

// 创建一个关联到 anotherObject 的对象
var myObject = Object.create( anotherObject );
myObject.a; // 2
```

在 `myObject` 对象的 `[[Prototype]]` 关联到了 `anotherObject`。显然 `myObject.a` 并不存在， 但是尽管如此，属性访问仍然成功地（在 `anotherObject` 中）找到了值 2。

如果 `anotherObject` 中也找不到 `a` 并且 `[[Prototype]]` 链不为空的话，就会继续查找下去。

这个过程会持续到找到匹配的属性名或者查找完整条 `[[Prototype]]` 链。如果仍然找不到 `a`， `[[Get]]` 操作的返回值是 `undefined`。

- ##### `Object.prototype`

  


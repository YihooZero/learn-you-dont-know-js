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

  所有普通对象的 `[[Prototype]]` 链最终都会指向内置的 `Object.prototype`。
  
- ##### 属性设置和屏蔽

  ```javascript
  myObject.foo = "bar";
  ```

  如果 `myObject` 对象中包含名为 `foo` 的普通数据访问属性，这条赋值语句只会修改已有的属性值。

  如果 `foo` 不是直接存在于 `myObject` 中，`[[Prototype]]` 链就会被遍历，类似 `[[Get]]` 操作。 如果原型链上找不到 `foo`，`foo` 就会被直接添加到 `myObject` 上。

  如果属性名 `foo` 既出现在 `myObject` 中也出现在 `myObject` 的 `[[Prototype]]` 链上层，那么就会发生屏蔽。`myObject` 中包含的 `foo` 属性会屏蔽原型链上层的所有 `foo` 属性，因为 `myObject.foo` 总是会选择原型链中最底层的 `foo` 属性。

  下如果 `foo` 不直接存在于 `myObject` 中而是存在于原型链上层时， `myObject.foo = "bar"` 会出现的三种情况：

  1. 如果在 `[[Prototype]]` 链上层存在名为 `foo` 的普通数据访问属性并且没有被标记为只读`（writable:false）`，那就会直接在 `myObject` 中添加一个名为 `foo` 的新属性，它是屏蔽属性。
  2. 如果在 `[[Prototype]]` 链上层存在 `foo`，但是它被标记为只读`（writable:false）`，那么 无法修改已有属性或者在 `myObject` 上创建屏蔽属性。如果运行在严格模式下，代码会抛出一个错误。否则，这条赋值语句会被忽略。总之，不会发生屏蔽。
  3. 如果在 `[[Prototype]]` 链上层存在 `foo` 并且它是一个 `setter`，那就一定会调用这个 `setter`。`foo` 不会被添加到（或者说屏蔽于）`myObject`，也不会重新定义 `foo` 这 个 `setter`。

  有些情况下会隐式产生屏蔽，需要注意：

  ```javascript
  var anotherObject = {
    a:2
  };
  
  var myObject = Object.create( anotherObject );
  
  anotherObject.a; // 2
  myObject.a;      // 2
  
  anotherObject.hasOwnProperty( "a" ); // true
  myObject.hasOwnProperty( "a" );      // false
  
  myObject.a++; // 隐式屏蔽！
  
  anotherObject.a; // 2
  myObject.a;      // 3
  
  myObject.hasOwnProperty( "a" ); // true
  ```

  尽管 `myObject.a++` 看起来应该（通过委托）查找并增加 `anotherObject.a` 属性，但是别忘 了 `++` 操作相当于 `myObject.a = myObject.a + 1`。因此 `++` 操作首先会通过 `[[Prototype]]` 查找属性 `a` 并从 `anotherObject.a` 获取当前属性值 `2`，然后给这个值加 `1`，接着用 `[[Put]]` 将值 `3` 赋给 `myObject` 中新建的屏蔽属性 `a`。

  如果想让 `anotherObject.a` 的值增加，唯一的办法是 `anotherObject.a++`。


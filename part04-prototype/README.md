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

#### 2."类"

- ##### "类"函数

  ```javascript
  function Foo() {
    // ...
  }
  
  var a = new Foo();
  
  Object.getPrototypeOf( a ) === Foo.prototype; // true
  ```

  调用 `new Foo()` 时会创建 `a`对象，其中的一步就是给 `a` 一个内部的 `[[Prototype]]` 链接，关联到 `Foo.prototype` 指向的那个对象。

  得到了两个对象，它们之间互相关联，并没有初始化一个类，实际上我们并没有从“类”中复制任何行为到一个对象中，只是让两个对象互相关联。

- ##### "构造函数"

  ```javascript
  function Foo() {
    // ...
  }
  
  Foo.prototype.constructor === Foo; // true
  
  var a = new Foo();
  a.constructor === Foo;             // true
  ```

  ###### 构造函数还是调用

  当在普通的函数调用前面加上 `new` 关键字之后，就会把这个函数调用变成一个“构造函数调用”。实际上，`new` 会劫持所有普通函数并用构造对象的形式来调用它。
  
  函数不是构造函数，但是当且仅当使用 `new` 时，函数调用会变成“构造函数调用”。
  
- ##### 技术

  ###### 回顾"构造函数"

  `a.constructor === Foo` 并不真意味着 `a` 有一个指向 `Foo` 的 `.constructor` 属性。实际上，`.constructor` 引用同样被委托给了 `Foo.prototype`，而 `Foo.prototype.constructor` 默认指向 `Foo`。

  `a1.constructor` 是一个非常不可靠并且不安全的引用。通常来说要尽量避免使用这些引用。

#### 3.（原型）继承

```javascript
function Foo(name) {
  this.name = name;
}

Foo.prototype.myName = function() {
  return this.name;
};

function Bar(name,label) {
  Foo.call( this, name );
  this.label = label;
}

// 我们创建了一个新的 Bar.prototype 对象并关联到 Foo.prototype
Bar.prototype = Object.create( Foo.prototype );

// 注意！现在没有 Bar.prototype.constructor 了
// 如果你需要这个属性的话可能需要手动修复一下它
Bar.prototype.myLabel = function() {
  return this.label;
};

var a = new Bar( "a", "obj a" );

a.myName();   // "a"
a.myLabel();  // "obj a"
```

原型继承图如下：

![原型继承](https://github.com/YihooZero/learn-you-dont-know-js/blob/main/imgs/part04-prototype1.png)

这段代码的核心部分就是语句 `Bar.prototype = Object.create( Foo.prototype )`。调用 `Object.create(..)` 会凭空创建一个“新”对象并把新对象内部的 `[[Prototype]]` 关联到你指定的对象（本例中是 `Foo.prototype`）。

下面这两种方式都存在一些问题：

```javascript
// 和你想要的机制不一样！
Bar.prototype = Foo.prototype;

// 基本上满足你的需求，但是可能会产生一些副作用 :(
Bar.prototype = new Foo();
```

`Bar.prototype = Foo.prototype` 并不会创建一个关联到 `Bar.prototype` 的新对象，它只是让 `Bar.prototype` 直接引用 `Foo.prototype` 对象。因此当你执行类似 `Bar.prototype. myLabel = ...` 的赋值语句时会直接修改 `Foo.prototype` 对象本身。

`Bar.prototype = new Foo()` 的确会创建一个关联到 `Bar.prototype` 的新对象。但是它使用了 `Foo(..)` 的“构造函数调用”，如果函数 `Foo` 有一些副作用（比如写日志、修改状态、注册到其他对象、给 `this` 添加数据属性，等等）的话，就会影响到 `Bar()` 的“后代”，后果不堪设想。

要创建一个合适的关联对象，我们必须使用 `Object.create(..)` 而不是使用具有副作用的 `Foo(..)`。这样做唯一的缺点就是需要创建一个新对象然后把旧对象抛弃掉，不能直接修改已有的默认对象。**（这就是为什么`Bar.prototype.constructor === Bar` 为 `false` 的原因）**

在 `ES6` 之前， 我们只能通过设置 `.__proto__` 属性来实现，但是这个方法并不是标准并且无法兼容所有浏览器。`ES6` 添加了辅助函数 `Object.setPrototypeOf(..)`，可以用标准并且可靠的方法来修改关联。（`Object.setPrototypeOf(..)` 弥补了 `Object.create(..)` 的不足，直接修改现有的 `Bar.prototype` ，且 `Bar.prototype.constructor === true` 为 `true`）

```javascript
// ES6 之前需要抛弃默认的 Bar.prototype
Bar.ptototype = Object.create( Foo.prototype );

// ES6 开始可以直接修改现有的 Bar.prototype
Object.setPrototypeOf( Bar.prototype, Foo.prototype );
```

##### 检查"类"关系

**方法一：**荒谬的使用 `instanceof` 来判断两个对象的关系：

```javascript
function Foo() {
  // ...
}

Foo.prototype.blah = ...;

var a = new Foo();

a instanceof Foo; // true

// 用来判断 o1 是否关联到（委托）o2 的辅助函数
function isRelatedTo(o1, o2) {
  function F(){}
  F.prototype = o2;
  return o1 instanceof F;
}

var a = {};
var b = Object.create( a );

isRelatedTo( b, a ); // true
```

在 `isRelatedTo(..)` 内部我们声明了一个一次性函数 `F`，把它的 `.prototype` 重新赋值并指向对象 `o2`，然后判断 `o1` 是否是 `F` 的一个“实例”。显而易见，`o1` 实际上并没有继承 `F` 也不是由 `F` 构造，所以这种方法非常愚蠢并且容易造成误解。

**方法二：**`isPrototypeOf(..)` 来判断 `[[Prototype]]` 反射的方法：

```javascript
Foo.prototype.isPrototypeOf( a ); // true
```

 a 的整条 `[[Prototype]]` 链中是否出现过 `Foo.prototype`

这种方法并不需要间接引用函数`（Foo）`，它的 `.prototype` 属性会被自动访问。只需要两个对象就可以判断它们之间的关系：

```javascript
// 非常简单：b 是否出现在 c 的 [[Prototype]] 链中?
b.isPrototypeOf( c );
```

这个方法并不需要使用函数（“类”），它直接使用 `b` 和 `c` 之间的对象引用来判断它们的关系。换句话说，语言内置的 `isPrototypeOf(..)` 函数就是方法一中的 `isRelatedTo(..)` 函数。

**方法三：**直接获取一个对象的 `[[Prototype]]` 链。

在 `ES5` 中，标准的方法是：

```javascript
Object.getPrototypeOf( a );

// 验证
Object.getPrototypeOf( a ) === Foo.prototype; // true
```

绝大多数**（不是所有！）**浏览器也支持一种非标准的方法来访问内部 `[[Prototype]]` 属性：

```javascript
a.__proto__ === Foo.prototype; // true
```

`.__proto__` 看起来很像一个属性，但是实际上它更像一个 `getter/setter`，`.__proto__` 的实现大致上是这样的：

```javascript
Object.defineProperty( Object.prototype, "__proto__", {
  get: function() {
    return Object.getPrototypeOf( this );
  },
  set: function(o) {
    // ES6 中的 setPrototypeOf(..)
    Object.setPrototypeOf( this, o );
    return o;
  }
} );

```

#### 4.对象关联

`[[Prototype]]` 机制就是存在于对象中的一个内部链接，它会引用其他对象。

作用：如果在对象上没有找到需要的属性或者方法引用，引擎就会继续在 `[[Prototype]]` 关联的对象上进行查找。同理，如果在后者中也没有找到需要的引用就会继续查找它的 `[[Prototype]]`，以此类推。这一系列对象的链接被称为**“原型链”**。

##### 1.创建关联

```javascript
var foo = {
  something: function() {
    console.log( "Tell me something good..." );
  }
};

var bar = Object.create( foo );

bar.something(); // Tell me something good...
```

`Object.create(..)` 会创建一个新对象`（bar）`并把它关联到我们指定的对象`（foo）`，这样我们就可以充分发挥 `[[Prototype]]` 机制的威力（委托）并且避免不必要的麻烦（比如使用 `new` 的构造函数调用会生成 `.prototype` 和 `.constructor` 引用）。

`Object.create(null)` 会创建一个拥有空（ 或者说 `null`）`[[Prototype]]` 链接的对象，这个对象无法进行委托。由于这个对象没有原型链，所以 `instanceof` 操作符无法进行判断，因此总是会返回 `false`。 这些特殊的空 `[[Prototype]]` 对象通常被称作“字典”，**它们完全不会受到原型链的干扰，因此非常适合用来存储数据**。

**`Object.create()`的`polyfill`代码：**

```javascript
if (!Object.create) {
  Object.create = function(o) {
    function F(){}
    F.prototype = o;
    return new F();
  };
}
```

```javascript
var anotherObject = {
  a:2
};

var myObject = Object.create( anotherObject, {
  b: {
    enumerable: false,
    writable: true,
    configurable: false,
    value: 3
  },
  c: {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 4
  }
});

myObject.hasOwnProperty( "a" ); // false
myObject.hasOwnProperty( "b" ); // true
myObject.hasOwnProperty( "c" ); // true

myObject.a; // 2
myObject.b; // 3
myObject.c; // 4
```

`Object.create(..)` 的第二个参数指定了**需要添加到新对象中的属性名以及这些属性的属性描述符**。

##### 2.关联关系是备用

```javascript
var anotherObject = {
  cool: function() {
    console.log( "cool!" );
  }
};

var myObject = Object.create( anotherObject );

myObject.cool(); // "cool!"
```

当你设计软件时，假设要调用 `myObject.cool()`，如果 `myObject` 中不存在 `cool()` 时这条语句也可以正常工作的话，那你的 `API` 设计就会变得很“神奇”，对于未来维护你软件的开发者来说这可能不太好理解。

```javascript
var anotherObject = {
  cool: function() {
    console.log( "cool!" );
  }
};

var myObject = Object.create( anotherObject );

myObject.doCool = function() {
  this.cool(); // 内部委托！
};

myObject.doCool(); // "cool!"
```

这里我们调用的 `myObject.doCool()` 是实际存在于 `myObject` 中的，这可以让我们的 `API` 设计更加清晰（不那么“神奇”）。从内部来说，我们的实现遵循的是委托设计模式，通过 `[[Prototype]]` 委托到 `anotherObject.cool()`。
## 对象

### 语法

对象可以通过两种形式定义：声明（文字）形式和构造形式。

```javascript
// 声明形式
var myObj = {
  key: value
  // ...
};
// 构造形式
var myObj = new Object();
myObj.key = value;
```

### 类型

在`JavaScript`中一共有七种主要类型（`Symbol`是`ES6`一种新加的类型）

- `string`
- `number`
- `boolean`
- `null`
- `undefined`
- `object`
- `Symbol`

简单基本类型：`string`、`boolean`、`number`、`null` 、`undefined` 和 `Symbol`

### 内置对象

`JavaScript` 中还有一些对象子类型，通常被称为内置对象

- `String`
- `Number`
- `Boolean`
- `Object`
- `Function`
- `Array`
- `Date`
- `RegExp`
- `Error`

原始值 `"I am a string"` 并不是一个对象，它只是一个字面量，并且是一个不可变的值。 如果要在这个字面量上执行一些操作，比如获取长度、访问其中某个字符等，那需要将其转换为 `String` 对象。

幸好，在必要时语言会自动把字符串字面量转换成一个 `String` 对象，也就是说你并不需要显式创建一个对象。

```javascript
var strPrimitive = "I am a string";
console.log( strPrimitive.length ); // 13
console.log( strPrimitive.charAt( 3 ) ); // "m"
```

使用以上两种方法，我们都可以直接在字符串字面量上访问属性或者方法，之所以可以这样做，是因为引擎自动把字面量转换成 `String` 对象，所以可以访问属性和方法。对于数值字面量和布尔字面量也是如此。

`null` 和 `undefined` 没有对应的构造形式，它们只有文字形式。相反，`Date`只有构造，没有文字形式。

对于 `Object`、`Array`、`Function` 和 `RegExp`（正则表达式）来说，无论使用文字形式还是构造形式，它们都是对象，不是字面量。

### 内容

```javascript
var myObject = {
  a: 2
};
myObject.a; // 2
myObject["a"]; // 2
```

`.a` 语法通 常被称为“属性访问”，`["a"]` 语法通常被称为“键访问”

区别：`.` 操作符要求属性名满足标识符的命名规范，而 `[".."]` 语法可以接受任意 `UTF-8/Unicode` 字符串作为属性名。如果要引用名称为 `"Super-Fun!"` 的属性，那就必须使用 `["Super-Fun!"]` 语法访问，因为 `Super-Fun!` 并不是一个有效 的标识符属性名。

在对象中，属性名永远都是字符串。如果你使用 `string`（字面量）以外的其他值作为属性名，那它首先会被转换为一个字符串。

```javascript
var myObject = { };
myObject[true] = "foo";
myObject[3] = "bar";
myObject[myObject] = "baz";

myObject["true"]; // "foo"
myObject["3"]; // "bar"
myObject["[object Object]"]; // "baz"
```

#### 1. 可计算属性名

如果需要通过表达式来计算属性名，`[..]`这种属性访问语法可以实现，如 `myObject[prefix + name]`。但是声明形式无法这样做。

```javascript
var prefix = "foo";

var myObject = {
  [prefix + "bar"]:"hello",
  [prefix + "baz"]: "world"
};

myObject["foobar"]; // hello
myObject["foobaz"]; // world
```

#### 2. 属性与方法

即使在对象的声明形式中声明一个函数表达式，这个函数也不会“属于”这个对象—— 它们只是对于相同函数对象的多个引用

#### 3. 数组

数组也是对象，虽然每个下标都是整数，但仍然可以给数组添加属性：

```javascript
var myArray = [ "foo", 42, "bar" ];

myArray.baz = "baz";

myArray.length; // 3

myArray.baz; // "baz"
```

虽然添加了命名属性，数组的 `length` 值并未发生变化。

虽然可以把数组当作一个普通的键 / 值对象来使用，并且不添加任何数值索引，但并不推荐这样做。因为数组和普通的对象都根据其对应的行为和用途进行了优化，所以 **最好只用对象来存储键 / 值对，只用数组来存储数值下标 / 值对**。



注意：如果你试图向数组添加一个属性，但是属性名“看起来”像一个数字，那它会变成一个数值下标（因此会修改数组的内容而不是添加一个属性）：

```javascript
var myArray = [ "foo", 42, "bar" ];

myArray["3"] = "baz";

myArray.length; // 4

myArray[3]; // "baz"
```

#### 4. 复制对象

```javascript
// 深拷贝的一种形式
var newObj = JSON.parse( JSON.stringify( someObj ) );
```

此方法的使用前提是必须保证 `JSON` 是安全的，当 `JSON` 是不安全的时候会有如下问题：

1. 会忽略 `undefined`
2. 会忽略 `symbol`
3. 不能序列化函数
4. 不能解决循环引用的对象
5. 不能正确处理`new Date()`
6. 不能处理正则

```javascript
// 浅复制的一种形式
var newObj = Object.assign( {}, myObject );

newObj.a; // 2
newObj.b === anotherObject;    // true
newObj.c === anotherArray;     // true
newObj.d === anotherFunction;  // true
```

#### 5. 属性描述符

```javascript
// 获取属性描述符
var myObject = {
  a:2
};

Object.getOwnPropertyDescriptor( myObject, "a" );
// {
//   value: 2,
//   writable: true,
//   enumerable: true,
//   configurable: true
// }
```

- `Writable` 决定是否可以修改属性的值

- `Configurable` 属性配置，若是可配置的，就可以使用 `defineProperty(...)` 方法来修改属性描述符

  不管是不是处于严格模式，尝试修改一个不可配置的属性描述符都会出错。有个小例外：`configurable: false` 的情况下，`writable` 的状态可以由 `true` 改为 `false`，但是无法由 `false` 改为 `true`。

  `configurable` 可以由 `true` 改为 `false` ，但是反过来不行（`configurable` 由 `false` 修改为 `true`），这是单向操作，无法撤销。

  除了无法修改，`configurable:false` 还会禁止删除这个属性

- `Enumerable` 这个描述符控制的是属性是否会出现在对象的属性枚举中，比如说 `for..in` 循环

#### 6. 不变性

- ##### 对象常量

  结合 `writable:false` 和 `configurable:false` 就可以创建一个真正的常量属性（不可修改、重定义或者删除）：

  ```javascript
  var myObject = {};
  Object.defineProperty( myObject, "FAVORITE_NUMBER", {
    value: 42,
    writable: false,
    configurable: false
  } );
  ```

- ##### 禁止扩展

  想禁止一个对象添加新属性并且保留已有属性，可以使用 `Object.preventExtensions(..)`：

  ```javascript
  var myObject = {
    a:2
  };
  
  Object.preventExtensions( myObject );
  myObject.b = 3;
  myObject.b; // undefined
  ```

- ##### 密封

  `Object.seal(..)` 会创建一个“密封”的对象，这个方法实际上会在一个现有对象上调用 `Object.preventExtensions(..)` 并把所有现有属性标记为 `configurable:false`。 所以，密封之后不仅不能添加新属性，也不能重新配置或者删除任何现有属性（**虽然可以修改属性的值**）。

- ##### 冻结

  `Object.freeze(..)` 会创建一个冻结对象，这个方法实际上会在一个现有对象上调用 `Object.seal(..)` 并把所有“数据访问”属性标记为 `writable:false`，这样就无法修改它们的值。

  这个方法是你可以应用在对象上的 **级别最高的不可变性**，它会禁止对于对象本身及其任意直接属性的修改（**不过这个对象引用的其他对象是不受影响的**）。

  你可以“深度冻结”一个对象，具体方法为，首先在这个对象上调用 `Object.freeze(..)`， 然后遍历它引用的所有对象并在这些对象上调用 `Object.freeze(..)`。但是一定要小心，因为这样做有可能会在无意中冻结其他（共享）对象。

#### 7. [[Get]]

```javascript
var myObject = {
  a: 2
};
myObject.a; // 2
```

在语言规范中，`myObject.a` 在 `myObject` 上实际上是实现了 `[[Get]]` 操作（有点像函数调 用：`[[Get]]`）。对象默认的内置 `[[Get]]` 操作首先在对象中查找是否有名称相同的属性， 如果找到就会返回这个属性的值。

 然而，如果没有找到名称相同的属性，按照 `[[Get]]` 算法的定义会执行另外一种非常重要的行为（其实就是遍历可能存在的 `[[Prototype]]` 链， 也就是原型链）。

#### 8. [[Put]]

`[[Put]]` 被触发时，实际的行为取决于许多因素，包括对象中是否已经存在这个属性（这是最重要的因素）。 

如果已经存在这个属性，`[[Put]]` 算法大致会检查下面这些内容。

1. 属性是否是访问描述符？如果是并且存在 `setter` 就调用 `setter`。
2. 属性的数据描述符中 `writable` 是否是 `false` ？如果是，在非严格模式下静默失败，在严格模式下抛出 `TypeError` 异常。
3. 如果都不是，将该值设置为属性的值。

#### 9. Getter 和 Setter

对象默认的 `[[Put]]` 和 `[[Get]]` 操作分别可以控制属性值的设置和获取。

```javascript
var myObject = {
  // 给 a 定义一个 getter
  get a() {
    return 2;
  }
};
Object.defineProperty(
  myObject, // 目标对象
  "b", // 属性名
  { // 描述符
    // 给 b 设置一个 getter
    get: function(){ return this.a * 2 },
    // 确保 b 会出现在对象的属性列表中
    enumerable: true
  }
);
myObject.a; // 2
myObject.b; // 4
```

```javascript
var myObject = {
  // 给 a 定义一个 getter
  get a() {
    return this._a_;
  },
  // 给 a 定义一个 setter
  set a(val) {
   this._a_ = val * 2;
  }
};
myObject.a = 2;
myObject.a; // 4
```

#### 10. 存在性

以在不访问属性值的情况下判断对象中是否存在这个属性：

```javascript
var myObject = {
  a:2
};

("a" in myObject); // true
("b" in myObject); // false

myObject.hasOwnProperty( "a" ); // true
myObject.hasOwnProperty( "b" ); // false
```

`in` 操作符会检查属性是否在对象及其 `[[Prototype]]` 原型链中；

`hasOwnProperty(..)` 只会检查属性是否在 `myObject` 对象中，不会检查 `[[Prototype]]` 链。

所有的普通对象都可以通过对于 `Object.prototype` 的委托来访问 `hasOwnProperty(..)`，但是有的对象可能没有连接到 `Object.prototype`（通过 `Object. create(null)` 来创建）。在这种情况下，形如 `myObejct.hasOwnProperty(..)` 就会失败。 这时可以使用一种更加强硬的方法来进行判断：`Object.prototype.hasOwnProperty.call(myObject, "a")`，它借用基础的 `hasOwnProperty(..)` 方法并把它显式绑定到 `myObject` 上。

```javascript
// 看起来 in 操作符可以检查容器内是否有某个值，但是它实际上检查的是某个属性名是否存在

(4 in [2, 4, 6])  // false

// 因为 [2, 4, 6] 这个数组中包含的属性名是 0、1、2，没有 4
```

- ##### 枚举

  ```javascript
  var myObject = { };
  Object.defineProperty(
    myObject,
    "a",
    // 让 a 像普通属性一样可以枚举
    { enumerable: true, value: 2 }
  );
  
  Object.defineProperty(
    myObject,
    "b",
    // 让 b 不可枚举
    { enumerable: false, value: 3 }
  );
  
  myObject.b; // 3
  ("b" in myObject);              // true
  myObject.hasOwnProperty( "b" ); // true
  
  // .......
  for (var k in myObject) {
    console.log( k, myObject[k] );
  }
  // "a" 2
  ```

  `myObject.b` 确实存在并且有访问值，但是却不会出现在 `for..in` 循环中（尽管 可以通过 `in` 操作符来判断是否存在）

  > **NOTE:** 在数组上应用 `for..in` 循环有时会产生出人意料的结果，因为这种枚举不 仅会包含所有数值索引，还会包含所有可枚举属性。最好只在对象上应用 `for..in` 循环，如果要遍历数组就使用传统的 `for` 循环来遍历数值索引。

  ```javascript
  var myObject = { };
  Object.defineProperty(
    myObject,
    "a",
    // 让 a 像普通属性一样可以枚举
    { enumerable: true, value: 2 }
  );
  
  Object.defineProperty(
    myObject,
    "b",
    // 让 b 不可枚举
    { enumerable: false, value: 3 }
  );
  
  myObject.propertyIsEnumerable( "a" );   // true
  myObject.propertyIsEnumerable( "b" );   // false
  
  Object.keys( myObject );                // ["a"]
  Object.getOwnPropertyNames( myObject ); // ["a", "b"]
  ```

  | 方法                             | 区别                                                         |
  | -------------------------------- | ------------------------------------------------------------ |
  | `propertyIsEnumerable(..)`       | 检查给定的属性名是否直接存在于对象中（而不是在原型链 上）并且满足 `enumerable:true` |
  | `Object.keys(..)`                | 返回一个数组，包含所有可枚举属性                             |
  | `Object.getOwnPropertyNames(..)` | 返回一个数组，包含所有属性，无论它们是否可枚举               |
  | `in`                             | 检查属性是否在对象及其 `[[Prototype]]` 原型链中              |
  | `hasOwnProperty(..)`             | 只会检查属性是否在对象中，不会检查 `[[Prototype]]` 原型链链  |

### 遍历

遍历数组下标时采用的是数字顺序（`for` 循环或者其他迭代器），但是遍历对象属性时的顺序是不确定的，在不同的 `JavaScript` 引擎中可能不一样。因此， 在不同的环境中需要保证一致性时，一定不要相信任何观察到的顺序，它们 是不可靠的。

可以给任何想遍历的对象定义 `@@iterator`，举例来说：

```javascript
var myObject = {
  a: 2,
  b: 3
};

Object.defineProperty( myObject, Symbol.iterator, {
  enumerable: false,
  writable: false,
  configurable: true,
  value: function() {
    var o = this;
    var idx = 0;
    var ks = Object.keys( o );
    return {
      next: function() {
        return {
          value: o[ks[idx++]],
          done: (idx > ks.length)
        };
      }
    };
  }
} );

// 手动遍历 myObject
var it = myObject[Symbol.iterator]();
it.next(); // { value:2, done:false }
it.next(); // { value:3, done:false }
it.next(); // { value:undefined, done:true }

// 用 for..of 遍历 myObject
for (var v of myObject) {
  console.log( v );
}
// 2
// 3
```


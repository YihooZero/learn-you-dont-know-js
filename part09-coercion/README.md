## 强制类型转换

### 值类型转换

`JavaScript` 中的强制类型转换总是返回标量基本类型值，如字符串、数字和布尔值，不会返回对象和函数。“封装”是为标量基本类型值封装一个相应类型的对象，但这并非严格意义上的强制类型转换。

**类型转换：隐式强制类型转换 + 显式强制类型转换**

```javascript
var a = 42;
var b = a + "";      // 隐式强制类型转换
var c = String( a ); // 显式强制类型转换
```

### 抽象值操作

#### 1.`ToString`

```javascript
// 1.07 连续乘以七个 1000
var a = 1.07 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;

// 七个1000一共21位数字
a.toString();        // "1.07e21"
String(null);        // "null"
String(undefined);   // "undefined"
String(true);        // "true"
String({});          // "[object Object]"
```

数组的默认 `toString()` 方法经过了重新定义，将所有单元字符串化以后再用 "`,`" 连接起来：

```javascript
var array = [1, 2, 3];
array.toString();   // "1,2,3"
```

##### `JSON` 字符串化

工具函数 `JSON.stringify(..)` 在将 `JSON` 对象序列化为字符串时也用到了 `ToString`。

对大多数简单值来说，`JSON` 字符串化和 `toString()` 的效果基本相同，只不过序列化的结果总是字符串：

```javascript
JSON.stringify( 42 );   // "42"
JSON.stringify( "42" ); // "\"42\"" （含有双引号的字符串）
JSON.stringify( null ); // "null"
JSON.stringify( true ); // "true"
```

所有安全的 `JSON` 值都可以使用 `JSON.stringify(..)` 字符串化。不安全的 `JSON` 值包括 **`undefined`、`function`、`symbol （ES6+）`和包含循环引用（对象之间相互引用，形成一个无限循环）的对象**。

`JSON.stringify(..)` 在对象中遇到 `undefined`、`function` 和 `symbol` 时会自动将其忽略，在数组中则会返回 `null`（以保证单元位置不变）。

```javascript
JSON.stringify( undefined );    // undefined
JSON.stringify( function(){} ); // undefined
JSON.stringify(
  [1,undefined,function(){},4]
);                              // "[1,null,null,4]"
JSON.stringify(
  { a:2, b:function(){} }
);                              // "{"a":2}"
```


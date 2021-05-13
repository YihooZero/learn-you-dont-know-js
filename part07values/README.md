## 值

### 数组

1. 使用 `delete` 运算符可以将单元从数组中删除，单元删除后，数组的 length 属性并不会发生变化。

   ```javascript
   var array = [1, 2, 3];
   delete array[1];
   
   console.log(array);         // [1, empty, 3] 特别注意empty是一个空的，占位符，理解为"空白单元"
   console.log(array[1]);      // undefined
   console.log(array.length);  // 3
   ```

   `array[1]` 的值为 `undefined`，但这与将其显式赋值为 `undefined（a[1] = undefined）`还是有所区别。

   `TODO:` 解释原因？

2. 数组也是对象，也可以包含字符串键值和属性（但这些并不计算在数组长度内）。

   ```javascript
   var a = [ ];
   
   a[0] = 1;
   a["foobar"] = 2;
   
   a.length;     // 1
   a["foobar"];  // 2
   a.foobar;     // 2
   ```

3. 如果字符串键值能够被强制类型转换为十进制数字的话，它就会被当作数字索引来处理。

   ```javascript
   var a = [ ];
   
   a["13"] = 42;
   
   a.length; // 14
   ```

#### 类数组

哪些是类数组： `DOM` 元素列表，`arguments` 对象等。


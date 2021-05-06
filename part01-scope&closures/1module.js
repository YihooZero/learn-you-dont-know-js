function CoolModule() {
  var something = "cool";
  var another = [1, 2, 3];
  function doSomething() {
    console.log( something );
  }
  function doAnother() {
    console.log( another.join( " ! " ) );
  }
  return {
    doSomething: doSomething,
    doAnother: doAnother
  };
}
var foo = CoolModule();
foo.doSomething(); // cool
foo.doAnother();   // 1 ! 2 ! 3

// 单例模式
// 将模块函数转换成立即调用函数，并将返回值直接赋给单例的模块实例标识符foo1
var foo1 = (function CoolModule() {
  var something = "cool";
  var another = [1, 2, 3];
  function doSomething() {
    console.log( something );
  }
  function doAnother() {
    console.log( another.join( " ! " ) );
  }
  return {
    doSomething: doSomething,
    doAnother: doAnother
  };
})();
foo1.doSomething(); // cool
foo1.doAnother();   // 1 ! 2 ! 3
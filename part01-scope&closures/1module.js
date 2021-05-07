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

// 模块接受参数
function CoolModule1(id) {
  function identify() {
    console.log( id );
  }
  return {
    identify: identify
  };
}
var module1 = CoolModule1( "foo 1" );
var module2 = CoolModule1( "foo 2" );

module1.identify(); // "foo 1"
module2.identify(); // "foo 2"

// 通过在模块实例的内部保留对公共 API 对象的内部引用，可以从内部对模块实例进行修
// 改，包括添加或删除方法和属性，以及修改它们的值
var fooAPI = (function CoolModule(id) {
  function change() {
// 修改公共 API
    publicAPI.identify = identify2;
  }
  function identify1() {
    console.log( id );
  }
  function identify2() {
    console.log( id.toUpperCase() );
  }
  var publicAPI = {
    change: change,
    identify: identify1
  };
  return publicAPI;
})( "foo module" );
fooAPI.identify(); // foo module
fooAPI.change();
fooAPI.identify(); // FOO MODULE
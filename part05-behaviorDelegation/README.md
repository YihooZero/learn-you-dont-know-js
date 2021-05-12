### 行为委托

#### 面向委托的设计

##### 1.类理论

假设我们需要在软件中建模一些类似的任务（`“XYZ”`、`“ABC”`等）。

如果使用类，那设计方法可能是这样的：定义一个通用父（基）类，可以将其命名为 `Task`，在 `Task` 类中定义所有任务都有的行为。接着定义子类 `XYZ` 和 `ABC`，它们都继承自 `Task` 并且会添加一些特殊的行为来处理对应的任务。

##### 2.委托理论

委托行为的思考：首先你会定义一个名为 `Task` 的对象（它既不是类也不是函数），它会包含所有任务都可以使用（写作使用，读作委托）的具体行为。接着， 对于每个任务（`“XYZ”`、`“ABC”`）你都会定义一个对象来存储对应的数据和行为。你会把特定的任务对象都关联到 `Task` 功能对象上，让它们在需要的时候可以进行委托。

你可以想象成，执行任务`“XYZ”`需要两个兄弟对象（`XYZ` 和 `Task`）协作完成。但是我们并不需要把这些行为放在一起，通过类的复制，我们可以把它们分别放在各自独立的对象中，需要时可以允许 `XYZ` 对象委托给 `Task`。

推荐代码形式：

```javascript
Task = {
  setID: function(ID) { this.id = ID; },
  outputID: function() { console.log( this.id ); }
};

// 让 XYZ 委托 Task
XYZ = Object.create( Task );

XYZ.prepareTask = function(ID,Label) {
  this.setID( ID );
  this.label = Label;
};

XYZ.outputTaskDetails = function() {
  this.outputID();
  console.log( this.label );
};

// ABC = Object.create( Task );
// ABC ... = ...
```

**在 `JavaScript` 中，`[[Prototype]]` 机制会把对象关联到其他对象**

对象关联风格的代码一些不同之处：

1. 在上面的代码中，`id` 和 `label` 数据成员都是直接存储在 `XYZ` 上（而不是 `Task`）。通常来说，在 `[[Prototype]]` 委托中最好把状态保存在委托者（`XYZ`、`ABC`）而不是委托目标 （`Task`）上。

2. 在类设计模式中，我们故意让父类（`Task`）和子类（`XYZ`）中都有 `outputTask` 方法，这样就可以利用重写（多态）的优势。在委托行为中则恰好相反：我们会尽量避免在 `[[Prototype]]` 链的不同级别中使用相同的命名。

3. `this.setID(ID)`；`XYZ` 中的方法首先会寻找 `XYZ` 自身是否有 `setID(..)`，但是 `XYZ` 中并没有这个方法名，因此会通过 `[[Prototype]]` 委托关联到 `Task` 继续寻找，这时就可以找到 `setID(..)` 方法。此外，由于调用位置触发了 `this` 的隐式绑定规则，因此虽然 `setID(..)` 方法在 `Task` 中，运行时 `this` 仍然会绑定到 `XYZ`，这正是我们想要的。 在之后的代码中我们还会看到 `this.outputID()`，原理相同。

   换句话说，我们和 `XYZ` 进行交互时可以使用 `Task` 中的通用方法，因为 `XYZ` 委托了 `Task`。

**委托行为**意味着某些对象`（XYZ）`在找不到属性或者方法引用时会把这个请求委托给另一个对象`（Task）`。

###### 互相委托（禁止）

你无法在两个或两个以上互相（双向）委托的对象之间创建循环委托。如果你把 `B` 关联到 `A` 然后试着把 `A` 关联到 `B`，就会出错。

之所以要禁止互相委托，是因为引擎的开发者们发现在设置时检查（并禁止！）一次无限循环引用要更加高效，否则每次从对象中查找属性时都需要进行检查。

###### 调试

```javascript
function Foo() {}

var a1 = new Foo();

a1;
```

`Chrome` 开发者工具的控制台 `a1` 会输出 `Foo {}`；`Firefox` 控制台 `a1` 会得到 `Object {}`。

`Chrome` 实际上想说的是“{} 是一个空对象，由名为 `Foo` 的函数构造”。`Firefox` 想说的是“{} 是一个空对象，由 `Object` 构造”。

###### 比较思维模型

“原型”面向对象风格：

```javascript
function Foo(who) {
  this.me = who;
}

Foo.prototype.identify = function() {
  return "I am " + this.me;
};

function Bar(who) {
  Foo.call( this, who );
}

Bar.prototype = Object.create( Foo.prototype );

Bar.prototype.speak = function() {
  alert( "Hello, " + this.identify() + "." );
};

var b1 = new Bar( "b1" );
var b2 = new Bar( "b2" );

b1.speak();
b2.speak();
```

子类 `Bar` 继承了父类 `Foo`，然后生成了 `b1` 和 `b2` 两个实例。`b1` 委托了 `Bar.prototype`，`Bar.prototype` 委托了 `Foo.prototype`。

对象关联风格：

```javascript
Foo = {
  init: function(who) {
    this.me = who;
  },   
  identify: function() {
    return "I am " + this.me;
  }
};

Bar = Object.create( Foo );

Bar.speak = function() {
  alert( "Hello, " + this.identify() + "." );
};

var b1 = Object.create( Bar );
b1.init( "b1" );
var b2 = Object.create( Bar );
b2.init( "b2" );

b1.speak();
b2.speak();
```

这段代码中我们同样利用 `[[Prototype]]` 把 `b1` 委托给 `Bar` 并把 `Bar` 委托给 `Foo`，和上一段代码一模一样。我们仍然实现了三个对象之间的关联。

但是非常重要的一点是，这段代码简洁了许多，我们只是把对象关联起来，并不需要那些既复杂又令人困惑的模仿类的行为（构造函数、原型以及 `new`）。

#### 类与对象

##### 1.控件"类"

在不使用任何“类”辅助库或者语法的情况下，使用纯 `JavaScript` 实现类风格的代码：

```javascript
// 父类
function Widget(width,height) {
  this.width = width || 50;
  this.height = height || 50;
  this.$elem = null;
}

Widget.prototype.render = function($where){
  if (this.$elem) {
    this.$elem.css( {
      width: this.width + "px",
      height: this.height + "px"
    } ).appendTo( $where );
  }
};

// 子类
function Button(width,height,label) {
  // 调用“super”构造函数
  Widget.call( this, width, height );
  this.label = label || "Default";
  this.$elem = $( "<button>" ).text( this.label );
}

// 让 Button“继承”Widget
Button.prototype = Object.create( Widget.prototype );

// 重写 render(..)
Button.prototype.render = function($where) {
  //“super”调用
  Widget.prototype.render.call( this, $where );
  this.$elem.click( this.onClick.bind( this ) );
};

Button.prototype.onClick = function(evt) {
  console.log( "Button '" + this.label + "' clicked!" );
};

$( document ).ready( function(){
  var $body = $( document.body );
  var btn1 = new Button( 125, 30, "Hello" );
  var btn2 = new Button( 150, 40, "World" );
  btn1.render( $body );
  btn2.render( $body );
} );
```

###### `ES6`的class语法糖

```javascript
class Widget {
  constructor(width,height) {
    this.width = width || 50;
    this.height = height || 50;
    this.$elem = null;
  }
  render($where){
    if (this.$elem) {
      this.$elem.css( {
        width: this.width + "px",
        height: this.height + "px"
      } ).appendTo( $where );
    }
  }
}

class Button extends Widget {
  constructor(width,height,label) {
    super( width, height );
    this.label = label || "Default";
    this.$elem = $( "<button>" ).text( this.label );
  }
  render($where) {
    super( $where );
    this.$elem.click( this.onClick.bind( this ) );
  }
  onClick(evt) {
    console.log( "Button '" + this.label + "' clicked!" );
  }
}

$( document ).ready( function(){
  var $body = $( document.body );
  var btn1 = new Button( 125, 30, "Hello" );
  var btn2 = new Button( 150, 40, "World" );
  btn1.render( $body );
  btn2.render( $body );
} );
```

##### 2.委托控件对象

对象关联风格委托来更简单地实现 `Widget/Button`：

```javascript
var Widget = {
  init: function(width,height){
    this.width = width || 50;
    this.height = height || 50;
    this.$elem = null;
  },
  insert: function($where){
    if (this.$elem) {
      this.$elem.css( {
        width: this.width + "px",
        height: this.height + "px"
      } ).appendTo( $where );
    }
  }
};

var Button = Object.create( Widget );

Button.setup = function(width,height,label){
  // 委托调用
  this.init( width, height );
  this.label = label || "Default";
  this.$elem = $( "<button>" ).text( this.label );
};

Button.build = function($where) {
  // 委托调用
  this.insert( $where );
  this.$elem.click( this.onClick.bind( this ) );
};

Button.onClick = function(evt) {
  console.log( "Button '" + this.label + "' clicked!" );
};

$( document ).ready( function(){
  var $body = $( document.body );

  var btn1 = Object.create( Button );
  btn1.setup( 125, 30, "Hello" );

  var btn2 = Object.create( Button );
  btn2.setup( 150, 40, "World" );

  btn1.build( $body );
  btn2.build( $body );
} );
```

使用对象关联风格来编写代码时不需要把 `Widget` 和 `Button` 当作父类和子类。相反， `Widget` 只是一个对象，包含一组通用的函数，任何类型的控件都可以委托，`Button` 同样只是一个对。（当然，它会通过委托关联到 `Widget` ！）

从设计模式的角度来说，我们并没有像类一样在两个对象中都定义相同的方法名 `render(..)`，相反，我们定义了两个更具描述性的方法名（`insert(..)` 和 `build(..)`）。同理，初始化方法分别叫作 `init(..)` 和 `setup(..)`。
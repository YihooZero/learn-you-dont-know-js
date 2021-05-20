## Promise

粗糙的回调方法处理异步问题，确保输出是可预测的

```javascript
function add(getX,getY,cb) {
  var x, y;
  getX( function(xVal){
    x = xVal;
    // 两个都准备好了？
    if (y != undefined) {
      cb( x + y ); // 发送和
    }
  } );
  getY( function(yVal){
    y = yVal;
    // 两个都准备好了？
    if (x != undefined) {
      cb( x + y ); // 发送和
    }
  } );
}

// fetchX() 和fetchY()是同步或者异步函数
add( fetchX, fetchY, function(sum){
  console.log( sum ); // 是不是很容易？
} ); 
```


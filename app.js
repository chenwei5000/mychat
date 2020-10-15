var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// 1.0 创建服务器连接的方法
const server = require('http').Server(app)
// 2.0 在创建的服务中，加入 websocket
const io = require('socket.io')(server)

// 2.1 监听客户端连接的事件
io.on('connect', socket => {
  // 多人聊天室
  // 获取当前登录者的信息
  // console.log(socket.request._query.users)
  const users = socket.request._query.users

  // 对其他用户进行广播
  socket.broadcast.emit('tips', `您的好友${users}已经上线了！`)

  // 监听客户端输入数据之后的事件
  socket.on('updateMsg', data => {
    socket.broadcast.emit('sendMsg', {
      data,
      users
    })
  })

})

// 3.0 挂载创建的服务器
server.listen(8888)

module.exports = app;


/*
  ** 聊天的基本功能
    // 2.2 通过 emit 方法给客户端传入消息
    socket.emit('msgs', '谁是这个世界上最美的女人')

    // 封装一个回复的方法
    function stc(str, time = 1000) {
      setTimeout(() => socket.emit('msgs', str), )
    }

    // 接受客户端发送的消息
    socket.on('sts', data => {
      // 搞一下自动回复
      switch(data) {
        case '陈凯': stc('你想多了。'); break;
        case '方云': stc('还挺漂亮的！'); break;
        case '周密': stc('你是我的女神~'); break;
        default: stc('你说的人还没有出生呢~');
      }
  })

*/

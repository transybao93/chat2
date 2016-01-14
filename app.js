var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
	users = {};
	var port = process.env.PORT || 3000;
server.listen(port);
// io.configure(function () { 
//   io.set("transports", ["xhr-polling"]); 
//   io.set("polling duration", 10); 
// });

app.get('/', function(req, res)
{
	res.sendFile(__dirname + '/UI.html');
});

//server nhận data từ client
io.sockets.on('connection', function(socket){
	

	//nhận data new user
	socket.on('new user', function(data, callback){
		if(data in users)
		{
			callback(false);
		}else{
			callback(true);
			socket.nickname = data;
			users[socket.nickname] = socket;
			updateNickName();
		}
	});


	function updateNickName()
	{
		io.sockets.emit('usernames', Object.keys(users));
	}
	//nhận thông tin từ client
	socket.on('send mess', function(data, callback)
	{

		// var datetime = new Date().today() + " @ " + new Date().timeNow();
		//io.sockets.emit('new mess', {msg: data, nick: socket.nickname});
		var msg = data.trim();
		if(msg.substr(0,1) === '#')
		{
			//ind = #bao_
			var ind = msg.indexOf(' ');
			if(ind != -1)
			{
				var name = msg.substr(1, ind-1);
				var msg = msg.substring(ind + 1);
				console.log('Check index');
				console.log(ind + ' - ' + name + ' : ' + msg);
				if(name in users)
				{
					console.log('Hashtag');
					console.log(ind + ' - ' + name + ' : ' + msg);
					//send private
					users[name].emit('hashtag', {msg: msg, nick: socket.nickname});
					//send public
					io.sockets.emit('new mess', {msg: data, nick: socket.nickname});
				}else{
					callback('Lỗi : Không tồn tại người dùng này');
				}
				
			}else{
				console.log('Error');
				callback('Lỗi : Vui lòng nhập nội dung');
			}
		}else{
			//send data lại cho client
			io.sockets.emit('new mess', {msg: msg, nick: socket.nickname});
		}
		
	});

	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNickName();
	});

	//user image
	socket.on('user image', function (msg, callback) {
      // console.log(msg);
      socket.broadcast.emit('user image', socket.nickname, msg);
      callback(socket.nickname);
    });
});

//private chat message updatered
var net = require('net');

var server = net.createServer(function(socket) {
	socket.write('Echo server\r\n');
	socket.pipe(socket);
});

server.on('error', function(err) {
   console.log(err)
})


server.listen(8080, "rustnstardust.com");

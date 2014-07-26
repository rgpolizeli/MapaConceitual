function Servidor(Ip,porta){
	
	var WSServer;
    var http;
    var numClientesConectados;
    var ip = Ip;
    var portaConexao = porta;
    var server;
    var sockets;
    var webSocketServer;
    var servidor = this;
    
    http = require('http');
    WSServer = require('websocket').server;

    server = http.createServer(function (req, res) {
    	  
		  res.writeHead(200);
    	  res.end();
    }).listen(portaConexao, ip);

    webSocketServer = new WSServer({httpServer: server,  autoAcceptConnections: false});
    numClientesConectados = 0;
    sockets = new Array();

    webSocketServer.on('request', function (request){
    	atenderRequisicaoConexao(request);
    });
    
    
    
    

    var atenderRequisicaoConexao = function(request) {
    	
    	//if(checarOrigemConexao(request) == 1){
			sockets[numClientesConectados] = request.accept(null, request.origin);
        	
			sockets[numClientesConectados].send('Voce e o cliente ' + numClientesConectados);
        	
        	sockets[numClientesConectados].on('message', function(data){
        		servidor.receberMensagemDoCliente(data,this);
        	});
        	
        	sockets[numClientesConectados].on('close', function (code, desc){
        		console.log('Cliente: ' + sockets.indexOf(this) + ' desconectou-se.');
        	});
        	
        	numClientesConectados++;
    	//}
    	//else{
    	//	request.reject();
    	//}
    	
    };

    var checarOrigemConexao = function(request) {
    	var url = require('url');
		var accept = [ 'localhost', '127.0.0.1' ];
		
    	request.origin = request.origin || '*'; //no origin? Then use * as wildcard.
    	if (accept.indexOf(url.parse(request.origin).hostname) === -1) {
    		console.log('disallowed ' + request.origin);
    		return 0;
    	}
    	else
    		return 1;
    };

    this.enviarMensagemAosClientes = function(mensagem,socket) {
		
		for(var j=0; j < numClientesConectados; j++){
			if(j != sockets.indexOf(socket)){
				console.log('O cliente: '+ sockets.indexOf(socket) + ' esta enviando uma mensagem.');
				sockets[j].send(mensagem);
			}	
		}
	};

    this.receberMensagemDoCliente = function(data,socket) {
    	console.log(data);
        servidor.enviarMensagemAosClientes(data.utf8Data, socket);
    };
}

new Servidor("127.0.0.1", 9000);

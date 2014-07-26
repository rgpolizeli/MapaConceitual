

function Servidor(Ip,Porta){

	var ip = Ip;
	var porta = Porta;
	
	
	var jsdom = require("jsdom");
	var $  = require('jquery')(jsdom.jsdom().createWindow());
	
	
	var express = require('express');
	var session = require('express-session');
	var path = require('path');
	var favicon = require('static-favicon');
	var logger = require('morgan');
	var cookieParser = require('cookie-parser');
	var bodyParser = require('body-parser');
	var io = require('socket.io')(http);
	
	var mysql = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user: 'root',
	  password: 'ricardo',
	  database: 'mapas'
	});
	
	//armazena o id do usuario e seu socket
	var Usuario = function(idUsuario,socket){
		this.idUsuario = idUsuario;
		this.socket = socket;
	};

	//armazena o id de um mapa aberto e seu sincronizador
	var MapasAbertos = function(idMapa,sincronizador){
		this.idMapa = idMapa;
		this.sincronizador = sincronizador;
	};
	
	
	var listaUsuarios; //lista dos usuarios conectados
	var listaSincronizadores; //lista dos mapas abertos e seus sinc.

	
	var events = require('events');
	//var eventEmitter = new events.EventEmitter();

	var Passport = require('./Passport.js');
	var passport;
	
	var routes = require('./routes/routes');

	var app = express();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	
	var GerenciadorBanco = require('./GerenciadorBanco.js');
	var gerenciadorBanco;
	
	var GerenciadorArquivos = require('./GerenciadorArquivos.js');
	var gerenciadorArquivos;

	
	var Sincronizador = require('./Sincronizador.js');
	
	

	this.iniciar = function(){
		
		
		app.use(express.static(path.join(__dirname, 'public')));
		
		// view engine setup
		app.set('views', path.join(__dirname, 'views'));
		app.set('view engine', 'ejs'); // set up ejs for templating

		app.use(favicon());
		app.use(logger('dev'));
		app.use(cookieParser('h4s9omm'));
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded());
		app.use(session({ secret: 'h4s9omm', saveUninitialized: true, resave: true}));

		connection.connect();
		
		listaUsuarios = new Array();
		listaSincronizadores = new Array();
		
		passport = new Passport(connection);
		
		gerenciadorBanco = new GerenciadorBanco();
		
		gerenciadorArquivos = new GerenciadorArquivos();

		app.use(passport.ppt.initialize());
		app.use(passport.ppt.session());

		//definindo as routes
		app.get('/', function(req,res){
			if(!req.isAuthenticated()){
				routes.pagina(req,res,'index',null);
			}
			else{
				return res.redirect('/mapas');
			}
			
		});
		
		//definindo as routes
		app.get('/cadastrar', function(req,res){
			routes.pagina(req,res,'cadastrar',null);
		});
		
		app.get('/mapas', passport.verificarAutenticacao, function(req,res){
			
			gerenciadorBanco.perquisarMapas(req.user.id);
			
			//a variavel receptora do evento deve ser a mesma que emitiu.
			//once ao inves de on, pois o evento emitido num outro login continua valendo para relogin, executando routes.pagina duas vezes.
			gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
				routes.pagina(req,res,'mapas', {mensagem:mapas});
			});
			
		});
		
		app.post('/cadastrar', function(req,res){
			routes.cadastrar(req,res,connection);		
		});
		
		app.post('/abrir', function(req,res){
			var msg = {
					idUsuario:req.user.id, 
					idMapa: req.body.optionsRadios
			};
			routes.pagina(req,res,'editarMapa', msg);
		});
		
		app.post(
			'/autenticar',
			function(req,res,next){
				passport.ppt.authenticate(
					'local', 
					function(err, user){
						if(err){
							console.log(err);
							return res.redirect('/');
						}
						else{
							if(!user){
								return res.redirect('/');
							}
							else{
								req.login(user, function(err) {
									if (err) { return next(err); }
									return res.redirect('/mapas');
								});
								
							}
						}
					}
				)(req,res,next);	
			}
		);
		
		io.on('connection', function(socket){
			
			socket.on('conexao', function (idUsuarioP, idMapaP){ 
				
				var idUsuario = parseInt(idUsuarioP);
				var idMapa = parseInt(idMapaP);
				
				adicionarUsuario(idUsuario, socket);
				
				//abrindo arquivo XML
				if(gerenciadorArquivos.buscarMapaNaLista( idMapa ) == -1){
					gerenciadorArquivos.abrirMapa(idMapa);
	    		}
				
				//adicionando sincronizador
				if(buscarPosicaoSincronizadorNaLista(idMapa) == -1){
					var sincronizador = new Sincronizador(idMapa);
	    			adicionarSincronizador(idMapa, sincronizador);
				}
				
				//lista estruturada em html para o usuario carregar o mapa
				var msg = montarListaHtml(gerenciadorArquivos.getMapa(idMapa));
				socket.send(msg);
				
				console.log("Usuario #" + idUsuario + " conectou-se.");
			});
			
			socket.on('message', function (mensagem){
				if(mensagem[0] == "<"){
					switch(mensagem[1]){
						case "1": //novo conceito criado por um usuario
				    		
				    		mensagem = mensagem.replace("1","");
				    		
				    		var idMapa = $(mensagem).children("li[title='idMapa']").text();
				    		idMapa = parseInt(idMapa);
				    		msg = msg.replace("<li title='idMapa'>" + idMapa + "</li>","");
				    		
				    		var conceito = {
				    				idConceito : gerenciadorArquivos.buscarIdDisponivel(idMapa),
									texto : $(mensagem).children("li[title='texto']").text(),
									fonte : $(mensagem).children("li[title='fonte']").text(),
									tamanhoFonte : $(mensagem).children("li[title='tamanhoFonte']").text(),
									corFonte : $(mensagem).children("li[title='corFonte']").text(),
									corFundo : $(mensagem).children("li[title='corFundo']").text()
				    		};
				    		
							//inserir no arquivo xml
				    		gerenciadorArquivos.adicionarConceito(idMapa, conceito);
							
					        socket.broadcast.send(msg); //manda para todos menos para socket
					        socket.send(msg);
						break;
						/*
						case "*": //conceito movido por algum usuario
							mensagem = mensagem.replace("*","");
							usuario.atualizarPosicaoConceito(mensagem);
						break;
						case "!": //ligacao criada por algum usuario
							mensagem = mensagem.replace("!","");
							var idLigacao = parseInt($(mensagem).attr("id"));
							var idLinhaPai = $(mensagem).children("li[title='idLinhaPai']").val();
							var idLinhaFilho = $(mensagem).children("li[title='idLinhaFilho1']").val();
							var idConceitoPai = $(mensagem).children("li[title='idConceitoPai']").val();
							var idConceitoFilho = $(mensagem).children("li[title='idConceitoFilho1']").val();
							var texto = $(mensagem).children("li[title='texto']").text();
							var fonte = $(mensagem).children("li[title='fonte']").text();
							var tamanhoFonte = $(mensagem).children("li[title='tamanhoFonte']").text();
							var corFonte = $(mensagem).children("li[title='corFonte']").text();
							var corFundo = $(mensagem).children("li[title='corFundo']").text();
							usuario.criarLigacao(1, mapaAtual, texto, fonte, tamanhoFonte, corFonte, corFundo, idLigacao, idLinhaPai,idLinhaFilho, idConceitoPai, idConceitoFilho, mensagem);
					        
						break;
						case "(": //nova SemiLigacao
							mensagem = mensagem.replace("(","");
							var qtdFilhos =  $(mensagem).children("li[title='qtdFilhos']").val();
							var idConceito = $(mensagem).children("li[title='idConceitoFilho"+ qtdFilhos +"']").val();
							var idLigacao = parseInt($(mensagem).attr("id"));
							var idLinha = $(mensagem).children("li[title='idLinhaFilho"+ qtdFilhos +"']").val();
							usuario.criarSemiLigacao(1, mapaAtual, idConceito, idLigacao, idLinha, mensagem);
						break;
						case "+": //palavra de ligacao movida por algum usuario
							mensagem = mensagem.replace("+","");
							usuario.atualizarPosicaoLigacao(mensagem);
						break;
						case "5": //exclusao
							mensagem = mensagem.replace("5","");
							usuario.excluir($(mensagem).val(), 1);
						break;
						*/
					}
				}
			});
			
			socket.on('novoConceito', function (msg){ 
				var idConceito = msg.idConceito;
				var texto = msg.texto;
				var fonte = msg.fonte;
				var tamanhoFonte = msg.tamanhoFonte;
				var corFonte = msg.corFonte;
				var corFundo = msg.corFundo;
		        
				var resultado = true;//inserirConceito(idConceito, texto, fonte, tamanhoFonte, corFonte, corFundo);
				
				if(resultado){
					socket.emit('ok');
					socket.broadcast.emit('novoConceito', msg);
				}
				else
					socket.emit('erro');
			});
			
			socket.on('novaLigacao', function (msg){ 
				
				var idConceitoPai = msg.idConceitoPai;
				var idConceitoFilho = msg.idConceitoFilho;
				var idLigacao = msg.idLigacao;
				var idLinhaPai = msg.idLinhaPai;
				var idLinhaFilho = msg.idLinhaFilho;
				var texto = msg.texto;
				var fonte = msg.fonte;
				var tamanhoFonte = msg.tamanhoFonte;
				var corFonte = msg.corFonte;
				var corFundo = msg.corFundo;
		        
				var resultado = true;//inserirLigacao(idConceito, texto, fonte, tamanhoFonte, corFonte, corFundo);
				
				if(resultado){
					socket.emit('ok');
					socket.broadcast.emit('novaLigacao', msg);
				}
				else
					socket.emit('erro');
			});
			
			socket.on('novaSemiLigacao', function (msg){ 
				
			});
			
			
			socket.on('disconnect', function () { 
				var id = removerUsuario(socket);
				console.log("Usuario #" + id + " desconectou-se.");
			});
			
		});
		
		return http.listen(porta,ip);		
	};
	
	function montarListaHtml(arqXml){
		
		var lista = "<0div id='lista'>";
		
		$(arqXml).find('conceito').each( function( index, element ){
			
			var idConceito = $( element ).find( 'id' ).text();
			var x = $( element ).find( 'x' ).text();
			var y = $( element ).find( 'y' ).text();
			var texto = $( element ).find( 'texto' ).text();
			var fonte = $( element ).find( 'fonte' ).text();
			var tamanhoFonte = $( element ).find( 'tamanhoFonte' ).text();
			var corFonte = $( element ).find( 'corFonte' ).text();
			var corFundo = $( element ).find( 'corFundo' ).text();
			
			
			var itemLista = 
				"<ul id='" + idConceito + "' title='conceito'>" + 
				"<li title='x'>" + x + "</li>" +
				"<li title='y'>" + y + "</li>" +
				"<li title='texto'>" + texto + "</li>" +
				"<li title='fonte'>" + fonte + "</li>" +
				"<li title='tamanhoFonte'>" + tamanhoFonte + "</li>" +
				"<li title='corFonte'>" + corFonte + "</li>" +
				"<li title='corFundo'>" + corFundo + "</li>" + 
				"</ul>"
			;
			
			lista += itemLista;
		});
		
		$(arqXml).find('palavraLigacao').each( function( index, element ){
			
			var idLigacao = $( element ).find( 'id' ).text();
			var idConceitoPai = $( element ).find( 'idConceitoPai' ).text();
			var idConceitoFilho = $( element ).find( 'idConceitoFilho1' ).text();
			
			
			var idLinhaPai = $( element ).find( 'idLinhaPai' ).text();
			var idLinhaFilho = $( element ).find( 'idLinhaFilho1' ).text();
			var x = $( element ).find( 'x' ).text();
			var y = $( element ).find( 'y' ).text();
			var texto = $( element ).find( 'texto' ).text();
			var fonte = $( element ).find( 'fonte' ).text();
			var tamanhoFonte = $( element ).find( 'tamanhoFonte' ).text();
			var corFonte = $( element ).find( 'corFonte' ).text();
			var corFundo = $( element ).find( 'corFundo' ).text();
			var qtdFilhos = $( element ).find('qtdFilhos').val();
			
			var itemLista = 
				"<ul id='" + idLigacao + "' title='ligacao'>" + 
				"<li title='qtdFilhos' value='" + qtdFilhos + "'></li>" +
				"<li title='idLinhaPai' value='" + idLinhaPai + "'></li>" +
				"<li title='idLinhaFilho1' value='" + idLinhaFilho + "'></li>" +
				"<li title='idConceitoPai' value='" + idConceitoPai + "'></li>" +
				"<li title='idConceitoFilho1' value='" + idConceitoFilho + "'></li>" +
				"<li title='x' value='" + x + "'></li>" +
				"<li title='y' value='" + y + "'></li>" +
				"<li title='texto'>" + texto + "</li>" +
				"<li title='fonte'>" + fonte + "</li>" +
				"<li title='tamanhoFonte'>" + tamanhoFonte + "</li>" +
				"<li title='corFonte'>" + corFonte + "</li>" +
				"<li title='corFundo'>" + corFundo + "</li>" 
			;
			
			for(var j = 2; j <= qtdFilhos; j++){
				idLinhaFilho = $( element ).find('idLinhaFilho' + i).val();
				idConceitoFilho = $( element ).find('idConceitoFilho' + i).val();
				
				mensagem += "<li title='idLinhaFilho"+ i +"' value='" + idLinhaFilho + "'></li>" + 
					"<li title='idConceitoFilho" + i + "' value='" + idConceitoFilho + "'></li>";
				
				i++;		
			}
			
			lista += itemLista;
			
		});
		
		lista += "</div>";
		
		return lista;
		
	}
	
	
	
	function removerUsuario(socket){
		var i = buscarPosicaoUsuarioNaLista(null, socket);
		var id = listaUsuarios[i].idUsuario;
		listaUsuarios[i] = undefined;
		
		return id;
	}
	
	function adicionarUsuario(idUsuario, socket){
		
		var i = 0;
		while(listaUsuarios[i]!= undefined)
			i++;
		listaUsuarios[i] = new Usuario(idUsuario, socket);
		
	}
	
	function buscarPosicaoUsuarioNaLista(idUsuario,socket){
		var i = 0;
		
		if(idUsuario){
			while(listaUsuarios[i].idUsuario != idUsuario)
				i++;
			return i;
		}
		else{
			while(listaUsuarios[i].socket != socket)
				i++;
			return i;
		}
		
	}
	
	
	function removerSincronizador(idMapa){
		var i = buscarPosicaoSincronizadorNaLista(idMapa);
		var id = listaSincronizadores[i].idMapa;
		listaSincronizadores[i] = undefined;
		
		return id;
	}
	
	function adicionarSincronizador(idMapa, sincronizador){
		
		var i = 0;
		while(listaSincronizadores[i]!= undefined)
			i++;
		listaSincronizadores[i] = new MapasAbertos(idMapa, sincronizador);
		
	}
	
	function buscarPosicaoSincronizadorNaLista(idMapa){
		var i = 0;
		
		//se estiver vazia
		if(listaSincronizadores.length == 0){
			i = -1;
		}
		else{
			while(listaSincronizadores[i].idMapa != idMapa && i <= listaSincronizadores.length)
				i++;
			
			//se nao encontrar
			if(i > listaSincronizadores.length)
				i = -1;
		}
		
		return i;
	}
	
	
}

	var servidor = new Servidor('localhost',3000);
	console.log(servidor.iniciar());

	console.log(servidor);

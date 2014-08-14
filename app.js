

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
				if(gerenciadorArquivos.buscarPosicaoMapaNaLista( idMapa ) == -1){
					gerenciadorArquivos.abrirMapa(idMapa);
	    		}
				
				//adicionando sincronizador
				var posicao = buscarPosicaoSincronizadorNaLista(idMapa);
				
				//se for o primeiro usuario a abrir o mapa
				if( posicao == -1){
					var sincronizador = new Sincronizador(idMapa);
					sincronizador.inserirUsuarioNaLista(idUsuario);
	    			adicionarSincronizador(idMapa, sincronizador);
				}
				else{ //se algum outro usuario ja estiver ativo no mapa
					listaSincronizadores[ posicao ].sincronizador.inserirUsuarioNaLista(idUsuario);
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
				    		
				    		mensagem = mensagem.replace("<1ul","<ul");
				    		var idMapa = $(mensagem).children("li[title='idMapa']").text();
				    		idMapa = parseInt(idMapa);
				    		
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
				    		
				    		
				    		mensagem = mensagem.replace("<li title='idMapa'>" + idMapa + "</li>","");
				    		mensagem = mensagem.replace("<ul>", ("<1ul id='" + conceito.idConceito + "'>") );
				    		
				    		//manda para todos os usuarios, inclusive quem criou o conceito
				    		enviarParaTodosUsuariosAtivos(idMapa, mensagem);
						break;
						
						case "2": //conceito movido por algum usuario
							mensagem = mensagem.replace("<2ul","<ul");
							
							var idMapa = $(mensagem).children("li[title='idMapa']").text();
				    		idMapa = parseInt(idMapa);
				    		
				    		var conceito = {
				    				idConceito : parseInt( $(mensagem).attr("id") ),
									novoX : $(mensagem).children("li[title='x']").val(),
									novoY : $(mensagem).children("li[title='y']").val()
				    		};
				    		
							//inserir no arquivo xml
				    		gerenciadorArquivos.alterarPosicaoConceito(idMapa, conceito);
				    		
				    		mensagem = mensagem.replace("<li title='idMapa'>" + idMapa + "</li>","");
				    		mensagem = mensagem.replace("<ul","<2ul");
				    		
				    		//manda para todos os usuarios, inclusive quem criou o conceito
				    		enviarBroadcastParaUsuariosAtivos(idMapa, mensagem, socket);
						break;
						
						case "3": //ligacao criada por algum usuario
							mensagem = mensagem.replace("<3ul","<ul");
							
							var idMapa = $(mensagem).children("li[title='idMapa']").text();
				    		idMapa = parseInt(idMapa);
				    		
				    		var ligacao = {
				    				idLigacao : gerenciadorArquivos.buscarIdDisponivel(idMapa),
				    				idLinhaPai : gerenciadorArquivos.buscarIdDisponivel(idMapa),
				    				idLinhaFilho1 :  gerenciadorArquivos.buscarIdDisponivel(idMapa),
				    				idConceitoPai : $(mensagem).children("li[title='idConceitoPai']").val(), 
				    				idConceitoFilho1 : $(mensagem).children("li[title='idConceitoFilho1']").val(), 
									texto : $(mensagem).children("li[title='texto']").text(),
									fonte : $(mensagem).children("li[title='fonte']").text(),
									tamanhoFonte : $(mensagem).children("li[title='tamanhoFonte']").text(),
									corFonte : $(mensagem).children("li[title='corFonte']").text(),
									corFundo : $(mensagem).children("li[title='corFundo']").text()
				    		};
				    		
				    		//inserir no arquivo xml
				    		gerenciadorArquivos.adicionarLigacao(idMapa, ligacao);
				    		
				    		
				    		mensagem = mensagem.replace("<li title='idMapa'>" + idMapa + "</li>","");
				    		mensagem = mensagem.replace("<ul>", ("<3ul id='" + ligacao.idLigacao + "' title='ligacao'>") );
				    		mensagem += "<li title='idLinhaPai' value='" + ligacao.idLinhaPai + "'></li>";
				    		mensagem += "<li title='idLinhaFilho1' value='" + ligacao.idLinhaFilho1 + "'></li>";
				    		
				    		
				    		//manda para todos os usuarios, inclusive quem criou o conceito
				    		enviarParaTodosUsuariosAtivos(idMapa, mensagem);
					        
						break;
						case "4": //palavra de ligacao movida por algum usuario +
							mensagem = mensagem.replace("<4ul","<ul");
							
							var idMapa = $(mensagem).children("li[title='idMapa']").text();
				    		idMapa = parseInt(idMapa);
							
				    		var ligacao = {
				    				idLigacao : parseInt( $(mensagem).attr("id") ),
									novoX : $(mensagem).children("li[title='x']").val(),
									novoY : $(mensagem).children("li[title='y']").val()
				    		};
				    		
							//inserir no arquivo xml
				    		gerenciadorArquivos.alterarPosicaoLigacao(idMapa, ligacao);
				    		
				    		mensagem = mensagem.replace("<li title='idMapa'>" + idMapa + "</li>","");
				    		mensagem = mensagem.replace("<ul","<4ul");
				    		
				    		//manda para todos os usuarios, exceto para quem criou a ligacao
				    		enviarBroadcastParaUsuariosAtivos(idMapa, mensagem, socket);
						break;
						
						case "5": //nova SemiLigacao
							mensagem = mensagem.replace("<5ul","<ul");
							
							var idMapa = $(mensagem).children("li[title='idMapa']").text();
				    		idMapa = parseInt(idMapa);
				    		
				    		var novaQtdFilhos =  $(mensagem).children("li[title='qtdFilhos']").val();
				    		
				    		var semiLigacao = {
				    				idLigacao : parseInt($(mensagem).attr("id")),
				    				idConceito : $(mensagem).children("li[title='idConceitoFilho"+ novaQtdFilhos +"']").val(),
				    				idLinha :  gerenciadorArquivos.buscarIdDisponivel(idMapa),
				    				novaQtdFilhos : novaQtdFilhos
				    		};
				    		
				    		//inserir no arquivo xml
				    		gerenciadorArquivos.adicionarSemiLigacao(idMapa, semiLigacao);
							
				    		mensagem += "<li title='idLinhaFilho" + novaQtdFilhos +"' value = '" + semiLigacao.idLinha + "'></li>";
				    		mensagem = mensagem.replace("<ul","<5ul");
				    		
				    		//manda para todos os usuarios, inclusive quem criou o conceito
				    		enviarParaTodosUsuariosAtivos(idMapa, mensagem);
						break;
						
						case "6": //exclusao Linha Ligacao (por enquanto ao excluir um conceito - palavraLigacao com mais de um conceito filho)
							
							//problema: ao excluir conceito ligado a uma palavraLigacao com apenas um conceito filho, a linha vai sumir antes da palavra ligacao e o usuario podera ver uma palavra de ligacao so com conceito pai
							//solucao: fazer uma funcao que exclui a palavra de ligacao e todas as suas linhas de uma vez
							
							// a mesma solucao pode ser aplicada se o conceito pai for removido - primeiro deleta-se a ligacao e suas linhas de uma vez e depois o conceito
							
							//outra solucao: alterar carregar mapa para nao deixar isso visivel
							mensagem = mensagem.replace("<6ul","<ul");
							
							var idMapa = $(mensagem).children("li[title='idMapa']").text();
				    		idMapa = parseInt(idMapa);
				    		mensagem = mensagem.replace("<li title='idMapa'>" + idMapa + "</li>","");
				    		
				    		var exclusao = new Array(); 
				    		var id;
				    		var tipo;
				    		var listaElementos = $(mensagem).children("li");
				    		
				    		for(var i=0; listaElementos.get(i) != undefined; i++){
				    			id = $(listaElementos.get(i)).attr('id');
				    			tipo = $(listaElementos.get(i)).attr('title');
				    			exclusao[i] = {id: id, tipo: tipo};
				    		}
				    		
				    		//remover no arquivo xml
				    		gerenciadorArquivos.excluir(idMapa, exclusao);
							
				    		mensagem = mensagem.replace("<ul","<6ul");
				    		
				    		//manda para todos os usuarios, inclusive quem criou o conceito
				    		enviarParaTodosUsuariosAtivos(idMapa, mensagem);
						break;
					}
				}
			});
			
			socket.on('disconnect', function () { 
				var id = removerUsuario(socket);
				var idsMapas = buscarIdsMapasDoUsuario(id);
				
				for(var i=0; i < idsMapas.length; i++){
					var posicao = buscarPosicaoSincronizadorNaLista(idsMapas[i]);
					listaSincronizadores[ posicao ].sincronizador.removerUsuarioAtivo(id);
					var usuariosAtivos = listaSincronizadores[ posicao ].sincronizador.getUsuariosAtivos();
					if(usuariosAtivos.length == 0){
						gerenciadorArquivos.fecharMapa(idsMapas[i]);
					}
				}
				
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
				"<li title='x' value='" + x + "'></li>" +
				"<li title='y' value='" + y + "'></li>" +
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
			var qtdFilhos = $( element ).find('qtdFilhos').text();
			
			var itemLista = 
				"<ul id='" + idLigacao + "' title='ligacao'>" + 
				"<li title='qtdFilhos' value='" + qtdFilhos + "'></li>" +
				"<li title='idLinhaPai' value='" + idLinhaPai + "'></li>" +
				"<li title='idConceitoPai' value='" + idConceitoPai + "'></li>" +
				"<li title='x' value='" + x + "'></li>" +
				"<li title='y' value='" + y + "'></li>" +
				"<li title='texto'>" + texto + "</li>" +
				"<li title='fonte'>" + fonte + "</li>" +
				"<li title='tamanhoFonte'>" + tamanhoFonte + "</li>" +
				"<li title='corFonte'>" + corFonte + "</li>" +
				"<li title='corFundo'>" + corFundo + "</li>" 
			;
			
			
			$( element).children().each( function( index, subElement ){
				
				if( $(subElement).prop("tagName").indexOf("IDCONCEITOFILHO") != -1 ){
					var papelConceito = verificarPapelConceito( $(subElement).prop("tagName") );
					idLinhaFilho = $( element ).find('idLinhaFilho' + papelConceito).text();
					idConceitoFilho = $( element ).find('idConceitoFilho' + papelConceito).text();
					
					itemLista += "<li title='idLinhaFilho"+ papelConceito +"' value='" + idLinhaFilho + "'></li>" + 
					"<li title='idConceitoFilho" + papelConceito + "' value='" + idConceitoFilho + "'></li>";
				}
			});
			
			itemLista += "</ul>";
			lista += itemLista;
			
		});
		
		lista += "</div>";
		
		return lista;
		
	}
	
	function verificarPapelConceito(tagConceito){
		var papelConceito;
		papelConceito = tagConceito.replace('IDCONCEITOFILHO','');
		return parseInt( papelConceito );
	}
	
	
	
	function removerUsuario(socket){
		var i = buscarPosicaoUsuarioNaLista(null, socket);
		var id = listaUsuarios[i].idUsuario;
		
		listaUsuarios.splice(i,1);
		
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
	
	//busca tanto a posicao do sincronizador como a do id do mapa
	
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
	
	
	function enviarParaTodosUsuariosAtivos(idMapa,msg){
		var i = buscarPosicaoSincronizadorNaLista(idMapa,null);
		var usuariosAtivos = listaSincronizadores[i].sincronizador.getUsuariosAtivos();
		
		
		for(var j=0; j < usuariosAtivos.length; j++){
			i = buscarPosicaoUsuarioNaLista(usuariosAtivos[j]);
			listaUsuarios[i].socket.send(msg);
		}
	}
	
	function enviarBroadcastParaUsuariosAtivos(idMapa, msg, socket){
		var i = buscarPosicaoSincronizadorNaLista(idMapa,null);
		var usuariosAtivos = listaSincronizadores[i].sincronizador.getUsuariosAtivos();
		
		var posicaoUsuarioExcluidoNaLista = buscarPosicaoUsuarioNaLista (null, socket);
		
		for(var j=0; j < usuariosAtivos.length; j++){
			i = buscarPosicaoUsuarioNaLista(usuariosAtivos[j], null);
			if(i != posicaoUsuarioExcluidoNaLista)
				listaUsuarios[i].socket.send(msg);
		}
	}
	
	
	function buscarIdsMapasDoUsuario(idUsuario){
		var i = 0;
		var idsMapas = new Array();
		
		while(i < listaSincronizadores.length){
			var j = listaSincronizadores[i].sincronizador.buscarPosicaoNaLista(idUsuario, 1);
			if(j != -1){
				idsMapas.push(listaSincronizadores[i].idMapa);
			}
			i++;
		}
		return idsMapas;
	}
	
	
}

	var servidor = new Servidor('localhost',3000);
	console.log(servidor.iniciar());

	console.log(servidor);

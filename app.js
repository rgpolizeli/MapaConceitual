

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

	
	var events = require('events');

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
	
	var GerenciadorUsuariosAtivos = require('./GerenciadorUsuariosAtivos.js');
	var gerenciadorUsuariosAtivos;
	
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
		
		passport = new Passport(connection);
		
		gerenciadorBanco = new GerenciadorBanco();
		
		gerenciadorArquivos = new GerenciadorArquivos();
		
		gerenciadorUsuariosAtivos = new GerenciadorUsuariosAtivos();

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
					idUsuario: req.user.id, 
					idMapa: req.body.optionsRadios,
					ip: ip,
					porta: porta
			};
			routes.pagina(req,res,'editarMapa', msg);
		});
		
		app.get('/criarMapa', function(req,res){
			if(!req.isAuthenticated()){
				routes.pagina(req,res,'index',null);
			}
			else{
				
				var idUsuario, nomeUsuario, achou, msg;
				
				idUsuario = req.user.id;
				gerenciadorBanco.buscarNomeTodosUsuarios();
				gerenciadorBanco.eventEmitter.once('nomeTodosUsuarios', function(listaUsuarios){
					
					achou = false;
					
					for(var i=0; (i < listaUsuarios.length) && !achou; i++){
						if(listaUsuarios[i].id == idUsuario){
							nomeUsuario = listaUsuarios[i].nome;
							achou = true;
						}
					}

					msg = {
							nomeUsuario: nomeUsuario,
							idUsuario: idUsuario,
							listaUsuarios: listaUsuarios
					};
					routes.pagina(req,res,'criarMapa', msg);
				});
			}
		});
		
		app.post('/criarMapa', function(req,res){
			
			var permissoes = new Array();
			var propriedades = Object.getOwnPropertyNames(req.body);
			
			for(var i=0; i < propriedades.length; i++){
				if(propriedades[i] != "nomeMapa"){
					var permissao = new Object();
					permissao.idUsuario = parseInt(propriedades[i].replace("usuario", ""));
					permissao.tipoPermissao = req.body[propriedades[i]];
					permissoes.push(permissao);
				}
			}
			
			gerenciadorBanco.inserirNovoMapa(req.body.nomeMapa, permissoes);
			gerenciadorBanco.eventEmitter.once('mapaCriado', function(idMapa){ 
				gerenciadorArquivos.criarMapa(idMapa, req.body.nomeMapa);
				return res.redirect('mapas');
			});
			
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
		
		
		app.get('/logout', function(req, res){
			  req.logout();
			  res.redirect('/');
		});
		
		
		io.on('connection', function(socket){
			
			socket.on('conexao', function (idUsuarioP, idMapaP){ 
				
				var idUsuario = parseInt(idUsuarioP);
				var idMapa = parseInt(idMapaP);
				
				//abrindo arquivo XML
				if(gerenciadorArquivos.buscarPosicaoMapaNaLista( idMapa ) == -1){
					gerenciadorArquivos.abrirMapa(idMapa);
	    		}
				
				//Registrando usuario ativo do mapa
				
				gerenciadorBanco.verificarTipoPermissao(idUsuario, idMapa); //Obtendo a permissao do usuario
				gerenciadorBanco.eventEmitter.once('tipoPermissao', function(tipoPermissao){ 
					
					//adiciona o usuario e o mapa se este ja nao estiver adicionado
					gerenciadorUsuariosAtivos.adicionarUsuarioAtivo(idMapa, idUsuario, socket, tipoPermissao);
					
					//lista estruturada em html para o usuario carregar o mapa
					var msg = montarListaHtml(gerenciadorArquivos.getMapa(idMapa));
					socket.send(msg);
					
					console.log("Usuario #" + idUsuario + " conectou-se.");
				});
			});
			
			socket.on('message', function (mensagem){
				if(mensagem[0] == "<"){
					switch(mensagem[1]){
						case "1": //novo conceito criado por um usuario
				    		
				    		mensagem = mensagem.replace("<1ul","<ul");
				    		var idMapa = $(mensagem).children("li[title='idMapa']").text();
				    		idMapa = parseInt(idMapa);
				    		
				    		//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(idMapa, socket) != 3){
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
				    		}
						break;
						
						case "2": //conceito movido por algum usuario
							mensagem = mensagem.replace("<2ul","<ul");
							
							var idMapa = $(mensagem).children("li[title='idMapa']").text();
				    		idMapa = parseInt(idMapa);
				    		
				    		//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(idMapa, socket) != 3){
				    		
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
				    		}
						break;
						
						case "3": //ligacao criada por algum usuario
							mensagem = mensagem.replace("<3ul","<ul");
							
							var idMapa = $(mensagem).children("li[title='idMapa']").text();
				    		idMapa = parseInt(idMapa);
				    		
				    		
				    		//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(idMapa, socket) != 3){
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
					    		mensagem += "<li title='qtdFilhos' value='1'></li>";
					    		
					    		//manda para todos os usuarios, inclusive quem criou o conceito
					    		enviarParaTodosUsuariosAtivos(idMapa, mensagem);
				    		}
						break;
						case "4": //palavra de ligacao movida por algum usuario +
							mensagem = mensagem.replace("<4ul","<ul");
							
							var idMapa = $(mensagem).children("li[title='idMapa']").text();
				    		idMapa = parseInt(idMapa);
							
				    		//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(idMapa, socket) != 3){
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
				    		}
						break;
						
						case "5": //nova SemiLigacao
							mensagem = mensagem.replace("<5ul","<ul");
							
							var idMapa = $(mensagem).children("li[title='idMapa']").text();
				    		idMapa = parseInt(idMapa);
				    		
				    		//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(idMapa, socket) != 3){
				    			var papelConceito = $(mensagem).children("li[title^='idConceitoFilho']").attr('title');
					    		papelConceito = parseInt( papelConceito.replace("idConceitoFilho","") );
					    		
					    		var semiLigacao = {
					    				idLigacao : parseInt($(mensagem).attr("id")),
					    				idConceito : $(mensagem).children("li[title='idConceitoFilho"+ papelConceito +"']").val(),
					    				idLinha :  gerenciadorArquivos.buscarIdDisponivel(idMapa),
					    				novaQtdFilhos : $(mensagem).children("li[title='qtdFilhos']").val(),
					    				papelConceito : papelConceito
					    		};
					    		
					    		//inserir no arquivo xml
					    		gerenciadorArquivos.adicionarSemiLigacao(idMapa, semiLigacao);
								
					    		mensagem += "<li title='idLinhaFilho" + papelConceito +"' value = '" + semiLigacao.idLinha + "'></li>";
					    		mensagem += "<li title='papelConceito' value = '" + papelConceito + "'></li>";
					    		mensagem = mensagem.replace("<li title='idMapa'>" + idMapa + "</li>","");
					    		mensagem = mensagem.replace("<ul","<5ul");
					    		
					    		//manda para todos os usuarios, inclusive quem criou o conceito
					    		enviarParaTodosUsuariosAtivos(idMapa, mensagem);
				    		}
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
				    		
				    		//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(idMapa, socket) != 3){
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
				    		}
						break;
					}
				}
			});
			
			socket.on('disconnect', function () { 
				
				var idsMapas = gerenciadorUsuariosAtivos.getIdsMapasDoUsuario(socket);
				
				for(var i=0; i< idsMapas.length; i++){
					gerenciadorUsuariosAtivos.removerUsuarioAtivo(socket, idsMapas[i]);
					
					if(gerenciadorUsuariosAtivos.getQuantidadeUsuariosAtivos(idsMapas[i]) == 0){
						gerenciadorUsuariosAtivos.removerMapa(idsMapas[i]);
						gerenciadorArquivos.fecharMapa(idsMapas[i]);
					}
				}
				//console.log("Usuario #" + id + " desconectou-se.");
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
	
	function enviarParaTodosUsuariosAtivos(idMapa,msg){
		var socketUsuariosAtivos = gerenciadorUsuariosAtivos.getSocketUsuariosAtivos(idMapa);
		
		for(var j=0; j < socketUsuariosAtivos.length; j++)
			socketUsuariosAtivos[j].send(msg);
	}
	
	function enviarBroadcastParaUsuariosAtivos(idMapa, msg, socket){
		var socketUsuariosAtivos = gerenciadorUsuariosAtivos.getSocketUsuariosAtivos(idMapa);
		
		for(var j=0; j < socketUsuariosAtivos.length; j++){
			if(socketUsuariosAtivos[j] != socket){
				socketUsuariosAtivos[j].send(msg);
			}
		}
	}
}

	var servidor = new Servidor('localhost',3000);
	console.log(servidor.iniciar());

	console.log(servidor);

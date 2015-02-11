

function Servidor(Ip,Porta){

	var ip = Ip;
	var porta = Porta;
	
	
	var jsdom = require("jsdom").jsdom;
	var $  = require('jquery')(jsdom().parentWindow);
	
	//Arquivo json com as senhas do sistema
	var configuracoes = require('./configuracoes.json');
	
	var express = require('express');
	var session = require('express-session');
	var path = require('path');
	var favicon = require('static-favicon');
	var cookieParser = require('cookie-parser');
	var bodyParser = require('body-parser');
	
	var mysql = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user: 'root',
	  password: 'ricardo',
	  database: 'teste'
	});

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
		//app.use(logger('dev'));
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
		app.get('/cadastrarUsuarioComum', function(req,res){
			routes.pagina(req,res,'cadastrarUsuarioComum',null);
		});
		
		app.get('/cadastrarCoordenador', function(req,res){
			routes.pagina(req,res,'cadastrarCoordenador',null);
		});
		
		app.get('/mapas', passport.verificarAutenticacao, function(req,res){
			
			gerenciadorBanco.perquisarMapas(req.user.id);
			
			//a variavel receptora do evento deve ser a mesma que emitiu.
			//once ao inves de on, pois o evento emitido num outro login continua valendo para relogin, executando routes.pagina duas vezes.
			gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
				if(req.query.desconectado)
					routes.pagina(req,res,'mapas', {alerta: "Voce foi desconectado do mapa, pois o gerente ou o administrador esta alterando as permissoes deste mapa.", mensagem: mapas} ); 
				else
					routes.pagina(req,res,'mapas', {mensagem:mapas});
			});
			
		});
		
		app.post('/cadastrarUsuarioComum', function(req,res){
			gerenciadorBanco.cadastrarUsuario(req.body.usuario, req.body.password, req.body.nome, req.body.email, 1); //1 de usuario comum
			gerenciadorBanco.eventEmitter.once('fimCadastroUsuario', function(resultado){ 
				if(resultado == 1)
					routes.pagina(req,res,'index', {alerta: "Cadastro de usuario comum realizado com sucesso."} ); 
				else
					routes.pagina(req,res,'cadastrarUsuarioComum', {alerta: "Ocorreu o seguinte erro na tentativa de cadastro: " + resultado + " . Tente novamente."} );
			});
		});
		
		app.post('/cadastrarCoordenador', function(req,res){
			
			if(req.body.passwordCadastroCoordenador == configuracoes["senhaCadastroCoordenador"]){
				
				gerenciadorBanco.cadastrarUsuario(req.body.usuario, req.body.password, req.body.nome, req.body.email, 0); //0 de coordenador
				gerenciadorBanco.eventEmitter.once('fimCadastroUsuario', function(resultado){ 
					if(resultado == 1)
						routes.pagina(req,res,'index', {alerta: "Cadastro de coordenador realizado com sucesso."} ); 
					else
						routes.pagina(req,res,'cadastrarCoordenador', {alerta: "Ocorreu o seguinte erro na tentativa de cadastro: " + resultado + " . Tente novamente."} );
				});
				
			}
			else{
				routes.pagina(req,res,'cadastrarCoordenador', {alerta: "Senha para cadastro de coordenador incorreta!"} );
			}
			
		});
		
		app.post('/abrir', function(req,res){
			
			if(req.body.idMapa){ //se usuario selecionou algum mapa
				var msg = {
						idUsuario: req.user.id, 
						idMapa: req.body.idMapa, // vem da pagina mapas.ejs
						ip: ip,
						porta: porta
				};
				routes.pagina(req,res,'editarMapa', msg);
			}
			else{
				res.redirect('/mapas');
			}
			
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
			//as propriedades sao duas: nomeMapa e usuario+idUsuario. O ultimo tipo e o de mais elementos e contem o tipo de permissao do usuario que nomeia o tipo.
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
		
		app.post('/obterInfoMapa', passport.verificarAutenticacao, function(req,res){
			var idUsuario; 
			var idMapa; // vem da pagina mapas.ejs
			
			idUsuario = req.user.id;
			idMapa = req.body.idMapa;
			
			if(idMapa){ //se o usuario selecionou algum mapa
				var nomeMapa;
				
				//buscar nome do mapa
				gerenciadorBanco.buscarNomeMapa(idMapa);
				gerenciadorBanco.eventEmitter.once('fimBuscaNomeMapa', function(resultado){ 
					
					if(resultado.erro){ //erro na busca do nome do mapa
						
						var msg;
						gerenciadorBanco.perquisarMapas(idUsuario);
						gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
							msg = {
									alerta: "Ocorreu o seguinte erro ao tentar configurar o mapa: "+ resultado.erro,
									mensagem: mapas
							}; 
							return routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
						});
					}
					else{ //sucesso na busca do nome do mapa
						nomeMapa = resultado;
					}
					
				});
				
				//busca usuarios com permissao para este mapa
				gerenciadorBanco.pesquisarUsuariosComPermissao(idMapa);
				gerenciadorBanco.eventEmitter.once('fimPesquisaUsuariosPermissao', function(resultado){ 
					
					if(resultado.erro){ //erro na busca dos usuarios com permissao
						
						var msg;
						gerenciadorBanco.perquisarMapas(idUsuario);
						gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
							msg = {
									alerta: "Ocorreu o seguinte erro ao tentar configurar o mapa: "+ resultado.erro,
									mensagem: mapas
							}; 
							return routes.pagina(req,res,'mapas', msg);
						});
						
					}
					else{ //sucesso na busca dos usuarios com permissao
						
						var listaUsuariosPermitidos;
						
						listaUsuariosPermitidos = resultado;
						
						//necessario saber a permissao do usuario, pois so administrador e gerente podem mudar permissoes
						var i=0;
						while( i < listaUsuariosPermitidos.length && listaUsuariosPermitidos[i].id != idUsuario)
							i++;
						
						if(listaUsuariosPermitidos[i].tipoPermissao == "Gerente" || listaUsuariosPermitidos[i].tipoPermissao == "Administrador"){
							
							//necessario buscar o nome de todos os usuarios
							gerenciadorBanco.buscarNomeTodosUsuarios();
							gerenciadorBanco.eventEmitter.once('nomeTodosUsuarios', function(listaTodosUsuarios){
								
								if(listaTodosUsuarios.erro){ //erro ao pesquisar todos os usuarios
									
									var msg;
									gerenciadorBanco.perquisarMapas(idUsuario);
									gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
										msg = {
												alerta: "Ocorreu o seguinte erro ao tentar configurar o mapa: "+ resultado.erro,
												mensagem: mapas
										}; 
										return routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
									});
								}
								else{ //sucesso ao pesquisar todos os usuarios
									var msg;
									msg = {
										listaUsuariosPermitidos: listaUsuariosPermitidos,
										nomeMapa: nomeMapa,
										idMapa: idMapa,
										listaTodosUsuarios: listaTodosUsuarios
									};
									routes.pagina(req,res,'configurarMapa', msg);
								}
							});
						}
						
						else{ //nao e administrador nem gerente
							var msg;
							gerenciadorBanco.perquisarMapas(idUsuario);
							gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
								msg = {
										alerta: "Voce nao tem permissao para configurar este mapa!",
										mensagem: mapas
								}; 
								return routes.pagina(req,res,'mapas', msg);
							});
						}
					}
					
				});
			}
			else{ //usuario nao selecionou um mapa
				res.redirect('/mapas');
			}
		});
		
		
		app.post('/configurarMapa', passport.verificarAutenticacao, function(req,res){
			var permissoes = new Array();
			//as propriedades sao duas: nomeMapa e usuario+idUsuario. O ultimo tipo e o de mais elementos e contem o tipo de permissao do usuario que nomeia o tipo.
			var propriedades = Object.getOwnPropertyNames(req.body);
			
			for(var i=0; i < propriedades.length; i++){
				if(propriedades[i] != "nomeMapa" && propriedades[i] != "idMapa"){
					var permissao = new Object();
					permissao.idUsuario = parseInt(propriedades[i].replace("usuario", ""));
					permissao.tipoPermissao = req.body[propriedades[i]];
					permissoes.push(permissao);
				}
			}
			
			gerenciadorBanco.configurarMapa(req.body.idMapa, req.body.nomeMapa, req.user.id, permissoes);
			gerenciadorBanco.eventEmitter.once('fimConfigurarMapa', function(resultado){ 
				if(resultado.erro){ //erro ao pesquisar todos os usuarios
					
					var msg;
					gerenciadorBanco.perquisarMapas(req.user.id);
					gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
						msg = {
								alerta: resultado.erro,
								mensagem: mapas
						}; 
						return routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
					});
				}
				else{ //sucesso ao configurar mapa
					var msg;
					
					//desconectar os usuarios que estao logados no mapa
					msg = {tipoMensagem: 10};
					enviarParaTodosUsuariosAtivos(req.body.idMapa,msg);
					
					gerenciadorBanco.perquisarMapas(req.user.id);
					gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
						msg = {
								alerta: resultado,
								mensagem: mapas
						}; 
						return routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
					});
				}
			});
			
		});
		
		
		app.post('/excluirMapa', passport.verificarAutenticacao, function(req,res){
			var idUsuario; 
			var idMapa; // vem da pagina mapas.ejs
			
			idUsuario = req.user.id;
			idMapa = req.body.idMapa;
			
			if(idMapa){ //se o usuario selecionou algum mapa
				
				gerenciadorBanco.verificarTipoPermissao(idUsuario, idMapa); //Obtendo a permissao do usuario
				gerenciadorBanco.eventEmitter.once('tipoPermissao', function(tipoPermissao){ 
					
					if(tipoPermissao == 0 || tipoPermissao == 1){ // se for o gerente ou administrador
						var numUsersAtivos;
						numUsersAtivos = gerenciadorUsuariosAtivos.getQuantidadeUsuariosAtivos(idMapa);
						
						if(numUsersAtivos == 0 || numUsersAtivos == -1 ){ //nenhum usuario ativo no mapa, pode excluir
							var r;
							
							gerenciadorBanco.excluirMapa(idMapa);
							gerenciadorBanco.eventEmitter.once('fimExclusaoMapa', function(resultado){ 
								
								if(resultado == 1){ //excluido com sucesso do banco
									
									r = gerenciadorArquivos.excluirMapa(idMapa);
									if(r == 1){ //mapa excluido com sucesso
										var msg;
										
										gerenciadorBanco.perquisarMapas(req.user.id);
										gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
											msg = {
													alerta: "Mapa excluido com sucesso!",
													mensagem: mapas
											}; 
											routes.pagina(req,res,'mapas', msg);
										});
									}
									else{ //se erro ao excluir o arquivo
										var msg;
										
										gerenciadorBanco.perquisarMapas(req.user.id);
										gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
											msg = {
													alerta: "Ocorreu o seguinte erro ao excluir: " + r, // r armazena o tipo de erro
													mensagem: mapas
											}; 
											routes.pagina(req,res,'mapas', msg);
										});
									}
									
								}
								else{ //erro ao excluir do banco
									var msg;
									
									gerenciadorBanco.perquisarMapas(req.user.id);
									gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
										msg = {
												alerta: "Ocorreu o seguinte erro ao excluir: " + r, // r armazena o tipo de erro
												mensagem: mapas
										}; 
										routes.pagina(req,res,'mapas', msg);
									});
									
								}
							});
							
								
						}
						else{ // algum usuario ativo no mapa
							var msg;
							
							gerenciadorBanco.perquisarMapas(req.user.id);
							gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
								msg = {
										alerta: "O mapa nao pode ser excluido, pois alguns usuarios estao editando este mapa!",
										mensagem: mapas
								}; 
								routes.pagina(req,res,'mapas', msg);
							});
						}
					}
					else{ // nao tem permissao
						var msg;
						
						gerenciadorBanco.perquisarMapas(req.user.id);
						gerenciadorBanco.eventEmitter.once('fimPesquisaMapas', function(mapas){ 
							msg = {
									alerta: "Voce nao tem permissao para isso!",
									mensagem: mapas
							}; 
							routes.pagina(req,res,'mapas', msg);
						});
					}
				});
			}
			else{
				res.redirect('/mapas');
			}

		});
		
		
		app.post(
			'/autenticar',
			function(req, res){
				passport.ppt.authenticate('local', function handleAuthenticate(err, user){
					if(err){
						console.log(err);
						res.redirect('/');
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
				})(req, res);
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
				else{
					switch(mensagem.tipoMensagem){
						
						case 2: //conceito movido por algum usuario
				    		var idMapa;
				    		var alterado;
				    		
				    		idMapa = mensagem.idMapa;
				    		alterado = false;
				    		
				    		//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(idMapa, socket) != 3){
				    		
					    		var conceito = {
					    			idConceito : mensagem.idConceito,
									novoX : mensagem.novoX,
									novoY : mensagem.novoY
					    		};
					    		
								//inserir no arquivo xml
						    	alterado = gerenciadorArquivos.alterarPosicaoConceito(idMapa, conceito);
						    	
						    	if(alterado){
						    		delete mensagem.idMapa;
						    		
							    	//manda para todos os usuarios, inclusive quem criou o conceito
							    	enviarParaTodosUsuariosAtivos(idMapa, mensagem, socket);
						    	}
				    		}
						
						break;
						
						case 4: //palavra de ligacao movida por algum usuario
							var idMapa;
							var alterado;
				    		
				    		idMapa = mensagem.idMapa;
				    		alterado = false;
				    		
				    		//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(idMapa, socket) != 3){
				    		
					    		var ligacao = {
					    			idLigacao : mensagem.idLigacao,
									novoX : mensagem.novoX,
									novoY : mensagem.novoY
					    		};
					    		
								//inserir no arquivo xml
					    		alterado = gerenciadorArquivos.alterarPosicaoLigacao(idMapa, ligacao);
					    		
					    		if(alterado){
					    			delete mensagem.idMapa;
						    		
						    		//manda para todos os usuarios, inclusive quem criou o conceito
						    		enviarParaTodosUsuariosAtivos(idMapa, mensagem, socket);
					    		}
				    		}
						break;
					
					
						case 7: //tamanho do conceito alterado por algum usuario
							var alterado;
							var idMapa;
							
				    		
				    		idMapa = mensagem.idMapa;
							//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(mensagem.idMapa, socket) != 3){
					    		
								//inserir no arquivo xml
				    			alterado = gerenciadorArquivos.alterarTamanhoConceito(mensagem);
				    			if(alterado == 1){
				    				delete mensagem.idMapa;
				    				enviarParaTodosUsuariosAtivos(idMapa, mensagem, socket);
				    			}
					    		
				    		}
						break;
						
						case 8: //tamanho da ligacao alterado por algum usuario
							var alterado;
							var idMapa;
							
				    		idMapa = mensagem.idMapa;
							//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(mensagem.idMapa, socket) != 3){
				    			
				    			alterado = gerenciadorArquivos.alterarTamanhoLigacao(mensagem);
				    			if(alterado == 1){
				    				delete mensagem.idMapa;
				    				enviarParaTodosUsuariosAtivos(idMapa, mensagem, socket);
				    			}
					    		
				    		}
						break;
						
						case 9: //objeto editado por algum usuario
							var idMapa;
							var alterado;
							
							idMapa = mensagem.idMapa;
							alterado = false;
							
							//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(idMapa, socket) != 3){
					    		
								if(mensagem.tipoObjeto == "conceito"){
									alterado = gerenciadorArquivos.editarConceito(mensagem);
								}
								else{
									if(mensagem.tipoObjeto == "ligacao"){
										alterado = gerenciadorArquivos.editarLigacao(mensagem);
									}
								}
								
								if(alterado){
									//Remove uma propriedade de um objeto
									delete mensagem.idMapa;
									delete mensagem.tipoObjeto;
									
									enviarParaTodosUsuariosAtivos(idMapa, mensagem, socket);
								}
								
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
				
				console.log("Usuario desconectou-se.");
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
			var altura = $( element ).find( 'altura' ).text();
			var largura = $( element ).find( 'largura' ).text();
			var alturaMinima = $( element ).find( 'alturaMinima' ).text();
			var larguraMinima = $( element ).find( 'larguraMinima' ).text();
			var texto = $( element ).find( 'texto' ).text();
			var fonte = $( element ).find( 'fonte' ).text();
			var tamanhoFonte = $( element ).find( 'tamanhoFonte' ).text();
			var corFonte = $( element ).find( 'corFonte' ).text();
			var corFundo = $( element ).find( 'corFundo' ).text();
			
			
			var itemLista = 
				"<ul id='" + idConceito + "' title='conceito'>" + 
				"<li title='x' value='" + x + "'></li>" +
				"<li title='y' value='" + y + "'></li>" +
				"<li title='altura' value='" + altura + "'></li>" +
				"<li title='largura' value='" + largura + "'></li>" +
				"<li title='alturaMinima'>" + alturaMinima + "</li>" +
				"<li title='larguraMinima'>" + larguraMinima + "</li>" +
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
			var altura = $( element ).find( 'altura' ).text();
			var largura = $( element ).find( 'largura' ).text();
			var alturaMinima = $( element ).find( 'alturaMinima' ).text();
			var larguraMinima = $( element ).find( 'larguraMinima' ).text();
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
				"<li title='altura' value='" + altura + "'></li>" +
				"<li title='largura' value='" + largura + "'></li>" +
				"<li title='alturaMinima'>" + alturaMinima + "</li>" +
				"<li title='larguraMinima'>" + larguraMinima + "</li>" +
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

	var servidor = new Servidor('localhost',4000);
	console.log(servidor.iniciar());

	console.log(servidor);



function Servidor(Ip,Porta){
	
	var ip = Ip;
	var porta = Porta;
	var server = this;
	var jsdom = require("jsdom").jsdom;
	var $  = require('jquery')(jsdom().parentWindow);
	
	var events = require('events');
	this.eventEmitter = new events.EventEmitter();
	
	//Arquivo json com as senhas do sistema
	var configuracoes = require('./configuracoes.json');
	
	var express = require('express');
	var session = require('express-session');
	var path = require('path');
	var favicon = require('static-favicon');
	var cookieParser = require('cookie-parser');
	var bodyParser = require('body-parser');

	var Passport = require('./Passport.js');
	var passport;
	
	var routes = require('./routes/routes');

	var app = express();
	var http = require('http').Server(app);
	
	var io = require('socket.io')(http);
	
	var GerenciadorBanco = require('./GerenciadorBanco.js');
	var gerenciadorBanco;
	gerenciadorBanco = new GerenciadorBanco();
	gerenciadorBanco.eventEmitter.once("fimConexaoBD", function(result){
		if(result.erro) server.eventEmitter.emit("BDconectado", {erro: result.erro});
		else server.eventEmitter.emit("BDconectado", result);
	});
	gerenciadorBanco.conectarBD(configuracoes["host"], configuracoes["user"], configuracoes["password"], configuracoes["database"]);
	
	var GerenciadorArquivos = require('./GerenciadorArquivos.js');
	var gerenciadorArquivos;
	
	var GerenciadorUsuariosAtivos = require('./GerenciadorUsuariosAtivos.js');
	var gerenciadorUsuariosAtivos;
	var idsEvento = new Array();
	
	
	function getIdEvento(){
		var tamanho = idsEvento.length;
		if(tamanho == 0){
			idsEvento.push(0);
			return 0;
		}
		else{
			var novoTamanho = idsEvento.push( (idsEvento[tamanho - 1] + 1) );
			return idsEvento[idsEvento.length - 1];
		}
	}
	
	function excluirIdEvento(id){
		if(idsEvento.length > 0){
			var i=0;
			while(i < idsEvento.length && idsEvento[i] != id)
				i++;
			
			if(i < idsEvento.length){
				idsEvento.splice(i, 1);
			}
		}
	}
	
	
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
		
		
		
		passport = new Passport( gerenciadorBanco.getConexaoBD(), gerenciadorBanco.getOperadorSql() );
		
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
		
		
		app.post('/excluirGrupo', passport.verificarAutenticacao, function(req,res){
			var idOperacaoLocal = 2;
			var idUsuario; 
			var idGrupo; // vem da pagina mapas.ejs
			
			idUsuario = req.user.id;
			idGrupo = req.body.idGrupo;
			
			if(idGrupo){ //se o usuario selecionou algum grupo
				
				gerenciadorBanco.pesquisarMembrosGrupo(idGrupo, idOperacaoLocal);
				gerenciadorBanco.eventEmitter.once('fimPesquisaMembrosGrupo' + idGrupo + idOperacaoLocal, function(membros){ 
					
					var tipoMembro;
					var indiceCoordenador = 0;
					while(indiceCoordenador < membros.length && membros[indiceCoordenador].id != idUsuario){
						indiceCoordenador++;
					}
					
					if(indiceCoordenador == membros.length ) //quer dizer que nao achou o usuario
						tipoMembro = -1;
					else //se achou
						tipoMembro = membros[indiceCoordenador].tipoMembro;
					
					if(tipoMembro == "Coordenador"){ // se for o coordenador
						
						gerenciadorBanco.pesquisarMapasGrupo(idGrupo, idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimPesquisaMapasGrupo' + idGrupo + idOperacaoLocal, function(idMapas){ 
							
							if(idMapas.erro){ //erro ao obter os mapas aos quais o grupo tem acesso
								
								gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
								gerenciadorBanco.eventEmitter.once('fimObterGrupos' + idUsuario + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
									
									msg = {
											alerta: "Erro ao tentar excluir o grupo. Tente novamente.",
											listaGrupos: listaGrupos,
											listaGruposCoordenados: listaGruposCoordenados
									}; 
									routes.pagina(req,res,'grupos', msg);
								});
								
							}
							
							else{ //sucesso ao obter os mapas aos quais o grupo tem acesso
									
								gerenciadorBanco.excluirGrupo(idGrupo);
								gerenciadorBanco.eventEmitter.once('fimExclusaoGrupo' + idGrupo, function(resultado){ 
									
									if(resultado.erro){ //erro ao tentar excluir
										gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
										gerenciadorBanco.eventEmitter.once('fimObterGrupos' + idUsuario + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
											
											msg = {
													alerta: "O seguinte erro ocorreu ao se tentar excluir o grupo: " + resultado.erro,
													listaGrupos: listaGrupos,
													listaGruposCoordenados: listaGruposCoordenados
											}; 
											routes.pagina(req,res,'grupos', msg);
										});
									}
									else{ //sucesso ao excluir grupo
										
										var msg;
										
										//desconectar os usuarios membros do grupo que estao logados em mapas aos quais o grupo tem acesso
										msg = {
												tipoMensagem: 10,
												tipoDesconexao: 4
										};
										
										//Para cada mapa, obter lista dos usuarios ativos
										//Para cada usuario ativo, verificar se o seu id eh igual a algum dos membros do grupo
										//Se for, entao enviar mensagem
										//Senao, nao enviar
										
										for(var i=0; i < idMapas.length; i++){
											var idsUsuariosAtivos = gerenciadorUsuariosAtivos.getIdsUsuariosAtivos(idMapas[i].idMapa);
											for(var j=0; j < idsUsuariosAtivos.length; j++){
												var ehMembro = false;
												for(var k=0; k < membros.length && !ehMembro; k++){
													if(idsUsuariosAtivos[j] == membros[k].id){
														ehMembro = true;
														enviarUnicastParaUsuarioAtivo(idMapas[i].idMapa,idsUsuariosAtivos[j],msg);
													}
												}
											}
											
										}
										
										gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
										gerenciadorBanco.eventEmitter.once('fimObterGrupos' + idUsuario + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
											
											msg = {
													alerta: "Sucesso ao excluir o grupo!",
													listaGrupos: listaGrupos,
													listaGruposCoordenados: listaGruposCoordenados
											}; 
											routes.pagina(req,res,'grupos', msg);
										});
									}
										
								});
								
							} //fim else sucesso obter mapas
							
						});	//fimPesquisaMapasGrupo
								
					} // fim if tipoMembro==0
					
					else{ // nao eh o coordenador do grupo
						gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimObterGrupos' + idUsuario + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
							
							msg = {
									alerta: "Voce não é o coordenador do grupo para poder excluí-lo.",
									listaGrupos: listaGrupos,
									listaGruposCoordenados: listaGruposCoordenados
							}; 
							routes.pagina(req,res,'grupos', msg);
						});
					}
					
							
				}); //fim fimPesquisaMembrosGrupo
						
						
			} //fecha if idGrupo
					
			else{ //se nao selecionou nenhum grupo
				res.redirect('/grupos');
			}

		}); //fecha post
		
		
		app.get('/grupos', passport.verificarAutenticacao, function(req,res){ //deve estar autenticado
			var idOperacaoLocal = 12;
			gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
			gerenciadorBanco.eventEmitter.once('fimObterGrupos' + req.user.id + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
				if(listaGrupos.erro){
					gerenciadorBanco.pesquisarMapas(req.user.id, idOperacaoLocal);
					gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + req.user.id + idOperacaoLocal, function(mapas){ 
						msg = {
								alerta: "Ocorreu o seguinte erro ao se tentar pesquisar os grupos que você participa: " + listaGrupos.erro,
								mensagem: mapas
						}; 
						routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
					}); 
				}
				else{
					routes.pagina(req,res,'grupos', {listaGrupos: listaGrupos, listaGruposCoordenados: listaGruposCoordenados} );
				}
				
			});
			
		});
		
		
		app.get('/criarGrupo', passport.verificarAutenticacao, function(req,res){
			var idOperacaoLocal = 13;	
			gerenciadorBanco.verificarTipoUsuario(req.user.id, idOperacaoLocal);
			gerenciadorBanco.eventEmitter.once('fimVerificarTipoUsuario' + req.user.id + idOperacaoLocal, function(tipoUsuario){ 
				var idUsuario, nomeUsuario, achou, msg;
				
				if( !(tipoUsuario.erro) ){ //sucesso verificacao tipo usuario
					
					if(tipoUsuario == 0){ // se for coordenador
						idUsuario = req.user.id;
						gerenciadorBanco.buscarTodosUsuarios(idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimBuscaTodosUsuarios' + idOperacaoLocal, function(listaUsuarios){
							
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
							routes.pagina(req,res,'criarGrupo', msg);
						});
					}
					
					else{ //nao eh coordenador
						gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimObterGrupos' + req.user.id + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
							msg = {
									alerta: "Voce não é coordenador para gerenciar grupos!",
									listaGrupos: listaGrupos, 
									listaGruposCoordenados: listaGruposCoordenados
							}; 
							routes.pagina(req,res,'grupos', msg); //necessario return para interromper a funcao 
						}); 
					}
				}
				else{  //erro na verificacao tipo usuario
					gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
					gerenciadorBanco.eventEmitter.once('fimObterGrupos' + req.user.id + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
						msg = {
								alerta: "Ocorreu o seguinte erro ao se tentar verificar se você é o coordenador: "  + tipoUsuario.erro,
								listaGrupos: listaGrupos, 
								listaGruposCoordenados: listaGruposCoordenados
						}; 
						routes.pagina(req,res,'grupos', msg); //necessario return para interromper a funcao 
					}); 
				}
			});
		});
		
		
		app.post('/criarGrupo', function(req,res){
			var idOperacaoLocal = 14;
			var membros = new Array();
			//as propriedades sao duas: nomeGrupo e usuario+idUsuario. O ultimo tipo eh o de mais elementos e contem o tipo de permissao do usuario que nomeia o tipo.
			var propriedades = Object.getOwnPropertyNames(req.body);
			
			for(var i=0; i < propriedades.length; i++){
				if(propriedades[i] != "nomeGrupo"){
					var membro = new Object();
					membro.idUsuario = parseInt(propriedades[i].replace("usuario", ""));
					membro.tipoMembro = req.body[propriedades[i]];
					membros.push(membro);
				}
			}
			
			var idEvento = getIdEvento();
			gerenciadorBanco.inserirNovoGrupo(req.body.nomeGrupo, membros, idEvento);
			gerenciadorBanco.eventEmitter.once('grupoCriado' + idEvento, function(idGrupo){ 
				excluirIdEvento(idEvento);
				if(idGrupo.erro){//erro na criacao
					gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
					gerenciadorBanco.eventEmitter.once('fimObterGrupos' + req.user.id + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
						msg = {
								alerta: "Grupo não criado! Ocorreu o seguinte erro ao se tentar criar o grupo: "  + idGrupo.erro,
								listaGrupos: listaGrupos, 
								listaGruposCoordenados: listaGruposCoordenados
						}; 
						routes.pagina(req,res,'grupos', msg); //necessario return para interromper a funcao 
					}); 
				}
				else{ //sucesso na criacao
					 res.redirect('/grupos');
				}
			});
			
		});
		
		
		app.post('/obterInfoGrupo', passport.verificarAutenticacao, function(req,res){
			var idOperacaoLocal = 11;
			var idUsuario; 
			var idGrupo; // vem da pagina grupos.ejs
			
			idUsuario = req.user.id;
			idGrupo = req.body.idGrupo;
			
			if(idGrupo){ //se o usuario selecionou algum grupo
				var nomeGrupo;
				
				//buscar nome do mapa
				gerenciadorBanco.buscarNomeGrupo(idGrupo);
				gerenciadorBanco.eventEmitter.once('fimBuscaNomeGrupo' + idGrupo, function(resultado){ 
					
					if(resultado.erro){ //erro na busca do nome do grupo
						
						var msg;
						
						gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimObterGrupos' + idUsuario + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
							
							msg = {
									alerta: "Ocorreu o seguinte erro ao se tentar configurar o grupo: "+ resultado.erro,
									listaGrupos: listaGrupos,
									listaGruposCoordenados: listaGruposCoordenados
							}; 
							routes.pagina(req,res,'grupos', msg);
						});
					}
					else{ //sucesso na busca do nome do grupo
						nomeGrupo = resultado;
					}
					
				});
				
				//busca usuarios membros deste grupo
				gerenciadorBanco.pesquisarMembrosGrupo(idGrupo,idOperacaoLocal);
				gerenciadorBanco.eventEmitter.once('fimPesquisaMembrosGrupo' + idGrupo + idOperacaoLocal, function(resultado){ 
					
					if(resultado.erro){ //erro na busca dos membros
						
						var msg;
						
						gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimObterGrupos' + idUsuario + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
							
							msg = {
									alerta: "Ocorreu o seguinte erro ao se tentar configurar o grupo: "+ resultado.erro,
									listaGrupos: listaGrupos,
									listaGruposCoordenados: listaGruposCoordenados
							}; 
							routes.pagina(req,res,'grupos', msg);
						});
						
					}
					else{ //sucesso na busca dos membros
						
						var listaMembros;
						
						listaMembros = resultado;
						
						//necessario saber qual tipo de membro eh o usuario, pois so o coordenador pode mudar os membros do grupo
						var i=0;
						while( i < listaMembros.length && listaMembros[i].id != idUsuario)
							i++;
						
						if(listaMembros[i].tipoMembro == "Coordenador"){
							
							//necessario buscar o nome de todos os usuarios
							gerenciadorBanco.buscarTodosUsuarios(idOperacaoLocal);
							gerenciadorBanco.eventEmitter.once('fimBuscaTodosUsuarios'+idOperacaoLocal, function(listaTodosUsuarios){
								
								if(listaTodosUsuarios.erro){ //erro ao pesquisar todos os usuarios
									
									var msg;
									
									gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
									gerenciadorBanco.eventEmitter.once('fimObterGrupos' + idUsuario + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
										
										msg = {
												alerta: "Ocorreu o seguinte erro ao se tentar configurar o grupo: "+ resultado.erro,
												listaGrupos: listaGrupos,
												listaGruposCoordenados: listaGruposCoordenados
										}; 
										routes.pagina(req,res,'grupos', msg);
									});
								}
								else{ //sucesso ao pesquisar todos os usuarios
									var msg;
									msg = {
										listaMembros: listaMembros,
										nomeGrupo: nomeGrupo,
										idGrupo: idGrupo,
										listaUsuarios: listaTodosUsuarios
									};
									routes.pagina(req,res,'configurarGrupo', msg);
								}
							});
						}
						
						else{ //nao eh Coordenador
							
							var msg;
							
							gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
							gerenciadorBanco.eventEmitter.once('fimObterGrupos' + idUsuario + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
								
								msg = {
										alerta: "Você não é o coordenador deste grupo para poder configurá-lo!",
										listaGrupos: listaGrupos,
										listaGruposCoordenados: listaGruposCoordenados
								}; 
								routes.pagina(req,res,'grupos', msg);
							});
						}
					}
					
				});
			}
			else{ //usuario nao selecionou um grupo
				res.redirect('/grupos');
			}
		});
		
		
		app.post('/configurarGrupo', passport.verificarAutenticacao, function(req,res){
			var idOperacaoLocal = 1;
			gerenciadorBanco.pesquisarMapasGrupo(req.body.idGrupo, idOperacaoLocal);
			gerenciadorBanco.eventEmitter.once('fimPesquisaMapasGrupo' + req.body.idGrupo + idOperacaoLocal, function(idMapas){ 
				if(idMapas.erro){ //erro ao obter os mapas aos quais o grupo tem acesso
					
					gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
					gerenciadorBanco.eventEmitter.once('fimObterGrupos' + req.user.id + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
						
						msg = {
								alerta: "Alterações não aplicadas! Ocorreu um erro relacionado a obtenção dos mapas aos quais o grupo tem acesso",
								listaGrupos: listaGrupos,
								listaGruposCoordenados: listaGruposCoordenados
						}; 
						routes.pagina(req,res,'grupos', msg);
					});
					
				}
				else{
					var membros = new Array();
					
					//as propriedades sao duas: nomeGrupo e usuario+idUsuario. O ultimo tipo eh o de mais elementos e contem o tipo de permissao do usuario que nomeia o tipo.
					var propriedades = Object.getOwnPropertyNames(req.body);
					
					for(var i=0; i < propriedades.length; i++){
						if(propriedades[i] != "nomeGrupo" && propriedades[i] != "idGrupo"){
							var membro = new Object();
							membro.idUsuario = parseInt(propriedades[i].replace("usuario", ""));
							membro.tipoMembro = req.body[propriedades[i]];
							membros.push(membro);
						}
					}
					
					gerenciadorBanco.configurarGrupo(req.body.idGrupo, req.body.nomeGrupo, req.user.id, membros);
					gerenciadorBanco.eventEmitter.once('fimConfigurarGrupo' + req.user.id + req.body.idGrupo, function(resultado){ //se sucesso, resultado eh uma lista dos membros anteriores a modificacao
						if(resultado.erro){ //erro ao configurar grupo
							
							var msg;
							
							gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
							gerenciadorBanco.eventEmitter.once('fimObterGrupos' + req.user.id + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
								
								msg = {
										alerta: resultado.erro,
										listaGrupos: listaGrupos,
										listaGruposCoordenados: listaGruposCoordenados
								}; 
								routes.pagina(req,res,'grupos', msg);
							});
							
						}
						else{ //sucesso ao configurar grupo
							
							membros = resultado; // desconectarei apenas os usuarios antigos, que sao os unicos que podem estar conectados aos mapas
							
							//necessario desconectar usuarios para alteracoes serem aplicadas localmente, Para isso:
							//obter lista com os mapas aos quais o grupo tem acesso.
							//para cada mapa, enviar mensagem desconectando o usuario.
							
							var msg;
									
							//desconectar os usuarios membros do grupo que estao logados em mapas aos quais o grupo tem acesso
							msg = {
									tipoMensagem: 10,
									tipoDesconexao: 2
							};
							
							//Para cada mapa, obter lista dos usuarios ativos
							//Para cada usuario ativo, verificar se o seu id eh igual a algum dos membros antigos do grupo
							//Se for, entao enviar mensagem
							//Senao, nao enviar
							
							for(var i=0; i < idMapas.length; i++){
								var idsUsuariosAtivos = gerenciadorUsuariosAtivos.getIdsUsuariosAtivos(idMapas[i].idMapa);
								for(var j=0; j < idsUsuariosAtivos.length; j++){
									var ehMembro = false;
									for(var k=0; k < membros.length && !ehMembro; k++){
										if(idsUsuariosAtivos[j] == membros[k].id){
											ehMembro = true;
											enviarUnicastParaUsuarioAtivo(idMapas[i].idMapa,idsUsuariosAtivos[j],msg);
										}
									}
								}
								
							}
							
							gerenciadorBanco.obterGrupos(req.user.id, idOperacaoLocal);
							gerenciadorBanco.eventEmitter.once('fimObterGrupos' + req.user.id + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){ 
								
								msg = {
										alerta: "Alterações aplicadas com sucesso!",
										listaGrupos: listaGrupos,
										listaGruposCoordenados: listaGruposCoordenados
								}; 
								routes.pagina(req,res,'grupos', msg);
							});
									

						} // fim sucesso ao configurar grupo
						
					}); //fim configurarGrupo
					
				}
			
			}); //fim pesquisaMapas grupo
			
		}); //fecha app.post
		
		
		
		//definindo as routes
		app.get('/cadastrarUsuarioComum', function(req,res){
			routes.pagina(req,res,'cadastrarUsuarioComum',null);
		});
		
		app.get('/cadastrarCoordenador', function(req,res){
			routes.pagina(req,res,'cadastrarCoordenador',null);
		});
		
		app.get('/mapas', passport.verificarAutenticacao, function(req,res){
			var idOperacaoLocal = 20;
			if(req.query.desconectado){
				
				gerenciadorBanco.pesquisarMapas(req.user.id, idOperacaoLocal);
				gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + req.user.id + idOperacaoLocal, function(listaMapas){ 
					if(listaMapas.erro){ //erro na pesquisa pelos mapas que o usuario tem acesso
						var msg = {
								alerta: "Ocorreu o seguinte erro ao se pesquisar os mapas que você tem acesso: " + listaMapas.erro,
								mensagem: new Array()
						}; 
						routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao  
					}
					else{ //sucesso na pesquisa pelos mapas que o usuario tem acesso
						
						switch( parseInt(req.query.desconectado) ){
							case 1: 
								routes.pagina(req,res,'mapas', {alerta: "Você foi desconectado do mapa, pois o gerente ou o coordenador está alterando as permissões deste mapa.", mensagem: listaMapas} );
							break;
							case 2:
								routes.pagina(req,res,'mapas', {alerta: "Você foi desconectado do mapa, pois o coordenador está alterando as permissões de seu grupo.", mensagem: listaMapas} );
							break;
							case 3: 
								routes.pagina(req,res,'mapas', {alerta: "Você foi desconectado do mapa, pois não foi possível obter o seu tipo de permissão para a edição do mapa.", mensagem: listaMapas} );
							break;
							case 4: 
								routes.pagina(req,res,'mapas', {alerta: "Você foi desconectado do mapa, pois o coordenador de um de seus grupos, que lhe dava acesso a este mapa, deletou o grupo.", mensagem: listaMapas} );
							break;
							case 5: 
								routes.pagina(req,res,'mapas', {alerta: "Você foi desconectado do mapa, pois sua conexão com o servidor caiu.", mensagem: listaMapas} );
							break;
						}
					}
				});
					
			}
			else{
				gerenciadorBanco.pesquisarMapas(req.user.id, idOperacaoLocal);
				gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + req.user.id + idOperacaoLocal, function(listaMapas){ 
					if(listaMapas.erro){ //erro na pesquisa pelos mapas que o usuario tem acesso
						var msg = {
								alerta: "Ocorreu o seguinte erro ao se pesquisar os mapas que você tem acesso: " + listaMapas.erro,
								mensagem: new Array()
						}; 
						routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao  
					}
					else{ //sucesso na pesquisa pelos mapas que o usuario tem acesso
						routes.pagina(req,res,'mapas', {mensagem:listaMapas});
					}
				});
				
			}
		});
		
		app.post('/cadastrarUsuarioComum', function(req,res){
			var idEvento = getIdEvento();
			gerenciadorBanco.cadastrarUsuario(req.body.usuario, req.body.password, req.body.nome, req.body.email, 1,idEvento); //1 de usuario comum
			gerenciadorBanco.eventEmitter.once('fimCadastroUsuario' + idEvento, function(resultado){ 
				excluirIdEvento(idEvento);
				if(resultado == 1)
					routes.pagina(req,res,'index', {alerta: "Cadastro de usuário comum realizado com sucesso!"} ); 
				else
					routes.pagina(req,res,'cadastrarUsuarioComum', {alerta: "Ocorreu o seguinte erro na tentativa de cadastro: " + resultado + " . Tente novamente."} );
			});
		});
		
		app.post('/cadastrarCoordenador', function(req,res){
			
			if(req.body.passwordCadastroCoordenador == configuracoes["senhaCadastroCoordenador"]){
				var idEvento = getIdEvento();
				gerenciadorBanco.cadastrarUsuario(req.body.usuario, req.body.password, req.body.nome, req.body.email, 0, idEvento); //0 de coordenador
				gerenciadorBanco.eventEmitter.once('fimCadastroUsuario' + idEvento, function(resultado){ 
					excluirIdEvento(idEvento);
					if(resultado == 1)
						routes.pagina(req,res,'index', {alerta: "Cadastro de coordenador realizado com sucesso!"} ); 
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
				if(gerenciadorArquivos.verificarExistenciaArquivoXML(req.body.idMapa)){
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
			}
			else{
				res.redirect('/mapas');
			}
			
		});
		
		app.get('/criarMapa', function(req,res){
			var idOperacaoLocal = 17;
			if(!req.isAuthenticated()){
				routes.pagina(req,res,'index',null);
			}
			else{
				
				var idUsuario, nomeUsuario, achou, msg;
				
				idUsuario = req.user.id;
				gerenciadorBanco.buscarTodosUsuarios(idOperacaoLocal);
				gerenciadorBanco.eventEmitter.once('fimBuscaTodosUsuarios'+idOperacaoLocal, function(listaUsuarios){
					
					if(listaUsuarios.erro){ //erro na busca dos usuarios
						var msg;
						gerenciadorBanco.pesquisarMapas(idUsuario, idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){ 
							msg = {
									alerta: "Mapa não criado! Ocorreu um erro ao se tentar encontrar os usuários do sistema. Tente novamente.",
									mensagem: mapas
							}; 
							routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
						});
					}
					else{ //sucesso na busca de todos usuarios
						
						gerenciadorBanco.buscarTodosGrupos(idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimBuscaTodosGrupos' + idOperacaoLocal, function(listaGrupos){
							if(listaUsuarios.erro){ //erro na busca dos grupos
								var msg;
								gerenciadorBanco.pesquisarMapas(idUsuario, idOperacaoLocal);
								gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){ 
									msg = {
											alerta: "Mapa não criado! Ocorreu um erro ao se tentar encontrar os grupos do sistema. Tente novamente.",
											mensagem: mapas
									}; 
									routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
								});
							}
							else{ //sucesso na busca dos grupos
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
										listaUsuarios: listaUsuarios,
										listaGrupos: listaGrupos
								};
								routes.pagina(req,res,'criarMapa', msg);
							}
						});
						
						
					}
					
					
				});
			}
		});
		
		app.post('/criarMapa', function(req,res){
			var idOperacaoLocal = 15;
			var permissoesGrupos = new Array();
			var permissoesUsuarios = new Array();
			//as propriedades sao duas: nomeMapa e usuario+idUsuario. O ultimo tipo e o de mais elementos e contem o tipo de permissao do usuario que nomeia o tipo.
			var propriedades = Object.getOwnPropertyNames(req.body);
			var idProprietario = req.user.id;
			
			if(!req.body.idCoordenador || !req.body.nomeMapa){
				gerenciadorBanco.pesquisarMapas(idProprietario, idOperacaoLocal);
				gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + req.user.id + idOperacaoLocal, function(mapas){ 
					msg = {
							alerta: "Mapa não criado! Faltaram informações para sua criação.",
							mensagem: mapas
					}; 
					routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
				});
			}
			else{
				gerenciadorBanco.verificarTipoUsuario( parseInt(req.body.idCoordenador), idOperacaoLocal );
				gerenciadorBanco.eventEmitter.once('fimVerificarTipoUsuario' + parseInt(req.body.idCoordenador) + idOperacaoLocal, function(tipoUsuario){ 
					if(tipoUsuario != 0 ){ //deu erro ou nao eh coordenador
						var msg;
						gerenciadorBanco.pesquisarMapas(req.user.id, idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + req.user.id + idOperacaoLocal, function(mapas){ 
							msg = {
									alerta: "Mapa não criado! Ocorreu um erro ao se tentar encontrar o coordenador do mapa. Tente novamente.",
									mensagem: mapas
							}; 
							routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
						});
					}
					else{ //eh coordenador
						
						for(var i=0; i < propriedades.length; i++){
							if(propriedades[i] != "nomeMapa" && propriedades[i] != "idCoordenador"){
								
								if(propriedades[i].indexOf("usuario") != -1){ //eh usuario
									
									if( parseInt(propriedades[i].replace("usuario", ""))!= idProprietario ){ //o proprietario nao entra na tabela permissoes_edicao_usuarios
										var permissao = new Object();
										permissao.idUsuario = parseInt(propriedades[i].replace("usuario", ""));
										permissao.tipoPermissao = req.body[propriedades[i]];
										permissoesUsuarios.push(permissao);
									}
									
								}
								else{ //eh grupo
									var permissao = new Object();
									permissao.idGrupo = parseInt(propriedades[i].replace("grupo", ""));
									permissao.tipoPermissao = req.body[propriedades[i]];
									permissoesGrupos.push(permissao);
								}
								
							}
						}
						var idEvento = getIdEvento();
						gerenciadorBanco.inserirNovoMapa(req.body.nomeMapa, parseInt(req.body.idCoordenador), idProprietario, permissoesGrupos, permissoesUsuarios,idEvento);
						gerenciadorBanco.eventEmitter.once('mapaCriado' + idEvento, function(idMapa){ 
							excluirIdEvento(idEvento);
							if(idMapa.erro){
								
								var msg;
								gerenciadorBanco.pesquisarMapas(idProprietario, idOperacaoLocal);
								gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idProprietario + idOperacaoLocal, function(mapas){ 
									if(idMapa.tipoErro == 1){
										msg = {
												alerta: "Mapa não criado! Ocorreu o seguinte erro ao se tentar criar o mapa: " + idMapa.erro,
												mensagem: mapas
										}; 
									}
									else{
										msg = {
												alerta: "Mapa Criado, porém suas permissões não foram adicionadas devido ao erro: " + idMapa.erro,
												mensagem: mapas
										}; 
									}
									
									routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
								});
							}
							else{
								gerenciadorArquivos.criarMapa(idMapa, req.body.nomeMapa);
								res.redirect('mapas');
							}
							
						});
					}
				});
			}
			
			
			
		});
		
		app.post('/obterInfoMapa', passport.verificarAutenticacao, function(req,res){
			var idOperacaoLocal = 18;
			var idUsuario; 
			var idMapa; // vem da pagina mapas.ejs
			
			idUsuario = req.user.id;
			idMapa = req.body.idMapa;
			
			if(idMapa){ //se o usuario selecionou algum mapa
				
				//buscar nome do mapa
				gerenciadorBanco.buscarNomeMapa(idMapa);
				gerenciadorBanco.eventEmitter.once('fimBuscaNomeMapa' + idMapa, function(resultado){ 
					
					if(resultado.erro){ //erro na busca do nome do mapa
						
						var msg;
						gerenciadorBanco.pesquisarMapas(idUsuario, idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){ 
							msg = {
									alerta: "Ocorreu o seguinte erro ao se tentar configurar o mapa: "+ resultado.erro,
									mensagem: mapas
							}; 
							routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
						});
					}
					else{ //sucesso na busca do nome do mapa
						var nomeMapa = resultado;
						
						//busca usuarios com permissao para este mapa
						gerenciadorBanco.pesquisarTodosComPermissao(idMapa,idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimPesquisaTodosComPermissao' + idOperacaoLocal, function(listaUsuariosPermitidos, listaGruposPermitidos){ 
							
							if(listaUsuariosPermitidos.erro){ //erro na busca dos usuarios com permissao
								
								var msg;
								gerenciadorBanco.pesquisarMapas(idUsuario, idOperacaoLocal);
								gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){ 
									msg = {
											alerta: "Ocorreu o seguinte erro ao se tentar configurar o mapa: "+ resultado.erro,
											mensagem: mapas
									}; 
									routes.pagina(req,res,'mapas', msg);
								});
								
							}
							else{ //sucesso na busca dos usuarios com permissao
								
								//necessario saber a permissao do usuario, pois so administrador e gerente podem mudar permissoes
								var i=0;
								while( i < listaUsuariosPermitidos.length && listaUsuariosPermitidos[i].id != idUsuario)
									i++;
								
								if(i < listaUsuariosPermitidos.length && ( listaUsuariosPermitidos[i].tipoPermissao == "Gerente" || listaUsuariosPermitidos[i].tipoPermissao == "Coordenador") ){
									
									//necessario buscar o nome de todos os usuarios
									gerenciadorBanco.buscarTodosUsuarios(idOperacaoLocal);
									gerenciadorBanco.eventEmitter.once('fimBuscaTodosUsuarios' + idOperacaoLocal, function(listaTodosUsuarios){
										
										if(listaTodosUsuarios.erro){ //erro ao pesquisar todos os usuarios
											
											var msg;
											gerenciadorBanco.pesquisarMapas(idUsuario, idOperacaoLocal);
											gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){ 
												msg = {
														alerta: "Ocorreu o seguinte erro ao se tentar configurar o mapa: "+ resultado.erro,
														mensagem: mapas
												}; 
												routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
											});
										}
										else{ //sucesso ao pesquisar todos os usuarios
											
											//necessario buscar o nome de todos os grupos
											gerenciadorBanco.buscarTodosGrupos(idOperacaoLocal);
											gerenciadorBanco.eventEmitter.once('fimBuscaTodosGrupos' + idOperacaoLocal, function(listaTodosGrupos){
												if(listaTodosGrupos.erro){ //erro ao pesquisar todos os grupos
													
													var msg;
													gerenciadorBanco.pesquisarMapas(idUsuario, idOperacaoLocal);
													gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){ 
														msg = {
																alerta: "Ocorreu o seguinte erro ao se tentar configurar o mapa: "+ resultado.erro,
																mensagem: mapas
														}; 
														routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
													});
												}
												else{ //sucesso ao pesquisar todos os grupos
													var msg;
													msg = {
														listaUsuariosPermitidos: listaUsuariosPermitidos,
														listaGruposPermitidos: listaGruposPermitidos,
														nomeMapa: nomeMapa,
														idMapa: idMapa,
														listaTodosUsuarios: listaTodosUsuarios,
														listaTodosGrupos: listaTodosGrupos
													};
													routes.pagina(req,res,'configurarMapa', msg);
												}
											});
										}
									});
								}
								
								else{ //nao e administrador nem gerente
									var msg;
									gerenciadorBanco.pesquisarMapas(idUsuario, idOperacaoLocal);
									gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){ 
										msg = {
												alerta: "Você não tem permissão para configurar este mapa!",
												mensagem: mapas
										}; 
										routes.pagina(req,res,'mapas', msg);
									});
								}
							}
							
						});
						
						
					} // sucesso busca nome mapa
					
				}); // fim evento busca nome mapa
				
			}
			else{ //usuario nao selecionou um mapa
				res.redirect('/mapas');
			}
		});
		
		
		app.post('/configurarMapa', passport.verificarAutenticacao, function(req,res){
			var idOperacaoLocal = 16;
			var permissoesGrupos = new Array();
			var permissoesUsuarios = new Array();
			//as propriedades sao: nomeMapa, idMapa, idCoordenador , usuario+idUsuario e grupo+idGrupo. Os ultimos tipos sao os de mais elementos e contem o tipo de permissao do usuario ou do grupo que nomeia o tipo.
			var propriedades = Object.getOwnPropertyNames(req.body);
			var idProprietario = req.user.id;
			
			gerenciadorBanco.verificarTipoUsuario( parseInt(req.body.idCoordenador), idOperacaoLocal );
			gerenciadorBanco.eventEmitter.once('fimVerificarTipoUsuario' + parseInt(req.body.idCoordenador) + idOperacaoLocal, function(tipoUsuario){ 
				
				if(tipoUsuario != 0 ){ //deu erro ou nao eh coordenador
					var msg;
					gerenciadorBanco.pesquisarMapas(idProprietario, idOperacaoLocal);
					gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idProprietario + idOperacaoLocal, function(mapas){ 
						msg = {
								alerta: "Mapa não reconfigurado! Ocorreu um erro relativo ao coordenador do mapa. Tente novamente.",
								mensagem: mapas
						}; 
						routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
					});
				}
				else{ // eh coordenador
					
					for(var i=0; i < propriedades.length; i++){
						
						if(propriedades[i] != "nomeMapa" && propriedades[i] != "idMapa" && propriedades[i] != "idCoordenador"){
							if(propriedades[i].indexOf("usuario") != -1){ //eh usuario
								
								if( parseInt(propriedades[i].replace("usuario", ""))!= idProprietario ){ //o proprietario nao entra na tabela permissoes_edicao_usuarios
									var permissao = new Object();
									permissao.idUsuario = parseInt(propriedades[i].replace("usuario", ""));
									permissao.tipoPermissao = req.body[propriedades[i]];
									permissoesUsuarios.push(permissao);
								}
								
							}
							else{ //eh grupo
								var permissao = new Object();
								permissao.idGrupo = parseInt(propriedades[i].replace("grupo", ""));
								permissao.tipoPermissao = req.body[propriedades[i]];
								permissoesGrupos.push(permissao);
							}
						}
						
					}

					gerenciadorBanco.configurarMapa(req.body.idMapa, req.body.nomeMapa, parseInt(req.body.idCoordenador), idProprietario, permissoesUsuarios, permissoesGrupos);
					gerenciadorBanco.eventEmitter.once('fimConfigurarMapa' + idProprietario + req.body.idMapa, function(resultado){ 
						if(resultado.erro){ //erro 
							
							var msg;
							gerenciadorBanco.pesquisarMapas(req.user.id, idOperacaoLocal);
							gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + req.user.id + idOperacaoLocal, function(mapas){ 
								msg = {
										alerta: resultado.erro,
										mensagem: mapas
								}; 
								routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
							});
						}
						else{ //sucesso ao configurar mapa
							var msg;
							
							//desconectar os usuarios que estao logados no mapa
							msg = {
									tipoMensagem: 10,
									tipoDesconexao: 1
							};
							enviarParaTodosUsuariosAtivos(req.body.idMapa,msg);
							
							gerenciadorBanco.pesquisarMapas(req.user.id,idOperacaoLocal);
							gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + req.user.id + idOperacaoLocal, function(mapas){ 
								msg = {
										alerta: resultado,
										mensagem: mapas
								}; 
								routes.pagina(req,res,'mapas', msg); //necessario return para interromper a funcao 
							});
						}
					});
				}
			});
			
			
		});
		
		
		app.post('/excluirMapa', passport.verificarAutenticacao, function(req,res){
			var idOperacaoLocal = 19;
			var idUsuario; 
			var idMapa; // vem da pagina mapas.ejs
			
			idUsuario = req.user.id;
			idMapa = req.body.idMapa;
			
			if(idMapa){ //se o usuario selecionou algum mapa
				
				gerenciadorBanco.verificarTipoPermissao(idUsuario, idMapa, idOperacaoLocal); //Obtendo a permissao do usuario
				gerenciadorBanco.eventEmitter.once('tipoPermissao' + idUsuario + idMapa + idOperacaoLocal, function(tipoPermissao){ 
	
					if(tipoPermissao.erro){
						var msg;
						
						gerenciadorBanco.pesquisarMapas(req.user.id, idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){ 
							msg = {
									alerta: "Ocorreu o seguinte erro ao se tentar excluir o mapa: " + tipoPermissao.erro,
									mensagem: mapas
							}; 
							routes.pagina(req,res,'mapas', msg);
						});
					}
					else{
						
						if(tipoPermissao == 0 || tipoPermissao == 1){ // se for o gerente ou administrador
							var numUsersAtivos;
							numUsersAtivos = gerenciadorUsuariosAtivos.getQuantidadeUsuariosAtivos(idMapa);
							
							if(numUsersAtivos == 0 || numUsersAtivos == -1 ){ //nenhum usuario ativo no mapa, pode excluir
								var r;
								
								gerenciadorBanco.excluirMapa(idMapa);
								gerenciadorBanco.eventEmitter.once('fimExclusaoMapa' + idMapa, function(resultado){ 
									if(resultado == 1){ //excluido com sucesso do banco
										
										r = gerenciadorArquivos.excluirMapa(idMapa);
										if(r == 1){ //mapa excluido com sucesso
											var msg;
											gerenciadorBanco.pesquisarMapas(req.user.id, idOperacaoLocal);
			
											gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){
												
												msg = {
														alerta: "Mapa excluído com sucesso!",
														mensagem: mapas
												}; 
												routes.pagina(req,res,'mapas', msg);
											});
										}
										else{ //se erro ao excluir o arquivo
											var msg;
											
											gerenciadorBanco.pesquisarMapas(req.user.id, idOperacaoLocal);
											gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){ 
												msg = {
														alerta: "Mapa não excluído! Ocorreu o seguinte erro ao se tentar excluir: " + r, // r armazena o tipo de erro
														mensagem: mapas
												}; 
												routes.pagina(req,res,'mapas', msg);
											});
										}
										
									}
									else{ //erro ao excluir do banco
										var msg;
										
										gerenciadorBanco.pesquisarMapas(req.user.id, idOperacaoLocal);
										gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){ 
											msg = {
													alerta: "Mapa não excluído! Ocorreu o seguinte erro ao se tentar excluir: " + r, // r armazena o tipo de erro
													mensagem: mapas
											}; 
											routes.pagina(req,res,'mapas', msg);
										});
										
									}
								});
								
									
							}
							else{ // algum usuario ativo no mapa
								var msg;
								
								gerenciadorBanco.pesquisarMapas(req.user.id, idOperacaoLocal);
								gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){ 
									msg = {
											alerta: "Mapa não excluído! Certifique-se de que nenhum usuário esteja editando este mapa antes de tentar excluí-lo.",
											mensagem: mapas
									}; 
									routes.pagina(req,res,'mapas', msg);
								});
							}
						}
						else{ // nao tem permissao
							var msg;
							
							gerenciadorBanco.pesquisarMapas(req.user.id, idOperacaoLocal);
							gerenciadorBanco.eventEmitter.once('fimPesquisaMapas' + idUsuario + idOperacaoLocal, function(mapas){ 
								msg = {
										alerta: "Você não tem permissão para isso!",
										mensagem: mapas
								}; 
								routes.pagina(req,res,'mapas', msg);
							});
						}
					}
					
				});
			}
			else{ //usuario nao selecionou nenhum mapa
				res.redirect('/mapas');
			}

		});
		
		
		app.post(
			'/autenticar',
			function(req, res){
				passport.ppt.authenticate('local', function handleAuthenticate(err, user){
					if(err){
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
				var idOperacaoLocal = 21;
				var idUsuario = parseInt(idUsuarioP);
				var idMapa = parseInt(idMapaP);
				
				//abrindo arquivo XML
				if(gerenciadorArquivos.buscarPosicaoMapaNaLista( idMapa ) == -1){
					gerenciadorArquivos.abrirMapa(idMapa);
	    		}
				
				//Registrando usuario ativo do mapa
				
				gerenciadorBanco.verificarTipoPermissao(idUsuario, idMapa, idOperacaoLocal); //Obtendo a permissao do usuario
				gerenciadorBanco.eventEmitter.once('tipoPermissao' + idUsuario + idMapa + idOperacaoLocal, function(tipoPermissao){ 
					
					//adiciona o usuario e o mapa se este ja nao estiver adicionado
					//mesmo com erro no tipoPermissao eh para por na lista, pois senao havera problema na hora da desconexao, ja que esta remove o usuario da lista
					gerenciadorUsuariosAtivos.adicionarUsuarioAtivo(idMapa, idUsuario, socket, tipoPermissao);
					
					if(tipoPermissao.erro || tipoPermissao == -1){ // deu erro ou user nao tem permissao
						var msg;
						//desconectar o usuario para o qual nao se obteve as permissoes no mapa, ou por erro, ou por realmente nao ter permissao para aquele mapa
						msg = {
								tipoMensagem: 10,
								tipoDesconexao: 3
						};
						socket.send(msg);
					}
					else{
						
						//lista estruturada em html para o usuario carregar o mapa
						var msg = montarListaHtml(gerenciadorArquivos.getMapa(idMapa));
						socket.send(msg);
						
						console.log("Usuario #" + idUsuario + " conectou-se.");
					}
					
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
						
						case 3:
							var idMapa;
				    		idMapa = parseInt(mensagem.idMapa);
				    		
				    		//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(idMapa, socket) != 3){
				    			var ligacao = {
					    				idLigacao : gerenciadorArquivos.buscarIdDisponivel(idMapa),
					    				idLinhaPai : gerenciadorArquivos.buscarIdDisponivel(idMapa),
					    				idLinhaFilho1 :  gerenciadorArquivos.buscarIdDisponivel(idMapa),
					    				idConceitoPai : mensagem.idConceitoPai, 
					    				idConceitoFilho1 : mensagem.idConceitoFilho1, 
										x:  mensagem.x,
										y:   mensagem.y,
										texto : mensagem.texto,
										fonte :  mensagem.fonte,
										tamanhoFonte :  mensagem.tamanhoFonte,
										corFonte :  mensagem.corFonte,
										corFundo :  mensagem.corFundo
					    		};
					    		
					    		//inserir no arquivo xml
					    		var resultado = gerenciadorArquivos.adicionarLigacao(idMapa, ligacao);
					    		
					    		if(resultado==1){
									delete mensagem.idMapa;
									mensagem.idLigacao = ligacao.idLigacao;
									mensagem.idLinhaPai = ligacao.idLinhaPai;
									mensagem.idLinhaFilho1 = ligacao.idLinhaFilho1;
									mensagem.qtdFilhos = 1;
									mensagem.alturaMinima = 0;
									mensagem.larguraMinima = 0;
									
									//manda para todos os usuarios, inclusive quem criou o conceito
									enviarParaTodosUsuariosAtivos(idMapa, mensagem);
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
						
						case 5: // nova semiligacao
							
							var idMapa;
				    		idMapa = parseInt(mensagem.idMapa);
				    		
				    		//visualizador nao tem permissao para isso
				    		if(gerenciadorUsuariosAtivos.verificarPermissao(idMapa, socket) != 3){
					    		var semiLigacao = {
					    				idLigacao : mensagem.idLigacao,
					    				idConceito : mensagem.idConceito,
					    				idLinha :  gerenciadorArquivos.buscarIdDisponivel(idMapa),
					    				papelConceito: gerenciadorArquivos.getPapelConceitoDisponivel(idMapa, mensagem.idLigacao),
					    				novaQtdFilhos: gerenciadorArquivos.getQtdFilhosLigacao(idMapa, mensagem.idLigacao) + 1
					    		};
					    		
					    		//inserir no arquivo xml
					    		resultado = gerenciadorArquivos.adicionarSemiLigacao(idMapa, semiLigacao);
								
								if(resultado == 1){
									mensagem.idLinha = semiLigacao.idLinha;
									mensagem.papelConceito = semiLigacao.papelConceito;
									mensagem.novaQtdFilhos = semiLigacao.novaQtdFilhos;
									
									//manda para todos os usuarios, inclusive quem criou o conceito
									enviarParaTodosUsuariosAtivos(idMapa, mensagem);
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
			
			//TESTE
			
			// user perdeu a conexao e esta tentando reconectar, proibir
			socket.on('reconnecting', function(){
				
				console.log("reconnecting");
				var msg;
				msg = {
						tipoMensagem: 10,
						tipoDesconexao: 5
				};
				socket.send(msg);
			});
			
			socket.on('anything', function(data) {
				console.log("anything");
			});
			
			socket.on('error', function(data) {
				console.log(data);
			});
			
			
			//FIM TESTE
			
			socket.on('disconnect', function () { 
				socket.send("voce foi desconectado");
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
	
	function enviarUnicastParaUsuarioAtivo(idMapa, idUsuario, msg){
		var socketUsuario = gerenciadorUsuariosAtivos.getSocketUsuarioAtivoPeloId(idMapa, idUsuario);
		socketUsuario.send(msg);
	}
	
	
}

var servidor;
	
servidor = new Servidor('192.168.137.1',2015);
servidor.eventEmitter.once("BDconectado", function(result){
	if(result.erro) 
		console.log("Servidor nao iniciado! Ocorreu o erro: " + result.erro);
	else{
		
		console.log(servidor.iniciar());
	}
});


		

		


	

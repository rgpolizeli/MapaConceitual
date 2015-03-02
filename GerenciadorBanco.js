function GerenciadorBanco(){
	
	var events = require('events');
	var mysql = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user: 'root',
	  password: 'ricardo',
	  database: 'teste',
	  multipleStatements: true
	});
	
	var gerenciadorBanco = this;
	this.eventEmitter = new events.EventEmitter();
	
	//define o numero de listeners associados a um EventEmitter. Como cada busca pelo nome de grupos adiciona um listener, deixei ilimitado. 
	//this.eventEmitter.setMaxListeners(0);
	
	
	this.buscarTodosGrupos = function buscarTodosGrupos(){
		connection.query('SELECT id,nome FROM grupos', function(err, result) {
			var listaGrupos;
			listaGrupos = new Array();
			
			if(err) {
				gerenciadorBanco.eventEmitter.emit('fimBuscaTodosGrupos', {erro: err.code});
			}
			else { 
				for(var i=0; i < result.length; i++){
					listaGrupos[i] = {
							id: result[i].id,
							nome: result[i].nome
					};
				}
				
				gerenciadorBanco.eventEmitter.emit('fimBuscaTodosGrupos', listaGrupos);
			}
		});	
	};
	
	
	
	this.excluirGrupo = function excluirMapa (idGrupo){
		
		connection.query('DELETE FROM grupos WHERE id = ?',[idGrupo], function(err, result) {		
			if(err) {
				gerenciadorBanco.eventEmitter.emit('fimExclusaoGrupo', {erro: err.code} );
			}
			else{
				gerenciadorBanco.eventEmitter.emit('fimExclusaoGrupo', 1);
			}
		});
		
	};
	
	
	this.pesquisarMapasGrupo = function pesquisarMapasGrupo(idGrupo){

		var listaMapas = new Array();
		
		connection.query('SELECT idMapa FROM permissoes_edicao_grupos WHERE idGrupo = ?',[idGrupo], function(err, result) {		
			if(err) {
				if(err.code == 'ER_NO_SUCH_TABLE'){
					connection.query(
						'CREATE TABLE permissoes_edicao_grupos(' +
							'idGrupo INT NOT NULL,'+
							'idMapa INT NOT NULL,'+ 
							'tipoPermissao INT NOT NULL,'+
							'FOREIGN KEY (idGrupo) REFERENCES grupos (id)'+
							' ON DELETE CASCADE,'+
							' FOREIGN KEY (idMapa) REFERENCES mapas (id)'+
							' ON DELETE CASCADE,'+
							'PRIMARY KEY (idGrupo,idMapa)'+
						') ENGINE=InnoDB'
					);
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasGrupo', listaMapas,idGrupo);
				}
				else{
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasGrupo', {erro: err.code}, idGrupo);
				}
			}
			else { 
				for(var i=0; i < result.length; i++){
					listaMapas[i] = new Object();
					listaMapas[i].idMapa = result[i].idMapa;
					pesquisarNomeMapa(listaMapas[i].idMapa, i);
					gerenciadorBanco.eventEmitter.once('fimPesquisaNomeMapa' + i, function retornoNomeMapaPesquisado(nomeMapa, indice){ 
						listaMapas[indice].nomeMapa = nomeMapa;
						
						// so vou emitir o termino de pesquisarMapas quando o nome do ultimo mapa tiver acabado de ser pesquisado.
						if(indice == result.length - 1)
							gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasGrupo', listaMapas, idGrupo);
					});
				}
				
				if(result.length == 0) //se nao houver mapas
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasGrupo', listaMapas, idGrupo);
			}
		});	
	};
	
	
	
	function TipoMembroGrupoParaNumero (nometipoMembro){
		var tiposMembro = {
				"Coordenador": 0,
				"Comum": 1
		};
		return tiposMembro[nometipoMembro];
	}
	
	
	function alterarConfiguracoesGrupo(idGrupo, nomeGrupo, listaMembrosAtuais, novosMembros){
		//novosMembros eh uma lista de objetos com duas propriedades: idUsuario em int e tipoMembro em string
		//listaMembrosAtuais eh uma lista com id do usuario em int, nome do usuario e tipoMembro em string
		
		var transacao;
		var estaNaLista;
		
		transacao = 
			"SET autocommit = 0;" +
			" START TRANSACTION;" +
			" UPDATE grupos SET nome='" + nomeGrupo + "' WHERE id=" + idGrupo + ";"
		;
		
		// Para cada membro da lista novosMembros, ou seja, dos usuarios alterados pelo coordenador, verificar:
		// se o usuario nao era membro, adicionar,
		// se o usuario estah na lista antiga, mas nao na nova, deleta-lo.
		 
		for(var i=0; i < novosMembros.length; i++){
			estaNaLista = false;
			
			for(var j=0; j< listaMembrosAtuais.length && !estaNaLista; j++){
				if(novosMembros[i].idUsuario == listaMembrosAtuais[j].id){
					estaNaLista = true;
					listaMembrosAtuais.splice(j,1);
				}
			}
			
			if(!estaNaLista){ //usuario completamente novo
				transacao += 
					" INSERT INTO membros SET idUsuario =" + novosMembros[i].idUsuario +
					", idGrupo =" + idGrupo +
					", tipoMembro =" + TipoMembroGrupoParaNumero(novosMembros[i].tipoMembro) +
					";"
				;
			}
		}
		
		if(listaMembrosAtuais.length > 0){ //membros a serem excluidos
			for(var j=0; j < listaMembrosAtuais.length; j++){
				transacao += 
					" DELETE FROM membros WHERE idUsuario=" + listaMembrosAtuais[j].id +
					" AND idGrupo=" + idGrupo + ";"
				;
			}
		}
		
		
		//Aplicando a transacao
		connection.query(transacao, function(err, result) {
			if(err)
				gerenciadorBanco.eventEmitter.emit('fimAlterarConfiguracoesGrupo', {erro: err.code});
			else
				gerenciadorBanco.eventEmitter.emit('fimAlterarConfiguracoesGrupo', "Alteracoes realizadas com sucesso!");
		});	
		
	}
	
	
	
	this.configurarGrupo = function configurarGrupo(idGrupo, nomeGrupo, idUsuario, novosMembros){
		//membros eh uma lista de objetos com duas propriedades: idUsuario em int e tipoMembro em string
		
		if(idGrupo){ //se o usuario nao apagou o id do grupo na pagina configurarGrupo.ejs
			idGrupo = parseInt(idGrupo);
			
			gerenciadorBanco.pesquisarMembrosGrupo(idGrupo);
			gerenciadorBanco.eventEmitter.once('fimPesquisaMembrosGrupo', function(resultado){ 
				
				if(resultado.erro){ //erro na busca dos atuais membros
					gerenciadorBanco.eventEmitter.emit('fimConfigurarGrupo', {erro: resultado.erro});
				}
				else{ //sucesso na busca dos atuais membros
					
					var listaMembrosAtuais;
					listaMembrosAtuais = resultado;
					
					//necessario saber o tipo do membro, pois so o coordenador pode alterar as configuracoes do grupo
					var i=0;
					while( i < listaMembrosAtuais.length && listaMembrosAtuais[i].id != idUsuario)
						i++;
					
					if( i<listaMembrosAtuais.length && listaMembrosAtuais[i].tipoMembro == "Coordenador" ){
						alterarConfiguracoesGrupo(idGrupo, nomeGrupo, listaMembrosAtuais, novosMembros);
						gerenciadorBanco.eventEmitter.once('fimAlterarConfiguracoesGrupo', function(resultado){ 
							if(resultado.erro){
								connection.query(" ROLLBACK");
								gerenciadorBanco.eventEmitter.emit('fimConfigurarGrupo', {erro: "Alteracoes nao aplicadas, devido ao seguinte erro: " + resultado.erro}); 
							}
							else{
								connection.query(" COMMIT");
								gerenciadorBanco.eventEmitter.emit('fimConfigurarGrupo', resultado);
							}
						});
						
					}
					else{ //ou nao esta na lista ou nao tem permissao de Adm ou gerente
						gerenciadorBanco.eventEmitter.emit('fimConfigurarGrupo', {erro: "Voce nao e o coordenador para configurar este grupo!"}); 
					}
				}
			});
		}
		else{ //usuario apagou id do mapa
			gerenciadorBanco.eventEmitter.emit('fimConfigurarGrupo', {erro: "O id do grupo foi apagado!"}); 
		}
	};
	
	
	
	
	this.verificarTipoUsuario = function verificarTipoUsuario(idUsuario){
		connection.query('SELECT tipo FROM usuarios WHERE id = ?',[idUsuario], function(err, result) {		
			if(err){
				gerenciadorBanco.eventEmitter.emit('fimVerificarTipoUsuario', {erro: err.code});
			}
			else
				gerenciadorBanco.eventEmitter.emit('fimVerificarTipoUsuario', result[0].tipo);
		});	
	};
	
	
	
	function adicionarMembros(idGrupo, membros){
		
		var membrosRestantes = new Array();
		
		for(var i=0; i < membros.length; i++){
			membrosRestantes.push(i);
		}
		
		
		for(var k=0; k < membros.length; k++){
			connection.query('INSERT INTO membros SET idUsuario = ?, idGrupo = ?, tipoMembro = ?',[membros[k].idUsuario, idGrupo, TipoMembroGrupoParaNumero(membros[k].tipoMembro)], function(err, result) {		
				if(err) {
					//fazer algum tratamento
					membrosRestantes.pop();
					if(membrosRestantes.length == 0){
						gerenciadorBanco.eventEmitter.emit('membrosAdicionados');
					}
				}
				else{
					membrosRestantes.pop();
					if(membrosRestantes.length == 0){
						gerenciadorBanco.eventEmitter.emit('membrosAdicionados');
					}
				}
			});
		}	
		
	}
	
	this.inserirNovoGrupo = function (nomeGrupo, membros){
		var idGrupoNovo;
		
		connection.query('INSERT INTO grupos SET nome = ?',[nomeGrupo], function(err, result) {		
			if(err) {
				if(err.code == 'ER_NO_SUCH_TABLE'){ // se a tabela nao tiver sido criada
					connection.query(
						'CREATE TABLE grupos('+
							'id INT NOT NULL AUTO_INCREMENT,'+ 
							'nome VARCHAR(30) NOT NULL,'+ 
							'PRIMARY KEY (id)' +
						') ENGINE=InnoDB'
					);
					
					connection.query('INSERT INTO grupos SET nome = ?',[nomeGrupo], function(err, result) {
						if(err) console.log(err);
						else{
							idGrupoNovo = result.insertId;
							adicionarMembros(idGrupoNovo, membros);
							gerenciadorBanco.eventEmitter.once('membrosAdicionados', function(){ 
								gerenciadorBanco.eventEmitter.emit('grupoCriado', result.insertId);
							});
						}
					});
				}
				else //outro erro
					console.log(err);
			}
			else { 
				idGrupoNovo = result.insertId;
				adicionarMembros(idGrupoNovo, membros);
				gerenciadorBanco.eventEmitter.once('membrosAdicionados', function(){ 
					gerenciadorBanco.eventEmitter.emit('grupoCriado', result.insertId);
				});
			}
		});
	};
	
	function pesquisarNomeGrupo(idGrupo, indice){
		
		connection.query('SELECT nome FROM grupos WHERE id = ?',[idGrupo], function(err, result) {		
			if(err){
				gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeGrupo' + indice, {erro: err.code}, indice);
			}
			else{
				gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeGrupo' + indice, result[0].nome, indice);
			}
		});	
	}
	
	this.buscarNomeGrupo = function buscarNomeGrupo(idGrupo){
		pesquisarNomeGrupo(idGrupo, "");
		gerenciadorBanco.eventEmitter.once('fimPesquisaNomeGrupo', function(nomeGrupo){ 
			gerenciadorBanco.eventEmitter.emit('fimBuscaNomeGrupo', nomeGrupo);
		});
	};
	
	function converterTipoMembro(numTipoMembro){
		var tiposMembro = {
				0: "Coordenador",
				1: "Comum"
		};
		return tiposMembro[numTipoMembro];
	}
	
	
	this.pesquisarMembrosGrupo = function pesquisarMembrosGrupo(idGrupo){
		
		connection.query(
				'SELECT m.idUsuario, u.nome, m.tipoMembro' +
				' FROM membros m, usuarios u' +
				' WHERE m.idGrupo = ? AND m.idUsuario = u.id', [idGrupo], function(err, result) {
				
				if(err) {
					return {erro: err.code};
				}
				else{ 
					
					var listaMembros;
					listaMembros = new Array();
					
					//converter os tipos de membro de numeros para palavras
					for(var i=0; i < result.length; i++){
						listaMembros[i] = {
								id: result[i].idUsuario,
								nome: result[i].nome,
								tipoMembro: converterTipoMembro(result[i].tipoMembro)
						};
					}
					
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMembrosGrupo', listaMembros);
				}
			});	
		
	};
	
	
	this.obterGrupos = function obterGrupos(idUsuario){
		var listaGrupos = new Array();
		var listaGruposCoordenados = new Array();
		
		connection.query('SELECT idGrupo,tipoMembro FROM membros WHERE idUsuario = ?',[idUsuario], function(err, result) {		
			if(err) {
				if(err.code == 'ER_NO_SUCH_TABLE'){
					connection.query(
							'CREATE TABLE grupos('+
								'id INT NOT NULL AUTO_INCREMENT,'+ 
								'nome VARCHAR(30) NOT NULL,'+
								'PRIMARY KEY (id)'+
							') ENGINE=InnoDB'
					);
					connection.query(
						'CREATE TABLE membros(' +
							'idUsuario INT NOT NULL,'+
							'idGrupo INT NOT NULL,'+ 
							'tipoMembro INT NOT NULL,'+
							'FOREIGN KEY (idUsuario) REFERENCES usuarios (id)'+
							' ON DELETE CASCADE,'+
							' FOREIGN KEY (idGrupo) REFERENCES grupos (id)'+
							' ON DELETE CASCADE,'+
							'PRIMARY KEY (idUsuario,idGrupo)'+
						') ENGINE=InnoDB'
					);
					
					connection.query(
							'CREATE TABLE permissoes_edicao_grupos(' +
								'idGrupo INT NOT NULL,'+
								'idMapa INT NOT NULL,'+ 
								'tipoPermissao INT NOT NULL,'+
								'FOREIGN KEY (idGrupo) REFERENCES grupos (id)'+
								' ON DELETE CASCADE,'+
								' FOREIGN KEY (idMapa) REFERENCES mapas (id)'+
								' ON DELETE CASCADE,'+
								'PRIMARY KEY (idGrupo,idMapa)'+
							') ENGINE=InnoDB'
					);
					
					gerenciadorBanco.eventEmitter.emit('fimObterGrupos', listaGrupos, listaGruposCoordenados);
				}
				else{
					gerenciadorBanco.eventEmitter.emit('fimObterGrupos', {erro: err.code}, null);
				}
			}
			else{ 
				for(var i=0; i < result.length; i++){
					
					if(parseInt(result[i].tipoMembro) == 0){ //eh coordenador
						
						listaGruposCoordenados[i] = new Object();
						listaGruposCoordenados[i].idGrupo = parseInt(result[i].idGrupo);
						
						pesquisarNomeGrupo(listaGruposCoordenados[i].idGrupo, i);
						
						//.on pois eh para atender todos os eventos deste tipo
						gerenciadorBanco.eventEmitter.once('fimPesquisaNomeGrupo' + i, function retornoNomeGrupoPesquisado(nomeGrupo, indice){ 
							listaGruposCoordenados[indice].nomeGrupo = nomeGrupo;
							
							// so vou emitir o termino de obterGrupos quando o nome do ultimo grupo tiver acabado de ser pesquisado.
							if(indice == result.length - 1)
								gerenciadorBanco.eventEmitter.emit('fimObterGrupos', listaGrupos, listaGruposCoordenados);
						});
						
					}
					else{ //eh usuario comum
						
						listaGrupos[i] = new Object();
						listaGrupos[i].idGrupo = parseInt(result[i].idGrupo);
						
						pesquisarNomeGrupo(listaGrupos[i].idGrupo, i);
						
						//.on pois eh para atender todos os eventos deste tipo
						gerenciadorBanco.eventEmitter.once('fimPesquisaNomeGrupo' + i, function retornoNomeGrupoPesquisado(nomeGrupo, indice){ 
							listaGrupos[indice].nomeGrupo = nomeGrupo;
							
							// so vou emitir o termino de obterGrupos quando o nome do ultimo grupo tiver acabado de ser pesquisado.
							if(indice == result.length - 1)
								gerenciadorBanco.eventEmitter.emit('fimObterGrupos', listaGrupos, listaGruposCoordenados);
						});
						
					}
					
				}
				
				if(result.length == 0){ //se resultado da pesquisa vazia
					gerenciadorBanco.eventEmitter.emit('fimObterGrupos', listaGrupos, listaGruposCoordenados);
				}
				
			}
		});	
	};
	
	
	/*
	 * Cadastra usuario comum com tipo 1 e coordenador com tipo 1.
	 */
	
	this.cadastrarUsuario = function cadastrarUsuario(usuario, password, nome, email, tipo){ 

		connection.query('INSERT INTO usuarios SET usuario = ?, password = ?, nome = ?, email = ?, tipo = ?',[usuario, password, nome, email, tipo], function(err, result) {
			if(err){
				if(err.code == 'ER_NO_SUCH_TABLE'){
					connection.query('CREATE TABLE usuarios(id INT NOT NULL AUTO_INCREMENT, usuario VARCHAR(30), password VARCHAR(7), nome VARCHAR(100), email VARCHAR(100), tipo INT NOT NULL, PRIMARY KEY (id) )');
					connection.query('INSERT INTO usuarios SET usuario = ?, password = ?, nome = ?, email = ?, tipo = ?',[usuario, password, nome, email, tipo], function(err, result) {
						if(err) gerenciadorBanco.eventEmitter.emit('fimCadastroUsuario', err.code);
						else gerenciadorBanco.eventEmitter.emit('fimCadastroUsuario', 1);
					});
				}
				else
					gerenciadorBanco.eventEmitter.emit('fimCadastroUsuario', err.code);
			}
			else gerenciadorBanco.eventEmitter.emit('fimCadastroUsuario', 1);
		});
	};
	
	
	this.pesquisarMapasDoCoordenador = function pesquisarMapasDoCoordenador(idUsuario){
		var mapas;
		mapas = new Array();
		
		connection.query('SELECT id,nome FROM mapas WHERE idCoordenador=?',[idUsuario], function(err, result) {		
			if(err){
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoCoordenador', {erro: err.code});
			}
			
			else { 
				for(var i=0; i < result.length; i++){
					mapas[i] = new Object();
					mapas[i].idMapa = result[i].id;
					mapas[i].nomeMapa = result[i].nome;
				}
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoCoordenador', mapas);
			}
		});
		
	};
	
	
	this.pesquisarMapasDoGerente = function pesquisarMapasDoGerente(idUsuario){
		var mapas;
		mapas = new Array();
		
		connection.query('SELECT id,nome FROM mapas WHERE idProprietario = ?',[idUsuario], function(err, result) {		
			if(err){
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoGerente', {erro: err.code});
			}
			
			else { 
				for(var i=0; i < result.length; i++){
					mapas[i] = new Object();
					mapas[i].idMapa = result[i].id;
					mapas[i].nomeMapa = result[i].nome;
				}
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoGerente', mapas);
			}
		});
		
	};
	
	this.perquisarMapasDoEditorOuVisualizador = function perquisarMapasDoEditorOuVisualizador(idUsuario){
		
		var mapas = new Array();
		
		connection.query('SELECT idMapa FROM permissoes_edicao_usuarios WHERE idUsuario = ?',[idUsuario], function(err, result) {		
			if(err) {
				if(err.code == 'ER_NO_SUCH_TABLE'){
					connection.query(
							'CREATE TABLE mapas('+
							'id INT NOT NULL AUTO_INCREMENT,'+ 
							'nome VARCHAR(30) NOT NULL,'+ 
							'idProprietario INT NOT NULL,'+ 
							'idCoordenador INT NOT NULL,'+ 
							'PRIMARY KEY (id),'+
							' FOREIGN KEY (idProprietario) REFERENCES usuarios (id)'+
							' ON DELETE CASCADE,'+
							' FOREIGN KEY (idCoordenador) REFERENCES usuarios (id)'+
							' ON DELETE CASCADE'+
						') ENGINE=InnoDB'
					);
					connection.query(
						'CREATE TABLE permissoes_edicao_usuarios(' +
							'idUsuario INT NOT NULL,'+
							'idMapa INT NOT NULL,'+ 
							'tipoPermissao INT NOT NULL,'+
							'FOREIGN KEY (idUsuario) REFERENCES usuarios (id)'+
							' ON DELETE CASCADE,'+
							' FOREIGN KEY (idMapa) REFERENCES mapas (id)'+
							' ON DELETE CASCADE,'+
							'PRIMARY KEY (idUsuario,idMapa)'+
						') ENGINE=InnoDB'
					);
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoEditorOuVisualizador', mapas);
				}
				else{
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoEditorOuVisualizador', {erro:err.code});
				}
			}
			else { 
				for(var i=0; i < result.length; i++){
					mapas[i] = new Object();
					mapas[i].idMapa = result[i].idMapa;
					
					pesquisarNomeMapa(mapas[i].idMapa, i);
					gerenciadorBanco.eventEmitter.once('fimPesquisaNomeMapa' + i, function retornoNomeMapaPesquisado(nomeMapa, indice){ 
						mapas[indice].nomeMapa = nomeMapa;
						
						// so vou emitir o termino de pesquisarMapas quando o nome do ultimo mapa tiver acabado de ser pesquisado.
						if(indice == result.length - 1)
							gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoEditorOuVisualizador', mapas);
					});
				}
				
				if(result.length == 0) //se nao houver mapas
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoEditorOuVisualizador', mapas);
			}
		});	
	};
	
	
	function pesquisarNomeMapa(idMapa, indice){
		
		connection.query('SELECT nome FROM mapas WHERE id = ?',[idMapa], function(err, result) {		
			if(err){
				gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeMapa' + indice, {erro: err.code}, indice);
			}
			else{
				gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeMapa' + indice, result[0].nome, indice);
			}
		});	
	}
	
	this.buscarNomeMapa = function buscarNomeMapa(idMapa){
		pesquisarNomeMapa(idMapa, "");
		gerenciadorBanco.eventEmitter.once('fimPesquisaNomeMapa', function(nomeMapa){ 
			gerenciadorBanco.eventEmitter.emit('fimBuscaNomeMapa', nomeMapa);
		});
	};
	
	
	
	this.excluirMapa = function excluirMapa (idMapa){
		
		connection.query('DELETE FROM mapas WHERE id = ?',[idMapa], function(err, result) {		
			if(err) {
				gerenciadorBanco.eventEmitter.emit('fimExclusaoMapa', err.code);
			}
			else{
				gerenciadorBanco.eventEmitter.emit('fimExclusaoMapa', 1);
			}
		});
		
	};
	
	function adicionarNaoRedundantes(novaListaMapas, listaMapas){
		
		for(var i=0; i< novaListaMapas.length; i++){ //para cada mapa da lista nova verifica-se se ele ja esta na lista final
			
			var estahNaLista = false;
			
			for(var k=0; k< listaMapas.length && !estahNaLista; k++){
				if(novaListaMapas[i].idMapa == listaMapas[k].idMapa)
					estahNaLista = true;
			}
			
			if(!estahNaLista){ //se nao estiver na lista final
				listaMapas.push(novaListaMapas[i]);
			}
			
		}
		return listaMapas;
	}
	
	this.pesquisarMapasVariosGrupos = function pesquisarMapasVariosGrupos(listaGrupos){
		
		if(listaGrupos.length > 0){ //lista nao vazia
			for(var i=0; i < listaGrupos.length; i++){
				gerenciadorBanco.pesquisarMapasGrupo(listaGrupos[i].idGrupo);
				gerenciadorBanco.eventEmitter.once("fimPesquisaMapasGrupo", function (listaMapasDoGrupo, idGrupo){
					
					var posicao = 0; //posicao do grupo na listaGrupos
					while(idGrupo != listaGrupos[posicao].idGrupo)
						posicao++;
					
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasGrupo' + posicao, listaMapasDoGrupo, posicao);
					
				});
			}
		}
		else{ //lista vazia
			gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasGrupo' + 0, new Array(), -1);
		}
		
	};
	
	
	this.pesquisarMapas = function pesquisarMapas(idUsuario){
		gerenciadorBanco.verificarTipoUsuario(idUsuario);
		gerenciadorBanco.eventEmitter.once('fimVerificarTipoUsuario', function(tipoUsuario){ 
			if( !(tipoUsuario.erro) ){ //sucesso verificacao tipo usuario
				
				var listaMapasCoordenador;       //lista dos mapas em que o usuario eh coordenador
				var listaMapasGerente;           //lista dos mapas em que o usuario eh gerente ou coordenador
				var listaMapasEditor;            //lista dos mapas em que o usuario eh editor ou visualizador
				var listaMapasGruposCoordenados; //lista dos mapas aos quais os grupos coordenados pelo usuario tem acesso
				var listaMapasGrupos;            //lista dos mapas aos quais os grupos dos quais o usuario faz parte tem acesso
				var listaMapas;                  //lista de todos os mapas que o usuario tem acesso - jah sem redundancias
				
				
				//==============================================
				//PESQUISA MAPAS CASO USUARIO EH COORDENADOR
				//==============================================
				
				if(tipoUsuario == 0){
					
					//pesquisar mapas que o user eh coordenador
					
					gerenciadorBanco.pesquisarMapasDoCoordenador(idUsuario);
					gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDoCoordenador', function(resultado){ 
						if(resultado.erro){
							gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', resultado.erro);
						}
						else{ //sucesso pesquisa mapas que o user eh coordenador
							
							listaMapasCoordenador = resultado;
							listaMapas = listaMapasCoordenador;

							
							//pesquisar mapas que o user eh gerente
							gerenciadorBanco.pesquisarMapasDoGerente(idUsuario);
							gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDoGerente', function(resultado){
								if(resultado.erro){
									gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', resultado.erro);
								}
								else{ //sucesso pesquisa mapas que o user eh gerente
									
									listaMapasGerente = resultado;
									listaMapas = adicionarNaoRedundantes(listaMapasGerente, listaMapas);
									
									//pesquisar mapas que o user eh ou editor ou visualizador
									gerenciadorBanco.perquisarMapasDoEditorOuVisualizador(idUsuario);
									gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDoEditorOuVisualizador', function(resultado){ 
										if(resultado.erro){
											gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', resultado.erro);
										}
										else{ // sucesso pesquisa  mapas que o user eh ou editor ou visualizador
											listaMapasEditor = resultado;
											listaMapas = adicionarNaoRedundantes(listaMapasEditor, listaMapas);
											
											//pesquisar os grupos do user
											
											gerenciadorBanco.obterGrupos(idUsuario);
											gerenciadorBanco.eventEmitter.once('fimObterGrupos', function(listaGrupos, listaGruposCoordenados){
												if(listaGrupos.erro){
													gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', listaGrupos.erro);
												}
												else{ // sucesso na pesquisa dos grupos do user
													
													listaMapasGruposCoordenados = new Array();
													listaMapasGrupos = new Array();
													
													var h = 0;
													do{
														gerenciadorBanco.eventEmitter.once('fimPesquisaMapasGrupo' + h, function(listaMapasGrupoCoordenado, posicao){ //posicao eh a posicao do grupo na listaGruposCoordenados
															listaMapasGruposCoordenados =  adicionarNaoRedundantes(listaMapasGrupoCoordenado, listaMapasGruposCoordenados);
															
															if(posicao == listaGruposCoordenados.length - 1){//ultimo mapa ou listaGruposCoord vazia
																gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDosGruposCoordenados', listaMapasGruposCoordenados);
															}
															
														});
														
														h++;
														
													} while( h < listaGruposCoordenados.length );
													
													
													
													//quando os mapas de todos os grupos coordenados tiverem sido obtidos, comeca-se a pesquisa pelos mapas dos grupos em que o user eh membro
													gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDosGruposCoordenados', function(listaMapasGruposCoordenados){
														
														listaMapas = adicionarNaoRedundantes(listaMapasGruposCoordenados, listaMapas);
														
														var h = 0;
														do{
															gerenciadorBanco.eventEmitter.once('fimPesquisaMapasGrupo' + h, function(listaMapasGrupo, posicao){ //posicao eh a posicao do grupo na listaGrupos
																listaMapasGrupos =  adicionarNaoRedundantes(listaMapasGrupo, listaMapasGrupos);
																
																if(posicao == listaGrupos.length - 1){//ultimo mapa ou listaGrupos vazia
																	gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDosGrupos', listaMapasGrupos);
																}
																
															});
															
															h++;
															
														} while( h < listaGrupos.length );
														gerenciadorBanco.pesquisarMapasVariosGrupos(listaGrupos);
														
													});
													
													//quando os mapas de todos os grupos tiverem sido obtidos, finda-se a pesquisaMapas
													gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDosGrupos', function(listaMapasGrupos){
														
														listaMapas = adicionarNaoRedundantes(listaMapasGrupos, listaMapas);
														gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', listaMapas);
																
													});
													
													gerenciadorBanco.pesquisarMapasVariosGrupos(listaGruposCoordenados);
													
													
												} //FIM ELSE -- sucesso na pesquisa dos grupos do user
												
											}); //FIM EVENTO -- fimObterGrupos do user
											
										} //FIM ELSE -- sucesso pesquisa mapas que o user eh ou editor ou visualizador
										
									}); //FIM EVENTO -- fimPesquisaMapasDoEditorOuVisualizador
									
								} //FIM ELSE -- sucesso pesquisa mapas que o user eh gerente
								
							}); //FIM EVENTO -- fimPesquisaMapasDoGerente
							
						} // FIM ELSE -- sucesso pesquisa mapas que o user eh coordenador
						
					}); //FIM EVENTO -- fimPesquisaMapasDoCoordenador
					
				} //FIM IF -- tipoUsuario == 0
				
				
				
				//==============================================
				//PESQUISA MAPAS CASO USUARIO NAO EH COORDENADOR
				//==============================================
				
				else{ 
					
					gerenciadorBanco.pesquisarMapasDoGerente(idUsuario);
					gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDoGerente', function(resultado){
						if(resultado.erro){
							gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', resultado.erro);
						}
						else{ //sucesso pesquisa mapas que o user eh gerente
							
							listaMapasGerente = resultado;
							listaMapas = listaMapasGerente;
							
							//pesquisar mapas que o user eh ou editor ou visualizador
							gerenciadorBanco.perquisarMapasDoEditorOuVisualizador(idUsuario);
							gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDoEditorOuVisualizador', function(resultado){ 
								if(resultado.erro){
									gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', resultado.erro);
								}
								else{ // sucesso pesquisa  mapas que o user eh ou editor ou visualizador
									listaMapasEditor = resultado;
									listaMapas = adicionarNaoRedundantes(listaMapasEditor, listaMapas);
									
									//pesquisar os grupos do user
									
									gerenciadorBanco.obterGrupos(idUsuario);
									gerenciadorBanco.eventEmitter.once('fimObterGrupos', function(listaGrupos){
										if(listaGrupos.erro){
											gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', listaGrupos.erro);
										}
										else{ // sucesso na pesquisa dos grupos do user
											
											listaMapasGrupos = new Array();
											
											var h = 0;
											do{
												gerenciadorBanco.eventEmitter.once('fimPesquisaMapasGrupo' + h, function(listaMapasGrupo, posicao){ //posicao eh a posicao do grupo na listaGrupos
													listaMapasGrupos =  adicionarNaoRedundantes(listaMapasGrupo, listaMapasGrupos);
													
													if(posicao == listaGrupos.length - 1){//ultimo mapa ou listaGrupos vazia
														gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDosGrupos', listaMapasGrupos);
													}
													
												});
												
												h++;
												
											} while( h < listaGrupos.length );
											
											
											//quando os mapas de todos os grupos tiverem sido obtidos, finda-se a pesquisaMapas
											gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDosGrupos', function(listaMapasGrupos){
												
												listaMapas = adicionarNaoRedundantes(listaMapasGrupos, listaMapas);
												gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', listaMapas);
														
											});
											
											gerenciadorBanco.pesquisarMapasVariosGrupos(listaGrupos);
											
										} //FIM ELSE -- sucesso na pesquisa dos grupos do user
										
									}); //FIM EVENTO -- fimObterGrupos do user
									
								} //FIM ELSE -- sucesso pesquisa mapas que o user eh ou editor ou visualizador
								
							}); //FIM EVENTO -- fimPesquisaMapasDoEditorOuVisualizador
							
						} //FIM ELSE -- sucesso pesquisa mapas que o user eh gerente
						
					}); //FIM EVENTO -- fimPesquisaMapasDoGerente
					
				} //FIM ELSE -- tipoUsuario == 1
				
			} //FIM IF -- sucesso na verificacao do tipo de usuario
			
			
			//==============================================
			//ERRO NA VERIFICACAO DO TIPO DO USUARIO
			//==============================================
			
			else{ //erro na verificacao tipo usuario
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', tipoUsuario.erro);
			}
		});
		
	};
	
	
	function montarTransacaoAdicaoPermissoes(idMapa, permissoesGrupos, permissoesUsuarios){
		var tiposPermissao = {
			"Gerente": 1,
			"Editor": 2,
			"Visualizador": 3
		};
		var transacao = "";
		
		for(var i=0; i < permissoesUsuarios.length; i++){
			transacao += 
				"INSERT INTO permissoes_edicao_usuarios " +
				"SET idUsuario=" + permissoesUsuarios[i].idUsuario + 
				", idMapa=" + idMapa + 
				", tipoPermissao=" + tiposPermissao[permissoesUsuarios[i].tipoPermissao] + ";"
			;
		}
		
		for(var i=0; i < permissoesGrupos.length; i++){
			transacao += 
				"INSERT INTO permissoes_edicao_grupos " +
				"SET idGrupo=" + permissoesGrupos[i].idGrupo + 
				", idMapa=" + idMapa + 
				", tipoPermissao=" + tiposPermissao[permissoesGrupos[i].tipoPermissao] + ";"
			;
		}
		
		return transacao;
	}

	
	this.inserirNovoMapa = function (nomeMapa, idCoordenador, idProprietario, permissoesGrupos, permissoesUsuarios){
		var idMapaNovo;
		var transacao;
		
		transacao = 
			"SET autocommit = 0;" +
			" START TRANSACTION;" +
			" INSERT INTO mapas SET nome='" + nomeMapa + "', idProprietario=" + idProprietario + ", idCoordenador=" + idCoordenador + ";"
		;
		
		connection.query(transacao, function(err, result) {		
			if(err) {
				connection.query(" ROLLBACK");
				gerenciadorBanco.eventEmitter.emit('mapaCriado', {erro: err.code, descricao: "Erro ao criar mapa"});
			}
			else{ 
				idMapaNovo = result[2].insertId; // result[2] pois o resultado da insercao do mapa esta na 3 posicao do vetor
				if(permissoesUsuarios.length > 0 || permissoesGrupos.length > 0) {//proibe mapas com permissao apenas ao gerente e coordenador
					transacao = montarTransacaoAdicaoPermissoes(idMapaNovo, permissoesGrupos, permissoesUsuarios);
					connection.query(transacao, function(err, result) {	
						if(err) {
							connection.query(" ROLLBACK");
							gerenciadorBanco.eventEmitter.emit('mapaCriado', {erro: err.code, descricao: "Erro ao adicionar permissoes"});
						}
						else{
							connection.query(" COMMIT");
							gerenciadorBanco.eventEmitter.emit('mapaCriado', idMapaNovo);
						}
					});
				}
				else{ //mapas com permissao apenas ao gerente e ao coordenador
					connection.query(" COMMIT");
					gerenciadorBanco.eventEmitter.emit('mapaCriado', idMapaNovo);
				}
			}
		});
	};
	
	
	this.buscarTodosUsuarios = function(){
		connection.query('SELECT id,nome,tipo FROM usuarios', function(err, result) {
			var listaUsuarios;
			listaUsuarios = new Array();
			
			if(err) {
				gerenciadorBanco.eventEmitter.emit('fimBuscaTodosUsuarios', {erro: err.code});
			}
			else { 
				for(var i=0; i < result.length; i++){
					listaUsuarios[i] = {
							id: result[i].id,
							nome: result[i].nome,
							tipo: result[i].tipo
					};
				}
				
				gerenciadorBanco.eventEmitter.emit('fimBuscaTodosUsuarios', listaUsuarios);
			}
		});	
	};
	
	this.verificarTipoPermissao = function(idUsuario, idMapa){
		
		//verificar primeiro se eh coord ou gerente do mapa
		connection.query('SELECT idProprietario, idCoordenador FROM mapas WHERE id=?', [idMapa], function(err, result) {
			
			if(err) {
				//mensagem de erro ou usuario sem permissao
			}
			else{ 
				if(result[0].idProprietario == idUsuario || result[0].idCoordenador == idUsuario){ //eh coord ou gerente
					if(result[0].idProprietario == idUsuario){
						gerenciadorBanco.eventEmitter.emit('tipoPermissao', 1); //o tipoPermissao de gerente eh 1
					}
					else{
						gerenciadorBanco.eventEmitter.emit('tipoPermissao', 0); //o tipoPermissao de coord eh 0
					}
				}
				else{ //nao eh coord nem gerente
					
					//verificar se o user tem permissao individual sobre o mapa
					connection.query('SELECT tipoPermissao FROM permissoes_edicao_usuarios WHERE idUsuario=? AND idMapa=?', [idUsuario, idMapa], function(err, result) {
						if(err) {
							//mensagem de erro ou usuario sem permissao
						}
						else{
							if(result.length > 0){ //user tem permissao individual
								gerenciadorBanco.eventEmitter.emit('tipoPermissao', result[0].tipoPermissao); 
							}
							else{//user nao tem permissao individual
								
								//necessario verificar os grupos aos quais o user pertence ou coordena
								
							}
						}
					});
					
				}
			}
			
		});	
	};
	
	
	
	//converte as permissoes de numero para palavras
	function converterPermissao(numTipoPermissao){
		var tiposPermissao = {
				0: "Administrador",
				1: "Gerente",
				2: "Editor",
				3: "Visualizador"
		};
		return tiposPermissao[numTipoPermissao];
	}
	
	function converterPermissaoParaNumero(nomeTipoPermissao){
		var tiposPermissao = {
				"Administrador": 0,
				"Gerente": 1,
				"Editor" : 2,
				"Visualizador": 3
		};
		return tiposPermissao[nomeTipoPermissao];
	}
	
	this.pesquisarUsuariosComPermissao = function pesquisarUsuariosComPermissao(idMapa){
		connection.query(
			'SELECT p.idUsuario, u.nome, p.tipoPermissao' +
			' FROM permissoes p, usuarios u' +
			' WHERE p.idMapa = ? AND p.idUsuario = u.id', [idMapa], function(err, result) {
			
			if(err) {
				return {erro: err.code};
			}
			else { 
				
				var listaUsuarios;
				listaUsuarios = new Array();
				
				//converter os tipos de permisssao de numeros para palavras
				for(var i=0; i < result.length; i++){
					listaUsuarios[i] = {
							id: result[i].idUsuario,
							nome: result[i].nome,
							tipoPermissao: converterPermissao(result[i].tipoPermissao)
					};
				}
				
				gerenciadorBanco.eventEmitter.emit('fimPesquisaUsuariosPermissao', listaUsuarios);
			}
		});	
	};
	
	function alterarConfiguracoesMapa(idMapa, nomeMapa, listaUsuariosPermitidos, novasPermissoes){
		//novasPermissoes e uma lista de objetos com duas propriedades: idUsuario em int e tipoPermissao em string
		//listaUsuariosPermitidos e uma lista com id do usuario em int, nome do usuario e tipoPermissao do usuario em string
		
		var transacao;
		var estaNaLista;
		
		transacao = 
			"SET autocommit = 0;" +
			" START TRANSACTION;" +
			" UPDATE mapas SET nome='" + nomeMapa + "' WHERE id=" + idMapa + ";" +
			" UPDATE permissoes SET nomeMapa='" + nomeMapa + "' WHERE idMapa=" + idMapa + ";"
		;
		
		// Para cada membro da lista novasPermissoes, ou seja, das permissoes alteradas pelo usuario, verificar:
		// Se o usuario ja possuia permissao, verificar se foi alterado o tipo,
		// se o usuario nao possuia permissao, adicionar,
		// se o usuario esta na lista antiga, mas nao na nova, deleta-lo.
		 
		for(var i=0; i < novasPermissoes.length; i++){
			estaNaLista = false;
			
			for(var j=0; j< listaUsuariosPermitidos.length && !estaNaLista; j++){
				if(novasPermissoes[i].idUsuario == listaUsuariosPermitidos[j].id){
					estaNaLista = true;
					if(novasPermissoes[i].tipoPermissao != listaUsuariosPermitidos[j].tipoPermissao){ //so altera se diferente
						transacao += 
							" UPDATE permissoes SET tipoPermissao=" + 
							converterPermissaoParaNumero(novasPermissoes[i].tipoPermissao) +
							" WHERE idUsuario=" + novasPermissoes[i].idUsuario + 
							" AND idMapa=" + idMapa + ";"
						;
					}
					listaUsuariosPermitidos.splice(j,1);
				}
			}
			
			if(!estaNaLista){ //usuario completamente novo
				transacao += 
					" INSERT INTO permissoes SET idUsuario =" + novasPermissoes[i].idUsuario +
					", idMapa =" + idMapa +
					", nomeMapa ='" + nomeMapa + "'" +
					", tipoPermissao =" + converterPermissaoParaNumero(novasPermissoes[i].tipoPermissao) +
					";"
				;
			}
		}
		
		if(listaUsuariosPermitidos.length > 0){ //permissoes a serem deletadas
			for(var j=0; j < listaUsuariosPermitidos.length; j++){
				transacao += 
					" DELETE FROM permissoes WHERE idUsuario=" + listaUsuariosPermitidos[j].id +
					" AND idMapa=" + idMapa + ";"
				;
			}
		}
		
		
		//Aplicando a transacao
		connection.query(transacao, function(err, result) {
			if(err)
				gerenciadorBanco.eventEmitter.emit('fimAlterarConfiguracoesMapa', {erro: err.code});
			else
				gerenciadorBanco.eventEmitter.emit('fimAlterarConfiguracoesMapa', "Alteracoes realizadas com sucesso!");
		});	
		
	}
	
	
	this.configurarMapa = function configurarMapa(idMapa, nomeMapa, idUsuario, permissoes){
		//permissoes e uma lista de objetos com duas propriedades: idUsuario em int e tipoPermissao em string
		
		if(idMapa){ //se o usuario nao apagou o id do mapa na pagina configurarMapa.ejs
			idMapa = parseInt(idMapa);
			
			gerenciadorBanco.pesquisarUsuariosComPermissao(idMapa);
			gerenciadorBanco.eventEmitter.once('fimPesquisaUsuariosPermissao', function(resultado){ 
				
				if(resultado.erro){ //erro na busca dos usuarios com permissao
					gerenciadorBanco.eventEmitter.emit('fimConfigurarMapa', {erro: resultado.erro});
				}
				else{ //sucesso na busca dos usuarios com permissao
					
					var listaUsuariosPermitidos;
					listaUsuariosPermitidos = resultado;
					
					//necessario saber a permissao do usuario, pois so administrador e gerente podem mudar permissoes
					var i=0;
					while( i < listaUsuariosPermitidos.length && listaUsuariosPermitidos[i].id != idUsuario)
						i++;
					
					if( i<listaUsuariosPermitidos.length && (listaUsuariosPermitidos[i].tipoPermissao == "Gerente" || listaUsuariosPermitidos[i].tipoPermissao == "Administrador") ){
						alterarConfiguracoesMapa(idMapa, nomeMapa, listaUsuariosPermitidos, permissoes);
						gerenciadorBanco.eventEmitter.once('fimAlterarConfiguracoesMapa', function(resultado){ 
							if(resultado.erro){
								connection.query(" ROLLBACK");
								gerenciadorBanco.eventEmitter.emit('fimConfigurarMapa', {erro: "Alteracoes nao aplicadas, devido ao seguinte erro: " + resultado.erro}); 
							}
							else{
								connection.query(" COMMIT");
								gerenciadorBanco.eventEmitter.emit('fimConfigurarMapa', resultado);
							}
						});
						
					}
					else{ //ou nao esta na lista ou nao tem permissao de Adm ou gerente
						gerenciadorBanco.eventEmitter.emit('fimConfigurarMapa', {erro: "Voce nao tem permissao para configurar este mapa!"}); 
					}
				}
			});
		}
		else{ //usuario apagou id do mapa
			gerenciadorBanco.eventEmitter.emit('fimConfigurarMapa', {erro: "O id do mapa foi apagado!"}); 
		}
	};

}

module.exports = GerenciadorBanco;

function GerenciadorBanco(){
	
	function OperadorSql(conexao){
		var filaSql;
		var connection;
		
		filaSql = new Array();
		connection = conexao;
		
		function Instrucao(sql, callback){
			this.sql = sql;
			this.callback = callback;
		}
		
		this.addSql = function addSql(sql, callback){
			var pos; //posicao na fila
			
			if(sql.toUpperCase().indexOf("ROLLBACK") != -1 || sql.toUpperCase().indexOf("COMMIT") != -1){
				connection.query( sql, callback );
				filaSql.splice(0,1); //remove 1 elemento a partir da pos 0
				if(filaSql.length>0)
					executarSql(); //libera a execucao de instrucoes sql
			}
			else{
				var instrucao = new Instrucao(sql, callback);
				pos = filaSql.push(instrucao) - 1;
				if(pos == 0){ // soh ha um elemento na fila
					executarSql();
				}
			}
		};
		
		function executarSql(){
			console.log("executarSql()");
			if(filaSql[0].sql.toUpperCase().indexOf("TRANSACTION") != -1) //o primeiro eh transcao
				connection.query( filaSql[0].sql, filaSql[0].callback );
			
			else{ //o primeiro nao eh transacao
				connection.query( filaSql[0].sql, filaSql[0].callback );
				filaSql.splice(0,1); //remove 1 elemento a partir da pos 0
				if(filaSql.length>0)
					executarSql();
			}
		}
		
	}
	
	
	var events = require('events');
	var mysql = require('mysql');
	var connection;
	
	var operadorSql;
	
	var gerenciadorBanco = this;
	this.eventEmitter = new events.EventEmitter();
	
	//define o numero de listeners associados a um EventEmitter. Como cada busca pelo nome de grupos adiciona um listener, deixei ilimitado. 
	//this.eventEmitter.setMaxListeners(0);
	
	this.getNomeDeUsuario = function getNomeDeUsuario(idUsuario){
		var query;
		var callback;
		
		query = "SELECT usuario FROM usuarios WHERE id=" + connection.escape(idUsuario);
		callback = function (err, result){
			
			if(err || result.length == 0) {
				if(result.length == 0) gerenciadorBanco.eventEmitter.emit('nomeDeUsuario' + idUsuario, {erro: 'usuario inexistente'});
				else gerenciadorBanco.eventEmitter.emit('nomeDeUsuario' + idUsuario, {erro: err.code});
			}
			else
				gerenciadorBanco.eventEmitter.emit('nomeDeUsuario' + idUsuario, result[0].usuario);
		};
		operadorSql.addSql(query, callback);
	};
	
	this.conectarBD = function conectarBD(host, user, password, database){

		connection = mysql.createConnection({
			  host: host,
			  user: user,
			  password: password,
			  multipleStatements: true
		});
		
		connection.connect(function(err){
			if(err)	return gerenciadorBanco.eventEmitter.emit("fimConexaoBD", {erro: err});
		});
		
		connection.query("USE " + database, function(err, result){
			if(err){
				if(err.code == "ER_BAD_DB_ERROR"){
					connection.query("CREATE DATABASE " + database, function(err, result){
						if(err) return gerenciadorBanco.eventEmitter.emit("fimConexaoBD", {erro: err});
						else{
							connection.query("USE " + database, function(err, result){
								if(err) return gerenciadorBanco.eventEmitter.emit("fimConexaoBD", {erro: err});
								else{
									operadorSql = new OperadorSql(connection);
									return gerenciadorBanco.eventEmitter.emit("fimConexaoBD", 1);
								}
							});
						}
					});
				}
				else{
					return gerenciadorBanco.eventEmitter.emit("fimConexaoBD", {erro: err});
				}
			}
			else{
				operadorSql = new OperadorSql(connection);
				gerenciadorBanco.eventEmitter.emit("fimConexaoBD", 1);
			}
		});
		
	}
	
	this.getOperadorSql = function getOperadorSql(){
		return operadorSql;
	};
	
	this.getConexaoBD = function getConexaoBD(){
		return connection;
	};
	
	this.buscarTodosGrupos = function buscarTodosGrupos(idOperacao){
		var query;
		var callback;
		
		query = "SELECT id,nome FROM grupos";
		callback = function (err, result){
			var listaGrupos;
			listaGrupos = new Array();
			
			if(err) {
				gerenciadorBanco.eventEmitter.emit('fimBuscaTodosGrupos' + idOperacao, {erro: err.code});
			}
			else { 
				for(var i=0; i < result.length; i++){
					listaGrupos[i] = {
							id: result[i].id,
							nome: result[i].nome
					};
				}
				
				gerenciadorBanco.eventEmitter.emit('fimBuscaTodosGrupos' + idOperacao, listaGrupos);
			}
		}
		operadorSql.addSql(query, callback);
	};
	
	
	
	this.excluirGrupo = function excluirMapa (idGrupo){
		var query;
		var callback;
		
		query = "DELETE FROM grupos WHERE id = " + connection.escape(idGrupo);
		callback = function(err, result) {		
			if(err) {
				gerenciadorBanco.eventEmitter.emit('fimExclusaoGrupo' + idGrupo, {erro: err.code} );
			}
			else{
				gerenciadorBanco.eventEmitter.emit('fimExclusaoGrupo' + idGrupo, 1);
			}
		}
		operadorSql.addSql(query, callback);
	};
	
	
	this.pesquisarMapasGrupo = function pesquisarMapasGrupo(idGrupo, idOperacao){
		var idOperacaoLocal = 3;
		var listaMapas;
		var query;
		var callback;
		
		listaMapas = new Array();
		query = "SELECT idMapa FROM permissoes_edicao_grupos WHERE idGrupo = " + connection.escape(idGrupo);
		callback = function(err, result) {		
			if(err){
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasGrupo' + idGrupo + idOperacao, {erro: err.code}, idGrupo);
			}
			else{ 
				for(var i=0; i < result.length; i++){
					listaMapas[i] = new Object();
					listaMapas[i].idMapa = result[i].idMapa;
					pesquisarNomeMapa(listaMapas[i].idMapa, idOperacaoLocal);
					gerenciadorBanco.eventEmitter.once('fimPesquisaNomeMapa' + listaMapas[i].idMapa + idOperacaoLocal, function retornoNomeMapaPesquisado(nomeMapa, idMapa){ 
						var pos=0;
						while(pos < listaMapas.length && listaMapas[pos].idMapa!= idMapa)
							pos++;
						listaMapas[pos].nomeMapa = nomeMapa;
						
						// so vou emitir o termino de pesquisarMapas quando o nome do ultimo mapa tiver acabado de ser pesquisado.
						if(pos == result.length - 1)
							gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasGrupo' + idGrupo + idOperacao, listaMapas, idGrupo);
					});
				}
				
				if(result.length == 0) //se nao houver mapas
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasGrupo'+idGrupo + idOperacao, listaMapas, idGrupo);
			}
		};
		
		operadorSql.addSql(query, callback);
		
	};
	
	
	
	function TipoMembroGrupoParaNumero (nometipoMembro){
		var tiposMembro = {
				"Coordenador": 0,
				"Comum": 1
		};
		return tiposMembro[nometipoMembro];
	}
	
	
	function alterarConfiguracoesGrupo(idUsuario, idGrupo, nomeGrupo, listaMembrosAtuais, novosMembros){
		//novosMembros eh uma lista de objetos com duas propriedades: idUsuario em int e tipoMembro em string
		//listaMembrosAtuais eh uma lista com id do usuario em int, nome do usuario e tipoMembro em string
		
		var transacao;
		var estaNaLista;
		var callback;
		
		transacao = 
			" START TRANSACTION;" +
			" UPDATE grupos SET nome= " + connection.escape(nomeGrupo) + " WHERE id=" + connection.escape(idGrupo) + ";"
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
					" INSERT INTO membros SET idUsuario =" + connection.escape(novosMembros[i].idUsuario) +
					", idGrupo =" + connection.escape(idGrupo) +
					", tipoMembro =" + connection.escape( TipoMembroGrupoParaNumero(novosMembros[i].tipoMembro) ) +
					";"
				;
			}
		}
		
		if(listaMembrosAtuais.length > 0){ //membros a serem excluidos
			for(var j=0; j < listaMembrosAtuais.length; j++){
				transacao += 
					" DELETE FROM membros WHERE idUsuario=" + connection.escape(listaMembrosAtuais[j].id) +
					" AND idGrupo=" + connection.escape(idGrupo) + ";"
				;
			}
		}
		
		callback = function(err, result) {
			if(err){
				var erro = err;
				transacao = "ROLLBACK";
				callback = function(err, result) {
					gerenciadorBanco.eventEmitter.emit('fimAlterarConfiguracoesGrupo' + idUsuario + idGrupo, {erro: erro.code});
				};
				operadorSql.addSql(transacao, callback);
			}
			else{
				transacao = "COMMIT";
				callback = function(err, result) {
					gerenciadorBanco.eventEmitter.emit('fimAlterarConfiguracoesGrupo' + idUsuario + idGrupo, "Alterações realizadas com sucesso!");
				};
				operadorSql.addSql(transacao, callback);
			}
				
		};
		
		//Aplicando a transacao
		operadorSql.addSql(transacao, callback);
		
	}
	
	
	
	this.configurarGrupo = function configurarGrupo(idGrupo, nomeGrupo, idUsuario, novosMembros){
		var idOperacaoLocal = 10;
		//membros eh uma lista de objetos com duas propriedades: idUsuario em int e tipoMembro em string
		
		if(idGrupo){ //se o usuario nao apagou o id do grupo na pagina configurarGrupo.ejs
			idGrupo = parseInt(idGrupo);
			
			gerenciadorBanco.pesquisarMembrosGrupo(idGrupo, idOperacaoLocal);
			gerenciadorBanco.eventEmitter.once('fimPesquisaMembrosGrupo' + idGrupo + idOperacaoLocal, function(resultado){ 
				
				if(resultado.erro){ //erro na busca dos atuais membros
					gerenciadorBanco.eventEmitter.emit('fimConfigurarGrupo' + idUsuario + idGrupo, {erro: resultado.erro});
				}
				else{ //sucesso na busca dos atuais membros
					
					var listaMembrosAtuais;
					listaMembrosAtuais = resultado;
					
					//necessario saber o tipo do membro, pois so o coordenador pode alterar as configuracoes do grupo
					var i=0;
					while( i < listaMembrosAtuais.length && listaMembrosAtuais[i].id != idUsuario)
						i++;
					
					if( i<listaMembrosAtuais.length && listaMembrosAtuais[i].tipoMembro == "Coordenador" ){
						alterarConfiguracoesGrupo(idUsuario, idGrupo, nomeGrupo, listaMembrosAtuais, novosMembros);
						gerenciadorBanco.eventEmitter.once('fimAlterarConfiguracoesGrupo' + idUsuario + idGrupo, function(resultado){ 
							if(resultado.erro)
								gerenciadorBanco.eventEmitter.emit('fimConfigurarGrupo' + idUsuario + idGrupo, {erro: "Alterações não aplicadas, devido ao seguinte erro: " + resultado.erro}); 
							else
								gerenciadorBanco.eventEmitter.emit('fimConfigurarGrupo' + idUsuario + idGrupo, listaMembrosAtuais);
						});
						
					}
					else{ //ou nao esta na lista ou nao tem permissao de Adm ou gerente
						gerenciadorBanco.eventEmitter.emit('fimConfigurarGrupo' + idUsuario + idGrupo, {erro: "Você não é o coordenador para configurar este grupo!"}); 
					}
				}
			});
		}
		else{ //usuario apagou id do mapa
			gerenciadorBanco.eventEmitter.emit('fimConfigurarGrupo' + idUsuario + idGrupo, {erro: "O id do grupo foi apagado!"}); 
		}
	};
	
	
	
	
	this.verificarTipoUsuario = function verificarTipoUsuario(idUsuario, idOperacao){
		var query;
		var callback;
		
		query = "SELECT tipo FROM usuarios WHERE id = " + connection.escape(idUsuario);
		callback = function(err, result) {		
			if(err){
				gerenciadorBanco.eventEmitter.emit('fimVerificarTipoUsuario' + idUsuario + idOperacao, {erro: err.code});
			}
			else{
				if(result.length == 0){
					gerenciadorBanco.eventEmitter.emit('fimVerificarTipoUsuario' + idUsuario + idOperacao, {erro: "usuario inexistente"});
				}
				else
					gerenciadorBanco.eventEmitter.emit('fimVerificarTipoUsuario' + idUsuario + idOperacao, result[0].tipo);
			}
		};
		
		operadorSql.addSql(query, callback);
		
	};
	
	
	
	function adicionarMembros(idGrupo, membros, idGrupoNovo){
		var query;
		var callback;
		var membrosRestantes;
		
		membrosRestantes = new Array();
		
		for(var i=0; i < membros.length; i++){
			membrosRestantes.push(i);
		}
		
		for(var k=0; k < membros.length; k++){
			query = 
				"INSERT INTO membros SET idUsuario = " + connection.escape(membros[k].idUsuario) + 
				", idGrupo = " + connection.escape(idGrupo) + 
				", tipoMembro = " + connection.escape( TipoMembroGrupoParaNumero(membros[k].tipoMembro) )
			;
			callback = function(err, result) {		
				if(err) {
					//fazer algum tratamento
					membrosRestantes.pop();
					if(membrosRestantes.length == 0){
						gerenciadorBanco.eventEmitter.emit('membrosAdicionados' + idGrupoNovo);
					}
				}
				else{
					membrosRestantes.pop();
					if(membrosRestantes.length == 0){
						gerenciadorBanco.eventEmitter.emit('membrosAdicionados' + idGrupoNovo);
					}
				}
			};
			
			operadorSql.addSql(query, callback);
		}	
		
	}
	
	this.inserirNovoGrupo = function (nomeGrupo, membros, idEvento){
		var idGrupoNovo;
		var query;
		var callback;
		
		query = "INSERT INTO grupos SET nome = " + connection.escape(nomeGrupo);
		callback = function(err, result) {		
			if(err) {
				gerenciadorBanco.eventEmitter.emit('grupoCriado' + idEvento, {erro: err.code});
			}
			else { 
				idGrupoNovo = result.insertId;
				adicionarMembros(idGrupoNovo, membros, idGrupoNovo);
				gerenciadorBanco.eventEmitter.once('membrosAdicionados' + idGrupoNovo, function(){ 
					gerenciadorBanco.eventEmitter.emit('grupoCriado' + idEvento, result.insertId);
				});
			}
		};
		
		operadorSql.addSql(query, callback);
	};
	
	function pesquisarNomeGrupo(idGrupo, indice, idOperacao){
		var query;
		var callback;
		
		query = "SELECT nome FROM grupos WHERE id = " + connection.escape(idGrupo);
		callback = function(err, result){		
			if(err){
				gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeGrupo' + indice + idGrupo + idOperacao, {erro: err.code}, indice);
			}
			else{
				if(result.length == 0){
					gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeGrupo' + indice + idGrupo + idOperacao, {erro: "nome inexistente"}, indice);
				}
				else
					gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeGrupo' + indice + idGrupo + idOperacao, result[0].nome, indice);
			}
		};
		
		operadorSql.addSql(query, callback);
		
	}
	
	this.buscarNomeGrupo = function buscarNomeGrupo(idGrupo){
		var idOperacaoLocal = 8;
		pesquisarNomeGrupo(idGrupo, "", idOperacaoLocal);
		gerenciadorBanco.eventEmitter.once('fimPesquisaNomeGrupo' + idGrupo + idOperacaoLocal, function(nomeGrupo){ 
			gerenciadorBanco.eventEmitter.emit('fimBuscaNomeGrupo' + idGrupo, nomeGrupo);
		});
	};
	
	function converterTipoMembro(numTipoMembro){
		var tiposMembro = {
				0: "Coordenador",
				1: "Comum"
		};
		return tiposMembro[numTipoMembro];
	}
	
	
	this.pesquisarMembrosGrupo = function pesquisarMembrosGrupo(idGrupo, idOperacao){
		var query;
		var callback;
		
		query = 
			"SELECT m.idUsuario, u.nome, m.tipoMembro" +
			" FROM membros m, usuarios u" +
			" WHERE m.idGrupo = " + connection.escape(idGrupo) +
			" AND m.idUsuario = u.id"
		;
		callback = function(err, result){
			
			if(err)
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMembrosGrupo' + idGrupo + idOperacao, {erro: err.code});
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
				
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMembrosGrupo' + idGrupo + idOperacao, listaMembros);
			}
		};
		
		operadorSql.addSql(query, callback);
		
	};
	
	
	this.obterGrupos = function obterGrupos(idUsuario, idOperacao){
		var idOperacaoLocal = 9;
		var listaGrupos;
		var listaGruposCoordenados;
		var query;
		var callback;
		
		listaGrupos = new Array();
		listaGruposCoordenados = new Array();
		query = "SELECT idGrupo,tipoMembro FROM membros WHERE idUsuario = " + connection.escape(idUsuario);
		callback = function(err, result) {		
			if(err) {
				if(err.code == 'ER_NO_SUCH_TABLE'){
					query = 
						'CREATE TABLE grupos('+
							'id INT NOT NULL AUTO_INCREMENT,'+ 
							'nome VARCHAR(30) NOT NULL,'+
							'PRIMARY KEY (id)'+
						') ENGINE=InnoDB;'
						+
						'CREATE TABLE membros(' +
							'idUsuario INT NOT NULL,'+
							'idGrupo INT NOT NULL,'+ 
							'tipoMembro INT NOT NULL,'+
							'FOREIGN KEY (idUsuario) REFERENCES usuarios (id)'+
							' ON DELETE CASCADE,'+
							' FOREIGN KEY (idGrupo) REFERENCES grupos (id)'+
							' ON DELETE CASCADE,'+
							'PRIMARY KEY (idUsuario,idGrupo)'+
						') ENGINE=InnoDB;'
						+
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
					;
					callback = function (err,result){
						if(err)
							gerenciadorBanco.eventEmitter.emit('fimObterGrupos' + idUsuario + idOperacao, {erro: err.code}, null);
						else
							gerenciadorBanco.eventEmitter.emit('fimObterGrupos' + idUsuario + idOperacao, listaGrupos, listaGruposCoordenados);
					};
					
					operadorSql.addSql(query, callback);
					
				}
				else{
					gerenciadorBanco.eventEmitter.emit('fimObterGrupos' + idUsuario + idOperacao, {erro: err.code}, null);
				}
			}
			else{ 
				for(var i=0; i < result.length; i++){
					
					if(parseInt(result[i].tipoMembro) == 0){ //eh coordenador
						
						pesquisarNomeGrupo( parseInt(result[i].idGrupo), i , idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimPesquisaNomeGrupo' + i + parseInt(result[i].idGrupo) + idOperacaoLocal, function retornoNomeGrupoPesquisado(nomeGrupo, indice){ //indice eh a posicao do grupo dentro do result
							
							listaGruposCoordenados.push(
								{
									idGrupo: parseInt( result[indice].idGrupo ),
									nomeGrupo: nomeGrupo
								}
							);
							
							// so vou emitir o termino de obterGrupos quando o nome do ultimo grupo tiver acabado de ser pesquisado.
							if(indice == result.length - 1)
								gerenciadorBanco.eventEmitter.emit('fimObterGrupos' + idUsuario + idOperacao, listaGrupos, listaGruposCoordenados);
						});
						
					}
					else{ //eh usuario comum
						
						pesquisarNomeGrupo( parseInt(result[i].idGrupo), i, idOperacaoLocal);
						gerenciadorBanco.eventEmitter.once('fimPesquisaNomeGrupo' + i + parseInt(result[i].idGrupo) + idOperacaoLocal, function retornoNomeGrupoPesquisado(nomeGrupo, indice){ 
							
							listaGrupos.push(
								{
									idGrupo: parseInt( result[indice].idGrupo ),
									nomeGrupo: nomeGrupo
								}
							);
							
							// so vou emitir o termino de obterGrupos quando o nome do ultimo grupo tiver acabado de ser pesquisado.
							if(indice == result.length - 1)
								gerenciadorBanco.eventEmitter.emit('fimObterGrupos' + idUsuario + idOperacao, listaGrupos, listaGruposCoordenados);
						});
						
					}
					
				}
				
				if(result.length == 0){ //se resultado da pesquisa vazia
					gerenciadorBanco.eventEmitter.emit('fimObterGrupos' + idUsuario + idOperacao, listaGrupos, listaGruposCoordenados);
				}
				
			}
		};
		
		operadorSql.addSql(query, callback);
		
	};
	
	
	/*
	 * Cadastra usuario comum com tipo 1 e coordenador com tipo 1.
	 */
	
	this.cadastrarUsuario = function cadastrarUsuario(usuario, password, nome, email, tipo, idEvento){ 
		var query;
		var callback;
		
		query = 
			"INSERT INTO usuarios SET usuario = "+ connection.escape(usuario) +
			", password = "+ connection.escape(password) +
			", nome = "+ connection.escape(nome) +
			", email = "+ connection.escape(email) +
			", tipo = " + connection.escape(tipo)
		;
		callback = function(err, result) {
			if(err){
				if(err.code == 'ER_NO_SUCH_TABLE'){
					query = 
						"CREATE TABLE usuarios(" + 
							" id INT NOT NULL AUTO_INCREMENT," +
							" usuario VARCHAR(30),"+
							" password VARCHAR(7),"+
							" nome VARCHAR(100),"+
							" email VARCHAR(100),"+
							" tipo INT NOT NULL,"+
							" PRIMARY KEY (id)"+
						") ENGINE=InnoDB"
					;
					callback = function(err, result){
						if(err)
							gerenciadorBanco.eventEmitter.emit('fimCadastroUsuario' + idEvento, err.code);
						else{
							query = 
								"INSERT INTO usuarios SET usuario = "+ connection.escape(usuario) +
								", password = "+ connection.escape(password) +
								", nome = "+ connection.escape(nome) +
								", email = "+ connection.escape(email) +
								", tipo = " + connection.escape(tipo)
							;
							callback = function(err, result) {
								if(err)
									gerenciadorBanco.eventEmitter.emit('fimCadastroUsuario' + idEvento, err.code);
								else
									gerenciadorBanco.eventEmitter.emit('fimCadastroUsuario' + idEvento, 1);
							};
							
							operadorSql.addSql(query, callback);
						}
							
					};
					
					operadorSql.addSql(query, callback);
					
				}
				else
					gerenciadorBanco.eventEmitter.emit('fimCadastroUsuario' + idEvento, err.code);
			}
			else gerenciadorBanco.eventEmitter.emit('fimCadastroUsuario' + idEvento, 1);
		};
		
		operadorSql.addSql(query, callback);
		
	};
	
	
	this.pesquisarMapasDoCoordenador = function pesquisarMapasDoCoordenador(idUsuario){
		var query;
		var callback;
		var mapas;
		
		mapas = new Array();
		query = "SELECT id,nome FROM mapas WHERE idCoordenador = " + connection.escape(idUsuario);
		callback = function(err, result) {		
			if(err){
				if(err.code == 'ER_NO_SUCH_TABLE'){
					query = 
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
					;
					callback = function(err, result) {
						if(err)
							gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoCoordenador' + idUsuario, {erro: err.code});
						else
							gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoCoordenador' + idUsuario, mapas);
					};
					
					operadorSql.addSql(query, callback);
					
				}
				else
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoCoordenador' + idUsuario, {erro: err.code});
			}
			
			else { 
				for(var i=0; i < result.length; i++){
					mapas[i] = new Object();
					mapas[i].idMapa = result[i].id;
					mapas[i].nomeMapa = result[i].nome;
				}
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoCoordenador' + idUsuario, mapas);
			}
		};
		
		operadorSql.addSql(query, callback);
		
	};
	
	
	this.pesquisarMapasDoGerente = function pesquisarMapasDoGerente(idUsuario){
		var query;
		var callback;
		var mapas;
		
		mapas = new Array();
		query = "SELECT id,nome FROM mapas WHERE idProprietario = " + connection.escape(idUsuario);
		callback = function(err, result) {		
			if(err)
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoGerente' + idUsuario, {erro: err.code});
			
			else{ 
				for(var i=0; i < result.length; i++){
					mapas[i] = new Object();
					mapas[i].idMapa = result[i].id;
					mapas[i].nomeMapa = result[i].nome;
				}
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoGerente' + idUsuario, mapas);
			}
		};
		
		operadorSql.addSql(query, callback);
		
	};
	
	this.perquisarMapasDoEditorOuVisualizador = function perquisarMapasDoEditorOuVisualizador(idUsuario){
		var idOperacaoLocal = 4;
		var query;
		var callback;
		var mapas;
		
		mapas = new Array();
		query = "SELECT idMapa FROM permissoes_edicao_usuarios WHERE idUsuario = " + connection.escape(idUsuario);
		callback =  function(err, result) {		
			if(err) {
				if(err.code == 'ER_NO_SUCH_TABLE'){
					query = 
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
					;
					callback = function (err, result){
						if(err)
							gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoEditorOuVisualizador' + idUsuario, {erro:err.code});
						else
							gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoEditorOuVisualizador' + idUsuario, mapas);
					};
					
					operadorSql.addSql(query, callback);
					
				}
				else{
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoEditorOuVisualizador' + idUsuario, {erro:err.code});
				}
			}
			else { 
				for(var i=0; i < result.length; i++){
					mapas[i] = new Object();
					mapas[i].idMapa = result[i].idMapa;
					
					pesquisarNomeMapa(mapas[i].idMapa, idOperacaoLocal);
					
					gerenciadorBanco.eventEmitter.once('fimPesquisaNomeMapa' + mapas[i].idMapa + idOperacaoLocal, function retornoNomeMapaPesquisado(nomeMapa, idMapa){ 
						var pos=0;
						while(pos < mapas.length && mapas[pos].idMapa!= idMapa)
							pos++;
						mapas[pos].nomeMapa = nomeMapa;
						
						// so vou emitir o termino de pesquisarMapas quando o nome do ultimo mapa tiver acabado de ser pesquisado.
						if(pos == result.length - 1)
							gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoEditorOuVisualizador' + idUsuario, mapas);
					});
				}
				
				if(result.length == 0) //se nao houver mapas
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDoEditorOuVisualizador' + idUsuario, mapas);
			}
		};
		
		operadorSql.addSql(query, callback);
		
	};
	
	
	function pesquisarNomeMapa(idMapa, idOperacao){
		var query;
		var callback;
		
		query = "SELECT nome FROM mapas WHERE id = " + connection.escape(idMapa);
		callback = function(err, result) {		
			if(err)
				gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeMapa' + idMapa + idOperacao, {erro: err.code}, idMapa);
			else{
				if(result.length == 0){
					gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeMapa' + idMapa + idOperacao, {erro: "mapa inexistente"}, idMapa);
				}
				else
					gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeMapa' + idMapa + idOperacao, result[0].nome, idMapa);
			}
		};

		operadorSql.addSql(query, callback);
		
	}
	
	this.buscarNomeMapa = function buscarNomeMapa(idMapa){
		var idOperacaoLocal = 5;
		pesquisarNomeMapa(idMapa, idOperacaoLocal);
		gerenciadorBanco.eventEmitter.once('fimPesquisaNomeMapa' + idMapa + idOperacaoLocal, function(nomeMapa){ 
			gerenciadorBanco.eventEmitter.emit('fimBuscaNomeMapa' + idMapa, nomeMapa);
		});
	};
	
	
	
	this.excluirMapa = function excluirMapa (idMapa){
		var query;
		var callback;
		
		query = "DELETE FROM mapas WHERE id = " + connection.escape(idMapa);
		callback = function(err, result) {		
			if(err) {
				gerenciadorBanco.eventEmitter.emit('fimExclusaoMapa' + idMapa, err.code);
			}
			else{
				gerenciadorBanco.eventEmitter.emit('fimExclusaoMapa' + idMapa, 1);
			}
		};
		operadorSql.addSql(query, callback);
		
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
	
	this.pesquisarMapasVariosGrupos = function pesquisarMapasVariosGrupos(listaGrupos, idUsuario, tipoGrupo){
		var idOperacaoLocal = 0;
		if(listaGrupos.length > 0){ //lista nao vazia
			for(var i=0; i < listaGrupos.length; i++){
				gerenciadorBanco.pesquisarMapasGrupo(listaGrupos[i].idGrupo, idOperacaoLocal);
				gerenciadorBanco.eventEmitter.once("fimPesquisaMapasGrupo" + listaGrupos[i].idGrupo + idOperacaoLocal, function (listaMapasDoGrupo, idGrupo){
					
					var posicao = 0; //posicao do grupo na listaGrupos
					while(idGrupo != listaGrupos[posicao].idGrupo)
						posicao++;
					
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasVariosGrupo' + posicao + idUsuario + tipoGrupo, listaMapasDoGrupo, posicao);
					
				});
			}
		}
		else{ //lista vazia
			gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasVariosGrupo' + 0 + idUsuario + tipoGrupo, new Array(), -1);
		}
		
	};
	
	
	this.pesquisarMapas = function pesquisarMapas(idUsuario, idOperacao){
		var idOperacaoLocal = 6;		
		var listaMapasCoordenador;       //lista dos mapas em que o usuario eh coordenador
		var listaMapasGerente;           //lista dos mapas em que o usuario eh gerente ou coordenador
		var listaMapasEditor;            //lista dos mapas em que o usuario eh editor ou visualizador
		var listaMapasGruposCoordenados; //lista dos mapas aos quais os grupos coordenados pelo usuario tem acesso
		var listaMapasGrupos;            //lista dos mapas aos quais os grupos dos quais o usuario faz parte tem acesso
		var listaMapas;                  //lista de todos os mapas que o usuario tem acesso - jah sem redundancias
		
			
		//pesquisar mapas que o user eh coordenador
		
		gerenciadorBanco.pesquisarMapasDoCoordenador(idUsuario);
		gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDoCoordenador' + idUsuario, function(resultado){ 
			if(resultado.erro){
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas' + idUsuario + idOperacao, {erro: resultado.erro});
			}
			else{ //sucesso pesquisa mapas que o user eh coordenador
				
				listaMapasCoordenador = resultado;
				listaMapas = listaMapasCoordenador;

				
				//pesquisar mapas que o user eh gerente
				gerenciadorBanco.pesquisarMapasDoGerente(idUsuario);
				gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDoGerente' + idUsuario, function(resultado){
					if(resultado.erro){
						gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas' + idUsuario + idOperacao, {erro: resultado.erro});
					}
					else{ //sucesso pesquisa mapas que o user eh gerente
						
						listaMapasGerente = resultado;
						listaMapas = adicionarNaoRedundantes(listaMapasGerente, listaMapas);
						
						//pesquisar mapas que o user eh ou editor ou visualizador
						gerenciadorBanco.perquisarMapasDoEditorOuVisualizador(idUsuario);
						gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDoEditorOuVisualizador' + idUsuario, function(resultado){ 
							if(resultado.erro){
								gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas' + idUsuario + idOperacao, {erro: resultado.erro});
							}
							else{ // sucesso pesquisa  mapas que o user eh ou editor ou visualizador
								listaMapasEditor = resultado;
								listaMapas = adicionarNaoRedundantes(listaMapasEditor, listaMapas);
								
								//pesquisar os grupos do user
								
								gerenciadorBanco.obterGrupos(idUsuario, idOperacaoLocal);
								gerenciadorBanco.eventEmitter.once('fimObterGrupos' + idUsuario + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){
									if(listaGrupos.erro){
										gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas' + idUsuario + idOperacao, {erro: listaGrupos.erro});
									}
									else{ // sucesso na pesquisa dos grupos do user
										
										listaMapasGruposCoordenados = new Array();
										listaMapasGrupos = new Array();
										var tipoGrupo = 0; // grupos coordenados
										var h = 0;
										do{
											gerenciadorBanco.eventEmitter.once('fimPesquisaMapasVariosGrupo' + h + idUsuario + tipoGrupo, function(listaMapasGrupoCoordenado, posicao){ //posicao eh a posicao do grupo na listaGruposCoordenados
												listaMapasGruposCoordenados =  adicionarNaoRedundantes(listaMapasGrupoCoordenado, listaMapasGruposCoordenados);
												
												if(posicao == listaGruposCoordenados.length - 1){//ultimo mapa ou listaGruposCoord vazia
													gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDosGruposCoordenados' + idUsuario, listaMapasGruposCoordenados);
												}
												
											});
											
											h++;
											
										} while( h < listaGruposCoordenados.length );
										
										
										
										//quando os mapas de todos os grupos coordenados tiverem sido obtidos, comeca-se a pesquisa pelos mapas dos grupos em que o user eh membro
										gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDosGruposCoordenados' + idUsuario, function(listaMapasGruposCoordenados){
											
											listaMapas = adicionarNaoRedundantes(listaMapasGruposCoordenados, listaMapas);
											tipoGrupo = 1; // grupo comum
											var h = 0;
											do{
												gerenciadorBanco.eventEmitter.once('fimPesquisaMapasVariosGrupo' + h + idUsuario + tipoGrupo, function(listaMapasGrupo, posicao){ //posicao eh a posicao do grupo na listaGrupos
													listaMapasGrupos =  adicionarNaoRedundantes(listaMapasGrupo, listaMapasGrupos);
													
													if(posicao == listaGrupos.length - 1){//ultimo mapa ou listaGrupos vazia
														gerenciadorBanco.eventEmitter.emit('fimPesquisaMapasDosGrupos' + idUsuario, listaMapasGrupos);
													}
													
												});
												
												h++;
												
											} while( h < listaGrupos.length );
											gerenciadorBanco.pesquisarMapasVariosGrupos(listaGrupos,idUsuario,tipoGrupo);
											
										});
										
										//quando os mapas de todos os grupos tiverem sido obtidos, finda-se a pesquisaMapas
										gerenciadorBanco.eventEmitter.once('fimPesquisaMapasDosGrupos' + idUsuario, function(listaMapasGrupos){
											
											listaMapas = adicionarNaoRedundantes(listaMapasGrupos, listaMapas);
											gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas' + idUsuario + idOperacao, listaMapas);
													
										});
										
										gerenciadorBanco.pesquisarMapasVariosGrupos(listaGruposCoordenados, idUsuario, tipoGrupo);
										
										
									} //FIM ELSE -- sucesso na pesquisa dos grupos do user
									
								}); //FIM EVENTO -- fimObterGrupos do user
								
							} //FIM ELSE -- sucesso pesquisa mapas que o user eh ou editor ou visualizador
							
						}); //FIM EVENTO -- fimPesquisaMapasDoEditorOuVisualizador
						
					} //FIM ELSE -- sucesso pesquisa mapas que o user eh gerente
					
				}); //FIM EVENTO -- fimPesquisaMapasDoGerente
				
			} // FIM ELSE -- sucesso pesquisa mapas que o user eh coordenador
			
		}); //FIM EVENTO -- fimPesquisaMapasDoCoordenador
		
	};
	
	
	function montarTransacaoAdicaoPermissoes(idMapa, permissoesGrupos, permissoesUsuarios){
		var tiposPermissao = {
			"Gerente": 1,
			"Editor": 2,
			"Visualizador": 3
		};
		var transacao = "START TRANSACTION;";
		
		for(var i=0; i < permissoesUsuarios.length; i++){
			transacao += 
				"INSERT INTO permissoes_edicao_usuarios " +
				"SET idUsuario=" + connection.escape(permissoesUsuarios[i].idUsuario) + 
				", idMapa=" + connection.escape(idMapa) + 
				", tipoPermissao=" + connection.escape(tiposPermissao[permissoesUsuarios[i].tipoPermissao]) + ";"
			;
		}
		
		for(var i=0; i < permissoesGrupos.length; i++){
			transacao += 
				"INSERT INTO permissoes_edicao_grupos " +
				"SET idGrupo=" + connection.escape(permissoesGrupos[i].idGrupo) + 
				", idMapa=" + connection.escape(idMapa) + 
				", tipoPermissao=" + connection.escape(tiposPermissao[permissoesGrupos[i].tipoPermissao]) + ";"
			;
		}
		
		return transacao;
	}

	
	this.inserirNovoMapa = function (nomeMapa, idCoordenador, idProprietario, permissoesGrupos, permissoesUsuarios, idEvento){
		var idMapaNovo;
		var transacao;
		var callback;
		
		transacao = 
			"INSERT INTO mapas SET nome = " + connection.escape(nomeMapa)+ 
			", idProprietario = " + connection.escape(idProprietario) + 
			", idCoordenador = " + connection.escape(idCoordenador)
		;
		callback = function(err, result) {		
			if(err)
				gerenciadorBanco.eventEmitter.emit('mapaCriado' + idEvento, {erro: err.code, tipoErro: 1});
			else{ 
				
				idMapaNovo = result.insertId;
				if(permissoesUsuarios.length > 0 || permissoesGrupos.length > 0) {//proibe mapas com permissao apenas ao gerente e coordenador
					transacao = montarTransacaoAdicaoPermissoes(idMapaNovo, permissoesGrupos, permissoesUsuarios);
					callback = function(err, result) {	
						if(err){
							var erro = err;
							transacao = "ROLLBACK";
							callback = function(err, result){
								gerenciadorBanco.eventEmitter.emit('mapaCriado' + idEvento, {erro: erro.code, tipoErro: 2});
							};
							operadorSql.addSql(transacao, callback);
						}
						else{
							transacao = "COMMIT";
							callback = function(err, result){
								gerenciadorBanco.eventEmitter.emit('mapaCriado' + idEvento, idMapaNovo);
							};
							operadorSql.addSql(transacao, callback);
						}
					};
					operadorSql.addSql(transacao, callback);
				}
				else//mapas com permissao apenas ao gerente e ao coordenador
					gerenciadorBanco.eventEmitter.emit('mapaCriado'+idEvento, idMapaNovo);
			}
		};
		
		operadorSql.addSql(transacao, callback);
		
	};
	
	
	this.buscarTodosUsuarios = function(idOperacao){
		var query;
		var callback;
		
		query = "SELECT id,nome,tipo FROM usuarios";
		callback = function(err, result) {
			var listaUsuarios;
			listaUsuarios = new Array();
			
			if(err)
				gerenciadorBanco.eventEmitter.emit('fimBuscaTodosUsuarios' + idOperacao, {erro: err.code});
			else{
				for(var i=0; i < result.length; i++){
					listaUsuarios[i] = {
							id: result[i].id,
							nome: result[i].nome,
							tipo: result[i].tipo
					};
				}
				
				gerenciadorBanco.eventEmitter.emit('fimBuscaTodosUsuarios' + idOperacao, listaUsuarios);
			}
		};
		operadorSql.addSql(query, callback);
	};
	
	this.verificarTipoPermissao = function(idUsuario, idMapa, idOperacao){
		var idOperacaoLocal = 7;
		var query;
		var callback;
		
		//verificar primeiro se eh coord ou gerente do mapa
		query = "SELECT idProprietario, idCoordenador FROM mapas WHERE id = " + connection.escape(idMapa);
		callback = function(err, result) {
			
			if(err)
				gerenciadorBanco.eventEmitter.emit('tipoPermissao' + idUsuario + idMapa + idOperacao, {erro: err.code});
			else{ 
				if(result.length == 0){
					gerenciadorBanco.eventEmitter.emit('tipoPermissao' + idUsuario + idMapa + idOperacao, -1); //nao tem permissao
				}
				else{
					if(result[0].idProprietario == idUsuario || result[0].idCoordenador == idUsuario){ //eh coord ou gerente
						if(result[0].idProprietario == idUsuario){
							
							if(result[0].idCoordenador == idUsuario)//caso do coord proprietario, necessario retornar que eh coord
								gerenciadorBanco.eventEmitter.emit('tipoPermissao' + idUsuario + idMapa + idOperacao, 0); //o tipoPermissao de coord eh 0
							else
								gerenciadorBanco.eventEmitter.emit('tipoPermissao' + idUsuario + idMapa + idOperacao, 1); //o tipoPermissao de gerente eh 1
							
						}
						else{
							gerenciadorBanco.eventEmitter.emit('tipoPermissao' + idUsuario + idMapa + idOperacao, 0); //o tipoPermissao de coord eh 0
						}
					}
					else{ //nao eh coord nem gerente
						
						//verificar se o user tem permissao individual sobre o mapa
						
						query = "SELECT tipoPermissao FROM permissoes_edicao_usuarios WHERE idUsuario = " + connection.escape(idUsuario) + " AND idMapa = " + connection.escape(idMapa);
						callback = function(err, result) {
							if(err)
								gerenciadorBanco.eventEmitter.emit('tipoPermissao' + idUsuario + idMapa + idOperacao, {erro: err.code});
							else{
								
								//user tem permissao individual
								if(result.length > 0) 
									gerenciadorBanco.eventEmitter.emit('tipoPermissao' + idUsuario + idMapa + idOperacao, result[0].tipoPermissao); 
								
								//user nao tem permissao individual
								else{ 
									
									//necessario verificar os grupos aos quais o user pertence ou coordena
									gerenciadorBanco.obterGrupos(idUsuario,idOperacaoLocal);
									gerenciadorBanco.eventEmitter.once('fimObterGrupos' + idUsuario + idOperacaoLocal, function(listaGrupos, listaGruposCoordenados){
										
										//erro na pesquisa dos grupos
										if(listaGrupos.erro)
											gerenciadorBanco.eventEmitter.emit('tipoPermissao' + idUsuario + idMapa + idOperacao, {erro: listaGrupos.erro});
										
										// sucesso na pesquisa dos grupos do user
										else{ 
											
											listaGrupos = listaGrupos.concat(listaGruposCoordenados);
											
											//user nao eh membro de nenhum grupo nem coordena
											if(listaGrupos.length == 0) 
												gerenciadorBanco.eventEmitter.emit('tipoPermissao' + idUsuario + idMapa + idOperacao, -1); //nao tem permissao
											
											//user eh membro de algum grupo ou coordena algum
											else{
												
												//buscar os grupos que possuem acesso ao mapa e suas permissoes
												query = "SELECT idGrupo, tipoPermissao FROM permissoes_edicao_grupos WHERE idMapa = " + connection.escape(idMapa);
												callback = function(err, result){ 
													if(err)
														gerenciadorBanco.eventEmitter.emit('tipoPermissao' + idUsuario + idMapa + idOperacao, {erro: err.code});
													
													else{
														
														 var achou = false;
														 var tipoPermissao = -1;
														 
														 for(var i=0; i < result.length && tipoPermissao != 2; i++){ // editor eh o tipo maior de permissao para um grupo
															for(var j=0; j < listaGrupos.length && tipoPermissao != 2; j++){
																if(result[i].idGrupo == listaGrupos[j].idGrupo){
																	if(tipoPermissao == -1 || tipoPermissao > 2) //se user ainda nao tinha permissao ou a permissao de um de seus grupos era menos abrangente do que a de editor
																		tipoPermissao = result[i].tipoPermissao;
																	achou = true;
																}
															}
														 }
														 
														 if(achou) gerenciadorBanco.eventEmitter.emit('tipoPermissao' + idUsuario + idMapa + idOperacao, tipoPermissao);
														 else gerenciadorBanco.eventEmitter.emit('tipoPermissao' + idUsuario + idMapa + idOperacao, -1); //nao tem permissao
													}
												};
												
												operadorSql.addSql(query, callback);
											}

										}
									});
									
								}
							}
						};
						
						operadorSql.addSql(query, callback);
						
					}
				}
				
			}
			
		};
		
		operadorSql.addSql(query, callback);
		
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
	
	function pesquisarNomeUsuario(idUsuario){
		var query;
		var callback;
		
		query = "SELECT nome FROM usuarios WHERE id = " + connection.escape(idUsuario);
		callback = function(err, result) {
			if(err)
				gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeUsuario' + idUsuario, {erro: err.code});
			else{
				if(result.length == 0){
					gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeUsuario' + idUsuario, {erro: "usuario inexistente"});
				}
				else
					gerenciadorBanco.eventEmitter.emit('fimPesquisaNomeUsuario' + idUsuario, result[0].nome);
			}
		};
		operadorSql.addSql(query, callback);
	}
	
	function pesquisarCoordenadorEGerenteDoMapa(idMapa){
		var query;
		var callback;
		
		query = "SELECT idProprietario, idCoordenador FROM mapas WHERE id = " + connection.escape(idMapa);
		callback = function(err, result) {
			if(err || result.length == 0){
				if(err)
					gerenciadorBanco.eventEmitter.emit('fimPesquisaCoordenadorEGerenteDoMapa' + idMapa, {erro: err.code});
				else
					gerenciadorBanco.eventEmitter.emit('fimPesquisaCoordenadorEGerenteDoMapa' + idMapa, {erro: "Gerente ou coordenador não encontrados"});
			}
				
			else{ 
				
				var gerente, coordenador;
				gerente = new Object();
				coordenador = new Object();
				
				gerente.id = result[0].idProprietario;
				gerente.tipoPermissao = "Gerente";
				coordenador.id = result[0].idCoordenador;
				coordenador.tipoPermissao = "Coordenador";
				
				pesquisarNomeUsuario(gerente.id);
				gerenciadorBanco.eventEmitter.once("fimPesquisaNomeUsuario" + gerente.id, function fimBuscaNomeGerente(nomeGerente){
					if( !(nomeGerente.erro) )
						gerente.nome = nomeGerente;
					
					pesquisarNomeUsuario(coordenador.id);
					gerenciadorBanco.eventEmitter.once("fimPesquisaNomeUsuario" + coordenador.id, function fimBuscaNomeCoordenador(nomeCoordenador){
						if( !(nomeCoordenador.erro) ){
							coordenador.nome = nomeCoordenador;
						}
						gerenciadorBanco.eventEmitter.emit('fimPesquisaCoordenadorEGerenteDoMapa' + idMapa, gerente, coordenador);
					});
				});
				
			}
		};
		
		operadorSql.addSql(query, callback);
	}
	
	function pesquisarIndividuosComPermissao(idMapa){
		var query;
		var callback;
		
		query = 
			"SELECT p.idUsuario, u.nome, p.tipoPermissao" +
			" FROM permissoes_edicao_usuarios p, usuarios u" +
			" WHERE p.idMapa = " + connection.escape(idMapa) +
			" AND p.idUsuario = u.id"
		;
		callback = function(err, result) {
			
			if(err)
				gerenciadorBanco.eventEmitter.emit('fimPesquisaIndividuosComPermissao' + idMapa, {erro: err.code});
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
				
				gerenciadorBanco.eventEmitter.emit('fimPesquisaIndividuosComPermissao' + idMapa, listaUsuarios);
			}
		};
		
		operadorSql.addSql(query, callback);
	}
	
	function pesquisarGruposComPermissao(idMapa){
		var query;
		var callback;
		
		query =
			"SELECT p.idGrupo, g.nome, p.tipoPermissao" +
			" FROM permissoes_edicao_grupos p, grupos g" +
			" WHERE p.idMapa = " + connection.escape(idMapa) +
			" AND p.idGrupo = g.id"
		;
		callback = function(err, result) {
			
			if(err)
				gerenciadorBanco.eventEmitter.emit('fimPesquisaGruposComPermissao' + idMapa, {erro: err.code});
			else { 
				
				var listaGrupos;
				listaGrupos = new Array();
				
				//converter os tipos de permisssao de numeros para palavras
				for(var i=0; i < result.length; i++){
					listaGrupos[i] = {
							id: result[i].idGrupo,
							nome: result[i].nome,
							tipoPermissao: converterPermissao(result[i].tipoPermissao)
					};
				}
				
				gerenciadorBanco.eventEmitter.emit('fimPesquisaGruposComPermissao' + idMapa, listaGrupos);
			}
		};
		
		operadorSql.addSql(query, callback);	
	}
	
	
	
	this.pesquisarTodosComPermissao = function pesquisarTodosComPermissao(idMapa,idOperacao){
		pesquisarCoordenadorEGerenteDoMapa(idMapa);
		gerenciadorBanco.eventEmitter.once('fimPesquisaCoordenadorEGerenteDoMapa' + idMapa, function(gerente, coordenador){
			if(gerente.erro){
				return gerenciadorBanco.eventEmitter.emit('fimPesquisaTodosComPermissao' + idOperacao, gerente.erro);
			}
			else{
				pesquisarIndividuosComPermissao(idMapa);
				gerenciadorBanco.eventEmitter.once('fimPesquisaIndividuosComPermissao' + idMapa, function(listaUsuarios){
					if(listaUsuarios.erro){
						return gerenciadorBanco.eventEmitter.emit('fimPesquisaTodosComPermissao' + idOperacao, listaUsuarios.erro);
					}
					else{
						pesquisarGruposComPermissao(idMapa);
						gerenciadorBanco.eventEmitter.once('fimPesquisaGruposComPermissao' + idMapa, function(listaGrupos){
							if(listaGrupos.erro){
								return gerenciadorBanco.eventEmitter.emit('fimPesquisaTodosComPermissao' + idOperacao, listaGrupos.erro);
							}
							else{
								listaUsuarios.push(gerente);
								listaUsuarios.push(coordenador);
								return gerenciadorBanco.eventEmitter.emit('fimPesquisaTodosComPermissao' + idOperacao, listaUsuarios, listaGrupos);
							}
						})
					}
				});
			}
		});
	};
	
	function alterarConfiguracoesMapa(idMapa, nomeMapa, idCoordenador, listaUsuariosPermitidos, listaGruposPermitidos, novasPermissoesUsuarios, novasPermissoesGrupos,idUsuario){
		//novasPermissoes e uma lista de objetos com duas propriedades: id em int e tipoPermissao em string
		//listaPermitidos e uma lista com id em int, nome e tipoPermissao em string
		
		var transacao;
		var estaNaLista;
		
		transacao = 
			" START TRANSACTION;" +
			" UPDATE mapas SET nome= " + connection.escape(nomeMapa) + ", idCoordenador="+ connection.escape(idCoordenador) +" WHERE id=" + connection.escape(idMapa) + ";"
		;
		
		/////////////////////////////
		//PARA USUARIOS INDIVIDUAIS//
		////////////////////////////
		
		// Para cada membro da lista novasPermissoes, ou seja, das permissoes alteradas pelo usuario, verificar:
		// Se o usuario ja possuia permissao, verificar se foi alterado o tipo,
		// se o usuario nao possuia permissao, adicionar,
		// se o usuario esta na lista antiga, mas nao na nova, deleta-lo.
		 
		for(var i=0; i < novasPermissoesUsuarios.length; i++){
			estaNaLista = false;
			
			for(var j=0; j< listaUsuariosPermitidos.length && !estaNaLista; j++){
				if(novasPermissoesUsuarios[i].idUsuario == listaUsuariosPermitidos[j].id){
					estaNaLista = true;
					if(novasPermissoesUsuarios[i].tipoPermissao != listaUsuariosPermitidos[j].tipoPermissao){ //so altera se diferente
						transacao += 
							" UPDATE permissoes_edicao_usuarios SET tipoPermissao=" + connection.escape( converterPermissaoParaNumero(novasPermissoesUsuarios[i].tipoPermissao) ) +
							" WHERE idUsuario=" + connection.escape( novasPermissoesUsuarios[i].idUsuario ) + 
							" AND idMapa=" + connection.escape(idMapa) + ";"
						;
					}
					listaUsuariosPermitidos.splice(j,1);
				}
			}
			
			if(!estaNaLista){ //usuario completamente novo
				transacao += 
					" INSERT INTO permissoes_edicao_usuarios SET idUsuario =" + connection.escape(novasPermissoesUsuarios[i].idUsuario) +
					", idMapa =" + connection.escape(idMapa) +
					", tipoPermissao =" + connection.escape( converterPermissaoParaNumero(novasPermissoesUsuarios[i].tipoPermissao) ) +
					";"
				;
			}
		}
		
		if(listaUsuariosPermitidos.length > 0){ //permissoes a serem deletadas
			for(var j=0; j < listaUsuariosPermitidos.length; j++){
				transacao += 
					" DELETE FROM permissoes_edicao_usuarios WHERE idUsuario=" + connection.escape(listaUsuariosPermitidos[j].id) +
					" AND idMapa=" + connection.escape(idMapa) + ";"
				;
			}
		}
		
		/////////////////////////////
		//PARA GRUPOS//
		////////////////////////////
		
		// Para cada membro da lista novasPermissoes, ou seja, das permissoes alteradas pelo usuario, verificar:
		// Se o grupo ja possuia permissao, verificar se foi alterado o tipo,
		// se o grupo nao possuia permissao, adicionar,
		// se o grupo esta na lista antiga, mas nao na nova, deleta-lo.
		 
		for(var i=0; i < novasPermissoesGrupos.length; i++){
			estaNaLista = false;
			
			for(var j=0; j< listaGruposPermitidos.length && !estaNaLista; j++){
				if(novasPermissoesGrupos[i].idGrupo == listaGruposPermitidos[j].id){
					estaNaLista = true;
					if(novasPermissoesGrupos[i].tipoPermissao != listaGruposPermitidos[j].tipoPermissao){ //so altera se diferente
						transacao += 
							" UPDATE permissoes_edicao_grupos SET tipoPermissao=" + connection.escape( converterPermissaoParaNumero(novasPermissoesGrupos[i].tipoPermissao) ) +
							" WHERE idGrupo=" + connection.escape(novasPermissoesGrupos[i].idGrupo) + 
							" AND idMapa=" + connection.escape(idMapa) + ";"
						;
					}
					listaGruposPermitidos.splice(j,1);
				}
			}
			
			if(!estaNaLista){ //usuario completamente novo
				transacao += 
					" INSERT INTO permissoes_edicao_grupos SET idGrupo =" + connection.escape(novasPermissoesGrupos[i].idGrupo) +
					", idMapa =" + connection.escape(idMapa) +
					", tipoPermissao =" + connection.escape( converterPermissaoParaNumero(novasPermissoesGrupos[i].tipoPermissao) ) +
					";"
				;
			}
		}
		
		if(listaGruposPermitidos.length > 0){ //permissoes a serem deletadas
			for(var j=0; j < listaGruposPermitidos.length; j++){
				transacao += 
					" DELETE FROM permissoes_edicao_grupos WHERE idGrupo=" + connection.escape(listaGruposPermitidos[j].id) +
					" AND idMapa=" + connection.escape(idMapa) + ";"
				;
			}
		}
		
		callback = function(err, result) {
			if(err){
				var erro = err;
				transacao = "ROLLBACK";
				callback = function(err, result) {
					gerenciadorBanco.eventEmitter.emit('fimAlterarConfiguracoesMapa' + idUsuario + idMapa, {erro: erro.code});
				};
				operadorSql.addSql(transacao, callback);
			}
			else{
				transacao = "COMMIT";
				callback = function(err, result) {
					gerenciadorBanco.eventEmitter.emit('fimAlterarConfiguracoesMapa' + idUsuario + idMapa, "Alterações realizadas com sucesso!");
				};
				operadorSql.addSql(transacao, callback);
			}
		};
		
		operadorSql.addSql(transacao, callback);
		
	}
	
	
	this.configurarMapa = function configurarMapa(idMapa, nomeMapa, idCoordenador, idUsuario, permissoesUsuarios, permissoesGrupos){
		var idOperacaoLocal = 22;
		//permissoes e uma lista de objetos com duas propriedades: idUsuario em int e tipoPermissao em string
		
		if(idMapa){ //se o usuario nao apagou o id do mapa na pagina configurarMapa.ejs
			idMapa = parseInt(idMapa);

			gerenciadorBanco.pesquisarTodosComPermissao(idMapa,idOperacaoLocal);
			gerenciadorBanco.eventEmitter.once('fimPesquisaTodosComPermissao' + idOperacaoLocal, function(listaUsuariosPermitidos, listaGruposPermitidos){ 
				
				if(listaUsuariosPermitidos.erro){ //erro na busca dos usuarios e grupos com permissao
					gerenciadorBanco.eventEmitter.emit('fimConfigurarMapa' + idUsuario + idMapa, {erro: listaUsuariosPermitidos.erro});
				}
				else{ //sucesso na busca dos usuarios e grupos com permissao
					
					//necessario saber a permissao do usuario, pois so coordenador e gerente podem mudar permissoes
					var i=0;
					while( i < listaUsuariosPermitidos.length && listaUsuariosPermitidos[i].id != idUsuario)
						i++;
					
					if( i<listaUsuariosPermitidos.length && (listaUsuariosPermitidos[i].tipoPermissao == "Gerente" || listaUsuariosPermitidos[i].tipoPermissao == "Coordenador") ){
						alterarConfiguracoesMapa(idMapa, nomeMapa, idCoordenador, listaUsuariosPermitidos, listaGruposPermitidos, permissoesUsuarios, permissoesGrupos,idUsuario);
						gerenciadorBanco.eventEmitter.once('fimAlterarConfiguracoesMapa' + idUsuario + idMapa, function(resultado){ 
							if(resultado.erro)
								gerenciadorBanco.eventEmitter.emit('fimConfigurarMapa' + idUsuario + idMapa, {erro: "Alterações não aplicadas, devido ao seguinte erro: " + resultado.erro}); 
							else
								gerenciadorBanco.eventEmitter.emit('fimConfigurarMapa' + idUsuario + idMapa, resultado);
						});
						
					}
					else{ //ou nao esta na lista ou nao tem permissao de coord ou gerente
						gerenciadorBanco.eventEmitter.emit('fimConfigurarMapa' + idUsuario + idMapa, {erro: "Você não tem permissão para configurar este mapa!"}); 
					}
				}
			});
			
		}
		else{ //usuario apagou id do mapa
			gerenciadorBanco.eventEmitter.emit('fimConfigurarMapa' + idUsuario + idMapa, {erro: "O id do mapa foi apagado!"}); 
		}
	};

}

module.exports = GerenciadorBanco;

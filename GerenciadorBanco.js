function GerenciadorBanco(){
	
	var events = require('events');
	var mysql = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user: 'root',
	  password: 'ricardo',
	  database: 'mapas'
	});
	
	var gerenciadorBanco = this;
	this.eventEmitter = new events.EventEmitter(); 
	

	this.perquisarMapas = function (idUsuario){
		
		var mapas = new Array();
		
		connection.query('SELECT idMapa,nomeMapa FROM permissoes WHERE idUsuario = ?',[idUsuario], function(err, result) {		
			if(err) {
				if(err.code == 'ER_NO_SUCH_TABLE'){
					connection.query('CREATE TABLE permissoes(idUsuario INT NOT NULL, idMapa INT NOT NULL, nomeMapa VARCHAR(30) NOT NULL, tipoPermissao INT NOT NULL, PRIMARY KEY (idUsuario,idMapa) )');
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', mapas);
				}
				else{
					gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', mapas);
				}
			}
			else { 
				for(var i=0; i < result.length; i++){
					mapas[i] = new Object();
					mapas[i].idMapa = result[i].idMapa;
					mapas[i].nomeMapa = result[i].nomeMapa;
				}
				gerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', mapas);
			}
		});	
	};
	
	
	function adicionarPermissoes(idMapa, nomeMapa, permissoes){
		var tiposPermissao = {
			"Gerente": 1,
			"Editor": 2,
			"Visualizador": 3
		};
		
		var permissoesRestantes = new Array();
		
		for(var i=0; i < permissoes.length; i++){
			permissoesRestantes.push(i);
		}
		
		
		for(var k=0; k < permissoes.length; k++){
			connection.query('INSERT INTO permissoes SET idUsuario = ?, idMapa = ?, nomeMapa = ?, tipoPermissao = ?',[permissoes[k].idUsuario, idMapa, nomeMapa, tiposPermissao[permissoes[k].tipoPermissao]], function(err, result) {		
				if(err) {
					//fazer algum tratamento
					permissoesRestantes.pop();
					if(permissoesRestantes.length == 0){
						gerenciadorBanco.eventEmitter.emit('permissoesAdicionadas');
					}
				}
				else{
					permissoesRestantes.pop();
					if(permissoesRestantes.length == 0){
						gerenciadorBanco.eventEmitter.emit('permissoesAdicionadas');
					}
				}
			});
		}	
		
	}

	
	this.inserirNovoMapa = function (nomeMapa, permissoes){
		var i, idProprietario, idMapaNovo;
		
		i=0;
		while(permissoes[i].tipoPermissao != "Gerente"){
			i++;
		}
		idProprietario = permissoes[i].idUsuario;
		
		connection.query('INSERT INTO mapas SET nome = ?, idProprietario = ?',[nomeMapa, idProprietario], function(err, result) {		
			if(err) {
				if(err.code == 'ER_NO_SUCH_TABLE'){ // se a tabela nao tiver sido criada
					connection.query('CREATE TABLE mapas(id INT NOT NULL AUTO_INCREMENT, nome VARCHAR(30) NOT NULL, idProprietario INT NOT NULL, PRIMARY KEY (id) )');
					connection.query('INSERT INTO mapas SET nome = ?, idProprietario = ?',[nomeMapa, idProprietario], function(err, result) {
						if(err) console.log(err);
						else{
							idMapaNovo = result.insertId;
							adicionarPermissoes(idMapaNovo, nomeMapa, permissoes);
							gerenciadorBanco.eventEmitter.once('permissoesAdicionadas', function(){ 
								gerenciadorBanco.eventEmitter.emit('mapaCriado', result.insertId);
							});
						}
					});
				}
				else
					console.log(err);
			}
			else { 
				idMapaNovo = result.insertId;
				adicionarPermissoes(idMapaNovo, nomeMapa, permissoes);
				gerenciadorBanco.eventEmitter.once('permissoesAdicionadas', function(){ 
					gerenciadorBanco.eventEmitter.emit('mapaCriado', result.insertId);
				});
			}
		});
	};
	
	
	this.buscarNomeTodosUsuarios = function(){
		connection.query('SELECT id,nome FROM usuarios', function(err, result) {
			var listaUsuarios;
			listaUsuarios = new Array();
			
			if(err) {
				gerenciadorBanco.eventEmitter.emit('nomeTodosUsuarios', listaUsuarios);
			}
			else { 
				for(var i=0; i < result.length; i++){
					listaUsuarios[i] = {
							id: result[i].id,
							nome: result[i].nome
					};
				}
				
				gerenciadorBanco.eventEmitter.emit('nomeTodosUsuarios', listaUsuarios);
			}
		});	
	};
	
	this.verificarTipoPermissao = function(idUsuario, idMapa){
		connection.query('SELECT tipoPermissao FROM permissoes WHERE idUsuario=? AND idMapa=?', [idUsuario, idMapa], function(err, result) {
			
			if(err) {
				//mensagem de erro ou usuario sem permissao
			}
			else { 
				gerenciadorBanco.eventEmitter.emit('tipoPermissao', result[0].tipoPermissao);
			}
		});	
	};

}

module.exports = GerenciadorBanco;

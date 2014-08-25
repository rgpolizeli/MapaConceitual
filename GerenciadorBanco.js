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
	
	
	function adicionarPermissao(idUsuario, idMapa, nomeMapa, tipoPermissao){
		connection.query('INSERT INTO permissoes SET idUsuario = ?, idMapa = ?, nomeMapa = ?, tipoPermissao = ?',[idUsuario, idMapa, nomeMapa, tipoPermissao], function(err, result) {		
			if(err) {
				//fazer algum tratamento
			}
			else { 
				gerenciadorBanco.eventEmitter.emit('permissaoAdicionada');
			}
		});	
	}

	
	this.inserirNovoMapa = function (nomeMapa, idProprietario){
		connection.query('INSERT INTO mapas SET nome = ?, idProprietario = ?',[nomeMapa, idProprietario], function(err, result) {		
			if(err) {
				//fazer algum tratamento
			}
			else { 
				adicionarPermissao(idProprietario, result.insertId, nomeMapa, 1);
				gerenciadorBanco.eventEmitter.once('permissaoAdicionada', function(){ 
					gerenciadorBanco.eventEmitter.emit('mapaCriado', result.insertId);
				});
			}
		});	
	};
	

}

module.exports = GerenciadorBanco;

function GerenciadorBanco(){
	
	var events = require('events');
	var mysql = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user: 'root',
	  password: 'ricardo',
	  database: 'mapas'
	});
	
	var GerenciadorBanco =this;
	this.eventEmitter = new events.EventEmitter(); 
	
	/*
	this.adicionarPermissao = function (idUsuario, idMapa){
	};
	*/
	
	
	
	
	this.perquisarMapas = function (idUsuario){
		
		var mapas = new Array();
		
		connection.query('SELECT idMapa,nomeMapa FROM permissoes WHERE idUsuario = ?',[idUsuario], function(err, result) {		
			if(err) {
				if(err.code == 'ER_NO_SUCH_TABLE'){
					connection.query('CREATE TABLE permissoes(idUsuario INT NOT NULL, idMapa INT NOT NULL, nomeMapa VARCHAR(30), tipoPermissao INT, PRIMARY KEY (idUsuario,idMapa) )');
					GerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', mapas);
				}
				else{
					GerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', mapas);
				}
			}
			else { 
				for(var i=0; i < result.length; i++){
					mapas[i] = new Object();
					mapas[i].idMapa = result[i].idMapa;
					mapas[i].nomeMapa = result[i].nomeMapa;
				}
				console.log('banco');
				GerenciadorBanco.eventEmitter.emit('fimPesquisaMapas', mapas);
			}
		});	
	};
	


}

module.exports = GerenciadorBanco;

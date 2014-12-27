function UsuariosAtivos(idMapa){
	
	this.idMapa = idMapa;
	this.usuarios = new Array();
	/*
	 * usuarios[i].idUsuario
	 * usuarios[i].socket
	 * usuarios[i].tipoPermissao
	 */
}

function Usuario(idUsuario, socket, tipoPermissao){
	this.idUsuario = idUsuario;
	this.socket = socket;
	this.tipoPermissao = tipoPermissao;
}


function GerenciadorUsuariosAtivos(){
	/*
	 * Unifica listaUsuarios e ListaSincronizadores e acrescenta permissao
	 * 
	 */
	var gerenciadorUsuariosAtivos = this;
	var listaUsuariosAtivos = new Array();
	
	
	function buscarPosicaoMapa(idMapa){
		
		if(listaUsuariosAtivos.length == 0){ //lista vazia
			return -1;
		}
		else{
			var i = 0;
			while( (listaUsuariosAtivos[i].idMapa != idMapa) && ( i <  listaUsuariosAtivos.length) )
				i++;
			
			if (i == listaUsuariosAtivos.length){
				return -1;
			}
			else{
				return i;
			}
		}
	}
	
	function buscarPosicaoUsuario(socketUsuario, posicaoMapa){
		if(listaUsuariosAtivos[posicaoMapa].usuarios.length == 0){ //lista vazia
			return -1;
		}
		else{
			var i = 0;
			while( (listaUsuariosAtivos[posicaoMapa].usuarios[i].socket != socketUsuario) && ( i <  listaUsuariosAtivos[posicaoMapa].usuarios.length) )
				i++;
			
			if (i == listaUsuariosAtivos[posicaoMapa].usuarios.length){
				return -1;
			}
			else{
				return i;
			}
		}
	}
	
	function adicionarMapa( idMapa ){
		var posicao = listaUsuariosAtivos.push( new UsuariosAtivos(idMapa) );
		return (posicao - 1);
	};
	
	this.adicionarUsuarioAtivo = function (idMapa, idUsuario, socket, tipoPermissao){
		var posicao = buscarPosicaoMapa( idMapa );
		var usuario;
		
		if(posicao == -1){ //mapa nao existe
			posicao = adicionarMapa( idMapa );
			usuario = new Usuario( idUsuario, socket, tipoPermissao );
			listaUsuariosAtivos[posicao].usuarios.push( usuario );
		}
		else{ //mapa ja existe
			usuario = new Usuario( idUsuario, socket, tipoPermissao );
			listaUsuariosAtivos[posicao].usuarios.push( usuario );
		}
	};
	
    this.removerMapa = function(idMapa){
    	var posicaoMapa = buscarPosicaoMapa( idMapa );
    	listaUsuariosAtivos.splice(posicaoMapa,1);
	};
	
	this.removerUsuarioAtivo = function(socketUsuario, idMapa){
		var posicaoMapa, posicaoUsuario;
		
		posicaoMapa = buscarPosicaoMapa( idMapa );
		posicaoUsuario = buscarPosicaoUsuario(socketUsuario, posicaoMapa);
		listaUsuariosAtivos[posicaoMapa].usuarios.splice(posicaoUsuario,1);
	};
	
	
	this.getSocketUsuariosAtivos = function(idMapa){
		var posicao = buscarPosicaoMapa( idMapa );
		var socketUsuariosAtivos = new Array();
		
		for(var i=0; i < listaUsuariosAtivos[posicao].usuarios.length; i++ ){
			socketUsuariosAtivos[i] = listaUsuariosAtivos[posicao].usuarios[i].socket;
		}
		return socketUsuariosAtivos;
	};
	
	this.getIdsMapasDoUsuario = function (socketUsuario){
		var idsMapas = new Array();
		var achou = false;
		
		for(var posicaoMapa=0; posicaoMapa < listaUsuariosAtivos.length; posicaoMapa++){
			for(var posicaoUsuario=0; posicaoUsuario < listaUsuariosAtivos[posicaoMapa].usuarios.length && !achou; posicaoUsuario++){
				if(listaUsuariosAtivos[posicaoMapa].usuarios[posicaoUsuario].socket == socketUsuario){
					achou = true;
					idsMapas.push(listaUsuariosAtivos[posicaoMapa].idMapa);
				}
			}
			achou = false;
		}
		return idsMapas;
	};
	
	
	this.getQuantidadeUsuariosAtivos = function(idMapa){
		var posicao = buscarPosicaoMapa( idMapa );
		
		if(posicao == -1)
			return posicao;
		else
			return listaUsuariosAtivos[posicao].usuarios.length;
	};
	
	
	this.verificarPermissao = function(idMapa, socketUsuario){
		var posicaoMapa = buscarPosicaoMapa( idMapa );
		var achou = false;
		var tipoPermissao;
		
		for(var i = 0; i < listaUsuariosAtivos[posicaoMapa].usuarios.length && !achou; i++){
			if(listaUsuariosAtivos[posicaoMapa].usuarios[i].socket == socketUsuario){
				achou = true;
				tipoPermissao = listaUsuariosAtivos[posicaoMapa].usuarios[i].tipoPermissao;
			}
		}
		return tipoPermissao;
	};
	
}

module.exports = GerenciadorUsuariosAtivos;

function UsuariosAtivos(idMapa){
	
	this.idMapa = idMapa;
	this.usuarios = new Array();
	/*
	 * usuarios[i].idUsuario
	 * usuarios[i].socket
	 * usuarios[i].tipoPermissao
	 */
}

function Usuario(idUsuario, nomeUsuario, socket, tipoPermissao){
	this.idUsuario = idUsuario;
	this.nomeUsuario = nomeUsuario;
	this.socket = socket;
	this.tipoPermissao = tipoPermissao;
}


function GerenciadorUsuariosAtivos(){
	
	var gerenciadorUsuariosAtivos = this;
	var listaUsuariosAtivos = new Array();
	
	
	this.getNomeUsuariosAtivos = function getNomeUsuariosAtivos(idMapa){
		var posicaoMapa = buscarPosicaoMapa( idMapa );
		var listaNomes;
		
		listaNomes = new Array();
		for(var i=0; i < listaUsuariosAtivos[posicaoMapa].usuarios.length; i++){
			listaNomes.push(listaUsuariosAtivos[posicaoMapa].usuarios[i].nomeUsuario);
		}
		return listaNomes;
	};
	
	function buscarPosicaoMapa(idMapa){
		
		if(listaUsuariosAtivos.length == 0){ //lista vazia
			return -1;
		}
		else{
			var i = 0;
			while( ( i <  listaUsuariosAtivos.length) && (listaUsuariosAtivos[i].idMapa != idMapa) )
				i++;
			
			if (i == listaUsuariosAtivos.length){
				return -1;
			}
			else{
				return i;
			}
		}
	}
	
	function buscarPosicaoUsuarioPeloSocket(socketUsuario, posicaoMapa){
		if(listaUsuariosAtivos[posicaoMapa].usuarios.length == 0){ //lista vazia
			return -1;
		}
		else{
			var i = 0;
			while( ( i <  listaUsuariosAtivos[posicaoMapa].usuarios.length) && (listaUsuariosAtivos[posicaoMapa].usuarios[i].socket != socketUsuario) )
				i++;
			
			if (i == listaUsuariosAtivos[posicaoMapa].usuarios.length){
				return -1;
			}
			else{
				return i;
			}
		}
	}
	
	function buscarPosicaoUsuarioPeloId(idUsuario, posicaoMapa){
		if(listaUsuariosAtivos[posicaoMapa].usuarios.length == 0){ //lista vazia
			return -1;
		}
		else{
			var i = 0;
			while( ( i <  listaUsuariosAtivos[posicaoMapa].usuarios.length) && (listaUsuariosAtivos[posicaoMapa].usuarios[i].idUsuario != idUsuario) )
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
	
	this.adicionarUsuarioAtivo = function (idMapa, idUsuario, nomeUsuario, socket, tipoPermissao){
		var posicao = buscarPosicaoMapa( idMapa );
		var usuario;
		
		if(posicao == -1){ //mapa nao existe
			posicao = adicionarMapa( idMapa );
			usuario = new Usuario( idUsuario, nomeUsuario, socket, tipoPermissao );
			listaUsuariosAtivos[posicao].usuarios.push( usuario );
		}
		else{ //mapa ja existe
			usuario = new Usuario( idUsuario, nomeUsuario, socket, tipoPermissao );
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
		posicaoUsuario = buscarPosicaoUsuarioPeloSocket(socketUsuario, posicaoMapa);
		return listaUsuariosAtivos[posicaoMapa].usuarios.splice(posicaoUsuario,1);
	};
	
	
	this.getSocketUsuariosAtivos = function(idMapa){
		var posicao = buscarPosicaoMapa( idMapa );
		var socketUsuariosAtivos = new Array();
		
		if(posicao != -1){ //mapa aberto
			for(var i=0; i < listaUsuariosAtivos[posicao].usuarios.length; i++ )
				socketUsuariosAtivos[i] = listaUsuariosAtivos[posicao].usuarios[i].socket;
		}

		return socketUsuariosAtivos;
	};
	
	this.getSocketUsuarioAtivoPeloId = function(idMapa, idUsuario){
		var posicaoMapa = buscarPosicaoMapa( idMapa );
		var posicaoUsuarioAtivo = buscarPosicaoUsuarioPeloId(idUsuario, posicaoMapa);
		var socketUsuarioAtivo;
		
		if(posicaoMapa != -1){ //mapa aberto
			socketUsuarioAtivo = listaUsuariosAtivos[posicaoMapa].usuarios[posicaoUsuarioAtivo].socket;
		}

		return socketUsuarioAtivo;
	};
	
	
	this.getIdsUsuariosAtivos = function(idMapa){
		var posicao = buscarPosicaoMapa( idMapa );
		var idsUsuariosAtivos = new Array();
		
		if(posicao != -1){ //mapa aberto
			for(var i=0; i < listaUsuariosAtivos[posicao].usuarios.length; i++ )
				idsUsuariosAtivos[i] = listaUsuariosAtivos[posicao].usuarios[i].idUsuario;
		}

		return idsUsuariosAtivos;
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

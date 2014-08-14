function ListaSincronizacao(){
	
	this.idsUsuarios = new Array();
	this.objetosBloqueados = new Array();
	this.operacoes = new Array();
}


function Sincronizador(id){
	
	var idMapa = id;
	
	var jsdom = require("jsdom");
	var $  = require('jquery')(jsdom.jsdom().createWindow());
	
	var listaSincronizacao = new ListaSincronizacao();

	var sincronizador = this;
	
	this.buscarPosicaoNaLista = function(id, tipoBusca){
		
		var posicao;
		
		//caso tipo Busca for objeto
		//caso tipo busca for usuario
		switch(tipoBusca){
			case 1: posicao = listaSincronizacao.idsUsuarios.indexOf(id);
			break;
			case 2: posicao = listaSincronizacao.objetosBloqueados.indexOf(id);
			break;
		}
		
		return posicao;
	};
	
	
	this.inserirUsuarioNaLista = function(idUsuario){
		
		var i;
		
		i = 0;
		while(listaSincronizacao.idsUsuarios[i]){
			i++;
		}
		
		listaSincronizacao.idsUsuarios[i] = idUsuario;
		return i;
	};
	
	
	var buscarObjetosConectados = function(idObjeto){
		//palavra de ligacao esta imediatamente conectado a conceitos somente
		//conceito esta imediatamente conectado a palavras de ligacao somente
		
		var objetosConectados = new Array();
		var indice = 0;
		
		//como nao sei se o objeto e conceito ou palavra de ligacao
		// caso o objeto seja um conceito
		$(arqXml).find('conceito').each( function( index, element ){
			if( $( element ).find( 'id' ).val() == idObjeto ){
				$( element ).find('idLigacao').each( function( index, element ){
					objetosConectados[ indice ] = $(element).val();
					indice++;
				});
			}
		});
		
		//caso o objeto seja uma palavra de ligacao
		$(arqXml).find('palavraLigacao').each( function( index, element ){
			if( $( element ).find( 'id' ).val() == idObjeto ){
				
				objetosConectados[ indice ] = $( element ).find('idConceitoPai').val();
				indice++;
				
				var qtdFilhos = $( element ).find('qtdFilhos').val();
				for(var i = 1; i <= qtdFilhos; i++){
					
					objetosConectados[ indice ] = $( element ).find('idConceitoFilho' + i).val();
					indice++;
						
				}
			}
		});
	};
	
	
	var buscarOperacoesIncompativeis = function (idObjeto){
		
		
	};
	
	
	this.bloquearObjeto = function(idUsuario, idObjeto, tipoOperacao){
		//verificar se usuario esta na lista
		//se nao estiver adicione
		//busque as posicoes do objeto na lista  
		//caso nao ache, objeto pode ser bloqueado
		//caso ache verifique se a operacao que se quer fazer esta de acordo com os bloqueios do objeto
		//se estiver de acordo bloqueie o objeto e informe isto ao sevidro
		
		var posicaoUsuario;
		var posicaoObjeto;
		
		posicaoUsuario = buscarPosicaoNaLista(idUsuario,1);
		
		posicaoObjeto = buscarPosicaoNaLista(idObjeto,2);
		if(posicaoObjeto == -1){
			
			for(var i = posicaoObjeto; i < listaSincronizacao.objetosBloqueados.length; i++){
				//verificar o tipo de operacao
				//se for exclusao, verificar cada objeto imediatamente ligado a este para ver se estao sendo modificados ou nao, se, estiverem, negar o bloqueio pois ha outro usuario modificando o objeto em questao.
				
			}
			
			listaSincronizacao.objetosBloqueados[posicaoUsuario] = idObjeto;
			listaSincronizacao.operacoes[posicaoUsuario] = tipoOperacao;
			return 1;
		}
		else{
			return 0;
		}
		
	};
	
	this.desbloquearObjeto = function(idUsuario){
		//busque pela posicao do usuario na lista
		//coloque undefined em usuario e em idObjeto
		//informe ao servidor o sucesso.
		
	};
	
	this.getUsuariosAtivos = function(){
		return listaSincronizacao.idsUsuarios;
	};
	
	this.removerUsuarioAtivo = function(idUsuario){
		var posicao = sincronizador.buscarPosicaoNaLista(idUsuario, 1);
		
		listaSincronizacao.idsUsuarios.splice(posicao,1);
		listaSincronizacao.objetosBloqueados.splice(posicao,1);
		listaSincronizacao.operacoes.splice(posicao,1);
	};
	
	
	
}

module.exports = Sincronizador;

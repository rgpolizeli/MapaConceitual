function GerenciadorLista(listaElementos){
	this.lista = listaElementos;
	
	
	this.limparLista = function limparLista(){
		$("#lista").empty();
	};
	
	/*
	 * getCorFundo e necessaria pois nao ha como recuperar a cor de fundo do graphic
	 */
	this.getCorFundo = function(idObjeto){
		return $('ul#' + idObjeto).children("li[title='corFundo']").text();
	};
	
	this.setCorFundo = function(idObjeto, novaCorFundo){
		return $('ul#' + idObjeto).children("li[title='corFundo']").text(novaCorFundo);
	};
	
	
	/**
     * verificar se ha ligacao entre conceito e palavra de ligacao
     */
    this.verificarLigacao = function (idConceito,idLigacao){    	
    	var listaIdLigacoes = $('ul#' + idConceito).children("li[title='idLigacao']");
    	var idLigacaoAux;
    	
    	for(var i=0; listaIdLigacoes.get(i) != undefined; i++){
    		 idLigacaoAux = listaIdLigacoes.get(i).value;
    		 if(idLigacaoAux == idLigacao) return true;
    	}
    	return false;	
    };
	
    
    this.getQtdFilhosLigacao = function(idLigacao){
    	return $("ul#" + idLigacao).children("li[title='qtdFilhos']").val();
    };
    
    
    this.buscarPapelConceitoDisponivel = function(idLigacao){
    	var papelConceito = 1;
    	while( $("ul#" + idLigacao).children("li[title='idConceitoFilho"+ papelConceito + "']").length != 0 )
    		papelConceito++;
    	return papelConceito;
    };
    
    
    this.getLigacao = function (idLigacao){
    	return $('ul#' + idLigacao);
    };
    
    this.getConceito = function (idConceito){
    	return $('ul#' + idConceito);
    };
    
    this.setAlturaMinima = function setAlturaMinima (idObjeto, novaAlturaMinima){
    	$( 'ul#' + idObjeto ).children("li[title='alturaMinima']").text(novaAlturaMinima);
    };
    
    this.setLarguraMinima = function setLarguraMinima(idObjeto, novaLarguraMinima){
    	$( 'ul#' + idObjeto ).children("li[title='larguraMinima']").text(novaLarguraMinima);
    };
    
    this.getAlturaMinima = function getAlturaMinima (idObjeto){
    	var alturaMin;
    	
    	alturaMin = $( 'ul#' + idObjeto ).children("li[title='alturaMinima']").text();
    	alturaMin = parseFloat(alturaMin);
    	return alturaMin;
    };
    
    this.getLarguraMinima = function getLarguraMinima(idObjeto){
    	var larguraMin;
    	
    	larguraMin = $( 'ul#' + idObjeto ).children("li[title='larguraMinima']").text();
    	larguraMin = parseFloat(larguraMin);
    	return larguraMin;
    };
    
	
	/**
	 * adiciona um novo conceito a lista
	 */
	this.adicionarConceitoNaLista = function(idConceitoP, corFundo, alturaMinima, larguraMinima){
		
		var idConceito;
		var novoConceito;
		
		idConceito = idConceitoP;
		
		novoConceito = "<ul id =" + idConceito +" title ='conceito'>";
		novoConceito += "<li title='corFundo'>"+ corFundo +"</li>";
		novoConceito += "<li title='alturaMinima'>" + alturaMinima + "</li>";
		novoConceito += "<li title='larguraMinima'>" + larguraMinima + "</li>";
		novoConceito += "</ul>";
			
		$(lista).append($(novoConceito));
	};
	
	this.adicionarLigacaoNaLista = function (idLigacao, idLinhaPai, idLinhaFilho, idConceitoPai, idConceitoFilho, corFundo, alturaMinima, larguraMinima){
		
		var novaLigacao;
		var atributosLigacao;
		var idConceitos;
		
		
		novaLigacao = "<ul id =" + idLigacao +" title ='ligacao'>";
		
		atributosLigacao = 
			"<li title='idConceitoPai' value='" + idConceitoPai + "'></li>" +
			"<li title='idConceitoFilho1' value='" + idConceitoFilho + "'></li>" +
			"<li title='idLinhaPai' value='" + idLinhaPai + "'></li>" +
    		"<li title='idLinhaFilho1' value='" + idLinhaFilho + "'></li>" +
    		"<li title='qtdFilhos' value='1'></li>"	+
    		"<li title='corFundo'>"+ corFundo +"</li>" +
    		"<li title='alturaMinima'>" + alturaMinima + "</li>" +
    		"<li title='larguraMinima'>" + larguraMinima + "</li>"
		;
		
		novaLigacao += atributosLigacao + "</ul>";
		
		
		$(lista).append( $(novaLigacao) );

		idConceitos = new Array();
		idConceitos[0] = idConceitoPai;
		idConceitos[1] = idConceitoFilho;
		
		inserirLigacaoAosConceitos( idConceitos, idLigacao );
	};
	
	
	this.adicionarSemiLigacaoNaLista = function(idConceitoP, idLigacaoP, idLinhaP, qtdFilhosLigacaoP, papelConceitoP){
		var idLigacao;
		var idConceito;
		var idLinha;
		var papelConceito;
		var qtdFilhosLigacao;
		var semiLigacao;
		
		idLinha = idLinhaP;
		idLigacao = idLigacaoP;
		idConceito = idConceitoP;
		papelConceito = papelConceitoP;
		qtdFilhosLigacao = qtdFilhosLigacaoP;
		
		$("ul#" + idLigacao).children("li[title='qtdFilhos']").val(qtdFilhosLigacao);
		
		semiLigacao = 
			"<li title='idConceitoFilho"+ papelConceito +"' value='" + idConceito + "'></li>" + 
			"<li title='idLinhaFilho" + papelConceito +"' value = '" + idLinha + "'></li>"
		;
		
		$("ul#" + idLigacao).append( semiLigacao );
		
		var idConceitos = new Array();
		idConceitos[0] = idConceito;
		inserirLigacaoAosConceitos(idConceitos, idLigacao);
	};
	
	
	/**
	 * Inseri o id da Ligacao como um atributo dos conceitos ligados por ela
	 */
	function inserirLigacaoAosConceitos(idConceitos, idLigacao){
		var atributo;
		
		for(var i=0;idConceitos[i] != undefined;i++){
			atributo = document.createElement("li");
			atributo.title = "idLigacao";
			atributo.value = idLigacao;
			$('ul#' + idConceitos[i]).append(atributo);
			atributo = "";
		}
	}
	
	this.montarListaExcluidos = function(idObjeto){
		var tipoObjeto = verificarTipoObjeto(idObjeto);
		var listaExclusao = new Array(); // vetor que armazena todos os ids dos objetos a serem excluidos e seus tipos
    	var id;
    	var tipo;
		
    	if(tipoObjeto == "conceito"){
    		
    		var listaLigacoes = $('ul#'  + idObjeto).children("li[title='idLigacao']");
        	var papelConceito;
        	var qtdFilhos;
        	var idLigacao;
    		
    		for(var i=0; listaLigacoes.get(i) != undefined; i++){
        		idLigacao = parseInt($(listaLigacoes.get(i)).attr('value'));
        		qtdFilhos = $('ul#' + idLigacao).children("li[title='qtdFilhos']").val();
        		papelConceito = verificarPapelConceito(idObjeto, idLigacao);
        		
        		if(papelConceito == 0 || qtdFilhos == 1){ //se for o conceito pai ou se so tiver um filho - > deleta-se a palavra de ligacao
        			
        			//linha do conceito Pai da ligacao que sera deletada
        			id = $('ul#' + idLigacao).children("li[title='idLinhaPai']").val(); 
        			tipo = 'linha';
        			listaExclusao.push({id: id, tipo: tipo});
        			
        			//linhas dos  conceitos filhos da ligacao que sera deletada
        			listaLinhasFilhos = $('ul#' + idLigacao + " li[title^='idLinhaFilho']");
        	    	for(var j=0;listaLinhasFilhos.get(j) != undefined; j++){
        	    		id = $( listaLinhasFilhos.get(j) ).val();
        	    		tipo = 'linha';
        	    		listaExclusao.push({id: id, tipo: tipo});
        	    	}
        	    	
        	    	//colocar ligacao na lista
        			id = idLigacao;
    	    		tipo = 'ligacao';
    	    		listaExclusao.push({id: id, tipo: tipo});
        	    	
        		}
        		else{ //se houver mais de 1 filho
        			//inserir a linha do conceito filho na lista
        			id = $('ul#' + idLigacao).children("li[title='idLinhaFilho"+ papelConceito +"']").val();
        			tipo = 'linha';
        			listaExclusao.push({id: id, tipo: tipo});
        		}
        	}
    		//inseri o conceito a ser excluido
    		id = idObjeto;
    		tipo = 'conceito';
    		listaExclusao.push({id: id, tipo: tipo});
    	}
    	else{ //se for ligacao
    		
    		//linha do conceito Pai da ligacao que sera deletada
			id = $('ul#' + idObjeto).children("li[title='idLinhaPai']").val();
			tipo = 'linha';
			listaExclusao.push({id: id, tipo: tipo});
			
			//linhas dos  conceitos filhos da ligacao que sera deletada
			listaLinhasFilhos = $('ul#' + idObjeto + " li[title^='idLinhaFilho']");
	    	for(var j=0;listaLinhasFilhos.get(j) != undefined; j++){
	    		id = $( listaLinhasFilhos.get(j) ).val();
	    		tipo = 'linha';
	    		listaExclusao.push({id: id, tipo: tipo});
	    	}
	    	
	    	//colocar ligacao na lista
			id = idObjeto;
    		tipo = 'ligacao';
    		listaExclusao.push({id: id, tipo: tipo});
    	}
    	
    	return listaExclusao;
    };
    
  //verifica se o objeto e conceito ou palavra de ligacao
    function verificarTipoObjeto(id){
    	return $("ul#" + id).attr('title');
    }
	
	//verifica verifica o papel do conceito na ligacao
    function verificarPapelConceito(idConceito,idLigacao){
    	var papelConceito;
    	
    	if($('ul#'+ idLigacao).children("li[title='idConceitoPai']").val()  == idConceito)
    		return 0;
    	else{
    		for(var i=1; papelConceito == undefined; i++){
    			if($('ul#'+ idLigacao).children("li[title='idConceitoFilho"+ i +"']").val() == idConceito){
    				papelConceito = i;
    			}
    		}
    		return papelConceito;
    	}
    }
	
	this.excluirConceitoDaLista = function(idConceito){
		
		var listaLigacoes = new Array();
		
		$( 'ul#'+idConceito ).children( "li[title='idLigacao']" ).each( function( index, element ){
			listaLigacoes.push( $( element ).val() );
		});
		
		for(var i=0; i < listaLigacoes.length; i++){
			
			var papelConceito = verificarPapelConceito(idConceito, listaLigacoes[i]);
			
			if(papelConceito == 0){ //nao precisa atualizar a quantidade de filhos se for o conceito pai, pois a ligacao tambem sera eliminada futuramente
				$( 'ul#' + listaLigacoes[i] ).children( "li[title='idConceitoPai']" ).remove();
				$( 'ul#' + listaLigacoes[i] ).children( "li[title='idLinhaPai']").remove();
			}
			else{
				$( 'ul#' + listaLigacoes[i] ).children("li[title='idConceitoFilho"+ papelConceito +"']" ).remove();
				$( 'ul#' + listaLigacoes[i] ).children( "li[title='idLinhaFilho"+ papelConceito +"']").remove();
				
				var qtdFilhos =  $( 'ul#' + listaLigacoes[i] ).children("li[title='qtdFilhos']").val() ;
				qtdFilhos--;
				$( 'ul#' + listaLigacoes[i] ).children("li[title='qtdFilhos']").val(qtdFilhos);
			}
		}
		
		$('div#lista ul#'+idConceito).remove();
	};
	
	this.excluirLigacaoDaLista = function(idLigacao){
		var listaConceitos = new Array();
		
		listaConceitos.push( $( 'div#lista ul#' + idLigacao ).children( "li[title='idConceitoPai']").val() );
		
		$( 'div#lista ul#' + idLigacao ).children("li[title^='idConceitoFilho']").each( function( index, element ){
			listaConceitos.push( $( element ).val() );
		});
		
		for(var i=0; i < listaConceitos.length; i++){
			$('div#lista ul#' + listaConceitos[i]).children("li[title='idLigacao'][value='"+ idLigacao +"']").remove();
		}
		
		$('div#lista ul#'+idLigacao).remove();
	};
}
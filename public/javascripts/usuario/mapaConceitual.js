
function GerenciadorLista(listaElementos,mapaConceitual){
	this.lista = listaElementos;
	
	/**
	 * adiciona um novo conceito a lista
	 */
	this.adicionarConceitoNaLista = function(conceito,origem){
		
		var itemLista = document.createElement("ul"); //item da lista de conceitos
		var atributoLista = new Array(); //atributos do conceito
		
		var conceitoContainer = conceito.getConceitoContainer();
		
		var id = conceito.getId(conceitoContainer); //id do conceito no stage
		var texto = conceito.getTexto(conceitoContainer);
		var fonte = conceito.getFonte();
		var tamanhoFonte = conceito.getTamanhoFonte();
		var corFonte = conceito.getCorFonte();
		var corFundo = conceito.getCorFundo();
		
		itemLista.id = id;
		itemLista.title = "conceito";
		
		atributoLista[0] = document.createElement("li");
		atributoLista[0].title = "x";
		atributoLista[0].value = conceitoContainer.x;
		itemLista.appendChild(atributoLista[0]);
		
		atributoLista[1] = document.createElement("li");
		atributoLista[1].title = "y";
		atributoLista[1].value = conceitoContainer.y;
		itemLista.appendChild(atributoLista[1]);
		
		atributoLista[2] = document.createElement("li");
		atributoLista[2].title = "texto";
		atributoLista[2].innerHTML = texto;
		itemLista.appendChild(atributoLista[2]);
		
		atributoLista[3] = document.createElement("li");
		atributoLista[3].title = "fonte";
		atributoLista[3].innerHTML = fonte;
		itemLista.appendChild(atributoLista[3]);
		
		atributoLista[4] = document.createElement("li");
		atributoLista[4].title = "tamanhoFonte";
		atributoLista[4].innerHTML = tamanhoFonte;
		itemLista.appendChild(atributoLista[4]);
		
		atributoLista[5] = document.createElement("li");
		atributoLista[5].title = "corFonte";
		atributoLista[5].innerHTML = corFonte;
		itemLista.appendChild(atributoLista[5]);
		
		atributoLista[6] = document.createElement("li");
		atributoLista[6].title = "corFundo";
		atributoLista[6].innerHTML = corFundo;
		itemLista.appendChild(atributoLista[6]);
		
		lista.appendChild(itemLista);
		
		
	};
	
	this.adicionarLigacaoNaLista = function (origem,ligacao,mensagem){
		var ligacaoContainer = ligacao.getLigacaoContainer();
		var idLigacao = ligacao.getId(ligacaoContainer);
		
		var idConceitoPai = ligacao.getIdConceitoPai() ;
		var idConceitoFilho = ligacao.getIdConceitoFilho();
		
		if(origem == 0){
			var itemLista = document.createElement("ul"); //item da lista
			var atributoLista = new Array(); //atributos da ligacao
			var idLinhaPai = ligacao.getIdLinhaPai();
			var idLinhaFilho = ligacao.getIdLinhaFilho();
			var coordenadasPontaConceitoPai = ligacao.getCoordenadasPontaConceitoPai();
			var coordenadasPontaConceitoFilho = ligacao.getCoordenadasPontaConceitoFilho();
			var coordenadasPontaLigacaoPai = ligacao.getCoordenadasPontaLigacaoPai();
			var coordenadasPontaLigacaoFilho = ligacao.getCoordenadasPontaLigacaoFilho();
			var ligacaoX = parseFloat(ligacaoContainer.x);
			var ligacaoY = parseFloat(ligacaoContainer.y);
			
			var texto = ligacao.getTexto(ligacaoContainer);
			var fonte = ligacao.getFonte();
			var tamanhoFonte = ligacao.getTamanhoFonte();
			var corFonte = ligacao.getCorFonte();
			var corFundo = ligacao.getCorFundo();
			
			itemLista.id = idLigacao;
			itemLista.title = "ligacao";
			
			atributoLista[0] = document.createElement("li");
			atributoLista[0].title = "qtdFilhos";
			atributoLista[0].value = 1;
			itemLista.appendChild(atributoLista[0]);
			
			
			atributoLista[1] = document.createElement("li");
			atributoLista[1].title = "idLinhaPai";
			atributoLista[1].value = idLinhaPai;
			itemLista.appendChild(atributoLista[1]);
			
			atributoLista[2] = document.createElement("li");
			atributoLista[2].title = "idLinhaFilho1";
			atributoLista[2].value = idLinhaFilho;
			itemLista.appendChild(atributoLista[2]);
			
			atributoLista[3] = document.createElement("li");
			atributoLista[3].title = "idConceitoPai";
			atributoLista[3].value = idConceitoPai;
			itemLista.appendChild(atributoLista[3]);
			
			atributoLista[4] = document.createElement("li");
			atributoLista[4].title = "idConceitoFilho1";
			atributoLista[4].value = idConceitoFilho;
			itemLista.appendChild(atributoLista[4]);
			
			atributoLista[5] = document.createElement("li");
			atributoLista[5].title = "x";
			atributoLista[5].value = ligacaoX;
			itemLista.appendChild(atributoLista[5]);
			
			atributoLista[6] = document.createElement("li");
			atributoLista[6].title = "y";
			atributoLista[6].value = ligacaoY;
			itemLista.appendChild(atributoLista[6]);
			
			atributoLista[7] = document.createElement("li");
			atributoLista[7].title = "pontaConceitoPaiX";
			atributoLista[7].value = coordenadasPontaConceitoPai.x;
			itemLista.appendChild(atributoLista[7]);
			
			atributoLista[8] = document.createElement("li");
			atributoLista[8].title = "pontaConceitoPaiY";
			atributoLista[8].value = coordenadasPontaConceitoPai.y;
			itemLista.appendChild(atributoLista[8]);
			
			atributoLista[9] = document.createElement("li");
			atributoLista[9].title = "pontaConceitoFilho1X";
			atributoLista[9].value = coordenadasPontaConceitoFilho.x;
			itemLista.appendChild(atributoLista[9]);
			
			atributoLista[10] = document.createElement("li");
			atributoLista[10].title = "pontaConceitoFilho1Y";
			atributoLista[10].value = coordenadasPontaConceitoFilho.y;
			itemLista.appendChild(atributoLista[10]);
			
			atributoLista[11] = document.createElement("li");
			atributoLista[11].title = "pontaLigacaoPaiX";
			atributoLista[11].value = coordenadasPontaLigacaoPai.x;
			itemLista.appendChild(atributoLista[11]);
			
			atributoLista[12] = document.createElement("li");
			atributoLista[12].title = "pontaLigacaoPaiY";
			atributoLista[12].value = coordenadasPontaLigacaoPai.y;
			itemLista.appendChild(atributoLista[12]);
			
			atributoLista[13] = document.createElement("li");
			atributoLista[13].title = "pontaLigacaoFilho1X";
			atributoLista[13].value = coordenadasPontaLigacaoFilho.x;
			itemLista.appendChild(atributoLista[13]);
			
			atributoLista[14] = document.createElement("li");
			atributoLista[14].title = "pontaLigacaoFilho1Y";
			atributoLista[14].value = coordenadasPontaLigacaoFilho.y;
			itemLista.appendChild(atributoLista[14]);
			
			atributoLista[15] = document.createElement("li");
			atributoLista[15].title = "texto";
			atributoLista[15].innerHTML = texto;
			itemLista.appendChild(atributoLista[15]);
			
			atributoLista[16] = document.createElement("li");
			atributoLista[16].title = "fonte";
			atributoLista[16].innerHTML = fonte;
			itemLista.appendChild(atributoLista[16]);
			
			atributoLista[17] = document.createElement("li");
			atributoLista[17].title = "tamanhoFonte";
			atributoLista[17].innerHTML = tamanhoFonte;
			itemLista.appendChild(atributoLista[17]);
			
			atributoLista[18] = document.createElement("li");
			atributoLista[18].title = "corFonte";
			atributoLista[18].innerHTML = corFonte;
			itemLista.appendChild(atributoLista[18]);
			
			atributoLista[19] = document.createElement("li");
			atributoLista[19].title = "corFundo";
			atributoLista[19].innerHTML = corFundo;
			itemLista.appendChild(atributoLista[19]);
			
			lista.appendChild(itemLista);
			
			// criado localmente, envia para o servidor
			var msg = montarMensagemNovaLigacao(
					idLigacao, idLinhaPai, idLinhaFilho, idConceitoPai, idConceitoFilho, ligacaoX, ligacaoY, coordenadasPontaConceitoPai, 
						coordenadasPontaConceitoFilho, coordenadasPontaLigacaoPai,coordenadasPontaLigacaoFilho,
							texto, fonte, tamanhoFonte, corFonte, corFundo
			);
			
			mapaConceitual.usuarioAtual.enviarMensagemAoServidor(msg);
		}
		else{
			$("#lista").append($(mensagem));
		}
		//se a origem e 0, a ligacao e adicionada imediatamente, e a ligacao e enviada ao servidor.
		//Os outros usuarios criarao a nova ligacao e inserirao tambem a ligacao no conceito
		
		var idConceitos = new Array();
		idConceitos[0] = idConceitoPai;
		idConceitos[1] = idConceitoFilho;
		
		this.inserirLigacaoAosConceitos(origem, idConceitos, idLigacao);
	};
	
	
	this.adicionarSemiLigacaoNaLista = function(origem,semiLigacao,mensagem){
		var idLigacao = semiLigacao.getIdLigacao();
		var idConceito = semiLigacao.getIdConceito();
		var qtdFilhos;
		
		if(origem == 0){
			var itemLista = $("ul#" + idLigacao); //item da lista
			var idLinha = semiLigacao.getIdLinha();
			var coordenadasPontaConceito = semiLigacao.getCoordenadasPontaConceito();
			var coordenadasPontaLigacao = semiLigacao.getCoordenadasPontaLigacao();
			qtdFilhos = itemLista.children("li[title='qtdFilhos']").val();
			
			qtdFilhos += 1;
			
			itemLista.children("li[title='qtdFilhos']").val(qtdFilhos);
			
			itemLista.append("<li title='idLinhaFilho"+ qtdFilhos +"' value = '" + idLinha + "'></li>");
			itemLista.append("<li title='idConceitoFilho"+ qtdFilhos +"' value = '"+ idConceito+"'></li>");
			
			// criado localmente, envia para o servidor
			var msg = montarMensagemNovaSemiLigacao(idLigacao, idConceito, idLinha, qtdFilhos); 
			
			mapaConceitual.usuarioAtual.enviarMensagemAoServidor(msg);
		}
		else{ //se origem eh 1, entao atualiza lista de ligacao com mensagem
			qtdFilhos = $(mensagem).children("li[title='qtdFilhos']").val();
			$("ul#" + idLigacao).children("li[title='qtdFilhos']").val(qtdFilhos);
			
			//eh necessario remover qtdFilhos e a estrutura ul para anexar na lista as outras informacoes da mensagem
			var strQtdFilhos = "<li title='qtdFilhos' value='" + qtdFilhos + "'></li>";
			mensagem = mensagem.replace(strQtdFilhos,"");
			
			var ul = "<ul id='" + idLigacao + "' title='ligacao'>";
			mensagem = mensagem.replace(ul,"");
			
			$("ul#" + idLigacao).append($(mensagem));
		}
		
		var idConceitos = new Array();
		idConceitos[0] = idConceito;
		this.inserirLigacaoAosConceitos(origem, idConceitos, idLigacao);
		
	};
	
	
	
	
	function montarMensagemNovaLigacao(idLigacao, idLinhaPai, idLinhaFilho, idConceitoPai, idConceitoFilho, ligacaoX, ligacaoY, coordenadasPontaConceitoPai, 
			coordenadasPontaConceitoFilho, coordenadasPontaLigacaoPai,coordenadasPontaLigacaoFilho,
			texto, fonte, tamanhoFonte, corFonte, corFundo){
		var mensagem = 
			"<!ul id='" + idLigacao + "' title='ligacao'>" + 
			"<li title='qtdFilhos' value='" + 1 + "'></li>" +
			"<li title='idLinhaPai' value='" + idLinhaPai + "'></li>" +
			"<li title='idLinhaFilho1' value='" + idLinhaFilho + "'></li>" +
			"<li title='idConceitoPai' value='" + idConceitoPai + "'></li>" +
			"<li title='idConceitoFilho1' value='" + idConceitoFilho + "'></li>" +
			"<li title='x' value='" + ligacaoX + "'></li>" +
			"<li title='y' value='" + ligacaoY + "'></li>" +
			"<li title='texto'>" + texto + "</li>" +
			"<li title='fonte'>" + fonte + "</li>" +
			"<li title='tamanhoFonte'>" + tamanhoFonte + "</li>" +
			"<li title='corFonte'>" + corFonte + "</li>" +
			"<li title='corFundo'>" + corFundo + "</li>" +
			"</ul>"
		;
		
		return mensagem;
	}
	
	function montarMensagemNovaSemiLigacao(idLigacao, idConceito, idLinha, qtdFilhos){
		var mensagem = 
			"<(ul id='" + idLigacao + "' title='ligacao'>" + 
			"<li title='qtdFilhos' value='" + qtdFilhos + "'></li>" +
			"<li title='idLinhaFilho"+ qtdFilhos +"' value='" + idLinha + "'></li>" +
			"<li title='idConceitoFilho"+ qtdFilhos +"' value='" + idConceito + "'></li>"
		;
		
		return mensagem;
	}
	
	
	/**
	 * Inseri o id da Ligacao como um atributo dos conceitos ligados por ela
	 */
	this.inserirLigacaoAosConceitos = function(origem, idConceitos, idLigacao){
		var atributo;
		
		for(var i=0;idConceitos[i] != undefined;i++){
			atributo = document.createElement("li");
			atributo.title = "idLigacao";
			atributo.value = idLigacao;
			$('ul#' + idConceitos[i]).append(atributo);
			atributo = "";
		}
	};
	
	
	
	
	var montarMensagemAoMoverConceito = function (idConceito, idMapa, novoX, novoY){
		var mensagem = 
			"<2ul id='" + idConceito + "' title='conceito'>" + 
				"<li title='x' value='" + novoX + "'></li>" +
				"<li title='y' value='" + novoY + "'></li>" +
				"<li title='idMapa'>" + idMapa + "</li>"
			;
		return mensagem;
	};
	
	var montarMensagemAoMoverLigacao = function(idLigacao, idMapa, novoX, novoY){
		var mensagem = 
			"<4ul id='" + idLigacao + "' title='ligacao'>" + 
				"<li title='x' value='" + novoX + "'></li>" +
				"<li title='y' value='" + novoY + "'></li>" +
				"<li title='idMapa'>" + idMapa + "</li>"
		;
		return mensagem;
	};
	
	this.atualizarConceitoNaListaAoMoverConceito = function(origem,idConceito, idMapa, novoX, novoY){
		$('ul#' + idConceito).children("li[title='x']").val(novoX);
		$('ul#' + idConceito).children("li[title='y']").val(novoY);
		
		if(origem==0){ //atualizacao local
			var msg = montarMensagemAoMoverConceito(idConceito, idMapa, novoX, novoY);
			mapaConceitual.usuarioAtual.enviarMensagemAoServidor(msg);
		}
	};
	
	this.atualizarLigacaoNaListaAoMoverLigacao = function(origem,idLigacao, idMapa, novoX, novoY){
		$('ul#' + idLigacao).children("li[title='x']").val(novoX);
		$('ul#' + idLigacao).children("li[title='y']").val(novoY);
		
		if(origem==0){ //atualizacao local
			var msg = montarMensagemAoMoverLigacao(idLigacao, idMapa, novoX, novoY);
			mapaConceitual.usuarioAtual.enviarMensagemAoServidor(msg);
		}
		
	};
	
	
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



function HandTool(stage, mapa){
	
	var handTool = this;
	
	var stageCanvas = stage;
	
	var mapaConceitual = mapa;
	
	var posicaoAntiga = new Object();
	
    
	var retangulo = new createjs.Shape();
	retangulo.name = "retanguloHandTool";
	var hit = new createjs.Shape();
	
	
	retangulo.addEventListener("pressmove", function(evt) {
		posicaoAntiga = moverCanvas(evt, posicaoAntiga.x, posicaoAntiga.y);
	});
	
	retangulo.addEventListener("pressup", function(evt) {
		posicaoAntiga.x = undefined;
		posicaoAntiga.y = undefined;
		
		var canvasWidth = parseFloat( stage.canvas.getAttribute('width') );
    	var canvasHeight = parseFloat( stage.canvas.getAttribute('height') );
    	handTool.desenharRetangulo(0 - stage.x, 0 - stage.y, canvasHeight, canvasWidth);
	});
	
    /**
     * desenha e adiciona ao stageCanvas
     */
     this.desenharRetangulo = function(x,y, altura, largura){
    	retangulo.graphics.clear();
		retangulo.graphics.beginFill().drawRect(x,
					y, largura, altura);
		hit.graphics.beginFill("#000").rect(x,
				y, largura, altura);
		retangulo.hitArea = hit;
		
		stageCanvas.addChild(retangulo);
		
		mapaConceitual.renderizar();	
    };

    /**
     * remove o retanguloHandTool do stageCanvas e manda atualizar a tela
     */
    this.destruirRetangulo = function() {
    	var retanguloID = stageCanvas.getChildIndex(retangulo);
    	stageCanvas.removeChildAt(retanguloID);
    	mapaConceitual.renderizar();
    };
    
    /**
     * movimenta o stageCanvas com base no movimento de arrasto sobre o retangulo ja definido
     */
    var moverCanvas = function(evt, x, y){
    	var novaPosicaoAntiga = Object();
    	novaPosicaoAntiga.x = x;
    	novaPosicaoAntiga.y = y;
    	
    	if(!novaPosicaoAntiga.x && !novaPosicaoAntiga.y){
    		novaPosicaoAntiga.x = evt.stageX;
    		novaPosicaoAntiga.y = evt.stageY;
    		return novaPosicaoAntiga;
    	}

    	if(novaPosicaoAntiga.x && !novaPosicaoAntiga.y){
    		
    		novaPosicaoAntiga.y = evt.stageY;
    		
    		if (novaPosicaoAntiga.x < evt.stageX) {
    			stageCanvas.setTransform(stageCanvas.x + (evt.stageX - novaPosicaoAntiga.x) );
    			mapaConceitual.renderizar();
    			novaPosicaoAntiga.x = evt.stageX;
    			return novaPosicaoAntiga;
    		}
    		if (novaPosicaoAntiga.x > evt.stageX) {
    			stageCanvas.setTransform(stageCanvas.x - (novaPosicaoAntiga.x-evt.stageX));
    			mapaConceitual.renderizar();
    			novaPosicaoAntiga.x = evt.stageX;
    			return novaPosicaoAntiga;
    		}
    		
    		return novaPosicaoAntiga; //se X for igual a evt.stageX
    	}
    	
        if(!novaPosicaoAntiga.x && novaPosicaoAntiga.y){
    		
    		novaPosicaoAntiga.x = evt.stageX;
    		
    		if (novaPosicaoAntiga.y < evt.stageY) {
    			stageCanvas.setTransform(novaPosicaoAntiga.x,stageCanvas.y - (evt.stageY - novaPosicaoAntiga.y) );
    			mapaConceitual.renderizar();
    			novaPosicaoAntiga.y = evt.stageY;
    			return novaPosicaoAntiga;
    		}
    		if (novaPosicaoAntiga.y > evt.stageY) {
    			stageCanvas.setTransform(novaPosicaoAntiga.x, stageCanvas.y + (novaPosicaoAntiga.y - evt.stageY));
    			mapaConceitual.renderizar();
    			novaPosicaoAntiga.y = evt.stageY;
    			return novaPosicaoAntiga;
    		}
    		return novaPosicaoAntiga; //se X for igual a evt.stageX
    	}

    		if(novaPosicaoAntiga.x && novaPosicaoAntiga.y){
    		
    		if (novaPosicaoAntiga.y < evt.stageY && novaPosicaoAntiga.x < evt.stageX){ //para baixo e para a direita
    			stageCanvas.setTransform(stageCanvas.x + (evt.stageX - novaPosicaoAntiga.x),
    					stageCanvas.y - (evt.stageY - novaPosicaoAntiga.y));
    			mapaConceitual.renderizar();
    			
    			novaPosicaoAntiga.x = evt.stageX;
    			novaPosicaoAntiga.y = evt.stageY;
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y > evt.stageY && novaPosicaoAntiga.x > evt.stageX) { //para cima e para a esquerda
    			stageCanvas.setTransform(stageCanvas.x - (novaPosicaoAntiga.x-evt.stageX),
    					stageCanvas.y + (novaPosicaoAntiga.y - evt.stageY));
    			mapaConceitual.renderizar();
    			
    			novaPosicaoAntiga.y = evt.stageY;
    			novaPosicaoAntiga.x = evt.stageX;
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y < evt.stageY && novaPosicaoAntiga.x > evt.stageX) { //para baixo e para a esquerda
    			stageCanvas.setTransform(stageCanvas.x - (novaPosicaoAntiga.x-evt.stageX),
    					stageCanvas.y - (evt.stageY - novaPosicaoAntiga.y));
    			mapaConceitual.renderizar();
    			
    			novaPosicaoAntiga.y = evt.stageY;
    			novaPosicaoAntiga.x = evt.stageX;
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y > evt.stageY && novaPosicaoAntiga.x < evt.stageX) { //para cima e para a direita
    			stageCanvas.setTransform(stageCanvas.x + (evt.stageX - novaPosicaoAntiga.x),
    					stageCanvas.y + (novaPosicaoAntiga.y - evt.stageY));
    			mapaConceitual.renderizar();
    			
    			novaPosicaoAntiga.y = evt.stageY;
    			novaPosicaoAntiga.x = evt.stageX;
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y == evt.stageY && novaPosicaoAntiga.x < evt.stageX) { //para a direita
    			stageCanvas.setTransform(stageCanvas.x + (evt.stageX - novaPosicaoAntiga.x),
    					stageCanvas.y + (novaPosicaoAntiga.y - evt.stageY));
    			mapaConceitual.renderizar();
    			
    			
    			novaPosicaoAntiga.x = evt.stageX;
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y == evt.stageY && novaPosicaoAntiga.x > evt.stageX) { //para a esquerda
    			stageCanvas.setTransform(stageCanvas.x - (novaPosicaoAntiga.x-evt.stageX),
    					stageCanvas.y + (novaPosicaoAntiga.y - evt.stageY));
    			mapaConceitual.renderizar();
    			
    			
    			novaPosicaoAntiga.x = evt.stageX;
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y > evt.stageY && novaPosicaoAntiga.x == evt.stageX) { //para cima
    			stageCanvas.setTransform(stageCanvas.x + (evt.stageX - novaPosicaoAntiga.x),
    					stageCanvas.y + (novaPosicaoAntiga.y - evt.stageY));
    			mapaConceitual.renderizar();
    			
    			novaPosicaoAntiga.y = evt.stageY;
    			
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y < evt.stageY && novaPosicaoAntiga.x == evt.stageX) { //para baixo
    			stageCanvas.setTransform(stageCanvas.x - (novaPosicaoAntiga.x-evt.stageX),
    					stageCanvas.y - (evt.stageY - novaPosicaoAntiga.y));
    			mapaConceitual.renderizar();
    			
    			novaPosicaoAntiga.y = evt.stageY;
    			
    			
    			return novaPosicaoAntiga;
    		}
    		
    		return novaPosicaoAntiga; //se X for igual a evt.stageX
    	}
        
      return novaPosicaoAntiga;
    };
    
}


function MapaConceitual(id, usuario, lista){
	
    const listaElementos = lista;
    const gerenciadorLista = new GerenciadorLista(listaElementos,this);
    var idMapa = id;
    
    var idCanvas = "demoCanvas";
    var stageCanvas = new createjs.Stage(idCanvas);
    createjs.Touch.enable(stageCanvas);
    this.usuarioAtual = usuario;
    var handTool = new HandTool(stageCanvas, this);
    this.conceitosSelecionados = new Array();
    this.ligacaoSelecionada;
    var mapa = this;
    var criarLigacao;
    
    /**
     * ativa botao de criar ligacao ao selecionar conceito ou palavraLigacao
     */
    this.ativarCriarLigacao = function(){
    	;
    };

    /**
     * ativa funcao hand, redesenhando o retangulo para percorrer o mapa
     * adicionarStageMouseMove so e necessaria pois a funcao removeEventListener so funciona quando o handler e o mesmo do addEventListener
     */
    
    var ativarHandTool = function() {
    	var canvasWidth = parseFloat( stageCanvas.canvas.getAttribute('width') );
    	var canvasHeight = parseFloat( stageCanvas.canvas.getAttribute('height') );
    	handTool.desenharRetangulo(0 - stageCanvas.x, 0 - stageCanvas.y, canvasHeight, canvasWidth);
    };

    /**
     * 
     */
    var checarPermissao = function(){;};

    /**
     * 
     */
    this.desabilitarBotaoNovaLigacao = function(){
    	$("#novaLigacao").hide();
    };
    
    this.desabilitarBotaoExcluir = function(){
    	$("#excluir").hide();
    };

    /**
     * remove o evento do movimento do mouse sobre o stageCanvas e pede para destruir o retangulo da handTool.
     */
    var desativarHandTool = function() {
    	handTool.destruirRetangulo();
    };
    
    /**
     * 
     */
    this.getGerenciadorLista = function(){
    	return gerenciadorLista;
    };
    
    this.getId = function(){
    	return idMapa;
    };
    
    
    this.getContainerViaId = function(id){
    	return stageCanvas.getChildAt(id);
    };
    

    /**
     * 
     */
    this.getStageCanvas = function(){
    	return stageCanvas;
    };
    
    /**
     * 
     */
    this.habilitarBotaoNovaLigacao = function(){
    	$("#novaLigacao").show();
    };
    
    this.habilitarBotaoExcluir = function(){
    	$("#excluir").show();
    };
    
    /**
     * preenche a div id lista com o que veio do servidor ou com null no caso de um novo mapa
     */
    var preencherLista = function(){
    	$("#lista").append(listaElementos);
    };
    
    /**
     * remover child desta forma impossibilita o uso da funcao getChildByName pois ela vasculha pela propriedade name, a qual apenas DisplayObjects possuem
     * Verificar nas futuras versoes da biblioteca, como sao implementadas as funcoes getChildIndex,getChildAt para ver se nao vasculham a propriedade id dos objetos do stage
     */
    this.removerFilho = function(stage,index){
    	if (index < 0 || index > stage.children.length-1) { return false; }
		var child = stage.children[index];
		if (child) { child.parent = null; }
		stage.children[index] = new createjs.Container();
		return true;
    };
    
    
    /**
     * redesenha a tela
     */
    this.renderizar = function(){
    	stageCanvas.update();
    };
    
    /**
     * 
     */
    this.setCriarLigacao = function(valor){
    	criarLigacao = valor;
    };
    
    /**
     * 
     */
    this.verificarCriarLigacao = function(){
    	return criarLigacao;
    };
    
    
    this.setUsuario = function(usuario){
    	mapa.usuarioAtual = usuario;
    };
    
    
    /**
     * verificar se ha ligacao entre conceito e palavra de ligacao
     */
    function verificarLigacao(idConceito,idLigacao){    	
    	var listaIdLigacoes = $('ul#' + idConceito).children("li[title='idLigacao']");
    	var idLigacaoAux;
    	
    	for(var i=0; listaIdLigacoes.get(i) != undefined; i++){
    		 idLigacaoAux = listaIdLigacoes.get(i).value;
    		 if(idLigacaoAux == idLigacao) return true;
    		 
    	}
    	return false;	
    }
    
    
    /**
     * quando usuario clica no handButton, chama ativarHandTool
    */
    if($("#handButton")){
    	$("#handButton").click(ativarHandTool);
    }
    
    /**
     * quando usuario clica no editarButton, chama desativarHandTool
    */
    if($("#editarButton")){
    	$("#editarButton").click(desativarHandTool);
    }
    
    /**
     * quando usuario clica no novaLigacao, muda criarLigacao para true
    */
    if($("#novaLigacao")){ 
    	
    	$("#novaLigacao").on('click', function (){
    		mapa.setCriarLigacao(true);
    	});
    	
    }
    
    /**
     * quando usuario clica no criarConceitoButton, chama usuario.criarConceito
    
    if($("#criarConceitoButton")){ 
    	
    	$("#criarConceitoButton").click(function (){
    				new InterfaceCriarConceito(mapa.usuarioAtual, mapa);
    				$("#abrirModal").click();
    			}
    	);
    }
    */
    
    if($("#excluir")){ 
    	
    	$("#excluir").click(function (){
    		mapa.usuarioAtual.excluir(0, mapa.conceitosSelecionados[0]);
    			
    	});
    }
    
    
    
    
    stageCanvas.on("stagemousedown", function tratarClickStage(evt) {
    	var x = evt.stageX - stageCanvas.x;
		var y = evt.stageY - stageCanvas.y;
    	var objetoSelecionado = stageCanvas.getObjectUnderPoint(x,y); //se clicar no canvas vazio retorna null para objetoSelecionado
		
		mapa.usuarioAtual.desselecionar(mapa);
		
		if(objetoSelecionado){
			if(objetoSelecionado.parent.name == "conceito"){
				if(mapa.conceitosSelecionados[0] == undefined){
					mapa.usuarioAtual.selecionarConceito(objetoSelecionado, mapa);
				}
				else{
					if( mapa.verificarCriarLigacao() ){
						var idConceitoClicado = stageCanvas.getChildIndex(objetoSelecionado.parent);
						if( idConceitoClicado != mapa.conceitosSelecionados[0]){ //para impedir a auto-relacao
							var objeto0 = mapa.getContainerViaId(mapa.conceitosSelecionados[0]);
							mapa.conceitosSelecionados[1] = idConceitoClicado;
							//verificar o que eh o conceito selecionado 0
							if(objeto0.name == "conceito"){
								$('#interfaceCriarLigacao').modal('show');
							}
							else{ // eh ligacao
								//verificar se jah nao estao ligados
								if(!verificarLigacao(mapa.conceitosSelecionados[1], mapa.conceitosSelecionados[0])){ //se nao estiverem
									mapa.usuarioAtual.criarSemiLigacao(0, mapa, mapa.conceitosSelecionados[1], mapa.conceitosSelecionados[0],null,null);
								}
								else{
									mapa.setCriarLigacao(false);
								}
							}
						}
						else{
							mapa.setCriarLigacao(false);
						}
					}
				}
			}
			if(objetoSelecionado.parent.name == "ligacao"){
				if(mapa.conceitosSelecionados[0] == undefined){
					mapa.usuarioAtual.selecionarLigacao(objetoSelecionado, mapa);
				}
				else{
					
					if(mapa.verificarCriarLigacao()){
						var objeto0 = mapa.getContainerViaId(mapa.conceitosSelecionados[0]);
						mapa.conceitosSelecionados[1] = stageCanvas.getChildIndex(objetoSelecionado.parent);
						//verificar o que eh o conceito selecionado 0
						if(objeto0.name == "conceito" && !verificarLigacao(mapa.conceitosSelecionados[0], mapa.conceitosSelecionados[1])){
							mapa.usuarioAtual.criarSemiLigacao(0, mapa, mapa.conceitosSelecionados[0], mapa.conceitosSelecionados[1],null,null);
						}
						else{
							mapa.setCriarLigacao(false);
						}
					}
				}
			}
		}
		else{
			if(mapa.verificarCriarLigacao()) //se o usuario clicou no botao criar ligacao mas depois clicou no canvas
				mapa.setCriarLigacao(false);
		}
		
    });
    
    
    criarLigacao = false;
    
    /**
     * preenche a div lista 
    */
    preencherLista();
    
}

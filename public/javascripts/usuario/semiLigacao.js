function SemiLigacao(origem, mapaConceitual, idConceitoP, idLigacaoP){
    var linhaContainer;
    var graphic;
    var idConceito;
    var idLigacao;
    var espessuraLinha;
    var corLinha;
    var semiLigacao;
    
    var coordenadasPontaConceito = new Object();
	var coordenadasPontaLigacao = new Object(); 
    
    /**
     * 
     */
    this.desenharSemiLigacao = function() {
    	var posicaoLigacaoX;
    	var posicaoLigacaoY;
    	var conceito;
    	var conceitoContainer;
    	var ligacao;
    	var ligacaoContainer;
    	
    	
    	conceito = new Conceito();
    	conceitoContainer= conceito.getConceitoContainerViaId(idConceito, mapaConceitual);
    	
    	ligacao = new Ligacao();
    	ligacaoContainer = ligacao.getLigacaoContainerViaId(idLigacao, mapaConceitual);
    	
    	
    	// ATENCAO: conceito.x retorna string e nao number como consta na documentacao da easeljs
    	
    	desenharLinha(ligacaoContainer, conceitoContainer);
    	mapaConceitual.renderizar();
    };

    
    /**
     * 
     */
     function desenharLinha(ligacaoContainer, conceitoContainer) {
    	var coordenadasLinha;
    	
    	//desenhando linha
    	coordenadasLinha = calcularNovaPonta(conceitoContainer,ligacaoContainer);
    	
    	coordenadasPontaConceito = coordenadasLinha.conceito;
    	coordenadasPontaLigacao = coordenadasLinha.ligacao;
    	
    	graphic.moveTo(coordenadasLinha.conceito.x,coordenadasLinha.conceito.y);
    	graphic.lineTo(coordenadasLinha.ligacao.x,coordenadasLinha.ligacao.y);
    	linhaContainer.graphics = graphic;
    	mapaConceitual.getStageCanvas().addChild(linhaContainer);
    	
    };
    
    /**
     * calcula os novos pontos de interconexao entre conceitos e palavras de ligacao conectados
     */
    
    function calcularNovaPonta(conceitoContainer, ligacaoContainer){
    	var coordenadas = new Coordenadas(new Array(),new Array());
    	var coordenadasFinais = new Coordenadas(new Object(),new Object());
    	var conceitoX = parseFloat(conceitoContainer.x);
    	var conceitoY = parseFloat(conceitoContainer.y);
    	var ligacaoX = parseFloat(ligacaoContainer.x);
    	var ligacaoY = parseFloat(ligacaoContainer.y);
    	
    	for(var i=0;i<8;i++){
    		coordenadas.conceito[i] = new Object();
    		coordenadas.ligacao[i] = new Object();
    	}
    	
    	//para o conceito
    	coordenadas.conceito[0].x = conceitoX;
    	coordenadas.conceito[0].y = conceitoY;
    	
    	coordenadas.conceito[1].x = conceitoX + 50;
    	coordenadas.conceito[1].y = conceitoY;
    	
    	coordenadas.conceito[2].x = conceitoX + 100;
    	coordenadas.conceito[2].y = conceitoY;
    	
    	coordenadas.conceito[3].x = conceitoX + 100;
    	coordenadas.conceito[3].y = conceitoY + 25;
    	
    	coordenadas.conceito[4].x = conceitoX + 100;
    	coordenadas.conceito[4].y = conceitoY + 50;
    	
    	coordenadas.conceito[5].x = conceitoX + 50;
    	coordenadas.conceito[5].y = conceitoY + 50;
    	
    	coordenadas.conceito[6].x = conceitoX;
    	coordenadas.conceito[6].y = conceitoY + 50;
    	
    	coordenadas.conceito[7].x = conceitoX;
    	coordenadas.conceito[7].y = conceitoY + 25;
    	
    	//para a ligacao
    	coordenadas.ligacao[0].x = ligacaoX;
    	coordenadas.ligacao[0].y = ligacaoY;
    	
    	coordenadas.ligacao[1].x = ligacaoX + 40;
    	coordenadas.ligacao[1].y = ligacaoY;
    	
    	coordenadas.ligacao[2].x = ligacaoX + 80;
    	coordenadas.ligacao[2].y = ligacaoY;
    	
    	coordenadas.ligacao[3].x = ligacaoX + 80;
    	coordenadas.ligacao[3].y = ligacaoY + 15;
    	
    	coordenadas.ligacao[4].x = ligacaoX + 80;
    	coordenadas.ligacao[4].y = ligacaoY + 30;
    	
    	coordenadas.ligacao[5].x = ligacaoX + 40;
    	coordenadas.ligacao[5].y = ligacaoY + 30;
    	
    	coordenadas.ligacao[6].x = ligacaoX;
    	coordenadas.ligacao[6].y = ligacaoY + 30;
    	
    	coordenadas.ligacao[7].x = ligacaoX;
    	coordenadas.ligacao[7].y = ligacaoY + 15;
    	
    	
    	if(ligacaoY >= coordenadas.conceito[6].y){ //pontaLigacao[1] � pontaConceito[5]
    		
    		coordenadasFinais.conceito.x = coordenadas.conceito[5].x;
    		coordenadasFinais.conceito.y = coordenadas.conceito[5].y;
    		coordenadasFinais.ligacao.x = coordenadas.ligacao[1].x;
    		coordenadasFinais.ligacao.y = coordenadas.ligacao[1].y;
    		return coordenadasFinais;
    	}
    	if(ligacaoY < coordenadas.conceito[6].y && coordenadas.ligacao[4].x <= conceitoX){ //pontaLigacao[3] � pontaConceito[7]
    		
    		coordenadasFinais.conceito.x = coordenadas.conceito[7].x;
    		coordenadasFinais.conceito.y = coordenadas.conceito[7].y;
    		coordenadasFinais.ligacao.x = coordenadas.ligacao[3].x;
    		coordenadasFinais.ligacao.y = coordenadas.ligacao[3].y;
    		return coordenadasFinais;
    	}
    	if(coordenadas.ligacao[5].y <= conceitoY){ //pontaLigacao[5] � pontaConceito[1]
    		
    		coordenadasFinais.conceito.x = coordenadas.conceito[1].x;
    		coordenadasFinais.conceito.y = coordenadas.conceito[1].y;
    		coordenadasFinais.ligacao.x = coordenadas.ligacao[5].x;
    		coordenadasFinais.ligacao.y = coordenadas.ligacao[5].y;
    		return coordenadasFinais;
    	}
    	if(coordenadas.ligacao[6].y > conceitoY && coordenadas.ligacao[4].x >= conceitoX){ //pontaLigacao[3] � pontaConceito[7]
    		
    		coordenadasFinais.conceito.x = coordenadas.conceito[3].x;
    		coordenadasFinais.conceito.y = coordenadas.conceito[3].y;
    		coordenadasFinais.ligacao.x = coordenadas.ligacao[7].x;
    		coordenadasFinais.ligacao.y = coordenadas.ligacao[7].y;
    		return coordenadasFinais;
    	}	
    }
    
    
    this.getIdConceito = function(){
    	return idConceito
    };
    
    this.getIdLigacao = function(){
    	return idLigacao;
    };
    
    this.getIdLinha = function(){
    	return mapaConceitual.getStageCanvas().getChildIndex(linhaContainer);
    }
    
    
    this.getCoordenadasPontaConceito = function(){
    	return coordenadasPontaConceito;
    };
    
    this.getCoordenadasPontaLigacao = function(){
    	return coordenadasPontaLigacao;
    };
    
    this.getLinhaContainer = function(){
        return linhaContainer;
    };
    
    
    this.setId = function(objetoContainer,novoId) {
    	var stage = mapaConceitual.getStageCanvas();
    	
    	//kids sao os elementos do stageCanvas
    	var kids = stage.children, l = kids.length;
		if (objetoContainer.parent != stage || novoId < 0) { return; }
		
		//procura conceitoContainer ate o fim de kids
		for (var i=0;i<l;i++) {
			if (kids[i] == objetoContainer) { break; }
		}
		
		//se nao achou ou se o novo id for igual ao velho retorna sem nada fazer
		if (i==l || i == novoId) { return; }
		
		//se a posicao de conceitoContainer em kids for maior que a nova posicao
		//necessario preencher com um container vazio para a funcao update nao dar erro
		if(i < novoId){
			for(var j = i; j <= novoId; j++){
				if(!kids[j]){
					kids[j] = new createjs.Container();
				}
			}
		}
		else{ //se a posicao de conceitoContainer em kids for menor que a nova posicao
			for(var j=i; j >= novoId; j--){
				if(!kids[j])
					kids[j] = new createjs.Container();
			}
		}
		
		kids[i] = kids[novoId];
		kids[novoId] = objetoContainer;
    	
    };
    
    semiLigacao = this;
    
    idConceito = idConceitoP;
    idLigacao = idLigacaoP; 
	
	linhaContainer = new createjs.Shape(); 
	
	graphic = new createjs.Graphics(); //define as propriedades graficas da linha
	
	espessuraLinha = 2;
	corLinha = "#000";
	
	graphic.setStrokeStyle(espessuraLinha,"round").beginStroke(corLinha);
}
function GerenciadorConceito(){
	
    var gerenciadorConceito = this;
    var paddingH = 12;
	var paddingW = 12; 
	var espessuraRetanguloSelecao = 3;
	var corRetanguloSelecao = "#F00";
	var alturaQuadradoTamanho = 40;
    
    /**
     * 
     */
    this.adicionarDragDrop = function(idMapa,conceitoContainer, stageCanvas, getConceitoLista, getLigacaoLista, getCorFundo, getAlturaMinima, getLarguraMinima, atualizarLigacoesAoMoverConceito, removerFilhoStageCanvas, renderizarMapa, montarMensagemAoMoverConceito, montarMensagemAoAlterarTamanhoConceito, enviarMensagemAoServidor){

    	conceitoContainer.addEventListener("pressmove", function(evt){
    		var altura;
        	var largura;
    		
    		altura = gerenciadorConceito.getAltura(conceitoContainer);
    		largura = gerenciadorConceito.getLargura(conceitoContainer);
    		
    		if(evt.target.name != "quadradoTamanho"){ // movimentando o retangulo selecao
    			
    			if(stageCanvas.getChildByName("retanguloSelecaoMV") == null){ // MV de movimentacao
        			var retangulo = new createjs.Shape();
            		retangulo.name = "retanguloSelecaoMV";
            		var hit = new createjs.Shape();
            		
            		retangulo.graphics.setStrokeStyle(espessuraRetanguloSelecao,"round").beginStroke(corRetanguloSelecao).beginFill().drawRoundRect( //adiciona na posicao zero,zero
            				0,0,largura,altura,3);
            		hit.graphics.beginFill("#000").rect(0,
            				0, largura - (2 * espessuraRetanguloSelecao), altura - (2 * espessuraRetanguloSelecao));
            		retangulo.hitArea = hit;
            		retangulo.setBounds(0,0,largura,altura);
            		
            		stageCanvas.addChild(retangulo);
            		retangulo.x = conceitoContainer.x;
            		retangulo.y = conceitoContainer.y;
        		}
        		
        		else{
        			var retangulo = stageCanvas.getChildByName("retanguloSelecaoMV"); 
        			retangulo.x = (evt.stageX - (largura/2) - stageCanvas.x);
        			retangulo.y = (evt.stageY - (altura/2) - stageCanvas.y);
        		}
    			
    		}
    		else{ //alterando o tamanho do retangulo selecao
    			var novaAltura;
    			var novaLargura;
    			var deslocamentoX;
    			var deslocamentoY;
    			
    			if(stageCanvas.getChildByName("retanguloSelecaoAT") == null){ //AT de alterarTamanho
        			var retangulo = new createjs.Shape();
            		retangulo.name = "retanguloSelecaoAT";
            		var hit = new createjs.Shape();
            		
            		retangulo.graphics.setStrokeStyle(espessuraRetanguloSelecao,"round").beginStroke(corRetanguloSelecao).beginFill().drawRoundRect( //adiciona na posicao zero,zero
            				0,0,largura,altura,3);
            		hit.graphics.beginFill("#000").rect(0,
            				0, largura - (2 * espessuraRetanguloSelecao), altura - (2 * espessuraRetanguloSelecao));
            		retangulo.hitArea = hit;
            		retangulo.setBounds(0,0,largura,altura);
            		
            		stageCanvas.addChild(retangulo);
            		retangulo.x = conceitoContainer.x;
            		retangulo.y = conceitoContainer.y;
        		}
    			else{
    				var retanguloSelecao = stageCanvas.getChildByName("retanguloSelecaoAT"); 
    				
    				if ( (conceitoContainer.x + largura) <= (evt.stageX - stageCanvas.x)) {
        				deslocamentoX = (evt.stageX - stageCanvas.x) - (conceitoContainer.x + largura);
        				novaLargura = largura + deslocamentoX;
            		}
        			else{
        				deslocamentoX = (conceitoContainer.x + largura) - (evt.stageX - stageCanvas.x);
        				novaLargura = largura - deslocamentoX;
        			}
        			
            		if ( (conceitoContainer.y + altura) <= (evt.stageY - stageCanvas.y)) {
            			deslocamentoY = (evt.stageY - stageCanvas.y) - (conceitoContainer.y + altura);
        				novaAltura = altura + deslocamentoY;
        				
            		}
            		else{
            			deslocamentoY = (conceitoContainer.y + altura) - (evt.stageY - stageCanvas.y);
        				novaAltura = altura - deslocamentoY;
            		}
            		
            		if(novaAltura < 0 )
            			novaAltura = 0;
            		if(novaLargura < 0 )
            			novaLargura = 0;
            		redesenharRSAoAlterarTamanho(retanguloSelecao, novaAltura, novaLargura);	
    			}
    		}
    		
    	    renderizarMapa();
        });
    	
    	conceitoContainer.addEventListener("pressup", function conceitoPressUp(evt){
    		
    		var retanguloSelecaoAT;
    		var retanguloSelecaoMV;
    		
    		retanguloSelecaoAT = stageCanvas.getChildByName("retanguloSelecaoAT");
    		retanguloSelecaoMV = stageCanvas.getChildByName("retanguloSelecaoMV");
    		
    		if(retanguloSelecaoAT || retanguloSelecaoMV){ // necessario pois quando o usuario clica uma unica vez sem pressionar, tambem gera o pressup
    			
    			var conceitoNaLista;
    	    	var idConceito;
    	    	var msg;
        		var indexRetanguloSelecao;
        		
        		idConceito = gerenciadorConceito.getId(conceitoContainer, stageCanvas);
        		conceitoNaLista = getConceitoLista(idConceito);
        		
    			if(evt.target.name != "quadradoTamanho"){ //movimentando conceito
    				var novoX;
    				var novoY;
    				
    				indexRetanguloSelecao = stageCanvas.getChildIndex(retanguloSelecaoMV);
    				
	        		novoX = retanguloSelecaoMV.x;
	        		novoY = retanguloSelecaoMV.y;
	        		conceitoContainer.x = novoX;
	        		conceitoContainer.y = novoY;
	        		
	        		removerFilhoStageCanvas(stageCanvas, indexRetanguloSelecao);
	        		//atualizar as linhas de ligacao na tela
	        	    atualizarLigacoesAoMoverConceito(idConceito, conceitoContainer, conceitoNaLista, getLigacaoLista, stageCanvas);
	        	    renderizarMapa();
	        	    
	        	    msg = montarMensagemAoMoverConceito(idConceito, idMapa, novoX, novoY);
	    			enviarMensagemAoServidor(msg);
    			}
    			
    			else{ //alterando o tamanho do conceito
    				
    				var novaAltura;
        			var novaLargura;
        			var corFundo;
        			var alturaMin;
        			var larguraMin;
        			var label;
        			var propriedades;
    				
        			label = getLabel(conceitoContainer);
        			corFundo = getCorFundo(idConceito);
        			alturaMin = getAlturaMinima(idConceito);
        			larguraMin = getLarguraMinima(idConceito);
        			novaLargura = getLarguraRS(retanguloSelecaoAT);
        			novaAltura = getAlturaRS(retanguloSelecaoAT);
        			indexRetanguloSelecao = stageCanvas.getChildIndex(retanguloSelecaoAT);
        			removerFilhoStageCanvas(stageCanvas, indexRetanguloSelecao);
        			propriedades = new Object();
        			
        			if(alturaMin == 0){ //conceito ainda nao foi editado
        				alturaMin = label.getMeasuredHeight() + paddingH/2;
        				larguraMin = label.getMeasuredWidth() + paddingW/2;
        				
        				propriedades.alturaMinima = alturaMin;
        				propriedades.larguraMinima = larguraMin;
        			}
        			
    				if(novaLargura < larguraMin){
    					novaLargura = larguraMin;
	        		}
    				gerenciadorConceito.setLargura(conceitoContainer, novaLargura);
    				
            		if(novaAltura < alturaMin){
            			novaAltura = alturaMin;
            		}
            		gerenciadorConceito.setAltura(conceitoContainer, novaAltura);
            		
            		propriedades.idConceito = idConceito;
            		propriedades.corFundo = corFundo;
            		propriedades.altura = novaAltura;
            		propriedades.largura = novaLargura;
            		
            		gerenciadorConceito.redesenharConceitoAposEdicao(conceitoContainer, propriedades, stageCanvas, renderizarMapa);
					atualizarLigacoesAoMoverConceito(idConceito, conceitoContainer, conceitoNaLista, getLigacaoLista, stageCanvas);
					gerenciadorConceito.recentralizarLabel(conceitoContainer);
					gerenciadorConceito.selecionarConceito(label, corFundo, stageCanvas, renderizarMapa); // devo mandar a label devido a implementacao da funcao selecionar
					
					msg = montarMensagemAoAlterarTamanhoConceito(idMapa, propriedades);
					enviarMensagemAoServidor(msg);
    			}
    		}
    		
    	});
    	
    	
    };
    
    
    this.recentralizarLabel = function(conceitoContainer){
    	var alturaContainer;
    	var larguraContainer;
    	var label;
    	
    	label = getLabel(conceitoContainer);
    	alturaContainer = gerenciadorConceito.getAltura(conceitoContainer);
    	larguraContainer = gerenciadorConceito.getLargura(conceitoContainer);
    	
    	label.x = (larguraContainer/2);
    	label.y = (alturaContainer/2);
    };
    

    /**
     * 
     */
    this.desenharConceito = function( textoP, fonteP, tamanhoFonteP, corFonteP, corFundoP, xP, yP ) {

    	var label;
    	var retangulo;
    	var altura;
    	var largura;
    	var conceitoContainer;
    	var texto;
    	var fonte;
    	var tamanhoFonte;
    	var corFonte; 
    	var corFundo;
    	var x;
    	var y;
    	
    	texto = textoP;
    	fonte = fonteP;
    	tamanhoFonte = tamanhoFonteP;
    	corFonte = corFonteP; 
    	corFundo = corFundoP;
    	x = xP;
    	y = yP;
    	
    	conceitoContainer = new createjs.Container();
    	conceitoContainer.name = "conceito";
    	
        label = new createjs.Text(texto, tamanhoFonte + " " + fonte, corFonte);
        label.name = "label";
        label.textAlign = "center";
    	label.textBaseline = "middle";
    	altura = label.getMeasuredHeight() + paddingH;
    	largura = label.getMeasuredWidth() + paddingW;
    	label.x = (largura/2);
    	label.y = (altura/2);
    	
    	retangulo = new createjs.Shape();
    	retangulo.name = "retangulo";
    	retangulo.graphics.beginFill(corFundo).drawRoundRect( //adiciona na posicao zero,zero
    			0,0,largura,altura,3);
    	retangulo.setBounds(0,0,largura,altura);
    	
    	conceitoContainer.addChild(retangulo, label); //adiciona o retangulo e o label no container
    	
    	conceitoContainer.x -= x;
    	conceitoContainer.y -= y;
    	
    	return conceitoContainer;
    };
    
    
    this.redesenharConceitoAposDesselecao = function(idConceito, corFundo, stageCanvas) {
    	var conceitoContainer;
    	var altura;
    	var largura;
    	var rect;
		var qt; //quadrado tamanho
    	
		conceitoContainer = gerenciadorConceito.getConceitoContainerViaId(idConceito, stageCanvas);
		
		altura = gerenciadorConceito.getAltura(conceitoContainer);
    	largura = gerenciadorConceito.getLargura(conceitoContainer);
    	
		qt = getQuadradroTamanho(conceitoContainer, "quadradoTamanho");
		conceitoContainer.removeChild(qt);
    	
		rect = getRetangulo(conceitoContainer);
		rect.graphics.clear();
		rect.graphics.beginFill(corFundo).drawRoundRect( //adiciona na posicao zero,zero
				0,0,largura,altura,3);
    };
    
    
    this.selecionarConceito = function(objetoSelecionadoP, corFundo, stageCanvas, renderizarMapa) { //objetoSelecionado pode ser o retangulo ou label
    	
    	var objetoSelecionado; //pode ser label ou rect
    	var altura;
    	var largura;
    	var rect;
    	var qt; //quadrado Tamanho
    	
    	objetoSelecionado = objetoSelecionadoP;
    	
    	altura = gerenciadorConceito.getAltura(objetoSelecionado.parent);
    	largura = gerenciadorConceito.getLargura(objetoSelecionado.parent);
    	
    	rect = getRetangulo(objetoSelecionado.parent);
		rect.graphics.clear();
		rect.graphics.setStrokeStyle(espessuraRetanguloSelecao,"round").beginStroke(corRetanguloSelecao).beginFill(corFundo).drawRoundRect( //adiciona na posicao zero,zero
				0,0,largura,altura,3);
		
		qt = new createjs.Shape();
		qt.graphics.beginFill(corRetanguloSelecao).drawRoundRect(
    			0,0,alturaQuadradoTamanho, alturaQuadradoTamanho,0);
		qt.name = "quadradoTamanho";
		objetoSelecionado.parent.addChild(qt);
		qt.x = largura - alturaQuadradoTamanho/2;
		qt.y = altura - alturaQuadradoTamanho/2;
		
    	return renderizarMapa();
    };
    
    
    function getAlturaRS(retanguloSelecao){
    	return retanguloSelecao.getBounds().height;
    }
    
    function getLarguraRS(retanguloSelecao){
    	return retanguloSelecao.getBounds().width;
    }

    /**
     * 
     */
    this.getAltura = function getAltura(conceitoContainer) {
        var retangulo;
    	
        retangulo = getRetangulo(conceitoContainer);
        return retangulo.getBounds().height;
    };
    
    
    this.getAlturaMinima = function getAlturaMinima( conceitoContainer ){
    	var label;
    	var alturaMin;
    	
    	label = getLabel(conceitoContainer);
    	alturaMin = label.getMeasuredHeight() + paddingH/2;
    	return alturaMin;
    };
    
    this.getLarguraMinima = function getLarguraMinima( conceitoContainer ){
    	var label;
    	var larguraMin;
    	
    	label = getLabel(conceitoContainer);
    	larguraMin = label.getMeasuredWidth() + paddingW/2;
    	return larguraMin;
    };
    
    
    /**
     * 
     */
    this.getConceitoContainerViaId = function(idConceito,stageCanvas){
        var conceitoContainer = stageCanvas.getChildAt(idConceito);
    	return conceitoContainer;
    };
    
    
    /**
     * 
     */
    this.getCorFonte = function(){
        return corFonte;
    };
    
    /**
     * 
     */
    this.getCorFundo = function(){
        return corFundo;
    };
    
    /**
     * 
     */
    this.getCorFundoViaId = function(id){
        var cor = $('ul#' + id).children("li[title='corFundo']").text();
    	return cor;
    };
    
    /**
     * 
     */
    this.getFonte = function(){
    	return fonte;
    };
    
    /**
     * 
     */
    this.getId = function(conceitoContainer, stageCanvas){
    	return stageCanvas.getChildIndex(conceitoContainer);
    };

    /**
     * 
     */
    this.getLargura = function getLargura(conceitoContainer) {
    	var retangulo;
     	
        retangulo = getRetangulo(conceitoContainer);
        return retangulo.getBounds().width;
    	
    };

     
    /**
     * 
     */
    this.getTexto = function(conceitoContainer) {
    	return conceitoContainer.getChildByName("label").text;
    };
    
    /**
     * 
     */
    function getRetangulo(conceitoContainer) {
    	return conceitoContainer.getChildByName("retangulo");
    }
    
    /**
     * 
     */
    function getLabel(conceitoContainer) {
    	return conceitoContainer.getChildByName("label");
    }
    
    /**
     * 
     */
    function getQuadradroTamanho(conceitoContainer, nome) {
    	return conceitoContainer.getChildByName(nome);
    }
    
    
    /**
     * 
     */
    this.setX = function(idConceito, novoX, stageCanvas) {
    	var conceitoContainer;
    	conceitoContainer = gerenciadorConceito.getConceitoContainerViaId(idConceito, stageCanvas);
    	conceitoContainer.x = novoX;
    };
    
    
    /**
     * 
     */
    this.setY = function(idConceito, novoY, stageCanvas) {
    	var conceitoContainer;
    	conceitoContainer = gerenciadorConceito.getConceitoContainerViaId(idConceito, stageCanvas);
    	conceitoContainer.y = novoY;
    };
    
    
    this.setAltura = function(conceitoContainer, novaAltura){
    	var retangulo;
    	var largura;
    	
    	retangulo = getRetangulo(conceitoContainer);
    	largura = gerenciadorConceito.getLargura(conceitoContainer);
    	retangulo.setBounds(0,0,largura,novaAltura);
    };
    
    this.setLargura = function(conceitoContainer, novaLargura){
    	var retangulo;
    	var altura;
    	
    	retangulo = getRetangulo(conceitoContainer);
    	altura = gerenciadorConceito.getAltura(conceitoContainer);
    	retangulo.setBounds(0,0,novaLargura,altura);
    };
    
    function redesenharRSAoAlterarTamanho(retanguloSelecao, novaAltura, novaLargura){
    	var hit; 
    	
    	hit = new createjs.Shape();
    	retanguloSelecao.graphics.clear();
    	
    	
    	retanguloSelecao.setBounds(0,0,novaLargura,novaAltura);
    	
    	retanguloSelecao.graphics.setStrokeStyle(espessuraRetanguloSelecao,"round").beginStroke(corRetanguloSelecao).beginFill().drawRoundRect( //adiciona na posicao zero,zero
				0,0,novaLargura,novaAltura,3);
		hit.graphics.beginFill("#000").rect(0,
				0, novaLargura - (2 * espessuraRetanguloSelecao), novaAltura - (2 * espessuraRetanguloSelecao));
		retanguloSelecao.hitArea = hit;
    }

    this.redesenharConceitoAposEdicao = function(conceitoContainer, propriedades, stageCanvas, setAlturaMinimaNaLista, setLarguraMinimaNaLista, getAlturaMinimaNaLista, getLarguraMinimaNaLista, removerFilhoStageCanvas, renderizarMapa){
    	var rect;
    	var retanguloSelecao;
    	var label;
		
    	rect = getRetangulo(conceitoContainer);
    	label = getLabel(conceitoContainer);
    	
    	//necessario remover o retangulo selecao quando o qt e removido pois quem dispara o evento do retangulo selecao e o qt
    	//necessario nao remover o RS quando o usuario estiver movimentando o RS e chegar uma mensagem para atualizar o tamanho do conceito
		retanguloSelecao = stageCanvas.getChildByName("retanguloSelecaoAT");
    	
    	if(!propriedades.texto){ //se nao houver texto, altera-se apenas o tamanho

    		rect.graphics.clear();
			rect.graphics.beginFill(propriedades.corFundo).drawRoundRect( //adiciona na posicao zero,zero
					0,0,propriedades.largura, propriedades.altura, 3);
			qt = getQuadradroTamanho(conceitoContainer, "quadradoTamanho");
			conceitoContainer.removeChild(qt);
			
			if(retanguloSelecao){ //tem o retanguloSelecaoAT
				var indexRetanguloSelecao;
				indexRetanguloSelecao = stageCanvas.getChildIndex(retanguloSelecao);
				removerFilhoStageCanvas(stageCanvas, indexRetanguloSelecao);
			}
			else{
				retanguloSelecao = stageCanvas.getChildByName("retanguloSelecaoMV");
				if(retanguloSelecao){
					var novaAltura;
					var novaLargura;
					var antigaAltura;
					var antigaLargura;
					
					antigaAltura = getAlturaRS(retanguloSelecao);
					antigaLargura = getLarguraRS(retanguloSelecao);
					novaAltura = gerenciadorConceito.getAltura(conceitoContainer);
					novaLargura = gerenciadorConceito.getLargura(conceitoContainer);
					redesenharRSAoAlterarTamanho(retanguloSelecao, novaAltura,  novaLargura);
					retanguloSelecao.x = (retanguloSelecao.x - (novaLargura/2 - antigaLargura/2) - stageCanvas.x);
					retanguloSelecao.y = (retanguloSelecao.y - (novaAltura/2 - antigaAltura/2) - stageCanvas.y);
				}
			}
				
			
    		
		}
		else{ //caso tenha - altera-se a label
			
			if(propriedades.altura || propriedades.largura){ // veio do servidor
				
				gerenciadorConceito.setAltura(conceitoContainer, propriedades.altura);
				gerenciadorConceito.setLargura(conceitoContainer, propriedades.largura);
				
				label.color = propriedades.corFonte;
				label.text = propriedades.texto;
				label.font = propriedades.tamanhoFonte + " " + propriedades.fonte;
				gerenciadorConceito.recentralizarLabel(conceitoContainer);
				
				setAlturaMinimaNaLista(propriedades.idObjeto, propriedades.alturaMinima );
				setLarguraMinimaNaLista(propriedades.idObjeto, propriedades.larguraMinima );
				
				//alterando o retangulo
				rect.graphics.clear();
				rect.graphics.beginFill(propriedades.corFundo).drawRoundRect( //adiciona na posicao zero,zero
						0,0,propriedades.largura, propriedades.altura, 3);
				
				if(conceitoContainer.getChildByName("quadradoTamanho") != undefined){
					var qt = getQuadradroTamanho(conceitoContainer, "quadradoTamanho");
					conceitoContainer.removeChild(qt);
					
					if(retanguloSelecao){ //tem o retanguloSelecaoAT
						var indexRetanguloSelecao;
						indexRetanguloSelecao = stageCanvas.getChildIndex(retanguloSelecao);
						removerFilhoStageCanvas(stageCanvas, indexRetanguloSelecao);
					}
					else{
						retanguloSelecao = stageCanvas.getChildByName("retanguloSelecaoMV");
						if(retanguloSelecao){
							var novaAltura;
							var novaLargura;
							var antigaAltura;
							var antigaLargura;
							
							antigaAltura = getAlturaRS(retanguloSelecao);
							antigaLargura = getLarguraRS(retanguloSelecao);
							novaAltura = gerenciadorConceito.getAltura(conceitoContainer);
							novaLargura = gerenciadorConceito.getLargura(conceitoContainer);
							redesenharRSAoAlterarTamanho(retanguloSelecao, novaAltura,  novaLargura);
							retanguloSelecao.x = (retanguloSelecao.x - (novaLargura/2 - antigaLargura/2) - stageCanvas.x);
							retanguloSelecao.y = (retanguloSelecao.y - (novaAltura/2 - antigaAltura/2) - stageCanvas.y);
						}
					}
					
					gerenciadorConceito.selecionarConceito(label, propriedades.corFundo, stageCanvas,renderizarMapa);
				}	
				else{
					renderizarMapa();
				}
				
			}
			else{ //edicao local
				
				var alturaConceito;
				var larguraConceito;
				var alturaLabel;
				var larguraLabel;
				var labelAux;
				
				alturaConceito = gerenciadorConceito.getAltura(conceitoContainer);
				larguraConceito = gerenciadorConceito.getLargura(conceitoContainer);
				
				labelAux = new createjs.Text();
				labelAux.text = propriedades.texto;
				labelAux.font = propriedades.tamanhoFonte + " " + propriedades.fonte;
				alturaLabel = labelAux.getMeasuredHeight();
				larguraLabel = labelAux.getMeasuredWidth();
				
				if(alturaConceito < alturaLabel){
					alturaConceito =  alturaLabel + paddingH/2;
					gerenciadorConceito.setAltura(conceitoContainer, alturaConceito);
					
				}
				
				if(larguraConceito < larguraLabel){
					larguraConceito = larguraLabel + paddingW/2;
					gerenciadorConceito.setLargura(conceitoContainer, larguraConceito);
					
				}
				
				setAlturaMinimaNaLista(propriedades.idObjeto, (alturaLabel + paddingH/2) );
				setLarguraMinimaNaLista(propriedades.idObjeto, (larguraLabel + paddingW/2) );
				
				label.color = propriedades.corFonte;
				label.text = labelAux.text;
				label.font = labelAux.font;
				gerenciadorConceito.recentralizarLabel(conceitoContainer);
				
				//alterando o retangulo
				rect.graphics.clear();
				rect.graphics.beginFill(propriedades.corFundo).drawRoundRect( //adiciona na posicao zero,zero
						0,0,larguraConceito, alturaConceito, 3);
				
				if(conceitoContainer.getChildByName("quadradoTamanho") != undefined){
					var qt = getQuadradroTamanho(conceitoContainer, "quadradoTamanho");
					conceitoContainer.removeChild(qt);
					
					if(retanguloSelecao){ //tem o retanguloSelecaoAT
						var indexRetanguloSelecao;
						indexRetanguloSelecao = stageCanvas.getChildIndex(retanguloSelecao);
						removerFilhoStageCanvas(stageCanvas, indexRetanguloSelecao);
					}
					else{
						retanguloSelecao = stageCanvas.getChildByName("retanguloSelecaoMV");
						if(retanguloSelecao){
							var novaAltura;
							var novaLargura;
							var antigaAltura;
							var antigaLargura;
							
							antigaAltura = getAlturaRS(retanguloSelecao);
							antigaLargura = getLarguraRS(retanguloSelecao);
							novaAltura = gerenciadorConceito.getAltura(conceitoContainer);
							novaLargura = gerenciadorConceito.getLargura(conceitoContainer);
							redesenharRSAoAlterarTamanho(retanguloSelecao, novaAltura,  novaLargura);
							retanguloSelecao.x = (retanguloSelecao.x - (novaLargura/2 - antigaLargura/2) - stageCanvas.x);
							retanguloSelecao.y = (retanguloSelecao.y - (novaAltura/2 - antigaAltura/2) - stageCanvas.y);
						}
					}
					
					gerenciadorConceito.selecionarConceito(label, propriedades.corFundo, stageCanvas,renderizarMapa);
				}
					
				else{
					renderizarMapa();
				}	
			}
			
		}
    };
    
    
}
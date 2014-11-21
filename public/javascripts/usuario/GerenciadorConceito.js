function GerenciadorConceito(){
	
    var gerenciadorConceito = this;
    var paddingH = 12;
	var paddingW = 12; 
	var tamanhoQuadradoSelecao = 10;
	var corQuadradoSelecao = "#F00";
    
    /**
     * 
     */
    this.adicionarDragDrop = function(idMapa,conceitoContainer, stageCanvas, getConceitoLista, getLigacaoLista, getCorFundo, atualizarLigacoesAoMoverConceito, renderizarMapa, montarMensagemAoMoverConceito, montarMensagemAoAlterarTamanhoConceito, enviarMensagemAoServidor){
    	var altura;
    	var largura;
    	var novoX;
    	var novoY;
    	var conceitoNaLista;
    	var idConceito;
    	var msg;
    	
    	
    	conceitoContainer.addEventListener("pressmove", function(evt){
    		
    		idConceito = gerenciadorConceito.getId(conceitoContainer, stageCanvas);
    		altura = getAltura(conceitoContainer);
    		largura = getLargura(conceitoContainer);
    		conceitoNaLista = getConceitoLista(idConceito);
    		
    		if(evt.target.name != "qsTopLeft" && evt.target.name != "qsTopRigth" && evt.target.name != "qsBottomLeft" && evt.target.name != "qsBottomRigth"){
    			
    			
        		novoX = (evt.stageX - (largura/2) - stageCanvas.x); //a nova posicao do conceitoContainer eh a posicao do mouse para onde foi arrastado - o deslocamento do stageCanvas
        		novoY = (evt.stageY - (altura/2) - stageCanvas.y);
        	    
        		evt.currentTarget.x = novoX; 
        	    evt.currentTarget.y = novoY;
        	    
        	    //atualizar as linhas de ligacao na tela e atualiza na lista as coordenadas de ponta de ligacao
        	    atualizarLigacoesAoMoverConceito(idConceito, conceitoContainer, conceitoNaLista, getLigacaoLista, stageCanvas);
        	    
        	    
        	    msg = montarMensagemAoMoverConceito(idConceito, idMapa, novoX, novoY);
    			enviarMensagemAoServidor(msg);
    		}
    		else{
    			var novaAltura;
    			var novaLargura;
    			var deslocamentoX;
    			var deslocamentoY;
    			var corFundo;
    			var novoX;
    			var novoY;
    			var alturaMin;
    			var larguraMin;
    			var label;
    			var propriedades;
    			
    			label = getLabel(conceitoContainer);
    			corFundo = getCorFundo(idConceito);
    			alturaMin = label.getMeasuredHeight() + paddingH/2 + tamanhoQuadradoSelecao/4;
    			larguraMin = label.getMeasuredWidth() + paddingW/2 + tamanhoQuadradoSelecao/4;
    			
    			switch(evt.target.name){
    				case "qsTopLeft":
    	    			
    	    			if (conceitoContainer.x <= (evt.stageX - stageCanvas.x) ) {
    	    				deslocamentoX = conceitoContainer.x - (evt.stageX - stageCanvas.x);
    	    				novaLargura = largura + deslocamentoX;
    	    				novoX = (evt.stageX - stageCanvas.x);
    	        		}
    	    			else{
    	    				deslocamentoX = (evt.stageX - stageCanvas.x) - conceitoContainer.x;
    	    				novaLargura = largura - deslocamentoX;
    	    				novoX = (evt.stageX - stageCanvas.x);
    	    			}
    	    			
    	        		if (conceitoContainer.y <= (evt.stageY - stageCanvas.y)) {
    	        			deslocamentoY = (evt.stageY - stageCanvas.y) - conceitoContainer.y;
    	    				novaAltura = altura - deslocamentoY;
    	    				novoY = (evt.stageY - stageCanvas.y);
    	        		}
    	        		else{
    	        			deslocamentoY = conceitoContainer.y - (evt.stageY - stageCanvas.y);
    	    				novaAltura = altura + deslocamentoY;
    	    				novoY = (evt.stageY - stageCanvas.y);
    	        		}
    	        		
    	        		if(novaLargura > larguraMin){
    	        			gerenciadorConceito.setLargura(conceitoContainer, novaLargura);
    	        			gerenciadorConceito.setX(idConceito, novoX, stageCanvas);
    	        		}
    	        		else{
    	        			novaLargura = larguraMin;
    	        		}
	            		if(novaAltura > alturaMin){
	            			gerenciadorConceito.setAltura(conceitoContainer, novaAltura);
	            			gerenciadorConceito.setY(idConceito, novoY, stageCanvas);
	            		}
	            		else{
	            			novaAltura = alturaMin;
	            		}
	            		
	            		propriedades = {
	            			corFundo: corFundo,
	            			altura: novaAltura,
	            			largura: novaLargura
	            		};
	            		gerenciadorConceito.redesenharConceitoAposEdicao(conceitoContainer, propriedades, stageCanvas);
	    			
    				break;
    				
    				case "qsBottomLeft":
    					if (conceitoContainer.x <= (evt.stageX - stageCanvas.x)) {
    	    				deslocamentoX = (evt.stageX - stageCanvas.x) - conceitoContainer.x;
    	    				novaLargura = largura - deslocamentoX;
    	    				novoX = (evt.stageX - stageCanvas.x);
    	        		}
    	    			else{
    	    				deslocamentoX = conceitoContainer.x - (evt.stageX - stageCanvas.x);
    	    				novaLargura = largura + deslocamentoX;
    	    				novoX = (evt.stageX - stageCanvas.x);
    	    			}
    	    			
    	        		if ( (conceitoContainer.y + altura) <= (evt.stageY - stageCanvas.y)) {
    	        			deslocamentoY = (evt.stageY - stageCanvas.y) - (conceitoContainer.y + altura);
    	    				novaAltura = altura + deslocamentoY;
    	        		}
    	        		else{
    	        			deslocamentoY = (conceitoContainer.y + altura) - (evt.stageY - stageCanvas.y);
    	    				novaAltura = altura - deslocamentoY;
    	        		}
    	        		
    	        		if(novaLargura > larguraMin){
    	        			gerenciadorConceito.setLargura(conceitoContainer, novaLargura);
    	        			gerenciadorConceito.setX(idConceito, novoX, stageCanvas);
    	        		}
    	        		else{
    	        			novaLargura = larguraMin;
    	        		}
	            		if(novaAltura > alturaMin){
	            			gerenciadorConceito.setAltura(conceitoContainer, novaAltura);
	            		}
	            		else{
	            			novaAltura = alturaMin;
	            		}
	            		propriedades = {
		            		corFundo: corFundo,
		            		altura: novaAltura,
		            		largura: novaLargura
		            	};
	            		gerenciadorConceito.redesenharConceitoAposEdicao(conceitoContainer, propriedades, stageCanvas);
    				break;
    				
    				case "qsTopRigth":
    					if ( (conceitoContainer.x + largura) <= (evt.stageX - stageCanvas.x)) {
    	    				deslocamentoX = (evt.stageX - stageCanvas.x) - (conceitoContainer.x + largura);
    	    				novaLargura = largura + deslocamentoX;
    	        		}
    	    			else{
    	    				deslocamentoX = (conceitoContainer.x + largura) - (evt.stageX - stageCanvas.x);
    	    				novaLargura = largura - deslocamentoX;
    	    			}
    	    			
    	        		if (conceitoContainer.y <= (evt.stageY - stageCanvas.y)) {
    	        			deslocamentoY = (evt.stageY - stageCanvas.y) - conceitoContainer.y;
    	    				novaAltura = altura - deslocamentoY;
    	    				novoY = (evt.stageY - stageCanvas.y);
    	        		}
    	        		else{
    	        			deslocamentoY = conceitoContainer.y - (evt.stageY - stageCanvas.y);
    	    				novaAltura = altura + deslocamentoY;
    	    				novoY = (evt.stageY - stageCanvas.y);
    	        		}
    	        		
    	        		if(novaLargura > larguraMin){
    	        			gerenciadorConceito.setLargura(conceitoContainer, novaLargura);
    	        		}
    	        		else{
    	        			novaLargura = larguraMin;
    	        		}
	            		if(novaAltura > alturaMin){
	            			gerenciadorConceito.setAltura(conceitoContainer, novaAltura);
	            			gerenciadorConceito.setY(idConceito, novoY, stageCanvas);
	            		}
	            		else{
	            			novaAltura = alturaMin;
	            		}
	            		propriedades = {
		            			corFundo: corFundo,
		            			altura: novaAltura,
		            			largura: novaLargura
		            	};
	            		gerenciadorConceito.redesenharConceitoAposEdicao(conceitoContainer, propriedades, stageCanvas);
    				break;
    				
    				case "qsBottomRigth":
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
    	        		
    	        		if(novaLargura > larguraMin){
    	        			gerenciadorConceito.setLargura(conceitoContainer, novaLargura);
    	        			
    	        		}
    	        		else{
    	        			novaLargura = larguraMin;
    	        		}
	            		if(novaAltura > alturaMin){
	            			gerenciadorConceito.setAltura(conceitoContainer, novaAltura);
	            		
	            		}
	            		else{
	            			novaAltura = alturaMin;
	            		}
	            		propriedades = {
		            		corFundo: corFundo,
		            		altura: novaAltura,
		            		largura: novaLargura
		            	};
	            		gerenciadorConceito.redesenharConceitoAposEdicao(conceitoContainer, propriedades, stageCanvas);
    				break;
    			}
        		
    			atualizarLigacoesAoMoverConceito(idConceito, conceitoContainer, conceitoNaLista, getLigacaoLista, stageCanvas);
    			gerenciadorConceito.redesenharQuadradosSelecao(conceitoContainer);
    			gerenciadorConceito.recentralizarLabel(conceitoContainer);
    			
    			msg = montarMensagemAoAlterarTamanhoConceito(idMapa, idConceito, novaLargura, novaAltura, conceitoContainer.x, conceitoContainer.y);
    			enviarMensagemAoServidor(msg);
    		}

    	    renderizarMapa();
        });
    };
    
    
    this.recentralizarLabel = function(conceitoContainer){
    	var alturaContainer;
    	var larguraContainer;
    	var label;
    	
    	label = getLabel(conceitoContainer);
    	alturaContainer = getAltura(conceitoContainer);
    	larguraContainer = getLargura(conceitoContainer);
    	
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
		var qs;
		var nome;
		
		conceitoContainer = gerenciadorConceito.getConceitoContainerViaId(idConceito, stageCanvas);
		
		nome = "qsTopLeft";
		qs = getQuadradroSelecao(conceitoContainer, nome);
		conceitoContainer.removeChild(qs);
		
		nome = "qsTopRigth";
		qs = getQuadradroSelecao(conceitoContainer, nome);
		conceitoContainer.removeChild(qs);
		
		nome = "qsBottomLeft";
		qs = getQuadradroSelecao(conceitoContainer, nome);
		conceitoContainer.removeChild(qs);
		
		nome = "qsBottomRigth";
		qs = getQuadradroSelecao(conceitoContainer, nome);
		conceitoContainer.removeChild(qs);
    };
    
    
    this.selecionarConceito = function(objetoSelecionadoP, corFundo, renderizarMapa) { //objetoSelecionado pode ser o retangulo ou label
    	
    	var objetoSelecionado; //pode ser label ou rect
    	var altura;
    	var largura;
    	var quadradosSelecao;
    	
    	objetoSelecionado = objetoSelecionadoP;
    	
    	altura = getAltura(objetoSelecionado.parent);
    	largura = getLargura(objetoSelecionado.parent);
    	
    	
    	quadradosSelecao = {
    		topLeft: new createjs.Shape(),
    		topRigth: new createjs.Shape(),
    		bottomLeft: new createjs.Shape(),
    		bottomRigth: new createjs.Shape()
    	};
    	
    	quadradosSelecao.topLeft.graphics.beginFill(corQuadradoSelecao).drawRoundRect(
    			0,0,tamanhoQuadradoSelecao, tamanhoQuadradoSelecao,0);
    	quadradosSelecao.topRigth.graphics.beginFill(corQuadradoSelecao).drawRoundRect(
    			0,0,tamanhoQuadradoSelecao, tamanhoQuadradoSelecao,0);
    	quadradosSelecao.bottomLeft.graphics.beginFill(corQuadradoSelecao).drawRoundRect(
    			0,0,tamanhoQuadradoSelecao, tamanhoQuadradoSelecao,0);
    	quadradosSelecao.bottomRigth.graphics.beginFill(corQuadradoSelecao).drawRoundRect(
    			0,0,tamanhoQuadradoSelecao, tamanhoQuadradoSelecao,0);
    	
    	quadradosSelecao.topLeft.name = "qsTopLeft";
    	quadradosSelecao.topRigth.name = "qsTopRigth";
    	quadradosSelecao.bottomLeft.name = "qsBottomLeft";
    	quadradosSelecao.bottomRigth.name = "qsBottomRigth";
    	
    	
    	objetoSelecionado.parent.addChild(quadradosSelecao.topLeft);
    	objetoSelecionado.parent.addChild(quadradosSelecao.topRigth);
    	objetoSelecionado.parent.addChild(quadradosSelecao.bottomLeft);
    	objetoSelecionado.parent.addChild(quadradosSelecao.bottomRigth);
    	
    	quadradosSelecao.topLeft.x = 0 - tamanhoQuadradoSelecao/2;
    	quadradosSelecao.topLeft.y = 0 - tamanhoQuadradoSelecao/2;
    	
    	quadradosSelecao.topRigth.x = largura - tamanhoQuadradoSelecao/2;
    	quadradosSelecao.topRigth.y = 0 - tamanhoQuadradoSelecao/2;
    	
    	quadradosSelecao.bottomLeft.x = 0 - tamanhoQuadradoSelecao/2;
    	quadradosSelecao.bottomLeft.y = altura - tamanhoQuadradoSelecao/2;
    	
    	quadradosSelecao.bottomRigth.x = largura - tamanhoQuadradoSelecao/2;
    	quadradosSelecao.bottomRigth.y = altura - tamanhoQuadradoSelecao/2;
    	
    	return renderizarMapa();
    };
    
    this.redesenharQuadradosSelecao = function (conceitoContainer){
    	
    	var quadradosSelecao;
    	var altura;
    	var largura;
    	
    	altura = getAltura(conceitoContainer);
    	largura = getLargura(conceitoContainer);
    	
    	
    	quadradosSelecao = {
        		topLeft: getQuadradroSelecao(conceitoContainer, "qsTopLeft"),
        		topRigth: getQuadradroSelecao(conceitoContainer, "qsTopRigth"),
        		bottomLeft: getQuadradroSelecao(conceitoContainer, "qsBottomLeft"),
        		bottomRigth: getQuadradroSelecao(conceitoContainer, "qsBottomRigth")
        };
    	
    	quadradosSelecao.topLeft.graphics.clear();
    	quadradosSelecao.topRigth.graphics.clear();
    	quadradosSelecao.bottomLeft.graphics.clear();
    	quadradosSelecao.bottomRigth.graphics.clear();
    	
    	quadradosSelecao.topLeft.graphics.beginFill(corQuadradoSelecao).drawRoundRect(
    			0,0,tamanhoQuadradoSelecao, tamanhoQuadradoSelecao,0);
    	quadradosSelecao.topRigth.graphics.beginFill(corQuadradoSelecao).drawRoundRect(
    			0,0,tamanhoQuadradoSelecao, tamanhoQuadradoSelecao,0);
    	quadradosSelecao.bottomLeft.graphics.beginFill(corQuadradoSelecao).drawRoundRect(
    			0,0,tamanhoQuadradoSelecao, tamanhoQuadradoSelecao,0);
    	quadradosSelecao.bottomRigth.graphics.beginFill(corQuadradoSelecao).drawRoundRect(
    			0,0,tamanhoQuadradoSelecao, tamanhoQuadradoSelecao,0);
    	
    	quadradosSelecao.topLeft.x = 0 - tamanhoQuadradoSelecao/2;
    	quadradosSelecao.topLeft.y = 0 - tamanhoQuadradoSelecao/2;
    	
    	quadradosSelecao.topRigth.x = largura - tamanhoQuadradoSelecao/2;
    	quadradosSelecao.topRigth.y = 0 - tamanhoQuadradoSelecao/2;
    	
    	quadradosSelecao.bottomLeft.x = 0 - tamanhoQuadradoSelecao/2;
    	quadradosSelecao.bottomLeft.y = altura - tamanhoQuadradoSelecao/2;
    	
    	quadradosSelecao.bottomRigth.x = largura - tamanhoQuadradoSelecao/2;
    	quadradosSelecao.bottomRigth.y = altura - tamanhoQuadradoSelecao/2;
    };

    /**
     * 
     */
    function getAltura(conceitoContainer) {
        var retangulo;
    	
        retangulo = getRetangulo(conceitoContainer);
        return retangulo.getBounds().height;
    	//return conceitoContainer.getBounds().height;
    }

    /**
     * 
     */
    this.getConceitoContainer = function(){
        return conceitoContainer;
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
    function getLargura(conceitoContainer) {
    	var retangulo;
     	
        retangulo = getRetangulo(conceitoContainer);
        return retangulo.getBounds().width;
    	
    }

     
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
    function getQuadradroSelecao(conceitoContainer, nome) {
    	return conceitoContainer.getChildByName(nome);
    }
    
    /**
     * 
     */
    this.getTamanhoFonte = function() {
    	return tamanhoFonte;
    };
    
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
    	largura = getLargura(conceitoContainer);
    	retangulo.setBounds(0,0,largura,novaAltura);
    };
    
    this.setLargura = function(conceitoContainer, novaLargura){
    	var retangulo;
    	var altura;
    	
    	retangulo = getRetangulo(conceitoContainer);
    	altura = getAltura(conceitoContainer);
    	retangulo.setBounds(0,0,novaLargura,altura);
    };

    this.redesenharConceitoAposEdicao = function(conceitoContainer, propriedades, stageCanvas){
    	var rect;
    	
    	rect = getRetangulo(conceitoContainer);
    	label = getLabel(conceitoContainer);
    	
    	if(propriedades.altura){ //se tiver altura
	    	rect.graphics.clear();
			rect.graphics.beginFill(propriedades.corFundo).drawRoundRect( //adiciona na posicao zero,zero
					0,0,propriedades.largura, propriedades.altura, 3);
		}
		else{ //caso nao tenha altura - altera-se a label
			
			var alturaConceito;
			var larguraConceito;
			var alturaLabel;
			var larguraLabel;
			var labelAux;
			
			alturaConceito = getAltura(conceitoContainer);
			larguraConceito = getLargura(conceitoContainer);
			labelAux = new createjs.Text();
			
			
			//alterando a labelAux
			labelAux.text = propriedades.texto;
			labelAux.font = propriedades.tamanhoFonte + " " + propriedades.fonte;
			
			alturaLabel = labelAux.getMeasuredHeight();
			larguraLabel = labelAux.getMeasuredWidth();
			
			if(alturaConceito < alturaLabel){
				alturaConceito =  alturaLabel + paddingH;
				gerenciadorConceito.setAltura(conceitoContainer, alturaConceito);
			}
			
			if(larguraConceito < larguraLabel){
				larguraConceito = larguraLabel + paddingW;
				gerenciadorConceito.setLargura(conceitoContainer, larguraConceito);
			}
		
			label.color = propriedades.corFonte;
			label.text = labelAux.text;
			label.font = labelAux.font;
			gerenciadorConceito.recentralizarLabel(conceitoContainer);
			
			//alterando o retangulo
			rect.graphics.clear();
			rect.graphics.beginFill(propriedades.corFundo).drawRoundRect( //adiciona na posicao zero,zero
					0,0,larguraConceito, alturaConceito, 3);
			
			if(conceitoContainer.getChildByName("qsTopLeft") != undefined)
			gerenciadorConceito.redesenharQuadradosSelecao(conceitoContainer);
			
			
		}
    };
    
    
}
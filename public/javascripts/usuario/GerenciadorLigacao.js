function Coordenadas (conceito, ligacao){
    	this.conceito = conceito;
    	this.ligacao = ligacao;
}


function GerenciadorLigacao(origem, textoLigacao, fonteP, tamanhoFonteP, corFonteP, corFundoP, mapaConceitual, idConceitoPaiP, idConceitoFilhoP){
    var gerenciadorLigacao = this;
    var espessuraRetanguloSelecao = 3;
	var corRetanguloSelecao = "#F00";
	var alturaQuadradoTamanho = 40;
	
	
    /**
     * 
     */
    this.adicionarDragDrop = function(idMapa,ligacaoContainer, stageCanvas, getLigacaoLista, getCorFundo, getAlturaMinima, getLarguraMinima, removerFilhoStageCanvas, renderizarMapa, montarMensagemAoMoverLigacao, montarMensagemAoAlterarTamanhoLigacao, enviarMensagemAoServidor){
    	
    	var idLigacao;
    	idLigacao = gerenciadorLigacao.getId(ligacaoContainer, stageCanvas);
    	
    	ligacaoContainer.addEventListener("pressmove", function(evt){
    		
    		var altura;
        	var largura;
    		
    		altura = gerenciadorLigacao.getAltura(ligacaoContainer);
    		largura = gerenciadorLigacao.getLargura(ligacaoContainer);
    		
    		if(evt.target.name != "quadradoTamanho"){ // movimentando o retangulo selecao
    			
    			if(stageCanvas.getChildByName("retanguloSelecaoMV" + idLigacao) == null){ // MV de movimentacao
        			var retangulo = new createjs.Shape();
            		retangulo.name = "retanguloSelecaoMV" + idLigacao;
            		var hit = new createjs.Shape();
            		
            		retangulo.graphics.setStrokeStyle(espessuraRetanguloSelecao,"round").beginStroke(corRetanguloSelecao).beginFill().drawRoundRect( //adiciona na posicao zero,zero
            				0,0,largura,altura,3);
            		hit.graphics.beginFill("#000").rect(0,
            				0, largura - (2 * espessuraRetanguloSelecao), altura - (2 * espessuraRetanguloSelecao));
            		retangulo.hitArea = hit;
            		retangulo.setBounds(0,0,largura,altura);
            		
            		stageCanvas.addChild(retangulo);
            		retangulo.x = ligacaoContainer.x;
            		retangulo.y = ligacaoContainer.y;
        		}
        		
        		else{
        			var retangulo = stageCanvas.getChildByName("retanguloSelecaoMV" + idLigacao); 
        			retangulo.x = (evt.stageX - (largura/2) - stageCanvas.x);
        			retangulo.y = (evt.stageY - (altura/2) - stageCanvas.y);
        		}
    		}
    		else{ //alterando o tamanho do retangulo selecao
    			var novaAltura;
    			var novaLargura;
    			var deslocamentoX;
    			var deslocamentoY;
    			
    			console.log(evt.target.name);
        			
    			if(stageCanvas.getChildByName("retanguloSelecaoAT" + idLigacao) == null){ //AT de alterarTamanho
        			var retangulo = new createjs.Shape();
            		retangulo.name = "retanguloSelecaoAT" + idLigacao;
            		var hit = new createjs.Shape();
            		
            		retangulo.graphics.setStrokeStyle(espessuraRetanguloSelecao,"round").beginStroke(corRetanguloSelecao).beginFill().drawRoundRect( //adiciona na posicao zero,zero
            				0,0,largura,altura,3);
            		hit.graphics.beginFill("#000").rect(0,
            				0, largura - (2 * espessuraRetanguloSelecao), altura - (2 * espessuraRetanguloSelecao));
            		retangulo.hitArea = hit;
            		retangulo.setBounds(0,0,largura,altura);
            		
            		stageCanvas.addChild(retangulo);
            		retangulo.x = ligacaoContainer.x;
            		retangulo.y = ligacaoContainer.y;
        		}
    			else{
    				var retanguloSelecao = stageCanvas.getChildByName("retanguloSelecaoAT" + idLigacao); 
    				
    				if ( (ligacaoContainer.x + largura) <= (evt.stageX - stageCanvas.x) ) {
	    				deslocamentoX = (evt.stageX - stageCanvas.x) - (ligacaoContainer.x + largura);
	    				novaLargura = largura + deslocamentoX;
	        		}
	    			else{
	    				deslocamentoX = (ligacaoContainer.x + largura) - (evt.stageX - stageCanvas.x);
	    				novaLargura = largura - deslocamentoX;
	    			}
	    			
	        		if ( (ligacaoContainer.y + altura) <= (evt.stageY - stageCanvas.y) ) {
	        			deslocamentoY = (evt.stageY - stageCanvas.y) - (ligacaoContainer.y + altura);
	    				novaAltura = altura + deslocamentoY;
	    				
	        		}
	        		else{
	        			deslocamentoY = (ligacaoContainer.y + altura) - (evt.stageY - stageCanvas.y);
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
    	
    	
    	
    	ligacaoContainer.addEventListener("pressup", function ligacaoPressUp(evt){
        		
        		var retanguloSelecaoAT;
        		var retanguloSelecaoMV;
        		
        		retanguloSelecaoAT = stageCanvas.getChildByName("retanguloSelecaoAT" + idLigacao);
        		retanguloSelecaoMV = stageCanvas.getChildByName("retanguloSelecaoMV" + idLigacao);
        		
        		if(retanguloSelecaoAT || retanguloSelecaoMV){ // necessario pois quando o usuario clica uma unica vez sem pressionar, tambem gera o pressup
        		
        			var ligacaoNaLista;
        	    	var msg;
            		var indexRetanguloSelecao;
        			
            		ligacaoNaLista = getLigacaoLista(idLigacao);
        		
	    			if(evt.target.name != "quadradoTamanho"){ //movimentando ligacao
	    				var novoX;
	    				var novoY;
	    				
	    				indexRetanguloSelecao = stageCanvas.getChildIndex(retanguloSelecaoMV);
	    				
		        		novoX = retanguloSelecaoMV.x;
		        		novoY = retanguloSelecaoMV.y;
		        		ligacaoContainer.x = novoX;
		        		ligacaoContainer.y = novoY;
		        		
		        		removerFilhoStageCanvas(stageCanvas, indexRetanguloSelecao);
		        		//atualizar as linhas de ligacao na tela
		        		gerenciadorLigacao.atualizarLigacoesAoMoverLigacao(ligacaoContainer, ligacaoNaLista, stageCanvas);
		        	    renderizarMapa();
		        	    
		        	    msg = montarMensagemAoMoverLigacao(idLigacao, idMapa, novoX, novoY);
		    			enviarMensagemAoServidor(msg);
	    			}
	    			
	    			else{ //alterando o tamanho da ligacao
	    				
	    				var novaAltura;
	        			var novaLargura;
	        			var corFundo;
	        			var alturaMin;
	        			var larguraMin;
	        			var label;
	        			var propriedades;
	    				
	        			label = getLabel(ligacaoContainer);
	        			corFundo = getCorFundo(idLigacao);
	        			alturaMin = getAlturaMinima(idLigacao);
	        			larguraMin = getLarguraMinima(idLigacao);
	        			novaLargura = getLarguraRS(retanguloSelecaoAT);
	        			novaAltura = getAlturaRS(retanguloSelecaoAT);
	        			indexRetanguloSelecao = stageCanvas.getChildIndex(retanguloSelecaoAT);
	        			removerFilhoStageCanvas(stageCanvas, indexRetanguloSelecao);
	        			propriedades = new Object();
	        			
	        			if(alturaMin == 0){ //ligacao ainda nao foi editada
	        				alturaMin = label.getMeasuredHeight();
	        				larguraMin = label.getMeasuredWidth();
	        				
	        				propriedades.alturaMinima = alturaMin;
	        				propriedades.larguraMinima = larguraMin;
	        			}
	        			
	    				if(novaLargura < larguraMin){
	    					novaLargura = larguraMin;
		        		}
	    				gerenciadorLigacao.setLargura(ligacaoContainer, novaLargura);
	    				
	            		if(novaAltura < alturaMin){
	            			novaAltura = alturaMin;
	            		}
	            		gerenciadorLigacao.setAltura(ligacaoContainer, novaAltura);
	            		
	            		propriedades.idLigacao = idLigacao;
	            		propriedades.corFundo = corFundo;
	            		propriedades.altura = novaAltura;
	            		propriedades.largura = novaLargura;
	            		
	            		gerenciadorLigacao.redesenharLigacaoAposEdicao(ligacaoContainer, propriedades, stageCanvas, renderizarMapa);
	            		gerenciadorLigacao.atualizarLigacoesAoMoverLigacao(ligacaoContainer, ligacaoNaLista, stageCanvas);
						gerenciadorLigacao.recentralizarLabel(ligacaoContainer);
						gerenciadorLigacao.selecionarLigacao(label, corFundo, stageCanvas, renderizarMapa); // devo mandar a label devido a implementacao da funcao selecionar
						
						msg = montarMensagemAoAlterarTamanhoLigacao(idMapa, propriedades);
		    			enviarMensagemAoServidor(msg);
	    			}
	    		}
	    	
	    	});
    	
    	
    };
    
    this.recentralizarLabel = function(ligacaoContainer){
    	var alturaContainer;
    	var larguraContainer;
    	var label;
    	
    	label = getLabel(ligacaoContainer);
    	alturaContainer = gerenciadorLigacao.getAltura(ligacaoContainer);
    	larguraContainer = gerenciadorLigacao.getLargura(ligacaoContainer);
    	
    	label.x = (larguraContainer/2);
    	label.y = (alturaContainer/2);
    };

    
    this.atualizarLigacoesAoMoverLigacao = function(ligacaoContainer, ligacaoNaLista, stageCanvas){
    	var idConceito;
    	var idLinha;
    	var coordenadas;
    	var conceitoContainer;
    	var graphic;
    	var papelConceito;
    	
    	
    	//linhas referentes aos outros conceitos
		 
		var listaConceitosFilhos = ligacaoNaLista.children("li[title^='idConceitoFilho']");
		 
    	for(var i=0; listaConceitosFilhos.get(i) != undefined ; i++){
    		papelConceito = $(listaConceitosFilhos.get(i)).attr("title").replace("idConceitoFilho","");
    		
    		idConceito = $(ligacaoNaLista).children("li[title='idConceitoFilho"+ papelConceito + "']").attr('value');
        	idLinha = $(ligacaoNaLista).children("li[title='idLinhaFilho" + papelConceito + "']").attr('value');
        	
        	conceitoContainer = gerenciadorLigacao.getLigacaoContainerViaId(idConceito, stageCanvas);
    		linhaContainer = gerenciadorLigacao.getLigacaoContainerViaId(idLinha, stageCanvas);
    		 
    		coordenadas = calcularNovaPonta(conceitoContainer, ligacaoContainer);
    		graphic = new createjs.Graphics();
    		graphic.setStrokeStyle(1,"round").beginStroke("#000");
    		
    		graphic.moveTo(coordenadas.conceito.x,coordenadas.conceito.y);
    		graphic.lineTo(coordenadas.ligacao.x,coordenadas.ligacao.y);
    		linhaContainer.graphics.clear();
    		linhaContainer.graphics = graphic;
    	}
    	
    	
    	
    	//linha referente ao conceito pai
    	papelConceito = 0;
    	
    	idConceito = $(ligacaoNaLista).children("li[title='idConceitoPai']").val();
    	idLinha = $(ligacaoNaLista).children("li[title='idLinhaPai']").val();
    	
    	conceitoContainer = gerenciadorLigacao.getLigacaoContainerViaId(idConceito, stageCanvas);
		linhaContainer = gerenciadorLigacao.getLigacaoContainerViaId(idLinha, stageCanvas);
		 
		 coordenadas = calcularNovaPonta(conceitoContainer, ligacaoContainer);
		 graphic = new createjs.Graphics();
		 graphic.setStrokeStyle(1,"round").beginStroke("#000");
		 
		 graphic.moveTo(coordenadas.conceito.x,coordenadas.conceito.y);
		 graphic.lineTo(coordenadas.ligacao.x,coordenadas.ligacao.y);
		 linhaContainer.graphics.clear();
		 linhaContainer.graphics = graphic;
    };
    
    
    /**
     * 
     */
    this.atualizarLigacoesAoMoverConceito = function (idConceito,conceitoContainer, conceitoNaLista, getLigacaoLista, stageCanvas){
    	
    	var idLigacao;
    	var idLinha;
    	var coordenadas;
    	var ligacaoContainer;
    	var graphic;
    	var listaConceitosFilhos;
    	var ligacoes;
    	var ligacaoNaLista;
    	
    	ligacoes = $(conceitoNaLista).children("li[title='idLigacao']");
    	
    	for(var i=0; ligacoes.get(i) != undefined; i++){
    		 idLigacao = ligacoes.get(i).value;
    		 ligacaoNaLista = getLigacaoLista(idLigacao);
    		 
    		 listaConceitosFilhos = ligacaoNaLista.children("li[title^='idConceitoFilho']");
    		 
    		 if($(ligacaoNaLista).children("li[title='idConceitoPai']").attr('value') == idConceito){
    			 idLinha = $(ligacaoNaLista).children("li[title='idLinhaPai']").attr('value');
    			 papelConceito = 0;
    		 }
    		 else{
    			 for(var j = 0; listaConceitosFilhos.get(j) != undefined; j++){
    				 var id = listaConceitosFilhos.get(j).value;
    				 if(id == idConceito){
    					 papelConceito = $(listaConceitosFilhos.get(j)).attr("title").replace("idConceitoFilho","");
    					 papelConceito = parseInt(papelConceito);
    					 idLinha = $(ligacaoNaLista).children("li[title='idLinhaFilho" + papelConceito + "']").attr('value');
    				 }
    			 }
    		 }
    		 
    		 ligacaoContainer = gerenciadorLigacao.getLigacaoContainerViaId(idLigacao, stageCanvas);
    		 linhaContainer = gerenciadorLigacao.getLigacaoContainerViaId(idLinha, stageCanvas);
    		 
    		 coordenadas = calcularNovaPonta(conceitoContainer, ligacaoContainer);
    		 graphic = new createjs.Graphics();
    		 graphic.setStrokeStyle(1,"round").beginStroke("#000");
    		 
    		 graphic.moveTo(coordenadas.conceito.x,coordenadas.conceito.y);
    		 graphic.lineTo(coordenadas.ligacao.x,coordenadas.ligacao.y);
    		 linhaContainer.graphics.clear();
    		 linhaContainer.graphics = graphic;
    	}

    };
    
    
    /**
     * 
     */
    this.desenharLigacao = function(texto, fonte, tamanhoFonte, corFonte, corFundo, conceitoContainerPai, conceitoContainerFilho) {
    	var posicaoLigacaoX;
    	var posicaoLigacaoY;
    	var altura;
    	var largura;
    	var label;
    	var retangulo;
    	var ligacaoContainer;
    	var containers;
    	var linhasContainers;
        
        ligacaoContainer = new createjs.Container();
        ligacaoContainer.name = "ligacao";
    	
        label = new createjs.Text(texto, tamanhoFonte + " " + fonte, corFonte);
        label.name = "label";
    	altura = label.getMeasuredHeight();
    	largura = label.getMeasuredWidth();
    	label.textAlign = "center";
    	label.textBaseline = "middle";
    	label.x = (largura/2);
    	label.y = (altura/2);
    	
    	retangulo = new createjs.Shape();
    	retangulo.name = "retangulo";
    	retangulo.graphics.beginFill(corFundo).drawRoundRect( //adiciona na posicao zero,zero
    			0,0,largura,altura,3);
    	retangulo.setBounds(0,0,largura,altura);
    	
    	ligacaoContainer.addChild(retangulo, label); //adiciona o retangulo e o label no container
    	// ATENCAO: conceito.x retorna string e nao number como consta na documentacao da easeljs
    	posicaoLigacaoX = (parseFloat(conceitoContainerPai.x) + parseFloat(conceitoContainerFilho.x))/2;
    	posicaoLigacaoY = (parseFloat(conceitoContainerPai.y) + parseFloat(conceitoContainerFilho.y))/2;
    	ligacaoContainer.x = posicaoLigacaoX;
    	ligacaoContainer.y = posicaoLigacaoY;
    	
    	linhasContainers = desenharLinhas(ligacaoContainer, conceitoContainerPai, conceitoContainerFilho);
    	
    	containers = new Array();
    	containers["ligacaoContainer"] = ligacaoContainer;
    	containers["linhaPaiContainer"] = linhasContainers["linhaPaiContainer"];
    	containers["linhaFilhoContainer"] = linhasContainers["linhaFilhoContainer"];
    	
    	return containers;
    };
    
    
    /**
     * 
     */
     function desenharLinhas(ligacaoContainer, conceitoContainerPai, conceitoContainerFilho) {
    	var coordenadasLinhaPai;
    	var coordenadasLinhaFilho;
    	var linhaPaiContainer;
    	var linhaFilhoContainer;
    	var graphicPai;
    	var graphicFilho;
    	var espessuraLinha;
    	var corLinha;
    	var linhasContainers;
    	
    	linhaPaiContainer = new createjs.Shape(); //liga a ponta do conceito 1 a ponta da palavra de ligacao
    	linhaFilhoContainer = new createjs.Shape(); //liga a ponta do conceito 2 a ponta da palavra de ligacao
    	linhasContainers = new Array();
    	
    	espessuraLinha = 1;
    	corLinha = "#000";
    	graphicPai = new createjs.Graphics(); //define as propriedades graficas da linhaPai
    	graphicFilho = new createjs.Graphics(); //define as propriedades graficas da linhaFilho
    	graphicPai.setStrokeStyle(espessuraLinha,"round").beginStroke(corLinha);
    	graphicFilho.setStrokeStyle(espessuraLinha,"round").beginStroke(corLinha);
    	
    	//desenhando linha Pai
    	coordenadasLinhaPai = calcularNovaPonta(conceitoContainerPai,ligacaoContainer);
    	
    	graphicPai.moveTo(coordenadasLinhaPai.conceito.x,coordenadasLinhaPai.conceito.y);
    	graphicPai.lineTo(coordenadasLinhaPai.ligacao.x,coordenadasLinhaPai.ligacao.y);
    	linhaPaiContainer.graphics = graphicPai;
    	linhasContainers["linhaPaiContainer"] = linhaPaiContainer;
    	
    	//desenhando linha Filho
    	coordenadasLinhaFilho = calcularNovaPonta(conceitoContainerFilho,ligacaoContainer);
    	
    	graphicFilho.moveTo(coordenadasLinhaFilho.conceito.x,coordenadasLinhaFilho.conceito.y);
    	graphicFilho.lineTo(coordenadasLinhaFilho.ligacao.x,coordenadasLinhaFilho.ligacao.y);
    	linhaFilhoContainer.graphics = graphicFilho;
    	linhasContainers["linhaFilhoContainer"] = linhaFilhoContainer;
    	
    	return linhasContainers;
    };
    
    this.redesenharLigacaoAposDesselecao = function(idLigacao, corFundo, stageCanvas) {
    	
    	var ligacaoContainer;
    	var altura;
    	var largura;
    	var rect;
		var qt; //quadrado tamanho
		
		ligacaoContainer = gerenciadorLigacao.getLigacaoContainerViaId(idLigacao, stageCanvas);
		
		
		altura = gerenciadorLigacao.getAltura(ligacaoContainer);
    	largura = gerenciadorLigacao.getLargura(ligacaoContainer);
    	
		qt = getQuadradroTamanho(ligacaoContainer, "quadradoTamanho");
		ligacaoContainer.removeChild(qt);
    	
		rect = getRetangulo(ligacaoContainer);
		rect.graphics.clear();
		rect.graphics.beginFill(corFundo).drawRoundRect( //adiciona na posicao zero,zero
				0,0,largura,altura,3);
    };

    
    this.selecionarLigacao = function(objetoSelecionadoP, corFundo, stageCanvas, renderizarMapa) { //objetoSelecionado pode ser o retangulo ou label
		
    	var objetoSelecionado; //pode ser label ou rect
    	var altura;
    	var largura;
    	var rect;
    	var qt; //quadrado Tamanho
    	
    	objetoSelecionado = objetoSelecionadoP;
    	
    	altura = gerenciadorLigacao.getAltura(objetoSelecionado.parent);
    	largura = gerenciadorLigacao.getLargura(objetoSelecionado.parent);
    	
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

    /**
     * calcula os novos pontos de interconexao entre conceitos ou palavras de ligacao conectados
     */
    
    function calcularNovaPonta(conceitoContainer, ligacaoContainer){
    	var coordenadas = new Coordenadas(new Array(),new Array());
    	var coordenadasFinais = new Coordenadas(new Object(),new Object());
    	var conceitoX = parseFloat(conceitoContainer.x);
    	var conceitoY = parseFloat(conceitoContainer.y);
    	var ligacaoX = parseFloat(ligacaoContainer.x);
    	var ligacaoY = parseFloat(ligacaoContainer.y);
    	
    	var larguraConceito = gerenciadorLigacao.getLargura(conceitoContainer);
    	var alturaConceito = gerenciadorLigacao.getAltura(conceitoContainer);
    	var larguraLigacao = gerenciadorLigacao.getLargura(ligacaoContainer);
    	var alturaLigacao = gerenciadorLigacao.getAltura(ligacaoContainer);
    	
    	
    	for(var i=0;i<8;i++){
    		coordenadas.conceito[i] = new Object();
    		coordenadas.ligacao[i] = new Object();
    	}
    	
    	//para o conceito
    	coordenadas.conceito[0].x = conceitoX;
    	coordenadas.conceito[0].y = conceitoY;
    	
    	coordenadas.conceito[1].x = conceitoX + (larguraConceito/2);
    	coordenadas.conceito[1].y = conceitoY;
    	
    	coordenadas.conceito[2].x = conceitoX + (larguraConceito);
    	coordenadas.conceito[2].y = conceitoY;
    	
    	coordenadas.conceito[3].x = conceitoX + (larguraConceito);
    	coordenadas.conceito[3].y = conceitoY + (alturaConceito/2);
    	
    	coordenadas.conceito[4].x = conceitoX + (larguraConceito);
    	coordenadas.conceito[4].y = conceitoY + (alturaConceito);
    	
    	coordenadas.conceito[5].x = conceitoX + (larguraConceito/2);
    	coordenadas.conceito[5].y = conceitoY + (alturaConceito);
    	
    	coordenadas.conceito[6].x = conceitoX;
    	coordenadas.conceito[6].y = conceitoY + (alturaConceito);
    	
    	coordenadas.conceito[7].x = conceitoX;
    	coordenadas.conceito[7].y = conceitoY + (alturaConceito/2);
    	
    	//para a ligacao
    	coordenadas.ligacao[0].x = ligacaoX;
    	coordenadas.ligacao[0].y = ligacaoY;
    	
    	coordenadas.ligacao[1].x = ligacaoX + (larguraLigacao/2);
    	coordenadas.ligacao[1].y = ligacaoY;
    	
    	coordenadas.ligacao[2].x = ligacaoX + (larguraLigacao);
    	coordenadas.ligacao[2].y = ligacaoY;
    	
    	coordenadas.ligacao[3].x = ligacaoX + (larguraLigacao);
    	coordenadas.ligacao[3].y = ligacaoY + (alturaLigacao/2);
    	
    	coordenadas.ligacao[4].x = ligacaoX + (larguraLigacao);
    	coordenadas.ligacao[4].y = ligacaoY + (alturaLigacao);
    	
    	coordenadas.ligacao[5].x = ligacaoX + (larguraLigacao/2);
    	coordenadas.ligacao[5].y = ligacaoY + (alturaLigacao);
    	
    	coordenadas.ligacao[6].x = ligacaoX;
    	coordenadas.ligacao[6].y = ligacaoY + (alturaLigacao);
    	
    	coordenadas.ligacao[7].x = ligacaoX;
    	coordenadas.ligacao[7].y = ligacaoY + (alturaLigacao/2);
    	
    	
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
    
    
    function getAlturaRS(retanguloSelecao){
    	return retanguloSelecao.getBounds().height;
    }
    
    function getLarguraRS(retanguloSelecao){
    	return retanguloSelecao.getBounds().width;
    }
    
    
    /**
     * 
     */
    this.getAltura = function getAltura(ligacaoContainer) {
    	var retangulo;
    	
    	retangulo = getRetangulo(ligacaoContainer);
        return retangulo.getBounds().height;
    };
    
    
    this.getAlturaMinima = function getAlturaMinima( ligacaoContainer ){
    	var label;
    	var alturaMin;
    	
    	label = getLabel(ligacaoContainer);
    	alturaMin = label.getMeasuredHeight();
    	return alturaMin;
    };
    
    this.getLarguraMinima = function getLarguraMinima( ligacaoContainer ){
    	var label;
    	var larguraMin;
    	
    	label = getLabel(ligacaoContainer);
    	larguraMin = label.getMeasuredWidth();
    	return larguraMin;
    };
    
    
    /**
     * 
     */
    this.getLigacaoContainerViaId = function(idLigacao,stageCanvas){
        var ligacaoContainer = stageCanvas.getChildAt(idLigacao);
    	return ligacaoContainer;
    };
    
    
    this.getId = function(ligacaoContainer, stageCanvas){
    	return stageCanvas.getChildIndex(ligacaoContainer);
    };
    
    /**
     * 
     */
    this.getLargura = function getLargura(ligacaoContainer) {
    	var retangulo;
    	
    	retangulo = getRetangulo(ligacaoContainer);
        return retangulo.getBounds().width;
    };
   
    
    /**
     * 
     */
    this.getLinhaContainerViaId = function(idLinha, mapa){
    	var linhaContainer = mapa.getStageCanvas().getChildAt(idLinha);
    	return linhaContainer;
    };
   
    
    /**
     * 
     */
    this.getTexto = function(ligacaoContainer) {
    	return ligacaoContainer.getChildByName("label").text;
    };
    
    /**
     * 
     */
    function getRetangulo(ligacaoContainer) {
    	return ligacaoContainer.getChildByName("retangulo");
    }
    
    /**
     * 
     */
    function getLabel(ligacaoContainer) {
    	return ligacaoContainer.getChildByName("label");
    }
    
    
    /**
     * 
     */
    function getQuadradroTamanho(ligacaoContainer, nome) {
    	return ligacaoContainer.getChildByName(nome);
    }
    
 
    /**
     * 
     */
    this.setX = function(idLigacao, novoX, stageCanvas) {
    	var ligacaoContainer;
    	ligacaoContainer = gerenciadorLigacao.getLigacaoContainerViaId(idLigacao, stageCanvas);
    	ligacaoContainer.x = novoX;
    };
    
    
    /**
     * 
     */
    this.setY = function(idLigacao, novoY, stageCanvas) {
    	var ligacaoContainer;
    	ligacaoContainer = gerenciadorLigacao.getLigacaoContainerViaId(idLigacao, stageCanvas);
    	ligacaoContainer.y = novoY;
    };
    
    
    this.setAltura = function(ligacaoContainer, novaAltura){
    	var retangulo;
    	var largura;
    	
    	retangulo = getRetangulo(ligacaoContainer);
    	largura = gerenciadorLigacao.getLargura(ligacaoContainer);
    	retangulo.setBounds(0,0,largura,novaAltura);
    };
    
    this.setLargura = function(ligacaoContainer, novaLargura){
    	var retangulo;
    	var altura;
    	
    	retangulo = getRetangulo(ligacaoContainer);
    	altura = gerenciadorLigacao.getAltura(ligacaoContainer);
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
    
    
    this.redesenharLigacaoAposEdicao = function(ligacaoContainer, propriedades, stageCanvas, setAlturaMinimaNaLista, setLarguraMinimaNaLista, getAlturaMinimaNaLista, getLarguraMinimaNaLista, removerFilhoStageCanvas, renderizarMapa){
    	var rect;
    	var retanguloSelecao;
    	var label;
    	var idLigacao;
    	
    	idLigacao = gerenciadorLigacao.getId(ligacaoContainer, stageCanvas);
    	rect = getRetangulo(ligacaoContainer);
    	label = getLabel(ligacaoContainer);
    	
    	//necessario remover o retangulo selecao quando o qt e removido pois quem dispara o evento do retangulo selecao e o qt
    	//necessario nao remover o RS quando o usuario estiver movimentando o RS e chegar uma mensagem para atualizar o tamanho do conceito
		retanguloSelecao = stageCanvas.getChildByName("retanguloSelecaoAT" + idLigacao);
    	
    	if(!propriedades.texto){ //se nao houver texto, altera-se apenas o tamanho
	    	rect.graphics.clear();
			rect.graphics.beginFill(propriedades.corFundo).drawRoundRect( //adiciona na posicao zero,zero
					0,0,propriedades.largura, propriedades.altura, 3);
			qt = getQuadradroTamanho(ligacaoContainer, "quadradoTamanho");
			ligacaoContainer.removeChild(qt);
			
			if(retanguloSelecao){ //tem o retanguloSelecaoAT
				var indexRetanguloSelecao;
				indexRetanguloSelecao = stageCanvas.getChildIndex(retanguloSelecao);
				removerFilhoStageCanvas(stageCanvas, indexRetanguloSelecao);
			}
			else{
				retanguloSelecao = stageCanvas.getChildByName("retanguloSelecaoMV" + idLigacao);
				if(retanguloSelecao){
					var novaAltura;
					var novaLargura;
					var antigaAltura;
					var antigaLargura;
					
					antigaAltura = getAlturaRS(retanguloSelecao);
					antigaLargura = getLarguraRS(retanguloSelecao);
					novaAltura = gerenciadorLigacao.getAltura(ligacaoContainer);
					novaLargura = gerenciadorLigacao.getLargura(ligacaoContainer);
					redesenharRSAoAlterarTamanho(retanguloSelecao, novaAltura,  novaLargura);
					retanguloSelecao.x = (retanguloSelecao.x - (novaLargura/2 - antigaLargura/2) - stageCanvas.x);
					retanguloSelecao.y = (retanguloSelecao.y - (novaAltura/2 - antigaAltura/2) - stageCanvas.y);
				}
			}
			
		}
    	else{ //caso tenha - altera-se a label
			
    		if(propriedades.altura || propriedades.largura){ // veio do servidor
    			
    			gerenciadorLigacao.setAltura(ligacaoContainer, propriedades.altura);
    			gerenciadorLigacao.setLargura(ligacaoContainer, propriedades.largura);
				
				label.color = propriedades.corFonte;
				label.text = propriedades.texto;
				label.font = propriedades.tamanhoFonte + " " + propriedades.fonte;
				gerenciadorLigacao.recentralizarLabel(ligacaoContainer);
				
				setAlturaMinimaNaLista(propriedades.idObjeto, propriedades.alturaMinima );
				setLarguraMinimaNaLista(propriedades.idObjeto, propriedades.larguraMinima );
				
				//alterando o retangulo
				rect.graphics.clear();
				rect.graphics.beginFill(propriedades.corFundo).drawRoundRect( //adiciona na posicao zero,zero
						0,0,propriedades.largura, propriedades.altura, 3);
				
				if(ligacaoContainer.getChildByName("quadradoTamanho") != undefined){
					var qt = getQuadradroTamanho(ligacaoContainer, "quadradoTamanho");
					ligacaoContainer.removeChild(qt);
					
					if(retanguloSelecao){ //tem o retanguloSelecaoAT
						var indexRetanguloSelecao;
						indexRetanguloSelecao = stageCanvas.getChildIndex(retanguloSelecao);
						removerFilhoStageCanvas(stageCanvas, indexRetanguloSelecao);
					}
					else{
						retanguloSelecao = stageCanvas.getChildByName("retanguloSelecaoMV" + idLigacao);
						if(retanguloSelecao){
							var novaAltura;
							var novaLargura;
							var antigaAltura;
							var antigaLargura;
							
							antigaAltura = getAlturaRS(retanguloSelecao);
							antigaLargura = getLarguraRS(retanguloSelecao);
							novaAltura = gerenciadorLigacao.getAltura(ligacaoContainer);
							novaLargura = gerenciadorLigacao.getLargura(ligacaoContainer);
							redesenharRSAoAlterarTamanho(retanguloSelecao, novaAltura,  novaLargura);
							retanguloSelecao.x = (retanguloSelecao.x - (novaLargura/2 - antigaLargura/2) - stageCanvas.x);
							retanguloSelecao.y = (retanguloSelecao.y - (novaAltura/2 - antigaAltura/2) - stageCanvas.y);
						}
					}
					
					gerenciadorLigacao.selecionarLigacao(label, propriedades.corFundo, stageCanvas,renderizarMapa);
				}	
				else{
					renderizarMapa();
				}
    		}
    		
    		
    		else{ //edicao local
    			
    			var alturaLigacao;
    			var larguraLigacao;
    			var alturaLabel;
    			var larguraLabel;
    			var labelAux;
    			
    			alturaLigacao = gerenciadorLigacao.getAltura(ligacaoContainer);
    			larguraLigacao = gerenciadorLigacao.getLargura(ligacaoContainer);
    			
    			labelAux = new createjs.Text();
    			labelAux.text = propriedades.texto;
    			labelAux.font = propriedades.tamanhoFonte + " " + propriedades.fonte;
    			alturaLabel = labelAux.getMeasuredHeight();
    			larguraLabel = labelAux.getMeasuredWidth();
    			
    			if(alturaLigacao < alturaLabel){
    				alturaLigacao = alturaLabel;
    				gerenciadorLigacao.setAltura(ligacaoContainer, alturaLigacao);
    			}
    			
    			if(larguraLigacao < larguraLabel){
    				larguraLigacao = larguraLabel;
    				gerenciadorLigacao.setLargura(ligacaoContainer, larguraLigacao);
    			}
    			
    			setAlturaMinimaNaLista(propriedades.idObjeto, alturaLabel );
				setLarguraMinimaNaLista(propriedades.idObjeto, larguraLabel );
    		
    			label.color = propriedades.corFonte;
    			label.text = labelAux.text;
    			label.font = labelAux.font;
    			gerenciadorLigacao.recentralizarLabel(ligacaoContainer);
    			
    			//alterando o retangulo
    			rect.graphics.clear();
    			rect.graphics.beginFill(propriedades.corFundo).drawRoundRect( //adiciona na posicao zero,zero
    					0,0,larguraLigacao, alturaLigacao, 3);
    			
    			if(ligacaoContainer.getChildByName("quadradoTamanho") != undefined){
    				var qt = getQuadradroTamanho(ligacaoContainer, "quadradoTamanho");
    				ligacaoContainer.removeChild(qt);
    				
    				if(retanguloSelecao){ //tem o retanguloSelecaoAT
    					var indexRetanguloSelecao;
    					indexRetanguloSelecao = stageCanvas.getChildIndex(retanguloSelecao);
    					removerFilhoStageCanvas(stageCanvas, indexRetanguloSelecao);
    				}
    				else{
    					retanguloSelecao = stageCanvas.getChildByName("retanguloSelecaoMV" + idLigacao);
    					if(retanguloSelecao){
    						var novaAltura;
    						var novaLargura;
    						var antigaAltura;
    						var antigaLargura;
    						
    						antigaAltura = getAlturaRS(retanguloSelecao);
    						antigaLargura = getLarguraRS(retanguloSelecao);
    						novaAltura = gerenciadorLigacao.getAltura(ligacaoContainer);
    						novaLargura = gerenciadorLigacao.getLargura(ligacaoContainer);
    						redesenharRSAoAlterarTamanho(retanguloSelecao, novaAltura,  novaLargura);
    						retanguloSelecao.x = (retanguloSelecao.x - (novaLargura/2 - antigaLargura/2) - stageCanvas.x);
    						retanguloSelecao.y = (retanguloSelecao.y - (novaAltura/2 - antigaAltura/2) - stageCanvas.y);
    					}
    				}
    				
    				gerenciadorLigacao.selecionarLigacao(label, propriedades.corFundo, stageCanvas,renderizarMapa);
    			}
    				
    			else{
    				renderizarMapa();
    			}
    		}
			
			
		}
    };
}
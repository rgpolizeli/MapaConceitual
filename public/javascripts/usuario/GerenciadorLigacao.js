function Coordenadas (conceito, ligacao){
    	this.conceito = conceito;
    	this.ligacao = ligacao;
}


function GerenciadorLigacao(origem, textoLigacao, fonteP, tamanhoFonteP, corFonteP, corFundoP, mapaConceitual, idConceitoPaiP, idConceitoFilhoP){
    var gerenciadorLigacao = this;
    var tamanhoQuadradoSelecao = 10;
	var corQuadradoSelecao = "#F00";
	
	
    /**
     * 
     */
    this.adicionarDragDrop = function(idMapa,ligacaoContainer, stageCanvas, getLigacaoLista, getCorFundo, renderizarMapa, montarMensagemAoMoverLigacao, montarMensagemAoAlterarTamanhoLigacao, enviarMensagemAoServidor){
    	var altura;
    	var largura;
    	var novoX;
    	var novoY;
    	var ligacaoNaLista;
    	var idLigacao;
    	var msg;
    	
    	
    	ligacaoContainer.addEventListener("pressmove", function(evt){
    		
    		idLigacao = gerenciadorLigacao.getId(ligacaoContainer, stageCanvas);
    		ligacaoNaLista = getLigacaoLista(idLigacao);
    		altura = getAltura(ligacaoContainer);
    		largura = getLargura(ligacaoContainer);
    		
    		if(evt.target.name != "qsTopLeft" && evt.target.name != "qsTopRigth" && evt.target.name != "qsBottomLeft" && evt.target.name != "qsBottomRigth"){
    			novoX = (evt.stageX - (largura/2) - stageCanvas.x); //a nova posicao do conceitoContainer eh a posicao do mouse para onde foi arrastado - o deslocamento do stageCanvas
        		novoY = (evt.stageY - (altura/2) - stageCanvas.y);
        	    
        		evt.currentTarget.x = novoX;
        	    evt.currentTarget.y = novoY;
        	    
        	    //atualiza a linhas de ligacao na tela
        	    gerenciadorLigacao.atualizarLigacoesAoMoverLigacao(ligacaoContainer, ligacaoNaLista, stageCanvas);
        	    
        	    msg = montarMensagemAoMoverLigacao(idLigacao, idMapa, novoX, novoY);
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
    			
    			label = getLabel(ligacaoContainer);
    			corFundo = getCorFundo(idLigacao);
    			alturaMin = label.getMeasuredHeight() + tamanhoQuadradoSelecao/4;
    			larguraMin = label.getMeasuredWidth() + tamanhoQuadradoSelecao/4;
    			
    			switch(evt.target.name){
    				case "qsTopLeft":
    	    			
    	    			if (ligacaoContainer.x <= evt.stageX) {
    	    				deslocamentoX = ligacaoContainer.x - evt.stageX;
    	    				novaLargura = largura + deslocamentoX;
    	    				novoX = evt.stageX;
    	        		}
    	    			else{
    	    				deslocamentoX = evt.stageX - ligacaoContainer.x;
    	    				novaLargura = largura - deslocamentoX;
    	    				novoX = evt.stageX;
    	    			}
    	    			
    	        		if (ligacaoContainer.y <= evt.stageY) {
    	        			deslocamentoY = evt.stageY - ligacaoContainer.y;
    	    				novaAltura = altura - deslocamentoY;
    	    				novoY = evt.stageY;
    	        		}
    	        		else{
    	        			deslocamentoY = ligacaoContainer.y - evt.stageY;
    	    				novaAltura = altura + deslocamentoY;
    	    				novoY = evt.stageY;
    	        		}
    	        		
    	        		if(novaLargura > larguraMin){
    	        			gerenciadorLigacao.setLargura(ligacaoContainer, novaLargura);
    	        			gerenciadorLigacao.setX(idLigacao, novoX, stageCanvas);
    	        		}
    	        		else{
    	        			novaLargura = larguraMin;
    	        		}
	            		if(novaAltura > alturaMin){
	            			gerenciadorLigacao.setAltura(ligacaoContainer, novaAltura);
	            			gerenciadorLigacao.setY(idLigacao, novoY, stageCanvas);
	            		}
	            		else{
	            			novaAltura = alturaMin;
	            		}
	            		gerenciadorLigacao.redesenharLigacaoAposEdicao(idLigacao, getCorFundo, stageCanvas);
	    			
    				break;
    				
    				case "qsBottomLeft":
    					if (ligacaoContainer.x <= evt.stageX) {
    	    				deslocamentoX = evt.stageX - ligacaoContainer.x;
    	    				novaLargura = largura - deslocamentoX;
    	    				novoX = evt.stageX;
    	        		}
    	    			else{
    	    				deslocamentoX = ligacaoContainer.x - evt.stageX;
    	    				novaLargura = largura + deslocamentoX;
    	    				novoX = evt.stageX;
    	    			}
    	    			
    	        		if ( (ligacaoContainer.y + altura) <= evt.stageY) {
    	        			deslocamentoY = evt.stageY - (ligacaoContainer.y + altura);
    	    				novaAltura = altura + deslocamentoY;
    	        		}
    	        		else{
    	        			deslocamentoY = (ligacaoContainer.y + altura) - evt.stageY;
    	    				novaAltura = altura - deslocamentoY;
    	        		}
    	        		
    	        		if(novaLargura > larguraMin){
    	        			gerenciadorLigacao.setLargura(ligacaoContainer, novaLargura);
    	        			gerenciadorLigacao.setX(idLigacao, novoX, stageCanvas);
    	        		}
    	        		else{
    	        			novaLargura = larguraMin;
    	        		}
	            		if(novaAltura > alturaMin){
	            			gerenciadorLigacao.setAltura(ligacaoContainer, novaAltura);
	            		}
	            		else{
	            			novaAltura = alturaMin;
	            		}
	            		gerenciadorLigacao.redesenharLigacaoAposEdicao(idLigacao, getCorFundo, stageCanvas);
    				break;
    				
    				case "qsTopRigth":
    					if ( (ligacaoContainer.x + largura) <= evt.stageX) {
    	    				deslocamentoX = evt.stageX - (ligacaoContainer.x + largura);
    	    				novaLargura = largura + deslocamentoX;
    	        		}
    	    			else{
    	    				deslocamentoX = (ligacaoContainer.x + largura) - evt.stageX;
    	    				novaLargura = largura - deslocamentoX;
    	    			}
    	    			
    	        		if (ligacaoContainer.y <= evt.stageY) {
    	        			deslocamentoY = evt.stageY - ligacaoContainer.y;
    	    				novaAltura = altura - deslocamentoY;
    	    				novoY = evt.stageY;
    	        		}
    	        		else{
    	        			deslocamentoY = ligacaoContainer.y - evt.stageY;
    	    				novaAltura = altura + deslocamentoY;
    	    				novoY = evt.stageY;
    	        		}
    	        		
    	        		if(novaLargura > larguraMin){
    	        			gerenciadorLigacao.setLargura(ligacaoContainer, novaLargura);
    	        		}
    	        		else{
    	        			novaLargura = larguraMin;
    	        		}
	            		if(novaAltura > alturaMin){
	            			gerenciadorLigacao.setAltura(ligacaoContainer, novaAltura);
	            			gerenciadorLigacao.setY(idLigacao, novoY, stageCanvas);
	            		}
	            		else{
	            			novaAltura = alturaMin;
	            		}
	            		gerenciadorLigacao.redesenharLigacaoAposEdicao(idLigacao, getCorFundo, stageCanvas);
    				break;
    				
    				case "qsBottomRigth":
    					if ( (ligacaoContainer.x + largura) <= evt.stageX) {
    	    				deslocamentoX = evt.stageX - (ligacaoContainer.x + largura);
    	    				novaLargura = largura + deslocamentoX;
    	        		}
    	    			else{
    	    				deslocamentoX = (ligacaoContainer.x + largura) - evt.stageX;
    	    				novaLargura = largura - deslocamentoX;
    	    			}
    	    			
    	        		if ( (ligacaoContainer.y + altura) <= evt.stageY) {
    	        			deslocamentoY = evt.stageY - (ligacaoContainer.y + altura);
    	    				novaAltura = altura + deslocamentoY;
    	    				
    	        		}
    	        		else{
    	        			deslocamentoY = (ligacaoContainer.y + altura) - evt.stageY;
    	    				novaAltura = altura - deslocamentoY;
    	        		}
    	        		
    	        		if(novaLargura > larguraMin){
    	        			gerenciadorLigacao.setLargura(ligacaoContainer, novaLargura);
    	        			
    	        		}
    	        		else{
    	        			novaLargura = larguraMin;
    	        		}
	            		if(novaAltura > alturaMin){
	            			gerenciadorLigacao.setAltura(ligacaoContainer, novaAltura);
	            		}
	            		else{
	            			novaAltura = alturaMin;
	            		}
	            		gerenciadorLigacao.redesenharLigacaoAposEdicao(idLigacao, getCorFundo, stageCanvas);
    				break;
    			}
        		
    			gerenciadorLigacao.atualizarLigacoesAoMoverLigacao(ligacaoContainer, ligacaoNaLista, stageCanvas);
    			gerenciadorLigacao.redesenharQuadradosSelecao(ligacaoContainer);
    			gerenciadorLigacao.recentralizarLabel(ligacaoContainer);
    			
    			msg = montarMensagemAoAlterarTamanhoLigacao(idMapa, idLigacao, novaLargura, novaAltura, ligacaoContainer.x, ligacaoContainer.y);
    			enviarMensagemAoServidor(msg);
    		}
    		
    	    renderizarMapa();
        });
    };
    
    this.recentralizarLabel = function(ligacaoContainer){
    	var alturaContainer;
    	var larguraContainer;
    	
    	label = getLabel(ligacaoContainer);
    	alturaContainer = getAltura(ligacaoContainer);
    	larguraContainer = getLargura(ligacaoContainer);
    	
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
		var qs;
		var nome;
		
		ligacaoContainer = gerenciadorLigacao.getLigacaoContainerViaId(idLigacao, stageCanvas);
		
		nome = "qsTopLeft";
		qs = getQuadradroSelecao(ligacaoContainer, nome);
		ligacaoContainer.removeChild(qs);
		
		nome = "qsTopRigth";
		qs = getQuadradroSelecao(ligacaoContainer, nome);
		ligacaoContainer.removeChild(qs);
		
		nome = "qsBottomLeft";
		qs = getQuadradroSelecao(ligacaoContainer, nome);
		ligacaoContainer.removeChild(qs);
		
		nome = "qsBottomRigth";
		qs = getQuadradroSelecao(ligacaoContainer, nome);
		ligacaoContainer.removeChild(qs);
    };

    
    this.selecionarLigacao = function(objetoSelecionadoP, corFundo, renderizarMapa) { //objetoSelecionado pode ser o retangulo ou label
		
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
    
    
    this.redesenharQuadradosSelecao = function(ligacaoContainer){
    	
    	var quadradosSelecao;
    	var altura;
    	var largura;
    	
    	altura = getAltura(ligacaoContainer);
    	largura = getLargura(ligacaoContainer);
    	
    	
    	quadradosSelecao = {
        		topLeft: getQuadradroSelecao(ligacaoContainer, "qsTopLeft"),
        		topRigth: getQuadradroSelecao(ligacaoContainer, "qsTopRigth"),
        		bottomLeft: getQuadradroSelecao(ligacaoContainer, "qsBottomLeft"),
        		bottomRigth: getQuadradroSelecao(ligacaoContainer, "qsBottomRigth")
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
     * calcula os novos pontos de interconexao entre conceitos ou palavras de ligacao conectados
     */
    
    function calcularNovaPonta(conceitoContainer, ligacaoContainer){
    	var coordenadas = new Coordenadas(new Array(),new Array());
    	var coordenadasFinais = new Coordenadas(new Object(),new Object());
    	var conceitoX = parseFloat(conceitoContainer.x);
    	var conceitoY = parseFloat(conceitoContainer.y);
    	var ligacaoX = parseFloat(ligacaoContainer.x);
    	var ligacaoY = parseFloat(ligacaoContainer.y);
    	
    	var larguraConceito = conceitoContainer.getBounds().width;
    	var alturaConceito = conceitoContainer.getBounds().height;
    	var larguraLigacao = ligacaoContainer.getBounds().width;
    	var alturaLigacao = ligacaoContainer.getBounds().height;
    	
    	
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
    
    /**
     * 
     */
    function getAltura(ligacaoContainer) {
    	return ligacaoContainer.getBounds().height;
    }
    
    
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
    this.getIdConceitoPai = function(){
    	return idConceitoPai;
    };
    
    /**
     * 
     */
    this.getIdConceitoFilho = function(){
    	return idConceitoFilho;
    };
    
    /**
     * 
     */
    this.getIdLinhaPai = function(){
    	return mapaConceitual.getStageCanvas().getChildIndex(linhaPai);
    };
    
    /**
     * 
     */
    this.getIdLinhaFilho = function(){
    	return mapaConceitual.getStageCanvas().getChildIndex(linhaFilho);
    };
    
    

    /**
     * 
     */
    function getLargura(ligacaoContainer) {
        return ligacaoContainer.getBounds().width;
    }
   
    
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
    this.getLinhaPaiContainer = function(){
        return linhaPai;
    };
    
    /**
     * 
     */
    this.getLinhaFilhoContainer = function(){
        return linhaFilho;
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
    function getQuadradroSelecao(ligacaoContainer, nome) {
    	return ligacaoContainer.getChildByName(nome);
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
    	largura = getLargura(ligacaoContainer);
    	retangulo.setBounds(0,0,largura,novaAltura);
    };
    
    this.setLargura = function(ligacaoContainer, novaLargura){
    	var retangulo;
    	var altura;
    	
    	retangulo = getRetangulo(ligacaoContainer);
    	altura = getAltura(ligacaoContainer);
    	retangulo.setBounds(0,0,novaLargura,altura);
    };

    this.redesenharLigacaoAposEdicao = function(idLigacao, getCorFundo, stageCanvas){
    	var altura;
    	var largura;
    	var corFundo;
    	var ligacaoContainer;
    	var rect;
    	
    	ligacaoContainer = gerenciadorLigacao.getLigacaoContainerViaId(idLigacao, stageCanvas);
    	rect = getRetangulo(ligacaoContainer);
    	corFundo = getCorFundo(idLigacao);
    	altura = getAltura(ligacaoContainer);
    	largura = getLargura(ligacaoContainer);
    	
    	rect.graphics.clear();
		rect.graphics.beginFill(corFundo).drawRoundRect( //adiciona na posicao zero,zero
				0,0,largura,altura,3);
    };
}
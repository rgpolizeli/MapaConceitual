function GerenciadorConceito(){
	
    var gerenciadorConceito = this;
    /**
     * 
     */
    this.adicionarDragDrop = function(idMapa,conceitoContainer, stageCanvas, getConceitoLista, getLigacaoLista, atualizarLigacoesAoMoverConceito, renderizarMapa, montarMensagemAoMoverConceito, enviarMensagemAoServidor){
    	var altura;
    	var largura;
    	var novoX;
    	var novoY;
    	var conceitoNaLista;
    	var idConceito;
    	var msg;
    	
    	
    	conceitoContainer.addEventListener("pressmove", function(evt){
    		
    		idConceito = gerenciadorConceito.getId(conceitoContainer, stageCanvas);
    		conceitoNaLista = getConceitoLista(idConceito);
    		altura = getAltura(conceitoContainer);
    		largura = getLargura(conceitoContainer);
    		novoX = (evt.stageX - (largura/2) - stageCanvas.x); //a nova posicao do conceitoContainer eh a posicao do mouse para onde foi arrastado - o deslocamento do stageCanvas
    		novoY = (evt.stageY - (altura/2) - stageCanvas.y);
    	    
    		evt.currentTarget.x = novoX; 
    	    evt.currentTarget.y = novoY;
    	    
    	    //atualizar as linhas de ligacao na tela e atualiza na lista as coordenadas de ponta de ligacao
    	    atualizarLigacoesAoMoverConceito(idConceito, conceitoContainer, conceitoNaLista, getLigacaoLista, stageCanvas);
    	    
    	    
    	    msg = montarMensagemAoMoverConceito(idConceito, idMapa, novoX, novoY);
			enviarMensagemAoServidor(msg);
    	    renderizarMapa();
        });
    };
    
    

    /**
     * 
     */
    this.desenharConceito = function( textoP, fonteP, tamanhoFonteP, corFonteP, corFundoP, xP, yP ) {

    	var label;
    	var paddingH;
    	var paddingW;
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
    	paddingH = 12;
    	paddingW = 12;
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
    
    
    this.redesenharConceito = function(idConceitoP, corFundo, stageCanvas) {
    	var idConceito;
    	var conceitoContainer;
		var rect;
		var altura;
		var largura;
		
		idConceito = idConceitoP;
		conceitoContainer = gerenciadorConceito.getConceitoContainerViaId(idConceito, stageCanvas);
		rect = getRetangulo(conceitoContainer);
		
		altura = getAltura(conceitoContainer);
    	largura = getLargura(conceitoContainer);
		
		rect.graphics.clear();
		rect.graphics.beginFill(corFundo).drawRoundRect( //adiciona na posicao zero,zero
				0,0,largura,altura,3);
    };
    
    
    this.selecionarConceito = function(objetoSelecionadoP, corFundo) { //objetoSelecionado pode ser o retangulo ou label
    	
    	var objetoSelecionado; //pode ser label ou rect
    	var rect;
    	var corSelecao;
    	var espessuraBorda;
    	var altura;
    	var largura;
    	
    	objetoSelecionado = objetoSelecionadoP;
    	rect = getRetangulo(objetoSelecionado.parent);
    	
    	corSelecao = "#F00";
    	espessuraBorda = 2;
    	
    	altura = getAltura(objetoSelecionado.parent);
    	largura = getLargura(objetoSelecionado.parent);
    	
		rect.graphics.clear();
		rect.graphics.setStrokeStyle(espessuraBorda,"round").beginStroke(corSelecao).beginFill(corFundo).drawRoundRect( //adiciona na posicao zero,zero
				0,0,largura,altura,3);
    };

    /**
     * 
     */
    function getAltura(conceitoContainer) {
        return conceitoContainer.getBounds().height;
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
    	return conceitoContainer.getBounds().width;
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
    this.getLabel = function(conceitoContainer) {
    	return conceitoContainer.getChildByName("label");
    };
    
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

}
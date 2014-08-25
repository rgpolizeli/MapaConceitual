function Conceito(origem, textoConceito, fonteP, tamanhoFonteP, corFonteP, corFundoP, mapaConceitual){
	var altura;
    var conceitoContainer;
    var id;
    var label;
    var largura;
    var retangulo;
    var texto;
    var fonte;
    var tamanhoFonte;
    var corFonte;
    var corFundo;
    var conceito = this;
    
    /**
     * 
     */
    var adicionarDragDrop = function(conceito){
    	conceitoContainer.addEventListener("pressmove", function(evt){
    		
    		var novoX = (evt.stageX - (largura/2) - mapaConceitual.getStageCanvas().x); //a nova posicao do conceitoContainer eh a posicao do mouse para onde foi arrastado - o deslocamento do stageCanvas
    		var novoY = (evt.stageY - (altura/2) - mapaConceitual.getStageCanvas().y);
    	    
    		evt.currentTarget.x = novoX; 
    	    evt.currentTarget.y = novoY;
    	    
    	    //atualizar as linhas de ligacao na tela e atualiza na lista as coordenadas de ponta de ligacao
    	    new Ligacao().atualizarLigacoesAoMoverConceito(0, conceitoContainer,conceito.getId(conceitoContainer), mapaConceitual);
    	    
    		mapaConceitual.renderizar();
    		
    		//atualiza posicao do conceito ao mover conceito
    		var idMapa = mapaConceitual.getId();
    		mapaConceitual.getGerenciadorLista().atualizarConceitoNaListaAoMoverConceito(0,conceito.getId(conceitoContainer), idMapa, novoX, novoY);
        });
    };
    
    

    /**
     * 
     */
    this.desenharConceito = function() {

    	label.textAlign = "center";
    	label.textBaseline = "middle";
    	
    	var paddingH = 12;
    	var paddingW = 12;
    	
    	altura = label.getMeasuredHeight() + paddingH;
    	largura = label.getMeasuredWidth() + paddingW;
    	
    	label.x = (largura/2);
    	label.y = (altura/2);
    	
    	retangulo.graphics.beginFill(corFundo).drawRoundRect( //adiciona na posicao zero,zero
    			0,0,largura,altura,3);
    	retangulo.setBounds(0,0,largura,altura);
    
    	
    	conceitoContainer.addChild(retangulo, label); //adiciona o retangulo e o label no container
    	conceitoContainer.x -= mapaConceitual.getStageCanvas().x;
    	conceitoContainer.y -= mapaConceitual.getStageCanvas().y;
    	
    	mapaConceitual.getStageCanvas().addChild(conceitoContainer); //adiciona o container no stageCanvas
    	mapaConceitual.renderizar();
    };
    
    
    this.redesenharConceito = function(conceitoContainer) {
    	var cor = conceito.getCorFundoViaId(mapaConceitual.conceitosSelecionados[0]);
    	var altura = conceito.getAltura(conceitoContainer);
		var largura = conceito.getLargura(conceitoContainer);
		var rect = conceitoContainer.getChildByName("retangulo");
		
		rect.graphics.clear();
		rect.graphics.beginFill(cor).drawRoundRect( //adiciona na posicao zero,zero
				0,0,largura,altura,3);
		mapaConceitual.renderizar();
    };
    

    /**
     * 
     */
    this.getAltura = function(conceitoContainer) {
        return conceitoContainer.getBounds().height;
    };

    /**
     * 
     */
    this.getConceitoContainer = function(){
        return conceitoContainer;
    };
    
    
    
    
    /**
     * 
     */
    this.getConceitoContainerViaId = function(idConceito,mapa){
        var conceitoContainer = mapa.getStageCanvas().getChildAt(idConceito);
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
    this.getId = function(conceitoContainer){
    	return mapaConceitual.getStageCanvas().getChildIndex(conceitoContainer);
    };

    /**
     * 
     */
    this.getLargura = function(conceitoContainer) {
    	return conceitoContainer.getBounds().width;
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
    this.getRetangulo = function(conceitoContainer) {
    	return conceitoContainer.getChildByName("retangulo");
    };
    
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
    
    /**
     * 
     */
    this.setX = function(idConceito, novoX, mapa) {
    	var conceitoContainer = conceito.getConceitoContainerViaId(idConceito,mapa);
    	conceitoContainer.x = novoX;
    };
    
    
    /**
     * 
     */
    this.setY = function(idConceito, novoY, mapa) {
    	var conceitoContainer = conceito.getConceitoContainerViaId(idConceito,mapa);
    	conceitoContainer.y = novoY;
    };
    
    texto = textoConceito;
    fonte = fonteP;
    tamanhoFonte = tamanhoFonteP;
    corFonte = corFonteP; 
    corFundo = corFundoP;
    
    conceitoContainer = new createjs.Container();
	conceitoContainer.name = "conceito";
	
    label = new createjs.Text(texto, tamanhoFonte + " " + fonte, corFonte);
    label.name = "label";
	
    
    retangulo = new createjs.Shape();
	retangulo.name = "retangulo";
	
	adicionarDragDrop(this);
}
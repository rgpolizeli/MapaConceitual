function Coordenadas (conceito, ligacao){
    	this.conceito = conceito;
    	this.ligacao = ligacao;
}


function Ligacao(origem, textoLigacao, fonteP, tamanhoFonteP, corFonteP, corFundoP, mapaConceitual, idConceitoPaiP, idConceitoFilhoP){
	var altura;
    var ligacaoContainer;
    var id;
    var label;
    var linhaPai;
    var linhaFilho;
    var graphicPai;
    var graphicFilho;
    var largura;
    var retangulo;
    var fonte;
    var tamanhoFonte;
    var corFonte;
    var corFundo;
    var conceito;
    var idConceitoPai;
    var idConceitoFilho;
    var espessuraLinha;
    var corLinha;
    var ligacao;
    
    var coordenadasPontaConceitoPai = new Object();
	var coordenadasPontaLigacaoPai = new Object(); 
    
	var coordenadasPontaConceitoFilho = new Object();
	var coordenadasPontaLigacaoFilho = new Object();
    
    /**
     * 
     */
    var adicionarDragDrop = function(ligacao){
    	ligacaoContainer.addEventListener("pressmove", function(evt){
    		
    		var novoX = (evt.stageX - 50 - mapaConceitual.getStageCanvas().x); //a nova posicao do conceitoContainer eh a posicao do mouse para onde foi arrastado - o deslocamento do stageCanvas
    		var novoY = (evt.stageY - 25 - mapaConceitual.getStageCanvas().y);
    	    
    		evt.currentTarget.x = novoX;
    	    evt.currentTarget.y = novoY;
    	    
    	    //atualiza a linhas de ligacao na tela
    	    ligacao.atualizarLigacoesAoMoverLigacao(0, ligacaoContainer,ligacao.getId(ligacaoContainer), mapaConceitual);
    	    
    		mapaConceitual.renderizar();
    		
    		//atualiza a posicao da palavra de ligacao e envia para o servidor se local
    		mapaConceitual.getGerenciadorLista().atualizarLigacaoNaListaAoMoverLigacao(0,ligacao.getId(ligacaoContainer), novoX, novoY);
        });
    };

    
    this.atualizarLigacoesAoMoverLigacao = function (origem, ligacaoContainer, idLigacao, mapa){
    	var idConceito;
    	var idLinha;
    	var coordenadas;
    	var conceitoContainer;
    	var graphic;
    	var linha;
    	var papelConceito; //pai eh 0 e filho eh 1
    	var qtdFilhos = $('ul#' + idLigacao).children("li[title='qtdFilhos']").attr('value');
    	
    	var itemLista;
    	var conceito = new Conceito();
    	
    	//linha referente ao conceito pai
    	papelConceito = 0;
    	
    	idConceito = $('ul#' + idLigacao).children("li[title='idConceitoPai']").val();
    	idLinha = $('ul#' + idLigacao).children("li[title='idLinhaPai']").val();
    	
    	conceitoContainer = conceito.getConceitoContainerViaId(idConceito, mapa);
		linhaContainer = ligacao.getLinhaContainerViaId(idLinha, mapa);
		 
		 coordenadas = calcularNovaPonta(conceitoContainer, ligacaoContainer);
		 graphic = new createjs.Graphics();
		 graphic.setStrokeStyle(3,"round").beginStroke("#000");
		 
		 graphic.moveTo(coordenadas.conceito.x,coordenadas.conceito.y);
		 graphic.lineTo(coordenadas.ligacao.x,coordenadas.ligacao.y);
		 linhaContainer.graphics.clear();
		 linhaContainer.graphics = graphic;
		 
		 mapa.getGerenciadorLista().atualizarLigacaoNaListaAoMoverConceito(origem, papelConceito, coordenadas, idLigacao);
		 
		 
    	//linhas referentes aos outros conceitos
		 
		var listaConceitosFilhos = $('ul#' + idLigacao + " li[title^='idConceitoFilho']");
		 
    	for(var i=0; listaConceitosFilhos.get(i) != undefined ; i++){
    		papelConceito = $(listaConceitosFilhos.get(i)).attr("title").replace("idConceitoFilho","");
    		
    		idConceito = $('ul#' + idLigacao).children("li[title='idConceitoFilho"+ papelConceito + "']").attr('value');
        	idLinha = $('ul#' + idLigacao).children("li[title='idLinhaFilho" + papelConceito + "']").attr('value');
        	
        	conceitoContainer = conceito.getConceitoContainerViaId(idConceito, mapa);
    		linhaContainer = ligacao.getLinhaContainerViaId(idLinha, mapa);
    		 
    		coordenadas = calcularNovaPonta(conceitoContainer, ligacaoContainer);
    		graphic = new createjs.Graphics();
    		graphic.setStrokeStyle(3,"round").beginStroke("#000");
    		
    		graphic.moveTo(coordenadas.conceito.x,coordenadas.conceito.y);
    		graphic.lineTo(coordenadas.ligacao.x,coordenadas.ligacao.y);
    		linhaContainer.graphics.clear();
    		linhaContainer.graphics = graphic;
    		 
    		mapa.getGerenciadorLista().atualizarLigacaoNaListaAoMoverConceito(origem, papelConceito, coordenadas, idLigacao);
    	}
    };
    
    
    /**
     * 
     */
    this.atualizarLigacoesAoMoverConceito = function(origem, conceitoContainer, idConceito, mapa){
    	
    	var idLigacao;
    	var idLinha;
    	var coordenadas;
    	var ligacaoContainer;
    	var graphic;
    	var papelConceito; //pai eh 0 e filho eh 1
    	var listaConceitosFilhos;
    	
    	var conteudoLista = $('ul#' + idConceito).children("li[title='idLigacao']");
    	
    	for(var i=0; conteudoLista.get(i) != undefined; i++){
    		 idLigacao = conteudoLista.get(i).value;
    		 
    		 listaConceitosFilhos = $('ul#' + idLigacao + " li[title^='idConceitoFilho']");
    		 
    		 if($('ul#' + idLigacao).children("li[title='idConceitoPai']").attr('value') == idConceito){
    			 idLinha = $('ul#' + idLigacao).children("li[title='idLinhaPai']").attr('value');
    			 papelConceito = 0;
    		 }
    		 else{
    			 for(var j = 0; listaConceitosFilhos.get(j) != undefined; j++){
    				 var id = listaConceitosFilhos.get(j).value;
    				 if(id == idConceito){
    					 papelConceito = $(listaConceitosFilhos.get(j)).attr("title").replace("idConceitoFilho","");
    					 papelConceito = parseInt(papelConceito);
    					 idLinha = $('ul#' + idLigacao).children("li[title='idLinhaFilho" + papelConceito + "']").attr('value');
    				 }
    			 }
    		 }
    		 
    		 ligacaoContainer = ligacao.getLigacaoContainerViaId(idLigacao, mapa);
    		 linhaContainer = ligacao.getLinhaContainerViaId(idLinha, mapa);
    		 
    		 coordenadas = calcularNovaPonta(conceitoContainer, ligacaoContainer);
    		 graphic = new createjs.Graphics();
    		 graphic.setStrokeStyle(3,"round").beginStroke("#000");
    		 
    		 graphic.moveTo(coordenadas.conceito.x,coordenadas.conceito.y);
    		 graphic.lineTo(coordenadas.ligacao.x,coordenadas.ligacao.y);
    		 linhaContainer.graphics.clear();
    		 linhaContainer.graphics = graphic;
    		 
    		 mapa.getGerenciadorLista().atualizarLigacaoNaListaAoMoverConceito(origem, papelConceito, coordenadas, idLigacao);
    	}

    };
    
    
    /**
     * 
     */
    this.desenharLigacao = function() {
    	var posicaoLigacaoX;
    	var posicaoLigacaoY;
    	var conceito;
    	var conceitoContainerPai;
    	var conceitoContainerFilho;
    	
    	
    	conceito = new Conceito();
    	conceitoContainerPai = conceito.getConceitoContainerViaId(idConceitoPai, mapaConceitual);
    	conceitoContainerFilho = conceito.getConceitoContainerViaId(idConceitoFilho, mapaConceitual);
    	
    	label.textAlign = "center";
    	label.textBaseline = "middle";
    	label.x = (largura/2);
    	label.y = (altura/2);
    	
    	retangulo.graphics.beginFill(corFundo).drawRoundRect( //adiciona na posicao zero,zero
    			0,0,largura,altura,3);
    	retangulo.setBounds(0,0,largura,altura);
    	
    	ligacaoContainer.addChild(retangulo, label); //adiciona o retangulo e o label no container
    	
    	
    	// ATENCAO: conceito.x retorna string e nao number como consta na documentacao da easeljs
    	posicaoLigacaoX = (parseFloat(conceitoContainerPai.x) + parseFloat(conceitoContainerFilho.x))/2;
    	posicaoLigacaoY = (parseFloat(conceitoContainerPai.y) + parseFloat(conceitoContainerFilho.y))/2;
    	
    	ligacaoContainer.x = posicaoLigacaoX;
    	ligacaoContainer.y = posicaoLigacaoY;
    	
    	desenharLinhas(conceitoContainerPai, conceitoContainerFilho);
    	
    	mapaConceitual.getStageCanvas().addChild(ligacaoContainer); //adiciona o container no stageCanvas
    	mapaConceitual.renderizar();
    };

    
    /**
     * 
     */
     function desenharLinhas(conceitoContainerPai, conceitoContainerFilho) {
    	var coordenadasLinhaPai;
    	var coordenadasLinhaFilho;
    	
    	//desenhando linha Pai
    	coordenadasLinhaPai = calcularNovaPonta(conceitoContainerPai,ligacaoContainer);
    	
    	coordenadasPontaConceitoPai = coordenadasLinhaPai.conceito;
    	coordenadasPontaLigacaoPai = coordenadasLinhaPai.ligacao;
    	
    	graphicPai.moveTo(coordenadasLinhaPai.conceito.x,coordenadasLinhaPai.conceito.y);
    	graphicPai.lineTo(coordenadasLinhaPai.ligacao.x,coordenadasLinhaPai.ligacao.y);
    	linhaPai.graphics = graphicPai;
    	mapaConceitual.getStageCanvas().addChild(linhaPai);
    	
    	//desenhando linha Filho
    	coordenadasLinhaFilho = calcularNovaPonta(conceitoContainerFilho,ligacaoContainer);
    	
    	coordenadasPontaConceitoFilho = coordenadasLinhaFilho.conceito;
    	coordenadasPontaLigacaoFilho = coordenadasLinhaFilho.ligacao;
    	
    	graphicFilho.moveTo(coordenadasLinhaFilho.conceito.x,coordenadasLinhaFilho.conceito.y);
    	graphicFilho.lineTo(coordenadasLinhaFilho.ligacao.x,coordenadasLinhaFilho.ligacao.y);
    	linhaFilho.graphics = graphicFilho;
    	mapaConceitual.getStageCanvas().addChild(linhaFilho);
    	
    };
    
    /**
     * calcula os novos pontos de interconexão entre conceitos ou palavras de ligacao conectados
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
    	
    	
    	if(ligacaoY >= coordenadas.conceito[6].y){ //pontaLigacao[1] à pontaConceito[5]
    		
    		coordenadasFinais.conceito.x = coordenadas.conceito[5].x;
    		coordenadasFinais.conceito.y = coordenadas.conceito[5].y;
    		coordenadasFinais.ligacao.x = coordenadas.ligacao[1].x;
    		coordenadasFinais.ligacao.y = coordenadas.ligacao[1].y;
    		return coordenadasFinais;
    	}
    	if(ligacaoY < coordenadas.conceito[6].y && coordenadas.ligacao[4].x <= conceitoX){ //pontaLigacao[3] à pontaConceito[7]
    		
    		coordenadasFinais.conceito.x = coordenadas.conceito[7].x;
    		coordenadasFinais.conceito.y = coordenadas.conceito[7].y;
    		coordenadasFinais.ligacao.x = coordenadas.ligacao[3].x;
    		coordenadasFinais.ligacao.y = coordenadas.ligacao[3].y;
    		return coordenadasFinais;
    	}
    	if(coordenadas.ligacao[5].y <= conceitoY){ //pontaLigacao[5] à pontaConceito[1]
    		
    		coordenadasFinais.conceito.x = coordenadas.conceito[1].x;
    		coordenadasFinais.conceito.y = coordenadas.conceito[1].y;
    		coordenadasFinais.ligacao.x = coordenadas.ligacao[5].x;
    		coordenadasFinais.ligacao.y = coordenadas.ligacao[5].y;
    		return coordenadasFinais;
    	}
    	if(coordenadas.ligacao[6].y > conceitoY && coordenadas.ligacao[4].x >= conceitoX){ //pontaLigacao[3] à pontaConceito[7]
    		
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
    this.getAltura = function(ligacaoContainer) {
    	return ligacaoContainer.getBounds().height;
    };

    /**
     * 
     */
    this.getLigacaoContainer = function(){
        return ligacaoContainer;
    };
    
    
    /**
     * 
     */
    this.getLigacaoContainerViaId = function(idLigacao,mapa){
        var ligacaoContainer = mapa.getStageCanvas().getChildAt(idLigacao);
    	return ligacaoContainer;
    };
    
    
    /**
     * 
     */
    this.getCorFonte = function(){
        return corFonte;
    };
    
    var coordenadasPontaConceitoPai = new Object();
	var coordenadasPontaLigacaoPai = new Object();
    
	/**
     * 
     */
    this.getCoordenadasPontaConceitoPai = function(){
        return coordenadasPontaConceitoPai;
    };
	
    /**
     * 
     */
    this.getCoordenadasPontaLigacaoPai = function(){
        return coordenadasPontaLigacaoPai;
    };
	
    /**
     * 
     */
    this.getCoordenadasPontaConceitoFilho = function(){
        return coordenadasPontaConceitoFilho;
    };
    
    /**
     * 
     */
    this.getCoordenadasPontaLigacaoFilho = function(){
        return coordenadasPontaLigacaoFilho;
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
    this.getId = function(ligacaoContainer){
    	return mapaConceitual.getStageCanvas().getChildIndex(ligacaoContainer);
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
    this.getLargura = function(ligacaoContainer) {
        return ligacaoContainer.getBounds().width;
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
    this.getRetangulo = function(ligacaoContainer) {
    	return ligacaoContainer.getChildByName("retangulo");
    };
    
    /**
     * 
     */
    this.getLabel = function(conceitoContainer) {
    	return ligacaoContainer.getChildByName("label");
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
    this.setIdLigacao = function(ligacaoContainer,novoId) {
    	mapaConceitual.getStageCanvas().setChildIndex(ligacaoContainer,novoId);
    };
    
    /**
     * 
     */
    this.setIdLinhaPai = function(linhaPaiContainer,novoId) {
    	mapaConceitual.getStageCanvas().setChildIndex(linhaPaiContainer,novoId);
    };
    
    /**
     * 
     */
    this.setIdLinhaFilho = function(linhaFilhoContainer,novoId) {
    	mapaConceitual.getStageCanvas().setChildIndex(linhaFilhoContainer,novoId);
    };
    
    
    /**
     * 
     */
    this.setX = function(idLigacao, novoX, mapa) {
    	var ligacaoContainer = ligacao.getLigacaoContainerViaId(idLigacao,mapa);
    	ligacaoContainer.x = novoX;
    };
    
    
    /**
     * 
     */
    this.setY = function(idLigacao, novoY, mapa) {
    	var ligacaoContainer = ligacao.getLigacaoContainerViaId(idLigacao,mapa);
    	ligacaoContainer.y = novoY;
    };
    
    ligacao = this;
    
    
   
    idConceitoPai = idConceitoPaiP;
    idConceitoFilho =idConceitoFilhoP; 
    
    altura = 30;
    largura = 80;
    texto = textoLigacao;
    fonte = fonteP;
    tamanhoFonte = tamanhoFonteP;
    corFonte = corFonteP; 
    corFundo = corFundoP;
    
    ligacaoContainer = new createjs.Container();
    ligacaoContainer.name = "ligacao";
	
    label = new createjs.Text(texto, tamanhoFonte + " " + fonte, corFonte);
    label.name = "label";
	
    
    retangulo = new createjs.Shape();
	retangulo.name = "retangulo";
	
	linhaPai = new createjs.Shape(); //liga a ponta do conceito 1 a ponta da palavra de ligacao
	linhaFilho = new createjs.Shape(); //liga a ponta do conceito 2 a ponta da palavra de ligacao
	
	graphicPai = new createjs.Graphics(); //define as propriedades graficas da linhaPai
	graphicFilho = new createjs.Graphics(); //define as propriedades graficas da linhaFilho
	
	espessuraLinha = 2;
	corLinha = "#000";
	
	
	graphicPai.setStrokeStyle(espessuraLinha,"round").beginStroke(corLinha);
	graphicFilho.setStrokeStyle(espessuraLinha,"round").beginStroke(corLinha);
	
	
	adicionarDragDrop(this);
}
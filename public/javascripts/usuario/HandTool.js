function HandTool(stage, renderizarMapa){
	
	var handTool = this;
	
	var stageCanvas = stage;
	
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
		
		renderizarMapa();	
    };

    /**
     * remove o retanguloHandTool do stageCanvas e manda atualizar a tela
     */
    this.destruirRetangulo = function() {
    	var retanguloID = stageCanvas.getChildIndex(retangulo);
    	stageCanvas.removeChildAt(retanguloID);
    	renderizarMapa();
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
    			renderizarMapa();
    			novaPosicaoAntiga.x = evt.stageX;
    			return novaPosicaoAntiga;
    		}
    		if (novaPosicaoAntiga.x > evt.stageX) {
    			stageCanvas.setTransform(stageCanvas.x - (novaPosicaoAntiga.x-evt.stageX));
    			renderizarMapa();
    			novaPosicaoAntiga.x = evt.stageX;
    			return novaPosicaoAntiga;
    		}
    		
    		return novaPosicaoAntiga; //se X for igual a evt.stageX
    	}
    	
        if(!novaPosicaoAntiga.x && novaPosicaoAntiga.y){
    		
    		novaPosicaoAntiga.x = evt.stageX;
    		
    		if (novaPosicaoAntiga.y < evt.stageY) {
    			stageCanvas.setTransform(novaPosicaoAntiga.x,stageCanvas.y - (evt.stageY - novaPosicaoAntiga.y) );
    			renderizarMapa();
    			novaPosicaoAntiga.y = evt.stageY;
    			return novaPosicaoAntiga;
    		}
    		if (novaPosicaoAntiga.y > evt.stageY) {
    			stageCanvas.setTransform(novaPosicaoAntiga.x, stageCanvas.y + (novaPosicaoAntiga.y - evt.stageY));
    			renderizarMapa();
    			novaPosicaoAntiga.y = evt.stageY;
    			return novaPosicaoAntiga;
    		}
    		return novaPosicaoAntiga; //se X for igual a evt.stageX
    	}

    		if(novaPosicaoAntiga.x && novaPosicaoAntiga.y){
    		
    		if (novaPosicaoAntiga.y < evt.stageY && novaPosicaoAntiga.x < evt.stageX){ //para baixo e para a direita
    			stageCanvas.setTransform(stageCanvas.x + (evt.stageX - novaPosicaoAntiga.x),
    					stageCanvas.y - (evt.stageY - novaPosicaoAntiga.y));
    			renderizarMapa();
    			
    			novaPosicaoAntiga.x = evt.stageX;
    			novaPosicaoAntiga.y = evt.stageY;
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y > evt.stageY && novaPosicaoAntiga.x > evt.stageX) { //para cima e para a esquerda
    			stageCanvas.setTransform(stageCanvas.x - (novaPosicaoAntiga.x-evt.stageX),
    					stageCanvas.y + (novaPosicaoAntiga.y - evt.stageY));
    			renderizarMapa();
    			
    			novaPosicaoAntiga.y = evt.stageY;
    			novaPosicaoAntiga.x = evt.stageX;
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y < evt.stageY && novaPosicaoAntiga.x > evt.stageX) { //para baixo e para a esquerda
    			stageCanvas.setTransform(stageCanvas.x - (novaPosicaoAntiga.x-evt.stageX),
    					stageCanvas.y - (evt.stageY - novaPosicaoAntiga.y));
    			renderizarMapa();
    			
    			novaPosicaoAntiga.y = evt.stageY;
    			novaPosicaoAntiga.x = evt.stageX;
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y > evt.stageY && novaPosicaoAntiga.x < evt.stageX) { //para cima e para a direita
    			stageCanvas.setTransform(stageCanvas.x + (evt.stageX - novaPosicaoAntiga.x),
    					stageCanvas.y + (novaPosicaoAntiga.y - evt.stageY));
    			renderizarMapa();
    			
    			novaPosicaoAntiga.y = evt.stageY;
    			novaPosicaoAntiga.x = evt.stageX;
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y == evt.stageY && novaPosicaoAntiga.x < evt.stageX) { //para a direita
    			stageCanvas.setTransform(stageCanvas.x + (evt.stageX - novaPosicaoAntiga.x),
    					stageCanvas.y + (novaPosicaoAntiga.y - evt.stageY));
    			renderizarMapa();
    			
    			
    			novaPosicaoAntiga.x = evt.stageX;
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y == evt.stageY && novaPosicaoAntiga.x > evt.stageX) { //para a esquerda
    			stageCanvas.setTransform(stageCanvas.x - (novaPosicaoAntiga.x-evt.stageX),
    					stageCanvas.y + (novaPosicaoAntiga.y - evt.stageY));
    			renderizarMapa();
    			
    			
    			novaPosicaoAntiga.x = evt.stageX;
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y > evt.stageY && novaPosicaoAntiga.x == evt.stageX) { //para cima
    			stageCanvas.setTransform(stageCanvas.x + (evt.stageX - novaPosicaoAntiga.x),
    					stageCanvas.y + (novaPosicaoAntiga.y - evt.stageY));
    			renderizarMapa();
    			
    			novaPosicaoAntiga.y = evt.stageY;
    			
    			
    			return novaPosicaoAntiga;
    		}
    		
    		if (novaPosicaoAntiga.y < evt.stageY && novaPosicaoAntiga.x == evt.stageX) { //para baixo
    			stageCanvas.setTransform(stageCanvas.x - (novaPosicaoAntiga.x-evt.stageX),
    					stageCanvas.y - (evt.stageY - novaPosicaoAntiga.y));
    			renderizarMapa();
    			
    			novaPosicaoAntiga.y = evt.stageY;
    			
    			
    			return novaPosicaoAntiga;
    		}
    		
    		return novaPosicaoAntiga; //se X for igual a evt.stageX
    	}
        
      return novaPosicaoAntiga;
    };
    
}
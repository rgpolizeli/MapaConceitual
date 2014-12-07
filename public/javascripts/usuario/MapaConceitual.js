
function MapaConceitual(id, nomeCanvasP, listaElementos, criarSemiLigacaoCallBack, selecionarCallback, desselecionarCallBack, abrirCriarLigacaoCallBack){
	
    var idMapa = id;
    
    var nomeCanvas = nomeCanvasP;
    var stageCanvas = new createjs.Stage(nomeCanvas);
    
    createjs.Touch.enable(stageCanvas);
    var objetosSelecionados = new Array();
    this.ligacaoSelecionada;
    var mapa = this;
    var criarLigacao;
    
    var gerenciadorLista = new GerenciadorLista(listaElementos);
    
    var gerenciadorLigacao = new GerenciadorLigacao();
    var gerenciadorConceito = new GerenciadorConceito();
    var gerenciadorSemiLigacao = new GerenciadorSemiLigacao();
    var handTool = new HandTool(stageCanvas, renderizar);
    
    
    this.getAlturaObjeto = function getAlturaObjeto( idObjeto ){
    	var containerObjeto;
    	
    	containerObjeto = mapa.getContainerViaId(idObjeto);
    	return gerenciadorConceito.getAltura(containerObjeto);
    };
    
    this.getLarguraObjeto = function getLarguraObjeto( idObjeto ){
    	var containerObjeto;
    	
    	containerObjeto = mapa.getContainerViaId(idObjeto);
    	return gerenciadorConceito.getLargura(containerObjeto);
    };
    
    
    this.getAlturaMinima = function getAlturaMinima( idObjeto ){
    	return gerenciadorLista.getAlturaMinima(idObjeto);
    };
    
    this.getLarguraMinima = function getLarguraMinima( idObjeto ){
    	return gerenciadorLista.getLarguraMinima(idObjeto);
    };
    
    
    this.verificarTipoObjeto = function verificarTipoObjeto(idObjeto){
    	var tipoObjeto;
    	
    	tipoObjeto = gerenciadorLista.getConceito(idObjeto).attr('title');
    	return tipoObjeto;
    };
    
    
    this.editar = function( propriedades ){
    	var containerObjeto;
    	
    	containerObjeto = mapa.getContainerViaId(propriedades.idObjeto);
    	if(containerObjeto.name == "conceito"){
    		var conceitoNaLista;
    		
    		conceitoNaLista = gerenciadorLista.getConceito(propriedades.idObjeto);
    		gerenciadorConceito.redesenharConceitoAposEdicao(containerObjeto, propriedades, stageCanvas, 
    				gerenciadorLista.setAlturaMinima, gerenciadorLista.setLarguraMinima, 
    				gerenciadorLista.getAlturaMinima, gerenciadorLista.getLarguraMinima, renderizar);
    		gerenciadorLigacao.atualizarLigacoesAoMoverConceito(propriedades.idObjeto, containerObjeto, conceitoNaLista, 
    				gerenciadorLista.getLigacao, stageCanvas);
    		gerenciadorLista.setCorFundo(propriedades.idObjeto, propriedades.corFundo);
    		renderizar();
    	}
    	else
    		if(containerObjeto.name == "ligacao"){
    			var ligacaoNaLista;
    			
    			ligacaoNaLista = gerenciadorLista.getLigacao(propriedades.idObjeto);
    			gerenciadorLigacao.redesenharLigacaoAposEdicao(containerObjeto, propriedades, stageCanvas, 
    					gerenciadorLista.setAlturaMinima, gerenciadorLista.setLarguraMinima, 
        				gerenciadorLista.getAlturaMinima, gerenciadorLista.getLarguraMinima, renderizar);
    			gerenciadorLigacao.atualizarLigacoesAoMoverLigacao(containerObjeto, ligacaoNaLista, stageCanvas);
        		gerenciadorLista.setCorFundo(propriedades.idObjeto, propriedades.corFundo);
        		renderizar();
    		}
    };
    
    this.getPropriedadesObjetoSelecionado = function(){
    	var idObjeto;
    	var propriedades;
    	var conceitoContainer;
    	var label;
    	var i;
    	var fonteCompleta;
    	var fonte;
    	var tamanhoFonte;
    	
    	idObjeto = mapa.getIdObjetoSelecionado();
    	conceitoContainer = gerenciadorConceito.getConceitoContainerViaId(idObjeto, stageCanvas);
    	label = conceitoContainer.getChildByName("label");
    	
    	fonteCompleta = label.font; //contem a familia da fonte e o tamanho da fonte
    	i = fonteCompleta.indexOf(" ");
    	fonte = fonteCompleta.slice(i+1, fonteCompleta.length);
    	tamanhoFonte = fonteCompleta.slice(0,i);
    	
    	propriedades = {
    		corFundo: gerenciadorLista.getCorFundo(idObjeto),
    		corFonte: label.color,
    		texto: label.text,
    		fonte: fonte,
    		tamanhoFonte: tamanhoFonte
    	};
    	
    	return propriedades;
    };
    
    
    this.getIdObjetoSelecionado = function(){
    	return objetosSelecionados[0];
    };
    
    
    this.atualizarPosicaoConceito = function (mensagem){
		var conceitoContainer;
		
		
		conceitoContainer = gerenciadorConceito.getConceitoContainerViaId(mensagem.idConceito, stageCanvas);
		
		if(conceitoContainer.parent){ //para o caso do conceito ter sido deletado por um usuario e mensagens para mover este conceito terem chegado logo em seguida.
			var conceitoNaLista;
			
			if(mensagem.novoX != "default")
				gerenciadorConceito.setX(mensagem.idConceito, mensagem.novoX, stageCanvas);
			if(mensagem.novoY != "default")
				gerenciadorConceito.setY(mensagem.idConceito, mensagem.novoY, stageCanvas);
			
			conceitoNaLista = gerenciadorLista.getConceito(mensagem.idConceito);
			gerenciadorLigacao.atualizarLigacoesAoMoverConceito(mensagem.idConceito, conceitoContainer, conceitoNaLista, gerenciadorLista.getLigacao, stageCanvas);
			
			renderizar();	
		}
	};
	
	this.atualizarPosicaoLigacao = function (mensagem){
		var ligacaoContainer;
		var ligacaoNaLista;
		
		ligacaoContainer = gerenciadorLigacao.getLigacaoContainerViaId(mensagem.idLigacao, stageCanvas);
		
		if(ligacaoContainer.parent){
			
			if(mensagem.novoX != "default")
				gerenciadorLigacao.setX(mensagem.idLigacao, mensagem.novoX, stageCanvas);
			if(mensagem.novoY != "default")
				gerenciadorLigacao.setY(mensagem.idLigacao, mensagem.novoY, stageCanvas);
			
			ligacaoNaLista = gerenciadorLista.getLigacao(mensagem.idLigacao);
			//atualiza a linhas de ligacao na tela
			gerenciadorLigacao.atualizarLigacoesAoMoverLigacao(ligacaoContainer, ligacaoNaLista, stageCanvas);
			
			renderizar();
		}
	};
	
    

    this.inserirConceito = function (propriedades, montarMensagemAoMoverConceito, montarMensagemAoAlterarTamanhoConceito, enviarMensagemAoServidor){
    	var conceitoContainer;
    	
    	conceitoContainer = gerenciadorConceito.desenharConceito( propriedades.texto, propriedades.fonte, propriedades.tamanhoFonte, 
    			propriedades.corFonte, propriedades.corFundo, (stageCanvas.x), (stageCanvas.y) );
    	stageCanvas.addChild(conceitoContainer); //adiciona o container no stageCanvas
    	setIdObjeto(conceitoContainer, propriedades.idConceito);
    	
    	gerenciadorConceito.adicionarDragDrop(idMapa,conceitoContainer, stageCanvas, gerenciadorLista.getConceito,
    			gerenciadorLista.getLigacao, gerenciadorLista.getCorFundo, gerenciadorLista.getAlturaMinima, gerenciadorLista.getLarguraMinima, 
    			gerenciadorLigacao.atualizarLigacoesAoMoverConceito, removerFilho, renderizar, 
    			montarMensagemAoMoverConceito, montarMensagemAoAlterarTamanhoConceito, enviarMensagemAoServidor);
    	renderizar();
    	gerenciadorLista.adicionarConceitoNaLista(propriedades.idConceito, propriedades.corFundo, propriedades.alturaMinima, propriedades.larguraMinima);
    };
    
    
    this.inserirLigacao = function (propriedades, montarMensagemAoMoverLigacao, montarMensagemAoAlterarTamanhoLigacao, enviarMensagemAoServidor){
    	var containers;
    	var conceitoContainerPai;
    	var conceitoContainerFilho;
    	
    	conceitoContainerPai = gerenciadorConceito.getConceitoContainerViaId(propriedades.idConceitoPai, stageCanvas);
    	conceitoContainerFilho = gerenciadorConceito.getConceitoContainerViaId(propriedades.idConceitoFilho, stageCanvas);
    	
    	
    	containers = gerenciadorLigacao.desenharLigacao( propriedades.texto, propriedades.fonte, propriedades.tamanhoFonte, 
    			propriedades.corFonte, propriedades.corFundo, conceitoContainerPai, conceitoContainerFilho );
    	
    	stageCanvas.addChild(containers["ligacaoContainer"]); //adiciona o container no stageCanvas
    	stageCanvas.addChild(containers["linhaPaiContainer"]);
    	stageCanvas.addChild(containers["linhaFilhoContainer"]);
    	
    	setIdObjeto(containers["ligacaoContainer"], propriedades.idLigacao);
    	setIdObjeto(containers["linhaPaiContainer"], propriedades.idLinhaPai);
    	setIdObjeto(containers["linhaFilhoContainer"], propriedades.idLinhaFilho);
    	
    	gerenciadorLigacao.adicionarDragDrop(idMapa,containers["ligacaoContainer"], stageCanvas, gerenciadorLista.getLigacao, 
    			gerenciadorLista.getCorFundo, gerenciadorLista.getAlturaMinima, gerenciadorLista.getLarguraMinima, 
    			removerFilho, renderizar, montarMensagemAoMoverLigacao, montarMensagemAoAlterarTamanhoLigacao, enviarMensagemAoServidor);
    	
    	renderizar();
    	gerenciadorLista.adicionarLigacaoNaLista(propriedades.idLigacao, propriedades.idLinhaPai, propriedades.idLinhaFilho, 
    			propriedades.idConceitoPai,	propriedades.idConceitoFilho, propriedades.corFundo, 
    			propriedades.alturaMinima, propriedades.larguraMinima);
    };
    
    
    this.inserirSemiLigacao = function (idConceitoP, idLigacaoP, idLinhaP, novaQtdFilhosLigacaoP, papelConceitoP){
    	
    	var idConceito;
    	var idLigacao;
    	var idLinha;
    	var novaQtdFilhosLigacao;
    	var papelConceito;
    	var conceitoContainer;
    	var ligacaoContainer;
    	var semiLigacaoContainer;
    	
    	idConceito = idConceitoP;
    	idLigacao = idLigacaoP;
    	idLinha = idLinhaP;
    	novaQtdFilhosLigacao = novaQtdFilhosLigacaoP;
    	papelConceito = papelConceitoP;
    	
    	conceitoContainer = gerenciadorConceito.getConceitoContainerViaId(idConceito, stageCanvas);
    	ligacaoContainer = gerenciadorLigacao.getLigacaoContainerViaId(idLigacao, stageCanvas);
		
		semiLigacaoContainer = gerenciadorSemiLigacao.desenharSemiLigacao(conceitoContainer, ligacaoContainer);
		stageCanvas.addChild(semiLigacaoContainer);
		
		setIdObjeto(semiLigacaoContainer, idLinha);
		
		renderizar();
		
		gerenciadorLista.adicionarSemiLigacaoNaLista(idConceito, idLigacao, idLinha, novaQtdFilhosLigacao, papelConceito);
    };
    
    function setIdObjeto(objetoContainer, novoId){
    	
    	//kids sao os elementos do stageCanvas
    	var kids = stageCanvas.children, l = kids.length;
		if (objetoContainer.parent != stageCanvas || novoId < 0) { return; }
		
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
    }
    
    
    this.desselecionar = function() {
    	//entra se houver algum objeto selecionado e nao estiver sendo criada uma nova ligacao
    	
    	var r = verificarCriarLigacao();
    	
		if(objetosSelecionados[0] != undefined && r == false ){
			
			if(mapa.getContainerViaId(objetosSelecionados[0]).name=="conceito"){
				
				var corFundo = gerenciadorLista.getCorFundo(objetosSelecionados[0]);
				gerenciadorConceito.redesenharConceitoAposDesselecao(objetosSelecionados[0], corFundo, stageCanvas);
				objetosSelecionados[0] = undefined;
				renderizar();
				return desselecionarCallBack();
			}
			
			if(mapa.getContainerViaId(objetosSelecionados[0]).name=="ligacao"){
				
				var corFundo = gerenciadorLista.getCorFundo(objetosSelecionados[0]);
				gerenciadorLigacao.redesenharLigacaoAposDesselecao(objetosSelecionados[0], corFundo, stageCanvas);
				objetosSelecionados[0] = undefined;
				renderizar();
				return desselecionarCallBack();
			}
		}
    };
    
    
    function selecionarConceito(objetoSelecionadoP) { //objetoSelecionado pode ser o retangulo ou label
    	var objetoSelecionado;
    	var corFundo;
    	
    	objetoSelecionado = objetoSelecionadoP;
    	objetosSelecionados[0] = gerenciadorConceito.getId(objetoSelecionado.parent, stageCanvas); //id do objeto no stage
    	corFundo = gerenciadorLista.getCorFundo(objetosSelecionados[0]);
    	gerenciadorConceito.selecionarConceito(objetoSelecionado, corFundo, stageCanvas, renderizar);
    	
    	return selecionarCallback;
    }
    

    function selecionarLigacao (objetoSelecionadoP) { //objetoSelecionado pode ser o retangulo ou label
    	var objetoSelecionado;
    	var corFundo;
    	
    	objetoSelecionado = objetoSelecionadoP;
    	objetosSelecionados[0] = gerenciadorLigacao.getId(objetoSelecionado.parent, stageCanvas); //id do objeto no stage
    	corFundo = gerenciadorLista.getCorFundo(objetosSelecionados[0]);
    	gerenciadorLigacao.selecionarLigacao(objetoSelecionado,corFundo, stageCanvas, renderizar);
    	renderizar();
    	
    	return selecionarCallback;
    }
    
    
    this.getListaExcluidos = function(idObjeto){
    	return gerenciadorLista.montarListaExcluidos(idObjeto);
    };
    
    
    this.excluir = function(msg){ //excluir fisicamente  e atualizar a lista
		$(msg).children().each( function(index, element){
			switch( $(element).attr("title") ){
				case "conceito":
					var idConceito = parseInt($(element).attr('id'));
					
					//remover as linhas graficamente
					$(msg).children("li[title='linha']").each( function(index, subElement){
						var idLinha = parseInt($(subElement).attr('id'));
						removerFilho(stageCanvas, idLinha);
					});
					
					
					var conceitoContainer = stageCanvas.getChildAt( idConceito );
					conceitoContainer.removeAllEventListeners("pressmove");
					mapa.desselecionar();
					removerFilho(stageCanvas, idConceito);
					renderizar();
					gerenciadorLista.excluirConceitoDaLista( idConceito );
					
				break;
				case "ligacao":
					var idLigacao = parseInt($(element).attr('id'));
					
					//remover as linhas graficamente
					$(msg).children("li[title='linha']").each( function(index, subElement){
						var idLinha = parseInt($(subElement).attr('id'));
						removerFilho(stageCanvas, idLinha);
					});
					
					var ligacaoContainer = stageCanvas.getChildAt( idLigacao );
					ligacaoContainer.removeAllEventListeners("pressmove");
					mapa.desselecionar();
					removerFilho(stageCanvas, idLigacao);
					renderizar();
					gerenciadorLista.excluirLigacaoDaLista( idLigacao );
				break;
			}
		});
	};
	
	this.alterarTamanhoConceito = function(mensagem){
		
		var conceitoContainer;
		var alturaMin;
		var larguraMin;
		
		conceitoContainer = mapa.getContainerViaId(mensagem.idConceito);
		alturaMin = mapa.getAlturaMinima(mensagem.idConceito);
		larguraMin = mapa.getLarguraMinima(mensagem.idConceito);
		
		if(alturaMin == 0){ // o tamanho nunca foi alterado, nem por edicao nem por alteracao de tamanho e o mapa nao esta sendo carregado
			alturaMin = mensagem.alturaMinima;
			larguraMin = mensagem.larguraMinima;
			
			gerenciadorLista.setAlturaMinima(mensagem.idConceito, alturaMin);
			gerenciadorLista.setLarguraMinima(mensagem.idConceito, larguraMin);
		}
		
		if(mensagem.novaAltura >= alturaMin && mensagem.novaLargura >= larguraMin){
			
			var conceitoNaLista;
			var corFundo;
			var propriedades;
			
			conceitoNaLista = gerenciadorLista.getConceito(mensagem.idConceito);
			corFundo = gerenciadorLista.getCorFundo(mensagem.idConceito);
			
			gerenciadorConceito.setAltura(conceitoContainer, mensagem.novaAltura);
			gerenciadorConceito.setLargura(conceitoContainer, mensagem.novaLargura);
			
			propriedades = {
					altura: mensagem.novaAltura,
					largura: mensagem.novaLargura,
					corFundo: corFundo
			};
			gerenciadorConceito.redesenharConceitoAposEdicao(conceitoContainer, propriedades, stageCanvas, null, null, null, null, removerFilho, renderizar);
			gerenciadorLigacao.atualizarLigacoesAoMoverConceito(mensagem.idConceito, conceitoContainer, conceitoNaLista, 
					gerenciadorLista.getLigacao, stageCanvas);
			gerenciadorConceito.recentralizarLabel(conceitoContainer);
			
			if(objetosSelecionados[0] == mensagem.idConceito) //se o conceito alterado estiver selecionado
				gerenciadorConceito.selecionarConceito(conceitoContainer.getChildAt(0), corFundo, stageCanvas, renderizar); // devo mandar a label devido a implementacao da funcao selecionar
			
			renderizar();
		}
	};
    
	this.alterarTamanhoLigacao = function(mensagem){
		
		var ligacaoContainer;
		var alturaMin;
		var larguraMin;
		
		ligacaoContainer = mapa.getContainerViaId(mensagem.idLigacao);
		alturaMin = mapa.getAlturaMinima(mensagem.idLigacao);
		larguraMin = mapa.getLarguraMinima(mensagem.idLigacao);

		if(alturaMin == 0){ // o tamanho nunca foi alterado, nem por edicao nem por alteracao de tamanho e o mapa nao esta sendo carregado
			alturaMin = mensagem.alturaMinima;
			larguraMin = mensagem.larguraMinima;
			
			gerenciadorLista.setAlturaMinima(mensagem.idLigacao, alturaMin);
			gerenciadorLista.setLarguraMinima(mensagem.idLigacao, larguraMin);
		}
		
		if(mensagem.novaAltura >= alturaMin && mensagem.novaLargura >= larguraMin){
			
			var ligacaoNaLista;
			var corFundo;
			var propriedades;
			
			ligacaoNaLista = gerenciadorLista.getLigacao(mensagem.idLigacao);
			corFundo = gerenciadorLista.getCorFundo(mensagem.idLigacao);
			
			gerenciadorLigacao.setAltura(ligacaoContainer, mensagem.novaAltura);
			gerenciadorLigacao.setLargura(ligacaoContainer, mensagem.novaLargura);
			
			propriedades = {
					altura: mensagem.novaAltura,
					largura: mensagem.novaLargura,
					corFundo:corFundo
			};
			
			gerenciadorLigacao.redesenharLigacaoAposEdicao(ligacaoContainer, propriedades, stageCanvas, renderizar);
			gerenciadorLigacao.atualizarLigacoesAoMoverLigacao(ligacaoContainer, ligacaoNaLista, stageCanvas);
			gerenciadorLigacao.recentralizarLabel(ligacaoContainer);
			
			if(objetosSelecionados[0] == mensagem.idLigacao) //se o conceito alterado estiver selecionado
				gerenciadorLigacao.selecionarLigacao(ligacaoContainer.getChildAt(0), corFundo, stageCanvas, renderizar); // devo mandar a label devido a implementacao da funcao selecionar
			
			renderizar();
		}
	};
    
    
	 /**
     * ativa funcao hand, redesenhando o retangulo para percorrer o mapa
     * adicionarStageMouseMove so e necessaria pois a funcao removeEventListener so funciona quando o handler e o mesmo do addEventListener
     */
    
    this.ativarHandTool = function(){
    	
    	var canvasWidth = parseFloat( stageCanvas.canvas.getAttribute('width') );
    	var canvasHeight = parseFloat( stageCanvas.canvas.getAttribute('height') );
    	handTool.desenharRetangulo(0 - stageCanvas.x, 0 - stageCanvas.y, canvasHeight, canvasWidth);
    };
    

    /**
     * remove o evento do movimento do mouse sobre o stageCanvas e pede para destruir o retangulo da handTool.
     */
    this.desativarHandTool = function(){
    	handTool.destruirRetangulo();
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
     * remover child desta forma impossibilita o uso da funcao getChildByName pois ela vasculha pela propriedade name, a qual apenas DisplayObjects possuem
     * Verificar nas futuras versoes da biblioteca, como sao implementadas as funcoes getChildIndex,getChildAt para ver se nao vasculham a propriedade id dos objetos do stage
     */
    function removerFilho(stage,index){
    	if (index < 0 || index > stage.children.length-1) { return false; }
		var child = stage.children[index];
		if (child) { child.parent = null; }
		stage.children[index] = new createjs.Container();
		return true;
    }
    
    
    /**
     * redesenha a tela
     */
    function renderizar(){
    	stageCanvas.update();
    }
    
    /**
     * 
     */
    this.setCriarLigacao = function(valor){
    	criarLigacao = valor;
    };
    
    /**
     * 
     */
    function verificarCriarLigacao (){
    	return criarLigacao;
    };
    
    
    stageCanvas.on("stagemousedown", function tratarClickStage(evt) {
    	var x = evt.stageX - stageCanvas.x;
		var y = evt.stageY - stageCanvas.y;
    	var objetoSelecionado = stageCanvas.getObjectUnderPoint(x,y); //se clicar no canvas vazio retorna null para objetoSelecionado
    	
    	if(objetoSelecionado){ //nao clicou no canvas vazio
    		//nao clicou em algum quadrado de selecao
	    	if(objetoSelecionado.name != "quadradoTamanho")
	    		mapa.desselecionar();
    	}
    	else{ //clicou no canvas vazio
    		mapa.desselecionar();
    	}
		
		if(objetoSelecionado){
			if(objetoSelecionado.parent.name == "conceito"){
				if(objetosSelecionados[0] == undefined){
					selecionarConceito(objetoSelecionado);
					return selecionarCallback();
				}
				else{
					if( verificarCriarLigacao() ){
						var idConceitoClicado = stageCanvas.getChildIndex(objetoSelecionado.parent);
						if( idConceitoClicado != objetosSelecionados[0]){ //para impedir a auto-relacao
							var objeto0 = mapa.getContainerViaId(objetosSelecionados[0]);
							objetosSelecionados[1] = idConceitoClicado;
							//verificar o que eh o conceito selecionado 0
							if(objeto0.name == "conceito"){
								var idConceitoPai, idConceitoFilho;
								idConceitoPai = objetosSelecionados[0];
								idConceitoFilho = objetosSelecionados[1];
								
								mapa.setCriarLigacao(false);
								mapa.desselecionar();
								objetosSelecionados[1] = objetosSelecionados[0] = undefined;
								
								return abrirCriarLigacaoCallBack(idConceitoPai, idConceitoFilho);
							}
							else{ // eh ligacao
								//verificar se jah nao estao ligados
								if( !gerenciadorLista.verificarLigacao( objetosSelecionados[1], objetosSelecionados[0] ) ){ //se nao estiverem
									var idConceito, idLigacao, qtdFilhosLigacao, papelConceitoDisponivel;
									
									idConceito = objetosSelecionados[1];
									idLigacao = objetosSelecionados[0];
									
									mapa.setCriarLigacao(false);
									mapa.desselecionar();
									
									qtdFilhosLigacao = gerenciadorLista.getQtdFilhosLigacao(idLigacao);
									papelConceitoDisponivel = gerenciadorLista.buscarPapelConceitoDisponivel(idLigacao);
									
									objetosSelecionados[1] = objetosSelecionados[0] = undefined;
									return criarSemiLigacaoCallBack(idMapa, idConceito, idLigacao, qtdFilhosLigacao, papelConceitoDisponivel);
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
				if(objetosSelecionados[0] == undefined){
					selecionarLigacao(objetoSelecionado);
					return selecionarCallback();
				}
				else{
					
					if( verificarCriarLigacao() ){
						var objeto0 = mapa.getContainerViaId(objetosSelecionados[0]);
						objetosSelecionados[1] = stageCanvas.getChildIndex(objetoSelecionado.parent);
						//verificar o que eh o conceito selecionado 0
						if( objeto0.name == "conceito" && !gerenciadorLista.verificarLigacao( objetosSelecionados[0], objetosSelecionados[1] ) ){
							var idConceito, idLigacao, qtdFilhosLigacao, papelConceitoDisponivel;
							
							idConceito = objetosSelecionados[0];
							idLigacao = objetosSelecionados[1];
							
							mapa.setCriarLigacao(false);
							mapa.desselecionar();
							
							qtdFilhosLigacao = gerenciadorLista.getQtdFilhosLigacao(idLigacao);
							papelConceitoDisponivel = gerenciadorLista.buscarPapelConceitoDisponivel(idLigacao);
							
							objetosSelecionados[1] = objetosSelecionados[0] = undefined;
							return criarSemiLigacaoCallBack(idMapa, idConceito, idLigacao, qtdFilhosLigacao, papelConceitoDisponivel);
						}
						else{
							mapa.setCriarLigacao(false);
						}
					}
				}
			}
		}
		else{
			if( verificarCriarLigacao() ){ //se o usuario clicou no botao criar ligacao mas depois clicou no canvas
				mapa.setCriarLigacao(false);
				mapa.desselecionar();
			} 
		}
		
    });
    
    
    criarLigacao = false;
    
}

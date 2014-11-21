
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
    
    
    
    this.verificarTipoObjeto = function verificarTipoObjeto(idObjeto){
    	var tipoObjeto;
    	
    	tipoObjeto = gerenciadorLista.getConceito(idObjeto).attr('title');
    	return tipoObjeto;
    };
    
    
    this.editar = function( propriedades ){
    	var containerObjeto;
    	
    	containerObjeto = mapa.getContainerViaId(propriedades.idObjeto);
    	if(containerObjeto.name == "conceito"){
    		
    		gerenciadorConceito.redesenharConceitoAposEdicao(containerObjeto, propriedades, stageCanvas);
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
		
		var idConceito;
		var conceitoContainer;
		
		idConceito  = parseInt($(mensagem).attr("id")); 
		conceitoContainer = gerenciadorConceito.getConceitoContainerViaId(idConceito, stageCanvas);
		
		if(conceitoContainer.parent){ //para o caso do conceito ter sido deletado por um usuario e mensagens para mover este conceito terem chegado logo em seguida.
			var novoX;
			var conceitoNaLista;
			
			novoX = $(mensagem).children("li[title='x']").val();
			novoY = $(mensagem).children("li[title='y']").val();
			conceitoNaLista = gerenciadorLista.getConceito(idConceito);
			
			gerenciadorConceito.setX(idConceito, novoX, stageCanvas);
			gerenciadorConceito.setY(idConceito, novoY, stageCanvas);
			
			gerenciadorLigacao.atualizarLigacoesAoMoverConceito(idConceito, conceitoContainer, conceitoNaLista, gerenciadorLista.getLigacao, stageCanvas);
			
			renderizar();	
		}
	};
	
	this.atualizarPosicaoLigacao = function (mensagem){
		var idLigacao;
		var ligacaoContainer;
		var ligacaoNaLista;
		
		idLigacao = parseInt($(mensagem).attr("id"));
		ligacaoContainer = gerenciadorLigacao.getLigacaoContainerViaId(idLigacao, stageCanvas);
		
		if(ligacaoContainer.parent){
			var novoX;
			var novoY;
			
			novoX = $(mensagem).children("li[title='x']").val();
			novoY = $(mensagem).children("li[title='y']").val();
			
			gerenciadorLigacao.setX(idLigacao, novoX, stageCanvas);
			gerenciadorLigacao.setY(idLigacao, novoY, stageCanvas);
			ligacaoNaLista = gerenciadorLista.getLigacao(idLigacao);
			
			
			//atualiza a linhas de ligacao na tela
			gerenciadorLigacao.atualizarLigacoesAoMoverLigacao(ligacaoContainer, ligacaoNaLista, stageCanvas);
			
			renderizar();
		}
	};
	
    

    this.inserirConceito = function (idConceito, texto, fonte, tamanhoFonte, corFonte, corFundo, montarMensagemAoMoverConceito, montarMensagemAoAlterarTamanhoConceito, enviarMensagemAoServidor){
    	var conceitoContainer;
    	
    	conceitoContainer = gerenciadorConceito.desenharConceito( texto, fonte, tamanhoFonte, corFonte, corFundo, (stageCanvas.x), (stageCanvas.y) );
    	stageCanvas.addChild(conceitoContainer); //adiciona o container no stageCanvas
    	setIdObjeto(conceitoContainer, idConceito);
    	
    	gerenciadorConceito.adicionarDragDrop(idMapa,conceitoContainer, stageCanvas, gerenciadorLista.getConceito,
    			gerenciadorLista.getLigacao, gerenciadorLista.getCorFundo, gerenciadorLigacao.atualizarLigacoesAoMoverConceito,
    			renderizar, montarMensagemAoMoverConceito, montarMensagemAoAlterarTamanhoConceito, enviarMensagemAoServidor);
    	renderizar();
    	gerenciadorLista.adicionarConceitoNaLista(idConceito, corFundo);
    };
    
    
    this.inserirLigacao = function (texto, fonte, tamanhoFonte, corFonte, corFundo, idLigacao, idLinhaPai, idLinhaFilho, idConceitoPai, idConceitoFilho, montarMensagemAoMoverLigacao, montarMensagemAoAlterarTamanhoLigacao, enviarMensagemAoServidor){
    	var containers;
    	var conceitoContainerPai;
    	var conceitoContainerFilho;
    	
    	conceitoContainerPai = gerenciadorConceito.getConceitoContainerViaId(idConceitoPai, stageCanvas);
    	conceitoContainerFilho = gerenciadorConceito.getConceitoContainerViaId(idConceitoFilho, stageCanvas);
    	
    	
    	containers = gerenciadorLigacao.desenharLigacao( texto, fonte, tamanhoFonte, corFonte, corFundo, conceitoContainerPai, conceitoContainerFilho );
    	
    	stageCanvas.addChild(containers["ligacaoContainer"]); //adiciona o container no stageCanvas
    	stageCanvas.addChild(containers["linhaPaiContainer"]);
    	stageCanvas.addChild(containers["linhaFilhoContainer"]);
    	
    	setIdObjeto(containers["ligacaoContainer"], idLigacao);
    	setIdObjeto(containers["linhaPaiContainer"], idLinhaPai);
    	setIdObjeto(containers["linhaFilhoContainer"], idLinhaFilho);
    	
    	gerenciadorLigacao.adicionarDragDrop(idMapa,containers["ligacaoContainer"], stageCanvas, gerenciadorLista.getLigacao, 
    			gerenciadorLista.getCorFundo, renderizar, montarMensagemAoMoverLigacao, montarMensagemAoAlterarTamanhoLigacao, enviarMensagemAoServidor);
    	
    	renderizar();
    	gerenciadorLista.adicionarLigacaoNaLista(idLigacao, idLinhaPai, idLinhaFilho, idConceitoPai, idConceitoFilho, corFundo);
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
    	gerenciadorConceito.selecionarConceito(objetoSelecionado, corFundo, renderizar);
    	renderizar();
    	
    	return selecionarCallback;
    }
    

    function selecionarLigacao (objetoSelecionadoP) { //objetoSelecionado pode ser o retangulo ou label
    	var objetoSelecionado;
    	var corFundo;
    	
    	objetoSelecionado = objetoSelecionadoP;
    	objetosSelecionados[0] = gerenciadorLigacao.getId(objetoSelecionado.parent, stageCanvas); //id do objeto no stage
    	corFundo = gerenciadorLista.getCorFundo(objetosSelecionados[0]);
    	gerenciadorLigacao.selecionarLigacao(objetoSelecionado,corFundo, renderizar);
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
		var conceitoNaLista;
		var corFundo;
		var propriedades;
		
		conceitoContainer = mapa.getContainerViaId(mensagem.idConceito);
		conceitoNaLista = gerenciadorLista.getConceito(mensagem.idConceito);
		corFundo = gerenciadorLista.getCorFundo(mensagem.idConceito);
		
		gerenciadorConceito.setX(mensagem.idConceito, mensagem.novoX, stageCanvas);
		gerenciadorConceito.setY(mensagem.idConceito, mensagem.novoY, stageCanvas);
		gerenciadorConceito.setAltura(conceitoContainer, mensagem.novaAltura);
		gerenciadorConceito.setLargura(conceitoContainer, mensagem.novaLargura);
		
		propriedades = {
				altura: mensagem.novaAltura,
				largura: mensagem.novaLargura,
				corFundo:corFundo
		};
		
		gerenciadorConceito.redesenharConceitoAposEdicao(conceitoContainer, propriedades, stageCanvas);
		
		gerenciadorLigacao.atualizarLigacoesAoMoverConceito(mensagem.idConceito, conceitoContainer, conceitoNaLista, 
				gerenciadorLista.getLigacao, stageCanvas);
		
		if(objetosSelecionados[0] == mensagem.idConceito) //se o conceito alterado estiver selecionado
			gerenciadorConceito.redesenharQuadradosSelecao(conceitoContainer);
		
		gerenciadorConceito.recentralizarLabel(conceitoContainer);
		
		renderizar();
	};
    
	this.alterarTamanhoLigacao = function(mensagem){
		
		var ligacaoContainer;
		var ligacaoNaLista;
		
		ligacaoContainer = mapa.getContainerViaId(mensagem.idLigacao);
		ligacaoNaLista = gerenciadorLista.getLigacao(mensagem.idLigacao);
		
		
		gerenciadorLigacao.setAltura(ligacaoContainer, mensagem.novaAltura);
		gerenciadorLigacao.setLargura(ligacaoContainer, mensagem.novaLargura);
		gerenciadorLigacao.setX(mensagem.idLigacao, mensagem.novoX, stageCanvas);
		gerenciadorLigacao.setY(mensagem.idLigacao, mensagem.novoY, stageCanvas);
		
		gerenciadorLigacao.redesenharLigacaoAposEdicao(mensagem.idLigacao, gerenciadorLista.getCorFundo, stageCanvas);
		
		gerenciadorLigacao.atualizarLigacoesAoMoverLigacao(ligacaoContainer, ligacaoNaLista, stageCanvas);
		
		if(objetosSelecionados[0] == mensagem.idLigacao) //se o conceito alterado estiver selecionado
			gerenciadorLigacao.redesenharQuadradosSelecao(ligacaoContainer);
		
		gerenciadorLigacao.recentralizarLabel(ligacaoContainer);
		
		renderizar();
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
		var bottomRigth = stageCanvas.getObjectUnderPoint(63,32);
    	
    	if(objetoSelecionado){ //nao clicou no canvas vazio
    		//nao clicou em algum quadrado de selecao
	    	if(objetoSelecionado.name != "qsTopLeft" && objetoSelecionado.name != "qsTopRigth" && objetoSelecionado.name != "qsBottomLeft" && objetoSelecionado.name != "qsBottomRigth")
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

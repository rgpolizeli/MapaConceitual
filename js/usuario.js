
function Usuario(ipServer, porta){
	//this e publico e var e privado
	this.id;
	this.nome = "usuario";
	var ipServidor = ipServer;
	var portaConexao = porta;
	var socket;
	var usuario = this;
	var mapaAtual;
	
	
	//abrirMapa() {}
	
	//buscarPalavra() {}
	
	var conectarServidor = function(){ //conecta com o servidor atraves de socket e adiciona respostas a eventos
		
		var stringConexao = "ws://" + ipServidor + ":" + portaConexao;
		socket = new WebSocket(stringConexao);
		
		socket.onopen = function(){
			console.log("Conectado ao servidor!");
		};
		
		socket.onerror = function (error) {
			console.log(error);
		};
		
		socket.onmessage = function (evt) 
		{ 
			var mensagem = evt.data;
			usuario.receberMensagemDoServidor(mensagem);
			
			//ws.close();
		};
	};
	
	this.atualizarPosicaoConceito = function (mensagem){
		var idConceito = parseInt($(mensagem).attr("id"));
		var conceito = new Conceito();
		var novoX;
		var novoY;
		
		novoX = $(mensagem).children("li[title='x']").attr("value");
		novoY = $(mensagem).children("li[title='y']").attr("value");
		
		conceito.setX(idConceito, novoX, mapaAtual);
		conceito.setY(idConceito, novoY, mapaAtual);
		
		new Ligacao().atualizarLigacoesAoMoverConceito(1, conceito.getConceitoContainerViaId(idConceito, mapaAtual),idConceito, mapaAtual);
		
		mapaAtual.renderizar();
		
		mapaAtual.getGerenciadorLista().atualizarConceitoNaListaAoMoverConceito(1,idConceito, novoX, novoY);
	};
	
	this.atualizarPosicaoLigacao = function (mensagem){
		var idLigacao = parseInt($(mensagem).attr("id"));
		var ligacao = new Ligacao();
		var novoX;
		var novoY;
		
		var ligacaoContainer = ligacao.getLigacaoContainerViaId(idLigacao, mapaAtual);
		
		novoX = $(mensagem).children("li[title='x']").attr("value");
		novoY = $(mensagem).children("li[title='y']").attr("value");
		
		ligacao.setX(idLigacao, novoX, mapaAtual);
		ligacao.setY(idLigacao, novoY, mapaAtual);
		
		//atualiza a linhas de ligacao na tela
	    ligacao.atualizarLigacoesAoMoverLigacao(1, ligacaoContainer,idLigacao, mapaAtual);
		
		mapaAtual.renderizar();
		
		mapaAtual.getGerenciadorLista().atualizarLigacaoNaListaAoMoverLigacao(1,idLigacao, novoX, novoY);
	};
	
	     
	this.criarConceito = function(origem, mapaConceitualAtual,texto, fonte, tamanhoFonte, corFonte, corFundo,idConceito) {
		var conceito = new Conceito(origem, texto, fonte, tamanhoFonte, corFonte, corFundo, mapaConceitualAtual);
		conceito.desenharConceito();
		
		if(origem==1) //veio do servidor
			conceito.setId(conceito.getConceitoContainer(), idConceito);
		
		mapaConceitualAtual.getGerenciadorLista().adicionarConceitoNaLista(conceito,origem);
	};
	

    this.criarLigacao = function(origem, mapaConceitualAtual,texto, fonte, tamanhoFonte, corFonte, corFundo,idLigacao,idLinhaPai,idLinhaFilho, idConceitoPai, idConceitoFilho, mensagem){
    	var ligacao = new Ligacao(origem, texto, fonte, tamanhoFonte, corFonte, corFundo, mapaConceitualAtual,idConceitoPai,idConceitoFilho);
		ligacao.desenharLigacao();
		
		if(origem == 0){
			mapaConceitualAtual.setCriarLigacao(false);
			this.desselecionar(mapaConceitualAtual);
			
			mapaConceitualAtual.conceitosSelecionados[0] == undefined;
			mapaConceitualAtual.conceitosSelecionados[1] == undefined;
		}
		else{

			ligacao.setIdLigacao(ligacao.getLigacaoContainer(), idLigacao);

			ligacao.setIdLinhaPai(ligacao.getLinhaPaiContainer(), idLinhaPai);

			ligacao.setIdLinhaFilho(ligacao.getLinhaFilhoContainer(), idLinhaFilho);
		}
		
		mapaConceitualAtual.getGerenciadorLista().adicionarLigacaoNaLista(origem,ligacao,mensagem);
    };
    
    
    this.criarSemiLigacao = function(origem, mapa, idConceito, idLigacao, idLinha, mensagem){
    	var semiLigacao = new SemiLigacao(origem,mapa, idConceito, idLigacao);
		semiLigacao.desenharSemiLigacao();
		
		if(origem == 0){
			mapa.setCriarLigacao(false);
			this.desselecionar(mapa);
			
			mapa.conceitosSelecionados[0] == undefined;
			mapa.conceitosSelecionados[1] == undefined;
		}
		
		else{
			semiLigacao.setIdLinha(semiLigacao.getLinhaContainer(), idLinha);
		}
		
		mapa.getGerenciadorLista().adicionarSemiLigacaoNaLista(origem,semiLigacao,mensagem);
    };
    

    this.editarConceito = function() {};

    this.editarLigacao = function() {};
    

    this.enviarMensagemAoServidor = function(mensagem){
    	socket.send(mensagem);
    };
    
    this.excluir = function(idObjeto, origem) {
    	var tipoObjeto = verificarTipoObjeto(idObjeto);
    	
    	usuario.desselecionar(mapaAtual);
    	
    	switch (tipoObjeto){
    		case "conceito": excluirConceito(idObjeto, origem);
    		break;
    		case "ligacao" : excluirPalavraLigacao(idObjeto, origem);
    		break;
    	}
    };
    
    function excluirConceito(idConceito, origem){
    	var listaLigacoes = $('ul#'  + idConceito).children("li[title='idLigacao']");
    	var papelConceito;
    	var qtdFilhos;
    	var idLigacao;
    	
    	for(var i=0; listaLigacoes.get(i) != undefined; i++){
    		idLigacao = parseInt($(listaLigacoes.get(i)).attr('value'));
    		qtdFilhos = $('ul#' + idLigacao).children("li[title='qtdFilhos']").val();
    		papelConceito = verificarPapelConceito(idConceito, idLigacao);
    		
    		if(papelConceito == 0 || qtdFilhos == 1){ //se for o conceito pai ou se so tiver um filho - > deleta-se a palavra de ligacao
    			excluirPalavraLigacao(idLigacao);
    		}
    		else{ //se houver mais de 1 filho
    			excluirLinhaLigacao(idLigacao,papelConceito);
    			mapaAtual.getGerenciadorLista().excluirLinhaLigacaoDaLista(idConceito, idLigacao, papelConceito);
    			$('ul#' + idLigacao).children("li[title='qtdFilhos']").val(qtdFilhos-1);
    		}
    	}
    	mapaAtual.getStageCanvas().getChildAt(idConceito).removeAllChildren(); //remove tudo dentro do containerConceito
    	mapaAtual.removerFilho(mapaAtual.getStageCanvas(), idConceito); //remove o conceitoContainer
    	mapaAtual.getGerenciadorLista().excluirConceitoDaLista(idConceito, origem);
    	mapaAtual.renderizar();
    	
    }
    
    function excluirLinhaLigacao(idLigacao, papelConceito){
    	var idLinha;
    	
    	if(papelConceito==0)
    		idLinha = $('ul#'+ idLigacao).children("li[title='idLinhaPai']").val();	
    	else
    		idLinha = $('ul#'+ idLigacao).children("li[title='idLinhaFilho"+ papelConceito +"']").val();
    	
    	mapaAtual.removerFilho(mapaAtual.getStageCanvas(),idLinha);
    }
    
    function excluirPalavraLigacao(idLigacao, origem){
    	var listaConceitosFilhos;
    	var papelConceito;
    	
    	excluirLinhaLigacao(idLigacao, 0); //exclui a linha do Conceito pai
    	listaConceitosFilhos = $('ul#' + idLigacao + " li[title^='idConceitoFilho']");
    	
    	for(var i=0;listaConceitosFilhos.get(i) != undefined; i++){
    		papelConceito = $(listaConceitosFilhos.get(i)).attr("title").replace("idConceitoFilho","");
			papelConceito = parseInt(papelConceito);
    		excluirLinhaLigacao(idLigacao, papelConceito);
    	}
    	
    	mapaAtual.getStageCanvas().getChildAt(idLigacao).removeAllChildren(); //remove tudo dentro do ligacaoContainer
    	mapaAtual.removerFilho(mapaAtual.getStageCanvas(), idLigacao); //remove o ligacaoContainer
    	mapaAtual.getGerenciadorLista().excluirLigacaoDosConceitos(idLigacao);
    	mapaAtual.getGerenciadorLista().excluirLigacaoDaLista(idLigacao, origem);
    	mapaAtual.renderizar();
    	
    }
    
    //verifica se o objeto e conceito ou palavra de ligacao
    function verificarTipoObjeto(id){
    	return $("ul#" + id).attr('title');
    }
    
   //verifica verifica o papel do conceito na ligacao
    function verificarPapelConceito(idConceito,idLigacao){
    	var papelConceito;
    	
    	if($('ul#'+ idLigacao).children("li[title='idConceitoPai']").val()  == idConceito)
    		return 0;
    	else{
    		for(var i=1; papelConceito == undefined; i++){
    			if($('ul#'+ idLigacao).children("li[title='idConceitoFilho"+ i +"']").val() == idConceito){
    				papelConceito = i;
    			}
    		}
    		return papelConceito;
    	}
    }

    this.moverConceito = function() {};

    this.moverLigacao = function() {};

    this.pararPercorrerMapa = function() {};

    this.percorrerMapa = function() {};
    
  //encaminha mensagens vindas do servidor 
    //para atualizar a lista de elementos ou o nome dos mapas que podem ser abertos
   
    this.receberMensagemDoServidor = function(mensagem) { 
    	console.log(mensagem);
    	
    	if(mensagem[0] == "<"){
			switch(mensagem[1]){
		    	case "%": //novo conceito criado por um usuario
		    		mensagem = mensagem.replace("%","");
					var id = parseInt($(mensagem).attr("id"));
					var texto = $(mensagem).children("li[title='texto']").text();
					var fonte = $(mensagem).children("li[title='fonte']").text();
					var tamanhoFonte = $(mensagem).children("li[title='tamanhoFonte']").text();
					var corFonte = $(mensagem).children("li[title='corFonte']").text();
					var corFundo = $(mensagem).children("li[title='corFundo']").text();
			        usuario.criarConceito(1, mapaAtual,texto, fonte, tamanhoFonte, corFonte, corFundo,id);
				break;
				case "*": //conceito movido por algum usuario
					mensagem = mensagem.replace("*","");
					usuario.atualizarPosicaoConceito(mensagem);
				break;
				case "!": //ligacao criada por algum usuario
					mensagem = mensagem.replace("!","");
					var idLigacao = parseInt($(mensagem).attr("id"));
					var idLinhaPai = $(mensagem).children("li[title='idLinhaPai']").val();
					var idLinhaFilho = $(mensagem).children("li[title='idLinhaFilho1']").val();
					var idConceitoPai = $(mensagem).children("li[title='idConceitoPai']").val();
					var idConceitoFilho = $(mensagem).children("li[title='idConceitoFilho1']").val();
					var texto = $(mensagem).children("li[title='texto']").text();
					var fonte = $(mensagem).children("li[title='fonte']").text();
					var tamanhoFonte = $(mensagem).children("li[title='tamanhoFonte']").text();
					var corFonte = $(mensagem).children("li[title='corFonte']").text();
					var corFundo = $(mensagem).children("li[title='corFundo']").text();
					usuario.criarLigacao(1, mapaAtual, texto, fonte, tamanhoFonte, corFonte, corFundo, idLigacao, idLinhaPai,idLinhaFilho, idConceitoPai, idConceitoFilho, mensagem);
			        
				break;
				case "(": //nova SemiLigacao
					mensagem = mensagem.replace("(","");
					var qtdFilhos =  $(mensagem).children("li[title='qtdFilhos']").val();
					var idConceito = $(mensagem).children("li[title='idConceitoFilho"+ qtdFilhos +"']").val();
					var idLigacao = parseInt($(mensagem).attr("id"));
					var idLinha = $(mensagem).children("li[title='idLinhaFilho"+ qtdFilhos +"']").val();
					usuario.criarSemiLigacao(1, mapaAtual, idConceito, idLigacao, idLinha, mensagem);
				break;
				case "+": //palavra de ligacao movida por algum usuario
					mensagem = mensagem.replace("+","");
					usuario.atualizarPosicaoLigacao(mensagem);
				break;
				case "5": //exclusao
					mensagem = mensagem.replace("5","");
					usuario.excluir($(mensagem).val(), 1);
				break;
			}
		}
		else
			console.log(mensagem);
		
    };

    this.requisitarMapas = function() {};

    this.desselecionar = function (mapa) {
    	//entra se houver algum objeto selecionado e nao estiver sendo criada uma nova ligacao
    	
    	var r = mapa.verificarCriarLigacao();
    	
		if(mapa.conceitosSelecionados[0] != undefined && r == false ){
			
			var conceito = new Conceito(undefined, undefined, undefined, undefined, undefined, undefined,mapa);
			var objetoSelecionado = conceito.getConceitoContainerViaId(mapa.conceitosSelecionados[0], mapa);
			
			if(objetoSelecionado.name=="conceito"){
				var rect = objetoSelecionado.getChildByName("retangulo");
				rect.graphics.clear();
				rect.graphics.beginFill("blue").drawRoundRect( //adiciona na posicao zero,zero
						0,0,100,50,3);
				mapa.renderizar();
				mapa.conceitosSelecionados[0] = undefined;
				
				mapa.desabilitarBotaoNovaLigacao();
				mapa.desabilitarBotaoExcluir();
				
			}
			
			if(objetoSelecionado.name=="ligacao"){
				
				var cor = conceito.getCorFundoViaId(mapa.conceitosSelecionados[0]);
				var altura = conceito.getAltura(objetoSelecionado);
				var largura = conceito.getLargura(objetoSelecionado);
				var rect = objetoSelecionado.getChildByName("retangulo");
				
				rect.graphics.clear();
				rect.graphics.beginFill(cor).drawRoundRect( //adiciona na posicao zero,zero
						0,0,largura,altura,3);
				mapa.renderizar();
				
				mapa.conceitosSelecionados[0] = undefined;
				mapa.desabilitarBotaoNovaLigacao();
				mapa.desabilitarBotaoExcluir();
			}
			
		}
    };
    
    this.selecionarConceito = function(objetoSelecionado, mapa) { //objetoSelecionado pode ser o retangulo ou label
    	var conceito = new Conceito(undefined, undefined, undefined, undefined, undefined, undefined,mapa);
    	
    	var altura = conceito.getAltura(objetoSelecionado.parent);
    	var largura = conceito.getLargura(objetoSelecionado.parent);
    	
    	var rect = conceito.getRetangulo(objetoSelecionado.parent);
    	var corSelecao = "#F00";
    	var espessuraBorda = 6;
    	
    	
    	
		rect.graphics.clear();
		rect.graphics.setStrokeStyle(espessuraBorda,"round").beginStroke(corSelecao).beginFill("blue").drawRoundRect( //adiciona na posicao zero,zero
				0,0,largura,altura,3);
		mapa.renderizar();
		mapa.conceitosSelecionados[0] = conceito.getId(objetoSelecionado.parent); //id do objeto no stage
		
		mapa.habilitarBotaoNovaLigacao();
		mapa.habilitarBotaoExcluir();
    };

    this.selecionarLigacao = function(objetoSelecionado, mapa) { //objetoSelecionado pode ser o retangulo ou label
    	var ligacao = new Ligacao(undefined, undefined, undefined, undefined, undefined, undefined,mapa);
    	var rect = ligacao.getRetangulo(objetoSelecionado.parent);
    	
    	var altura = ligacao.getAltura(objetoSelecionado.parent);
    	var largura = ligacao.getLargura(objetoSelecionado.parent);
    	
    	var corSelecao = "#F00";
    	var espessuraBorda = 6;
    	
    	mapa.conceitosSelecionados[0] = ligacao.getId(objetoSelecionado.parent); //id do objeto no stage
    	
    	var corFundo = ligacao.getCorFundoViaId(mapa.conceitosSelecionados[0]);
    	
		rect.graphics.clear();
		rect.graphics.setStrokeStyle(espessuraBorda,"round").beginStroke(corSelecao).beginFill(corFundo).drawRoundRect( //adiciona na posicao zero,zero
				0,0,largura,altura,3);
		mapa.renderizar();
		
		
		mapa.habilitarBotaoNovaLigacao();
		mapa.habilitarBotaoExcluir();
    };
    
    this.setMapaAtual = function (mapa){
    	mapaAtual = mapa;
    };
    
    conectarServidor();

}
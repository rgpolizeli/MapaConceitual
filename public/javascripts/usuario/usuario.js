
function Usuario(idUsuarioP, mapa, ipServer, porta){
	//this e publico e var e privado
	var idUsuario = parseInt(idUsuarioP);
	var ipServidor = ipServer;
	var portaConexao = porta;
	var socket;
	var usuario = this;
	var mapaAtual = mapa;
	
	function carregarMapa(msg){
		
		$(msg).find('ul[title=conceito]').each( function( index, element ){
			
			var id = parseInt($(element).attr("id"));
			var x = $(element).children("li[title='x']").val();
			var y = $(element).children("li[title='y']").val();
			var texto = $(element).children("li[title='texto']").text();
			var fonte = $(element).children("li[title='fonte']").text();
			var tamanhoFonte = $(element).children("li[title='tamanhoFonte']").text();
			var corFonte = $(element).children("li[title='corFonte']").text();
			var corFundo = $(element).children("li[title='corFundo']").text();
			
	        usuario.criarConceito(1,texto, fonte, tamanhoFonte, corFonte, corFundo,id);
	        
	        var msgPosicaoConceito = 
	        	"<ul id='" + id + "' title='conceito'>" + 
	        	"<li title='x' value='" + x + "'></li>" +
	        	"<li title='y' value='" + y + "'></li>" 
			;
	        usuario.atualizarPosicaoConceito(msgPosicaoConceito);
		});
		
		
		$(msg).find('ul[title=ligacao]').each( function( index, element ){
			
			var idLigacao = parseInt($(element).attr("id"));
			var idLinhaPai = $(element).children("li[title='idLinhaPai']").val();
			var idLinhaFilho;
			var idConceitoPai = $(element).children("li[title='idConceitoPai']").val();
			var idConceitoFilho;
			
			
			var x = $(element).children("li[title='x']").attr("value"); //talvez possa ocorrer erros ja que value armazena apenas numeros nao strings 
			var y = $(element).children("li[title='y']").attr("value");
			var texto = $(element).children("li[title='texto']").text();
			var fonte = $(element).children("li[title='fonte']").text();
			var tamanhoFonte = $(element).children("li[title='tamanhoFonte']").text();
			var corFonte = $(element).children("li[title='corFonte']").text();
			var corFundo = $(element).children("li[title='corFundo']").text();
			var qtdFilhos = $(element).children("li[title='qtdFilhos']").val();
			
			if(qtdFilhos == 1){
				idLinhaFilho = $(element).find("li[title^='idLinhaFilho']").first().val();
				idConceitoFilho = $(element).find("li[title^='idConceitoFilho']").first().val();
				
				usuario.criarLigacao(1, texto, fonte, tamanhoFonte, corFonte, corFundo, idLigacao, idLinhaPai,idLinhaFilho, idConceitoPai, idConceitoFilho, element);
				
				//default e a posicao padrao (automatica) da ligacao
				if(x != 'default'){
					var msgPosicaoLigacao = 
						"<ul id='" + idLigacao + "' title='ligacao'>" + 
							"<li title='x' value='" + x + "'></li>" +
							"<li title='y' value='" + y + "'></li>" 
					;
					usuario.atualizarPosicaoLigacao(msgPosicaoLigacao);
				}
				
			}
			else{
				var listaLigacao = $(element).clone();
				
				$(listaLigacao).children("li[title='qtdFilhos']").val(1);
				var limite = qtdFilhos;
				
				$(listaLigacao).find("li[title^='idConceitoFilho']").each(function (index, subElement){
					var papelConceito = verificarPapelConceitoViaMensagem( $(subElement).val(), listaLigacao);
					
					if( limite > 1 ){
						
						$(listaLigacao).children("li[title='idLinhaFilho"+ papelConceito + "']").remove();
						$(listaLigacao).children("li[title='idConceitoFilho"+ papelConceito + "']").remove();
						limite--;
					}
					else
						if (limite==1){
							idLinhaFilho = $(listaLigacao).children("li[title='idLinhaFilho"+ papelConceito + "']").val();
							idConceitoFilho = $(subElement).val();
						}
				});
				
				usuario.criarLigacao(1, texto, fonte, tamanhoFonte, corFonte, corFundo, idLigacao, idLinhaPai,idLinhaFilho, idConceitoPai, idConceitoFilho, listaLigacao);
				
				if(x != 'default'){
					var msgPosicaoLigacao = 
						"<ul id='" + idLigacao + "' title='ligacao'>" + 
							"<li title='x' value='" + x + "'></li>" +
							"<li title='y' value='" + y + "'></li>" 
					;
					usuario.atualizarPosicaoLigacao(msgPosicaoLigacao);
				}
				
				$(element).find("li[title^='idConceitoFilho']").each(function (index, subElement){
					var papelConceito = verificarPapelConceitoViaMensagem( $(subElement).val(), element);
					var idLinhaAtual = $(element).children("li[title='idLinhaFilho"+ papelConceito + "']").val();
					var idConceitoAtual = $(element).children("li[title='idConceitoFilho"+ papelConceito + "']").val();
					
					if(idConceitoFilho != idConceitoAtual){
						var qtdFilhosAtual = $(listaLigacao).children("li[title='qtdFilhos']").val();
						
						var listaSemiLigacao = 
							"<ul id='" + idLigacao + "' title='ligacao'>" + 
							"<li title='qtdFilhos' value='" + (qtdFilhosAtual + 1) + "'></li>" +
							"<li title='idLinhaFilho"+ papelConceito +"' value='" + idLinhaAtual + "'></li>" +
							"<li title='idConceitoFilho"+ papelConceito +"' value='" + idConceitoAtual + "'></li>"
						;
						usuario.criarSemiLigacao(1, mapaAtual, idConceitoAtual, idLigacao, idLinhaAtual, listaSemiLigacao);
					}
				});
				
			}
		});
		
		
		
	}
	
	
	//buscarPalavra() {}
	
	this.conectarServidor = function(){ //conecta com o servidor atraves de socket e adiciona respostas a eventos
		
		socket = io(ipServidor);
		
		socket.on('connect', function(){
			socket.emit('conexao', idUsuario, mapaAtual.getId());
		});
		
		socket.on('message', function(msg){
			usuario.receberMensagemDoServidor(msg);
		});
		
	};
	
	this.atualizarPosicaoConceito = function (mensagem){
		var conceito = new Conceito();
		var idConceito = parseInt($(mensagem).attr("id"));
		var conceitoContainer = conceito.getConceitoContainerViaId(idConceito, mapaAtual);
		
		if(conceitoContainer.parent){ //para o caso do conceito ter sido deletado por um usuario e mensagens para mover este conceito terem chegado logo em seguida.
			var idMapa;
			var novoX;
			
			novoX = $(mensagem).children("li[title='x']").val();
			novoY = $(mensagem).children("li[title='y']").val();
			idMapa = parseInt( $(mensagem).children( "li[title='idMapa']" ).text() );
			
			conceito.setX(idConceito, novoX, mapaAtual);
			conceito.setY(idConceito, novoY, mapaAtual);
			
			new Ligacao().atualizarLigacoesAoMoverConceito(1, conceitoContainer,idConceito, mapaAtual);
			
			mapaAtual.renderizar();
			
			mapaAtual.getGerenciadorLista().atualizarConceitoNaListaAoMoverConceito(1,idConceito, idMapa, novoX, novoY);	
		}
	};
	
	this.atualizarPosicaoLigacao = function (mensagem){
		var ligacao = new Ligacao();
		var idLigacao = parseInt($(mensagem).attr("id"));
		var ligacaoContainer = ligacao.getLigacaoContainerViaId(idLigacao, mapaAtual);
		
		if(ligacaoContainer.parent){
			var idMapa;
			var novoX;
			var novoY;
			
			novoX = $(mensagem).children("li[title='x']").val();
			novoY = $(mensagem).children("li[title='y']").val() ;
			idMapa = parseInt( $(mensagem).children( "li[title='idMapa']" ).text() );
			
			ligacao.setX(idLigacao, novoX, mapaAtual);
			ligacao.setY(idLigacao, novoY, mapaAtual);
			
			//atualiza a linhas de ligacao na tela
		    ligacao.atualizarLigacoesAoMoverLigacao(1, ligacaoContainer,idLigacao, mapaAtual);
			
			mapaAtual.renderizar();
			
			mapaAtual.getGerenciadorLista().atualizarLigacaoNaListaAoMoverLigacao(1,idLigacao, idMapa, novoX, novoY);
		}
	};
	
	     
	this.criarConceito = function(origem,texto, fonte, tamanhoFonte, corFonte, corFundo,idConceito) {
		
		if(origem == 0){ //se foi criado localmente, envia para o servidor
			var idMapa = mapaAtual.getId();
			var msg = montarMensagemNovoConceito(idMapa, texto, fonte, tamanhoFonte, corFonte, corFundo);
			usuario.enviarMensagemAoServidor(msg);
		}
		else{ //veio do servidor
			var conceito = new Conceito(origem, texto, fonte, tamanhoFonte, corFonte, corFundo, mapaAtual);
			conceito.desenharConceito();
			conceito.setId(conceito.getConceitoContainer(), idConceito);
			mapaAtual.getGerenciadorLista().adicionarConceitoNaLista(conceito,origem);
		}
	};
	

    this.criarLigacao = function(origem, texto, fonte, tamanhoFonte, corFonte, corFundo,idLigacao,idLinhaPai,idLinhaFilho, idConceitoPai, idConceitoFilho, mensagem){
  
		if(origem == 0){
			mapaAtual.setCriarLigacao(false);
			this.desselecionar(mapaAtual);
			
			mapaAtual.conceitosSelecionados[0] == undefined;
			mapaAtual.conceitosSelecionados[1] == undefined;
			
			var idMapa = mapaAtual.getId();
			var msg = montarMensagemNovaLigacao(idMapa, idConceitoPai, idConceitoFilho, texto, fonte, tamanhoFonte, corFonte, corFundo);
			usuario.enviarMensagemAoServidor(msg);
		}
		else{
			var ligacao = new Ligacao(origem, texto, fonte, tamanhoFonte, corFonte, corFundo, mapaAtual,idConceitoPai,idConceitoFilho);
			ligacao.desenharLigacao();
			
			ligacao.setId(ligacao.getLigacaoContainer(), idLigacao);
			ligacao.setId(ligacao.getLinhaPaiContainer(), idLinhaPai);
			ligacao.setId(ligacao.getLinhaFilhoContainer(), idLinhaFilho);
			
			mapaAtual.getStageCanvas().children;
			
			//se a ligacao esta sendo criada, ou seja, o x e y da ligacao sao default
			if( $(mensagem).find("li[title='x']").length == 0 ){
				var ligacaoContainer = ligacao.getLigacaoContainer();
				var ligacaoX = parseFloat(ligacaoContainer.x);
				var ligacaoY = parseFloat(ligacaoContainer.y);
				mensagem += "<li title='x' value='" + ligacaoX + "'></li>";
				mensagem += "<li title='y' value='" + ligacaoY + "'></li>";
			}
			
			mapaAtual.getGerenciadorLista().adicionarLigacaoNaLista(origem,ligacao,mensagem);
		}
    };
    
    
    this.criarSemiLigacao = function(origem, mapaConceitualAtual, idConceito, idLigacao, idLinha, mensagem){
		
		if(origem == 0){
			mapaConceitualAtual.setCriarLigacao(false);
			this.desselecionar(mapaConceitualAtual);
			
			mapaConceitualAtual.conceitosSelecionados[0] == undefined;
			mapaConceitualAtual.conceitosSelecionados[1] == undefined;
			
			var idMapa = mapaConceitualAtual.getId();
			var NovaQtdFilhos = $("ul#" + idLigacao).children("li[title='qtdFilhos']").val() + 1;
			var papelConceito = buscarPapelConceitoDisponivel(idLigacao);
			
			var msg = montarMensagemNovaSemiLigacao(idMapa, idLigacao, idConceito, papelConceito, NovaQtdFilhos);
			usuario.enviarMensagemAoServidor(msg);
		}
		
		else{
			var semiLigacao = new SemiLigacao(origem,mapaConceitualAtual, idConceito, idLigacao);
			semiLigacao.desenharSemiLigacao();
			
			semiLigacao.setId(semiLigacao.getLinhaContainer(), idLinha);
			
			mapaConceitualAtual.getGerenciadorLista().adicionarSemiLigacaoNaLista(origem,semiLigacao,mensagem);
		}
		
		
    };
    
    
    function buscarPapelConceitoDisponivel(idLigacao){
    	var papelConceito = 1;
    	while( $("ul#" + idLigacao).children("li[title='idConceitoFilho"+ papelConceito + "']").length != 0 )
    		papelConceito++;
    	return papelConceito;
    }
    

    this.editarConceito = function() {};

    this.editarLigacao = function() {};
    
    //monta mensagem dizendo ao servidor para criar um novo conceito e enviar o id do conceito criado
    function montarMensagemNovoConceito(idMapa, texto, fonte, tamanhoFonte, corFonte, corFundo){
		var mensagem = 
			"<1ul>" + 
				"<li title='texto'>" + texto + "</li>" +
				"<li title='fonte'>" + fonte + "</li>" +
				"<li title='tamanhoFonte'>" + tamanhoFonte + "</li>" +
				"<li title='corFonte'>" + corFonte + "</li>" +
				"<li title='corFundo'>" + corFundo + "</li>" + 
				"<li title='idMapa'>" + idMapa + "</li>"
				;
		return mensagem;
	}
    
    //monta mensagem para servidor criar ligacao e enviar o id da ligacao
    function montarMensagemNovaLigacao(idMapa, idConceitoPai, idConceitoFilho, texto, fonte, tamanhoFonte, corFonte, corFundo){
		var mensagem = 
			"<3ul>" +
			"<li title='idConceitoPai' value='" + idConceitoPai + "'></li>" +
			"<li title='idConceitoFilho1' value='" + idConceitoFilho + "'></li>" +
			"<li title='texto'>" + texto + "</li>" +
			"<li title='fonte'>" + fonte + "</li>" +
			"<li title='tamanhoFonte'>" + tamanhoFonte + "</li>" +
			"<li title='corFonte'>" + corFonte + "</li>" +
			"<li title='corFundo'>" + corFundo + "</li>" + 
			"<li title='idMapa'>" + idMapa + "</li>"
		;
		return mensagem;
	}
    
    function montarMensagemNovaSemiLigacao(idMapa, idLigacao, idConceito, papelConceito, NovaQtdFilhos){
		var mensagem = 
			"<5ul id='" + idLigacao + "' title='ligacao'>" + 
			"<li title='qtdFilhos' value='" + NovaQtdFilhos + "'></li>" +
			"<li title='idConceitoFilho"+ papelConceito +"' value='" + idConceito + "'></li>" +
			"<li title='idMapa'>" + idMapa + "</li>"
		;
		return mensagem;
	}
    
    function montarMensagemExclusao(idMapa, listaExcluidos){
    	var mensagem = "<6ul>";
    	
    	for(var i=0; listaExcluidos[i] != undefined; i++){
    		mensagem += "<li id='" + listaExcluidos[i].id + "' title='" + listaExcluidos[i].tipo +"'></li>";
    	}
    	mensagem += "<li title='idMapa'>" + idMapa + "</li>";

		return mensagem;
    }


    this.enviarMensagemAoServidor = function(mensagem){
    	socket.send(mensagem);
    };
    
    
    this.excluir = function(origem, idObjeto, msg) {
    	
    	if(origem == 0 ){
    		usuario.desselecionar(mapaAtual);
    		var listaExcluidos = montarListaExcluidos(idObjeto);
    		var mensagem = montarMensagemExclusao(mapaAtual.getId(), listaExcluidos);
    		usuario.enviarMensagemAoServidor(mensagem);
    	}
    	else{ //excluir fisicamente  e atualizar a lista
    		$(msg).children().each( function(index, element){
    			switch( $(element).attr("title") ){
    				case "conceito":
    					var idConceito = parseInt($(element).attr('id'));
    					
    					//remover as linhas graficamente
    					$(msg).children("li[title='linha']").each( function(index, subElement){
    						var idLinha = parseInt($(subElement).attr('id'));
    						mapaAtual.removerFilho(mapaAtual.getStageCanvas(), idLinha);
    					});
    					
    					
    					var conceitoContainer = mapaAtual.getStageCanvas().getChildAt( idConceito );
    					conceitoContainer.removeAllEventListeners("pressmove");
    					usuario.desselecionar(mapaAtual);
    					mapaAtual.removerFilho(mapaAtual.getStageCanvas(), idConceito);
    					mapaAtual.renderizar();
    					mapaAtual.getGerenciadorLista().excluirConceitoDaLista( idConceito );
    					
    				break;
    				case "ligacao":
    					var idLigacao = parseInt($(element).attr('id'));
    					
    					//remover as linhas graficamente
    					$(msg).children("li[title='linha']").each( function(index, subElement){
    						var idLinha = parseInt($(subElement).attr('id'));
    						mapaAtual.removerFilho(mapaAtual.getStageCanvas(), idLinha);
    					});
    					
    					var ligacaoContainer = mapaAtual.getStageCanvas().getChildAt( idLigacao );
    					ligacaoContainer.removeAllEventListeners("pressmove");
    					usuario.desselecionar(mapaAtual);
    					mapaAtual.removerFilho(mapaAtual.getStageCanvas(), idLigacao);
    					mapaAtual.renderizar();
    					mapaAtual.getGerenciadorLista().excluirLigacaoDaLista( idLigacao );
    				break;
    			}
    		});
    	}
    };
    
	function montarListaExcluidos(idObjeto){
		var tipoObjeto = verificarTipoObjeto(idObjeto);
		var listaExclusao = new Array(); // vetor que armazena todos os ids dos objetos a serem excluidos e seus tipos
    	var id;
    	var tipo;
		
    	if(tipoObjeto == "conceito"){
    		
    		var listaLigacoes = $('ul#'  + idObjeto).children("li[title='idLigacao']");
        	var papelConceito;
        	var qtdFilhos;
        	var idLigacao;
    		
    		for(var i=0; listaLigacoes.get(i) != undefined; i++){
        		idLigacao = parseInt($(listaLigacoes.get(i)).attr('value'));
        		qtdFilhos = $('ul#' + idLigacao).children("li[title='qtdFilhos']").val();
        		papelConceito = verificarPapelConceito(idObjeto, idLigacao);
        		
        		if(papelConceito == 0 || qtdFilhos == 1){ //se for o conceito pai ou se so tiver um filho - > deleta-se a palavra de ligacao
        			
        			//linha do conceito Pai da ligacao que sera deletada
        			id = $('ul#' + idLigacao).children("li[title='idLinhaPai']").val(); 
        			tipo = 'linha';
        			listaExclusao.push({id: id, tipo: tipo});
        			
        			//linhas dos  conceitos filhos da ligacao que sera deletada
        			listaLinhasFilhos = $('ul#' + idLigacao + " li[title^='idLinhaFilho']");
        	    	for(var j=0;listaLinhasFilhos.get(j) != undefined; j++){
        	    		id = $( listaLinhasFilhos.get(j) ).val();
        	    		tipo = 'linha';
        	    		listaExclusao.push({id: id, tipo: tipo});
        	    	}
        	    	
        	    	//colocar ligacao na lista
        			id = idLigacao;
    	    		tipo = 'ligacao';
    	    		listaExclusao.push({id: id, tipo: tipo});
        	    	
        		}
        		else{ //se houver mais de 1 filho
        			//inserir a linha do conceito filho na lista
        			id = $('ul#' + idLigacao).children("li[title='idLinhaFilho"+ papelConceito +"']").val();
        			tipo = 'linha';
        			listaExclusao.push({id: id, tipo: tipo});
        		}
        	}
    		//inseri o conceito a ser excluido
    		id = idObjeto;
    		tipo = 'conceito';
    		listaExclusao.push({id: id, tipo: tipo});
    	}
    	else{ //se for ligacao
    		
    		//linha do conceito Pai da ligacao que sera deletada
			id = $('ul#' + idObjeto).children("li[title='idLinhaPai']").val();
			tipo = 'linha';
			listaExclusao.push({id: id, tipo: tipo});
			
			//linhas dos  conceitos filhos da ligacao que sera deletada
			listaLinhasFilhos = $('ul#' + idObjeto + " li[title^='idLinhaFilho']");
	    	for(var j=0;listaLinhasFilhos.get(j) != undefined; j++){
	    		id = $( listaLinhasFilhos.get(j) ).val();
	    		tipo = 'linha';
	    		listaExclusao.push({id: id, tipo: tipo});
	    	}
	    	
	    	//colocar ligacao na lista
			id = idObjeto;
    		tipo = 'ligacao';
    		listaExclusao.push({id: id, tipo: tipo});
    	}
    	
    	return listaExclusao;
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
    
  //verifica verifica o papel do conceito na ligacao
    function verificarPapelConceitoViaMensagem(idConceito,listaLigacao){
    	var id;
		var papelConceito;
    	
		id = $(listaLigacao).children("li[title='idConceitoPai']").val();
		if(id==idConceito){
			return 0;
		}
		else{
			for(var i=1; papelConceito == undefined; i++){
    			if($(listaLigacao).children("li[title='idConceitoFilho" + i + "']").val() == idConceito){
    				papelConceito = i;
    			}
    		}
			return papelConceito;
		}
    }
    
  //encaminha mensagens vindas do servidor 
    //para atualizar a lista de elementos ou o nome dos mapas que podem ser abertos
   
    this.receberMensagemDoServidor = function(mensagem) { 
    	console.log(mensagem);
    	
    	if(mensagem[0] == "<"){
			switch(mensagem[1]){
		    	
			case "0": 
				mensagem = mensagem.replace("<0","<");
				carregarMapa(mensagem);
				break;
			case "1": //novo conceito criado por um usuario
		    		mensagem = mensagem.replace("<1ul","<ul");
					var id = parseInt($(mensagem).attr("id"));
					var texto = $(mensagem).children("li[title='texto']").text();
					var fonte = $(mensagem).children("li[title='fonte']").text();
					var tamanhoFonte = $(mensagem).children("li[title='tamanhoFonte']").text();
					var corFonte = $(mensagem).children("li[title='corFonte']").text();
					var corFundo = $(mensagem).children("li[title='corFundo']").text();
			        usuario.criarConceito(1,texto, fonte, tamanhoFonte, corFonte, corFundo,id);
				break;
				case "2": //conceito movido por algum usuario
					mensagem = mensagem.replace("<2ul","<ul");
					usuario.atualizarPosicaoConceito(mensagem);
				break;
				case "3": //ligacao criada por algum usuario
					mensagem = mensagem.replace("<3ul","<ul");
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
					usuario.criarLigacao(1, texto, fonte, tamanhoFonte, corFonte, corFundo, idLigacao, idLinhaPai, idLinhaFilho, idConceitoPai, idConceitoFilho, mensagem);
			        
				break;
				case "4": //palavra de ligacao movida por algum usuario
					mensagem = mensagem.replace("<4ul","<ul");
					usuario.atualizarPosicaoLigacao(mensagem);
				break;
				case "5": //nova SemiLigacao (
					mensagem = mensagem.replace("<5ul","<ul");
					var papelConceito =  $(mensagem).children("li[title='papelConceito']").val();
					var idConceito = $(mensagem).children("li[title='idConceitoFilho"+ papelConceito +"']").val();
					var idLigacao = parseInt($(mensagem).attr("id"));
					var idLinha = $(mensagem).children("li[title='idLinhaFilho"+ papelConceito +"']").val();
					
					mensagem = mensagem.replace("<li title='papelConceito' value = '" + papelConceito + "'></li>", "");
					
					usuario.criarSemiLigacao(1, mapaAtual, idConceito, idLigacao, idLinha, mensagem);
				break;
				
				case "6": //exclusao
					mensagem = mensagem.replace("<6ul","<ul");
					usuario.excluir(1, null, mensagem);
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
				
				conceito.redesenharConceito(objetoSelecionado);
				mapa.conceitosSelecionados[0] = undefined;
				mapa.desabilitarBotaoNovaLigacao();
				mapa.desabilitarBotaoExcluir();
			}
			
			if(objetoSelecionado.name=="ligacao"){
				
				conceito.redesenharConceito(objetoSelecionado);
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
    	var idConceito = conceito.getId(objetoSelecionado.parent);
    	var corFundo = conceito.getCorFundoViaId(idConceito);
    	
		rect.graphics.clear();
		rect.graphics.setStrokeStyle(espessuraBorda,"round").beginStroke(corSelecao).beginFill(corFundo).drawRoundRect( //adiciona na posicao zero,zero
				0,0,largura,altura,3);
		mapa.renderizar();
		mapa.conceitosSelecionados[0] = idConceito; //id do objeto no stage
		
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
}
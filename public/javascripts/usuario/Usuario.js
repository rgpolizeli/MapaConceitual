
function Usuario(idUsuarioP, idMapaP, ipServer, porta, listaElementos, nomeCanvasP ){
	//this e publico e var e privado
	var idUsuario = parseInt(idUsuarioP);
	var idMapa = parseInt(idMapaP);
	var ipServidor = ipServer;
	var portaConexao = porta;
	var socket;
	var usuario = this;
	var interfaceUsuario = new InterfaceUsuario(criarConceito, criarLigacao, ativarHandTool, desativarHandTool, setCriarLigacao, excluir,iniciarEdicao,editar);
	var mapaConceitual = new MapaConceitual(idMapa, nomeCanvasP, listaElementos, criarSemiLigacao, selecionar, desselecionar, abrirCriarLigacaoModal );
	
	function carregarMapa(msg){
		
		$(msg).find('ul[title=conceito]').each( function( index, element ){
			
			var id = parseInt($(element).attr("id"));
			var x = $(element).children("li[title='x']").attr("value");
			var y = $(element).children("li[title='y']").attr("value");
			var altura = $(element).children("li[title='altura']").attr("value");
			var largura = $(element).children("li[title='largura']").attr("value");
			
			if(x != "default"){
				x = parseFloat(x);
			}
			if(y != "default"){
				y = parseFloat(y);
			}
			if(altura != "default"){
				altura = parseFloat(altura);
			}
			if(largura != "default"){
				largura = parseFloat(largura);
			}
			
			var texto = $(element).children("li[title='texto']").text();
			var fonte = $(element).children("li[title='fonte']").text();
			var tamanhoFonte = $(element).children("li[title='tamanhoFonte']").text();
			var corFonte = $(element).children("li[title='corFonte']").text();
			var corFundo = $(element).children("li[title='corFundo']").text();
			
			mapaConceitual.inserirConceito(id, texto, fonte, tamanhoFonte, corFonte, corFundo, montarMensagemAoMoverConceito, montarMensagemAoAlterarTamanhoConceito, enviarMensagemAoServidor);
	        
			//default e a altura padrao (automatica)
			if(altura != 'default'){
				var mensagem = {
					idConceito: id,
					novaLargura: largura,
					novaAltura: altura,
					novoX: x,
					novoY: y
				}; 
				mapaConceitual.alterarTamanhoConceito(mensagem);
			}
			else{
				var msgPosicaoConceito = 
		        	"<ul id='" + id + "' title='conceito'>" + 
		        	"<li title='x' value='" + x + "'></li>" +
		        	"<li title='y' value='" + y + "'></li>" 
				;
		        mapaConceitual.atualizarPosicaoConceito(msgPosicaoConceito);
			}
	        
		});
		
		
		$(msg).find('ul[title=ligacao]').each( function( index, element ){
			
			var idLigacao = parseInt($(element).attr("id"));
			var idLinhaPai = $(element).children("li[title='idLinhaPai']").val();
			var idLinhaFilho;
			var idConceitoPai = $(element).children("li[title='idConceitoPai']").val();
			var idConceitoFilho;
			
			
			var x = $(element).children("li[title='x']").attr("value");
			var y = $(element).children("li[title='y']").attr("value");
			var altura = $(element).children("li[title='altura']").attr("value");
			var largura = $(element).children("li[title='largura']").attr("value");
			
			if(x != "default"){
				x = parseFloat(x);
			}
			if(y != "default"){
				y = parseFloat(y);
			}
			if(altura != "default"){
				altura = parseFloat(altura);
			}
			if(largura != "default"){
				largura = parseFloat(largura);
			}
			
			var texto = $(element).children("li[title='texto']").text();
			var fonte = $(element).children("li[title='fonte']").text();
			var tamanhoFonte = $(element).children("li[title='tamanhoFonte']").text();
			var corFonte = $(element).children("li[title='corFonte']").text();
			var corFundo = $(element).children("li[title='corFundo']").text();
			var qtdFilhos = $(element).children("li[title='qtdFilhos']").val();
			
			if(qtdFilhos == 1){
				idLinhaFilho = $(element).find("li[title^='idLinhaFilho']").first().val();
				idConceitoFilho = $(element).find("li[title^='idConceitoFilho']").first().val();
				
				mapaConceitual.inserirLigacao(texto, fonte, tamanhoFonte, corFonte, corFundo, idLigacao, idLinhaPai, idLinhaFilho, idConceitoPai, idConceitoFilho, montarMensagemAoMoverLigacao, montarMensagemAoAlterarTamanhoLigacao, enviarMensagemAoServidor);
				
				//default e a altura padrao (automatica)
				if(altura != 'default'){
					var mensagem = {
						idLigacao: idLigacao,
						novaLargura: largura,
						novaAltura: altura,
						novoX: x,
						novoY: y
					}; 
					mapaConceitual.alterarTamanhoLigacao(mensagem);
				}
				else{
					//default e a posicao padrao (automatica)
					if(x != 'default'){
						var msgPosicaoLigacao = 
							"<ul id='" + idLigacao + "' title='ligacao'>" + 
								"<li title='x' value='" + x + "'></li>" +
								"<li title='y' value='" + y + "'></li>" 
						;
						mapaConceitual.atualizarPosicaoLigacao(msgPosicaoLigacao);
					}
				}
				
				
			}
			else{
				var listaLigacao = $(element).clone();
				
				$(listaLigacao).children("li[title='qtdFilhos']").val(1);
				
				$(listaLigacao).find("li[title^='idConceitoFilho']").each(function (index, subElement){
					var papelConceito = verificarPapelConceitoViaMensagem( $(subElement).val(), listaLigacao);
					
					if( papelConceito != 1 ){ //se nao e o conceitoFilho1
						
						$(listaLigacao).children("li[title='idLinhaFilho"+ papelConceito + "']").remove();
						$(listaLigacao).children("li[title='idConceitoFilho"+ papelConceito + "']").remove();
					}
					else{ //se e o conceitoFilho1
						idLinhaFilho = $(listaLigacao).children("li[title='idLinhaFilho"+ papelConceito + "']").val();
						idConceitoFilho = $(subElement).val();
					}
				});
				
				mapaConceitual.inserirLigacao(texto, fonte, tamanhoFonte, corFonte, corFundo, idLigacao, idLinhaPai, idLinhaFilho, idConceitoPai, idConceitoFilho, montarMensagemAoMoverLigacao, montarMensagemAoAlterarTamanhoLigacao, enviarMensagemAoServidor);
				
				
				//default e a altura padrao (automatica)
				if(altura != 'default'){
					var mensagem = {
						idLigacao: idLigacao,
						novaLargura: largura,
						novaAltura: altura,
						novoX: x,
						novoY: y
					}; 
					mapaConceitual.alterarTamanhoLigacao(mensagem);
					
				}
				else{
					//default e a posicao padrao (automatica)
					if(x != 'default'){
						var msgPosicaoLigacao = 
							"<ul id='" + idLigacao + "' title='ligacao'>" + 
								"<li title='x' value='" + x + "'></li>" +
								"<li title='y' value='" + y + "'></li>" 
						;
						mapaConceitual.atualizarPosicaoLigacao(msgPosicaoLigacao);
					}
				}
				
				$(element).find("li[title^='idConceitoFilho']").each(function (index, subElement){
					var papelConceito = verificarPapelConceitoViaMensagem( $(subElement).val(), element);
					var idLinhaAtual = $(element).children("li[title='idLinhaFilho"+ papelConceito + "']").val();
					var idConceitoAtual = $(element).children("li[title='idConceitoFilho"+ papelConceito + "']").val();
					
					if(idConceitoFilho != idConceitoAtual){
						var novaQtdFilhos = $(listaLigacao).children("li[title='qtdFilhos']").val() + 1;
						mapaConceitual.inserirSemiLigacao(idConceitoAtual, idLigacao, idLinhaAtual, novaQtdFilhos, papelConceito);
					}
				});
				
			}
		});
	}
	
	
	this.conectarServidor = function(){ //conecta com o servidor atraves de socket e adiciona respostas a eventos
		
		socket = io(ipServidor);
		
		socket.on('connect', function(){
			socket.emit('conexao', idUsuario, idMapa);
		});
		
		socket.on('message', function(msg){
			usuario.receberMensagemDoServidor(msg);
		});
		
	};
	
	
	     
	function criarConceito ( texto, fonte, tamanhoFonte, corFonte, corFundo ) {
	
		var msg;
		msg = montarMensagemNovoConceito(idMapa, texto, fonte, tamanhoFonte, corFonte, corFundo);
		enviarMensagemAoServidor(msg);
		
	}
	

    function criarLigacao(texto, fonte, tamanhoFonte, corFonte, corFundo,idConceitoPai, idConceitoFilho){
  
    	var msg;
		msg = montarMensagemNovaLigacao(idMapa, idConceitoPai, idConceitoFilho, texto, fonte, tamanhoFonte, corFonte, corFundo);
		enviarMensagemAoServidor(msg);
		
    }
    
    function criarSemiLigacao(idMapaP, idConceitoP, idLigacaoP, qtdFilhosLigacaoP, papelConceitoP){
    	
    	var idMapa;
    	var idConceito;
    	var idLigacao;
    	var novaQtdFilhosLigacao;
    	var papelConceito;
    	var msg;
    	
    	idMapa = idMapaP;
    	idConceito = idConceitoP;
    	idLigacao = idLigacaoP;
    	novaQtdFilhosLigacao = qtdFilhosLigacaoP;
    	papelConceito = papelConceitoP;
    	
    	novaQtdFilhosLigacao +=1;
    	msg = montarMensagemNovaSemiLigacao(idMapa, idLigacao, idConceito, papelConceito, novaQtdFilhosLigacao);
		enviarMensagemAoServidor(msg);
    }
    
    
    
    
    function setCriarLigacao(valor){
    	mapaConceitual.setCriarLigacao(valor);
    }
    

    
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
    
    function montarMensagemAoMoverConceito(idConceito, idMapa, novoX, novoY){
		var mensagem = 
			"<2ul id='" + idConceito + "' title='conceito'>" + 
				"<li title='x' value='" + novoX + "'></li>" +
				"<li title='y' value='" + novoY + "'></li>" +
				"<li title='idMapa'>" + idMapa + "</li>"
			;
		return mensagem;
	}
	
	function montarMensagemAoMoverLigacao(idLigacao, idMapa, novoX, novoY){
		var mensagem = 
			"<4ul id='" + idLigacao + "' title='ligacao'>" + 
				"<li title='x' value='" + novoX + "'></li>" +
				"<li title='y' value='" + novoY + "'></li>" +
				"<li title='idMapa'>" + idMapa + "</li>"
		;
		return mensagem;
	};
    
    function montarMensagemExclusao(idMapa, listaExcluidos){
    	var mensagem = "<6ul>";
    	
    	for(var i=0; listaExcluidos[i] != undefined; i++){
    		mensagem += "<li id='" + listaExcluidos[i].id + "' title='" + listaExcluidos[i].tipo +"'></li>";
    	}
    	mensagem += "<li title='idMapa'>" + idMapa + "</li>";

		return mensagem;
    }
    
    function montarMensagemAoAlterarTamanhoConceito(idMapa, idConceito, novaLargura, novaAltura, novoX, novoY){
    	var mensagem;
    	
    	mensagem = {
			tipoMensagem: 7,
			idMapa: idMapa,
			idConceito: idConceito,
			novaLargura: novaLargura,
			novaAltura: novaAltura,
			novoX: novoX,
			novoY: novoY
    	};
    	return mensagem;
    }
    
    function montarMensagemAoAlterarTamanhoLigacao(idMapa, idLigacao, novaLargura, novaAltura, novoX, novoY){
    	var mensagem;
    	
    	mensagem = {
			tipoMensagem: 8,
			idMapa: idMapa,
			idLigacao: idLigacao,
			novaLargura: novaLargura,
			novaAltura: novaAltura,
			novoX: novoX,
			novoY: novoY
    	};
    	return mensagem;
    }
    
    function montarMensagemAoEditar(propriedades){
    	
    	propriedades.tipoObjeto = mapaConceitual.verificarTipoObjeto(propriedades.idObjeto);
    	propriedades.idMapa = idMapa;
    	propriedades.tipoMensagem = 9;
    	
		return propriedades;
    }
    

    function enviarMensagemAoServidor( mensagem ){
    	socket.send(mensagem);
    };
    
    
    function excluir(){
    	var idObjeto = mapaConceitual.getIdObjetoSelecionado();
    	mapaConceitual.desselecionar();
		var listaExcluidos = mapaConceitual.getListaExcluidos(idObjeto);
		var mensagem = montarMensagemExclusao(idMapa, listaExcluidos);
		enviarMensagemAoServidor(mensagem);
    }
    
    
	function iniciarEdicao(){
		var propriedades;
		
		propriedades = mapaConceitual.getPropriedadesObjetoSelecionado();
		interfaceUsuario.abrirModalEdicao(propriedades);
	}
    
	
	function editar(propriedades){
		var msg;
		
		propriedades.idObjeto = mapaConceitual.getIdObjetoSelecionado();
		mapaConceitual.editar(propriedades);
		
		msg = montarMensagemAoEditar(propriedades);
		enviarMensagemAoServidor(msg);
	}
	
	
	
    
    /**
     * ativa funcao hand, redesenhando o retangulo para percorrer o mapa
     * adicionarStageMouseMove so e necessaria pois a funcao removeEventListener so funciona quando o handler e o mesmo do addEventListener
     */
    
    function ativarHandTool(){
    	mapaConceitual.ativarHandTool();
    }
    

    /**
     * remove o evento do movimento do mouse sobre o stageCanvas e pede para destruir o retangulo da handTool.
     */
    function desativarHandTool(){
    	mapaConceitual.desativarHandTool();
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
					mapaConceitual.inserirConceito(id, texto, fonte, tamanhoFonte, corFonte, corFundo, montarMensagemAoMoverConceito, montarMensagemAoAlterarTamanhoConceito, enviarMensagemAoServidor);
				break;
				case "2": //conceito movido por algum usuario
					mensagem = mensagem.replace("<2ul","<ul");
					mapaConceitual.atualizarPosicaoConceito(mensagem);
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
					mapaConceitual.inserirLigacao(texto, fonte, tamanhoFonte, corFonte, corFundo, idLigacao, idLinhaPai, idLinhaFilho, idConceitoPai, idConceitoFilho, montarMensagemAoMoverLigacao, montarMensagemAoAlterarTamanhoLigacao, enviarMensagemAoServidor);
			        
				break;
				case "4": //palavra de ligacao movida por algum usuario
					mensagem = mensagem.replace("<4ul","<ul");
					mapaConceitual.atualizarPosicaoLigacao(mensagem);
				break;
				case "5": //nova SemiLigacao (
					mensagem = mensagem.replace("<5ul","<ul");
					var papelConceito =  $(mensagem).children("li[title='papelConceito']").val();
					var idConceito = $(mensagem).children("li[title='idConceitoFilho"+ papelConceito +"']").val();
					var idLigacao = parseInt($(mensagem).attr("id"));
					var idLinha = $(mensagem).children("li[title='idLinhaFilho"+ papelConceito +"']").val();
					var qtdFilhos = $(mensagem).children("li[title='qtdFilhos']").val();
					
					mapaConceitual.inserirSemiLigacao(idConceito, idLigacao, idLinha, qtdFilhos, papelConceito);
				break;
				
				case "6": //exclusao
					mensagem = mensagem.replace("<6ul","<ul");
					mapaConceitual.excluir(mensagem);
				break;
			}
		}
		else{
			switch(mensagem.tipoMensagem){
			
				case 7: //tamanho do conceito alterado por algum usuario
					mapaConceitual.alterarTamanhoConceito(mensagem);
				break;
				
				case 8: //tamanho da ligacao alterado por algum usuario
					mapaConceitual.alterarTamanhoLigacao(mensagem);
				break;
				
				case 9: //objeto alterado por algum usuario
					mapaConceitual.editar(mensagem);
				break;
			}
		}
		
    };


    function desselecionar() {
    	interfaceUsuario.desabilitarBotaoNovaLigacao();
    	interfaceUsuario.desabilitarBotaoExcluir();
    	interfaceUsuario.desabilitarBotaoEditar();
    }
    
    function selecionar(){ //objetoSelecionado pode ser o retangulo ou label
    	interfaceUsuario.habilitarBotaoNovaLigacao();
    	interfaceUsuario.habilitarBotaoExcluir();
    	interfaceUsuario.habilitarBotaoEditar();
    }
    
    function abrirCriarLigacaoModal(idConceitoPai, idConceitoFilho){
    	interfaceUsuario.abrirModalCriarLigacao(idConceitoPai, idConceitoFilho);
    }
    
    function getPropriedadesObjeto(){
    	return mapaConceitual.getPropriedadesObjetoSelecionado();
    }
}
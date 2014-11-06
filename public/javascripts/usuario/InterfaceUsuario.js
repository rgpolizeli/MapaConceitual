function InterfaceUsuario(criarConceito, criarLigacao, ativarHandTool, desativarHandTool, setCriarLigacao, excluir){
	
	this.idConceitoPai;
	this.idConceitoFilho;
	var interfaceUsuario = this;

	this.desabilitarBotaoNovaLigacao = function(){
		$("#novaLigacao").hide();
	};

	this.desabilitarBotaoExcluir = function(){
		$("#excluir").hide();
	};

	/**
	 * 
	 */
	this.habilitarBotaoNovaLigacao = function(){
		$("#novaLigacao").show();
	};

	this.habilitarBotaoExcluir = function(){
		$("#excluir").show();
	};

	this.abrirModalCriarLigacao = function(idConceitoPai, idConceitoFilho){
		interfaceUsuario.idConceitoPai = idConceitoPai;
		interfaceUsuario.idConceitoFilho = idConceitoFilho;
		$('#interfaceCriarLigacao').modal('show');
	};

	/**
	 * quando usuario clica no handButton, chama ativarHandTool
	*/

	$("#handButton").click(ativarHandTool);


	/**
	 * quando usuario clica no editarButton, chama desativarHandTool
	*/
	$("#editarButton").click(desativarHandTool);


	/**
	 * quando usuario clica no novaLigacao, muda criarLigacao para true
	*/
		
	$("#novaLigacao").on('click', function (){
			setCriarLigacao(true);
	});

		
	$("#excluir").click(function (){
		excluir();
	});
		
		
		
	
	$("#criarConceitoButton").on("click", function abrirModal(){
		$('#interfaceCriarConceito').modal('show');
	});
	
	$("#criarConceito").on("click", function abrirModal(){
		var fonte = $("#fonte").text();
		var corFonte = $("#corFonte").val();
		var corFundo = $("#corFundo").val();
		var tamanhoFonte = $("#tamanhoFonte").text();
		var texto = $("#conceito").val();
		
		if(texto.length == 0){
			$('#conceito').focus();
		}
		else{
			$('#interfaceCriarConceito').modal('hide');
			criarConceito(texto, fonte, tamanhoFonte, corFonte, corFundo);
		}
	});
	
	$("#criarLigacao").on("click", function abrirModal(){
		var fonte = $("#fontel").text();
		var corFonte = $("#corFontel").val();
		var corFundo = $("#corFundol").val();
		var tamanhoFonte = $("#tamanhoFontel").text();
		var texto = $("#ligacao").val();
		
		if(texto.length == 0){
			$('#ligacao').focus();
		}
		else{
			$('#interfaceCriarLigacao').modal('hide');
			criarLigacao(texto, fonte, tamanhoFonte, corFonte, corFundo, interfaceUsuario.idConceitoPai, interfaceUsuario.idConceitoFilho);
		}
	});

}



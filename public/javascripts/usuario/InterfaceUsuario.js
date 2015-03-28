function InterfaceUsuario(criarConceito, criarLigacao, ativarHandTool, desativarHandTool, setCriarLigacao, excluir, iniciarEdicao,editar){
	
	this.idConceitoPai;
	this.idConceitoFilho;
	var interfaceUsuario = this;

	this.abrirModalQuedaConexao = function(){
		$('#quedaConexao').modal('show');
	};
	
	this.fecharModalQuedaConexao = function(){
		$('#quedaConexao').modal('hide');
	};
	
	
	this.desabilitarBotaoNovaLigacao = function(){
		$("#novaLigacao").hide();
	};

	this.desabilitarBotaoExcluir = function(){
		$("#excluir").hide();
	};
	
	this.desabilitarBotaoEditar = function(){
		$("#editar").hide();
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
	
	this.habilitarBotaoEditar = function(){
		$("#editar").show();
	};

	this.abrirModalCriarLigacao = function(idConceitoPai, idConceitoFilho){
		interfaceUsuario.idConceitoPai = idConceitoPai;
		interfaceUsuario.idConceitoFilho = idConceitoFilho;
		$('#interfaceCriarLigacao').modal('show');
	};
	
	this.abrirModalEdicao = function(propriedades){
		
		$('#textoEdicao').val(propriedades.texto);
		$('#corFundoEdicao').val(propriedades.corFundo);
		$('#corFonteEdicao').val(propriedades.corFonte);
		$('#fonteEdicao').text( propriedades.fonte );
		$('#tamanhoFonteEdicao').text( propriedades.tamanhoFonte );
		$('#interfaceEdicao').modal('show');
	};

	$("#confirmarEdicao").click(function (){
		
		var propriedades;

		propriedades = {
			fonte : $("#fonteEdicao").text(),
			corFonte : $("#corFonteEdicao").val(),
			corFundo : $("#corFundoEdicao").val(),
			tamanhoFonte : $("#tamanhoFonteEdicao").text(),
			texto : $("#textoEdicao").val()
		};
		
		if(propriedades.texto.length == 0){
			$('#textoEdicao').focus();
		}
		else{
			$('#interfaceEdicao').modal('hide');
			editar(propriedades);
		}
		
	});
	
	
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
	
	$("#editar").click(function (){
		iniciarEdicao();
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



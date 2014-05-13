function InterfaceCriarLigacao(usuario,mapa){
	this.label;
	this.txtBox;
	this.divBackground;
	this.divModal;
	this.btnOk;
	this.btnFechar;
	
	var backgroundAltura;
	var backgroundLargura;
	var winH;
	var winW;
	
	
	
	 /*this.construirModal = function(){
		
		//Altura e largura de todo o documento html, não soh o pedaço que o usuario ve
		backgroundAltura = $(document).height();
		backgroundLargura = $(document).width();
    
        //muda a altura e largura da div para ele cobrir toda a tela
        $('#divBackground').css({'width':backgroundLargura,'height':backgroundAltura});
        
        
        //efeitos de transicao, no primeiro a div aparece, no segundo ela fica opaca
        $('#divBackground').fadeIn(500);    
        $('#divBackground').fadeTo('fast',0.8);    
    
        //Pega a altura e largura da parte do documento html que o usuario ve
        winH = $(window).height();
        winW = $(window).width();
              
        //Muda a janela modal,a popup, para o centro
        $('#modal').css('top',  winH/2-$("#modal").height()/2);
        $('#modal').css('left', winW/2-$("#modal").width()/2);
        
        
        //faz a modal aparecer
        $('#modal').fadeIn(2000); 
    
    
	    //se o botao fechar for clicado as duas divs são ocultadas
	    $('#btnFechar').click(function (e){
	        $('#modal').hide();
	        $('#divBackground').hide();
	    });        
	    
	    //se a div background for clicada, as duas divs são ocultadas
	    $('#divBackground').click(function (){
	    	$('#modal').hide();
	        $('#divBackground').hide();
	    });
	    */
	    $( "#btnOK" ).click(function() {
			$('#modal').hide();
	        
			
	        var texto = $('#txtBox').val();
	        $('#txtBox').val("");
			var fonte = "Arial";
	        var tamanhoFonte = "18px"; 
	        var corFonte = "white";
	        var corFundo = "gray";
	        
	       usuario.criarLigacao(0,mapa,texto, fonte, tamanhoFonte, corFonte, corFundo,null,null,null,mapa.conceitosSelecionados[0], mapa.conceitosSelecionados[1], null);
		
	     //necessario para o evento nao acumular
	        $( "#btnOK" ).unbind();
	        $( "#btnFechar" ).unbind();
	        
	        $('#modal').hide();
	        $('#lean_overlay').hide();
		});
	    
	    $("#btnFechar").click(function(){
	    	$('#txtBox').val("");
	    	$( "#btnFechar" ).unbind();
	    	$( "#btnOK" ).unbind();
	    });
	
}
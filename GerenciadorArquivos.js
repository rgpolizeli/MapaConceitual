function MapaAberto(idMapa, arqXml){
	this.idMapa = idMapa;
	this.arqXml = arqXml;
}

function GerenciadorArquivos(){
	
	
	var jsdom = require("jsdom");
	var fs = require('fs');
	var $  = require('jquery')(jsdom.jsdom().createWindow());
	var Stochator = require('stochator'); //gerar numeros aleatorios
	
	var gerenciador = this;
	
	var listaMapasAbertos = new Array();
	
	
	
	this.abrirMapa = function ( idMapa ){
		var path = './public/mapas/' + idMapa + '.xml';
		var arqXml = fs.readFileSync(path, "utf8");
		
		adicionarMapaNaLista( idMapa, arqXml );
	};
	

	this.carregarMapa = function (idMapa){
		
		var path = './public/mapas/' + idMapa + '.xml';
		var arqXml = fs.readFileSync(path, "utf8");
		//console.log( $(arqXml).find('first_name').text() );
	};
	
	function adicionarMapaNaLista(idMapa, arqXml){
		var mapaAberto = new MapaAberto(idMapa,arqXml); 
		var i = 0;
		
		while(listaMapasAbertos[i]!= undefined)
			i++;
		listaMapasAbertos[i] = mapaAberto;
	}
	
	this.adicionarConceito = function(idMapa, conceito){
		var posicaoNaLista = gerenciador.buscarMapaNaLista(idMapa);
		
		
		
	};
	
	
	this.buscarMapaNaLista = function (idMapa){
		var i = 0;
		
		//se estiver vazia
		if(listaMapasAbertos.length == 0){
			i = -1;
		}
		else{
			while(listaMapasAbertos[i].idMapa != idMapa && i <= listaMapasAbertos.length)
				i++;
			
			//se nao encontrar
			if(i > listaMapasAbertos.length)
				i = -1;
		}
		
		return i;
	};
	
	this.getMapa = function (idMapa){
		var posicaoNaLista = gerenciador.buscarMapaNaLista(idMapa);
		console.log(posicaoNaLista);
		return listaMapasAbertos[ posicaoNaLista ].arqXml;
	};
	
	this.buscarIdDisponivel = function (idMapa){
		var posicaoNaLista = gerenciador.buscarMapaNaLista(idMapa);
		
		var stochator = new Stochator({
		    kind: "integer",
		    min: 0,
		    max: 500
		}, "roll");
		
		var idsUtilizados = obterIdsUtilizados(arqXml);
		
		
		var id = stochator.roll();
		
		while(idsUtilizados.indexOf(id) != -1){
			id = stochator.roll();
		}
		
		return id;
	};
	
	
	function obterIdsUtilizados(arqXml){
		
		var idsUtilizados = new Array();
		var i = 0;
		var qtdFilhos;
		
		$(arqXml).find('conceito').each( function( index, element ){
			idsUtilizados[i] = $( element ).find( 'id' );
			i++;
		});
		
		$(arqXml).find('palavraLigacao').each( function( index, element ){
			idsUtilizados[i] = $( element ).find( 'id' );
			i++;
			
			idsUtilizados[i] = $( element ).find('idLinhaPai').val();
			i++;
			
			qtdFilhos = $( element ).find('qtdFilhos').val();
			for(var j = 1; j <= qtdFilhos; j++){
				idsUtilizados[i] = $( element ).find('idLinhaFilho' + i).val();
				i++;		
			}
		});
		
		return idsUtilizados;
	}
	
	
	
	
}

module.exports = GerenciadorArquivos;

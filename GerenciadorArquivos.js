function MapaAberto(idMapa, interval, arqXml){
	this.idMapa = idMapa;
	this.interval = interval;
	this.arqXml = arqXml;
}

function GerenciadorArquivos(){
	
	
	var jsdom = require("jsdom").jsdom;
	var fs = require('fs');
	var $  = require('jquery')( jsdom().parentWindow );
	var Stochator = require('stochator'); //gerar numeros aleatorios
	
	var gerenciador = this;
	
	var listaMapasAbertos = new Array();
	
	this.verificarExistenciaArquivoXML = function verificarExistenciaArquivoXML(idMapa){
		var path = './public/mapas/' + idMapa + '.xml';
		try{
			var xmlStr = fs.readFileSync(path, "utf8");
			return true;
		}catch(erro){
			return false;
		}
	};
	
	this.excluirMapa = function excluirMapa(idMapa){
		var path;
		
		path = './public/mapas/' + idMapa + '.xml';
		try{
			fs.unlinkSync(path);
			return 1;
		}catch(err){
			return err.code;
		}
		
	};
	
	
	this.abrirMapa = function ( idMapa ){
		var path = './public/mapas/' + idMapa + '.xml';
		var xmlStr = fs.readFileSync(path, "utf8");
		var arqXml = $(xmlStr);
		
		adicionarMapaNaLista( idMapa, arqXml );
	};
	
	this.fecharMapa = function ( idMapa ){
		salvar(idMapa);
		pararSalvamento(idMapa);
		removerMapaDaLista( idMapa );
	};
	
	this.criarMapa = function ( idMapa, nomeMapa ){
		var path = './public/mapas/' + idMapa + '.xml';
		var xmlStr = "<?xml version='1.0'?><mapaConceitual><nome>"+ nomeMapa +"</nome><idmapa>"+ idMapa +"</idmapa></mapaConceitual>";
		fs.writeFileSync(path, xmlStr);
	};
	
	
	function pararSalvamento(idMapa){
		var posicaoNaLista = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		clearInterval(listaMapasAbertos[ posicaoNaLista ].interval);
	}
	

	this.carregarMapa = function (idMapa){
		
		var path = './public/mapas/' + idMapa + '.xml';
		var arqXml = fs.readFileSync(path, "utf8");
	};
	
	
	function getXmlString(xmlObj)
	{   
	    var xmlString="";
	    $(xmlObj).children().each(function(){
	        xmlString+="<"+this.nodeName.toLowerCase()+">";
	        if($(this).children().length>0){
	            xmlString+=getXmlString($(this));
	        }
	        else
	            xmlString+=$(this).text();
	        xmlString+="</"+this.nodeName.toLowerCase()+">";
	    });
	    return xmlString;
	}
	
	function salvar(idMapa){
		console.log('salvou');
		var path = './public/mapas/' + idMapa + '.xml';
		var posicaoNaLista = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		var xmlString = getXmlString(listaMapasAbertos[ posicaoNaLista ].arqXml);
		
		xmlString = "<?xml version='1.0'?><mapaConceitual>" + xmlString + "</mapaConceitual>";
		fs.writeFileSync(path, xmlString);
	}
	
	
	
	function adicionarMapaNaLista(idMapa, arqXml){
		var mapaAberto;
		var interval;
		var tempoSalvamento;
		var i;
		
		tempoSalvamento = 60000;
		interval = new setInterval(salvar, tempoSalvamento, idMapa);
		mapaAberto = new MapaAberto(idMapa, interval, arqXml); 
		
		i=0;
		while(listaMapasAbertos[i]!= undefined)
			i++;
		listaMapasAbertos[i] = mapaAberto;
	}
	
	function removerMapaDaLista( idMapa ){
		var posicaoNaLista = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		listaMapasAbertos.splice(posicaoNaLista, 1);
	}
	
	
	this.buscarPosicaoMapaNaLista = function (idMapa){
		var i = 0;
		
		//se estiver vazia
		if(listaMapasAbertos.length == 0){
			i = -1;
		}
		else{
			while(i <= listaMapasAbertos.length && listaMapasAbertos[i].idMapa != idMapa)
				i++;
			
			//se nao encontrar
			if(i > listaMapasAbertos.length)
				i = -1;
		}
		
		return i;
	};
	
	this.getMapa = function (idMapa){
		var posicaoNaLista = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		return listaMapasAbertos[ posicaoNaLista ].arqXml;
	};
	
	this.buscarIdDisponivel = function (idMapa){
		var posicaoNaLista = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		
		var stochator = new Stochator({
		    kind: "integer",
		    min: 0,
		    max: 500
		}, "roll");
		
		var idsUtilizados = obterIdsUtilizados(listaMapasAbertos[ posicaoNaLista ].arqXml);
		
		
		var id = stochator.roll();
		
		while(idsUtilizados.indexOf(id) != -1){
			id = stochator.roll();
		}
		
		return id;
	};
	
	
	function obterIdsUtilizados(arqXml){
		
		var idsUtilizados = new Array();
		var id;
		
		$(arqXml).find('conceito').each( function( index, element ){
			id = parseInt( $( element ).find( 'id' ).text() );
			idsUtilizados.push( id );
		});
		
		$(arqXml).find('palavraLigacao').each( function( index, element ){
			id = parseInt( $( element ).find( 'id' ).text() );
			idsUtilizados.push( id );
			
			id = parseInt( $( element ).find( 'idLinhaPai' ).text() );
			idsUtilizados.push( id );
			
			$( element ).children().each( function( index, subElement ){
				if( $(subElement).prop("tagName").indexOf("IDLINHAFILHO") != -1 ){
					id = parseInt( $(subElement).text() );
					idsUtilizados.push( id );
				}
			});
		});
		
		return idsUtilizados;
	}
	
	
	//conceito aqui nao e o da classe Conceito
	this.adicionarConceito = function (idMapa, conceito){
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		
		var estruturaConceito = 
			"<conceito>" +
			"<id>" + conceito.idConceito + "</id>" +
			"<x>" + 0 + "</x>" +
			"<y>" + 0 + "</y>" +
			"<largura>" + 'default' + "</largura>" +
			"<altura>" + 'default' + "</altura>" +
			"<larguraMinima>" + 'default' + "</larguraMinima>" +
			"<alturaMinima>" + 'default' + "</alturaMinima>" +
			"<texto>" + conceito.texto + "</texto>" +
			"<fonte>" + conceito.fonte + "</fonte>" + 
			"<tamanhoFonte>" + conceito.tamanhoFonte + "</tamanhoFonte>" + 
			"<corFonte>" + conceito.corFonte + "</corFonte>" + 
			"<corFundo>" + conceito.corFundo + "</corFundo>" +
			"</conceito>"
		;
		
		listaMapasAbertos[posicaoMapa].arqXml.append( $(estruturaConceito) );
	};
	
	
	this.adicionarLigacao = function adicionarLigacao(idMapa, ligacao){
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		var achouConceitoPai;
		var achouConceitoFilho;
		var todosConceitos;
		
		achouConceitoPai = false;
		achouConceitoFilho = false;
		todosConceitos = listaMapasAbertos[posicaoMapa].arqXml.find('conceito');
		
		var i=0;
		while(i < todosConceitos.length && (!achouConceitoPai || !achouConceitoFilho) ){ // enquanto ha conceitos para pesquisar e enquanto um dos dois conceitos procurados nao for encontrado
		    var id = parseInt( $( todosConceitos[i] ).find( "id" ).text() );
			if( id == ligacao.idConceitoPai ){
				achouConceitoPai = true;
			}
			else{
				if(id == ligacao.idConceitoFilho1){
					achouConceitoFilho = true;
				}
			}
			i++;
		}
		
		if(achouConceitoPai && achouConceitoFilho){
			var estruturaLigacao = 
			"<palavraLigacao>" +
			"<id>" + ligacao.idLigacao + "</id>" +
			"<qtdFilhos>"+ 1 + "</qtdFilhos>" +
			"<idLinhaPai>" + ligacao.idLinhaPai + "</idLinhaPai>" +
			"<idLinhaFilho1>" + ligacao.idLinhaFilho1 + "</idLinhaFilho1>" +
			"<idConceitoPai>" + ligacao.idConceitoPai + "</idConceitoPai>" +
			"<idConceitoFilho1>" + ligacao.idConceitoFilho1 + "</idConceitoFilho1>" +
			"<x>" + ligacao.x + "</x>" +
			"<y>" + ligacao.y + "</y>" +
			"<largura>" + 'default' + "</largura>" +
			"<altura>" + 'default' + "</altura>" +
			"<larguraMinima>" + 'default' + "</larguraMinima>" +
			"<alturaMinima>" + 'default' + "</alturaMinima>" +
			"<texto>" + ligacao.texto + "</texto>" +
			"<fonte>" + ligacao.fonte + "</fonte>" + 
			"<tamanhoFonte>" + ligacao.tamanhoFonte + "</tamanhoFonte>" + 
			"<corFonte>" + ligacao.corFonte + "</corFonte>" + 
			"<corFundo>" + ligacao.corFundo + "</corFundo>" +
			"</palavraLigacao>"
			;
		
			listaMapasAbertos[posicaoMapa].arqXml.append( $(estruturaLigacao) );
			
			
			listaMapasAbertos[posicaoMapa].arqXml.find('conceito').each( function( index, element ){
				var id = parseInt( $( element ).find( "id" ).text() );
				if( id == ligacao.idConceitoPai ||  id == ligacao.idConceitoFilho1){
					var novaLigacao = "<idLigacao>" + ligacao.idLigacao + "</idLigacao>";
					$( element ).append( $(novaLigacao) );
				}
			});
			
			return 1;
		}
		else{
			return 0;
		}
	};
	
	
	//
	this.alterarPosicaoConceito = function (idMapa, conceito){
		var alterado = false;
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		
		listaMapasAbertos[posicaoMapa].arqXml.find('conceito').each( function( index, element ){
		    var id = parseInt( $( element ).find( "id" ).text() );
			if( id == conceito.idConceito ){
				$( element ).find('x').text(conceito.novoX);
				$( element ).find('y').text(conceito.novoY);
				alterado = true;
			}
		});
		return alterado;
	};
	
	
	this.alterarPosicaoLigacao = function (idMapa, ligacao){
		var alterado = false;
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		
		listaMapasAbertos[posicaoMapa].arqXml.find('palavraLigacao').each( function( index, element ){
		    var id = parseInt( $( element ).find( "id" ).text() );
			if( id == ligacao.idLigacao ){
				$( element ).find('x').text(ligacao.novoX);
				$( element ).find('y').text(ligacao.novoY);
				alterado = true;
			}
		});
		return alterado;
	};
	
	this.getQtdFilhosLigacao = function getQtdFilhosLigacao(idMapa, idLigacao){
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		var qtdFilhos;
		
		listaMapasAbertos[posicaoMapa].arqXml.find('palavraLigacao').each( function( index, element ){
		    var id = parseInt( $( element ).find( "id" ).text() );
			if( id == idLigacao ){
				qtdFilhos = $( element ).find('qtdFilhos').text();
				qtdFilhos = parseInt(qtdFilhos);
			}
		});
		
		return qtdFilhos;
	};
	
	this.getPapelConceitoDisponivel = function getPapelConceitoDisponivel(idMapa, idLigacao){
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		var papelConceito = 1;
		
		listaMapasAbertos[posicaoMapa].arqXml.find('palavraLigacao').each( function( index, element ){
		    var id = parseInt( $( element ).find( "id" ).text() );
			if( id == idLigacao ){
				while( $( element ).find("idConceitoFilho"+ papelConceito).length != 0 )
					papelConceito++;
			}
		});
		return papelConceito;
	};
	
	
	this.adicionarSemiLigacao = function (idMapa, semiLigacao){
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		var resultado = 0;
		
		listaMapasAbertos[posicaoMapa].arqXml.find('palavraLigacao').each( function( index, element ){
		    var id = parseInt( $( element ).find( "id" ).text() );
			if( id == semiLigacao.idLigacao ){
				if( semiLigacao.novaQtdFilhos && semiLigacao.papelConceito && semiLigacao.idConceito ){
					
					listaMapasAbertos[posicaoMapa].arqXml.find('conceito').each( function( index, conceito ){
						var id = parseInt( $( conceito ).find( "id" ).text() );
						if( id == semiLigacao.idConceito ){
							
							$( element ).find('qtdFilhos').text(semiLigacao.novaQtdFilhos);
							var novaLinha = 
								"<idLinhaFilho" + semiLigacao.papelConceito + ">" + semiLigacao.idLinha + "</idLinhaFilho" + 
									+ semiLigacao.papelConceito +">"
							;
							var novoConceito = 
								"<idConceitoFilho" + semiLigacao.papelConceito + ">" + semiLigacao.idConceito + "</idConceitoFilho" + 
									+ semiLigacao.papelConceito +">"
							;
							
							$( element ).append( $(novaLinha) );
							$( element ).append( $(novoConceito) );
							
							var novaLigacao = "<idLigacao>" + semiLigacao.idLigacao + "</idLigacao>";
							$( conceito ).append( $(novaLigacao) );
							resultado = 1;
						}
					});
				}
			}
		});
		return resultado;
	};
	
	this.excluir = function (idMapa, exclusao){
		
		for(var i=0; exclusao[i] != undefined; i++){
			switch(exclusao[i].tipo){
				case 'ligacao':
					excluirLigacao(idMapa, exclusao[i].id);
				break;
				case 'conceito': 
					excluirConceito(idMapa, exclusao[i].id);
				break;
			}
		}
	};
	
	function excluirConceito(idMapa, idConceito){
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		
		listaMapasAbertos[posicaoMapa].arqXml.find('conceito').each( function( index, element ){
		    var id = parseInt( $( element ).find( "id" ).text() );
			if( id == idConceito ){
				var listaLigacoes = new Array();
				
				$( element ).find( "idLigacao" ).each( function( index, subElement ){
					listaLigacoes.push(parseInt( $( subElement ).text() ));
				});
				
				if(listaLigacoes.length != 0){
					listaMapasAbertos[posicaoMapa].arqXml.find('palavraLigacao').each( function( index, subElement ){
						var idLigacao = parseInt( $( subElement ).find( "id" ).text() );
						for(var i=0; i < listaLigacoes.length; i++){
							if(idLigacao == listaLigacoes[i]){
								var papelConceito = verificarPapelConceito(subElement, idConceito);
								
								if(papelConceito == 0){ //nao precisa atualizar a quantidade de filhos se for o conceito pai, pois a ligacao tambem sera eliminada futuramente
									$( subElement ).find( "idConceitoPai").remove();
									$( subElement ).find( "idLinhaPai").remove();
								}
								else{
									$( subElement ).find( "idConceitoFilho" + papelConceito).remove();
									$( subElement ).find( "idLinhaFilho" + papelConceito).remove();
									
									var qtdFilhos = parseInt( $( subElement ).find('qtdFilhos').text() );
									qtdFilhos--;
									$( subElement ).find('qtdFilhos').text(qtdFilhos);
								}
							}
						}
					});
				}
				
				$( element ).remove();
			}
		});
	}
	
	function verificarPapelConceito(palavraLigacao, idConceito){
		var id;
		var papelConceito;
		
		id = parseInt( $( palavraLigacao ).find( "idConceitoPai" ).text() );
		if(id==idConceito){
			papelConceito = 0;
		}
		else{
			$( palavraLigacao ).children().each( function( index, subElement ){
				if( $(subElement).prop("tagName").indexOf("IDCONCEITOFILHO") != -1 ){
					id = parseInt( $(subElement).text() );
					if(id == idConceito){
						papelConceito = $(subElement).prop("tagName").replace('IDCONCEITOFILHO','');
						papelConceito = parseInt(papelConceito);
					}
				}
			});
		}
		
		return papelConceito;
		
	}
	
	
	function excluirLigacao(idMapa, idLigacao){
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(idMapa);
		
		listaMapasAbertos[posicaoMapa].arqXml.find('palavraLigacao').each( function( index, element ){
		    var id = parseInt( $( element ).find( "id" ).text() );
			if( id == idLigacao ){
				var listaConceitos = new Array();
				
				listaConceitos.push(parseInt( $( element ).find( "idConceitoPai" ).text() ));
				
				$( element ).children().each( function( index, subElement ){
					if( $(subElement).prop("tagName").indexOf("IDCONCEITOFILHO") != -1 ){
						listaConceitos.push( parseInt( $(subElement).text() ) );
					}
				});
				
				
				listaMapasAbertos[posicaoMapa].arqXml.find('conceito').each( function( index, element ){
					var idConceito = parseInt( $( element ).find( "id" ).text() );
					for(var i=0; i < listaConceitos.length; i++){
						if(idConceito == listaConceitos[i]){
							$( element ).find( "idLigacao").each( function( index, ligacao ){
								if( $( ligacao ).text() == idLigacao)
									$( ligacao ).remove();
							});
						}
					}
				});
				
				$( element ).remove();
			}
		});
	}
	
	/*
	 * retorna -1 se o tamanho enviado ja for invalido - ou seja, a altura ou a largura sao menores do que as medidas minimas
	 * retorna 1 se sucesso
	 */
	this.alterarTamanhoConceito = function(mensagem){
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(mensagem.idMapa);
		var resultado;
				
		listaMapasAbertos[posicaoMapa].arqXml.find('conceito').each( function( index, element ){
		    var id = parseInt( $( element ).find( "id" ).text() );
			if( id == mensagem.idConceito ){
				var larguraMin;
				var alturaMin;
				
				larguraMin = $( element ).find('larguraMinima').text();
				alturaMin = $( element ).find('alturaMinima').text();
				if(larguraMin == "default"){
					larguraMin = mensagem.larguraMinima;
					alturaMin = mensagem.alturaMinima;
				}
				
				larguraMin = parseFloat(larguraMin);
				if(mensagem.novaLargura < larguraMin){
					return resultado = -1;
				}
				else{
					alturaMin = parseFloat(alturaMin);
					if(mensagem.novaAltura < alturaMin){
						return resultado = -1;
					}
					else{
						$( element ).find('largura').text(mensagem.novaLargura);
						$( element ).find('altura').text(mensagem.novaAltura);
						
						$( element ).find('larguraMinima').text(mensagem.larguraMinima);
						$( element ).find('alturaMinima').text(mensagem.alturaMinima);
						
						return resultado = 1;
					}
				}
			}
		});
		return resultado;
	};	
	
	/*
	 * retorna -1 se o tamanho enviado ja for invalido
	 * retorna 1 se sucesso
	 */
	this.alterarTamanhoLigacao = function(mensagem){
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(mensagem.idMapa);
		var resultado;
		
		listaMapasAbertos[posicaoMapa].arqXml.find('palavraLigacao').each( function( index, element ){
		    var id = parseInt( $( element ).find( "id" ).text() );
			if( id == mensagem.idLigacao ){
				var larguraMin;
				var alturaMin;
				
				larguraMin = $( element ).find('larguraMinima').text();
				alturaMin = $( element ).find('alturaMinima').text();
				if(larguraMin == "default"){
					larguraMin = mensagem.larguraMinima;
					alturaMin = mensagem.alturaMinima;
				}
				
				larguraMin = parseFloat(larguraMin);
				if(mensagem.novaLargura < larguraMin){
					return resultado = -1;
				}
				else{
					alturaMin = parseFloat(alturaMin);
					if(mensagem.novaAltura < alturaMin){
						return resultado = -1;
					}
					else{
						$( element ).find('largura').text(mensagem.novaLargura);
						$( element ).find('altura').text(mensagem.novaAltura);
						
						$( element ).find('larguraMinima').text(mensagem.larguraMinima);
						$( element ).find('alturaMinima').text(mensagem.alturaMinima);
						
						return resultado = 1;
					}
				}
			}
		});
		
		return resultado;
	};	

	
	this.editarConceito = function(mensagem){
		var resultado= false;
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(mensagem.idMapa);
		
		listaMapasAbertos[posicaoMapa].arqXml.find('conceito').each( function( index, element ){
		    var id = parseInt( $( element ).find( "id" ).text() );
			if( id == mensagem.idObjeto ){
			
				$( element ).find('fonte').text(mensagem.fonte);
				$( element ).find('corFonte').text(mensagem.corFonte);
				$( element ).find('corFundo').text(mensagem.corFundo);
				$( element ).find('tamanhoFonte').text(mensagem.tamanhoFonte);
				$( element ).find('texto').text(mensagem.texto);
				$( element ).find('alturaMinima').text(mensagem.alturaMinima);
				$( element ).find('larguraMinima').text(mensagem.larguraMinima);
				
				if(mensagem.altura)
					$( element ).find('altura').text(mensagem.altura);
				if(mensagem.largura)
					$( element ).find('largura').text(mensagem.largura);
			
				resultado= true;
			}
		});
		return resultado;
	};
	
	this.editarLigacao = function(mensagem){
		var resultado= false;
		var posicaoMapa = gerenciador.buscarPosicaoMapaNaLista(mensagem.idMapa);
		
		listaMapasAbertos[posicaoMapa].arqXml.find('palavraLigacao').each( function( index, element ){
		    var id = parseInt( $( element ).find( "id" ).text() );
			if( id == mensagem.idObjeto ){
				
				//Alterando largura e altura
				$( element ).find('fonte').text(mensagem.fonte);
				$( element ).find('corFonte').text(mensagem.corFonte);
				$( element ).find('corFundo').text(mensagem.corFundo);
				$( element ).find('tamanhoFonte').text(mensagem.tamanhoFonte);
				$( element ).find('texto').text(mensagem.texto);
				$( element ).find('alturaMinima').text(mensagem.alturaMinima);
				$( element ).find('larguraMinima').text(mensagem.larguraMinima);
				
				if(mensagem.altura)
					$( element ).find('altura').text(mensagem.altura);
				if(mensagem.largura)
					$( element ).find('largura').text(mensagem.largura);
				
				resultado = true;
			}
		});
		
		return resultado;
	};
	
	
	
}

module.exports = GerenciadorArquivos;

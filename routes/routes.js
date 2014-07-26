var cadastrar = require('./cadastrar');


/* GET home page. */
exports.pagina = function(req, res, nomePagina, mensagem){
  return res.render(nomePagina + '.ejs', mensagem);
};

exports.cadastrar = function(req,res,connection){
	cadastrar.cadastrar(req,res, connection);
};

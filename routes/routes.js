/* GET home page. */
exports.pagina = function(req, res, nomePagina, mensagem){
  return res.render(nomePagina + '.ejs', mensagem);
};

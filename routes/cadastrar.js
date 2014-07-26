exports.cadastrar = function(req, res,connection){ 

	connection.query('INSERT INTO usuarios SET usuario = ?, password = ?, nome = ?, email = ?',[req.body.usuario, req.body.password, req.body.nome, req.body.email], function(err, result) {
		if(err){
			if(err.code == 'ER_NO_SUCH_TABLE'){
				connection.query('CREATE TABLE usuarios(id INT NOT NULL AUTO_INCREMENT, usuario VARCHAR(30), password VARCHAR(7), nome VARCHAR(100), email VARCHAR(100), PRIMARY KEY (id) )');
				connection.query('INSERT INTO usuarios SET usuario = ?, password = ?, nome = ?, email = ?',[req.body.usuario, req.body.password, req.body.nome, req.body.email], function(err, result) {
					if(err) console.log(err);
					else res.redirect('/');
				});
			}
			else
				console.log(err);
		}
		else res.redirect('/');
	});
};



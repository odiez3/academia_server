var fs = require('fs');
var pdf = require('html-pdf');



function makePdf(req, res) {

    let params = req.body;


    var contenido = `
<h1>Esto es un test de html-pdf</h1>
<p>Estoy generando PDF a partir de este ${params.name} HTML sencillo</p>
`;

    pdf.create(contenido).toStream((err, stream) => {
        if (err) return res.end(err.stack)
        res.setHeader('Content-type', 'application/pdf');
        console.log(stream.path);
        stream.pipe(res)
    })

}

module.exports = {
    makePdf
}
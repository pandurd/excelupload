var http = require('http');
var formidable = require('formidable');
const csv = require('csv-parser');
var path = require('path');
var fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
console.log(process.env.PORT);

http.createServer(function (req, res) {
    if (req.url == '/file') {
        var file = __dirname + '/out.csv';

        var filename = path.basename(file);
 
      
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', 'text/csv');
      
        var filestream = fs.createReadStream(file);
        filestream.pipe(res);
    } else if (req.url == '/fileupload') {
        const form = new formidable.IncomingForm();
        const data = [];
        const header = [];

        form.parse(req, function (err, fields, files) {
            fs.createReadStream(files.filetoupload.path)
            .pipe(csv())
            .on('headers', (headers) => {
                headers.forEach(element => {
                    header.push({id: element, title: element})
                });
            })
            .on('data', (row) => {
                Object.keys(row).forEach(function(key) {
                    row[key] = row[key].replace(/,/g, '');
                });
                data.push(row);
            })
            .on('end', () => {
                const csvWriter = createCsvWriter({
                    path: 'out.csv',
                    header: header
                });
                csvWriter
                .writeRecords(data)
                .then(()=> console.log('The CSV file was written successfully'));
            });
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
        res.write('<input type="file" name="filetoupload"><br>');
        res.write('<input type="submit">');
        res.write('</form>');
        return res.end();
    }
}).listen(process.env.PORT || 3333);
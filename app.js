var http = require('http');
var fs = require('fs');
var path = require('path');
var tls = require('tls');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request-promise');
var app = express();
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var queryProfilesAnswer = '';
var reqQueryProfiles = '';

http.createServer(function (request, response) {
    console.log('Requisitando início do servidor node...');

    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
}

fs.readFile(filePath, function(error, content) {
    if (error) {
        if(error.code == 'ENOENT'){
            fs.readFile('./404.html', function(error, content) {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            });
        } else {
            response.writeHead(500);
            response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
            response.end(); 
        }
    } else {
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(content, 'utf-8');
    }
});

}).listen(4000);
console.log('(4000-NODE) Servidor rodando em http://127.0.0.1:4000/');

//Criação do WebSocket para comunicação com o cliente Browser
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 4001})

    wss.on('connection', function (ws) {
      ws.on('message', function (message) {
            reqQueryProfiles = message;            
            console.log("Requisição recebida do cliente para ser enviada ao HSM: " + reqQueryProfiles);

            const options = {
                ca: fs.readFileSync('certhsm.pem'),
                key: fs.readFileSync('keykmip.pem'),
                cert: fs.readFileSync('certkmip.pem'),
                host: '192.168.106.50',
                port: 5696,
                rejectUnauthorized: false
            };

            var socket = tls.connect(options, () => {
                console.log('(5696-SOCKET) Conexão ao HSM: ', socket.authorized ? 'authorized' : 'unauthorized');
                process.stdin.pipe(socket);
                process.stdin.resume();
            });

            socket.setEncoding('utf8');
                
            if (reqQueryProfiles !== '') {
                console.log('(5696-SOCKET) Tem hash documento para enviar pro HSM!');
                console.log('Requisição do cliente: ' + reqQueryProfiles)
                console.log('Requisição do cliente enviada: ' + Buffer.from(reqQueryProfiles, 'hex'))
                const buf2 = Buffer.from(reqQueryProfiles, 'hex');
                socket.write(buf2+'\n');
            }
                
            socket.on('data', (data) => {
                queryProfilesAnswer = data;
                console.log('Resposta Query Profiles: ' + queryProfilesAnswer)

                //Enviando documento em binário assinado para o cliente tratar              
                ws.send(queryProfilesAnswer);

        	});
    	});
  	});
            
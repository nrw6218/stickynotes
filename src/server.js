const http = require('http'); // http module
const url = require('url'); // url module
const query = require('query-string');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// handle POST requests
const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addUser') {
    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });
    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      console.dir(bodyString);

      const bodyParams = query.parse(bodyString);

      jsonHandler.addUser(request, response, bodyParams);
    });
  } else if (parsedUrl.pathname === '/addNote') {
    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });
    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      console.dir(bodyString);

      const bodyParams = query.parse(bodyString);

      jsonHandler.addNote(request, response, bodyParams);
    });
  }
};

const handleHead = (request, response, parsedUrl) => {
  // route to correct method based on url
  if (parsedUrl.pathname === '/getNotes') {
    jsonHandler.getNotes(request, response);
  } else if (parsedUrl.pathname === '/notReal') {
    jsonHandler.notReal(request, response);
  }
};

// handle GET requests
const handleGet = (request, response, parsedUrl) => {
  console.log(parsedUrl);
  // grab any query parameters
  const params = query.parse(parsedUrl.query);
  console.log(params);

  // route to correct method based on url
  if (parsedUrl.pathname === '/') {
    htmlHandler.getIndex(request, response);
  } else if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/bundle.js') {
    htmlHandler.getBundle(request, response);
  } else if (parsedUrl.pathname === '/sticky.js') {
    htmlHandler.getSticky(request, response);
  } else if (parsedUrl.pathname === '/getUsers') {
    jsonHandler.getUsers(request, response);
  } else if (parsedUrl.pathname === '/getNotes') {
    jsonHandler.getNotes(request, response);
  } else if (parsedUrl.pathname === '/getNote') {
    jsonHandler.getNote(request, response, params);
  } else {
    jsonHandler.notReal(request, response);
  }
};

// function to handle requests
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  // check if method was POST, HEAD or GET
  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else if (request.method === 'HEAD') {
    handleHead(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

// start server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);

const notes = {};

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

const getNotes = (request, response) => {
  if (request.method === 'GET') {
    // if it is a GET request
    const responseJSON = {
      notes,
    };

    respondJSON(request, response, 200, responseJSON);
  } else {
    // if it is a HEAD request
    respondJSONMeta(request, response, 200);
  }
};

// get individual note
const getNote = (request, response, queryParams) => {
  let responseMessage = 'Missing number query parameter.';
  let responseCode = 401;

  if (queryParams.number) {
    if (notes[queryParams.number]) {
      responseMessage = notes[queryParams.number];
      responseCode = 200;
    } else {
      responseMessage = `Note ${queryParams.number} does not exist.`;
      responseCode = 404;
    }
  }

  // create success message for response
  const responseJSON = {
    message: responseMessage,
  };

  if (responseCode === 401) responseJSON.id = 'unauthorized';

  return respondJSON(request, response, responseCode, responseJSON);
};

const addNote = (request, response, body) => {
  const responseJSON = {
    message: 'invalid params',
  };

  if (!body.number || body.number === null) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (notes[body.number]) {
    responseCode = 204;
  } else {
    notes[body.number] = {};
  }

  notes[body.number].number = body.number;
  notes[body.number].message = body.message;
  notes[body.number].left = body.left;
  notes[body.number].top = body.top;
  notes[body.number].width = body.width;
  notes[body.number].height = body.height;
  notes[body.number].className = body.className;

  if (responseCode === 201) {
    responseJSON.message = `Created Note ${body.number} Successfully With Text "${body.message}"`;
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

const notReal = (request, response) => {
  if (request.method === 'GET') {
    // if it is a GET request
    const responseJSON = {
      id: 'notFound',
      message: 'The page you are looking for was not found',
    };

    respondJSON(request, response, 404, responseJSON);
  } else {
    // if it is a HEAD request
    respondJSONMeta(request, response, 404);
  }
};

module.exports = {
  getNotes,
  getNote,
  addNote,
  notReal,
};

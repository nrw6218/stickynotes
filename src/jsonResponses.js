const notes = {};
const users = {};

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

const getUsers = (request, response) => {
  if (request.method === 'GET') {
    // if it is a GET request
    const responseJSON = {
      users,
    };

    respondJSON(request, response, 200, responseJSON);
  } else {
    // if it is a HEAD request
    respondJSONMeta(request, response, 200);
  }
};

const getNotes = (request, response, queryParams) => {
  // if it is a GET request
  if (request.method === 'GET') {
    // go through filtering options
    if (queryParams && queryParams.owner) {
      const filteredNotes = {};
      const vals = Object.values(notes);
      for (let i = 0; i < vals.length; i++) {
        if (vals[i].owner === queryParams.owner) {
          filteredNotes[i] = vals[i];
        }
      }
      const responseJSON = {
        filteredNotes,
      };
      return respondJSON(request, response, 200, responseJSON);
    }

    // standard option to get all notes
    const responseJSON = {
      notes,
    };

    return respondJSON(request, response, 200, responseJSON);
  }
  // if it is a HEAD request
  return respondJSONMeta(request, response, 200);
};

// get individual note
const getNote = (request, response, queryParams) => {
  let responseMessage = 'Missing number query parameter.';
  let responseCode = 401;

  if (queryParams && queryParams.number) {
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

const addUser = (request, response, body) => {
  const responseJSON = {
    message: 'Missing name.',
  };

  if (body.userName === null || body.userName === '') {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (users[body.userName]) {
    responseCode = 204;
  } else {
    users[body.userName] = {};
  }

  users[body.userName].userName = body.userName;

  if (responseCode === 201) {
    responseJSON.message = `Welcome ${body.userName}`;
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
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
  notes[body.number].owner = body.owner;

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
  getUsers,
  getNotes,
  getNote,
  addNote,
  addUser,
  notReal,
};

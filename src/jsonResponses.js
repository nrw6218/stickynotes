// Note this object is purely in memory
// When node shuts down this will be cleared.
// Same when your heroku app shuts down from inactivity
// We will be working with databases in the next few weeks.
const users = {};
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

const addNote = (request, response, body) => {
  console.dir('ADD NOTE');
  const responseJSON = {
    message: 'invalid params',
  };

  if (!body.message || !body.number) {
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

  if (responseCode === 201) {
    responseJSON.message = `Created Note ${body.number} Successfully With Text "${body.message}"`;
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

const addUser = (request, response, body) => {
  const responseJSON = {
    message: 'Name and age are both required',
  };

  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (users[body.name]) {
    responseCode = 204;
  } else {
    users[body.name] = {};
  }

  users[body.name].name = body.name;
  users[body.name].age = body.age;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
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
  addUser,
  addNote,
  notReal,
};

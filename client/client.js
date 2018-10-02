// function to parse our response
const parseJSON = (xhr, content) => {
// parse response (obj will be empty in a 204 updated)
  const obj = JSON.parse(xhr.response);
  console.dir(obj);

  // if message in response, add to screen
  if (obj.message) {
    const p = document.createElement('p');
    p.textContent = `Message: ${obj.message}`;
    content.appendChild(p);
  }

  // if users in response, add to screen
  if (obj.users) {
    const userList = document.createElement('p');
    const users = JSON.stringify(obj.users);
    userList.textContent = users;
    content.appendChild(userList);
  }
};

// function to handle our response
const handleResponse = (xhr, parseResponse) => {
  const content = document.querySelector('#content');

  // check the status code
  switch (xhr.status) {
    case 200: // success
      content.innerHTML = '<b>Success</b>';
      break;
    case 201: // created
      content.innerHTML = '<b>Create</b>';
      break;
    case 204: // updated (no response back from server)
      content.innerHTML = '<b>Updated (No Content)</b>';
      return;
    case 400: // bad request
      content.innerHTML = '<b>Bad Request</b>';
      break;
    case 404: // not found
      content.innerHTML = '<b>Resource Not Found</b>';
      break;
    default: // any other status code
      content.innerHTML = 'Error code not implemented by client.';
      break;
  }

  // parse response
  if (parseResponse) {
    parseJSON(xhr, content);
  }
};

// function to send our post request
const sendNote = (e, note) => {
  // grab the forms action (url to go to)
  // and method (HTTP method - POST in this case)
  const noteNumber = note.getAttribute('number');

  // grab the form's name and age fields so we can check user input
  const noteMessage = note.querySelector('#editor');

  // create a new Ajax request (remember this is asynchronous)
  const xhr = new XMLHttpRequest();
  // set the method (POST) and url (action field from form)
  xhr.open('post', '/addNote');

  // set our request type to x-www-form-urlencoded
  // which is one of the common types of form data.
  // This type has the same format as query strings key=value&key2=value2
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  // set our requested response type in hopes of a JSON response
  xhr.setRequestHeader('Accept', 'application/json');

  // set our function to handle the response
  xhr.onload = () => handleResponse(xhr, true);

  const formData = `number=${noteNumber}&message=${noteMessage.value}`;

  // send our request with the data
  xhr.send(formData);

  // prevent the browser's default action (to send the form on its own)
  e.preventDefault();
  // return false to prevent the browser from trying to change page
  return false;
};

// function to send our post request
const sendPost = (e, nameForm) => {
  // grab the forms action (url to go to)
  // and method (HTTP method - POST in this case)
  const nameAction = nameForm.getAttribute('action');
  const nameMethod = nameForm.getAttribute('method');

  // grab the form's name and age fields so we can check user input
  const nameField = nameForm.querySelector('#nameField');
  const ageField = nameForm.querySelector('#ageField');

  // create a new Ajax request (remember this is asynchronous)
  const xhr = new XMLHttpRequest();
  // set the method (POST) and url (action field from form)
  xhr.open(nameMethod, nameAction);

  // set our request type to x-www-form-urlencoded
  // which is one of the common types of form data.
  // This type has the same format as query strings key=value&key2=value2
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  // set our requested response type in hopes of a JSON response
  xhr.setRequestHeader('Accept', 'application/json');

  // set our function to handle the response
  xhr.onload = () => handleResponse(xhr, true);

  const formData = `name=${nameField.value}&age=${ageField.value}`;

  // send our request with the data
  xhr.send(formData);

  // prevent the browser's default action (to send the form on its own)
  e.preventDefault();
  // return false to prevent the browser from trying to change page
  return false;
};

// function to send request
const requestUpdate = (e, userForm) => {
  // grab url field
  const url = userForm.querySelector('#urlField').value;
  // grab type selected
  const type = userForm.querySelector('#methodSelect').value;

  const xhr = new XMLHttpRequest();
  xhr.open(type, url);
  xhr.setRequestHeader('Accept', type);

  if (type === 'get') {
    xhr.onload = () => handleResponse(xhr, true);
  } else {
    xhr.onload = () => handleResponse(xhr, false);
  }

  // send ajax request
  xhr.send();

  // cancel browser's default action
  e.preventDefault();
  // return false to prevent page redirection from a form
  return false;
};

const init = () => {
  // grab forms
  const nameForm = document.querySelector('#nameForm');
  const userForm = document.querySelector('#userForm');
  const stickyNote = document.querySelector('#mydiv');
  const editor = document.querySelector('#editor');
  console.dir(editor);
  dragElement(stickyNote);

  // create handlers
  const addUser = e => sendPost(e, nameForm);
  const addNote = e => sendNote(e, stickyNote);
  const getResponses = e => requestUpdate(e, userForm);

  // attach submit events (for clicking submit or hitting enter)
  editor.addEventListener('text-change', addNote);
  nameForm.addEventListener('submit', addUser);
  userForm.addEventListener('submit', getResponses);
};

function dragElement(element) {
  console.dir(element);
  if (element) {
    console.log('STICKY NOTES');
    let pos1 = 0; let pos2 = 0;
    let pos3 = 0; let pos4 = 0;
    if (document.getElementById(`${element.id}header`)) {
      // if present, the header is where you move the DIV from:
      document.getElementById(`${element.id}header`).onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      element.style.top = `${element.offsetTop - pos2}px`;
      element.style.left = `${element.offsetLeft - pos1}px`;
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
}

window.onload = init;

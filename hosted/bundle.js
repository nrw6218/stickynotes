'use strict';

// function to parse our response
var parseJSON = function parseJSON(xhr, content) {
  // parse response (obj will be empty in a 204 updated)
  var obj = JSON.parse(xhr.response);
  console.dir(obj);

  // if message in response, add to screen
  if (obj.message) {
    var p = document.createElement('p');
    p.textContent = 'Message: ' + obj.message;
    content.appendChild(p);
  }

  // if users in response, add to screen
  if (obj.users) {
    var userList = document.createElement('p');
    var users = JSON.stringify(obj.users);
    userList.textContent = users;
    content.appendChild(userList);
  }
};

// function to handle our response
var handleResponse = function handleResponse(xhr, parseResponse) {
  var content = document.querySelector('#content');

  // check the status code
  switch (xhr.status) {
    case 200:
      // success
      content.innerHTML = '<b>Success</b>';
      break;
    case 201:
      // created
      content.innerHTML = '<b>Create</b>';
      break;
    case 204:
      // updated (no response back from server)
      content.innerHTML = '<b>Updated (No Content)</b>';
      return;
    case 400:
      // bad request
      content.innerHTML = '<b>Bad Request</b>';
      break;
    case 404:
      // not found
      content.innerHTML = '<b>Resource Not Found</b>';
      break;
    default:
      // any other status code
      content.innerHTML = 'Error code not implemented by client.';
      break;
  }

  // parse response
  if (parseResponse) {
    parseJSON(xhr, content);
  }
};

// function to send our post request
var sendNote = function sendNote(e, note) {
  // grab the forms action (url to go to)
  // and method (HTTP method - POST in this case)
  var noteNumber = note.getAttribute('number');
  console.log(noteNumber);

  // grab the form's name and age fields so we can check user input
  var noteMessage = note.querySelector('#editor');

  // create a new Ajax request (remember this is asynchronous)
  var xhr = new XMLHttpRequest();
  // set the method (POST) and url (action field from form)
  xhr.open('post', '/addNote');

  // set our request type to x-www-form-urlencoded
  // which is one of the common types of form data.
  // This type has the same format as query strings key=value&key2=value2
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  // set our requested response type in hopes of a JSON response
  xhr.setRequestHeader('Accept', 'application/json');

  // set our function to handle the response
  xhr.onload = function () {
    return handleResponse(xhr, true);
  };

  var formData = 'number=' + noteNumber + '&message=' + noteMessage.value;

  // send our request with the data
  xhr.send(formData);

  // prevent the browser's default action (to send the form on its own)
  e.preventDefault();
  // return false to prevent the browser from trying to change page
  return false;
};

// function to send our post request
var sendPost = function sendPost(e, nameForm) {
  // grab the forms action (url to go to)
  // and method (HTTP method - POST in this case)
  var nameAction = nameForm.getAttribute('action');
  var nameMethod = nameForm.getAttribute('method');

  // grab the form's name and age fields so we can check user input
  var nameField = nameForm.querySelector('#nameField');
  var ageField = nameForm.querySelector('#ageField');

  // create a new Ajax request (remember this is asynchronous)
  var xhr = new XMLHttpRequest();
  // set the method (POST) and url (action field from form)
  xhr.open(nameMethod, nameAction);

  // set our request type to x-www-form-urlencoded
  // which is one of the common types of form data.
  // This type has the same format as query strings key=value&key2=value2
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  // set our requested response type in hopes of a JSON response
  xhr.setRequestHeader('Accept', 'application/json');

  // set our function to handle the response
  xhr.onload = function () {
    return handleResponse(xhr, true);
  };

  var formData = 'name=' + nameField.value + '&age=' + ageField.value;

  // send our request with the data
  xhr.send(formData);

  // prevent the browser's default action (to send the form on its own)
  e.preventDefault();
  // return false to prevent the browser from trying to change page
  return false;
};

// function to send request
var requestUpdate = function requestUpdate(e, userForm) {
  // grab url field
  var url = userForm.querySelector('#urlField').value;
  // grab type selected
  var type = userForm.querySelector('#methodSelect').value;

  var xhr = new XMLHttpRequest();
  xhr.open(type, url);
  xhr.setRequestHeader('Accept', type);

  if (type === 'get') {
    xhr.onload = function () {
      return handleResponse(xhr, true);
    };
  } else {
    xhr.onload = function () {
      return handleResponse(xhr, false);
    };
  }

  // send ajax request
  xhr.send();

  // cancel browser's default action
  e.preventDefault();
  // return false to prevent page redirection from a form
  return false;
};

var init = function init() {
  // grab forms
  var nameForm = document.querySelector('#nameForm');
  var userForm = document.querySelector('#userForm');
  var stickyNote = document.querySelector('#mydiv');
  var editor = document.querySelector('#editor');
  var newNoteButton = document.querySelector('#newNote');
  dragElement(stickyNote);

  // create handlers
  var addUser = function addUser(e) {
    return sendPost(e, nameForm);
  };
  var addNote = function addNote(e) {
    return sendNote(e, stickyNote);
  };
  var getResponses = function getResponses(e) {
    return requestUpdate(e, userForm);
  };

  // attach submit events (for clicking submit or hitting enter)
  editor.addEventListener('change', addNote);
  nameForm.addEventListener('submit', addUser);
  userForm.addEventListener('submit', getResponses);
  newNoteButton.addEventListener('click', addNewNote);
};

function addNewNote() {
  var board = document.querySelector('#board');
  var newNote = '<div id="mydiv" number="1"><div id="mydivheader"></div><textarea id="editor" placeholder="Fill in your note..."></textarea></div>';
  board.innerHTML += newNote;
}

function dragElement(element) {
  console.dir(element);
  if (element) {
    var dragMouseDown = function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    };

    var elementDrag = function elementDrag(e) {
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      element.style.top = element.offsetTop - pos2 + 'px';
      element.style.left = element.offsetLeft - pos1 + 'px';
    };

    var closeDragElement = function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    };

    console.log('STICKY NOTES');
    var pos1 = 0;var pos2 = 0;
    var pos3 = 0;var pos4 = 0;
    if (document.getElementById(element.id + 'header')) {
      // if present, the header is where you move the DIV from:
      document.getElementById(element.id + 'header').onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      element.onmousedown = dragMouseDown;
    }
  }
}

window.onload = init;

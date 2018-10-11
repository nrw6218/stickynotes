'use strict';

var stickyNotes = [];

// function to parse our response
var parseJSON = function parseJSON(xhr, board, content) {
  // parse response (obj will be empty in a 204 updated)
  var obj = JSON.parse(xhr.response);

  // if message in response, add to screen
  if (obj.message) {
    var p = document.createElement('p');
    p.textContent = obj.message;
    content.appendChild(p);
  }

  // if users in response, add to screen
  if (obj.notes) {
    var noteList = document.createElement('p');
    for (var key in obj.notes) {
      //If this is a null note, move on
      if (obj.notes[key] != null) {
        // if the note already exists, just update it
        var tempSticky = board.querySelector('#' + obj.notes[key].number);
        if (tempSticky) {
          var editor = tempSticky.querySelector('.editor');
          editor.value = obj.notes[key].message;
          editor.style.width = obj.notes[key].width;
          editor.style.height = obj.notes[key].height;
          tempSticky.style.left = obj.notes[key].left;
          tempSticky.style.top = obj.notes[key].top;
          tempSticky.style.width = obj.notes[key].width;
          tempSticky.style.height = obj.notes[key].height;
        } else {
          //otherwise, create a new note on the board
          var newNote = document.createElement('div');
          newNote.innerHTML += '<div id="header' + obj.notes[key].number + '" class="header"></div>';
          newNote.innerHTML += '<textarea class="editor" placeholder="Fill in your note..."></textarea>';
          board.appendChild(newNote);
          var _editor = newNote.querySelector('.editor');
          _editor.value = obj.notes[key].message;
          _editor.style.width = obj.notes[key].width;
          _editor.style.height = obj.notes[key].height;
          newNote.className = 'stickyNote';
          newNote.id = '' + obj.notes[key].number;
          newNote.style.left = obj.notes[key].left;
          newNote.style.top = obj.notes[key].top;
        }
      }
    }
    hookupNotes();
  }
};

// function to handle our response
var handleResponse = function handleResponse(xhr, parseResponse) {
  var content = document.querySelector('#content');
  var board = document.querySelector('#board');

  // check the status code
  switch (xhr.status) {
    case 200:
      // success
      content.innerHTML = '<b>Updated at ' + new Date().toLocaleTimeString() + '</b>';
      break;
    case 201:
      // created
      content.innerHTML = '<b>Note Created at ' + new Date().toLocaleTimeString() + '</b>';
      break;
    case 204:
      // updated (no response back from server)
      content.innerHTML = '<b>Saved at ' + new Date().toLocaleTimeString() + '</b>';
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
    parseJSON(xhr, board, content);
  }
};

// function to send our post request
var sendNote = function sendNote(e) {
  // grab the forms action (url to go to)
  // and method (HTTP method - POST in this case)
  var note = e.target.parentElement;
  var noteNumber = note.getAttribute('id');

  // don't bother calling the server if the number
  // is invalid
  if (noteNumber === null) {
    return false;
  }

  // grab the form's name and age fields so we can check user input
  var noteMessage = note.querySelector('.editor');

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

  var formData = 'number=' + noteNumber + '&message=' + noteMessage.value + '&left=' + note.style.left + '&top=' + note.style.top + '&width=' + noteMessage.style.width + '&height=' + noteMessage.style.height;

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

var getNotes = function getNotes(e) {
  console.dir('GET NOTES');
  return requestUpdate(e, '/getNotes', 'get');
};

// function to send request
var requestUpdate = function requestUpdate(e, url, type) {

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
  if (e) e.preventDefault();
  // return false to prevent page redirection from a form
  return false;
};

function hookupNotes() {
  stickyNotes = document.getElementsByClassName('stickyNote');
  var editors = document.getElementsByClassName('editor');
  for (var i = 0; i < stickyNotes.length; i++) {
    dragElement(stickyNotes[i]);
    editors[i].addEventListener('input', function (e) {
      return sendNote(e);
    });
  }
};

var init = function init() {
  var newNoteButton = document.querySelector('#newNote');

  // set up notes
  hookupNotes();

  // create handlers
  var notesResponse = function notesResponse(e) {
    return getNotes(e);
  };

  // attach submit events (for clicking submit or hitting enter)
  newNoteButton.addEventListener('click', addNewNote);
  newNoteButton.addEventListener('click', notesResponse);
  notesResponse();
  setInterval(notesResponse, 10000);
};

function addNewNote() {
  var board = document.querySelector('#board');
  var newNote = '<div class="stickyNote" id="note' + (document.getElementsByClassName('stickyNote').length + 1) + '"><div id="headernote' + (document.getElementsByClassName('stickyNote').length + 1) + '" class="header"></div><textarea class="editor" placeholder="Fill in your note..."></textarea></div>';
  board.innerHTML += newNote;
  hookupNotes();
}

function dragElement(element) {
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

    var closeDragElement = function closeDragElement(e) {
      e.preventDefault();
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;

      //Call sendNote to update position
      sendNote(e);
    };

    var pos1 = 0;var pos2 = 0;
    var pos3 = 0;var pos4 = 0;
    console.dir('header' + element.id);
    if (document.getElementById('header' + element.id)) {
      // if present, the header is where you move the DIV from:
      document.getElementById('header' + element.id).onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      // element.onmousedown = dragMouseDown;
      console.dir('ERROR');
    }
  }
}

window.onload = init;

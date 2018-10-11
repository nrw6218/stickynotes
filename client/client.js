let stickyNotes = [];

// function to parse our response
const parseJSON = (xhr, board, content) => {
// parse response (obj will be empty in a 204 updated)
  const obj = JSON.parse(xhr.response);

  // if message in response, add to screen
  if (obj.message) {
    const p = document.createElement('p');
    p.textContent = obj.message;
    content.appendChild(p);
  }

  // if notes in response, add to screen
  if (obj.notes) {
    const noteList = document.createElement('p');
    for(var key in obj.notes) {
      //If this is a null note, move on
      if(obj.notes[key] != null) {
        // if the note already exists, just update it
        let tempSticky = board.querySelector(`#${obj.notes[key].number}`);
        if(tempSticky) {
          const editor = tempSticky.querySelector('.editor');
          editor.value = obj.notes[key].message;
          editor.style.width = obj.notes[key].width;
          editor.style.height = obj.notes[key].height;
          tempSticky.style.left = obj.notes[key].left;
          tempSticky.style.top = obj.notes[key].top;
          tempSticky.style.width = obj.notes[key].width;
          tempSticky.style.height = obj.notes[key].height;
          tempSticky.className = obj.notes[key].className;

        } else {
          //otherwise, create a new note on the board
          const newNote = document.createElement('div');
          newNote.innerHTML += `<div id="header${obj.notes[key].number}" class="header"></div>`;
          newNote.innerHTML += `<textarea class="editor" placeholder="Fill in your note..."></textarea>`;
          board.appendChild(newNote);
          const editor = newNote.querySelector('.editor');
          editor.value = obj.notes[key].message;
          editor.style.width = obj.notes[key].width;
          editor.style.height = obj.notes[key].height;
          newNote.className = obj.notes[key].className;
          newNote.id = `${obj.notes[key].number}`;
          newNote.style.left = obj.notes[key].left;
          newNote.style.top = obj.notes[key].top;
        }
      }
    }
    hookupNotes();
  }
};

// function to handle our response
const handleResponse = (xhr, parseResponse) => {
  const content = document.querySelector('#content');
  const board = document.querySelector('#board');

  // check the status code
  switch (xhr.status) {
    case 200: // success
      content.innerHTML = `<b>Updated at ${new Date().toLocaleTimeString()}</b>`;
      break;
    case 201: // created
      content.innerHTML = `<b>Note Created at ${new Date().toLocaleTimeString()}</b>`;
      break;
    case 204: // updated (no response back from server)
      content.innerHTML = `<b>Saved at ${new Date().toLocaleTimeString()}</b>`;
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
    parseJSON(xhr, board, content);
  }
};

// function to send our post request
const sendNote = (e) => {
  const note = e.target.parentElement;
  // don't bother calling the server if the object is null
  if(note === null) {
    return false;
  }

  const noteNumber = note.getAttribute('id');
  // don't bother calling the server if the number is null
  if(noteNumber === null) {
    return false;
  }

  // grab the form's name and age fields so we can check user input
  const noteMessage = note.querySelector('.editor');

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

  const formData = `number=${noteNumber}&message=${noteMessage.value}&left=${note.style.left}&top=${note.style.top}&width=${noteMessage.style.width}&height=${noteMessage.style.height}&className=${note.className}`;

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

const getNotes = (e) => {
  return requestUpdate(e, '/getNotes', 'get')
}

// function to send request
const requestUpdate = (e, url, type) => {

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
  if(e) e.preventDefault();
  // return false to prevent page redirection from a form
  return false;
};

const hookupNotes = () => {
  stickyNotes = document.getElementsByClassName('stickyNote');
  const editors = document.getElementsByClassName('editor');
  for (var i = 0; i < stickyNotes.length; i++) {
    dragElement(stickyNotes[i]);
    editors[i].addEventListener('input', e => sendNote(e));
  }
};

const getRandColor = () => {
  const randColorNum = Math.floor(Math.random() * Math.floor(3));
  if (randColorNum === 0) {
    return 'blueSticky';
  } else if (randColorNum === 1) {
    return 'pinkSticky';
  } else {
    return 'yellowSticky';
  }
}

const init = () => {
  const newNoteButton = document.querySelector('#newNote');

  // set up notes
  hookupNotes();

  // create handlers
  const notesResponse = e => getNotes(e);

  // attach submit events (for clicking submit or hitting enter)
  newNoteButton.addEventListener('click', addNewNote);
  newNoteButton.addEventListener('click', notesResponse);
  newNoteButton.className = getRandColor();
  notesResponse();
  setInterval(notesResponse, 10000);
};

const addNewNote = (e) => {
  const board = document.querySelector('#board');
  const newNote = `<div class="stickyNote ${e.target.className}" id="note${document.getElementsByClassName('stickyNote').length+1}"><div id="headernote${document.getElementsByClassName('stickyNote').length+1}" class="header"></div><textarea class="editor" placeholder="Fill in your note..."></textarea></div>`;
  board.innerHTML += newNote;
  hookupNotes();

  //Generate a new random color for the next sticky note
  e.target.className = getRandColor();
}

function dragElement(element) {
  if (element) {
    let pos1 = 0; let pos2 = 0;
    let pos3 = 0; let pos4 = 0;
    if (document.getElementById(`header${element.id}`)) {
      // if present, the header is where you move the DIV from:
      document.getElementById(`header${element.id}`).onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      // element.onmousedown = dragMouseDown;
      console.dir('ERROR');
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

    function closeDragElement(e) {
      e.preventDefault();
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;

      //Call sendNote to update position
      sendNote(e);
    }
  }
}

window.onload = init;

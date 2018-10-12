let stickyNotes = [];
let userName = "";
let filterName = "";

// function to parse our response
const parseJSON = (xhr, board, content) => {
// parse response (obj will be empty in a 204 updated)
  const obj = JSON.parse(xhr.response);

  // if message in response, add to content
  if (obj.message) {
    const p = document.createElement('p');
    p.textContent = obj.message;
    content.appendChild(p);
  }

  // if notes in response, add to board
  if (obj.notes || obj.filteredNotes) {
    const noteList = document.createElement('p');
    let noteObj = {};
    if (obj.notes) {
      noteObj = obj.notes;
    } else {
      noteObj = obj.filteredNotes;
    }

    for(let key in noteObj) {
      //If this is a null note, move on
      if(noteObj[key] != null) {
        // if the note already exists, just update it
        let tempSticky = board.querySelector(`#${noteObj[key].number}`);
        if(tempSticky) {
          const editor = tempSticky.querySelector('.editor');
          editor.value = noteObj[key].message;
          editor.style.width = noteObj[key].width;
          editor.style.height = noteObj[key].height;
          tempSticky.style.left = noteObj[key].left;
          tempSticky.style.top = noteObj[key].top;
          tempSticky.className = noteObj[key].className;

        } else {
          //otherwise, create a new note on the board
          const newNote = document.createElement('div');
          newNote.innerHTML += `<div id="header${noteObj[key].number}" class="header"></div>`;
          newNote.innerHTML += `<textarea class="editor" placeholder="Fill in your note..."></textarea>`;
          board.appendChild(newNote);
          const editor = newNote.querySelector('.editor');
          editor.value = noteObj[key].message;
          editor.style.width = noteObj[key].width;
          editor.style.height = noteObj[key].height;
          newNote.className = noteObj[key].className;
          newNote.id = `${noteObj[key].number}`;
          newNote.style.left = noteObj[key].left;
          newNote.style.top = noteObj[key].top;
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
  const login = document.querySelector('#login');
  const loginButton = login.querySelector('#nameSubmit');

  content.style.color = 'black';

  // check the status code - check if you are responding to a user name
  // or to a note request
  switch (xhr.status) {
    case 200: // success
      content.innerHTML = `<b>Updated at ${new Date().toLocaleTimeString()}</b>`;
      break;
    case 201: // created
      if(login.style.display != 'none') {
        content.innerHTML = '';
        login.style.display = 'none';
        loginButton.disabled = true;
      } else {
        content.innerHTML = `<b>Note Created at ${new Date().toLocaleTimeString()}</b>`;
      }
      break;
    case 204: // updated (no response back from server)
      if(login.style.display != 'none') {
        content.style.color = 'red';
        content.innerHTML = `<b>That name is already taken - try entering a different name.</b>`;
      } else {
        content.innerHTML = `<b>Saved at ${new Date().toLocaleTimeString()}</b>`;
      }
      break;
    case 400: // bad request
      content.style.color = 'red';
      content.innerHTML = '<b>Bad Request</b>';
      break;
    case 404: // not found
      content.style.color = 'red';
      content.innerHTML = '<b>Resource Not Found</b>';
      break;
    default: // any other status code
      content.style.color = 'red';
      content.innerHTML = 'Error code not implemented by client.';
      break;
  }

  // parse response
  if (parseResponse) {
    parseJSON(xhr, board, content);
  }
};

// function to send our post request to add a node to the server
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

  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  // set our requested response type in hopes of a JSON response
  xhr.setRequestHeader('Accept', 'application/json');

  // set our function to handle the response
  xhr.onload = () => handleResponse(xhr, false);

  const formData = `number=${noteNumber}&message=${noteMessage.value}&left=${note.style.left}&top=${note.style.top}&width=${noteMessage.style.width}&height=${noteMessage.style.height}&className=${note.className}&owner=${userName}`;

  // send our request with the data
  xhr.send(formData);

  // prevent the browser's default action (to send the form on its own)
  e.preventDefault();
  
  // return false to prevent the browser from trying to change page
  return false;
};

// function to send our request to add a new username
const sendUserPost = (e, nameForm, hiddenElement) => {
  const nameAction = nameForm.getAttribute('action');
  const nameMethod = nameForm.getAttribute('method');

  const nameField = nameForm.querySelector('#nameField');

  const xhr = new XMLHttpRequest();
  xhr.open(nameMethod, nameAction);

  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  // set our function to handle the response
  xhr.onload = () => handleResponse(xhr, true);

  const formData = `userName=${nameField.value}`;
  userName = nameField.value;

  // send our request with the data
  xhr.send(formData);

  // prevent the browser's default action (to send the form on its own)
  e.preventDefault();
  // return false to prevent the browser from trying to change page
  return false;
}

// requests a note update depending on the filter requirements
const getNotes = (e) => {
  if (filterName != '') {
    return requestUpdate(e, `/getNotes?owner=${filterName}`, 'get');
  } else {
    return requestUpdate(e, '/getNotes', 'get');
  }
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

// set up all notes with the proper event handlers
const hookupNotes = () => {
  stickyNotes = document.getElementsByClassName('stickyNote');
  const editors = document.getElementsByClassName('editor');
  for (let i = 0; i < stickyNotes.length; i++) {
    dragElement(stickyNotes[i]);
    editors[i].addEventListener('input', e => sendNote(e));
  }
};

// wipe all sticky notes from the client view
const wipeBoard = () => {
  const board = document.querySelector('#board');
  board.innerHTML = '';
  stickyNotes = [];
}

// return a random string value that corresponds to a sticky color pallete
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
  // find all required form elements
  const newNoteButton = document.querySelector('#newNote');
  const nameForm = document.querySelector('#nameForm');
  const filterOwnerField = document.querySelector('#ownerField');
  const filterCheck = document.querySelector('#filterCheck');
  const loginSection = document.querySelector('#login');

  // Set up notes
  hookupNotes();

  // Create handlers
  const notesResponse = (e) => getNotes(e);
  const addUser = (e) => {
    sendUserPost(e, nameForm, loginSection);
  }
  const filterResponse = (e) => {
    // check if the filter is checked on and update the filter
    // name appropriately
    if (filterCheck.checked === true) {
      wipeBoard();
      filterName = filterOwnerField.value;
      if(filterName != userName) {
        newNoteButton.disabled = true;
      }
    } else {
      newNoteButton.disabled = false;
      filterName = "";
    }
    getNotes(null);
  }
  const reloadFilter = (e) => {
    // if the filter is enabled, wipe the board, change the name
    // and reload automatically
    if(filterCheck.checked) {
      wipeBoard();
      filterName = filterOwnerField.value;
      if (filterName != userName) newNoteButton.disabled = true;
      getNotes(null);
    }
  }

  // Attach events to new note button and beginning user input
  nameForm.addEventListener('submit', addUser);
  newNoteButton.addEventListener('click', addNewNote);
  newNoteButton.addEventListener('click', notesResponse);
  filterCheck.addEventListener('click', filterResponse);
  filterOwnerField.addEventListener('change', reloadFilter);

  // Choose a random color for the newNoteButton
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

const dragElement = (element) => {
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

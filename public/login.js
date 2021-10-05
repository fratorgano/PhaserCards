// getting elements from html
const roomNameInput = document.getElementById('roomName');
const createRoomButton = document.getElementById('createRoomButton');
createRoomButton.onclick = createRoom;

// opening socket
const socket = io();

// handle room_list event by creating a table with joinable rooms
socket.on('room_list', (roomListServer) => {
  // removing old rows
  document.getElementById('rows').textContent = '';

  // for each room add a row to the table
  for (const room of roomListServer) {
    // get the room

    // create a new row with room name, white player name,
    // black player name, spectators number and join button
    const roomRow = document.createElement('tr');
    const roomName = document.createElement('td');
    roomName.innerText = room.name;
    const roomPlayer0 = document.createElement('td');
    roomPlayer0.innerText = room.players[0] ? room.players[0].name : '';
    const roomPlayer1 = document.createElement('td');
    roomPlayer1.innerText = room.players[1] ? room.players[1].name : '';
    const roomSpecators = document.createElement('td');
    roomSpecators.innerText = room.spectators.length;

    // creating join room button
    const roomButton = document.createElement('td');
    const roomJoinButton = document.createElement('button');
    roomJoinButton.textContent = 'Join';
    roomJoinButton.addEventListener('click', function() {
      joinRoom(room.name);
    });

    // adding button to its cell
    roomButton.appendChild(roomJoinButton);

    // adding elements to row
    roomRow.appendChild(roomName);
    roomRow.appendChild(roomPlayer0);
    roomRow.appendChild(roomPlayer1);
    roomRow.appendChild(roomSpecators);
    roomRow.appendChild(roomButton);

    // adding row to table
    document.getElementById('rows').appendChild(roomRow);
    // roomList.appendChild(roomItem);
  }
});

// if the user doesn't have a name and a room name, can't create a room
function createRoom() {
  if (
    document.getElementById('userName').checkValidity() &&
    document.getElementById('roomName').checkValidity()
  ) {
    // console.log("creating room: ", roomNameInput.value);
    // notify the server about new room
    socket.emit('create_room', roomNameInput.value);
  }
}

// the user needs a name to join a room
function joinRoom(roomName) {
  if (document.getElementById('userName').checkValidity()) {

    // setting room name to pass it with form to game.html
    roomNameInput.value = roomName;
    // submit form
    document.getElementById('form').submit();
  }
  else {
    document.getElementById('userName').focus();
  }
}

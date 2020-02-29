// copy pasta from
// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getUserId() {
  let uuid = localStorage.getItem("uuid");
  if (!uuid) {
    uuid = uuidv4();
    localStorage.setItem("uuid", uuid);
  }
  return uuid;
}

export function reset() {
  localStorage.removeItem("uuid");

  // lazy way to reset game state..
  window.location.reload();
}

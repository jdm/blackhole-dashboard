//var API_HOST = "http://tranquil-plateau-4519.herokuapp.com/";
var API_HOST = "cgi-bin/query.cgi?url=";

function fetch(email) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var dashboard = document.getElementById('dashboard');
    dashboard.innerHtml = '';
    var t = document.createElement('table');
    dashboard.appendChild(t);
    var items = xhr.response["_items"];
    for (var i = 0; i < items.length; i++) {
      var r = document.createElement('tr');
      var c = document.createElement('td');
      c.textContent = JSON.stringify(items[i]);
      r.appendChild(c);
      t.appendChild(r);
    }
  };
  xhr.onerror = function() {
    console.log("error: " + xhr.status);
  };
  xhr.open("get", API_HOST + encodeURIComponent("contributions/?where=email=='" + email + "'"), true);
  xhr.responseType = 'json';
  xhr.send();
}
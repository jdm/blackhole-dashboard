//var API_HOST = "http://tranquil-plateau-4519.herokuapp.com/";
var API_HOST = "cgi-bin/query.cgi?url=";

var icons = {
  'bugzilla': 'bugzilla.gif',
  'hg': 'hg.png'
};

function nice_description(item) {
  switch (item.source) {
    case "bugzilla":
      if ('comment' in item.extra) {
        return "Commented on bug " + item.extra.id;
      } else {
        return "Modified bug " + item.extra.id;
      }
      break;
    case "hg":
      return "Committed hg revision.";
  }
}

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
      var a = document.createElement('a');
      a.setAttribute('href', items[i].canonical);
      var img = new Image();
      img.setAttribute('src', icons[items[i].source]);
      c.appendChild(img);
      a.textContent = nice_description(items[i]);
      c.appendChild(a);
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
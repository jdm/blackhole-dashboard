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
      } else if (item.extra.fields.length == 1 && item.extra.fields[0] == 'cc'){
        return "CCed themselves to bug " + item.extra.id;
      } else {
        return "Modified bug " + item.extra.id;
      }
      break;
    case "hg":
      return "Committed hg revision.";
  }
}

function fetchUntil(query, limiter, update, finished, error) {
  var count = 0;

  function fetchPage(page) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var items = xhr.response["_items"];
      count += items.length;
      update(items);
      if ('next' in xhr.response._links && limiter(count, items)) {
        fetchPage(page + 1);
      } else {
        finished();
      }
    };
    xhr.onerror = function() {
      if (error) {
        error();
      }
    };
    xhr.open("get", API_HOST + encodeURIComponent(query + "&page=" + page), true);
    xhr.responseType = 'json';
    xhr.send();
  }

  fetchPage(0);
}

function fetch(email) {
  var dashboard = document.getElementById('dashboard');
  dashboard.removeChild(dashboard.firstChild);
  var t = document.createElement('table');
  dashboard.appendChild(t);

  fetchUntil("contributions/?max_results=50&where=email=='" + email + "'",
             function shouldTerminate(count, items) {
               return count < 200;
             },
             function onupdate(items) {
               for (var i = 0; i < items.length; i++) {
                 var r = document.createElement('tr');
                 var c = document.createElement('td');
                 var a = document.createElement('a');
                 a.setAttribute('href', items[i].canonical);
                 console.log(new Date(items[i].datetime));
                 var img = new Image();
                 img.setAttribute('src', icons[items[i].source]);
                 c.appendChild(img);
                 a.textContent = nice_description(items[i]);
                 c.appendChild(a);
                 r.appendChild(c);
                 t.appendChild(r);
               }
             },
             function onfinish() {
               console.log("Finished fetch.");
             },
             function onerror() {
               console.log("unknown error");
             });  
}
//var API_HOST = "http://tranquil-plateau-4519.herokuapp.com/";
var API_HOST = "cgi-bin/query.cgi?url=";

function fetchAll(query, update, finished, error) {
  fetchUntil(query, function() { return true; }, update, finished, error);
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

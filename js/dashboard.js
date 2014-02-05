var m = [29, 20, 20, 19], // top right bottom left margin
    w = 620 - m[1] - m[3], // width
    h = 90 - m[0] - m[2], // height
    z = 11; // cell size

var day = d3.time.format("%w"),
    week = d3.time.format("%U"),
    percent = d3.format(".1%"),
    formatDate = d3.time.format("%Y-%m-%d"),
    formatNumber = d3.format(",d"),
    formatPercent = d3.format("+.1%");

var svg = d3.select("#body").selectAll(".year")
    .data(d3.range(1999, (new Date).getFullYear() + 1))
  .enter().append("div")
    .attr("class", "year")
    .style("width", w + m[1] + m[3] + "px")
    .style("height", h + m[0] + m[2] + "px")
    .style("display", "inline-block")
  .append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .attr("class", "RdYlGn")
  .append("svg:g")
    .attr("transform", "translate(" + (m[3] + (w - z * 53) / 2) + "," + (m[0] + (h - z * 7) / 2) + ")");

svg.append("svg:text")
    .attr("transform", "translate(-6," + z * 3.5 + ")rotate(-90)")
    .attr("text-anchor", "middle")
    .text(String);

var rect = svg.selectAll("rect.day")
    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("svg:rect")
    .attr("class", "day")
    .attr("width", z)
    .attr("height", z)
    .attr("x", function(d) { return week(d) * z; })
    .attr("y", function(d) { return day(d) * z; });

rect.append("svg:title");

svg.selectAll("path.month")
    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("svg:path")
    .attr("class", "month");
    //.attr("d", monthPath);

/*d3.csv("flights-departed.csv", function(csv) {
  flightData = d3.nest()
      .key(function(d) { return (d.date = formatDate.parse(d.date)).getFullYear(); })
      .key(function(d) { return d.date; })
      .rollup(function(d) { return +d[0].value; })
      .map(csv);

  display(flightData);
});*/

function display(data, title) {
  var color = d3.scale.quantize()
        .domain([-0.5,0.5])
        .range(d3.range(9));

  var preprocessed = {};
  for (var i = 0; i < data.length; i++) {
    var ds = (new Date(data[i].datetime)).toDateString();
    if (!(ds in preprocessed)) {
      preprocessed[ds] = 0;
    }
    preprocessed[ds]++;
  }

  svg.each(function(year) {

    d3.select(this).selectAll("rect.day")
        .attr("class", function(d) {
          var ds = d.toDateString()
          return "day q" + color(ds in preprocessed ? preprocessed[ds] : 0) + "-9"; })
        .select("title")
        .text(function(d) { var ds = d.toDateString(); return formatDate(d) + ": " + (ds in preprocessed ? preprocessed[ds] : 0); });
  });
}

/*function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);
  return "M" + (w0 + 1) * z + "," + d0 * z
      + "H" + w0 * z + "V" + 7 * z
      + "H" + w1 * z + "V" + (d1 + 1) * z
      + "H" + (w1 + 1) * z + "V" + 0
      + "H" + (w0 + 1) * z + "Z";
}*/

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

function resetButton() {
  var button = document.getElementById('fetcher');
  button.disabled = false;
  document.getElementById('spinner').style.visibility = 'hidden';
}

function fetch(email) {
  var button = document.getElementById('fetcher');
  button.disabled = true;
  document.getElementById('spinner').style.visibility = 'visible';

  var dashboard = document.getElementById('dashboard');
  dashboard.removeChild(dashboard.firstChild);
  var t = document.createElement('table');
  dashboard.appendChild(t);

  var allItems = [];
  fetchAll("contributions/?max_results=50&where=email=='" + email + "'",
             function onupdate(items) {/*
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
               }*/
               allItems = allItems.concat(items);
               display(allItems);
             },
             function onfinish() {
               display(allItems);
               console.log("Finished fetch.");
               resetButton();
             },
             function onerror() {
               console.log("unknown error");
               resetButton();
             });
}

/*function fetch(email) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var items = xhr.response["_items"];
    display(items);
  };
  xhr.onerror = function() {
    console.log("error: " + xhr.status);
  };
  xhr.open("get", API_HOST + encodeURIComponent("contributions/?where=email=='" + email + "'"), true);
  xhr.responseType = 'json';
  xhr.send();
}*/

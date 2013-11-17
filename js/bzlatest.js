

function classifyActivity(contribution) {
  if (contribution.extra["new"])
    return "filed";
  if ('flagtypes_name' in contribution.extra.values) {
    var attachment_flags = contribution.extra.values.flagtypes_name;
    var phrases = {
      "review?": "asked someone for review in",
      "review": "reviewed a patch in",
      "feedback": "gave feedback to a patch in",
      "needinfo?": "asked for more information in"
    };
    for (var i = 0; i < attachment_flags.length; i++) {
      var keys = Object.keys(phrases);
      for (var j = 0; j < keys.length; j++) {
        if (attachment_flags[i].indexOf(keys[j]) > -1)
          return phrases[keys[j]];
      }
    }
  }
  if (contribution.extra.patch)
    return "attached a patch to";
  if (contribution.extra.fields &&
      contribution.extra.fields.indexOf('attachment_created') > -1)
    return "attached a file to";
  if (contribution.extra.comment)
    return "commented on";
  if (contribution.extra.fields.length == 1 && contribution.extra.fields[0] == "cc")
    return "followed";
  return "modified";
}

var LIST_ENTRIES = 25;

function timeFromModified(lastChangeTime) {
  var lastModified = new Date(lastChangeTime);
  var today = new Date();
  var one_minute = 1000 * 60;
  var one_hour = one_minute * 60;
  var one_day = one_hour * 24;
  var one_week = one_day * 7;
  var one_month = one_week * 4;
  var one_year = one_month * 12;
  var diff = today.getTime() - lastModified.getTime();
  return {
    "raw": diff,
    "minutes": Math.floor(diff / one_minute),
    "hours": Math.floor(diff / one_hour),
    "days": Math.floor(diff / one_day),
    "weeks": Math.floor(diff / one_week),
    "months": Math.floor(diff / one_month),
    "years": Math.floor(diff / one_year)
  };
}

function separatorFromTime(time) {
  if (time.years > 0)
    return time.years + " years ago";
  if (time.months > 0)
    return time.months + " months ago";
  if (time.weeks > 0)
    return time.weeks + " weeks ago";
  if (time.days > 0)
    return time.days + " days ago";
  if (time.hours > 0)
    return time.hours + " hours ago";
  return time.minutes + " minutes ago";
}

function generateActivity(email) {
  document.getElementById('activity').innerHTML = '';

  var query = "contributions/?";
  query += "&max_results=" + LIST_ENTRIES;
  query += '&sort=[("datetime",-1)]';
  query += '&where={"email":"' + email + '","source":"bugzilla"}';
  //query += '&projection={"canonical":1,"datetime":1,"extra.summary":1,"extra.fields":1}';
  fetchUntil(encodeURI(query),
           function(count, items) {
             return count < LIST_ENTRIES;
           },
           function(items) {
             items = items.map(function(item) {
               return [item, timeFromModified(item.datetime)];
             });
             items = items.sort(function(a, b) {
               return a[1].diff < b[1].diff;
             });

             for (var i = 0; i < items.length; i++) {
               var item = items[i][0];
               //console.log(item);
               var time = items[i][1];
               var row = document.createElement('div');
               var description = document.createElement('span');
               description.textContent = classifyActivity(item) + " ";
               var link = document.createElement('a');
               link.href = item.canonical;
               if (item.extra.summary)
                 link.title = item.extra.summary;
               link.textContent = "bug " + item.extra.id;
               description.appendChild(link);

               var icon = new Image();
               icon.src = "bugzilla.gif";
               
               var timeElem = document.createElement('span');
               timeElem.textContent = separatorFromTime(time);
               timeElem.setAttribute('class', 'timeseparator');

               row.appendChild(icon);
               row.appendChild(description);
               row.appendChild(timeElem);
               document.getElementById('activity').appendChild(row);
             }
           },
           function() {
           });
}
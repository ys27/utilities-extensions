$(document).ready(function() {
  if (isNaN(localStorage["bookmarkCounter"])) {
    localStorage["bookmarkCounter"] = 0;
    localStorage["expiryRangeCounter"] = 0;
    localStorage["notificationRange"] = 7;
  }
  checkExpiryRange();
  renderBookmarkList();
  autoCurrent();
});

$('#notificationRangeInput').ready(function() {
  const notificationRange = localStorage["notificationRange"];
  $('#notificationRangeInput').val(notificationRange);
});

$('#addBookmarkButton').click(function() {
  $('#addStatus').html("<p>Adding... Do not make any changes.</p>");
  let url = $('#urlInput').val();
  const title = $('#titleInput').val();
  const date = $('#remindDateInput').val();
  if (!url.startsWith("http")) {
    url = "http://" + url;
  }
  if (!$('#titleInput').val()) {
    $('#addStatus').html("<p>Please enter a title.</p>");
  }
  if (checkDate(date)) {
    bookmarkCounter = localStorage["bookmarkCounter"];
    localStorage["url" + bookmarkCounter] = url;
    localStorage["title" + bookmarkCounter] = title;
    localStorage["date" + bookmarkCounter] = date;
    console.log(localStorage["title" + bookmarkCounter] + ' has been saved');
    localStorage["bookmarkCounter"] = parseInt(bookmarkCounter) + 1;
    $('#addStatus').html("<p style='font-weight:bold; font-size: 150%; text-align: center;'>Added!</p>");
  }
  setTimeout(function() {
    $('#addStatus').empty();
  }, 2000);
  checkExpiryRange();
  renderBookmarkList();
});

$('#notificationRangeButton').click(function() {
  localStorage["notificationRange"] = $('#notificationRangeInput').val();
});

//Deleting Bookmarks
$('#bookmarkList').on('click', 'button', function() {
  const id = $(this).attr('id');
  const bookmarkNumber = $(this).attr('key');
  if (id.endsWith("Delete")) {
    deleteBookmark(bookmarkNumber);
    renderBookmarkList();
  }
});

$("#urlInput").keyup(function(event){
    if(event.keyCode == 13){
        $("#addBookmarkButton").click();
    }
});

$("#remindDateInput").keyup(function(event){
    if(event.keyCode == 13){
        $("#addBookmarkButton").click();
    }
});

$('#indexPage').click(function() {
  window.location = "../Main/index.html"
});

$('#settingsPage').click(function() {
  $('#settings').show();
  $('#ReMind').hide();
  checkExpiryRange();
});

$('#addPage').click(function() {
  $('#addBookmark').show();
  $('#bookmarkList').hide();
});

$('#showPage').click(function() {
  $('#bookmarkList').show();
  $('#addBookmark').hide();
});

$('#homePage').click(function() {
  $('#ReMind').show();
  $('#settings').hide();
});

$('#resetButton').click(function() {
  localStorage["bookmarkCounter"] = 0;
  $('#deleteAllStatus').html("Deleted All.")
  chrome.browserAction.setBadgeText({text: ''});
});

function deleteBookmark(bookmarkNumber) {
  const bookmarkCounter = parseInt(localStorage["bookmarkCounter"]);
  for (let i = parseInt(bookmarkNumber); i < (bookmarkCounter-1); i++) {
    localStorage["url" + i] = localStorage["url" + (i+1)];
    localStorage["date" + i] = localStorage["date" + (i+1)];
  }
  localStorage["bookmarkCounter"] = bookmarkCounter - 1;
  checkExpiryRange();
}

function renderBookmarkList() {
  $('#activeBookmarkList').empty();
  $('#expiredBookmarkList').empty();
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate()-1);
  for (let i=0; i<parseInt(localStorage["bookmarkCounter"]); i++) {
    const url = localStorage["url"+i];
    let date = parseIntoBigDate(localStorage["date"+i]);
    const list = currentDate < date ? "activeBookmarkList" : "expiredBookmarkList";
    date = parseIntoSmallDate(date);
    $(`#${list}`).append("<div class='bookmark' id='bookmark"+i+"'></div>");
    $('#bookmark'+i).append("<a id='openURL' target='_blank' href='"+url+"'>"+localStorage["title"+i]+"</a>");
    $('#bookmark'+i).append("<div class='dateInfo' id='dateInfo"+i+"'>Expires: "+date+"</div>");
    $('#bookmark'+i).append("<button key="+i+" id='"+url+"Delete' class='btn btn-danger buttons'>Delete</button>");
  }
  if ($('#activeBookmarkList').children().length === 0) {
    $('#activeBookmarkList').html("<p>There are no active bookmarks.</p>");
  }
  if ($('#expiredBookmarkList').children().length === 0) {
    $('#expiredBookmarkList').html("<p>There are no expired bookmarks.</p>");
  }
}

function autoCurrent() {
  chrome.tabs.query({'active': true, 'currentWindow': true}, function(tabs) {
    $('#urlInput').val(tabs[0].url);
    $('#titleInput').val(tabs[0].title);
  });
  let currentDate = new Date();
  let month = currentDate.getMonth()+1;
  if (month < 10) {
    month = "0" + month;
  }
  $('#remindDateInput').val(parseIntoSmallDate(currentDate));
}

function checkDate(date) {
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate()-1);
  if (!date) {
    $('#addStatus').html("<p>Please enter a date.</p>");
    return false;
  }
  else {
    const givenDate = parseIntoBigDate(date);
    if (currentDate > givenDate) {
      $('#addStatus').html("<p>Please enter a date in the future.</p>");
      return false;
    }
  }
  return true;
}

function checkExpiryRange() {
  localStorage["expiryRangeCounter"] = 0;
  const bookmarkCounter = localStorage["bookmarkCounter"];
  if (bookmarkCounter == 0) {
    localStorage["expiryRangeCounter"] = 0;
    chrome.browserAction.setBadgeText({text: ''});
  }
  else {
    let expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate()+Number(localStorage["notificationRange"]));
    for (let i=0; i<bookmarkCounter; i++) {
      const date = parseIntoBigDate(localStorage["date"+i]);
      if (expiryDate > date) {
        localStorage["expiryRangeCounter"] = parseInt(localStorage["expiryRangeCounter"])+1;
        incrementNotifications();
      }
    }
  }
}

function incrementNotifications() {
  const ba = chrome.browserAction;
  ba.setBadgeBackgroundColor({color: '#9991BF'});
  ba.setBadgeText({text: localStorage["expiryRangeCounter"]});
}

function parseIntoBigDate(date) {
  return new Date(Number(date.substring(0,4)), Number(date.substring(5,7))-1, Number(date.substring(8,10)));
}

function parseIntoSmallDate(date) {
  let month = date.getMonth()+1;
  if (month < 10) {
    month = "0" + month;
  }
  return date.getFullYear() + "-" + month + "-" + date.getDate();
}

//TODO: send email on expiry date, sort by expiry date (optional), sort by entry (default)

$.when($.ready).then(function () {
  if (isNaN(localStorage["ReMind::bookmarkCounter"])) {
    localStorage["ReMind::bookmarkCounter"] = 0;
    localStorage["ReMind::expiryRangeCounter"] = 0;
    localStorage["ReMind::notificationRange"] = 7;
  }
  checkExpiryRange();
  $("#add-bookmark, #settings").hide();
  renderBookmarkList();
  getCurrentTabInfo();
});

$("#notification-range-input").on("ready", function () {
  const notificationRange = localStorage["ReMind::notificationRange"];
  $("#notification-range-input").val(notificationRange);
});

$("#add-bookmark-button").on("click", function () {
  $("#add-status").html("<p>Adding... Do not make any changes.</p>");
  let url = $("#url-input").val();
  const title = $("#title-input").val();
  const date = $("#remind-date-input").val();
  if (!url.startsWith("http")) {
    url = `http://${url}`;
  }
  if (!$("#title-input").val()) {
    $("#add-status").html("<p>Please enter a title.</p>");
  }
  if (checkDate(date)) {
    bookmarkCounter = localStorage["ReMind::bookmarkCounter"];
    localStorage[`ReMind::url${bookmarkCounter}`] = url;
    localStorage[`ReMind::title${bookmarkCounter}`] = title;
    localStorage[`ReMind::date${bookmarkCounter}`] = date;
    console.log(
      `${localStorage[`ReMind::title${bookmarkCounter}`]} has been saved`
    );
    localStorage["ReMind::bookmarkCounter"] = parseInt(bookmarkCounter) + 1;
    $("#add-status").html(
      "<p style='font-weight:bold; font-size: 150%; text-align: center;'>Added!</p>"
    );
  }
  setTimeout(function () {
    $("#add-status").empty();
  }, 2000);
  checkExpiryRange();
  renderBookmarkList();
});

$("#notification-range-button").on("click", function () {
  localStorage["ReMind::notificationRange"] = $(
    "#notification-range-input"
  ).val();
});

//Deleting Bookmarks
$("#bookmark-list").on("click", "button", function () {
  const id = $(this).attr("id");
  const bookmarkNumber = $(this).attr("key");
  if (id.endsWith("Delete")) {
    deleteBookmark(bookmarkNumber);
    renderBookmarkList();
  }
});

$("#url-input").on("keyup", function (event) {
  if (event.keyCode == 13) {
    $("#add-bookmark-button").trigger("click");
  }
});

$("#remind-date-input").on("keyup", function (event) {
  if (event.keyCode == 13) {
    $("#add-bookmark-button").trigger("click");
  }
});

$("#indexPage").on("click", function () {
  window.location = "../Main/index.html";
});

$("#settingsPage").on("click", function () {
  $("#settings").show();
  $("#ReMind").hide();
  checkExpiryRange();
});

$("#home-page").on("click", function () {
  $("#ReMind").show();
  $("#settings").hide();
});

$("#add-page").on("click", function () {
  $("#add-bookmark").show();
  $("#bookmark-list").hide();
});

$("#show-page").on("click", function () {
  $("#bookmark-list").show();
  $("#add-bookmark").hide();
});

$("#reset-button").on("click", function () {
  localStorage["ReMind::bookmarkCounter"] = 0;
  $("#delete-all-status").html("Deleted All.");
  chrome.browserAction.setBadgeText({ text: "" });
});

function deleteBookmark(bookmarkNumber) {
  const bookmarkCounter = parseInt(localStorage["ReMind::bookmarkCounter"]);
  for (let i = parseInt(bookmarkNumber); i < bookmarkCounter - 1; i++) {
    localStorage[`ReMind::url${i}`] = localStorage[`ReMind::url${i + 1}`];
    localStorage[`ReMind::date${i}`] = localStorage[`ReMind::date${i + 1}`];
  }
  localStorage["ReMind::bookmarkCounter"] = bookmarkCounter - 1;
  checkExpiryRange();
}

function renderBookmarkList() {
  $("#active-bookmark-list").empty();
  $("#expired-bookmark-list").empty();
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  for (let i = 0; i < parseInt(localStorage["ReMind::bookmarkCounter"]); i++) {
    const url = localStorage[`ReMind::url${i}`];
    let date = parseIntoBigDate(localStorage[`ReMind::date${i}`]);
    const list =
      currentDate < date ? "active-bookmark-list" : "expired-bookmark-list";
    date = parseIntoSmallDate(date);
    $(`#${list}`).append(`<div class='bookmark' id='bookmark${i}'></div>`);
    $(`#bookmark${i}`).append(
      `<div>
        <a id='openURL' target='_blank' href='${url}'>
          ${localStorage[`ReMind::title${i}`]}
        </a>
        <div class='dateInfo' id='dateInfo${i}'>Expires: ${date}</div>
      </div>`
    );
    $(`#bookmark${i}`).append(
      `<button key=${i} id='${url}Delete' type="button" class="close" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>`
    );
  }
  if ($("#active-bookmark-list").children().length === 0) {
    $("#active-bookmark-list").html("<p>There are no active bookmarks.</p>");
  }
  if ($("#expired-bookmark-list").children().length === 0) {
    $("#expired-bookmark-list").html("<p>There are no expired bookmarks.</p>");
  }
}

function getCurrentTabInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    $("#url-input").val(tabs[0].url);
    $("#title-input").val(tabs[0].title);
  });
  let currentDate = new Date();
  let month = currentDate.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  $("#remind-date-input").val(parseIntoSmallDate(currentDate));
}

function checkDate(date) {
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  if (!date) {
    $("#add-status").html("<p>Please enter a date.</p>");
    return false;
  } else {
    const givenDate = parseIntoBigDate(date);
    if (currentDate > givenDate) {
      $("#add-status").html("<p>Please enter a date in the future.</p>");
      return false;
    }
  }
  return true;
}

function checkExpiryRange() {
  localStorage["ReMind::expiryRangeCounter"] = 0;
  const bookmarkCounter = localStorage["ReMind::bookmarkCounter"];
  if (bookmarkCounter == 0) {
    localStorage["ReMind::expiryRangeCounter"] = 0;
    chrome.browserAction.setBadgeText({ text: "" });
  } else {
    let expiryDate = new Date();
    expiryDate.setDate(
      expiryDate.getDate() + Number(localStorage["ReMind::notificationRange"])
    );
    for (let i = 0; i < bookmarkCounter; i++) {
      const date = parseIntoBigDate(localStorage[`ReMind::date${i}`]);
      if (expiryDate > date) {
        localStorage["ReMind::expiryRangeCounter"] =
          parseInt(localStorage["ReMind::expiryRangeCounter"]) + 1;
        incrementNotifications();
      }
    }
  }
}

function incrementNotifications() {
  const ba = chrome.browserAction;
  ba.setBadgeBackgroundColor({ color: "#9991BF" });
  ba.setBadgeText({ text: localStorage["ReMind::expiryRangeCounter"] });
}

function parseIntoBigDate(date) {
  return new Date(
    Number(date.substring(0, 4)),
    Number(date.substring(5, 7)) - 1,
    Number(date.substring(8, 10))
  );
}

function parseIntoSmallDate(date) {
  let month = date.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  return `${date.getFullYear()}-${month}-${date.getDate()}`;
}

//TODO: send email on expiry date, sort by expiry date (optional), sort by entry (default)

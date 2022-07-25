let currentOrAllTabs = "CURRENT";

$.when($.ready).then(function () {
  getCurrentTabInfo();
});

$("#indexPage").on("click", function () {
  window.location = "../Main/index.html";
});

$("#currentTab").on("click", function () {
  currentOrAllTabs = "CURRENT";
  getCurrentTabInfo();
});

$("#allTabs").on("click", function () {
  currentOrAllTabs = "ALL";
  $("#currentURL").html("");
});

$("#withInput").on("keyup", function (event) {
  if (event.keyCode == 13) {
    $("#updateURLButton").trigger("click");
  }
});

$("#updateURLButton").on("click", function () {
  const replaceInput = $("#replaceInput").val();
  const withInput = $("#withInput").val();

  if (currentOrAllTabs === "CURRENT") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].url.includes(replaceInput)) {
        chrome.tabs.update({
          url: tabs[0].url.replace(replaceInput, withInput),
        });
      }
    });
  } else if (currentOrAllTabs === "ALL") {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        if (tab.url.includes(replaceInput)) {
          chrome.tabs.update(tab.id, {
            url: tab.url.replace(replaceInput, withInput),
          });
        }
      });
    });
  }
});

function getCurrentTabInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    $("#currentURL").html(tabs[0].url);
  });
}

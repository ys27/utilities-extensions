$.when($.ready).then(function () {
  if (isNaN(localStorage["CheckSome::urlCounter"])) {
    localStorage["CheckSome::urlCounter"] = 0;
  }
  renderURLList();
  getCurrentTabInfo();
});

$("#add-url-button").on("click", function () {
  $("#add-status").html("<p>Adding... Do not make any changes.</p>");
  let url = $("#url-input").val();
  if (!url.startsWith("http")) {
    url = `http://${url}`;
  }
  const checkString = $(`#checkString`).val();
  if (!checkString) {
    $("#add-status").html("<p>What should we check for?</p>");
  } else {
    $.ajax({
      url: url,
      dataType: "html",
      success: function () {
        urlCounter = localStorage["CheckSome::urlCounter"];
        localStorage[`CheckSome::url${urlCounter}`] = url;
        localStorage[`CheckSome::url${urlCounter}CheckString`] = checkString;
        console.log(`${url} has been saved`);
        localStorage["CheckSome::urlCounter"] = parseInt(urlCounter) + 1;
        $("#add-status").html("<p class='add-status'>Added!</p>");
        setTimeout(function () {
          $("#add-status").empty();
        }, 2000);
      },
      error: function (e) {
        console.log("Error: Not a valid URL.");
        $("#add-status").html("<p class='add-status'>Not a valid URL.</p>");
      },
    });
  }
});

$("#url-list").on("click", "button", function () {
  const id = $(this).attr("id");
  const urlNumber = $(this).attr("key");
  if (id.endsWith("Delete")) {
    console.log(urlNumber);
    deleteURL(urlNumber);
    renderURLList();
  } else {
    $(`#checkStatus${urlNumber}`).html("<p>Checking...</p>");
    $.ajax({
      url: $(this).attr("id"),
      dataType: "html",
      success: function (data) {
        console.log("success!");
        console.log(data);
        const dataCheck = existCheck(data, urlNumber);
        if (dataCheck) {
          localStorage[`CheckSome::url${urlNumber}CheckStatus`] = "Exists!";
        } else {
          localStorage[`CheckSome::url${urlNumber}CheckStatus`] =
            "Does not exist!";
        }
        $(`#checkStatus${urlNumber}`).html(
          localStorage[`CheckSome::url${urlNumber}CheckStatus`]
        );
        setTimeout(function () {
          $(`#checkStatus${urlNumber}`).empty();
        }, 3000);
        // if (parsedData != localStorage[`CheckSome::url${$(this).attr('key')}Data`]) {
        //   alert("Different!");
        //   localStorage[`CheckSome::url${$(this).attr('key')}Data`] = parsedData;
        //   console.log(localStorage[`CheckSome::url${$(this).attr('key')}Data`]);
        // }
        // else {
        //   alert("Same");
        // }
      },
      error: function (e) {
        console.log("error loading");
      },
    });
  }
});

$("#exist").on("keyup", function (event) {
  if (event.keyCode == 13) {
    $("#add-url-button").trigger("click");
  }
});

$("#indexPage").on("click", function () {
  window.location = "../Main/index.html";
});

$("#settingsPage").on("click", function () {
  $("#settings").show();
  $("#CheckSome").hide();
});

$("#home-page").on("click", function () {
  $("#CheckSome").show();
  $("#settings").hide();
  renderURLList();
});

$("#add-page").on("click", function () {
  $("#add-url").show();
  $("#content").hide();
});

$("#show-page").on("click", function () {
  $("#content").show();
  $("#add-url").hide();
  renderURLList();
});

$("#reset-button").on("click", function () {
  localStorage["CheckSome::urlCounter"] = 0;
  $("#delete-all-status").html("Deleted All.");
});

function getCurrentTabInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    $("#url-input").val(tabs[0].url);
  });
}

function removeElement(data, elementOpen, elementClose) {
  const usefulData = data;
  let parsedData = "";

  while (true) {
    let index = 0;
    const elementStart = usefulData.search(elementOpen);
    if (elementStart == -1) {
      break;
    }
    parsedData += usefulData.substring(index, elementStart);
    usefulData = usefulData.substring(elementStart);
    index = usefulData.search(elementClose) + elementClose.length;
    usefulData = usefulData.substring(index);
  }
  return parsedData;
}

function existCheck(data, urlNumber) {
  return data.search(localStorage[`CheckSome::url${urlNumber}CheckString`]) > 0;
}

function deleteURL(urlNumber) {
  const urlCounter = parseInt(localStorage["CheckSome::urlCounter"]);
  for (let i = parseInt(urlNumber); i < urlCounter - 1; i++) {
    localStorage[`CheckSome::url${i}`] = localStorage[`CheckSome::url${i + 1}`];
    localStorage[`CheckSome::url${i}CheckString`] =
      localStorage[`CheckSome::url${i + 1}CheckString`];
    localStorage[`CheckSome::url${i}CheckStatus`] =
      localStorage[`CheckSome::url${i + 1}CheckStatus`];
  }
  localStorage["CheckSome::urlCounter"] = urlCounter - 1;
}

function renderURLList() {
  $("#url-list").empty();
  for (let i = 0; i < parseInt(localStorage["CheckSome::urlCounter"]); i++) {
    url = localStorage[`CheckSome::url${i}`];
    $("#url-list").append(`<div class='check-url' id='check-url-${i}'></div>`);
    $(`#check-url-${i}`).append(
      `<a id='openURL' target='_blank' href='${url}'>${url}</a>`
    );
    $(`#check-url-${i}`).append(
      `<div class='check-info' id='check-info${i}'></div>`
    );
    $(`#check-info${i}`).append(
      `<div class='check-string-info' id='check-string-info-${i}'></div>`
    );
    $(`#check-string-info-${i}`).append(
      `Checks for string '${
        localStorage[`CheckSome::url${i}CheckString`]
      }'<br>to see if it exists`
    );
    $(`#check-info${i}`).append(
      `<div class='check-status-info' id='check-status-info${i}'></div>`
    );
    $(`#check-status-info${i}`).append(`<div id='checkStatus${i}'></div>`);
    $(`#check-url-${i}`).append(
      `<button key=${i} id='${url}' class='btn btn-info'>Check!</button>`
    );
    $(`#check-url-${i}`).append(
      `<button key=${i} id='${url}Delete' class='btn btn-danger buttons'>Delete</button>`
    );
  }
  if (localStorage["CheckSome::urlCounter"] == 0) {
    $("#url-list").html("<p>There are no URLs.</p>");
  }
}

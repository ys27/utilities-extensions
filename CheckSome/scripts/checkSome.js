$(document).ready(function () {
  if (isNaN(localStorage["urlCounter"])) {
    localStorage["urlCounter"] = 0;
  }
  renderURLList();
  getCurrentTabInfo();
});

$('#addURLButton').click(function () {
  $('#addStatus').html("<p>Adding... Do not make any changes.</p>");
  var url = $('#urlInput').val();
  var checkType = $('input[name=checkType]:checked').val();
  if (!url.startsWith("http")) {
    url = "http://" + url;
  }
  if (!$(`#${checkType}`).val()) {
    $('#addStatus').html("<p>What should we check for?</p>");
  }
  else {
    $.ajax({
      url: url,
      dataType: "html",
      success: function (data) {
        urlCounter = localStorage["urlCounter"];
        localStorage["url" + urlCounter] = url;
        console.log(localStorage["url" + urlCounter] + ' has been saved');
        localStorage["urlCounter"] = parseInt(urlCounter) + 1;
        var checkString;
        localStorage["url" + urlCounter + "CheckType"] = checkType;
        switch (checkType) {
          case "exist":
            localStorage["url" + urlCounter + "CheckTypeString"] = "exists.";
            break;
          case "notExist":
            localStorage["url" + urlCounter + "CheckTypeString"] = "doesn't exist.";
            break;
          case "regex":
            localStorage["url" + urlCounter + "CheckTypeString"] = "exists by regex.";
            break;
          default:
            console.log("Unknown CheckType!");
            break;
        }
        checkString = $(`#${checkType}`).val();
        localStorage["url" + urlCounter + "CheckString"] = checkString;
        localStorage["url" + urlCounter + "CheckStatus"] = "Unknown";
        $('#addStatus').html("<p style='font-weight:bold; font-size: 150%;'>Added!</p>");
        setTimeout(function () {
          $('#addStatus').empty();
        }, 2000);
      },
      error: function (e) {
        console.log("Error: Not a valid URL.");
        $('#addStatus').html("<p>Not a valid URL.</p>")
      }
    });
  }
});

$('#urlList').on('click', 'button', function () {
  var id = $(this).attr('id');
  var urlNumber = $(this).attr('key');
  if (id.endsWith("Delete")) {
    console.log(urlNumber)
    deleteURL(urlNumber);
    renderURLList();
  }
  else {
    $('#checkStatus' + urlNumber).html("<p>Checking...</p>");
    $.ajax({
      url: $(this).attr('id'),
      dataType: "html",
      success: function (data) {
        console.log("success!");
        console.log(data)
        // var dataCheck = checkData(data, urlNumber);
        // if (dataCheck) {
        //   alert("True");
        // }
        // else {
        //   alert("False");
        // }

        var dataCheck = existCheck(data, urlNumber);
        if (dataCheck) {
          localStorage["url" + urlNumber + "CheckStatus"] = "Exists!";
          // alert("Exists!")
        }
        else {
          localStorage["url" + urlNumber + "CheckStatus"] = "Does not exist!";
          // alert("Does not exist!")
        }
        $('#checkStatus' + urlNumber).html(localStorage["url" + urlNumber + "CheckStatus"]);
        setTimeout(function () {
          $('#checkStatus' + urlNumber).empty();
        }, 3000);
        // if (parsedData != localStorage["url" + $(this).attr('key') + "Data"]) {
        //   alert("Different!");
        //   localStorage["url" + $(this).attr('key') + "Data"] = parsedData;
        //   console.log(localStorage["url" + $(this).attr('key') + "Data"]);
        // }
        // else {
        //   alert("Same");
        // }
      },
      error: function (e) {
        console.log("error loading");
      }
    });
  }
});

$("#exist").keyup(function (event) {
  if (event.keyCode == 13) {
    $("#addURLButton").click();
  }
});
$("#notExist").keyup(function (event) {
  if (event.keyCode == 13) {
    $("#addURLButton").click();
  }
});

$('#exist').focus(function () {
  $('#existRadio').prop("checked", true);
  $('#notExistRadio').prop("checked", false);
});

$('#notExist').focus(function () {
  $('#notExistRadio').prop("checked", true);
  $('#existRadio').prop("checked", false);
});

$('#indexPage').click(function () {
  window.location = "../Main/index.html"
});

$('#settingsPage').click(function () {
  $('#settings').show();
  $('#CheckSome').hide();
});

$('#homePage').click(function () {
  $('#CheckSome').show();
  $('#settings').hide();
  renderURLList();
});

$('#addPage').click(function () {
  $('#addURL').show();
  $('#URLList').hide();
});

$('#showPage').click(function () {
  $('#URLList').show();
  $('#addURL').hide();
  renderURLList();
});

$('#resetButton').click(function () {
  localStorage["urlCounter"] = 0;
  $('#deleteAllStatus').html("Deleted All.")
});

function getCurrentTabInfo() {
  chrome.tabs.query({ 'active': true, 'currentWindow': true }, function (tabs) {
    $('#urlInput').val(tabs[0].url);
  });
}

function removeElement(data, elementOpen, elementClose) {
  var usefulData = data;
  var parsedData = "";

  while (true) {
    var index = 0;
    var elementStart = usefulData.search(elementOpen);
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

// function parseData(data) {
//   var parsedData = data;
//   // parsedData = removeElement(parsedData, "\\?", "\\'");
//   // parsedData = removeElement(parsedData, "<script>", "</script">");
//   // parsedData = removeElement(parsedData, "<style>", "</style">");

//   // based off of google.com results:
//   // parsedData = removeElement(parsedData, "href=\"", "\"");
//   // parsedData = removeElement(parsedData, "data-ved=\"", "\"");
//   // parsedData = removeElement(parsedData, "onmousedown=\"", "\"");

//   // parsedData = checkExists(parsedData);
//   return parsedData;
// }

function existCheck(data, urlNumber) {
  return (data.search(localStorage["url" + urlNumber + "CheckString"]) > 0);
}

function checkData(data, urlNumber) {
  var dataCheck;
  var checkType = localStorage["url" + urlNumber + "CheckType"];
  switch (checkType) {
    case "exist":
      dataCheck = existCheck(data, urlNumber);
      break;
    case "notExist":
      dataCheck = !existCheck(data, urlNumber);
      break;
    case "regex":
      dataCheck = regexCheck(data, urlNumber);
      break;
    default:
      console.log("Unknown CheckType!");
      break;
  }
  return dataCheck;
}

function deleteURL(urlNumber) {
  var urlCounter = parseInt(localStorage["urlCounter"]);
  for (var i = parseInt(urlNumber); i < (urlCounter - 1); i++) {
    localStorage["url" + i] = localStorage["url" + (i + 1)];
    localStorage["url" + i + "CheckType"] = localStorage["url" + (i + 1) + "CheckType"];
    localStorage["url" + i + "CheckString"] = localStorage["url" + (i + 1) + "CheckString"];
    localStorage["url" + i + "CheckTypeString"] = localStorage["url" + (i + 1) + "CheckTypeString"];
    localStorage["url" + i + "CheckStatus"] = localStorage["url" + (i + 1) + "CheckStatus"];
  }
  localStorage["urlCounter"] = urlCounter - 1;
}

function renderURLList() {
  $('#urlList').empty();
  for (var i = 0; i < parseInt(localStorage["urlCounter"]); i++) {
    url = localStorage["url" + i];
    $('#urlList').append("<div class='checkURL' id='checkURL" + i + "'></div>");
    $('#checkURL' + i).append("<a id='openURL' target='_blank' href='" + url + "'>" + url + "</a>");
    $('#checkURL' + i).append("<div class='checkInfo' id='checkInfo" + i + "'></div>");
    $('#checkInfo' + i).append("<div class='checkStringInfo' id='checkStringInfo" + i + "'></div>");
    $('#checkStringInfo' + i).append("Checks for string '" + localStorage["url" + i + "CheckString"] + "'<br>to see if it " + localStorage["url" + i + "CheckTypeString"]);
    $('#checkInfo' + i).append("<div class='checkStatusInfo' id='checkStatusInfo" + i + "'></div>");
    $('#checkStatusInfo' + i).append("<div id='checkStatus" + i + "'></div>");
    $('#checkURL' + i).append("<button key=" + i + " id='" + url + "' class='btn btn-info'>Check!</button>");
    $('#checkURL' + i).append("<button key=" + i + " id='" + url + "Delete' class='btn btn-danger buttons'>Delete</button>");
  }
  if (localStorage["urlCounter"] == 0) {
    $('#urlList').html("<p>There are no URLs.</p>");
  }
}

//Todo: Move to cheerio
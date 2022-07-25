// ReMind
$("#ReMind").on("click", function () {
  window.location = "/ReMind/index.html";
});

// CheckSome
$("#CheckSome").on("click", function () {
  window.location = "/CheckSome/index.html";
});

// UpdateURL
$("#UpdateURL").on("click", function () {
  window.location = "/UpdateURL/index.html";
});

// YoutubeSpaceDown
if (!localStorage.getItem("YoutubeSpaceDown::enabled")) {
  localStorage.setItem("YoutubeSpaceDown::enabled", "true");
  chrome.runtime.sendMessage({ "YoutubeSpaceDown::enabled": "true" });
}
$("#youtube-switch")
  .prop("checked", localStorage.getItem("YoutubeSpaceDown::enabled") === "true")
  .change();

$("#youtube-switch").change(function () {
  const youtubeSpaceDownEnabled = $(this).prop("checked").toString();
  localStorage.setItem("YoutubeSpaceDown::enabled", youtubeSpaceDownEnabled);
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      "YoutubeSpaceDown::enabled": youtubeSpaceDownEnabled,
    });
  });
});

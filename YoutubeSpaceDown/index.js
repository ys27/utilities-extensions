window.addEventListener("keydown", doKeyPress, false);

space_key = 32;
function doKeyPress(e) {
  if (localStorage.getItem("YoutubeSpaceDown::enabled") !== "false") {
    const height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;

    if (shouldScrollDown()) {
      if (e.shiftKey && e.keyCode === space_key) {
        window.scrollBy({
          top: -height,
          behavior: "smooth",
        });
      } else if (e.keyCode === space_key) {
        window.scrollBy({
          top: height,
          behavior: "smooth",
        });
      }
    }
  }
}

const shouldScrollDown = () => {
  return (
    !window.location.pathname.includes("watch") &&
    document.activeElement.id !== "search"
  );
};

chrome.runtime.onMessage.addListener(function (message) {
  localStorage.setItem(
    "YoutubeSpaceDown::enabled",
    message["YoutubeSpaceDown::enabled"]
  );
});

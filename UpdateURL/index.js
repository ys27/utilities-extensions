let mode = 'UPDATE_NUMBER';

$('#index-page').on('click', function () {
  window.location = '../Main/index.html';
});

$('#update-number').on('click', function () {
  mode = 'UPDATE_NUMBER';
  $('#input1Label').html('Prefix:');
  $('#input2Label').html('New number:');
});

$('#replace-text').on('click', function () {
  mode = 'REPLACE_TEXT';
  $('#input1Label').html('Replace:');
  $('#input2Label').html('With:');
});

$('#input2').on('keyup', function (event) {
  if (event.keyCode == 13) {
    $('#update-url-button').trigger('click');
  }
});

$('#update-url-button').on('click', function () {
  const input1Val = $('#input1').val();
  const input2Val = $('#input2').val();

  if (mode === 'UPDATE_NUMBER') {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        const hostname = new URL(tab.url).hostname
          .replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
          .split('.')[0];
        const [prefix, oldNumber] = hostname.match(/[a-z]+|[^a-z]+/gi);
        if (prefix === input1Val && oldNumber !== input2Val) {
          chrome.tabs.update(tab.id, {
            url: tab.url.replace(hostname, `${prefix}${input2Val}`),
          });
        }
      });
    });
  } else if (mode === 'REPLACE_TEXT') {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        if (tab.url.includes(input1Val)) {
          chrome.tabs.update(tab.id, {
            url: tab.url.replace(input1Val, input2Val),
          });
        }
      });
    });
  }
  $('#update-status').html('Updated!');
  setTimeout(() => {
    $('#update-status').html('');
  }, 3000);
});

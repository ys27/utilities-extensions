$(document).ready(() => {
  $('.aLink.popLink').on('click', function (e) {
    e.preventDefault();
    const newURL = $(this).attr('href');
    window.open(`${newURL}${window.location.pathname}`, '_self');
  });

  // If youtube is muted, unmute
  // const youtubeMuteButton = $('.ytp-mute-button')[0];
  // if ($(youtubeMuteButton).attr('title')?.startsWith('Unmute')) {
  //   $(youtubeMuteButton).click();
  // }

  // attempt for stickers - not working because of angular

  // $('img[src^="blob"]').on('click', function (e) {
  //   console.log('asfasdf')
  //   console.log(e)
  //   // if (e.button == 2) {
  //   //   e.preventDefault();
  //   //   // window.open(`${newURL}${window.location.pathname}`, '_self');
  //   // }
  // });

  // $('img,video').on('click', function (e) {
  //   console.log('ewqrwerq');
  //   console.log(e);
  //   if (e.button == 2) {
  //     e.preventDefault();
  //     window.open(`${e.target.src}`, '_blank');
  //   }
  // });
});

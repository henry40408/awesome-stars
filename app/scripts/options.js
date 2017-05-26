import jQuery from 'jquery';

const Images = {
  OPTIONS_BACKGROUND: chrome.extension.getURL('images/options-background.svg'),
};

jQuery(document).ready(() => {
  jQuery('body').css({
    'background-image': `url(${Images.OPTIONS_BACKGROUND})`,
  });
});

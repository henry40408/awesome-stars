$(document).ready(function() {
    var IS_AWESOME = document.title.match(/awesome/);

    var $readme_a = $("#readme a");

    if (IS_AWESOME) {
        chrome.runtime.sendMessage({
            type: GET_ACCESS_TOKEN,
            count: $readme_a.length.toString()
        }, function(response) {
            // empty
        });
    }
});

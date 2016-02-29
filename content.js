$(document).ready(function() {
    if (document.title.match(/\/awesome-/)) {
        initialize();
    }
});

function initialize() {
    var $filtered_readme_a = $("#readme a").filter(function() {
        return !!$(this).attr('href').match(GITHUB_LINK_PATTERN);
    });

    chrome.runtime.sendMessage({
        type: GET_ACCESS_TOKEN
    }, function(response) {
        $filtered_readme_a.each(function() {
            var $that = $(this);

            var matches = $(this).attr('href').match(GITHUB_LINK_PATTERN);
            var url = "https://api.github.com/repos/" + matches[1] + "/" + matches[2];
            var params = {};

            if (response.access_token)
                params.access_token = response.access_token;

            $.getJSON(url, params, function(json) {
                $that.after($("<span>")
                    .addClass("awesome-stars")
                    .append("\u2605 " + json.stargazers_count));
            });
        });
    });
}

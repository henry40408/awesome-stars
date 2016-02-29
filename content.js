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
        type: GET_CACHE_ACCESS_TOKEN
    }, function(response) {
        $filtered_readme_a.each(function() {
            var $that = $(this);

            var matches = $(this).attr('href').match(GITHUB_LINK_PATTERN);
            var url = "https://api.github.com/repos/" + matches[1] + "/" + matches[2];
            var cached = response.cache[url];

            function success_callback(json) {
                $that.after($("<span>")
                    .addClass("awesome-stars")
                    .append("\u2605 " + json.stargazers_count));

                var cache = {};
                cache[url] = json;

                chrome.runtime.sendMessage({
                    type: SET_CACHE,
                    cache: JSON.stringify(cache)
                });
            }

            if (cached) {
                $that.after($("<span>")
                    .addClass("awesome-stars")
                    .append("\u2605 " + cached.stargazers_count));
            } else {
                var params = {};

                if (response.access_token)
                    params.access_token = response.access_token;

                $.ajax({
                    dataType: "json",
                    url: url,
                    data: params,
                    success: success_callback
                });
            }
        });
    });
}

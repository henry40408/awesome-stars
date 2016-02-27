$(document).ready(function() {
    document.title.match(/\/awesome-/) && initialize();
});

function initialize() {
    var $filtered_readme_a = $("#readme a").filter(function() {
        return !!$(this).attr('href').match(GITHUB_LINK_PATTERN);
    });

    chrome.runtime.sendMessage({
        type: GET_ACCESS_TOKEN,
        count: $filtered_readme_a.length.toString()
    }, function(response) {
        $filtered_readme_a.each(function() {
            $(this).after($("<span>")
                .addClass("awesome-stars")
                .append("\u2605 0"));
        });
    });
}

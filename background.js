var cache_pool = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.type) {
        case GET_OPTION:
            chrome.storage.sync.get("awesome_stars_options", function(value) {
                var awesome_stars_options = value.awesome_stars_options || {};
                sendResponse({
                    access_token: awesome_stars_options.access_token || "",
                    fancy_stars: awesome_stars_options.fancy_stars,
                });
            });
            break;
        case SET_OPTION:
            chrome.storage.sync.set({
                awesome_stars_options: {
                    access_token: request.access_token,
                    fancy_stars: request.fancy_stars,
                },
            }, function() {
                sendResponse({
                    data: request.access_token
                });
            });
            break;
        case GET_CACHE_ACCESS_TOKEN:
            chrome.storage.sync.get("awesome_stars_options", function(value) {
                sendResponse({
                    access_token: value.awesome_stars_options.access_token || "",
                    cache: cache_pool
                });
            });
            break;
        case SET_CACHE:
            cache_pool = Object.assign(cache_pool, JSON.parse(request.cache));
            break;
        default:
            break;
    }
    return true;
});

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({
        url: "options.html"
    });
});

var cache_pool = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.type) {
        case GET_ACCESS_TOKEN:
            chrome.storage.sync.get("access_token", function(data) {
                sendResponse({
                    access_token: data.access_token || ""
                });
            });
            break;
        case SET_ACCESS_TOKEN:
            chrome.storage.sync.set({
                access_token: request.access_token
            }, function() {
                sendResponse({
                    data: request.access_token
                });
            });
            break;
        case GET_CACHE_ACCESS_TOKEN:
            chrome.storage.sync.get("access_token", function(data) {
                sendResponse({
                    access_token: data.access_token || "",
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

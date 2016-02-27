chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({
        url: "options.html"
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var chrome_storage = chrome.storage.sync || chrome.storage.local;

    switch (request.type) {
        case GET_ACCESS_TOKEN:
            chrome_storage.get("access_token", function(data) {
                sendResponse({
                    access_token: data.access_token || ""
                });
            })
            break;
        case SET_ACCESS_TOKEN:
            chrome_storage.set({
                access_token: request.access_token
            }, function() {
                sendResponse({
                    data: request.access_token
                });
            });
            break;
        default:
            break;
    }
    return true;
});

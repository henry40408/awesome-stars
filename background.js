function updateBadgeText(content) {
    chrome.browserAction.setBadgeText({
        text: content
    });
}

updateBadgeText("");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.type) {
        case GET_ACCESS_TOKEN:
            updateBadgeText(request.count);
            sendResponse({
                data: "FOOBAR"
            });
            break;
        default:
            break;
    }
    return true;
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    updateBadgeText("");
});

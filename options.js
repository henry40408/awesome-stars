$(document).ready(function() {
    var $rate_limit = $("#rate-limit"),
        $options_form = $("#options-form"),
        $access_token_field = $("#access-token"),
        $options_form_state = $("#options-form-state");

    function update_rate_limit() {
        chrome.runtime.sendMessage({
            type: GET_OPTION
        }, function(response) {
            var params = {};

            if (response.access_token)
                params.access_token = response.access_token;

            $.getJSON("https://api.github.com/rate_limit", params, function(json) {
                $rate_limit.text(numeral(json.rate.remaining).format(","));
            }).error(function() {
                $rate_limit.text("Unable to retrieve rate limit.");
            });
        });
    }

    chrome.runtime.sendMessage({
        type: GET_OPTION
    }, function(response) {
        $access_token_field.val(response.access_token);
    });

    $options_form.submit(function(e) {
        chrome.runtime.sendMessage({
            type: SET_OPTION,
            access_token: $access_token_field.val()
        }, function(response) {
            $options_form_state.text("Saved!");
            setTimeout(function() {
                $options_form_state.text("");
            }, 1750);
            update_rate_limit();
        });
        e.preventDefault();
    });

    update_rate_limit();
});

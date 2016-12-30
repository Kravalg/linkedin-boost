chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
    if (request.action === 'added_contacts') {

        var totalAdded = parseInt(request.message.totalAdded);

        if (Number.isInteger(totalAdded) && totalAdded > 0) {
            chrome.storage.local.get('totalAdded', function(result) {
                if (result.totalAdded === undefined) {
                    result.totalAdded = 0;
                }

                chrome.storage.local.set({
                    totalAdded: result.totalAdded + totalAdded
                });

                request.message.allAdded = result.totalAdded + totalAdded;

                chrome.runtime.sendMessage({
                    action: 'added_contact_to_content',
                    data: request.message
                });
            });
        }
    }
});
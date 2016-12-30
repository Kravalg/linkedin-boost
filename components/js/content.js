const contactsNumOnOnePage = 15;

function sendMessageToBackground (obj) {
    chrome.runtime.sendMessage(obj);
}

function addContacts(height, countOfPagesScrolled) {
    setTimeout(function () {
        if (countOfPagesScrolled > 0 && height != document.body.clientHeight) {
            scrollDown(document.body.clientHeight, --countOfPagesScrolled);
        } else {
            sendRequest();
        }
    }, 1500);
}

function getNumPages(contactsNumber) {
    return contactsNumber > contactsNumOnOnePage ? Math.round(contactsNumber/contactsNumOnOnePage) : 0;
}

function scrollDown(height, countOfPagesScrolled){
    scroll(0, document.body.clientHeight);
    addContacts(height, countOfPagesScrolled);
}

function sendRequest(){
    var contactsNum = 1;
    var addedContacts = [];

    jQuery.each( jQuery('.card-wrapper .bt-request-buffed'), function() {
        jQuery(this).click();
        addedContacts[contactsNum] = {
            initials: jQuery(this).parents('.card-wrapper').find('.picture img').attr('alt'),
            title: jQuery(this).parents('.card-wrapper').find('.headline > span').attr('title'),
            img: jQuery(this).parents('.card-wrapper').find('.picture img').attr('src'),
            link: jQuery(this).parents('.card-wrapper').find('.picture a').attr('href')
        };
        contactsNum++;
    });

    sendMessageToBackground({
        action: 'added_contacts',
        message: {
            totalAdded: contactsNum,
            addedContacts: addedContacts
        }
    });
}

function onRequest(request, sender, sendResponse) {

    if (request.action == 'add_contacts'){
        if ($(window).scrollTop() == $(document).height() - $(window).height()) {
            scroll(0, 0);
        }

        scrollDown(document.body.clientHeight, getNumPages(request.contactsNumber));
    }

}

chrome.runtime.onMessage.addListener(onRequest);
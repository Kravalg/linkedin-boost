const contactsNumOnOnePage = 15, numberOfRepeat = 5;

function getDOMObjects (obj) {
    var personCardSelector = '.mn-person-card';

    return {
        initials: jQuery(obj).parents(personCardSelector)
            .find('.mn-person-info__name')
            .text(),
        title: jQuery(obj).parents(personCardSelector)
            .find('.mn-person-info__occupation')
            .text(),
        img: jQuery(obj).parents(personCardSelector)
            .find('.mn-person-info__picture.ember-view > img')
            .attr('src'),
        link: jQuery(obj).parents(personCardSelector)
            .find('.mn-person-info__picture.ember-view')
            .attr('href'),
        personCardSelector: personCardSelector
    };
}

function isPageNewLinkedin () {
    return window.location.href.indexOf('linkedin.com/mynetwork') + 1;
}

function sendMessageToBackground (obj) {
    chrome.runtime.sendMessage(obj);
}

function getNumPages(contactsNumber) {
    return contactsNumber > contactsNumOnOnePage ? Math.round(contactsNumber/contactsNumOnOnePage) : 0;
}

function addContacts(height, countOfPagesScrolled) {
    setTimeout(function () {
        if (countOfPagesScrolled > 0 && height != document.body.clientHeight) {
            scrollDown(document.body.clientHeight, --countOfPagesScrolled);
        } else {
            sendRequest();
        }
    }, 2000);
}

function scrollDown(height, countOfPagesScrolled){
    scroll(0, document.body.clientHeight);
    addContacts(height, countOfPagesScrolled);
}

function sendRequest(){
    var contactsNum = 1;
    var addedContacts = [];

    if (isPageNewLinkedin()) {
        eachContactsList(function() {
            jQuery(this).click();

            addedContacts[contactsNum] = getDOMObjects(this);

            contactsNum++;
        });
    } else {
        eachContactsList(function() {
            jQuery(this).click();

            addedContacts[contactsNum] = {
                initials: jQuery(this).parents('.card-wrapper').find('.picture img').attr('alt'),
                title: jQuery(this).parents('.card-wrapper').find('.headline > span').attr('title'),
                img: jQuery(this).parents('.card-wrapper').find('.picture img').attr('src'),
                link: jQuery(this).parents('.card-wrapper').find('.picture a').attr('href')
            };

            contactsNum++;
        });
    }

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

        if (request.filters !== null) {
            scrollDownFilters(
                document.body.clientHeight,
                request.filters,
                {
                    number: request.contactsNumber,
                    prefer: request.contactsNumber,
                    numberOfRepeat: 0
                },
                0
            );
        } else {
            scrollDown(document.body.clientHeight, getNumPages(request.contactsNumber));
        }
    }

}

function eachContactsList(callback) {
    if (isPageNewLinkedin()) {
        jQuery.each( jQuery('.mn-person-card__person-btn-ext.button-secondary-medium'), callback);
    } else {
        jQuery.each( jQuery('.card-wrapper .bt-request-buffed'), callback);
    }
}

function getInvitedNumber (filters) {
    var numberFoundContacts = 0;

    for (var key in filters) {
        var filter = filters[key];

        eachContactsList(function() {
            if (isPageNewLinkedin()) {
                if (isSearchedInString(getDOMObjects(this).title, filter)) {
                    numberFoundContacts++;
                } else {
                    console.log('remove:');
                    console.log(getDOMObjects().personCardSelector);
                    console.log(getDOMObjects(this).title);
                    console.log(filter);
                    jQuery(this).parents(getDOMObjects().personCardSelector).remove();
                }
            } else {
                if (isSearchedInString(jQuery(this).parents('.card-wrapper').find('.headline > span').attr('title'), filter)) {
                    numberFoundContacts++;
                } else {
                    jQuery(this).parents('.pymk-card').remove();
                }
            }
        });
    }

    return numberFoundContacts;
}

function getAllNumber () {
    var allNumber = 0;

    eachContactsList(function() {
        allNumber++;
    });

    return allNumber;
}

function isSearchedInString (str, search) {
    str = str.toLowerCase();
    search = search.toLowerCase();

    return str.indexOf(search) + 1;
}

function addContactsFilters(height, filters, needInvites, invited) {
    var all = getAllNumber();
    needInvites.prefer = invited;
    invited = getInvitedNumber(filters);

    if (invited !== 0 && invited == all) {
        getInvitedNumber(filters);
        sendRequest();

        console.log({
            invited: invited,
            all: all
        });
    } else {
        setTimeout(function () {

            if (invited < needInvites.number && needInvites.numberOfRepeat < numberOfRepeat) {
                if (needInvites.prefer == invited && invited == 0) {
                    needInvites.numberOfRepeat++;
                }

                scrollDownFilters(document.body.clientHeight, filters, needInvites, invited);
            } else if (needInvites.numberOfRepeat == numberOfRepeat && invited == 0) {
                sendMessageToBackground({
                    action: 'nothing_to_added',
                    message: {
                        totalAdded: 0
                    }
                });
            } else {
                getInvitedNumber(filters);
                sendRequest();
            }

        }, 1500);
    }
}

function scrollDownFilters(height, filters, needInvites, invited){
    scroll(0, document.body.clientHeight);
    addContactsFilters(height, filters, needInvites, invited);
}

function filterItem (item, filters) {

}

chrome.runtime.onMessage.addListener(onRequest);
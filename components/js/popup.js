function getCurrentTab (callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        callback(tabs[0]);
    });
}

function isTabLinkedin (tab) {
  return tab.url.indexOf('linkedin.com') + 1;
}

function isTabLinkedinPymk (tab) {
  return tab.url.indexOf('linkedin.com/people/pymk') + 1;
}

function sendMessageForAddContacts (tab, contactsNumber) {
    chrome.tabs.sendMessage(
        tab.id,
        {
            action: 'add_contacts',
            contactsNumber: contactsNumber
        },
        function(response) {
            if (response.result) {
                getInfoAboutAddedContacts(tab);
            }
        }
    );
}

function addContacts (contactsNumber) {
    getCurrentTab(function(currentTab) {
        if (isTabLinkedin(currentTab)) {
            sendMessageForAddContacts(currentTab, contactsNumber);
        }
    });
}

function openTab(url) {
    chrome.tabs.create({'url': url});
}

$(function() {
    $('[data-translation]').each(function () {
        this.textContent = chrome.i18n.getMessage(this.getAttribute('data-translation'));
    });

    getCurrentTab(function(currentTab) {
        if (isTabLinkedinPymk(currentTab)) {
            $('#add_contacts').show();
            $('[data-add-contacts]').click(function () {
                addContacts(this.getAttribute('data-add-contacts'));
            });
        } else if (isTabLinkedin(currentTab)) {
            $('#other_linkedin').show();
        } else {
            $('#not_linkedin').show();
        }
    });

    $('[data-link-url]').click(function () {
        openTab(this.getAttribute('data-link-url'));
    });
});
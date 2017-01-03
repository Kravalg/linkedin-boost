var LocalStorage = new LocalStorage();
LocalStorage.init();

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

function sendMessageForAddContacts (tab, contactsNumber, filters) {
    chrome.tabs.sendMessage(
        tab.id,
        {
            action: 'add_contacts',
            contactsNumber: contactsNumber,
            filters: filters
        }
    );
}

function addContacts (contactsNumber, filters) {
    getCurrentTab(function(currentTab) {
        if (isTabLinkedin(currentTab)) {
            sendMessageForAddContacts(currentTab, contactsNumber, filters);
        }
    });
}

function openTab (url) {
    chrome.tabs.create({'url': url});
}

function updateNumberOfTotalAdded (totalAdded) {
    $('#total_added_number').text(totalAdded);
}

function generateSocialButtons () {
    $("#share_friends").jsSocials({
        showLabel: false,
        showCount: false,
        shareIn: 'popup',
        shares: ['linkedin', 'twitter', 'facebook', 'vkontakte', 'googleplus', 'pinterest', 'stumbleupon'],
        url: 'https://chrome.google.com/webstore/detail/linkedin-boost/hjngmlepjloblimbhocofmodjihjklhf'
    });
}

function generateLinks () {
    $('[data-link-url]').click(function () {
        openTab(this.getAttribute('data-link-url'));
    });
}

function translatePage () {
    var translation, attr;

    $('[data-translation]').each(function () {
        translation = this.getAttribute('data-translation');
        attr = this.getAttribute('data-translation-attr');

        if (attr !== null) {
            this.setAttribute(attr, chrome.i18n.getMessage(translation));
        } else {
            this.textContent = chrome.i18n.getMessage(translation);
        }
    });
}

function generateTogglePanels () {
    $('.can-toggle .pointer').click(function () {
        var panel = $(this).parent();

        $(panel).children('.panel-body').toggle();

        var toggleIcon = $(panel).find('.caret');

        if ($(toggleIcon).hasClass('dropup')) {
            $(toggleIcon).attr('class', 'caret');
        } else {
            $(toggleIcon).attr('class', 'dropup caret');
        }
    });
}

function showNumberInvitedNow(number) {
    var numberInvitedSelector = '#number_invited_now',
        numberInvited = $(numberInvitedSelector).text();

    if (numberInvited !== '') {
        number += parseInt(numberInvited);
    }

    $(numberInvitedSelector).text(number);
    $(numberInvitedSelector).show();
}

function buttonLoading (button) {
    $(button).text('');
    $(button).addClass('button-loaded');
    $(button).append('<i class="fa fa-spinner fa-spin"></i>');
}

function buttonStopLoading () {
    var button = $('.button-loaded');

    $(button).text($(button).attr('data-add-contacts'));
    $(button).removeClass('button-loaded');
}

function listIsEmpty () {
    return parseInt($('#number_invited_now').text()) == 0;
}

function generateListOfInvitedContacts (data) {
    var isListEmpty = listIsEmpty();

    showNumberInvitedNow(data.totalAdded);

    var contact, newBlock,
        resultsBlock = '#results',
        listGroupBlock = '.list-group',
        firstBlock = resultsBlock + ' .list-group-item:first';

    if (!isListEmpty) {
        firstBlock = resultsBlock + ' .list-group-item:last';
    }

    for (var key in data.addedContacts) {
        contact = data.addedContacts[key];

        if (contact !== null) {
            newBlock = $(firstBlock).clone();

            $(newBlock).find('.row-picture img')
                .attr('src', contact.img)
                .attr('data-link-url', contact.link);
            $(newBlock).find('.row-content .list-group-item-heading')
                .text(contact.initials)
                .attr('data-link-url', contact.link);
            $(newBlock).find('.row-content .list-group-item-text')
                .text(contact.title);

            $(newBlock).appendTo($(resultsBlock + ' ' + listGroupBlock));
        }
    }

    if (isListEmpty) {
        $(firstBlock).remove();
        $(resultsBlock).fadeIn();
    }
}

function showNumOfActiveFilters () {
    var numOfActiveFilters = 0;

    $.each($('#filters .togglebutton [type="checkbox"]'), function (key, el) {
        if (el.checked) {
            numOfActiveFilters++;
        }
    });

    $('#number_activated_filters').text(numOfActiveFilters);
}

function filterListeners () {
    $('#profession').keyup(function () {
        if (this.value == '') {
            $('#professionFilterStatus').prop('checked', false);
        } else {
            $('#professionFilterStatus').prop('checked', true);
        }

        showNumOfActiveFilters();
    });

    $('#filters .togglebutton [type="checkbox"]').change(showNumOfActiveFilters);
}

function getFilters () {
    var filters = {};

    $.each($('#filters .filter'), function (key, el) {
        if (el.value !== '') {
            filters[el.getAttribute('id')] = el.value;
        }
    });

    return $.isEmptyObject(filters) ? null : filters;
}

$(function() {
    translatePage();
    generateLinks();
    generateSocialButtons();

    getCurrentTab(function(currentTab) {
        if (isTabLinkedinPymk(currentTab)) {
            $('#add_contacts').show();

            $('[data-add-contacts]').click(function () {
                buttonLoading(this);
                addContacts(this.getAttribute('data-add-contacts'), getFilters());
            });

            generateTogglePanels();
            filterListeners();
            updateNumberOfTotalAdded(LocalStorage.app.totalAdded);
        } else if (isTabLinkedin(currentTab)) {
            $('#other_linkedin').show();
        } else {
            $('#not_linkedin').show();
        }
    });

    $.material.init();
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action == 'added_contact_to_content') {
        updateNumberOfTotalAdded(message.data.allAdded);
        generateListOfInvitedContacts(message.data);
        buttonStopLoading();
    }
});
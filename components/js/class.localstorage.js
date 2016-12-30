function set (result) {
    for (var key in result) {
        LocalStorage.app[key] = result[key];
    }
}

var LocalStorage = function LocalStorage () {

    this.app = {
        totalAdded: 0
    };

    this.set = function (obj) {
        chrome.storage.local.set(obj);
    };

    this.get = function (key, callback) {
        chrome.storage.local.get(key, function(result) {
            callback(result);
        });
    };

    this.init = function () {
        this.updateAppData(set);
    };

    this.updateAppData = function (callback) {
        for (var key in this.app) {
            this.get(key, function (result) {
                callback(result);
            });
        }
    };

};
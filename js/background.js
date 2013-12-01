/*
var details = chrome.app.getDetails();
if(v.tooluxversion !== details.version) {
    chrome.storage.sync.set({'tooluxversion': details.version}, function() {});
    chrome.tabs.create({'url': chrome.extension.getURL('version.html')}, function (tab)
    {
        // Tab opened.
    });
}
*/


var background = {

    init: function()
    {
        'use strict';
    },
    
    send: function(e)
    {
        'use strict';
        
        chrome.tabs.executeScript(null, {code:"hl.selectText();"});
    },
    
    openTabLogin: function()
    {
        //chrome.tabs.create({'url': 'http://looq.livedemo.fr/'}, function (tab)
        chrome.tabs.create({'url': 'http://looq.server/'}, function (tab)
        {
            // Tab opened.
        });
    }
};

background.init();

var contextMenu = chrome.contextMenus.create({
    type: 'normal',
    title: 'Send a looq',
    contexts: ['selection'],
    onclick: background.send
});

chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse)
    {
        'use strict';
        
        if(request.msg === "login") {
            background.openTabLogin();
        }
    }
);
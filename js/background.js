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

//chrome.tabs.executeScript(null, {file:"http://localhost:1337/socket.io/socket.io.js"});
var severUrl = 'looq.fr', nodeUrl = '46.105.99.216:8889';
//var severUrl = 'looq.livedemo.fr', nodeUrl = '127.0.0.1:8889';
//var severUrl = 'ic.adfab.fr/looq', nodeUrl = '46.105.121.40:8889';
//var severUrl = 'looq.server', nodeUrl = '127.0.0.1:8889';

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
        'use strict';
        
        //chrome.tabs.create({'url': 'http://looq.fr/'}, function (tab)
        //chrome.tabs.create({'url': 'http://looq.livedemo.fr/'}, function (tab)
        //chrome.tabs.create({'url': 'http://ic.adfab.fr/looq/'}, function (tab)
        chrome.tabs.create({'url': 'http://' + severUrl + '/'}, function (tab)
        {
            // Tab opened.
        });
    },
    
    notification: function(data)
    {
        'use strict';
        
        var notif = webkitNotifications.createNotification(
            'icon48.png',  // icon url - can be relative
            data.title,  // notification title
            data.message
        );
        
        notif.onclick = function(x)
        {
            chrome.tabs.create({'url': data.url});
        };
        
        notif.onclose = function(x)
        {
            background.resetBadges();
        };

        notif.show();
    },
    
    resetBadges: function(data)
    {
        'use strict';

        util.ajax('POST', 'http://' + severUrl + '/rest/missed')
        .then(function(result)
        {
            result = JSON.parse(result.response);
            chrome.browserAction.setBadgeText({ text : result.data.count + ""});
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
        
        if(request.msg === "notif") {
            background.notification(request.notif);
        }
        
        if(request.msg === "badges") {
            background.resetBadges();
        }
    }
);

var socket = io.connect('http://' + nodeUrl + '/looq');
socket.on('connect', function (data)
{
    background.resetBadges();
    socket.emit('login', {name: 'nicolas.labbe@adfab.fr'});
});
  
  
socket.on('notification', function (data)
{
    background.notification(data);
});
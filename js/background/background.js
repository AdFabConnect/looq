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
    socket: null,
    autorized: false,
    email: false,

    init: function()
    {
        'use strict';
        
        this.connectSocket();
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
        
        var notif = new Notification(
            data.title,
            {
                body: "",
                dir: "auto",
                icon: "icon96.png",
                tag: ""
            }
        );
        
        // var notif = new Notification({
        //     'icon96.png',  // icon url - can be relative
        //     data.title,  // notification title
        //     data.message

        //     body: "",
        //     dir: "auto",
        //     icon: "",
        //     lang: "",
        //     onclick: null,
        //     onclose: null,
        //     onerror: null,
        //     onshow: null,
        //     tag: "",
        //     title: "test"
        // });
        
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
    
    resetBadges: function()
    {
        'use strict';
        var self = this;
        
        if(this.autorized){
            util.ajax('POST', 'http://' + severUrl + '/rest/missed')
            .then(function(result)
            {
                result = JSON.parse(result.response);
                if(regex.isNotNull(result.data) && regex.isNotNull(result.data.count)) {
                    chrome.browserAction.setBadgeText({ text : result.data.count + ""});
                }
            });
        }
    },
    
    isAutorized: function()
    {
        var promise = new Promise(),
            self = this,
            result;
        
        util.ajax('POST', 'http://' + severUrl + '/rest/isAutorized')
        .then(function(result)
        {
            result = JSON.parse(result.response);
            self.autorized = result.authorized;
            if(result.authorized) {
                self.email = result.email;
                self.resetBadges();
                return promise.resolve(result);
            }else {
                self.email = null;
                return promise.reject(result);
            }
        });
        
        return promise;
    },
    
    connectSocket: function()
    {
        'use strict';
        
        var self = this;
        
        if(!regex.isNotNull(this.socket)) {
            
            self.isAutorized()
                .then(
                // resolve
                function()
                {
                    console.log('http://' + nodeUrl + '/looq');
                    
                    self.socket = io.connect('http://' + nodeUrl + '/looq');
                    self.socket.on('connect', function (data)
                    {
                        console.log('connect');
                        self.socket.emit('login', {name: self.email});
                    });
                    
                    self.socket.on('notification', function (data)
                    {
                        console.log('notification');
                        background.notification(data);
                    });
                },
                // reject
                function()
                {
                    console.log('reject')
                    this.socket = null;
                });
        }
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
        
        if(request.msg === "connect") {
            background.connectSocket();
        }
    }
);
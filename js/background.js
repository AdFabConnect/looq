var background = {

    init: function()
    {
        'use strict';
        
    },
    
    send: function(e)
    {
        'use strict';
        
        console.debug(e.selectionText)
    }
};

var contextMenu = chrome.contextMenus.create({
    type: 'normal',
    title: 'Send a looq',
    contexts: ['selection'],
    onclick: background.send
});
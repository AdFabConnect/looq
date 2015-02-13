
var options = {
    shareEmail: null,
    shareNotif: null,
    
    init: function()
    {
        'use strict';
        
        chrome.storage.sync.get('notif', function(data)
        {
            document.querySelector('[value=' + data.notif + ']').checked = 'checked';
        });
        
        this.shareEmail = document.getElementById("option-email");
        this.shareNotif = document.getElementById("option-notif");
        
        this.bindEvents();
    },
    
    bindEvents: function()
    {
        'use strict';
        
        var self = this;
        
        document.getElementById('save').addEventListener('click', function(e)
        {
            self.save();
        })
    },
    
    save: function()
    {
        'use strict';
        
        var options = document.getElementsByName('notif');
        
        if (options) {
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    chrome.storage.sync.set({'notif': options[i].value});
                }
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', function()
{
    options.init();
});
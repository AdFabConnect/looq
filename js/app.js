var App = {

    init: function()
    {
        'use strict';
        
        App.bindEvent();
    },

    bindEvent: function()
    {
        'use strict';
        
        var oldText,;
        
        document.addEventListener('mousedown', function(e)
        {
            if(e.which === 3) {
                var selected = window.getSelection().toString();
                
                e.target.innerHTML = e.target.innerHTML.replace(eval('/' + window.getSelection().toString() + '/'), '<span style="background-color: #ff00ff;">' + window.getSelection().toString() + '</span>');
                
                // e.target
                console.debug(e.target.innerHTML);
                
                return;
                e.target.innerHTML
                e.target.innerHTML = "test";
            }else {
                
            }
        });
    }
};

App.init();
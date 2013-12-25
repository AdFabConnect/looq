function log(obj)
{
    'use strict';
    
    chrome.extension.getBackgroundPage().console.log(obj);
}

var popup = {
    moreLimit:10,
    loadLimit:0,
    canLoadmore:true,
    
    init: function()
    {
        'use strict';

        this.loadMore();
        this.bindEvents();
    },
    
    bindEvents: function()
    {
        'use strict';
        var self = this,
            scrollTop, scrollHeight, offsetHeight, contentHeight;
        
        // bind scroll events
        document.getElementById('looqs-wrapper').addEventListener('scroll', function(e)
        {
            scrollTop = document.getElementById('looqs-wrapper').scrollTop;
            scrollHeight = document.getElementById('looqs-wrapper').scrollHeight; // added
            offsetHeight = document.getElementById('looqs-wrapper').offsetHeight;
            
            contentHeight = scrollHeight - offsetHeight; // added
            if (contentHeight <= scrollTop) // modified
            {
                self.loadMore();
            }
        });
        console.log(window.onscroll)
    },
    
    loadMore: function()
    {
        'use strict';
        
        var self = this,
            result;
        
        if(this.canLoadmore) {
            this.canLoadmore = false;
            
            util.ajax('GET', 'http://' + severUrl + '/rest/received/' + this.loadLimit + '/' + this.moreLimit)
                .then(function(e)
                {
                    result = JSON.parse(e.response);
                    
                    self.addLooqs(result.data.looqs, document.getElementById('looqs-wrapper'));
                });

            this.loadLimit += this.moreLimit;
        }
    },
    
    addLooqs: function(ls, parent)
    {
        'use strict';
        
        var looqs = '',
            i;
        
        for(i in ls) {
            looqs += '<li class="' + (typeof ls[i].missed !== 'undefined' && ls[i].missed === 1 ? 'notMissed' : '') + '">';
            //looqs += '   <div class="td">' + ls[i].date.date + '</div>';
            looqs += '      <a href="' + ls[i].url + '" target="_blank">';
            looqs += ls[i].date.date + ' from ' + ls[i].nickname;
            looqs += '      </a>';
            looqs += '  <a class="highlight" href="' + ls[i].url + '" target="_blank">' + ls[i].plain + '</a>';
            looqs += '</li>';
        }

        util.appendHTML(parent, looqs);
        
        if(parseInt(i) + 1 === this.moreLimit) {
            this.canLoadmore = true;
        }
    }
};

popup.init();
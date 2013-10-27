var severUrl = 'looq.server';

var nodeHl = function(xpath, inner, start, end)
{
    'use strict';
    
    var obj = {
            xpath: xpath,
            inner: inner,
            start: (typeof start === 'undefined') ? '' : start,
            end: (typeof end === 'undefined') ? '' : end
        };
    
    return obj;
};

/**
 * HIGHTLIGHT OBJECT
 */
var hl = {
    hexa: '#fef670',
    rgb: 'rgb(254, 246, 112)',
    rgba: 'rgba(254, 246, 112, 1)',
    looqGet: '//' + severUrl + '/rest/looq',
    looqSave: '//' + severUrl + '/rest/save',
    looqisAutorized: '//' + severUrl + '/rest/isAutorized',
    
    init: function(hexa)
    {
        'use strict';
        
        hl.hexa = hexa ? hexa : hl.hexa;
        
        hl.checkLooqUrl();
    },
    
    getLooqId: function()
    {
        var hashs = top.location.hash.split('#'), i, hash;
        for(i in hashs) {
            if(typeof hashs[i] === 'string' && hashs[i] !== '' && hashs[i].split('=')[0] === 'looq') {
                return hashs[i].split('=')[1];
            }
        }
        
        return null;
    },
    
    checkLooqUrl: function()
    {
        'use strict';
        
        setTimeout(function()
        {
            var json = {
                    id: null
                },
                response, objects, object, i, first, height, bounds1, bounds2;
            
            json.id = hl.getLooqId();
            if(json.id !== null) {
                util.ajax('POST', hl.looqGet, json)
                    .then(function(e)
                    {
                        response = JSON.parse(e.response);
                        objects = JSON.parse(response.data.looq.inner_html);
                        
                        for(i in objects) {
                            object = xp.get(objects[i].xpath);
                            if(typeof object !== 'undefined' && object.length === 1
                                    && typeof object[0] !== 'undefined') {
                                if(first === undefined) {
                                    first = object;
                                }
                                object[0].innerHTML = objects[i].inner;
                            }
                        }
    
                        bounds1 = first[0].getBoundingClientRect();
                        bounds2 = object[0].getBoundingClientRect();
                        height = (bounds2.top + bounds2.height) - bounds1.top;
                        
                        document.body.scrollTop = document.documentElement.scrollTop = bounds1.top - 110;
                    });
            }
        }, 100);
    },

    /**
     * Return promise
     */
    isAutorized: function()
    {
        var promise = new Promise(), response;
        
        util.ajax('POST', hl.looqisAutorized, {})
            .then(function(e)
            {
                response = JSON.parse(e.response);
                if(response.authorized !== 'undefined' && !response.authorized) {
                    chrome.extension.sendRequest({
                        msg: "login"
                    });
                }else if(response.authorized !== 'undefined') {
                    // AUTHORIZED
                    promise.resolve();
                }
            });
        
        return promise;
    },
    
    selectText: function()
    {
        var selection;
        
        hl.isAutorized()
            .then(function()
            {
                selection = hl.up();
                window.getSelection().removeAllRanges();
                
                hl.showPopinEmail()
                    .then(function(emails)
                    {
                        hl.send(selection, emails);
                        window.getSelection().removeAllRanges();
                    });
            });
    },
    
    removePopinEmail:function()
    {
        util.removeClass(document.querySelector('#looq-popin-email'), 'slideInRight');
        util.addClass(document.querySelector('#looq-popin-email'), 'slideOutLeft');
    },
    
    showPopinEmail:function()
    {
        var promise = new Promise(),
            popinTxt = '', clickClose, clickSubmit;

        if(document.querySelector('#looq-popin-email') === null) {
            popinTxt = '<div id="looq-popin-email" class="looq-popin animated slideInRight">';
            popinTxt += '    <div class="looq-close"></div>';
            popinTxt += '    <div class="looq-title">You want to send a looq ?</div>';
            popinTxt += '    <div class="looq-form-row">';
            popinTxt += '        <input type="text" id="looq-email" class="email" name="email" placeholder="Insert mails and separate them with commas" />';
            popinTxt += '    </div>';
            popinTxt += '    <div class="looq-form-row">';
            popinTxt += '        <input type="submit" id="looq-submit" class="password" name="password" placeholder="password" />';
            popinTxt += '    </div>';
            popinTxt += '</div>';
            
            hl.appendHTML(document.body, popinTxt);
        }else {
            util.removeClass(document.querySelector('#looq-popin-email'), 'slideOutLeft');
            util.addClass(document.querySelector('#looq-popin-email'), 'slideInRight');
        }
        
        clickClose = function(e)
        {
            document.querySelector('#looq-popin-email .looq-close').removeEventListener('click', clickClose);
            document.querySelector('#looq-popin-email #looq-submit').removeEventListener('click', clickSubmit);
            hl.removePopinEmail();
        };
        
        clickSubmit = function()
        {
            document.querySelector('#looq-popin-email .looq-close').removeEventListener('click', clickClose);
            document.querySelector('#looq-popin-email #looq-submit').removeEventListener('click', clickSubmit);
            
            var emails = document.querySelector('#looq-popin-email .email');
            if(regex.isNotEmpty(emails.value)) {
                promise.resolve(emails.value);
                hl.removePopinEmail();
            }
        };
        
        document.querySelector('#looq-popin-email .looq-close').addEventListener('click', clickClose);
        document.querySelector('#looq-popin-email #looq-submit').addEventListener('click', clickSubmit);
        
        return promise;
    },
    
    appendHTML:function (el, str)
    {
        var div = document.createElement('div');
        div.innerHTML = str;
        while (div.children.length > 0) {
            el.appendChild(div.children[0]);
        }
    },

    send:function(selection, emails)
    {
        var json = selection;
        json.emails = emails;
        json.url = top.location.href;
        
        util.ajax('POST', hl.looqSave, json);
    },

    up:function()
    {
        'use strict';
        
        var nodes = s.getNodes(),
            plain = s.getPlainText(),
            node, i, nodesHl = [], current, inArray = [], xpath;
        
        hl.highlight(hl.hexa);
        
        for(i in nodes) {
            node = nodes[i];
            
            if( node.nodeName === '#text' && node.nodeValue.trim() ) {
                node = node.parentNode;
            }
            if(node.innerHTML !== 'undefined') {
                xpath = xp.generate(node);
                current = new nodeHl(xpath, node.innerHTML);
                
                if(node.nodeName !== '#text' && !util.inArray(xpath, inArray)) {
                    inArray.push(xpath)
                    nodesHl.push(current);
                }
            }
        }
        
        return {
            inner_html: JSON.stringify(nodesHl),
            plain: plain
        };
    },
    
    highlight: function(colour)
    {
        hl.unhighlight(document.body, hl.hexa);
        
        var range, sel;
        if (window.getSelection) {
            // IE9 and non-IE
            try {
                if (!document.execCommand("BackColor", false, colour)) {
                    hl.makeEditableAndHighlight(colour);
                }
            } catch (ex) {
                hl.makeEditableAndHighlight(colour)
            }
        } else if (document.selection && document.selection.createRange) {
            // IE <= 8 case
            range = document.selection.createRange();
            range.execCommand("BackColor", false, colour);
        }
    },

    makeEditableAndHighlight: function(colour)
    {
        var range, sel = window.getSelection();
        if (sel.rangeCount && sel.getRangeAt) {
            range = sel.getRangeAt(0);
        }
        document.designMode = "on";
        if (range) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
        // Use HiliteColor since some browsers apply BackColor to the whole block
        if (!document.execCommand("HiliteColor", false, colour)) {
            document.execCommand("BackColor", false, colour);
        }
        document.designMode = "off";
    },

    unhighlight: function(node, colour)
    {
        if (!(colour instanceof Colour)) {
            colour = new Colour(colour);
        }

        if (node.nodeType == 1) {
            var bg = node.style.backgroundColor;
            if (bg && colour.equals(new Colour(bg))) {
                node.style.backgroundColor = "";
            }
        }
        var child = node.firstChild;
        while (child) {
            hl.unhighlight(child, colour);
            child = child.nextSibling;
        }
    }
};

hl.init();
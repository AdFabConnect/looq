var severUrl = 'looq.fr';
//var severUrl = 'looq.livedemo.fr';
//var severUrl = 'ic.adfab.fr/looq';
//var severUrl = 'looq.server';

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
    looqLogin: '//' + severUrl + '/rest/login',
    looqisAutorized: '//' + severUrl + '/rest/isAutorized',
    
    init: function(hexa)
    {
        'use strict';
        
        hl.hexa = hexa ? hexa : hl.hexa;
        
        hl.checkLooqUrl();
    },
    
    getLooqId: function()
    {
        var hashs = unescape(top.location.hash).split('#'), i;
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
                        objects = JSON.parse(response.data.looq.xpaths);
                        
                        for(i in objects) {
                            object = xp.get(objects[i].xpath);
                            
                            if(typeof object !== 'undefined' && object.length === 1
                                    && typeof object[0] !== 'undefined') {
                                if(first === undefined) {
                                    first = object;
                                }
                                object[0].innerHTML = decodeURIComponent(objects[i].inner);
                            }
                        }
    
                        bounds1 = first[0].getBoundingClientRect();
                        bounds2 = object[0].getBoundingClientRect();
                        height = (bounds2.top + bounds2.height) - bounds1.top;
                        
                        document.body.scrollTop = document.documentElement.scrollTop = bounds1.top - 110;
                        
                        chrome.extension.sendRequest({
                            msg: "badges"
                        });
                    });
            }
        }, 1000);
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
                    hl.showPopinLogin()
                        .then(function(obj)
                            {
                                hl.login(obj.email, obj.password)
                                    .then(function(response)
                                    {
                                        if(response.authorized !== 'undefined' && response.authorized) {
                                            // AUTHORIZED
                                            promise.resolve();
                                        }
                                    });
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
        
        selection = hl.up();
        window.getSelection().removeAllRanges();
        
        hl.isAutorized()
            .then(function()
            {
                hl.showPopinEmail()
                    .then(function(obj)
                    {
                        hl.send(selection, obj.emails, obj.message);
                        window.getSelection().removeAllRanges();
                    });
            });
    },
    
    removePopin:function(popin)
    {
        util.removeClass(popin, 'slideInRight');
        util.addClass(popin, 'slideOutLeft');
    },
    
    showPopinLogin:function()
    {
        var promise = new Promise(),
            popinTxt = '', clickClose, clickSubmit;

        if(document.querySelector('#looq-popin-login') === null) {
            popinTxt = '<div id="looq-popin-login" class="looq-popin animated slideInRight">';
            popinTxt += '    <form id="looq-form-login" action="#">';
            popinTxt += '       <div class="looq-close"></div>';
            popinTxt += '       <div class="looq-title">Connexion</div>';
            popinTxt += '       <div class="looq-form-row">';
            popinTxt += '           <input type="text" id="looq-email" class="email" name="email" placeholder="Email" />';
            popinTxt += '       </div>';
            popinTxt += '       <div class="looq-form-row">';
            popinTxt += '           <input type="password" id="looq-password" class="email" name="email" placeholder="Password" />';
            popinTxt += '        </div>';
            popinTxt += '       <div class="looq-form-row">';
            popinTxt += '           <input type="submit" id="looq-submit" class="password" name="password" placeholder="password" />';
            popinTxt += '       </div>';
            popinTxt += '    </form>';
            popinTxt += '</div>';
            
            hl.appendHTML(document.body, popinTxt);
        }else {
            util.removeClass(document.querySelector('#looq-popin-login'), 'slideOutLeft');
            util.addClass(document.querySelector('#looq-popin-login'), 'slideInRight');
        }
        
        clickClose = function(e)
        {
            document.querySelector('#looq-popin-login .looq-close').removeEventListener('click', clickClose);
            document.querySelector('#looq-popin-login #looq-submit').removeEventListener('click', clickSubmit);
            document.querySelector('#looq-form-login').removeEventListener('submit', clickSubmit);
            hl.removePopin(document.querySelector('#looq-popin-login'));
            hl.unhighlight(document.body, hl.hexa);
        };
        
        clickSubmit = function(e)
        {
            e.preventDefault();
            
            document.querySelector('#looq-popin-login .looq-close').removeEventListener('click', clickClose);
            document.querySelector('#looq-popin-login #looq-submit').removeEventListener('click', clickSubmit);
            document.querySelector('#looq-form-login').removeEventListener('submit', clickSubmit);
            
            var email = document.querySelector('#looq-popin-login #looq-email'),
                password = document.querySelector('#looq-popin-login #looq-password');
            
            if(regex.isNotEmpty(email.value) && regex.isNotEmpty(password.value)) {
                promise.resolve({
                    email: email.value,
                    password: password.value
                });
                hl.removePopin(document.querySelector('#looq-popin-login'));
            }
        };
        
        document.querySelector('#looq-popin-login .looq-close').addEventListener('click', clickClose);
        document.querySelector('#looq-popin-login #looq-submit').addEventListener('click', clickSubmit);
        document.querySelector('#looq-form-login').addEventListener('submit', clickSubmit);
        
        document.querySelector('#looq-email').focus();
        
        return promise;
    },
    
    showPopinEmail:function()
    {
        var promise = new Promise(),
            popinTxt = '', clickClose, clickSubmit;

        if(document.querySelector('#looq-popin-email') === null) {
            popinTxt = '<div id="looq-popin-email" class="looq-popin animated slideInRight">';
            popinTxt += '    <form id="looq-form-email" action="#">';
            popinTxt += '       <div class="looq-close"></div>';
            popinTxt += '       <div class="looq-title">You want to send a looq ?</div>';
            popinTxt += '       <div class="looq-form-row">';
            popinTxt += '            <input type="text" id="looq-message" class="message" name="message" placeholder="Message : Hey looq !" />';
            popinTxt += '       </div>';
            popinTxt += '       <div class="looq-form-row">';
            popinTxt += '            <input type="text" id="looq-emails" class="email" name="email" placeholder="Insert mails and separate them with commas" />';
            popinTxt += '       </div>';
            popinTxt += '       <div class="looq-form-row">';
            popinTxt += '           <input type="submit" id="looq-submit" class="password" name="password" placeholder="password" />';
            popinTxt += '       </div>';
            popinTxt += '    </form>';
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
            document.querySelector('#looq-form-email').removeEventListener('submit', clickSubmit);
            hl.removePopin(document.querySelector('#looq-popin-email'));
            hl.unhighlight(document.body, hl.hexa);
        };
        
        clickSubmit = function(e)
        {
            e.preventDefault();
            
            document.querySelector('#looq-popin-email .looq-close').removeEventListener('click', clickClose);
            document.querySelector('#looq-popin-email #looq-submit').removeEventListener('click', clickSubmit);
            document.querySelector('#looq-form-email').removeEventListener('submit', clickSubmit);
            
            var emails = document.querySelector('#looq-popin-email .email'),
                message = document.querySelector('#looq-popin-email .message');
            if(regex.isNotEmpty(emails.value)) {
                promise.resolve(
                {
                    emails: emails.value,
                    message: regex.isNotEmpty(message.value) ? message.value : 'hey looq'
                })
                hl.removePopin(document.querySelector('#looq-popin-email'));
            }
        };
        
        document.querySelector('#looq-popin-email .looq-close').addEventListener('click', clickClose);
        document.querySelector('#looq-popin-email #looq-submit').addEventListener('click', clickSubmit);
        document.querySelector('#looq-form-email').addEventListener('submit', clickSubmit);
        
        document.querySelector('#looq-message').focus();
        
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

    login:function(email, password)
    {
        var json = {
            email: email,
            password: password,
            url: top.location.href
        },
        promise = new Promise();
        
        util.ajax('POST', hl.looqLogin, json)
            .then(function(result)
            {
                result = JSON.parse(result.response);
                promise.resolve(result);
            });

        return promise;
    },

    send:function(selection, emails, message)
    {
        var json = selection, i;
        json.emails = emails;
        json.message = message;
        json.url = top.location.origin + top.location.pathname + top.location.search;
        
        var hashs = top.location.hash.split('#')
        for(i in hashs) {
            json.url += (hashs[i].indexOf('looq') === -1 && hashs[i].replace(/ /g, '') !== '') ? '#' + hashs[i] : '';
        }

        function close()
        {
            document.querySelector('.looq-result .looq-close').removeEventListener('click', close);
            document.querySelector('.looq-result').className = document.querySelector('.looq-result').className.replace(/slideInDown/g, '') + ' slideOutUp';
            //document.body.removeChild(document.querySelector('.looq-result'));
        }
        
        i = 0;
        function animationClose()
        {
            i++;
            if(i === 500) {
                close();
            }else {
                requestAnimationFrame(animationClose);
            }
        }
        
        util.ajax('POST', hl.looqSave, json)
            .then(function(result)
            {
                var looqResult;
                result = JSON.parse(result.response);
                
                requestAnimationFrame(animationClose);
                
                if(result.data.saved === true) {
                    if(document.querySelector('.looq-result') === null) {
                        hl.appendHTML(document.body, '<div class="looq-result animated">Your looq has been sent !<div class="looq-close"></div></div>');
                    }
                    looqResult = document.querySelector('.looq-result');
                    looqResult.className = looqResult.className.replace(/slideOutUp/g, '') + ' slideInDown';
                    document.querySelector('.looq-result .looq-close').addEventListener('click', close);
                }
            });
    },

    up:function()
    {
        'use strict';
        
        var nodes = s.getNodes(),
            plain = s.getPlainText(),
            node, i, nodesHl = [], current, inArray = [], xpath;
        
        hl.highlight(hl.hexa);
        
        var all = document.querySelectorAll('[style="background-color: rgb(254, 246, 112);"]'), i;
        for(i in all) {
            all[i].className = (typeof all[i].className !== 'undefined'
                && all[i].className !== 'undefined') ? all[i].className + ' looq-highlight' : 'looq-highlight';
        }
        
        var looqs = document.querySelectorAll('.looq-highlight'),
            arrays = [];
        for(i in looqs) {
            if(typeof looqs[i] !== 'undefined' && typeof looqs[i] === 'object') {
                if(!/looq-highlight/g.test(looqs[i].parentNode.className)
                    && !util.inArray(looqs[i].parentNode, arrays)) {
                    arrays.push(looqs[i].parentNode);
                    xpath = xp.generate(looqs[i].parentNode);
                    current = new nodeHl(xpath, encodeURIComponent(looqs[i].parentNode.innerHTML.replace(/"/g, "'")));
                    nodesHl.push(current);
                }
            }
        }
        
        /*
        for(i in nodes) {
            node = nodes[i];
            
            if( node.nodeName === '#text' && node.nodeValue.trim() ) {
                node = node.parentNode;
            }
            
            if(typeof node.innerHTML !== 'undefined' && node.innerHTML !== 'undefined'
                && node.innerHTML !== null) {
                xpath = xp.generate(node);
                
                if(node.nodeName !== '#text' && !util.inArray(xpath, inArray) && node.className.indexOf('looq-highlight') === -1) {
                    current = new nodeHl(xpath, encodeURIComponent(node.innerHTML.replace(/"/g, "'")));
                    inArray.push(xpath);
                    nodesHl.push(JSON.stringify(current));
                }
            }
        }
        */
        
        return {
            xpaths: JSON.stringify(nodesHl),
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

        var looqs, i, child;
        
        if (!(colour instanceof Colour)) {
            colour = new Colour(colour);
        }

        if (node.nodeType == 1) {
            var bg = node.style.backgroundColor;
            if (bg && colour.equals(new Colour(bg))) {
                node.style.backgroundColor = "";
            }
        }
        
        child = node.firstChild;
        while (child) {
            hl.unhighlight(child, colour);
            child = child.nextSibling;
        }
        
        looqs = document.querySelectorAll('.looq-highlight');
        for(i in looqs) {
            if(typeof looqs[i] === 'object') {
                looqs[i].className = looqs[i].className.replace(/looq-highlight/g, '');
            }
        }
    }
};

hl.init();
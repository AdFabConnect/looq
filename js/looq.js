var Looq = {
    span: null,

    init: function()
    {
        'use strict';
        
        Looq.span = document.createElement("span");
        Looq.span.className = "looq-highlight-text";

        Looq.loadHighlight();
    },
    
    surroundSelectedText: function(templateElement)
    {
        'use strict';
        
        var range,
            sel = rangy.getSelection(),
            ranges, textNodes, textNode, el, i, len, j, jLen;
        
        ranges = sel.getAllRanges();
        
        for (i = 0, len = ranges.length; i < len; ++i) {
            range = ranges[i];
            // If one or both of the range boundaries falls in the middle
            // of a text node, the following line splits the text node at the
            // boundary
            range.splitBoundaries();
    
            // The first parameter below is an array of valid nodeTypes
            // (in this case, text nodes only)
            textNodes = range.getNodes([3]);
    
            for (j = 0, jLen = textNodes.length; j < jLen; ++j) {
                textNode = textNodes[j];
                el = templateElement.cloneNode(false);
                textNode.parentNode.insertBefore(el, textNode);
                el.appendChild(textNode);
            }
        }
    },

    generateXPath: function(element)
    {
        'use strict';
        
        if (element.id !== '') {
            return 'id("'+element.id+'")';
        }else if (element === document.body) {
            return element.tagName;
        }

        var ix= 0;
        var siblings = element.parentNode.childNodes;
        for (var i= 0; i < siblings.length; i++) {
            var sibling = siblings[i];
            if (sibling === element) {
                if(element.className === 'looq-highlight-text') {
                    return Looq.generateXPath(element.parentNode);
                }
                return Looq.generateXPath(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
            }
            if (sibling.nodeType===1 && sibling.tagName===element.tagName) {
                ix++;
            }
        }
    },
    
    getObjectFromXpath: function (xpath)
    {
        var result = document.evaluate(
                xpath,
                document.documentElement,
                null,
                XPathResult.ORDERED_NODE_ITERATOR_TYPE,
                null
            ),
            nodes = [];
        
        if (result) {
            var node = result.iterateNext();
            while(node) {
                nodes.push(node);
                node = result.iterateNext();
            }
        }
        
        return nodes;
    },
    
    getUrl: function()
    {
        'use strict';
        
        var nodes = document.querySelectorAll('.looq-parent-highlight-text'),
            i, res = '';
        
        for(i in nodes) {
            if(typeof nodes[i] === 'object') {
                //console.debug('generateXPath : ' + Looq.generateXPath(nodes[i]));
                //console.debug(Looq.getObjectFromXpath(Looq.generateXPath(nodes[i])));
                res += '&looqpath=' + Looq.generateXPath(nodes[i]) + '§§§';
                res += nodes[i].innerHTML.replace(/<span class="looq-highlight-text">/g, '[looq]');
            }
        }
        
        return res;
    },
    
    selectText: function()
    {
        'use strict';
        
        var nodes = document.querySelectorAll('.looq-highlight-text'),
            url = top.location.origin + top.location.pathname + '?',
            i;
        
        for(i in nodes) {
            if(typeof nodes[i] === 'object') {
                nodes[i].className = nodes[i].className.replace(/looq-highlight-text/, '');
            }
        }
        
        Looq.surroundSelectedText(Looq.span);
        
        nodes = document.querySelectorAll('.looq-highlight-text');
        for(i in nodes) {
            if(typeof nodes[i] === 'object') {
                nodes[i].parentNode.className = nodes[i].parentNode.className + ' looq-parent-highlight-text';
            }
        }

        var params = top.location.search.split('&'),
        param;
        
        for(i in params) {
            param = params[i].split('=');
            if(decodeURIComponent(params[i]).indexOf('looqpath') === -1) {
                url += params[i];
            }
        }
        
        url += encodeURIComponent(Looq.getUrl());
        console.debug(url)
    },
    
    loadHighlight: function()
    {
        'use strict';
        
        var params = decodeURIComponent(top.location.search).split('&'),
            param, split, i, node;
        
        for(i in params) {
            param = params[i].split('=');
            if(param[0] === 'looqpath') {
                split = param[1].split('§§§');
                node = Looq.getObjectFromXpath(split[0]);
                node[0].innerHTML = split[1].replace(/\[looq\]/g, '<span class="looq-highlight-text">');
            }
        }
    }
};

Looq.init();
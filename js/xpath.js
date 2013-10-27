/**
 * XPATH
 */
var xp = {

    generate: function(element)
    {
        'use strict';
        
        if (element.id !== '') {
            return 'id("'+element.id+'")';
        }else if (element === document.body) {
            return element.tagName;
        }

        var ix= 0;
        if(typeof element.parentNode !== 'undefined' && element.parentNode !== null) {
            var siblings = element.parentNode.childNodes;
            for (var i= 0; i < siblings.length; i++) {
                var sibling = siblings[i];
                if (sibling === element) {
                    if(element.className === 'looq-highlight-text') {
                        return xp.generate(element.parentNode);
                    }
                    return xp.generate(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
                }
                if (sibling.nodeType===1 && sibling.tagName===element.tagName) {
                    ix++;
                }
            }
        }
    },
    
    get: function (xpath)
    {
        'use strict';
        
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
};
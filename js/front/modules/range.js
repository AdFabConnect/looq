var s = {

    getNodes: function()
    {
        'use strict';
        var sel;
        
        if (window.getSelection) {
            sel = window.getSelection();
            
            if (!sel.isCollapsed) {
                return s.getRange(sel.getRangeAt(0));
            }
        }
        
        return [];
    },
    
    getRange: function( range )
    {
        'use strict';
        var node = range.startContainer,
            endNode = range.endContainer,
            rangeNodes;

        // Single node
        if (node === endNode) {
            if( node.nodeName === '#text' ) {
                return [node.parentNode];
            }
            return [node];
        }

        // Many nodes
        rangeNodes = [];
        while (node && node != endNode) {
            rangeNodes.push( node = s.next(node) );
        }

        // Partial selection
        node = range.startContainer;
        while (node && node != range.commonAncestorContainer) {
            rangeNodes.unshift(node);
            node = node.parentNode;
        }
        return rangeNodes;
    },
    
    next: function(node)
    {
        'use strict';

        if (node.hasChildNodes()) {
            return node.firstChild;
        } else {
            while (node && !node.nextSibling) {
                node = node.parentNode;
            }
            if (!node) {
                return null;
            }
            return node.nextSibling;
        }

    },
    
    getPlainText: function()
    {
        'use strict';

        // selection range
        var range = window.getSelection().getRangeAt(0);
         
        // plain text of selected range (if you want it w/o html)
        var text = window.getSelection();
            
        // document fragment with html for selection
        var fragment = range.cloneContents();
         
        // make new element, insert document fragment, then get innerHTML!
        var div = document.createElement('div');
        div.appendChild( fragment.cloneNode(true) );
         
        // your document fragment to a string (w/ html)! (yay!)
        return div.innerHTML.replace(/<(?:.|\n)*?>/gm, '');
    }
};
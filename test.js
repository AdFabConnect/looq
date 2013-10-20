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
        if (node == endNode) {
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

    }
};

/**
 * COLOUR OBJECT
 */
function Colour(r, g, b)
{
    var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/,
        hexRegex = /^#?([a-f\d]{6})$/,
        shortHexRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/;
    
    // Make a new Colour object even when Colour is not called with the new operator
    if (!(this instanceof Colour)) {
        return new Colour(r, g, b);
    }

    if (typeof g == "undefined") {
        // Parse the colour string
        var colStr = r.toLowerCase(), result;

        // Check for hex value first, the short hex value, then rgb value
        if ( (result = hexRegex.exec(colStr)) ) {
            var hexNum = parseInt(result[1], 16);
            r = hexNum >> 16;
            g = (hexNum & 0xff00) >> 8;
            b = hexNum & 0xff;
        } else if ( (result = shortHexRegex.exec(colStr)) ) {
            r = parseInt(result[1] + result[1], 16);
            g = parseInt(result[2] + result[2], 16);
            b = parseInt(result[3] + result[3], 16);
        } else if ( (result = rgbRegex.exec(colStr)) ) {
            r = this.componentFromStr(result[1], result[2]);
            g = this.componentFromStr(result[3], result[4]);
            b = this.componentFromStr(result[5], result[6]);
        } else {
            throw new Error("Colour: Unable to parse colour string '" + colStr + "'");
        }
    }

    this.r = r;
    this.g = g;
    this.b = b;
}

Colour.prototype = {
    equals: function(colour)
    {
        return this.r == colour.r && this.g == colour.g && this.b == colour.b;
    },
    
    componentFromStr: function(numStr, percent)
    {
        var num = Math.max(0, parseInt(numStr, 10));
        return percent ? Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
    }
};

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
}

/**
 * HIGHTLIGHT OBJECT
 */
var hl = {
    hexa: '#fff200',
    rgb: 'rgb(255, 242, 0)',
    rgba: 'rgba(255, 242, 0, 1)',
    
    init: function(hexa)
    {
        'use strict';
        hl.hexa = hexa ? hexa : hl.hexa;
        
        hl.bindEvents();
        
        hl.select();
        
        hl.highlight(hl.hexa);
    },
    
    bindEvents: function()
    {
        'use strict';
        
        document.addEventListener( 'mouseup', hl.up, false );
    },
    
    up:function(e)
    {
        'use strict';
        
        var nodes = s.getNodes(),
            node, i, nodesHl = [];
        
        hl.highlight(hl.hexa);
        
        for(i in nodes) {
            node = nodes[i];
            
            if( node.nodeName === '#text' && node.nodeValue.trim() ) {
                node = node.parentNode;
            }
            if(node.innerHTML !== 'undefined') {
                nodesHl.push(new nodeHl(xp.generate(node), node.innerHTML));
            }
        }
        console.log(nodesHl)
        
        window.getSelection().removeAllRanges();
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
    },
    
    select: function()
    {
        // xp.get('id("middle-wrapper")/DIV[1]/DIV[1]/DIV[2]'),
        // '<span style="background: rgb(255, 0, 255);">The excerpt</span>'.replace(hl.rgb, hl.rgba);
        
        // node[0].innerHTML = str;
    }
};

window.addEventListener('load', function (e)
{
    hl.init();
});

/////////////////////////////////////////

/*
var getComputedStyleProperty;

if (typeof window.getComputedStyle != "undefined") {
    getComputedStyleProperty = function(el, propName) {
        return window.getComputedStyle(el, null)[propName];
    };
} else if (typeof document.documentElement.currentStyle != "undefined") {
    getComputedStyleProperty = function(el, propName) {
        return el.currentStyle[propName];
    };
}
*/

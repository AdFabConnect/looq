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
            r = 0;
            g = 0;
            b = 0;
            //throw new Error("Colour: Unable to parse colour string '" + colStr + "'");
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
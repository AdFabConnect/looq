String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};

String.prototype.ltrim=function(){return this.replace(/^\s+/,'');};

String.prototype.rtrim=function(){return this.replace(/\s+$/,'');};

String.prototype.fulltrim=function(){return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');};

util = {
    
    ajax:function(type, url, json)
    {
        var promise = new Promise(), params = '', i, j;

        for(i in json) {
            if(params !== '') {
                params += '&';
            }
            if(typeof json[i] === 'object') {
                for(j in json[i]) {
                    if(params !== '') {
                        params += '&';
                    }
                    params += i +'[' + j + ']=' + json[i][j];
                }
            }else {
                params += i +'=' + encodeURIComponent(json[i]);
            }
        }
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if(xmlhttp.readyState < 4) {
                return;
            }
                
            if(xmlhttp.status !== 200) {
                return;
            }
     
            // all is well  
            if(xmlhttp.readyState === 4) {
                promise.resolve(xmlhttp);
            }
        }
        
        xmlhttp.open(type, url, true);
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send(params);

        return promise;
    },
    
    addClass: function(obj, c) {
        obj.className = obj.className + ' ' + c;
    },
    
    removeClass: function(obj, c) {
        obj.className = obj.className.replace(c, '');
    },
    
    inArray: function(needle, haystack)
    {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return true;
        }
        return false;
    },
    
    appendHTML:function (el, str)
    {
        var div = document.createElement('div');
        div.innerHTML = str;
        while (div.children.length > 0) {
            el.appendChild(div.children[0]);
        }
    }
};

regex = {
        
    isNotNull: function(str)
    {
        if(typeof str === 'string') {
            return regex.isNotEmpty(str);
        }else if(typeof str === undefined || str === null) {
            return false;
        }else {
            return true;
        }
    },
    
    isNotEmpty: function(str)
    {
        if(str.replace(/^\s+/g,'').replace(/\s+$/g,'') === '') {
            return false;
        }else {
            return true;
        }
    },
    
    isEmailValid: function(str)
    {
        if(!regex.isNotEmpty(str)) {
            return false;
        }
        if(!/^([0-9a-zA-Z]([-\.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/.test(str.replace(/^\s+/g,'').replace(/\s+$/g,''))) {
            return false;
        }else {
            return true;
        }
    }
};

//shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();
var Promise = function ()
{
    'use strict';
};

Promise.prototype = {
	
    pending: {
        resolve: function ()
		{
            'use strict';
        },
        reject: function ()
        {
            'use strict';
        }
    },
    
    then: function (success, failure)
    {
        'use strict';
        
        this.pending = { resolve: success, reject: failure };
        return this;
    },
    
    resolve: function (value)
    {
        'use strict';
        
        this.pending.resolve(value);
    },
    
    reject: function (error)
    {
        'use strict';
        
        this.pending.reject(error);
    }
};
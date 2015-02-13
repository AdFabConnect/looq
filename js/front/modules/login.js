login = {
    looqOauth: 'http://looq.server/rest/oauth',
        
    init: function()
    {
        login.bind();
    },
    
    /**
     * Return promise
     */
    bind: function()
    {
        var looqSubmit = document.querySelector('#looq-submit'),
            json,
            response,
            email,
            password;
        
        if(looqSubmit) {
            looqSubmit.addEventListener('click', function(e)
            {
                email = document.querySelector('#looq-email');
                password = document.querySelector('#looq-password');
                
                if(!regex.isEmailValid(email.value)) {
                    util.addClass(email, 'error');
                    return;
                }
                
                if(!regex.isNotEmpty(password.value)) {
                    util.addClass(password, 'error');
                    return;
                }
                
                json = {
                    'email': email.value,
                    'password': password.value
                };
                
                util.ajax('POST', login.looqOauth, json)
                    .then(function(e)
                    {
                        response = JSON.parse(e.response);
                    });
            });
        }
    }
};

window.addEventListener('load', function (e)
{
    login.init();
})
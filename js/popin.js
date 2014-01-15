var popin = {
    
    showEmail: function()
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
            popinTxt += '           <input type="submit" value="connect" id="looq-submit" class="password" name="password" placeholder="password" />';
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
    
    showLogin: function()
    {
        var promise = new Promise(),
            popinTxt = '', clickClose, clickSubmit;

        if(document.querySelector('#looq-popin-login') === null) {
            popinTxt = '<div id="looq-popin-login" class="looq-popin animated slideInRight">';
            popinTxt += '    <form id="looq-form-login" action="#">';
            popinTxt += '       <div class="looq-close"></div>';
            popinTxt += '       <div class="looq-title connection-title">Connection</div>';
            popinTxt += '       <div class="looq-title registration-title">Registration</div>';
            popinTxt += '       <div class="looq-form-row nickname">';
            popinTxt += '           <input type="text" id="looq-nickname" class="nickname" name="nickname" placeholder="Nickname" />';
            popinTxt += '       </div>';
            popinTxt += '       <div class="looq-form-row">';
            popinTxt += '           <input type="text" id="looq-email" class="email" name="email" placeholder="Email" />';
            popinTxt += '       </div>';
            popinTxt += '       <div class="looq-form-row">';
            popinTxt += '           <input type="password" id="looq-password" class="email" name="email" placeholder="Password" />';
            popinTxt += '        </div>';
            popinTxt += '       <div class="looq-form-row">';
            popinTxt += '           <input type="submit" value="connect" id="looq-submit" class="password" name="password" placeholder="password" />';
            popinTxt += '       </div>';
            popinTxt += '       <div class="looq-form-row">';
            popinTxt += '           <a href="#" id="register">register</a>';
            popinTxt += '           <a href="#" id="connect">connect</a>';
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
    }
};
//**********************************************************************
// File:  NedLibUtils.js
//----------------------------------------------------------------------
// Copyright (c) 2018, dataco.com
//----------------------------------------------------------------------

'use strict';

var NedLibUtils = 
{
    spinnerFunction: null,
    debugFunction: null,
    dataBase: 'MacAdmin.data.',
    location: null,
    locationPostalCode: null,
    
    DebugFunction: function(debugFunction)
    {
        if (debugFunction === undefined) {
            debugFunction = null;
        }
        if (debugFunction instanceof Function) {
            NedLibUtils.debugFunction = debugFunction;
        }
    },
        
    SpinnerFunction: function(spinnerFunction)
    {
        NedLibUtils.spinnerFunction = spinnerFunction;
    },
    
    Spinner: function(show)
    {
        if (NedLibUtils.spinnerFunction instanceof Function) {
            NedLibUtils.spinnerFunction(show);
        }
    },
    
    FormatData: function(data, preamble, newline)
    {
        if (preamble === undefined) {
            preamble = '';
        }
        if (newline === undefined) {
            newline = false;
        }
        
        // Format data
        if (data === null) {
            return (newline ? preamble : '') + '[Null]\n';
        }
        if (typeof data === 'function') {
            return (newline ? preamble : '') + '[Function]\n';
        } 
        if (data instanceof Array) {
            var text = (newline ? preamble : '') + "[\n";
            for (var i = 0; i < data.length; i++) {
                if (i >= 3) {
                    text += preamble + "    [... " + (data.length - 3) + " more elements ...]\n";
                    break;
                }
                text += NedLibUtils.FormatData(data[i], preamble + "    ", true);
            }
            text += preamble + "]\n";
            return text;
        }
        if (typeof data !== 'object') {
            return (newline ? preamble : '') + data + "\n";
        } 
        
        var text = (newline ? preamble : '') + "{\n";
        for (var key in data) {
            // skip loop if the property is from prototype
            if (!data.hasOwnProperty(key)) {
                continue;
            }
            
            var obj = data[key];
            text += preamble + "    " + key + ": " + NedLibUtils.FormatData(obj, preamble + "    ", false);
        }
        text += preamble + "}\n";
        //var text = JSON.stringify(data, null, 2);
        return text;
    },

    DeltaTime: function(data)
    {
        var text  = '???';
        if (data && data.meta && data.meta.timestamp) {
            text = "" + (Date.now() - data.meta.timestamp) + " ms";
        }
        return text;
    },

    LogInfo: function(text)
    {
        if (NedLibUtils.debugFunction) {
            NedLibUtils.debugFunction(text);
        } else {
            log.info(text);
        }
    },
    
    LogInfoUrl: function(url)
    {
        var text = url;
        
        // Parse on "?"
        if (url) {
            var urlparts = url.split('?');
            if (urlparts[0]) {
                text = urlparts[0] + ':';
                var parameters;
                if (urlparts[1]) {
                    parameters = urlparts[1].split('&');
                }
                if (parameters) {
                    var len = parameters.length;
                    for (var i = 0; i < len; i++)
                    {
                        text += '\n    ' + parameters[i];
                    }
                }
            }
        }
        if (NedLibUtils.debugFunction) {
            NedLibUtils.debugFunction(text);
        } else {
            log.info(text);
        }
    },
    
    LogError: function(text)
    {
        if (NedLibUtils.debugFunction) {
            NedLibUtils.debugFunction(text);
        } else {
            log.info(text);
        }
        var logdata = null;
        var sessionId = NedLibUtils.GetSessionId();
        if (sessionId) {
            logdata = { sessionId: sessionId };
        }
        NedLibApi.SaveLog('error', text, logdata, NedLibConfig.clientId);
    },
    
    HashPassword: function(mobileNumber, password, login_salt)
    {
        var salt = sha256.create();
        salt.update('nedforever');
        salt.update('' + mobileNumber);
        salt = salt.hex();
        
        var initstate = sha256.create();
        initstate.update(salt);
        initstate.update('' + password);
        initstate = initstate.hex();
        
        var auth = null;
        if (login_salt) {
            auth = sha256.create();
            auth.update(initstate);
            auth.update(login_salt);
            auth = auth.hex();
        } else {
            auth = initstate;
        }
        
        return auth;
    },

    SaveData: function(category, data)
    {
        localStorage.setItem(NedLibUtils.dataBase + category, JSON.stringify(data));
    },
    
    GetData: function(category)
    {
        var data = localStorage.getItem(NedLibUtils.dataBase + category);
        if (data && data !== 'undefined') {
            data = JSON.parse(data);
        } else {
            data = null;
        }
        return data;
    },
    
    FormatObject: function(object)
    {
        return JSON.stringify(object, null, 4);
    },    
};

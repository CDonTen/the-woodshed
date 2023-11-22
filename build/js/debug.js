'use strict';

var Debug =
{
    initialized: false,
    enabled: false,
    callback: null,
    buffer: [],
    bufferMax: 40,
    bufferPtr: 0,
    
    Init: function()
    {
        if (!Debug.initialized) {
            Debug.initialized = true;
            
            $('#buttonDebugDisable').click(function()
            {
                Debug.Disable();
                if (Debug.callback instanceof Function) {
                    Debug.callback();
                } else {
                    Dashboard.Show();   
                }
            });
            
            $('#buttonDebugInfo').click(function()
            {
                Debug.Log(NedLibConnect.Info());
            });
            
            $('#buttonDebugClear').click(function()
            {
                var div = document.getElementById('divDebugLog');
                div.innerHTML = '';
            });

            $('#buttonDebugSave').click(function()
            {
                NedConnectLib.SaveTargetUrl($('#nedTargetURL').val());
            });
        }
    },
    
    SaveLog: function()
    {
        if (Debug.buffer.length) {
            var message = '';
            if (Debug.buffer.length < Debug.bufferMax) {
                for (var i = 0; i < Debug.bufferPtr; i = i + 1) {
                    message += Debug.buffer[i] + '\n';
                }
            } else {
                var i = Debug.bufferPtr;
                do {
                    message += Debug.buffer[i] + '\n';
                    i = i + 1;
                    if (i >= Debug.bufferMax) {
                        i = 0;
                    }
                } while (i != Debug.bufferPtr);
            }
            NedConnectLib.SaveLog('info', message);
        }
    },
    
    Enable: function(callback = null)
    {
        Debug.enabled = true;
        Debug.callback = callback;
        var div = document.getElementById('divDebugLog');
        div.innerHTML = '';
        $('.ned-hide').show();
        $('#inputClaimCode').val('');
        $('#nedTargetURL').val(NedConnectLib.GetTargetUrl());
        Dialog( "Debug", "Debugging enabled.");
    },
    
    Show: function()
    {
        if (Debug.buffer.length) {
            var div = document.getElementById('divDebugLog');
            if (Debug.buffer.length < Debug.bufferMax) {
                for (var i = 0; i < Debug.bufferPtr; i = i + 1) {
                    div.innerHTML += '<pre style="padding:3px;">' + Debug.buffer[i] + '</pre>';
                }
            } else {
                var i = Debug.bufferPtr;
                do {
                    div.innerHTML += '<pre style="padding:3px;">' + Debug.buffer[i] + '</pre>';
                    i = i + 1;
                    if (i >= Debug.bufferMax) {
                        i = 0;
                    }
                } while (i != Debug.bufferPtr);
            }
            Debug.buffer = [];
            Debug.bufferPtr = 0;
        }
        Debug.enabled = true;
        
        showSection('sectionDebug', ShowHeaderValues.Full);
    },
    
    Enable2: function(callback)
    {
        if (callback === undefined) {
            callback = null;
        }
        Debug.enabled = true;
        Debug.callback = callback;
        var div = document.getElementById('divDebugLog');
        div.innerHTML = '';
        $('#nedTargetURL').val(NedConnectLib.GetTargetUrl());
        Debug.DumpDevice();
        Debug.Show();
    },
    
    Enable: function(callback)
    {
        if (callback === undefined) {
            callback = null;
        }
        Debug.enabled = true;
        Debug.callback = callback;
        $('.ned-hide-menu').show();
        $('#inputClaimCode').val('');
        Dialog( "Debug", "Debugging enabled.");
        Debug.Show(true);
    },
    
    Disable: function()
    {
        Debug.enabled = false;
        $('.ned-hide').hide();
    },
    
    Log: function(text)
    {
        var now = new moment();
        var timestamp = now.format("YYYY-MM-DD HH:mm:ss");
        text = timestamp + ' ' + text;
        log.info(text);
        if (!Debug.enabled) {
            Debug.buffer[Debug.bufferPtr] = text;
            Debug.bufferPtr = Debug.bufferPtr + 1;
            if (Debug.bufferPtr >= Debug.bufferMax) {
                Debug.bufferPtr = 0;
            }
            return;
        }
        var div = document.getElementById('divDebugLog');
        div.innerHTML += '<pre style="padding:3px;">' + text + '</pre>';
    },
    
    IsDebug: function()
    {
        return Debug.enabled;
    },
};

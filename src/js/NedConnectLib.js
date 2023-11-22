//**********************************************************************
// File:  NedConnectLib.js
//----------------------------------------------------------------------
// Copyright (c) 2020, needextradata.com
//----------------------------------------------------------------------

'use strict';

var NedConnectLib = {
    preloginResults: null,
    sequenceNumber: 0,
    sessionId: null,
    apiUrl: null,
    baseApiUrl: null,
    
    Init: function(apiUrl, debugFunction, callback) {
        if (apiUrl === undefined) {
            apiUrl = null;
        }
        if (debugFunction === undefined) {
            debugFunction = null;
        }
        if (callback === undefined) {
            callback = null;
        }
        NedConnectLib.baseApiUrl = apiUrl;
        NedLibUtils.DebugFunction(debugFunction);
        NedLibUtils.LogInfo('NedConnectLib.Init()');
        
        if (callback instanceof Function) {
            callback();
        }
    },
    
    /**** API Calls ************************************************/
    
    NedCareAction: function(parameters, successCallback, errorCallback, suppressSpinner) {
        NedConnectLib.MessageTxAPI('nedCareActions', parameters, successCallback, errorCallback, suppressSpinner);
    },
    
    /*** Helper Functions *******************************************/
    SpinnerFunction: function(spinnerFunction) {
        NedLibUtils.LogInfo('NedConnectLib.SpinnerFunction()');
        NedLibUtils.SpinnerFunction(spinnerFunction);
    },

    FormatPhone: function(phone) {
        var formatted = phone;
        
        if (phone) {
            phone = phone.replace(/\D/g, '');
            if (phone.length == 10 && phone.substring(0, 1) != '1') {
                formatted = '1-' + phone.substring(0, 3) + '-' + phone.substring(3, 6) + '-' + phone.substring(6);
            } else if (phone.length == 11 && phone.substring(0, 1) == '1') {
                formatted = phone.substring(0, 1) + '-' + phone.substring(1, 4) + '-' + phone.substring(4, 7) + '-' + phone.substring(7);
            }
        }
        return formatted;
    },
    
    DeltaTime: function(data)
    {
        var text  = '???';
        if (data && data.timestamp) {
            text = "" + (Date.now() - data.timestamp) + " ms";
        }
        return text;
    },
    
    Success: function(data, successCallback, errorCallback, suppressSpinner)
    {
        NedLibUtils.LogInfo('API Received data(' + NedConnectLib.DeltaTime(data) + '): ' + NedLibUtils.FormatData(data));
        if (!suppressSpinner) {
            NedLibUtils.Spinner(false);
        }
        if (data !== null && typeof data === 'object') {
            if ("status" in data) {
                if (data.status == 0) {
                    if (successCallback instanceof Function) {
                        if ("data" in data && data.data !== null /*&& typeof data.result === 'object'*/) {
                            successCallback(data);
                        } else {
                            successCallback(null);
                        }
                    } else {
                        //
                    }
                } else {
                    var errorText = '';
                    if ("error_fields" in data && "error_messages" in data) {
                        var errorFields = data.error_fields;
                        var len = errorFields.length;
                        for (var i = 0; i < len; i++) {
                            var field = errorFields[i];
                            if (field in data.error_messages) {
                                var errorMessages = data.error_messages[field];
                                var len2 = errorMessages.length;
                                for (var j = 0; j < len2; j++) {
                                    var message = errorMessages[j];
                                    if (message) {
                                        if (errorText) {
                                            errorText += '<br>';
                                        }
                                        errorText += message;
                                    }
                                }
                            }
                        }
                    } 
                    if ("errorString" in data.data) {
                        errorText = data.data.errorString;
                    } else if (!errorText) {
                        errorText = 'Status: ' + data.status;
                    }
                    NedLibUtils.LogInfo('API Received:  ERROR: ' + errorText);
                    if (errorCallback instanceof Function) {
                        errorCallback(errorText);
                    }
                }
            } else {
                NedLibUtils.LogInfo('API Received data but no status.');
                if (errorCallback instanceof Function) {
                    errorCallback('API Received data but no status.');
                }
            }
        } else {
            NedLibUtils.LogInfo('API Received invalid data.');
            if (errorCallback instanceof Function) {
                errorCallback('API Received invalid data.');
            }
        }
    },
    
    Error: function(xhr, status, err, errorCallback, suppressSpinner) 
    {
        if (suppressSpinner === undefined) {
            suppressSpinner = false;
        }
        if (!suppressSpinner) {
            NedLibUtils.Spinner(false);
        }
        var text = 'AJAX FAILURE: xhr.readyState=' + xhr.readyState + ' xhr.status=' 
            + xhr.status + ' xhr.statusText="' + xhr.statusText + '" status="' 
            + status + '" err="' + err + '"';
        NedLibUtils.LogInfo(text);
        text = 'We are experiencing technical difficulties at this time. Please try again later.';
        if (errorCallback instanceof Function) {
            errorCallback('Network Error, call to server failed.');
        }
    },
        
    //************************************************************
    // Nudge API Functions
    //------------------------------------------------------------    
    MessageTxAPI: function(messageId, parameters, successCallback, errorCallback, suppressSpinner)
    {
        var url = NedConnectLib.baseApiUrl;
        var data = {
            sessionId:  NedConnectLib.sessionId
        };
        data.sequenceNumber = NedConnectLib.sequenceNumber++;
        data.messageId = messageId;
        data.timestamp = Date.now();
        if (parameters) {
            data.parameters = parameters;
        }

        NedLibUtils.LogInfoUrl('NedConnectLib.MessageTxAPI.POST: ' + url);
        NedLibUtils.LogInfo('NedConnectLib.MessageTxAPI.data: ' + NedLibUtils.FormatData(data));
        if (!suppressSpinner) {
            NedLibUtils.Spinner(true);
        }
        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(data, null, 2),
            // Two minute timeout
            timeout: 120000, 
            //contentType: 'application/json',
            contentType: 'text/plain',
            success: function(data) 
            {
                NedConnectLib.Success(data, successCallback, errorCallback, suppressSpinner);
            },
            error: function(xhr, status, err) 
            {
                NedConnectLib.Error(xhr, status, err, errorCallback, suppressSpinner);
            }
        });
    },  
};

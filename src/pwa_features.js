//**********************************************************************
// File:  pwa-features.js
//----------------------------------------------------------------------
// Copyright (c) 2023, needextradata.com
//----------------------------------------------------------------------

'use strict';

var gMac = '';
var gPin = '';
var gOTPcode = '';
var gDTitle = 'NedCare';
var gSetupData = null;
var gSuccess = false;
var gShowingDevTools = 'false';
var gShowingNedCareControls = 'false';
var gHtmlString1 = '';
var gHtmlString2 = '';

var gReminderSchedule = [];
var gReminderScheduleData = [];
var gReminderScheduleCount = 0;

var gTogglePower = 0;
var gDoNotDisturbDuration = 0;

//================================================================================
// Function: MakeAccountSelector
//--------------------------------------------------------------------------------
function MakeAccountSelector() {
    nedCareLog("MakeAccountSelector enter");
    if (gKnownResidentsArray.length <= 1) {
        $("#userAccountSelector").hide();
        return;
    }
    let accountList = [];
    accountList.push(
        '<option value="default">Select Account</option>');

    var optionString = "";
    var residentData;
    var residentFirstName = "";
    for (let resident of gKnownResidentsArray) {
        residentData = JSON.parse(window.localStorage.getItem(resident));
        residentFirstName = residentData.residentFirstName;
        optionString = '<option value="' + resident + '">' + residentFirstName + '</option>';
        accountList.push(optionString);
    }
    $("#userSelectedAccount").html(accountList.join(""));
}

//================================================================================
// Function: makeAccountCards
//--------------------------------------------------------------------------------
function makeAccountCards() {
    nedCareLog('Make Account Cards: Start');
    var htmlString = "";
    var record = "";
    for (let accountID of gKnownResidentsArray) {
        htmlString += '<div class="card mt-3" id="'
        htmlString += accountID + '">';
        htmlString += '<header class="card-header nedcare-card-decorator">';
        htmlString += '<p class="card-header-title">';
        record = JSON.parse(window.localStorage.getItem(accountID));
        htmlString += record.residentFirstName + " " + record.residentLastName;
        htmlString += '</p></header>';
        htmlString += '<div class="card-content"><div class="content">';
        htmlString += '<span class="has-text-weight-semibold">Account Number: </span>' + accountID;
        htmlString += '</div></div>';
        htmlString += '<footer class="card-footer nedcare-card-decorator">';
        htmlString += '<div class="card-footer-item delete-account-card" id="';
        htmlString += accountID + 'b">Delete</div>';
        htmlString += '</footer></div>';
    }
    return (htmlString);
}

//================================================================================
// Function: deleteAccountCard
//--------------------------------------------------------------------------------
function deleteAccountCard() {
    nedCareLog('Delete Account Card clicked.');
    var tmpId = $(this).attr("id");
    // remove the trailing b for button
    var index = tmpId.substring(10);
    nedCareLog("Delete account entry: " + index);
    // Find the entry in the residents list
    for (var i = 0; i < gKnownResidentsArray.length; i++) {
        if (index === gKnownResidentsArray[i]) {
            gKnownResidentsArray.splice(i, 1);
        }
    }
    // Redraw the cards
    $('#userAccountCards').html(makeAccountCards());
    // Update the current account to the first entry in the gKnownResidentsArray
    if (gKnownResidentsArray.length === 0) {
        // Must throw a dialog and restart the account configuration process
        Dialog(gDTitle, "There are no accounts configured. You must now configure an account or close the app.")
    } else {
        window.localStorage.setItem("currentAccountNumber", gKnownResidentsArray[0]);
        updateDevices();
    }
}

//================================================================================
// Function: MakeMessageButtons
//--------------------------------------------------------------------------------
function MakeMessageButtons() {
    nedCareLog('MakeMessageButtons: Start');
    var htmlStringTextMessageButtons = "";

    // Message Title block
    htmlStringTextMessageButtons += '<div class="ned-title has-text-weight-semibold has-text-centered is-size-3 mt-6">';
    htmlStringTextMessageButtons += '<div>Send a Text Message</div>';
    // htmlStringTextMessageButtons += '<div class="is-size-5 mt-4">Send a message on behalf of ' + gSetupData.FirstName + '</div>';
    htmlStringTextMessageButtons += '</div>';

    // Set up the input field with the default message
    var msg = 'NedCare: Please call ' + gSetupData.FirstName;
    htmlStringTextMessageButtons += '<div class="has-text-left has-text-weight-semibold mt-4">Message: </div>';
    htmlStringTextMessageButtons += '<input class="input nedcare-input mt-2" id="userNedCareTextMessageInput" autocomplete="off" type="text">';

    // Make the buttons for the contact list
    for (var i = 0; i < gSetupData.Contacts.length; i = i + 2) {
        htmlStringTextMessageButtons += '<div class="level is-mobile">';
        htmlStringTextMessageButtons += '<div class="level-item">';
        htmlStringTextMessageButtons += '<div class="mt-4"><button class="button nedcare-button has-text-weight-semibold nedCareMessage" id="';
        htmlStringTextMessageButtons += 'nedCareTextMessage' + i + '">';
        htmlStringTextMessageButtons += gSetupData.Contacts[i].FirstName;
        htmlStringTextMessageButtons += '</button></div>';
        htmlStringTextMessageButtons += '</div>';
        if ((i + 1) < gSetupData.Contacts.length) {
            htmlStringTextMessageButtons += '<div class="level-item">';
            htmlStringTextMessageButtons += '<div class="mt-4"><button class="button nedcare-button has-text-weight-semibold nedCareMessage" id="';
            htmlStringTextMessageButtons += 'nedCareTextMessage' + (i + 1) + '">';
            htmlStringTextMessageButtons += gSetupData.Contacts[i + 1].FirstName;
            htmlStringTextMessageButtons += '</button></div>';
            htmlStringTextMessageButtons += '</div>';
        }
        htmlStringTextMessageButtons += '</div>';
    }

    // Create the Message div
    $('#textMessageButtons').html(htmlStringTextMessageButtons);
    // Configure the default message
    $('#userNedCareTextMessageInput').val(msg);

    // Message button handlers
    $('.nedCareMessage').click(function () {
        nedCareLog('nedCareTextMessage clicked.');
        var cellNumber = gCurrentAccountData.cellNumber;
        var nedCareMsg = $('#userNedCareTextMessageInput').val();
        nedCareMsg = nedCareMsg.trim();
        var buttonId = this.id;
        var name = '';
        buttonId = buttonId.slice(18); // remove "nedCareTextMessage" from front of ID
        var index = parseInt(buttonId, 10);
        name = gSetupData.Contacts[index].FirstName;
        cellNumber = gSetupData.Contacts[index].CellNumber;

        nedCareLog('Name: ' + name);
        nedCareLog('CellNumber: ' + cellNumber);
        nedCareLog('NedCare Message: ' + nedCareMsg);

        NedConnectLib.NedCareAction(
            {
                action: 'textMessage',
                accountId: gCurrentAccountData.accountNumber,
                cellNumber: cellNumber,
                message: nedCareMsg,
                firstName: gCurrentAccountData.firstName
            },
            function (result) {
                // Success, make call sent
                var msg = 'Message sent to ' + name;
                Dialog('Success', msg);
            },
            function (errors) {
                Dialog("Error", errors);
            },
            false
        );
    });
}

//================================================================================
// Function: MakeSayButtons
//--------------------------------------------------------------------------------
function MakeSayButtons() {
    nedCareLog('MakeSayButtons: Start');
    var htmlStringSayButtons = "";

    // Say Title block
    htmlStringSayButtons += '<div class="ned-title has-text-weight-semibold has-text-centered is-size-3 mt-6">';
    htmlStringSayButtons += '<div>Speak a Message</div>';
    htmlStringSayButtons += '</div>';

    // Set up the Say input field with the default message
    var sayMsg = 'Hi ' + gSetupData.PromptName;
    htmlStringSayButtons += '<div class="has-text-left has-text-weight-semibold mt-4 mb-4">Say: </div>';
    htmlStringSayButtons += '<input class="input nedcare-input mt-2" id="userNedCareSayMessageInput" autocomplete="off" type="text">';
    htmlStringSayButtons += '<div class="mt-4">';
    htmlStringSayButtons += '<button class="button nedcare-button has-text-weight-semibold nedCareSay" id="userNedCareSayMessageButton">Say</button>';
    htmlStringSayButtons += '</div>';

    // Create the Say div
    $('#sayButtons').html(htmlStringSayButtons);
    // Configure the default message
    $('#userNedCareSayMessageInput').val(sayMsg);

    // Say button handler
    $('#userNedCareSayMessageButton').click(function () {
        nedCareLog('nedcareSay clicked.');
        var cellNumber = gCurrentAccountData.cellNumber;
        var nedCareSayMsg = $('#userNedCareSayMessageInput').val();
        nedCareSayMsg = nedCareSayMsg.trim();
        nedCareLog(nedCareSayMsg);
        $('#userNedCareSayMessageButton').html('Sending Say Command');
        $('#userNedCareSayMessageButton').addClass('nedcare-big-button-animation');
        NedConnectLib.NedCareAction(
            {
                action: 'speakMessage',
                accountId: gCurrentAccountData.accountNumber,
                cellNumber: cellNumber,
                message: nedCareSayMsg,
                firstName: gCurrentAccountData.firstName
            },
            function (result) {
                // Success, make call sent
                //  var msg = 'Message sent to ' + gSetupData.FirstName;
                //  Dialog('Success', msg);
                $('#userNedCareSayMessageButton').removeClass('nedcare-big-button-animation');
                $('#userNedCareSayMessageButton').trigger("blur");
                $('#userNedCareSayMessageButton').html('Say');
            },
            function (errors) {
                $('#userNedCareSayMessageButton').removeClass('nedcare-big-button-animation');
                $('#userNedCareSayMessageButton').trigger("blur");
                $('#userNedCareSayMessageButton').html('Say');
                Dialog("Error", errors);
            },
            true
        );
    });
}

//================================================================================
// Function: ResendOTP
//--------------------------------------------------------------------------------
function ResendOTP() {
    nedCareLog('ResendOTP: Start');
    NedConnectLib.NedCareAction(
        {
            action: 'registerContact',
            accountId: gCurrentAccountData.accountNumber,
            cellNumber: gCurrentAccountData.cellNumber,
            firstName: gCurrentAccountData.firstName
        },
        function (result) {
            // Success, display message that "NedCare Code" is being texted to the cell number, open dialog for entry of received code
            Dialog(gDTitle, "A new NedCare security code will now be texted to your cell phone. Please enter the code in the field below.");
            $('#nedCareAuthCode').show();
        },
        function (errors) {
            Dialog("Error", errors);
            ShowConfigure();
        },
        false
    );
}

//================================================================================
// Function: ResendOTP
//--------------------------------------------------------------------------------
function CheckReady() {
    nedCareLog('CheckReady: Start');

    var ready = true;
    gCurrentAccountData.firstName = $('#userFirstName').val();
    if (gCurrentAccountData.firstName) {
        gCurrentAccountData.firstName = gCurrentAccountData.firstName.trim();
    } else {
        ready = false;
    }
    gCurrentAccountData.cellNumber = $('#userCellNumber').val();
    if (gCurrentAccountData.cellNumber) {
        gCurrentAccountData.cellNumber = gCurrentAccountData.cellNumber.trim();
    } else {
        ready = false;
    }
    gCurrentAccountData.accountNumber = $('#userAccountNumber').val();
    if (gCurrentAccountData.accountNumber) {
        gCurrentAccountData.accountNumber = gCurrentAccountData.accountNumber.trim();
    } else {
        ready = false;
    }

    if (ready) {
        nedCareLog('CheckReady: Ready to submit');
        window.localStorage.setItem(gCurrentAccountData.accountNumber, JSON.stringify(gCurrentAccountData));
        window.localStorage.setItem("currentAccountNumber", gCurrentAccountData.accountNumber);
        // Update the Resident array
        var found = false;
        for (var i = 0; i < gKnownResidentsArray.length; i++) {
            // Does this Resident already exist in the array
            if (gKnownResidentsArray[i] === gCurrentAccountData.accountNumber) {
                // Resident already exists
                found = true
            }
        }
        if (!found) {
            // Add the new Resident to the array
            gKnownResidentsArray.push(gCurrentAccountData.accountNumber);
            // Save a copy of the known Residents array in localStorage
            window.localStorage.setItem("residentsList", JSON.stringify(gKnownResidentsArray));
        }
        return (true);
    } else {
        Dialog(gDTitle, "ERROR: One or more fields incomplete.");
        nedCareLog('CheckReady: Not ready');
        return (false);
    }
}

//================================================================================
// Function: CheckOTPAsync
//--------------------------------------------------------------------------------
async function CheckOTPAsync() {
    if (deviceChoicesAvailable()) {
        try {
            await configDevices("CheckOTPAsync");
        } catch (ex) {
            nedCareLog("Error occurred in configDevice in checkOTPAsync: ", ex);
        }
    }
}

//================================================================================
// Function: CheckOTP
//--------------------------------------------------------------------------------
async function CheckOTP() {
    nedCareLog('CheckOTP: Start');
    gOTPcode = $('#userNedCareAuthCode').val();
    gSuccess = false;
    NedConnectLib.NedCareAction({
        action: 'confirmOTP',
        accountId: gCurrentAccountData.accountNumber,
        cellNumber: gCurrentAccountData.cellNumber,
        code: gOTPcode,
        firstName: gCurrentAccountData.firstName
    },
        async function (result) {
        // Success
        nedCareLog("CheckOTP SUCCESS: You have successfully validated your account.");
        $('#nedCareAuthCode').hide();
        getConfigFromServer("CheckOTP")
        // $('#makeConnection').fadeIn(gFadeTime);
        // if (gCurrentAccountData.configured) {
        //   $('#makeConnection').fadeIn(gFadeTime);
        // } else {
        //   try {
        //     await configDevices("CheckOTP");
        //   } catch (ex) {
        //     nedCareLog("Error occurred in configDevice in checkOTP: ", ex);
        //   }
        // }

        // gSetupData = JSON.parse(JSON.stringify(result.data));
        // gCurrentAccountData.validated = true;
        // // Should contain 'PromptName' and 'Contacts' (array of contacts containing 'Name' and 'CellNumber')
        // gCurrentAccountData.showContactButtons = gSetupData.ShowContact;

        // $('#nedCareAuthCode').hide();
        // // If this user has forceCall enabled
        // // Then show both buttons, otherwise just show the primary button
        // for (var i = 0; i < gSetupData.Contacts.length; i++) {
        //   if (gSetupData.Contacts[i].FirstName == gCurrentAccountData.firstName) {
        //     gCurrentAccountData.lastName = gSetupData.Contacts[i].LastName;
        //     gCurrentAccountData.lastName = gSetupData.Contacts[i].LastName;
        //     if (gSetupData.Contacts[i].ForceCall) {
        //       gCurrentAccountData.forceCall = true;
        //     } else {
        //       gCurrentAccountData.forceCall = false;
        //     }
        //   }
        // }
        // window.localStorage.setItem(gCurrentAccountData.accountNumber, JSON.stringify(gCurrentAccountData));
        // MakeContactButtons();
        // MakeMessageButtons();
        // MakeSayButtons();
        // MakeAccountSelector();
    },
        function (errors) {
        Dialog("Error", errors);
        // User must re-enter OTP or request a new OTP
        $('#userNedCareAuthCode').val('');
    },
        false);

    // CheckOTPAsync();

    // nedCareLog("CheckOTP: Check device configuration");
    // if (gOS !== 'iOS') {
    //   if (gCurrentAccountData.configured) {
    //     $('#makeConnection').fadeIn(gFadeTime);
    //   } else {
    //     // Check for video and audio device configuration
    //     CheckOTPAsync();
    //   }
    // } else {
    //   $('#makeConnection').fadeIn(gFadeTime, function () {
    //     updateDevices();
    //   });
    // }
    nedCareLog("CheckOTP: Exiting");
    return false;
}

// *****************
// HELPERS
// *****************

//================================================================================
// Function: showInfoMessage
//--------------------------------------------------------------------------------
function showInfoMessage(msg, duration) {
    if (duration === null) {
        duration = 3000;
    }
    $('#infoMessageContents').html(msg);
    $('#infoMessage').fadeIn(2 * gFadeTime / 3.0, function () {
        $('#infoMessage').addClass("is-active");
        setTimeout(
            function () {
            $('#infoMessage').fadeOut(2 * gFadeTime / 3.0, function () {
                $('#infoMessage').removeClass("is-active");
                $('#infoMessageContents').html("");
            });
        },
            duration);
    });
}

//================================================================================
// Function: getAllUrlParams
//--------------------------------------------------------------------------------
function getAllUrlParams(url) {
    nedCareLog('getAllUrlParams: Start');

    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');

            // in case params look like: list[]=thing1&list[]=thing2
            var paramNum = undefined;
            var paramName = a[0].replace(/\[\d*\]/, function (v) {
                paramNum = v.slice(1, -1);
                return '';
            });

            // set parameter value (use 'true' if empty)
            var paramValue = typeof(a[1]) === 'undefined' ? true : a[1];

            // (optional) keep case consistent
            //paramName = paramName.toLowerCase();
            //paramValue = paramValue.toLowerCase();

            // if parameter name already exists
            if (obj[paramName]) {
                // convert value to array (if still string)
                if (typeof obj[paramName] === 'string') {
                    obj[paramName] = [obj[paramName]];
                }
                // if no array index number specified...
                if (typeof paramNum === 'undefined') {
                    // put the value on the end of the array
                    obj[paramName].push(paramValue);
                }
                // if array index number specified...
                else {
                    // put the value at that index number
                    obj[paramName][paramNum] = paramValue;
                }
            }
            // if param name doesn't exist yet, set it
            else {
                obj[paramName] = paramValue;
            }
        }
    }

    return obj;
}

//================================================================================
// Function: Spinner
//--------------------------------------------------------------------------------
var gSpinnerCount = 0;
var gSpinnerShow;
function Spinner(enable) {
    if (enable) {
        gSpinnerCount++;
        if (!gSpinnerShow) {
            $(".loading").show();
            gSpinnerShow = true;
            /*
            setTimeout(
            function(){
            //Debug.Log("Spinner TIMEOUT Start, gSpinnerCount = " + gSpinnerCount);
            if (gSpinnerCount) {
            $(".loading").show();
            gSpinnerShow = true;
            }
            },
            200
            );
             */
        }
    } else {
        if (gSpinnerCount) {
            gSpinnerCount--;
            if (!gSpinnerCount) {
                $(".loading").hide();
                gSpinnerShow = false;
                /*
                setTimeout(
                function(){
                //Debug.Log("Spinner TIMEOUT End, gSpinnerCount = " + gSpinnerCount);
                if (!gSpinnerCount) {
                $(".loading").hide();
                gSpinnerShow = false;
                }
                },
                200
                );
                 */
            }
        }
    }
}

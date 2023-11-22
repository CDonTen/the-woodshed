//**********************************************************************
// File:  pwa.js
//----------------------------------------------------------------------
// Copyright (c) 2023, needextradata.com
//----------------------------------------------------------------------

'use strict';

// Video calls
var gIdLabel = "";
var gPanelHeaderMessageActive = false;
var gIframeTest = false;
var gRingTone = null;
var gPressTone = null;
var gRemoteParticipantCount = 0; // Participant 0 is the local mediastream, 1 is the resident
var gCurrentRemoteParticipants = 0;
const gRemoteParticipantsMax = 2;
var gStartingTrack = false;
var gDuplicateOnLocal = true;
var gScreenWidth = 0;
var gScreenHeight = 0;
var gSecondaryScreenTop = 5;
var gSecondaryScreenLeft = 5;
var gXScreenPos = 1; // percent
var gYScreenPos = 1; // percent
var gDebugString = "";
var gOS = "";
var gRetry = 0;
var gCallActive = false;
var gBlockRemoteDesktopOnMobile = false;
var gMeeting = new Metered.Meeting();
var gParticipantSessionId = "";
var gCameraOn = true;
var gAudioOutputDevices = [];
var gAudioInputDevices = [];
var gVideoInputDevices = [];
var gFrontCamera = true;
var gLocalOnPrimary = false;
var gActiveCameraID = null;
var gMicrophoneMuted = true; // userMicrophoneMuteToggle
var gAudioOn = false;
var gScreenSharing = false;
var gResidentMonitorPermitted = false;
var gResidentMonitoring = false;

var gLocalVideo = "secondaryVideo";
var gLocalVideoConferenceTarget = "video0";
var gLocalVideoStream = null;
var gRemoteVideo = "primaryVideo";
var gRemoteVideoConferenceTarget = "video0";
var gPrimaryVideoClasses = ["has-text-centered"];
var gSecondaryVideoClasses = ["has-text-centered"];
var gConferenceVideoClasses = ["column", "is-6", "px-0", "py-0"];
var gRemoteVideoStream = null;
var gRemoteAudioStream = null;
var gFadeTime = 750;
var gRoomName = "";
var gRoomLink = "";
var gAccessToken = "";
var gVideoUnavailable = true;
var gAudioAvailable = false;
var gVideoScale = 1.0;
var gLocalScale = 0.2;
var gFilterMax = 10;
var gFilterMin = 0;
var gBrightness = 1.0;
var gBrightnessStep = 0.25;
var gVolumeMin = 0;
var gVolumeMax = 100;
var gVolumeStep = 10;
var gContrast = 1.0;
var gContrastStep = 0.125;
var gRemoteAvState = {
    audioMute: 0,
    audioVolume: 50,
    videoMute: 0,
    videoBrightness: 1.0,
    videoContrast: 1.0
};
const gConstReminderEntries = 10;
var gKnownResidentsArray = [];

var gCurrentAccountData = {
    firstName: "",
    lastName: "",
    promptName: "",
    residentFirstName: "",
    residentLastName: "",
    audioVolume: "",
    contacts: "",
    cellNumber: "",
    accountNumber: "",
    monitor: false,
    forceCall: false,
    showContactButtons: false,
    validated: false,
};

var gDeviceConfig = null;
/*
var gDeviceConfig = {
    configured: false,
    AudioInputDeviceName: "",
    AudioOutputDeviceName: "",
    VideoInputDeviceFrontName: "",
    VideoInputDeviceBackName: ""
}
*/
    
var gCurrentVideoInputDeviceFront = '';
var gCurrentVideoInputDeviceBack = '';
var gCurrentAudioInputDevice = '';
var gCurrentAudioOutputDevice = '';

var gInMakeConnection = false;

//================================================================================
// Function: document.ready
//--------------------------------------------------------------------------------
$(document).ready(function () {
    documentReady2();
});

async function documentReady2() {
    nedCareLog('PWA document ready.');
    nedCareLog('Version: ' + gConfig.version);
    var baseURL = window.location.origin;
    baseURL = baseURL.slice(8); // remove "https://"
    $('#URLaddress').html(baseURL);
    gIdLabel = baseURL.split('.', 1)[0];
    gIdLabel += ", " + gConfig.version;
    $('#callStatus').text(gIdLabel);

    // =========================
    // IS THIS A BREAKING BUILD?
    // =========================
    var resetStorage = false;
    nedCareLog("Breaking build? " + gConfig.localStorageVersion);
    if (window.localStorage.getItem("localStorageVersion") !== null) {
        if (gConfig.localStorageVersion !== window.localStorage.getItem("localStorageVersion")) {
            nedCareLog("Local Storage Version not the same, clear local storage");
            resetStorage = true;
        }
    } else {
        // No localStorageVersion stored
        nedCareLog("localStorageVersion missing, clear local storage");
        resetStorage = true;
    }
    
    if (resetStorage) {
        window.localStorage.clear();
        window.localStorage.setItem("localStorageVersion", gConfig.localStorageVersion);
    }
    // =========================
    // END BREAKING BUILD
    // =========================

    // Set the base URL for all API calls
    NedConnectLib.Init(gConfig.api);
    NedConnectLib.SpinnerFunction(Spinner);
    NedLibUtils.Spinner(true);

    // Get devices and save for future use
    await getDevices("Document Ready");

    // Add event handlers
    addHandlers();
    
    // Android or iOS?
    checkMobileOs();

    gScreenWidth = window.innerWidth;
    gScreenHeight = window.innerHeight;
    // gScreenWidth = window.screen.width;
    // gScreenHeight = window.screen.height;

    // Get list of known residents
    gKnownResidentsArray = JSON.parse(window.localStorage.getItem("residentsList"));
    if (gKnownResidentsArray === null) {
        gKnownResidentsArray = [];
    }

    // Check if initial account setup required
    var accountNumber = window.localStorage.getItem("currentAccountNumber");
    gCurrentAccountData.accountNumber = accountNumber == null ? "" : accountNumber;

    // Get saved device config
    gDeviceConfig = JSON.parse(window.localStorage.getItem("deviceConfig"));
    if (gDeviceConfig == null || gDeviceConfig.configured != true) {
        DoDefaultConfig();
    } else {
        updateDevices();
    }
    
    // Check if need to set up account
    if (gCurrentAccountData.accountNumber !== "") {
        nedCareLog("Passed test 1: " + gCurrentAccountData.accountNumber);
        
        // We have an account number so we can retrieve the config data from local storage
        gCurrentAccountData = JSON.parse(window.localStorage.getItem(gCurrentAccountData.accountNumber));
        if (gCurrentAccountData !== null) {
            nedCareLog("Passed test 2: gCurrentAccountData !== null");
            
            // Data has been stored for this account number
            if (gCurrentAccountData.validated) {
                nedCareLog("Passed test 3: " + gCurrentAccountData.validated);
                gIdLabel = gCurrentAccountData.firstName + ", " + $('#callStatus').text();
                $('#callStatus').text(gIdLabel);
                $('#configurePWA').hide();

                // Call server to get the current contact list and store in gSetupData
                getConfigFromServer("Document Ready");
                
                // Ready to make calls
                /*$('#nedCareVideoConferenceContainer').fadeOut(gFadeTime);
                $('#nedCareConferenceContainer').fadeOut(gFadeTime, function () {
                    $('#makeConnection').fadeIn(gFadeTime, function () {
                        processUrlParams(getAllUrlParams());
                    });
                });*/
                $('#nedCareVideoConferenceContainer').hide();
                $('#nedCareConferenceContainer').hide();
                $('#makeConnection').show();
                processUrlParams(getAllUrlParams());
            } else {
                nedCareLog("Document Ready: Not yet validated");
                ShowAccountSetUp();
            }
        } else {
            nedCareLog("Document Ready: Empty entry in localStorage for this account");
            ShowAccountSetUp();
        }
    } else {
        nedCareLog("Document Ready: No account number");
        ShowAccountSetUp();
    }

    NedLibUtils.Spinner(false);
} // end document ready

//================================================================================
// Function: getDevices
//--------------------------------------------------------------------------------
async function getDevices(caller) {
    nedCareLog("getDevices enter: " + caller);
    nedCareLog("gMeeting.handlerName: " + gMeeting.handlerName);

    gAudioOutputDevices = [];
    try {
        try {
            gAudioOutputDevices = await gMeeting.listAudioOutputDevices();
        } catch (ex) {
            nedCareLog("Error in List Audio Output Devices: " + ex);
        }
        nedCareLog("getDevices Found " + gAudioOutputDevices.length + " audio output devices.");
        nedCareLog('***** AUDIO OUTPUT DEVICES *****');
        var count = 0;
        gAudioOutputDevices.forEach((device) => {
            if (count > 0) {
                nedCareLog('----------------------------------------');
            }
            count = count + 1;
            nedCareLog('deviceId: ' + device.deviceId);
            nedCareLog('groupId:  ' + device.groupId);
            nedCareLog('label:    ' + device.label);
        });
    } catch (ex) {
        nedCareLog("Audio Ouput Devices List not available - it is unsupported in Firefox", ex);
    }

    gAudioInputDevices = [];
    try {
        gAudioInputDevices = await gMeeting.listAudioInputDevices();
        nedCareLog("getDevices Found " + gAudioInputDevices.length + " audio input devices.");
        nedCareLog('***** AUDIO INPUT DEVICES *****');
        var count = 0;
        gAudioInputDevices.forEach((device) => {
            if (count > 0) {
                nedCareLog('----------------------------------------');
            }
            count = count + 1;
            nedCareLog('deviceId: ' + device.deviceId);
            nedCareLog('groupId:  ' + device.groupId);
            nedCareLog('label:    ' + device.label);
        });
    } catch (ex) {
        nedCareLog("Microphone not available or microphone access has been disabled", ex);
    }

    gVideoInputDevices = [];
    try {
        gVideoInputDevices = await gMeeting.listVideoInputDevices();
        nedCareLog("getDevices Found " + gVideoInputDevices.length + " video input devices.");
        nedCareLog('***** VIDEO INPUT DEVICES *****');
        var count = 0;
        gVideoInputDevices.forEach((device) => {
            if (count > 0) {
                nedCareLog('----------------------------------------');
            }
            count = count + 1;
            nedCareLog('deviceId: ' + device.deviceId);
            nedCareLog('groupId:  ' + device.groupId);
            nedCareLog('label:    ' + device.label);
        });
    } catch (ex) {
        nedCareLog("Camera not available or camera access has been disabled", ex);
    }
    nedCareLog("getDevices exit: " + caller);
};

//================================================================================
// Function: DoDefaultConfig
//--------------------------------------------------------------------------------
function DoDefaultConfig() {
    // Select audio output device
    gDeviceConfig = {
        configured: true,
        AudioInputDeviceName: "default",
        AudioOutputDeviceName: "default",
        VideoInputDeviceFrontName: "",
        VideoInputDeviceBackName: ""
    };

    /*
    if (gOS == "desktop") {
        // Select default input device
        if (gAudioInputDevices.length > 0) {
            var lookfor = gAudioInputDevices[0].label;
            if (lookfor.toLowerCase() != 'default') {
                for (var i = 1; i < gAudioInputDevices.length; i++) {
                    if (gAudioInputDevices[i].label == lookfor) {
                        gDeviceConfig.AudioInputDeviceName = lookfor;
                        break;
                    }
                }
            }
        }
        
        // Select default output device
        if (gAudioOutputDevices.length > 0) {
            var lookfor = gAudioOutputDevices[0].label;
            if (lookfor.toLowerCase() != 'default') {
                for (var i = 1; i < gAudioOutputDevices.length; i++) {
                    if (gAudioOutputDevices[i].label == lookfor) {
                        gDeviceConfig.AudioOutputDeviceName = lookfor;
                        break;
                    }
                }
            }
        }
    }
    */
    
    // Determine default video input devices
    if (gVideoInputDevices.length == 0) {
        nedCareLog('DoDefaultConfig: No video input devices');
    } else if (gVideoInputDevices.length == 1) {
        nedCareLog('DoDefaultConfig: One video input device, setting as front camera');
        gDeviceConfig.VideoInputDeviceFrontName = gVideoInputDevices[0].label;
    } else {
        // Two or more devices
        
        // See if any "front"
        var front = '';
        gVideoInputDevices.forEach((device) => {
            var label = device.label;
            if (label.toLowerCase().includes('front')) {
                if (front == '') {
                    front = label;
                } else {
                    if (label < front) {
                        // Select first one alphabetically
                        front = label;
                    }
                }
            }
        });
        
        // See if any "back"
        var back = '';
        gVideoInputDevices.forEach((device) => {
            var label = device.label;
            if (label.toLowerCase().includes('back')) {
                if (back == '') {
                    back = label;
                } else {
                    if (label < back) {
                        // Select first one alphabetically
                        back = label;
                    }
                }
            }
        });
        
        if (front != '' && back != '') {
            gDeviceConfig.VideoInputDeviceFrontName = front;
            gDeviceConfig.VideoInputDeviceBackName = back;
        } else {
            gDeviceConfig.VideoInputDeviceFrontName = gVideoInputDevices[0].label;
            gDeviceConfig.VideoInputDeviceBackName = gVideoInputDevices[1].label;
        }
    }
    
    window.localStorage.setItem('deviceConfig', JSON.stringify(gDeviceConfig));
    updateDevices();
}

//================================================================================
// Function: updateDevices
//--------------------------------------------------------------------------------
function updateDevices() {
    nedCareLog("updateDevices enter");

    try {
        if (gDeviceConfig.AudioOutputDeviceName != 'default') {
            gAudioOutputDevices.forEach((device) => {
                if (gDeviceConfig.AudioOutputDeviceName === device.label) {
                    nedCareLog("updateDevices: Selecting audio output " + device.label + ": " + device.deviceId);
                    gCurrentAudioOutputDevice = device.deviceId;
                }
            });
        }
    } catch (ex) {
        nedCareLog("updateDevices: Error selecting audio output device.", ex);
    }

    try {
        if (gDeviceConfig.AudioInputDeviceName != 'default') {
            gAudioInputDevices.forEach((device) => {
                if (gDeviceConfig.AudioInputDeviceName === device.label) {
                    nedCareLog("updateDevices: Selecting audio input " + device.label + ": " + device.deviceId);
                    gCurrentAudioInputDevice = device.deviceId;
                }
            });
        }
    } catch (ex) {
        nedCareLog("updateDevices: Error selecting audio input device.", ex);
    }

    try {
        gVideoInputDevices.forEach((device) => {
            // Update video
            if (gDeviceConfig.VideoInputDeviceFrontName === device.label) {
                nedCareLog("updateDevices: Selecting video front camera " + device.label + ": " + device.deviceId);
                gCurrentVideoInputDeviceFront = device.deviceId;
            }
            if (gDeviceConfig.VideoInputDeviceBackName === device.label) {
                nedCareLog("updateDevices: Selecting video back camera " + device.label + ": " + device.deviceId);
                gCurrentVideoInputDeviceBack = device.deviceId;
            }
        });
    } catch (ex) {
        nedCareLog("updateDevices: Error selecting video devices.", ex);
    }
};

//================================================================================
// Function: ShowAccountSetUp
//--------------------------------------------------------------------------------
function ShowAccountSetUp() {
    gInMakeConnection = false;
    $('#makeConnection').hide();
    $('#nedCareDeviceConfig').hide();
    $('#nedCareMainControlPanelAccess').hide();
    $('#configurePWA').show();
    $('#userFirstName').focus();
}

//================================================================================
// Function: ShowMakeConnection
//--------------------------------------------------------------------------------
function ShowMakeConnection() {
    gInMakeConnection = true;
    $('#nedCareDeviceConfig').hide();
    $('#configurePWA').hide();
    $('#nedCareRemoteControlPanelAccess').fadeOut(gFadeTime);
    $('#nedCareLocalControlPanelAccess').fadeOut(gFadeTime, function () {
        $('#makeConnection').fadeIn(gFadeTime, async function () {
            $('#nedCareMainControlPanelAccess').fadeIn(gFadeTime);
        });
    });
}

//================================================================================
// Function: ShowInPanelHeader
//--------------------------------------------------------------------------------
function ShowInPanelHeader(id, msg, duration) {
    if (!gPanelHeaderMessageActive) {
        gPanelHeaderMessageActive = true;
        var el = document.getElementById(id);
        var currentHeader = document.getElementById(id).innerText;
        var newHeader = currentHeader + " (" + msg + ")";
        document.getElementById(id).innerText = newHeader;

        setTimeout(
            function () {
            // Restore header text
            document.getElementById(id).innerText = currentHeader;
            gPanelHeaderMessageActive = false;
        },
            duration);
    } else {
        return;
    }
}

//================================================================================
// Function: swapCameras
//--------------------------------------------------------------------------------
async function swapCameras() {
    // Block swap cameras if monitoring
    if (gResidentMonitoring) {
        Dialog(gDTitle, "Cannot swap cameras when monitoring.");
        return;
    } 
    if (gCurrentVideoInputDeviceBack === null) {
        // Block switch if there is no back camera
        // There is no back camera
        Dialog(gDTitle, "Cannot swap cameras; only one camera currently configured.");
        return;
    }

    if (gFrontCamera) {
        gFrontCamera = false;
        gActiveCameraID = gCurrentVideoInputDeviceBack;
        nedCareLog("Switching to back camera: " + gActiveCameraID);
    } else {
        gFrontCamera = true;
        gActiveCameraID = gCurrentVideoInputDeviceFront;
        nedCareLog("Switching to front camera: " + gActiveCameraID);
    }
    
    try {
        await gMeeting.chooseVideoInputDevice(gActiveCameraID);
    } catch (ex) {
        nedCareLog("swapCameras: Failed to switch/choose video input device")
    }
}

//================================================================================
// Function: processUrlParams
//--------------------------------------------------------------------------------
function processUrlParams(params) {
    nedCareLog("processUrlParams started")
    // var keys = Object.keys(params);
    // for (var i = 0; i < keys.length; i++) {
    //   switch (keys[i]) {
    //   case 'account':
    //     // window.localStorage.setItem('currentAccountNumber', params.account);
    //     break;
    //   case 'call':
    //     break;
    //   case 'callmode':
    //     break;
    //   case 'cell':
    //     break;
    //   case 'dropin':
    //     break;
    //   case 'monitor':
    //     break;
    //   case 'key':
    //     break;
    //   default:
    //     break;
    //   }
    // }

    if (!gCallActive) {
        if ((params.mode === 'dropin') &&
            (params.account === gCurrentAccountData.accountNumber) &&
            (params.cell === gCurrentAccountData.cellNumber)) {
            makeCall(1);
            $("#residentFirstName").html(gCurrentAccountData.residentFirstName);
            $("#makeConnection").fadeOut(gFadeTime, function () {
                // Display an interim message
                $("#callResidentAnnouncement").fadeIn(gFadeTime);
            })
        } else if ((params.mode === 'monitor') &&
            (params.account === gCurrentAccountData.accountNumber) &&
            (params.cell === gCurrentAccountData.cellNumber)) {
            $("#userNedMonitor").trigger("click");
        }
    } else {
        Dialog(gDTitle, "Cannot make a call or monitor while in another call");
    }
}

//================================================================================
// Function: deviceChoicesAvailable
//--------------------------------------------------------------------------------
function deviceChoicesAvailable() {
    // A minimum of three devices are needed
    // AudioIn, AudioOut and VideoIn
    if (gOS === 'iOS') {
        return (false);
    }
    if ((gAudioInputDevices.length > 1) ||
        (gAudioOutputDevices.length > 1) ||
        (gVideoInputDevices.length > 1)) {
        // Give the user the opportunity to choose between devices
        return (true)
    }
}

//================================================================================
// Function: getSupportedConstraints
//--------------------------------------------------------------------------------
function getSupportedConstraints() {
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var constraintListString = "";
    for (const constraint of Object.keys(supportedConstraints)) {
        constraintListString += constraint;
        constraintListString += "<br>";
    }
    return (constraintListString)
}

//================================================================================
// Function: swapPrimarySecondary
//--------------------------------------------------------------------------------
function swapPrimarySecondary() {
    nedCareLog('User Swap Displays clicked');
    if (gResidentMonitoring) {
        Dialog(gDTitle, "Cannot swap displays when monitoring.");
        return;
    }
    if (gLocalOnPrimary) {
        nedCareLog("User Swap Displays start: Local video on Primary");
    } else {
        nedCareLog("User Swap Displays start: Local video on Secondary");
    }
    nedCareLog("Remote video stream: " + gRemoteVideoStream.id);
    nedCareLog("Local video stream: " + gLocalVideoStream.id);
    nedCareLog("Remote video stream srcObject: " + document.getElementById(gRemoteVideo).srcObject.id);
    nedCareLog("Local video stream srcObject: " + document.getElementById(gLocalVideo).srcObject.id);

    if (gLocalOnPrimary) {
        // Move local video to secondary display
        // Make the remote video stream the primary display
        // Move the local video stream to the secondary display
        gLocalVideo = "secondaryVideo";
        gRemoteVideo = "primaryVideo";
        gLocalOnPrimary = false;
    } else {
        // Move local video to primary display
        // Make the local video stream the primary display
        // Move the local video stream to the main display
        gLocalVideo = "primaryVideo";
        gRemoteVideo = "secondaryVideo";
        gLocalOnPrimary = true;
    }

    var playPromise = null;
    document.getElementById(gLocalVideo).srcObject = gLocalVideoStream;
    playPromise = document.getElementById(gLocalVideo).play();
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            nedCareLog('Swap Displays: Local video track restored play promise successful');
        })
        .catch(error => {
            nedCareLog('Swap Displays: Local video track restored play promise failed' + error);
        });
    }
    // Move the remote video stream to the main display
    document.getElementById(gRemoteVideo).srcObject = gRemoteVideoStream;
    playPromise = document.getElementById(gRemoteVideo).play();
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            nedCareLog('Swap Displays: Remote video track restored play promise successful');
        })
        .catch(error => {
            nedCareLog('Swap Displays: Remote video track restored play promise failed' + error);
        });
    }

    if (gLocalOnPrimary) {
        nedCareLog("User Swap Displays end: Local video on Primary");
    } else {
        nedCareLog("User Swap Displays end: Local video on Secondary");
    }

}

//================================================================================
// Function: enableLocalCamera
//--------------------------------------------------------------------------------
async function enableLocalCamera(calledBy) {
    nedCareLog("enableLocalCamera " + calledBy);
    // if (gOS === "iOS") {
    //   return;
    // }
    try {
        nedCareLog("Enable Camera");
        // Display the user's name
        // $('#localName').html(gCurrentAccountData.firstName);
        // Local video has not yet started, so start local video
        nedCareLog("Local video does not yet exist");

        // Control local video presentation
        // Create a custom video track
        // var constraints = {
        //   audio: false,
        //   video: {
        //   width: { min: 640, max: 1280 },
        //   height: { min: 480, max: 720},
        //   // width: { min: 640, max: 1280 },
        //   // height: { min: 720, max: 720},
        //   },
        // };
        // const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        // var tmp = mediaStream.getTracks();
        // const track = mediaStream.getTracks()[0];
        // gLocalVideoStream = new MediaStream([track]);

        try {
            gLocalVideoStream = await gMeeting.getLocalVideoStream();
        } catch (ex) {
            nedCareLog("Error occurred when getting the local video stream in enableLocalCamera: ", ex);
        }
        var vHeight = gLocalVideoStream.getVideoTracks()[0].getSettings().height;
        var vWidth = gLocalVideoStream.getVideoTracks()[0].getSettings().width;
        nedCareLog("Local Video Stream Height Setting: " + vHeight);
        nedCareLog("Local Video Stream Width Setting: " + vWidth);
        gLocalVideo = "secondaryVideo";
        document.getElementById(gLocalVideo).srcObject = gLocalVideoStream;

        var playPromise = document.getElementById(gLocalVideo).play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                nedCareLog('enableLocalCamera: Local video track started promise successful');

                document.getElementById("video0").srcObject = gLocalVideoStream;
                var playPromise2 = document.getElementById("video0").play();
                if (playPromise2 !== undefined) {
                    playPromise2.then(_ => {
                        nedCareLog('Local video track conference started');
                    })
                    .catch(error => {
                        nedCareLog('Local video track conference started promise failed: ' + error);
                    });
                }
                var el = document.getElementById("video0container");
                el.style.display = '';

                $('#nedCareSecondaryVideoContainer').fadeIn(gFadeTime);
                vHeight = gLocalVideoStream.getVideoTracks()[0].getSettings().height;
                vWidth = gLocalVideoStream.getVideoTracks()[0].getSettings().width;
                nedCareLog("Local Video Stream Height Actual: " + vHeight);
                nedCareLog("Local Video Stream Width Actual: " + vWidth);
            })
            .catch(error => {
                nedCareLog('Local video play promise failed: ' + error);
            });
        }

        nedCareLog("Local video started");
        // gRemoteParticipantCount++;

        // User interface styling
        $('.userVideoToggle').removeClass("fa-video-slash");
        $('.userVideoToggle').addClass("fa-video");
        $('.userVideoToggle').trigger("blur");
    } catch (ex) {
        nedCareLog("Error occurred when trying to acquire video stream", ex);
    }
};

//================================================================================
// Function: getConfigFromServer
//--------------------------------------------------------------------------------
async function getConfigFromServer(caller) {
    nedCareLog("Get config from server enter: " + caller);
    NedConnectLib.NedCareAction(
        {
            action: 'getConfig',
            accountId: gCurrentAccountData.accountNumber,
            cellNumber: gCurrentAccountData.cellNumber,
            firstName: gCurrentAccountData.firstName
        },
        function (result) {
            gSetupData = JSON.parse(JSON.stringify(result.data));
            gCurrentAccountData.validated = true;
            nedCareLog("SUCCESS getConfigFromServer, Local, remote audio volume: " + gSetupData.Volume + ", " + gRemoteAvState.audioVolume);
            gCurrentAccountData.audioVolume = gSetupData.Volume;
            gRemoteAvState.audioVolume = gSetupData.Volume;
            if (gSetupData.ShowContact) {
                gCurrentAccountData.showContactButtons = true;
            }
            
            // If this user has forceCall enabled
            // Then show both buttons, otherwise just show the primary button
            // Also check camMode/monitor while here
            for (var i = 0; i < gSetupData.Contacts.length; i++) {
                if (gSetupData.Contacts[i].FirstName == gCurrentAccountData.firstName) {
                    if (gSetupData.Contacts[i].ForceCall) {
                        gCurrentAccountData.forceCall = true;
                    } else {
                        gCurrentAccountData.forceCall = false;
                    }
                    if (gSetupData.Contacts[i].CamMode) {
                        gCurrentAccountData.monitor = true;
                    } else {
                        gCurrentAccountData.monitor = false;
                    }
                }
            }
            
            // Save Resident first and last name, contacts
            gCurrentAccountData.residentFirstName = gSetupData.FirstName;
            gCurrentAccountData.residentLastName = gSetupData.LastName;
            gCurrentAccountData.contacts = JSON.stringify(gSetupData.Contacts);
            window.localStorage.setItem(gCurrentAccountData.accountNumber, JSON.stringify(gCurrentAccountData));
            gTogglePower = gSetupData.TogglePower;
            var now = moment();
            var expiry = moment.unix(gSetupData.DoNotDisturb);
            var expiryTime = expiry.format('LLL');
            if (expiry <= now) {
                $('#dndBanner').hide();
                $('#dndBannerContent').html("");
            } else {
                $('#dndBannerContent').html("Do Not Disturb active until " + expiryTime);
                $('#dndBanner').show();
            }
            $('#doNotDisturbSettings').hide();
            if (gTogglePower && gCurrentAccountData.forceCall) {
                // DJC
                $('#userPower').show();
            }
            $('#accountNumber').html("Account Number: " + gCurrentAccountData.accountNumber);
            $('#cellNumber').html("Cell Number: " + gCurrentAccountData.cellNumber);
            MakeContactButtons();
            MakeMessageButtons();
            MakeSayButtons();
            MakeAccountSelector();
            ResetResidentDeviceControls();
            // var remoteAvStateString = JSON.stringify(gRemoteAvState);
            // SendResidentDeviceSettings(remoteAvStateString, gRemoteAvState);
            // Show the resident contact button
            // $('#makeConnection').fadeIn(gFadeTime);
            if (!gCallActive) {
                ShowMakeConnection();
            }
        },
        function (errors) {
            Dialog("Error", errors);
        },
        false
    );
    nedCareLog("Get config from server exit: " + caller);
}

//================================================================================
// Function: SendResidentDeviceSettings
//--------------------------------------------------------------------------------
function SendResidentDeviceSettings(remoteAvStateString, oldgRemoteAvState) {
    NedConnectLib.NedCareAction(
        {
            action: 'remoteControl',
            accountId: gCurrentAccountData.accountNumber,
            cellNumber: gCurrentAccountData.cellNumber,
            control: remoteAvStateString
        },
        function (result) {
            nedCareLog("Resident Audio/Video remote control Success");
        },
        function (errors) {
            // revert to prior values
            gRemoteAvState = oldgRemoteAvState;
            Dialog("Error", errors);
        },
        true
    );
}

//================================================================================
// Function: ResetResidentDeviceControls
//--------------------------------------------------------------------------------
function ResetResidentDeviceControls() {
    nedCareLog("Resetting Resident Device Controls");
    gRemoteAvState = {
        audioMute: 0,
        audioVolume: gCurrentAccountData.audioVolume,
        videoMute: 0,
        videoBrightness: 1.0,
        videoContrast: 1.0
    };
    // Ensure that the panel matches the state
    $('.userRemoteMicrophoneMuteToggle').addClass("fa-microphone");
    $('.userRemoteMicrophoneMuteToggle').removeClass("fa-microphone-slash");
    $('.userRemoteMicrophoneMuteToggle').removeClass("userRemoteAudioIsMuted");
    $('.userRemoteVideoToggle').addClass("fa-video");
    $('.userRemoteVideoToggle').removeClass("fa-video-slash");
    $('.userRemoteVideoToggle').removeClass("userRemoteVideoIsMuted");
}

//================================================================================
// Function: MakeContactButtons
//--------------------------------------------------------------------------------
function MakeContactButtons() {
    nedCareLog('MakeContactButtons: Start');
    var htmlString = "";
    var htmlStringContactButtons = "";

    // Title block
    htmlString += '<div class="ned-title has-text-weight-semibold has-text-centered is-size-4 mt-2">';
    htmlString += '<div>Make a Connection</div>';
    htmlString += '<div class="is-size-5 mt-1">Use the button to set up a call';
    // htmlString += '<div class="is-size-5 mt-2">Use the button to set up a call with ' + gSetupData.FirstName;
    htmlString += '</div>';
    htmlString += '</div>';

    gHtmlString1 = '';
    gHtmlString2 = '';

    // Make the personal button for the Resident
    htmlString += '<div class="columns is-multiline is-mobile is-centered mt-3" id="userPersonalButtons">';
    // htmlString += '<div id="userPersonalButtons"></div>';
    gHtmlString1 += '<div class="column has-text-centered is-6">';
    gHtmlString1 += '<div class="mt-1" id="selfConnectWith">';
    gHtmlString1 += '<button class="button nedcare-big-button has-text-weight-semibold nedcareConnect" id="nedCareSelf">';
    gHtmlString1 += 'Call ' + gCurrentAccountData.residentFirstName;
    gHtmlString1 += '</button>';
    gHtmlString1 += '</div>';
    gHtmlString1 += '</div>';
    if (gCurrentAccountData.forceCall) {
        gHtmlString2 += '<div class="column has-text-centered is-6" id="selfForceConnect">';
        gHtmlString2 += '<div>';
        gHtmlString2 += '<button class="button nedcare-big-button has-text-weight-semibold nedcareConnect" id="nedCareCallback">';
        gHtmlString2 += 'Drop-in on ' + gCurrentAccountData.residentFirstName;
        gHtmlString2 += '</button>';
        gHtmlString2 += '</div>';
        gHtmlString2 += '</div>';
    }
    htmlString += '</div>';

    // dummy comment

    // Contact button header
    htmlStringContactButtons += '<div class="ned-title has-text-weight-semibold has-text-centered is-size-3 mt-6">';
    htmlStringContactButtons += '<div>Dev Connections</div>';
    htmlStringContactButtons += '</div>';

    htmlStringContactButtons += '<div class="has-text-weight-semibold mt-6 mb-2 is-size-5">Connect ' + gSetupData.FirstName + " and</div>";
    // Make the button for a forced call
    htmlStringContactButtons += '<div class="level is-mobile form-wrapper">';
    htmlStringContactButtons += '<div class="level-item">';
    htmlStringContactButtons += '<div class="mt-4"><button class="button nedcare-button has-text-weight-semibold nedcareConnect"';
    htmlStringContactButtons += ' id="nedCareForce">';
    htmlStringContactButtons += 'Connect to ' + gCurrentAccountData.firstName;
    htmlStringContactButtons += '</button></div>';
    htmlStringContactButtons += '</div></div>';

    // Make the buttons for the contact list
    for (var i = 0; i < gSetupData.Contacts.length; i = i + 2) {
        htmlStringContactButtons += '<div class="level is-mobile">';
        htmlStringContactButtons += '<div class="level-item">';
        htmlStringContactButtons += '<div class="mt-4"><button class="button nedcare-button has-text-weight-semibold nedcareConnect"';
        htmlStringContactButtons += 'id="nedCare' + i + '">';
        htmlStringContactButtons += gSetupData.Contacts[i].FirstName;
        htmlStringContactButtons += '</button></div>';
        htmlStringContactButtons += '</div>';
        if ((i + 1) < gSetupData.Contacts.length) {
            htmlStringContactButtons += '<div class="level-item">';
            htmlStringContactButtons += '<div class="mt-4"><button class="button nedcare-button has-text-weight-semibold nedcareConnect"';
            htmlStringContactButtons += 'id="nedCare' + (i + 1) + '">';
            htmlStringContactButtons += gSetupData.Contacts[i + 1].FirstName;
            htmlStringContactButtons += '</button></div>';
            htmlStringContactButtons += '</div>';
        }
        htmlStringContactButtons += '</div>';
    }

    $('#connectButtons').html(htmlString);
    if (gCurrentAccountData.forceCall) {
        $('#userPersonalButtons').html(gHtmlString1 + gHtmlString2);
    } else {
        $('#userPersonalButtons').html(gHtmlString1);
    }
    $('#contactButtons').html(htmlStringContactButtons);

    // Connect buttons handler
    $('.nedcareConnect').click(async function () {
        nedCareLog("nedCareConnect click enter");
        if (gCallActive) {
            // Cannot make a second call while currently in a call
            return;
        }
        var checkLocal = checkDeviceLocalStorage();
        if ((!checkLocal) && (deviceChoicesAvailable())) {
            nedCareLog("Connect attempt without devices configured, configuring now")
            try {
                await configDevices("nedcareConnect");
            } catch (ex) {
                nedCareLog("Error occurred when trying to config local devices in connect buttons handler", ex);
            }
        } else {
            gCallActive = true;
            // gRingTone = new Audio("./img/ring-01.mp3");
            gRingTone = new Audio(gRingSound);
            gRingTone.loop = true;
            gRingTone.play();
            var cellNumber = '';
            nedCareLog('nedcareConnect clicked.');
            nedCareLog('Name: ' + this.id);
            var buttonId = this.id;
            var name = '';
            buttonId = buttonId.slice(7); // remove "nedCare" from front of ID
            nedCareLog('buttonId: ' + buttonId);
            var forced = 0;
            if (buttonId == 'Self') {
                cellNumber = gCurrentAccountData.cellNumber;
                name = gCurrentAccountData.firstName;
                $('#nedCareSelf').html('Connecting you now');
                $('#nedCareSelf').addClass('nedcare-big-button-animation');
            } else if (buttonId == 'Callback') {
                cellNumber = gCurrentAccountData.cellNumber;
                name = gCurrentAccountData.firstName;
                forced = 1;
                $('#nedCareCallback').addClass('nedcare-big-button-animation');
            } else if (buttonId == 'Force') {
                cellNumber = gCurrentAccountData.cellNumber;
                name = gCurrentAccountData.firstName;
                forced = 1;
                $('#nedCareForce').html('Calling ' + gCurrentAccountData.residentFirstName);
                $('#nedCareForce').addClass('nedcare-big-button-animation');
            } else {
                var index = parseInt(buttonId, 10);
                nedCareLog('Name: ' + gSetupData.Contacts[index].FirstName);
                name = gSetupData.Contacts[index].FirstName;
                nedCareLog('Cell: ' + gSetupData.Contacts[index].CellNumber);
                cellNumber = gSetupData.Contacts[index].CellNumber;
            }

            nedCareLog('CellNumber: ' + cellNumber);

            makeCall(forced);
        }
    }); // end nedcareConnect').click(function()

} // end function MakeContactButtons

//================================================================================
// Function: makeCall
//--------------------------------------------------------------------------------
async function makeCall(forced) {
    nedCareLog("Make Call enter");
    $('#userHangup').show();
    // await updateDevices(false);
    NedConnectLib.NedCareAction(
        {
            action: 'makeCall',
            accountId: gCurrentAccountData.accountNumber,
            cellNumber: gCurrentAccountData.cellNumber,
            forceCall: forced,
            firstName: gCurrentAccountData.promptName,
            os: gOS
        },
        function (result) {
            var data = JSON.parse(JSON.stringify(result.data));
            gRoomName = data.roomName;
            gAccessToken = data.accessToken;
            gRoomLink = data.roomLink;
            gCallActive = true;
            nedCareLog("nedCareConnect: Making a call to room link: " + gRoomLink);
            $('#nedCareForce').removeClass('nedcare-big-button-animation');
            $('#nedCareCallback').removeClass('nedcare-big-button-animation');
            $('#nedCareSelf').removeClass('nedcare-big-button-animation');
            $('#userNedCareSayMessageButton').removeClass('nedcare-big-button-animation');
            // $('#nedCareMainControlPanel').fadeOut(gFadeTime);
            // $('#nedCareMainControlPanelAccess').fadeOut(gFadeTime);
            joinMeeting(gRoomName, gRoomLink, gAccessToken);
            $('#callResidentAnnouncement').fadeOut(gFadeTime);
        },
        function (errors) {
            gRingTone.pause();
            Dialog("Error", "Sorry, but we are unable to make a connection. Please wait a minute and try again.");
            gCallActive = false;
            $('#nedCareForce').html('Connect to ' + gCurrentAccountData.residentFirstName);
            $('#nedCareSelf').html('Call ' + gCurrentAccountData.residentFirstName);
            // Ensure all buttons are returned to their quiescent state
            $('#nedCareSelf').removeClass('nedcare-big-button-animation');
            $('#nedCareForce').removeClass('nedcare-big-button-animation');
            $('#nedCareCallback').removeClass('nedcare-big-button-animation');
            $('#userNedCareSayMessageButton').removeClass('nedcare-big-button-animation');
            $('#nedCareSelf').trigger("blur");
            $('#nedCareForce').trigger("blur");
            $('#nedCareCallback').trigger("blur");
            $('#userNedCareSayMessageButton').trigger("blur");
            $('#makeConnection').fadeIn(gFadeTime);
            $('#nedCareMainControlPanelAccess').fadeIn(gFadeTime);
            $('#logoHeader').fadeIn(gFadeTime);
        },
        true
    );
}

//================================================================================
// Function: checkDeviceLocalStorage
//--------------------------------------------------------------------------------
function checkDeviceLocalStorage() {
    nedCareLog("checkDeviceLocalStorage enter");
    if (gOS === 'iOS') {
        return (true);
    } else {
        var localData = true;
        var tmp = JSON.parse(window.localStorage.getItem(gCurrentAccountData.accountNumber));
        var deviceId = tmp.VideoInputDeviceFront;
        if ((deviceId === '') || (deviceId === 'None') || (deviceId === 'null') || (deviceId === null)) {
            localData = false;
            nedCareLog("checkDeviceLocalStorage: Video Input Device Front missing")
        }
        var deviceId = tmp.VideoInputDeviceBack;
        if ((deviceId === '') || (deviceId === 'None') || (deviceId === 'null') || (deviceId === null)) {
            localData = false;
            nedCareLog("checkDeviceLocalStorage: Video Input Device Back missing")
        }
        deviceId = tmp.AudioInputDevice;
        if ((deviceId === '') || (deviceId === 'None') || (deviceId === 'null') || (deviceId === null)) {
            localData = false;
            nedCareLog("checkDeviceLocalStorage: Audio Input Device missing")
        }
        deviceId = tmp.AudioOutputDevice;
        if ((deviceId === '') || (deviceId === 'None') || (deviceId === 'null') || (deviceId === null)) {
            localData = false;
            nedCareLog("checkDeviceLocalStorage: Audio Output Device missing")
        }
        return (localData);
    }
}

//================================================================================
// Function: checkMobileOs
// https://gist.github.com/mpakus/3865317
//--------------------------------------------------------------------------------
function checkMobileOs() {
    var userAgent = navigator.userAgent.toLowerCase();
    nedCareLog("checkMobileOs.User Agent: '" + userAgent + "'");
    
    if (userAgent.match(/(ipad|iphone|ipod|mac)/i)) {
        gOS = "iOS";
    } else if(userAgent.indexOf("android") > -1) {
        gOS = "Android";
    } else {
        gOS = "desktop";
    }
    
    nedCareLog("checkMobileOs: " + gOS);
}

//================================================================================
// Function: resizeSecondaryVideo
//--------------------------------------------------------------------------------
function resizeSecondaryVideo(scale) {
    var secondaryHeight = $("#secondaryVideo").height();
    var secondaryWidth = $("#secondaryVideo").width();
    var primaryHeight = $("#primaryVideo").height();
    var primaryWidth = $("#primaryVideo").width();

    // Get the display width
    var windowWidth = window.innerWidth;
    nedCareLog("Resize Videos, innerWidth: " + windowWidth);
    // Calculate remote video width as a percentage of the screen width
    var primaryVideoWidth = (100 * primaryWidth) / windowWidth;
    nedCareLog("Resize Videos, remote video display width: " + primaryVideoWidth);
    // Set the width of the local video to scale% of the width of the remote video
    var newWidth = Math.floor(scale * primaryVideoWidth).toString() + "vw";
    nedCareLog("Resize Videos, new width: " + newWidth);
    $('#nedCareSecondaryVideoContainer').width(newWidth);
}

//================================================================================
// Function: stopButtonAnimations
//--------------------------------------------------------------------------------
function stopButtonAnimations() {
    $('#nedCareSelf').removeClass('nedcare-big-button-animation');
    $('#nedCareForce').removeClass('nedcare-big-button-animation');
    $('#nedCareCallback').removeClass('nedcare-big-button-animation');
    $('#userNedCareSayMessageButton').removeClass('nedcare-big-button-animation');
    $('#nedCareSelf').trigger("blur");
    $('#nedCareForce').trigger("blur");
    $('#nedCareCallback').trigger("blur");
    $('#userNedCareSayMessageButton').trigger("blur");
}

//================================================================================
// Function: fadeOutAllVideoElements
//--------------------------------------------------------------------------------
function fadeOutAllVideoElements(main, video, controls) {
    // By Group
    // Connect / main screen
    // Video containers
    // Control panels and their access buttons
    if (main) {
        $('#logoHeader').fadeOut(gFadeTime);
        $('#makeConnection').fadeOut(gFadeTime);
        $('#nedCareMainControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareMainControlPanel').fadeOut(gFadeTime);
        $('#nedCareEntertainmentControlPanel').fadeOut(gFadeTime);
    }
    if (video) {
        $('#nedCareVideoContainer').fadeOut(gFadeTime);
        $('#nedCareVideoConferenceContainer').fadeOut(gFadeTime);
        $('#nedCareRemoteControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareRemoteControlPanel').fadeOut(gFadeTime);
        $('#nedCareLocalControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareLocalControlPanel').fadeOut(gFadeTime);
    }
    if (controls) {
        $('#nedCareMainControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareMainControlPanel').fadeOut(gFadeTime);
        $('#nedCareEntertainmentControlPanel').fadeOut(gFadeTime);
        $('#nedCareRemoteControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareRemoteControlPanel').fadeOut(gFadeTime);
        $('#nedCareLocalControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareLocalControlPanel').fadeOut(gFadeTime);
    }
}

//================================================================================
// Function: ChooseLayout
//--------------------------------------------------------------------------------
function ChooseLayout(count) {
    nedCareLog("ChooseLayout: " + count);
    if (count <= 2) {
        // Use the original layout
        gRemoteVideoConferenceTarget = "secondaryVideo";
        $('#nedCareVideoConferenceContainer').fadeOut(gFadeTime, function () {
            $('#nedCareVideoContainer').fadeIn(gFadeTime);
            $('#nedCareLocalControlPanelAccess').fadeIn(gFadeTime);
            $('#nedCareRemoteControlPanelAccess').fadeIn(gFadeTime);
        });
        // If participants have left, don't forget to re-assign the streams to primaryVideo
    } else {
        // Use the conference layout
        gRemoteVideoConferenceTarget = "video1";
        $('#nedCareVideoContainer').fadeOut(gFadeTime, function () {
            $('#nedCareVideoConferenceContainer').fadeIn(gFadeTime);
            $('#nedCareLocalControlPanelAccess').fadeIn(gFadeTime);
            $('#nedCareRemoteControlPanelAccess').fadeIn(gFadeTime);
        });
    }
}

//================================================================================
// Function: resetVideoClasses
//--------------------------------------------------------------------------------
function resetVideoClasses() {
    // Remove any extraneous classes from the video containers
    // gPrimaryVideoClasses = document.getElementById("primaryVideo").classList;
    // gSecondaryVideoClasses = document.getElementById("secondaryVideo").classList;
    // gConferenceVideoClasses = document.getElementById("video0container").classList;

    // Primary Video
    var curClasses = document.getElementById("nedCarePrimaryVideoContainer").classList;
    var theClasses = [];
    for (var j = 0; j < curClasses.length; j++) {
        theClasses.push(curClasses[j]);
    }
    for (var j = 0; j < theClasses.length; j++) {
        // Remove all current classes
        document.getElementById("nedCarePrimaryVideoContainer").classList.remove(theClasses[j]);
    }
    for (var i = 0; i < gPrimaryVideoClasses.length; i++) {
        // Restore original classes
        document.getElementById("nedCarePrimaryVideoContainer").classList.add(gPrimaryVideoClasses[i]);
    }

    // Secondary Video
    curClasses = document.getElementById("nedCareSecondaryVideoContainer").classList;
    theClasses = [];
    for (var j = 0; j < curClasses.length; j++) {
        theClasses.push(curClasses[j]);
    }
    for (var j = 0; j < theClasses.length; j++) {
        document.getElementById("nedCareSecondaryVideoContainer").classList.remove(theClasses[j]);
    }
    for (var i = 0; i < gPrimaryVideoClasses.length; i++) {
        document.getElementById("nedCareSecondaryVideoContainer").classList.add(gPrimaryVideoClasses[i]);
    }

    // Conference Video
    var confVideos = ["video0container", "video1container", "video2container", "video3container"];
    for (var k = 0; k < confVideos.length; k++) {
        // For each video container
        curClasses = document.getElementById(confVideos[k]).classList;
        theClasses = [];
        for (var j = 0; j < curClasses.length; j++) {
            theClasses.push(curClasses[j]);
        }
        for (var j = 0; j < theClasses.length; j++) {
            document.getElementById(confVideos[k]).classList.remove(theClasses[j]);
        }
        for (var i = 0; i < gConferenceVideoClasses.length; i++) {
            document.getElementById(confVideos[k]).classList.add(gConferenceVideoClasses[i]);
            document.getElementById(confVideos[k]).style.display = 'none';
        }
    }

}

//================================================================================
// Function: meetingCleanup
//--------------------------------------------------------------------------------
async function meetingCleanup() {
    nedCareLog("Meeting cleanup enter");

    try {
        nedCareLog("Meeting cleanup: leaveMeeting");
        await gMeeting.leaveMeeting();
    } catch (ex) {
        nedCareLog("Meeting cleanup: leaveMeeting error: " + ex);
    }
    try {
        nedCareLog("Meeting cleanup: stopAudio");
        await gMeeting.stopAudio();
    } catch (ex) {
        nedCareLog("Meeting cleanup: stopAudio error: " + ex);
    }
    try {
        nedCareLog("Meeting cleanup: stopVideo");
        await gMeeting.stopVideo();
    } catch (ex) {
        nedCareLog("Meeting cleanup: stopVideo error: " + ex);
    }

    restoreMainScreenAfterCall();

    // Reset the filters
    gBrightness = 1.0;
    gContrast = 1.0;
    var primaryVideoDisplay = document.getElementById("primaryVideo");
    $(primaryVideoDisplay).css({
        "filter": "brightness(" + gBrightness + ") contrast(" + gContrast + ")"
    });

    // reset the meeting object and the globals
    gMeeting = 0;
    gMeeting = new Metered.Meeting();
    // DJC
    // await updateDevices(false);
    // getDevices();
    resetVideoClasses();

    gResidentMonitorPermitted = false;
    gResidentMonitoring = false;
    gLocalVideo = "secondaryVideo";
    gRemoteVideo = "primaryVideo";
    gRemoteVideoStream = null;
    gCameraOn = true;
    gAudioOn = false;
    gCallActive = false;
    gFrontCamera = true;
    gRemoteParticipantCount = 1;

    // ensure that the position of the secondaryVideo is restored
    // In case the user has repositioned it during the call
    $(secondaryVideo).css({
        "top": "3px"
    });
    $(secondaryVideo).css({
        "left": "3px"
    });

    // Ensure that the remote controls are reset
    ResetResidentDeviceControls();
    // var remoteAvStateString = JSON.stringify(gRemoteAvState);
    // SendResidentDeviceSettings(remoteAvStateString, gRemoteAvState);
}

//================================================================================
// Function: restoreMainScreenAfterCall
//--------------------------------------------------------------------------------
function restoreMainScreenAfterCall() {
    nedCareLog("Restore main screen after a call");
    // Fade out the video, video controls, and restore the call buttons and header
    $('#nedCareLocalControlPanel').fadeOut(gFadeTime);
    $('#nedCareLocalControlPanelAccess').fadeOut(gFadeTime);
    $('#nedCareRemoteControlPanel').fadeOut(gFadeTime);
    $('#nedCareRemoteControlPanelAccess').fadeOut(gFadeTime);
    $('#secondary-video-mute').fadeOut(gFadeTime);
    $('#secondary-audio-mute').fadeOut(gFadeTime);
    $('#nedCareDeviceConfig').fadeOut(gFadeTime);
    $('#callResidentAnnouncement').fadeOut(gFadeTime);
    $('#nedCareVideoContainer').fadeOut(gFadeTime, function () {
        $('#nedCareVideoConferenceContainer').fadeOut(gFadeTime, async function () {

            // Clean up html animations, button labels
            $('#nedCareSelf').removeClass('nedcare-big-button-animation');
            $('#nedCareCallback').removeClass('nedcare-big-button-animation');
            $('#nedCareForce').removeClass('nedcare-big-button-animation');
            $('#nedCareSelf').html('Call ' + gCurrentAccountData.residentFirstName);
            $('#nedCareCallback').html('Drop-in on ' + gCurrentAccountData.residentFirstName);

            // Ensure mute buttons are left in their default state
            $('.userVideoToggle').removeClass("fa-video-slash");
            $('.userVideoToggle').addClass("fa-video");
            $('.userMicrophoneMuteToggle').removeClass("fa-microphone-slash");
            $('.userMicrophoneMuteToggle').addClass("fa-microphone");

            // TWO-PARTY CLEANUP
            gLocalVideoStream = null;
            if ($('#primaryVideo')[0].srcObject !== null) {
                $('#primaryVideo')[0].srcObject = null;
            }
            if ($('#secondaryVideo')[0].srcObject !== null) {
                $('#secondaryVideo')[0].srcObject = null;
            }

            // CONFERENCE CLEANUP
            if ($('#video0')[0].srcObject !== null) {
                $('#video0')[0].srcObject = null;
            }
            if ($('#video1')[0].srcObject !== null) {
                $('#video1')[0].srcObject = null;
            }
            if ($('#video2')[0].srcObject !== null) {
                $('#video2')[0].srcObject = null;
            }
            if ($('#video3')[0].srcObject !== null) {
                $('#video3')[0].srcObject = null;
            }
            if ($('#audio0')[0].srcObject !== null) {
                $('#audio0')[0].srcObject = null;
            }
            if ($('#audio1')[0].srcObject !== null) {
                $('#audio1')[0].srcObject = null;
            }
            if ($('#audio2')[0].srcObject !== null) {
                $('#audio2')[0].srcObject = null;
            }
            if ($('#audio3')[0].srcObject !== null) {
                $('#audio3')[0].srcObject = null;
            }

            $('#makeConnection').fadeIn(gFadeTime);
            $('#nedCareMainControlPanelAccess').fadeIn(gFadeTime);
            $('#logoHeader').fadeIn(gFadeTime);
            if ((gCurrentAccountData.monitor) && (gResidentMonitorPermitted)) {
                // Restore visibility for next call
                $('#nedCareSecondaryVideoContainer').fadeIn(gFadeTime);
            }
        })
    })
}


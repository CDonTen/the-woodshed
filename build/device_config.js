//================================================================================
// Function: configDevices
//--------------------------------------------------------------------------------
async function configDevices(caller) {
    nedCareLog('Config Devices: Enter: ' + caller);
    // if (gOS === "iOS") {
    //   // seed the device list
    //   // Redundant (already done on app start) but seems to stabilize iOS devices
    //   // Use the iOS device defaults
    //   // DJC should this be updateDevices instead?
    //   // getDevices(configDevices);
    //   updateDevices(configDevices);
    //   setCurrentDeviceStatus();
    //   if (gCurrentAccountData.configured) {
    //     $('#nedCareRemoteControlPanelAccess').fadeOut(gFadeTime);
    //     $('#nedCareConferenceContainer').fadeOut(gFadeTime);
    //     $('#nedCareVideoConferenceContainer').fadeOut(gFadeTime);
    //     $('#nedCareLocalControlPanelAccess').fadeOut(gFadeTime, function () {
    //       $('#makeConnection').fadeIn(gFadeTime, async function () {
    //         // await updateDevices(false);
    //       })
    //     })
    //   } else {
    //     nedCareLog('Config Devices failed: ' + caller);
    //   }
    //   return;
    // }

    updateDevices(false);
    $("#userSaveDeviceConfiguration").prop('disabled', true);
    $('#nedCareAuthCode').fadeOut(gFadeTime);
    $('#configurePWA').fadeOut(gFadeTime);
    $('#makeConnection').fadeOut(gFadeTime, function () {
        $('#nedCareDeviceConfig').fadeIn(gFadeTime);
    });

    try {
        // Wait for user input for selecting devices
        await configAudioVideo(caller);
    } catch (ex) {
        nedCareLog("Error occurred when trying to config local audio video in config devices: ", ex);
    }
};

//================================================================================
// Function: ShowVideo
//--------------------------------------------------------------------------------
async function ShowVideo(deviceId, elementName) {
    var stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: {
                    exact: deviceId
                }
            }
        });
    } catch (ex) {
        nedCareLog("Error occurred in camera preview: " + ex);
    }
    
    var playPromise = null;
    document.getElementById(elementName).srcObject = stream;
    playPromise = document.getElementById(elementName).play();
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            nedCareLog('ShowVideo successful');
        })
        .catch(error => {
            nedCareLog('ShowVideo play promise failed: ' + error);
        });
    }
}

//================================================================================
// Function: configAudioVideo
//--------------------------------------------------------------------------------
async function configAudioVideo(caller) {
    nedCareLog("configAudioVideo: Enter: " + caller);
    var errorString = "";
    var cameraFront = false;
    var cameraBack = false;
    var frontCameraName = gDeviceConfig.VideoInputDeviceFrontName;
    var backCameraName = gDeviceConfig.VideoInputDeviceBackName;
    var audioInput = gDeviceConfig.AudioInputDeviceName;
    var audioOutput = gDeviceConfig.AudioOutputDeviceName;
    
    // Configure device option selectors
    let cameraOptionsFront = [];
    //cameraOptionsFront.push('<option value="default">Select Front Camera</option>');
    for (let device of gVideoInputDevices) {
        cameraOptionsFront.push(`<option value="${device.deviceId}">${device.label}</option>`);
    }
    $("#cameraIDfront").html(cameraOptionsFront.join(""));

    let cameraOptionsBack = [];
    //cameraOptionsBack.push('<option value="default">Select Back Camera</option>');
    for (let device of gVideoInputDevices) {
        cameraOptionsBack.push(`<option value="${device.deviceId}">${device.label}</option>`);
    }
    $("#cameraIDback").html(cameraOptionsBack.join(""));

    if (gOS == "desktop") {
        let microphoneOptions = [];
        //microphoneOptions.push('<option value="default">Select Microphone</option>');
        for (let device of gAudioInputDevices) {
            microphoneOptions.push(`<option value="${device.deviceId}">${device.label}</option>`);
        }
        $("#microphoneID").html(microphoneOptions.join(""));
        if (audioInput != 'default') {
            $("#microphoneID").val(gCurrentAudioInputDevice);
        }
        
        let speakerOptions = [];
        //speakerOptions.push('<option value="default">Select Speaker</option>');
        for (let device of gAudioOutputDevices) {
            speakerOptions.push(`<option value="${device.deviceId}">${device.label}</option>`);
        }
        $("#speakerID").html(speakerOptions.join(""));
        if (audioOutput != 'default') {
            $("#speakerID").val(gCurrentAudioOutputDevice);
        }
        $("#microphoneIDSelect").show();
        $("#speakerIDSelect").hide();
    } else {
        $("#microphoneIDSelect").hide();
        $("#speakerIDSelect").hide();
    }
    
    NedLibUtils.Spinner(true);
    
    if (gVideoInputDevices.length >= 1) {
        $("#cameraIDfront").val(gCurrentVideoInputDeviceFront);
        await ShowVideo(gCurrentVideoInputDeviceFront, "setupVideo");
        $("#cameraIDfrontSelect").show();
    } else {
        $("#cameraIDfrontSelect").hide();
    }

    if (gVideoInputDevices.length >= 2) {
        $("#cameraIDback").val(gCurrentVideoInputDeviceBack);
        await ShowVideo(gCurrentVideoInputDeviceBack, "setupVideo2");
        $("#cameraIDbackSelect").show();
    } else {
        $("#cameraIDbackSelect").hide();
    }
    NedLibUtils.Spinner(false);

    $("#userSaveDeviceConfiguration").prop('disabled', false);
    
    // Selecting different cameras
    $("#cameraIDfront").on("change", async function (value) {
        const deviceId = $("#cameraIDfront").val();
        const deviceName = $("#cameraIDfront option:selected").text();
        nedCareLog("Video front change: " + deviceName);
        nedCareLog("Video front change: " + deviceId);
        
        // If we are not in an active call, camera preview using setupVideo
        if (deviceId !== "default") {
            //$("#userDeviceConfigMessage").html("Accessing camera...");
            if (!gCallActive) {
                var stream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            deviceId: {
                                exact: deviceId
                            }
                        }
                    });
                } catch (ex) {
                    nedCareLog("Error occurred in camera preview: " + ex);
                }
                var playPromise = null;
                document.getElementById("setupVideo").srcObject = stream;
                playPromise = document.getElementById("setupVideo").play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        nedCareLog('Setup front camera successful');
                        frontCameraName = deviceName;
                    })
                    .catch(error => {
                        nedCareLog('Setup front camera play promise failed: ' + error);
                    });
                }
            }
            //$("#userDeviceConfigMessage").html("");
        } else {
            nedCareLog("Cannot preview the default front camera");
        }
    });

    $("#cameraIDback").on("change", async function (value) {
        const deviceId = $("#cameraIDback").val();
        const deviceName = $("#cameraIDback option:selected").text();
        nedCareLog("Video back change: " + deviceName);
        nedCareLog("Video back change: " + deviceId);
        
        // If we are not in an active call, camera preview using setupVideo
        if (deviceId !== "default") {
            //$("#userDeviceConfigMessage").html("Accessing camera...");
            if (!gCallActive) {
                var stream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            deviceId: {
                                exact: deviceId
                            }
                        }
                    });
                } catch (ex) {
                    nedCareLog("Error occurred in camera preview: " + ex);
                }
                var playPromise = null;
                document.getElementById("setupVideo2").srcObject = stream;
                playPromise = document.getElementById("setupVideo2").play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        nedCareLog('Setup back camera successful');
                        backCameraName = deviceName;
                    })
                    .catch(error => {
                        nedCareLog('Setup back camera play promise failed: ' + error);
                    });
                }
            }
            //$("#userDeviceConfigMessage").html("");
        } else {
            nedCareLog("Cannot preview the default back camera");
        }
    });

    // Setting different microphone
    $("#microphoneID").on("change", async function (value) {
        const deviceId = $("#microphoneID").val();
        const deviceName = $("#microphoneID option:selected").text();
        audioInput = deviceName;
        nedCareLog("Microphone on change: " + deviceId);
    });

    // Setting different speaker
    $("#speakerID").on("change", async function (value) {
        const deviceId = $("#speakerID").val();
        const deviceName = $("#speakerID option:selected").text();
        audioOutput = deviceName;
        nedCareLog("Speaker on change: " + deviceId);
    });

    // Save results
    $('#userSaveDeviceConfiguration').click(async function () {
        nedCareLog('User Save Device Configuration clicked.');
        document.getElementById("setupVideo").pause();
        document.getElementById("setupVideo").srcObject = null;
        document.getElementById("setupVideo2").pause();
        document.getElementById("setupVideo2").srcObject = null;
        
        gDeviceConfig.VideoInputDeviceFrontName = frontCameraName;
        gDeviceConfig.VideoInputDeviceBackName = backCameraName;
        gDeviceConfig.AudioInputDeviceName = audioInput;
        gDeviceConfig.AudioOutputDeviceName = audioOutput;
        
        window.localStorage.setItem('deviceConfig', JSON.stringify(gDeviceConfig));
        updateDevices();
        
        $('#nedCareDeviceConfig').fadeOut(gFadeTime, function () {
            if (gCallActive) {
                nedCareLog("Save device configuration during active call: " + caller);
            } else {
                if (gCurrentAccountData.validated) {
                    nedCareLog("configAudioVideo: Account validated: " + caller);
                    ShowMakeConnection();
                } else {
                    nedCareLog("configAudioVideo: Account not validated: " + caller);
                    $('#nedCareRemoteControlPanelAccess').fadeOut(gFadeTime);
                    $('#nedCareLocalControlPanelAccess').fadeOut(gFadeTime, function () {
                        ShowAccountSetUp();
                    })
                }
            }
        });
    })
    nedCareLog("configAudioVideo: Exit: " + caller + "Configured: " + gCurrentAccountData.configured);

}; // end configAudioVideo

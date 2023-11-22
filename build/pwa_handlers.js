//================================================================================
// Function: addHandlers
//--------------------------------------------------------------------------------
function addHandlers() {
    // =====================
    // Video button handlers
    // =====================

    // Reposition secondary video start
    var $dragging = null;
    $('#secondaryVideo').on("mousedown", function (e) {
        // nedCareLog("Mousedown Start: " + $(this).attr("id"));
        e.preventDefault();
        $(this).attr('unselectable', 'on').addClass('draggable');
        var el_w = $('.draggable').outerWidth();
        var el_h = $('.draggable').outerHeight();
        $('#secondaryVideo').on("mousemove", function (e) {
            // nedCareLog("Mousemove: " + $(this).attr("id"));
            e.preventDefault();
            if ($dragging) {
                gSecondaryScreenTop = e.pageY - el_h / 2;
                gSecondaryScreenLeft = e.pageX - el_w / 2;
                $dragging.offset({
                    top: gSecondaryScreenTop,
                    left: gSecondaryScreenLeft
                });
            }
        });
        $dragging = $(e.target);
    });

    $('#secondaryVideo').on("mouseup", function (e) {
        e.preventDefault();
        $dragging = null;
        $(this).removeAttr('unselectable');
        $(this).removeClass('draggable');
    });

    // https://developer.mozilla.org/en-US/docs/Web/API/Touch/pageX
    // https://stackoverflow.com/questions/12336639/javascript-drag-from-mouse-position
    $('#secondaryVideo').on("touchstart", function (e) {
        // nedCareLog("Touch Start: " + $(this).attr("id"));
        e.preventDefault();
        $(this).attr('unselectable', 'on').addClass('draggable');
        var el_w = $('.draggable').outerWidth();
        var el_h = $('.draggable').outerHeight();
        // nedCareLog("Width, Height:" + el_w + "," + el_h);
        var left = e.targetTouches[0].pageX - $(this).offset().left;
        var top = e.targetTouches[0].pageY - $(this).offset().top;
        // nedCareLog("Left, top: " + left + ", " + top);

        $('#secondaryVideo').on("touchmove", function (e) {
            e.preventDefault();
            if ($dragging) {
                var x = e.originalEvent.touches[0].pageX;
                var y = e.originalEvent.touches[0].pageY;
                // nedCareLog("Touch Move touches: " + x + ", " + y);
                gSecondaryScreenLeft = e.originalEvent.touches[0].pageX - left;
                gSecondaryScreenTop = e.originalEvent.touches[0].pageY - top
                    $('#secondaryVideo').css({
                    "left": gSecondaryScreenLeft + "px",
                    "top": gSecondaryScreenTop + "px",
                });
            }
        });
        $dragging = $(e.target);
    });

    $('#secondaryVideo').on("touchend", function (e) {
        nedCareLog("Touch End");
        e.preventDefault();
        gXScreenPos = 100 * (gSecondaryScreenLeft / gScreenWidth);
        if (gXScreenPos < 1) {
            gXScreenPos = 1;
        }
        if (gXScreenPos > 70) {
            gXScreenPos = 66;
        }
        gYScreenPos = 100 * (gSecondaryScreenTop / gScreenHeight);
        if (gYScreenPos < 1) {
            gYScreenPos = 1;
        }
        if (gYScreenPos > 70) {
            gYScreenPos = 66;
        }
        // nedCareLog("Secondary screen position: " + gXScreenPos +", " + gYScreenPos);
        $dragging = null;
        $(this).removeAttr('unselectable');
        $(this).removeClass('draggable');
    });
    // Reposition secondary video end

    $(".nedClick").on("click", function () {
        // Button press sound
        gPressTone = new Audio(gButtonSound);
        gPressTone.play();
    });

    $("#userHangup").on("click", function () {
        nedCareLog("User Hangup clicked");

    });

    $("#userScreenShare").on("click", async function () {
        nedCareLog("Screen share");
        if (gOS === 'desktop') {
            try {
                await gMeeting.startScreenShare();
                gScreenSharing = true;
            } catch (ex) {
                nedCareLog("Error occurred when trying to share screen: ", ex);
            }
        } else {
            Dialog(gDTitle, "Screen sharing is only supported on the desktop.")
        }
    });

    $("#nedCareEntertainmentTrigger").on("click", async function () {
        nedCareLog("Remote desktop trigger");
        if ((!gBlockRemoteDesktopOnMobile) || (gOS === 'desktop')) {
            $("#nedCareEntertainmentControlPanel").fadeIn(gFadeTime);
        } else {
            Dialog(gDTitle, "Remote desktop is only supported on the desktop.")
        }
    });

    $("#nedCareEntertainmentControlPanelClose").on("click", async function () {
        nedCareLog("Remote desktop features close");
        if ((!gBlockRemoteDesktopOnMobile) || (gOS === 'desktop')) {
            $("#nedCareEntertainmentControlPanel").fadeOut(gFadeTime);
        } else {
            Dialog(gDTitle, "Remote desktop is only supported on the desktop.")
        }
    });

    $(".nedcare-entertainment").on("click", async function () {
        nedCareLog("Entertainment clicked");
        var target = this.id;
        nedCareLog("Button ID: " + target);
        if ((!gBlockRemoteDesktopOnMobile) || (gOS === 'desktop')) {
            nedCareLog("Starting remote desktop");
            NedConnectLib.NedCareAction({
                action: 'remoteDesktop',
                accountId: gCurrentAccountData.accountNumber,
                cellNumber: gCurrentAccountData.cellNumber
            },
                function (result) {
                nedCareLog("Starting: " + target);
                var data = JSON.parse(JSON.stringify(result.data));
                var url = data.url;
                if (url === undefined) {
                    url = "http://openwrt2.neducation.ca:" + data.information + "/nedcare.html";
                    url += "?autoconnect=true&resize=scale";
                }

                NedLibUtils.Spinner(true);
                setTimeout(
                    function () {
                    NedLibUtils.Spinner(false);

                    if (gIframeTest) {
                        $('#iframeTest').attr('src', url);
                        $('#iframeTest').show();
                    } else {
                        window.open(url, '_blank');
                    }
                },
                    3000);

                nedCareLog("Sending URL command");
                NedConnectLib.NedCareAction({
                    action: 'url',
                    accountId: gCurrentAccountData.accountNumber,
                    cellNumber: gCurrentAccountData.cellNumber,
                    url: target
                },
                    function (result) {
                    // var data = JSON.parse(JSON.stringify(result.data));
                    // Dialog("Success", "URL sent.");
                },
                    function (errors) {
                    Dialog("Error", errors);
                });
            },
                function (errors) {
                nedCareLog("User configure failure");
                Dialog("Error", errors);
                ShowConfigure();
            },
                false)
        } else {
            Dialog(gDTitle, "Remote desktop is only supported on the desktop.")
        }
    });

    $("#nedCareBackToNedCare").on("click", async function () {
        nedCareLog("Back to NedCare clicked");
        NedConnectLib.NedCareAction({
            action: 'restartChrome',
            accountId: gCurrentAccountData.accountNumber,
            cellNumber: gCurrentAccountData.cellNumber
        },
            function (result) {
            showInfoMessage("NedCare restored", 3000);
            // Dialog("Success", "URL sent.");
        },
            function (errors) {
            Dialog("Error", errors);
        },
            true);
    });

    $("#nedCareRemoteDesktop").on("click", async function () {
        nedCareLog("Remote desktop clicked");
        if ((!gBlockRemoteDesktopOnMobile) || (gOS === 'desktop')) {
            nedCareLog("Remote desktop started");
            NedConnectLib.NedCareAction({
                action: 'remoteDesktop',
                accountId: gCurrentAccountData.accountNumber,
                cellNumber: gCurrentAccountData.cellNumber
            },
                function (result) {
                nedCareLog("Remote desktop created");
                var data = JSON.parse(JSON.stringify(result.data));
                var url = data.url;
                if (url === undefined) {
                    url = "http://openwrt2.neducation.ca:" + data.information + "/nedcare.html";
                    url += "?autoconnect=true&resize=scale";
                }

                NedLibUtils.Spinner(true);
                setTimeout(
                    function () {
                    NedLibUtils.Spinner(false);
                    if (gIframeTest) {
                        $('#iframeTest').attr('src', url);
                        $('#iframeTest').show();
                    } else {
                        window.open(url, '_blank');
                    }
                },
                    3000);

            },
                function (errors) {
                nedCareLog("User configure failure");
                Dialog("Error", errors);
                ShowConfigure();
            },
                false)
        } else {
            Dialog(gDTitle, "Remote desktop is only supported on the desktop.")
        }
    });

    $("#userSelectedAccount").on("change", async function (value) {
        const accountNumber = $("#userSelectedAccount").val();
        const residentFirstName = $("#userSelectedAccount option:selected").text();
        nedCareLog("Changing to account: " + residentFirstName + ", " + accountNumber);
        gCurrentAccountData.accountNumber = accountNumber;
        window.localStorage.setItem("currentAccountNumber", gCurrentAccountData.accountNumber);
        gCurrentAccountData = JSON.parse(window.localStorage.getItem(gCurrentAccountData.accountNumber));
        // Update the UI
        MakeContactButtons();
        MakeMessageButtons();
        MakeSayButtons();
    });

    $("#userClearDebugLog").on("click", function () {
        gDebugString = "";
        $('#debugMessages').html(gDebugString);
    });

    $("#userClearLocalStorage").on("click", function () {
        nedCareLog("Clear everything from local storage");
        nedCareLog("Devices before clearing: ")
        var tmp = JSON.parse(window.localStorage.getItem(gCurrentAccountData.accountNumber));
        nedCareLog("VideoInputDeviceFront: " + tmp.VideoInputDeviceFront);
        nedCareLog("VideoInputDeviceBack: " + tmp.VideoInputDeviceBack);
        nedCareLog("AudioInputDevice: " + tmp.AudioInputDevice);
        nedCareLog("AudioOutputDevice: " + tmp.AudioOutputDevice);
        nedCareLog("VideoInputDeviceFrontName: " + tmp.VideoInputDeviceFrontName);
        nedCareLog("VideoInputDeviceBackName: " + tmp.VideoInputDeviceBackName);
        nedCareLog("AudioInputDeviceName: " + tmp.AudioInputDeviceName);
        nedCareLog("AudioOutputDeviceName: " + tmp.AudioOutputDeviceName);

        window.localStorage.clear();

    });

    $("#userPrintDevices").on("click", function () {
        var tmp = JSON.parse(window.localStorage.getItem(gCurrentAccountData.accountNumber));
        nedCareLog("VideoInputDeviceFrontName: " + tmp.VideoInputDeviceFrontName);
        nedCareLog("VideoInputDeviceBackName: " + tmp.VideoInputDeviceBackName);
        nedCareLog("AudioInputDeviceName: " + tmp.AudioInputDeviceName);
        nedCareLog("AudioOutputDeviceName: " + tmp.AudioOutputDeviceName);
        nedCareLog("VideoInputDeviceFront: " + tmp.VideoInputDeviceFront);
        nedCareLog("VideoInputDeviceBack: " + tmp.VideoInputDeviceBack);
        nedCareLog("AudioInputDevice: " + tmp.AudioInputDevice);
        nedCareLog("AudioOutputDevice: " + tmp.AudioOutputDevice);
    });

    $("#userSwitchCameras").on("click", async function () {
        nedCareLog('User Switch Camera clicked');
        swapCameras();
    });

    // Also switch cameras by tapping/clicking on the secondary video
    // DEPRECATED ONCE THE PWA SUPPORTED DRAGGING THE VIDEO TO A NEW POSITION
    // $("#secondaryVideo").on("click", async function () {
    //   nedCareLog('Secondary Video clicked');
    //   swapCameras();
    // });

    $("#primaryVideo").on("click", async function () {
        nedCareLog('Primary Video clicked');
        var currentVis = document.getElementById("nedCareLocalControlPanelAccess").style.display;
        if (currentVis === "none") {
            // Control panel is active
            $('#nedCareLocalControlPanel').fadeOut(gFadeTime);
            $('#nedCareLocalControlPanelAccess').fadeIn(gFadeTime);
        } else {
            $('#nedCareLocalControlPanel').fadeIn(gFadeTime);
            $('#nedCareLocalControlPanelAccess').fadeOut(gFadeTime);
        }
    });

    $("#userSwapDisplays").on("click", async function () {
        nedCareLog('User Swap Displays clicked');
        swapPrimarySecondary();
    });

    $("#userVideoToggle").on("click", async function () {
        nedCareLog('User Camera State clicked: ' + gCameraOn);
        // Video stream
        if (gCameraOn) {
            // camera is currently on, pause camera
            try {
                await gMeeting.pauseLocalVideo();
            } catch (ex) {
                nedCareLog("Error occurred when trying to pause local video: ", ex);
            }
            gCameraOn = false;
            nedCareLog("Local video paused");
            $('.userVideoToggle').removeClass("fa-video");
            $('.userVideoToggle').addClass("fa-video-slash");

            $('#secondary-video-mute').show();
        } else {
            // toggling camera on
            // if local video already exists then just resume
            nedCareLog("Local video already exists");
            try {
                await gMeeting.resumeLocalVideo();
            } catch (ex) {
                nedCareLog("Error occurred when trying to resume local video: ", ex);
            }
            gCameraOn = true;
            nedCareLog("Local video resumed");
            $('.userVideoToggle').addClass("fa-video");
            $('.userVideoToggle').removeClass("fa-video-slash");
            $('#secondary-video-mute').hide();
        }
    });

    $("#userMicrophoneMuteToggle").on("click", async function () {
        nedCareLog('User Microphone State clicked.');

        if (!gAudioOn) {
            nedCareLog("userMicrophoneMuteToggle: Microphone button, Must start audio");
            // must enable meeting audio
            try {
                await gMeeting.startAudio();
            } catch (ex) {
                nedCareLog("Error occurred when trying to start audio: ", ex);
            }
            // Clean up button
            $('.userMicrophoneMuteToggle').addClass("fa-microphone");
            $('.userMicrophoneMuteToggle').removeClass("fa-microphone-slash");
            $('#secondary-audio-mute').hide();
            gMicrophoneMuted = false;
            gAudioOn = true;
        } else {
            if (gMicrophoneMuted) {
                // Unmute microphone
                nedCareLog("userMicrophoneMuteToggle: Unmuting local microphone");
                try {
                    await gMeeting.unmuteLocalAudio();
                } catch (ex) {
                    nedCareLog("Error occurred when trying to unmute local audio: ", ex);
                }
                gMicrophoneMuted = false;
                $('.userMicrophoneMuteToggle').addClass("fa-microphone");
                $('.userMicrophoneMuteToggle').removeClass("fa-microphone-slash");
                $('#secondary-audio-mute').hide();
            } else {
                // Mute microphone
                nedCareLog("userMicrophoneMuteToggle: Muting local microphone");
                gMeeting.muteLocalAudio();
                gMicrophoneMuted = true;
                $('#secondary-audio-mute').show();
                $('.userMicrophoneMuteToggle').removeClass("fa-microphone");
                $('.userMicrophoneMuteToggle').addClass("fa-microphone-slash");
            }
        }
        // Deselect the button
        $('.userMicrophoneMuteToggle').trigger("blur");
        $('#userMicrophoneMuteToggle').trigger("blur");
    });

    $('#userDeviceSettings').on("click", async function () {
        nedCareLog('User Device Settings clicked.');
        // if (gOS === "iOS") {
        //   Dialog(gDTitle, "Your device does not support setting your device configuration.");
        //   return;
        // }
        // Used while in an active call, therefore add the config
        // to the bottom of the screen
        // if (gOS !== "desktop") {
        //   $('#audioSelectors').hide();
        // }
        // DJC Hide the current video too?
        if (deviceChoicesAvailable()) {
            $('#nedCareDeviceConfig').fadeIn(gFadeTime, async function () {
                try {
                    await configDevices("userDeviceSettings");
                } catch (ex) {
                    nedCareLog("Error occurred when trying to config local devices in user device settings: ", ex);
                }
            });
        }
    });

    $('#userDeviceSettingsMain').on("click", async function () {
        nedCareLog('User Device Settings Main clicked.');
        // if (gOS === "iOS") {
        //   Dialog(gDTitle, "Your device does not support setting your device configuration.");
        //   return;
        // }
        // From the main call screen
        if (deviceChoicesAvailable()) {
            $('#nedCareMainControlPanel').fadeOut(gFadeTime);
            $('#makeConnection').fadeOut(gFadeTime, function () {
                nedCareLog("Main: Fade out makeConnection");
                // if (gOS !== "desktop") {
                //   $('#audioSelectors').hide();
                // }
                $('#nedCareDeviceConfig').fadeIn(gFadeTime, async function () {
                    try {
                        await configDevices("userDeviceSettingsMain");
                    } catch (ex) {
                        nedCareLog("Error occurred when trying to config local devices in user device settings Main: ", ex);
                    }
                })
            })
        }
    });

    $('#userMeetingLeave').on("click", async function () {
        nedCareLog('User Meeting Leave clicked.');
        meetingCleanup();
    });

    $("#nedCareLocalControlPanelAccess").on("click", function () {
        $('#nedCareLocalControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareRemoteControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareLocalControlPanel').fadeIn(gFadeTime);
    });

    $("#userControlPanelClose").on("click", function () {
        $('#nedCareLocalControlPanel').fadeOut(gFadeTime);
        $('#nedCareLocalControlPanelAccess').fadeIn(gFadeTime);
        $('#nedCareRemoteControlPanelAccess').fadeIn(gFadeTime);
    });

    $("#nedCareRemoteControlPanelAccess").on("click", function () {
        $('#nedCareLocalControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareRemoteControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareRemoteControlPanel').fadeIn(gFadeTime);
    });

    $("#userRemoteControlPanelClose").on("click", function () {
        $('#nedCareRemoteControlPanel').fadeOut(gFadeTime);
        $('#nedCareRemoteControlPanelAccess').fadeIn(gFadeTime);
        $('#nedCareLocalControlPanelAccess').fadeIn(gFadeTime);
    });

    $("#nedCareMainControlPanelAccess").on("click", function () {
        nedCareLog("User main control panel access clicked");
        $('#nedCareMainControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareMainControlPanel').fadeIn(gFadeTime);
    });

    $("#nedCareMainControlPanelClose").on("click", function () {
        $('#nedCareMainControlPanel').fadeOut(gFadeTime);
        // Also fade out entertainment, if open
        $('#nedCareEntertainmentControlPanel').fadeOut(gFadeTime);
        $('#nedCareMainControlPanelAccess').fadeIn(gFadeTime);
    });

    $(".userResidentControl").on("click", function () {
        var subaction = $(this).attr("id");
        nedCareLog("User Resident Control clicked: " + subaction);
        var oldgRemoteAvState = gRemoteAvState;
        var headerString = "";

        // **********
        // control types
        // **********
        // userRemoteVideoToggle
        // userRemotePrimaryDimmer
        // userRemotePrimaryBrighter
        // userRemoteMicrophoneMuteToggle
        // userRemoteAudioDown
        // userRemoteAudioUp
        // **********
        switch (subaction) {
        case 'userRemoteVideoToggle':
            var el = document.getElementsByClassName("userRemoteVideoToggle")[0];
            if ($(el).hasClass("userRemoteVideoIsMuted")) {
                $('.userRemoteVideoToggle').addClass("fa-video");
                $('.userRemoteVideoToggle').removeClass("fa-video-slash");
                $('.userRemoteVideoToggle').removeClass("userRemoteVideoIsMuted");
            } else {
                $('.userRemoteVideoToggle').addClass("fa-video-slash");
                $('.userRemoteVideoToggle').removeClass("fa-video");
                $('.userRemoteVideoToggle').addClass("userRemoteVideoIsMuted");
            }
            if (gRemoteAvState.videoMute === 0) {
                gRemoteAvState.videoMute = 1;
                headerString = "Mute Video";
            } else {
                gRemoteAvState.videoMute = 0;
                headerString = "Show Video"
            }
            break;
        case 'userRemotePrimaryDimmer':
            gRemoteAvState.videoBrightness -= gBrightnessStep;
            if (gRemoteAvState.videoBrightness <= gFilterMin) {
                gRemoteAvState.videoBrightness = gFilterMin;
            }
            headerString = Math.round(100 * gRemoteAvState.videoBrightness) + "%";
            break;
        case 'userRemotePrimaryBrighter':
            gRemoteAvState.videoBrightness += gBrightnessStep;
            if (gRemoteAvState.videoBrightness >= gFilterMax) {
                gRemoteAvState.videoBrightness = gFilterMax;
            }
            headerString = Math.round(100 * gRemoteAvState.videoBrightness) + "%";
            break;
        case 'userRemoteContrastDown':
            gRemoteAvState.videoContrast -= gContrastStep;
            if (gRemoteAvState.videoContrast <= gFilterMin) {
                gRemoteAvState.videoContrast = gFilterMin;
            }
            headerString = Math.round(100 * gRemoteAvState.videoContrast) + "%";
            break;
        case 'userRemoteContrastUp':
            gRemoteAvState.videoContrast += gContrastStep;
            if (gRemoteAvState.videoContrast >= gFilterMax) {
                gRemoteAvState.videoContrast = gFilterMax;
            }
            headerString = Math.round(100 * gRemoteAvState.videoContrast) + "%";
            break;
        case 'userRemoteMicrophoneMuteToggle':
            var el = document.getElementsByClassName("userRemoteMicrophoneMuteToggle")[0];
            if ($(el).hasClass("userRemoteAudioIsMuted")) {
                $('.userRemoteMicrophoneMuteToggle').addClass("fa-microphone");
                $('.userRemoteMicrophoneMuteToggle').removeClass("fa-microphone-slash");
                $('.userRemoteMicrophoneMuteToggle').removeClass("userRemoteAudioIsMuted");
            } else {
                $('.userRemoteMicrophoneMuteToggle').addClass("fa-microphone-slash");
                $('.userRemoteMicrophoneMuteToggle').removeClass("fa-microphone");
                $('.userRemoteMicrophoneMuteToggle').addClass("userRemoteAudioIsMuted");
            }
            if (gRemoteAvState.audioMute === 0) {
                gRemoteAvState.audioMute = 1;
                headerString = "Mute Audio";
            } else {
                gRemoteAvState.audioMute = 0;
                headerString = "Play Audio";
            }
            break;
        case 'userRemoteAudioDown':
            gRemoteAvState.audioVolume -= gVolumeStep;
            if (gRemoteAvState.audioVolume <= gVolumeMin) {
                gRemoteAvState.audioVolume = gVolumeMin;
            }
            headerString = gRemoteAvState.audioVolume + "%";
            break;
        case 'userRemoteAudioUp':
            gRemoteAvState.audioVolume += gVolumeStep;
            if (gRemoteAvState.audioVolume >= gVolumeMax) {
                gRemoteAvState.audioVolume = gVolumeMax;
            }
            headerString = gRemoteAvState.audioVolume + "%";
            break;
        case 'userRemoteRestoreDefaults':
            ResetResidentDeviceControls();
            headerString = "Defaults Restored"
                break;
        default:
            break;
        }

        var remoteAvStateString = JSON.stringify(gRemoteAvState);
        if (!gPanelHeaderMessageActive) {
            if (gDuplicateOnLocal) {
                // Two participant display
                var secondaryVideoDisplay = document.getElementById("secondaryVideo");
                $(secondaryVideoDisplay).css({
                    "filter": "brightness(" + gRemoteAvState.videoBrightness + ") contrast(" + gRemoteAvState.videoContrast + ")"
                });
                // Video conference
                secondaryVideoDisplay = document.getElementById(gRemoteVideoConferenceTarget);
                $(secondaryVideoDisplay).css({
                    "filter": "brightness(" + gRemoteAvState.videoBrightness + ") contrast(" + gRemoteAvState.videoContrast + ")"
                });
            }
            ShowInPanelHeader("userRemoteHeader", headerString, 1250);
            SendResidentDeviceSettings(remoteAvStateString, oldgRemoteAvState);
        }

    });

    $("#userPrimaryDimmer").on("click", function () {
        if (!gPanelHeaderMessageActive) {
            gBrightness -= gBrightnessStep;
            if (gBrightness <= 0) {
                gBrightness = 0;
            }
            nedCareLog("Dim the primary video: " + gBrightness + ", " + gContrast);
            var primaryVideoDisplay = document.getElementById("primaryVideo");
            $(primaryVideoDisplay).css({
                "filter": "brightness(" + gBrightness + ") contrast(" + gContrast + ")"
            });
            primaryVideoDisplay = document.getElementById(gRemoteVideoConferenceTarget);
            $(primaryVideoDisplay).css({
                "filter": "brightness(" + gBrightness + ") contrast(" + gContrast + ")"
            });
            ShowInPanelHeader("userLocalHeader", Math.round(100 * gBrightness) + "%", 1250);
        }
    });

    $("#userPrimaryBrighter").on("click", function () {
        if (!gPanelHeaderMessageActive) {
            gBrightness += gBrightnessStep;
            if (gBrightness >= gFilterMax) {
                gBrightness = gFilterMax;
            }
            nedCareLog("Brighten the primary video: " + gBrightness + ", " + gContrast);
            var primaryVideoDisplay = document.getElementById("primaryVideo");
            $(primaryVideoDisplay).css({
                "filter": "brightness(" + gBrightness + ") contrast(" + gContrast + ")"
            });
            primaryVideoDisplay = document.getElementById(gRemoteVideoConferenceTarget);
            $(primaryVideoDisplay).css({
                "filter": "brightness(" + gBrightness + ") contrast(" + gContrast + ")"
            });
            ShowInPanelHeader("userLocalHeader", Math.round(100 * gBrightness) + "%", 1250);
        }
    });

    $("#userPrimaryContrastDown").on("click", function () {
        if (!gPanelHeaderMessageActive) {
            gContrast -= gContrastStep;
            if (gContrast < 0) {
                gContrast = 0;
            }
            nedCareLog("Decrease primary video contrast: " + gBrightness + ", " + gContrast);
            var primaryVideoDisplay = document.getElementById("primaryVideo");
            $(primaryVideoDisplay).css({
                "filter": "brightness(" + gBrightness + ") contrast(" + gContrast + ")"
            });
            primaryVideoDisplay = document.getElementById(gRemoteVideoConferenceTarget);
            $(primaryVideoDisplay).css({
                "filter": "brightness(" + gBrightness + ") contrast(" + gContrast + ")"
            });
            ShowInPanelHeader("userLocalHeader", Math.round(100 * gContrast) + "%", 1250);
        }
    });

    $("#userPrimaryContrastUp").on("click", function () {
        if (!gPanelHeaderMessageActive) {
            gContrast += gContrastStep;
            if (gContrast >= gFilterMax) {
                gContrast = gFilterMax;
            }
            nedCareLog("Increase primary video contrast: " + gBrightness + ", " + gContrast);
            var primaryVideoDisplay = document.getElementById("primaryVideo");
            $(primaryVideoDisplay).css({
                "filter": "brightness(" + gBrightness + ") contrast(" + gContrast + ")"
            });
            primaryVideoDisplay = document.getElementById(gRemoteVideoConferenceTarget);
            $(primaryVideoDisplay).css({
                "filter": "brightness(" + gBrightness + ") contrast(" + gContrast + ")"
            });
            ShowInPanelHeader("userLocalHeader", Math.round(100 * gContrast) + "%", 1250);
        }
    });

    // ======= END VIDEO ==========

    // Configure PWA buttons
    $('#userConfigure').click(function () {
        nedCareLog('userConfigure clicked.');
        if (CheckReady()) {
            nedCareLog("Ready to register contact");
            //$('#configurePWA').hide();
            NedConnectLib.NedCareAction(
                {
                    action: 'registerContact',
                    accountId: gCurrentAccountData.accountNumber,
                    cellNumber: gCurrentAccountData.cellNumber,
                    firstName: gCurrentAccountData.firstName
                },
                function (result) {
                    nedCareLog("User configure success");
                    // Success, display message that "NedCare Code" is being texted to the cell number, open dialog for entry of received code
                    // Dialog(gDTitle, "Success. A NedCare security code will now be texted to your cell phone. Please enter the code in the field below.");
                    $('#configurePWA').hide();
                    $('#nedCareAuthCode').show();
                    $('#userNedCareAuthCode').focus();
                    // save numbers to local storage
                    // DJC Is the account truly validated at this point?
                    window.localStorage.setItem(gCurrentAccountData.accountNumber, JSON.stringify(gCurrentAccountData));
                },
                function (errors) {
                    nedCareLog("User configure failure");
                    Dialog("Error", errors);
                    //ShowConfigure();
                },
                false
            );
        } else {
            Dialog('Error', 'Please complete all fields');
        }
    });

    $('#userOtpConfirm').click(function () {
        nedCareLog('OTP confirm clicked.');
        CheckOTP();
    });

    $('#userOtpResend').click(function () {
        nedCareLog('OTP resend clicked.');
        ResendOTP();
    });

    $('#nedCareImage').click(function () {
        nedCareLog('nedCare Image clicked.');
        // Set user identity
        var userID = 'Connected as: ' + gCurrentAccountData.firstName + ' ' + gCurrentAccountData.lastName;
        $('#userID').html(userID);

        if (gShowingNedCareControls === 'false') {
            $('#nedCareControls').show();
            $('#debugMessagesContainer').show();
            gShowingNedCareControls = 'true';
        } else {
            $('#nedCareControls').hide();
            $('#makeConnectionDev').hide();
            $('#nedCareCallSchedule').hide();
            $('#nedCareReminderSchedule').hide();
            $('#nedCareTelevisionControls').hide();
            $('#debugMessagesContainer').hide();
            gShowingNedCareControls = 'false';
            gShowingDevTools = 'false';
        }
    });

    $('#userRestartDevice').click(function () {
        nedCareLog('User Restart Device clicked.');
        if (gTogglePower) {
            NedConnectLib.NedCareAction({
                action: 'togglePower',
                accountId: gCurrentAccountData.accountNumber,
                cellNumber: gCurrentAccountData.cellNumber
            },
                function (result) {
                Dialog(gDTitle, "Restart Device command sent. The device is restarting and will be available for a call in approximately two minutes.");
            },
                function (errors) {
                Dialog("Error", errors);
            },
                false)
        } else {
            Dialog(gDTitle, "The Restart Device command is disabled for your account.");
        }
    });

    $('#userDoNotDisturb').click(function () {
        nedCareLog('Do Not Disturb clicked.');
        $('#nedCareMainControlPanel').fadeOut(gFadeTime, function () {
            $('#doNotDisturbSettings').toggle();
        })
    });

    $('#userNedMonitor').click(function () {
        nedCareLog('NedCam clicked.');
        if (gCurrentAccountData.monitor) {
            gResidentMonitorPermitted = true;
            NedConnectLib.NedCareAction({
                action: 'makeCall',
                accountId: gCurrentAccountData.accountNumber,
                cellNumber: gCurrentAccountData.cellNumber,
                forceCall: gCurrentAccountData.forceCall,
                firstName: gCurrentAccountData.firstName,
                os: gOS,
                camMode: gResidentMonitorPermitted
            },
                function (result) {
                var data = JSON.parse(JSON.stringify(result.data));
                gRoomName = data.roomName;
                gAccessToken = data.accessToken;
                gRoomLink = data.roomLink;
                nedCareLog("nedCareConnect: Making a call to room link: " + gRoomLink);
                stopButtonAnimations();
                $('#nedCareMainControlPanel').fadeOut(gFadeTime);
                $('#nedCareMainControlPanelAccess').fadeOut(gFadeTime);
                $('#logoHeader').fadeOut(gFadeTime);
                $('#makeConnection').fadeOut(gFadeTime, function () {
                    joinMeeting(gRoomName, gRoomLink, gAccessToken);
                });
                gResidentMonitoring = true;
                return;
            },
                function (errors) {
                Dialog("Error", errors);
                $('#nedCareForce').html('Connect to ' + gCurrentAccountData.residentFirstName);
                $('#nedCareSelf').html('Call ' + gCurrentAccountData.residentFirstName);
                // Ensure all buttons are returned to their quiescent state
                stopButtonAnimations();
                $('#nedCareVideoConferenceContainer').fadeOut(gFadeTime);
                $('#nedCareVideoContainer').fadeOut(gFadeTime, function () {
                    $('#makeConnection').fadeIn(gFadeTime);
                    $('#nedCareMainControlPanelAccess').fadeIn(gFadeTime);
                    $('#logoHeader').fadeIn(gFadeTime);
                });
            },
                false);
        } else {
            Dialog(gDTitle, "Ned Monitor is not enabled for this account.")
        }
    });

    $('#userHelp').click(function () {
        nedCareLog('User Help clicked.');
        Dialog(gDTitle, "The help system goes here.");
    });

    // DJC STOP REVIEW
    $('#userSubmitDndDuration').click(function () {
        nedCareLog('Submit Do Not Disturb Duration clicked.');
        var gDoNotDisturbDuration = document.getElementById("userDndDuration").value;
        nedCareLog("DND Duration: " + gDoNotDisturbDuration);
        var now = moment();
        var expiryTime = now.clone().add(gDoNotDisturbDuration, 'hours').format('LLL');
        if (gDoNotDisturbDuration == 0) {
            $('#dndBanner').hide();
            $('#dndBannerContent').html("");
        } else {
            now.add(gDoNotDisturbDuration, 'hours')
            $('#dndBannerContent').html("Do Not Disturb active until " + expiryTime);
            $('#dndBanner').show();
        }
        $('#doNotDisturbSettings').hide();
        NedConnectLib.NedCareAction({
            action: 'doNotDisturb',
            accountId: gCurrentAccountData.accountNumber,
            cellNumber: gCurrentAccountData.cellNumber,
            duration: gDoNotDisturbDuration
        },
            function (result) {
            // Dialog(gDTitle, "Do Not Disturb command sent.");
            if (gDoNotDisturbDuration == 0) {
                $('.userDoNotDisturb').removeClass("fa-lock");
                $('.userDoNotDisturb').addClass("fa-lock-open");
            } else {
                $('.userDoNotDisturb').removeClass("fa-lock-open");
                $('.userDoNotDisturb').addClass("fa-lock");
            }
        },
            function (errors) {
            Dialog("Error", errors);
        },
            false)
    });

    $('#userTVSettings').click(function () {
        nedCareLog('User TV Settings clicked.');
        $('#userConfigureTV').show();
        $('#userTVCommand').hide();
    });

    $('#userSubmitTVsettings').click(function () {
        nedCareLog('User TV Settings Submit clicked.');
        // read the values
        var tvSettings = {};
        var tmp = null;
        tmp = document.getElementById('userTVBrand').value;
        tvSettings.Brand = tmp;
        tmp = document.getElementById('userTVSmallVolumeStep').checked;
        if (tmp) {
            tvSettings.VolumeStep = '5';
        } else {
            tvSettings.VolumeStep = '10';
        }
        $('#userConfigureTV').hide();
        $('#userTVCommand').show();
        nedCareLog(tvSettings);
    });

    $('#userCommandTV').click(function () {
        nedCareLog('User Command TV Send clicked.');
        // read the values
        var tvCommand = {};
        var tmp = null;
        tmp = document.getElementById('userTVPowerOn').checked;
        if (tmp) {
            tvCommand.Power = 'On';
        } else {
            tvCommand.Power = 'Off';
        }
        tmp = document.getElementById('userTelevisionVolume').value;
        tvCommand.Volume = tmp;
        tmp = document.getElementById('userTelevisionChannel').value;
        tvCommand.Channel = tmp;
        nedCareLog(tvCommand);
    });

    $('#userReminderScheduleAdd').click(function () {
        nedCareLog('User Reminder Schedule Add clicked.');
        var i = 0;
        var found = false;
        var tmpId = null;
        var name = '';
        // Find and show first currently hidden event
        while (!(found) && (i < gConstReminderEntries)) {
            name = "userEvent" + i;
            tmpId = document.getElementById(name);
            if (window.getComputedStyle(tmpId).display === "none") {
                tmpId.style.display = '';
                found = true;
            } else {
                i++;
            }
        }
    });

    $('.userDeleteEvent').click(function () {
        nedCareLog('Delete Schedule Entry clicked.');
        var tmpId = $(this).attr("id");
        var index = tmpId.substring(15);
        nedCareLog("Delete entry: " + index);
        // Clear the html fields
        ClearEventInputs(index);
        // Clear the stored data for this event
        ClearScheduleData(index);
        // hide the event form
        var name = "userEvent" + index;
        tmpId = document.getElementById(name);
        tmpId.style.display = 'none';
    });

    $('#userReminderScheduleSave').click(function () {
        nedCareLog('User Reminder Schedule Save clicked.');
        var i = 0;
        var found = false;
        var tmpId = null;
        var name = '';
        var scheduleData = {};
        // clear prior event data
        gReminderScheduleData = [];

        // Find and show first currently hidden event form
        for (var i = 0; i < gConstReminderEntries; i++) {
            name = "userEvent" + i;
            tmpId = document.getElementById(name);
            if (window.getComputedStyle(tmpId).display !== "none") {
                // save the data in this schedule entry
                scheduleData = ReadEventInputs(i);
                gReminderScheduleData.push(structuredClone(scheduleData));
            }
        }
    });

    $('#userReminderScheduleLoad').click(function () {
        nedCareLog('User Reminder Schedule Load clicked.');
        var i = 0;
        var found = false;
        var tmpId = null;
        var name = '';
        var scheduleData = {};

        for (var i = 0; i < gReminderScheduleData.length; i++) {
            name = "userEvent" + gReminderScheduleData[i].Index;
            tmpId = document.getElementById(name);
            WriteEventInputs(gReminderScheduleData[i].Index);
            tmpId.style.display = '';
        }
    });

    $('#userManageAccounts').click(function () {
        nedCareLog('User Manage Accounts clicked.');
        // $('#userAccountCards').html(makeAccountCards());
        // $('#nedCareManageAccounts').show();

        // // var buttons = document.getElementById("nedCareManageAccounts").getElementsByClassName("delete-account-card");
        // // for (var i=0; i < buttons.length; i++) {
        // //   var tmpId = buttons[i].id;
        // //   nedCareLog('Button ID: ' + tmpId);
        // //   buttons[i].addEventListener("click", DeleteScheduleEntry, false);
        // // }
        // Dialog(gDTitle, "Account management tool access.")
        // return;

        // Clear the current account number
        window.localStorage.setItem("currentAccountNumber", "");

        // reset the current account data structure
        gCurrentAccountData = {
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
            configured: false
            // AudioInputDevice: "",
            // AudioInputDeviceName: "",
            // AudioOutputDevice: "",
            // AudioOutputDeviceName: "",
            // VideoInputDeviceFront: "",
            // VideoInputDeviceFrontName: "",
            // VideoInputDeviceBack: "",
            // VideoInputDeviceBackName: ""
        };

        // Clear other globals
        gOTPcode = '';
        gHtmlString1 = '';
        gHtmlString2 = '';
        gDoNotDisturbDuration = 0;
        gShowingNedCareControls = false;

        // Clear the input fields
        $('#userFirstName').val("");
        $('#userCellNumber').val("");
        $('#userAccountNumber').val("");
        $('#userNedCareAuthCode').val("");

        // Clear the controls and prepare for a login
        $('#nedCareControls').hide();
        $('#makeConnection').hide();
        $('#makeConnectionDev').hide();
        $('#nedCareCallSchedule').hide();
        $('#nedCareReminderSchedule').hide();
        $('#nedCareTelevisionControls').hide();
        $('#doNotDisturbSettings').hide();
        $('#debugMessagesContainer').hide();
        $('#nedCareMainControlPanel').fadeOut(gFadeTime, function () {
            $('#configurePWA').fadeIn(gFadeTime);
            $('#userFirstName').focus();
        })
    });

    // Simulate clicking on the bluetooth button
    $('#userSimulateButtonClick').click(function () {
        nedCareLog('userSimulateButtonClick clicked.');

        NedConnectLib.NedCareAction({
            action: 'simulateClick',
            accountId: gCurrentAccountData.accountNumber,
            cellNumber: gCurrentAccountData.cellNumber,
            firstName: gCurrentAccountData.firstName
        },
            function (result) {
            Dialog(gDTitle, "Bluetooth button click sent.");
        },
            function (errors) {
            Dialog("Error", errors);
        },
            false)
    });

    // Open Home Assistant
    $('#userOpenHomeAssistant').click(function () {
        nedCareLog('userOpenHomeAssistant clicked.');

        NedConnectLib.NedCareAction({
            action: 'openHomeAssistant',
            accountId: gCurrentAccountData.accountNumber,
            cellNumber: gCurrentAccountData.cellNumber,
            firstName: gCurrentAccountData.firstName
        },
            function (result) {
            var data = JSON.parse(JSON.stringify(result.data));
            NedLibUtils.Spinner(true);
            setTimeout(
                function () {
                NedLibUtils.Spinner(false);
                window.open('http://openwrt2.neducation.ca:' + data.information, '_blank');
            },
                3000);
        },
            function (errors) {
            Dialog("Error", errors);
        },
            false)
    });

    // Open TV Guide
    $('#userTVguide').click(function () {
        nedCareLog('userTVguide clicked.');
        window.open('https://www.tvtv.ca', '_blank');
    });

    $('#userDev').click(function () {
        nedCareLog('userDev clicked.');
        if (gShowingDevTools == 'false') { // currently hidden
            $('#makeConnectionDev').show();
            $('#nedCareCallSchedule').show();
            $('#nedCareReminderSchedule').show();
            $('#nedCareTelevisionControls').show();
            gShowingDevTools = 'true';
        } else { // currently showing dev tools
            $('#makeConnectionDev').hide();
            $('#nedCareCallSchedule').hide();
            $('#nedCareReminderSchedule').hide();
            $('#nedCareTelevisionControls').hide();
            gShowingDevTools = 'false';
        }
    });

    // DJC RESTART REVIEW

    $('.modalClose').click(function () {
        DialogClose(true);
    });

    $('#modalHelp').click(function () {
        DialogClose();
        Help.Show();
    });

    $('#modalButtonYes').click(function () {
        DialogClose();
    });

    $('#modalButtonNo').click(function () {
        DialogClose(true);
    });

    // On page becoming visible, call the server to update the PWA configuration
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            nedCareLog('visibilitychange: Document not visible');
            // do nothing
        } else {
            // call getConfigFromServer to ensure everything is up to date
            if (gInMakeConnection && !gCallActive) {
                nedCareLog("visibilitychange: Getting config from server");
                getConfigFromServer("Visibility change");
                nedCareLog('visibilitychange: Document visible');
            }
        }
    });

    // Window orientation event watcher
    // const portrait = window.matchMedia("(orientation: portrait)").matches;
    // https://dev.to/dcodeyt/the-easiest-way-to-detect-device-orientation-in-javascript-7d7
    window.matchMedia("(orientation: portrait)").addEventListener("change", function (e) {
        const portrait = e.matches;
        // nedCareLog("matchMedia: Change event: Portrait: " + portrait);
        if (portrait) {
            $('#nedCareVideoConferenceColumns').removeClass("is-mobile");
        } else {
            $('#nedCareVideoConferenceColumns').addClass("is-mobile");
        }

        if (gCallActive) {
            var locaHeight = $("#secondaryVideo").height();
            var localWidth = $("#secondaryVideo").width();
            var remoteHeight = $("#primaryVideo").height();
            var remoteWidth = $("#primaryVideo").width();

            gScreenWidth = window.innerWidth;
            gScreenHeight = window.innerHeight;

            $('#secondaryVideo').css({
                "left": gXScreenPos + "vw",
                "top": gYScreenPos + "vh",
            });

            // nedCareLog("Secondary video display height: " + locaHeight);
            // nedCareLog("Secondary video display width: " + localWidth);
            // nedCareLog("Primary video display height: " + remoteHeight);
            // nedCareLog("Primary video display width: " + remoteWidth);

            // var vTracks = gRemoteVideoStream.getVideoTracks()[0];
            // var vTmp = gRemoteVideoStream.getVideoTracks()[0].getSettings();
            // var vHeight = vTmp.height;
            // var vWidth = vTmp.width;
            // // nedCareLog("Remote video stream height: " + vHeight);
            // // nedCareLog("Remote video stream width: " + vWidth);
            // vHeight = gLocalVideoStream.getVideoTracks()[0].getSettings().height;
            // vWidth = gLocalVideoStream.getVideoTracks()[0].getSettings().width;
            // // nedCareLog("Local video stream height: " + vHeight);
            // // nedCareLog("Local video stream width: " + vWidth);
        }
    });
}


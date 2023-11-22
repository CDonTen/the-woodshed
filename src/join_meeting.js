//================================================================================
// Function: joinMeeting
//--------------------------------------------------------------------------------
async function joinMeeting(roomName, roomLink, accessToken) {
    nedCareLog("============");
    nedCareLog("Join Meeting");
    nedCareLog("Room Name: " + roomName);
    nedCareLog("Room link: " + roomLink);

    //if (gOS === "desktop" || gOS === "android") {

    // Always default to the front camera
    var deviceId = gCurrentVideoInputDeviceFront;
    //nedCareLog("Join Meeting: Camera: " + deviceId);
    gFrontCamera = true;
    try {
        await gMeeting.chooseVideoInputDevice(deviceId);
        nedCareLog("Join Meeting: Camera selected: " + deviceId);
    } catch (ex) {
        nedCareLog("Join Meeting: Error when selecting camera: " + deviceId + ", " + ex);
    }
    
    //} else {
    //    nedCareLog("Join Meeting: Using default video.");
    //}

    if (gOS == "desktop") {
        var deviceId = gCurrentAudioInputDevice;
        try {
            await gMeeting.chooseAudioInputDevice(deviceId);
            nedCareLog("Join Meeting: Microphone selected: " + deviceId);
        } catch (ex) {
            nedCareLog("Join Meeting: Error when selecting microphone: " + deviceId + ", " + ex);
        }
    } else {
        nedCareLog("Join Meeting: Using default audio input.");
    }
    
    // ***********************************
    // ***********************************
    // MEETING EVENT HANDLERS
    // localTrackUpdated deprecated?
    // ***********************************
    // ***********************************
    gMeeting.on("localTrackUpdated", function (localTrackItem) {
        nedCareLog("Local track updated: " + localTrackItem.type);
        if (localTrackItem.type == "video") {
            let track = localTrackItem.track;
            let mediaStream = new MediaStream([track]);
            gLocalVideoStream = mediaStream;
            document.getElementById(gLocalVideo).srcObject = gLocalVideoStream;

            var playPromise = document.getElementById(gLocalVideo).play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    nedCareLog('Local video track updated play promise successful');
                })
                .catch(error => {
                    nedCareLog('Local video track updated play promise failed' + error);
                });
            }
            document.getElementById("video0").srcObject = gLocalVideoStream;
            // document.getElementById("video0").srcObject = gLocalVideoStream.clone();
        }
    });

    gMeeting.on("localTrackStarted", async function (trackItem) {
        nedCareLog("Local track started: " + trackItem.type);
        // https://www.metered.ca/docs/Tips-and-Best-Practices
        // streamId is also sent in the speakerInfo object and the first though it is to create video tags on the page and associate them with the streamId and then when the activeSpeaker event is received highlight the video tag of the associated streamId, but this is incorrect because the streamId is for the audio stream, and if you want to highlight the video tag then it will not work.
        // So, you would have to associate the video tag with the participantSessionId or your externalUserId if you have specified one and then find the video tag of the associated id and highlight it.
        $('#logoHeader').fadeOut(gFadeTime);
        $('#nedCareMainControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareMainControlPanel').fadeOut(gFadeTime);
        $('#userHangup').fadeOut(gFadeTime);
        $('#makeConnection').fadeOut(gFadeTime, function () {
            if (trackItem.type == "video") {
                /**
                 * localTrackStarted event emits a MediaStreamTrack
                 * but we cannot assign MediaStreamTrack into the html video tag
                 * hence we are creating MediaStream object, a MediaStream
                 * can be assigned to the html video tag.
                 */
                var playPromise = null;
                var track = trackItem.track;
                var mediaStream = new MediaStream([track]);
                gLocalVideoStream = mediaStream;
                document.getElementById(gLocalVideo).srcObject = gLocalVideoStream;

                playPromise = document.getElementById(gLocalVideo).play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        nedCareLog('L1: Local video track started promise successful: ' + gRemoteParticipantCount);
                        $('#nedCareSecondaryVideoContainer').addClass(gParticipantSessionId);
                        $('#nedCareSecondaryVideoContainer').addClass(trackItem.streamId);
                        // Prefer to use a headset, if available, on Android
                        // if (gOS === 'Android') {
                        //   var name = window.localStorage.getItem("AudioInputDeviceName");
                        //   if (name.startsWith('Headset')) {
                        //   nedCareLog('Setting audio input device to: ' + device.label);
                        //   gMeeting.chooseAudioInputDevice(gCurrentAccountData.AudioInputDevice);
                        //   }
                        // }
                    })
                    .catch(error => {
                        nedCareLog('L2: Local video track started promise failed: ' + gRemoteParticipantCount);
                    });
                }

                var el = document.getElementById("video0");
                el.style.display = '';
                // clone if duplicating
                document.getElementById("video0").srcObject = mediaStream;
                // document.getElementById("video0").srcObject = mediaStream.clone();
                playPromise = document.getElementById("video0").play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        nedCareLog('L3: Local conference video track started promise successful: ' + trackItem.participantSessionId + ", " + trackItem.participantSessionId + ", " + gRemoteParticipantCount);
                        var el = document.getElementById("video0container");
                        el.style.display = '';
                        $('#video0container').addClass(trackItem.participantSessionId);
                        $('#video0container').addClass(trackItem.streamId);
                        // gRemoteParticipantCount++;
                    })
                    .catch(error => {
                        nedCareLog('L4: Local conference video track started promise failed: ' + trackItem.participantSessionId + ", " + trackItem + ", " + gRemoteParticipantCount);
                    });
                }
            }
        });
    });

    gMeeting.on("localTrackStopped", async function (localTrackItem) {
        // DJC Do we need to do all of this? Or does "leave meeting" handle everything
        // DJC This handler assumes that the meeting has ended
        // https://www.metered.ca/docs/SDK-Reference/JavaScript/Events/remoteTrackStopped
        // meeting.on("remoteTrackStopped", function(remoteTrackItem) {
        //   nedCareLog("remoteTrackStarted", remoteTrackItem);
        //   document.getElementById(remoteTrackItem.streamId).remove();
        // });
        nedCareLog("Local track stopped: " + localTrackItem.type);
        var tracks = null;
        var el = null;
        var els = null;
        var tmp = null;

        // if (localTrackItem.type === "video") {
        //   els = document.getElementsByClassName(localTrackItem.streamId);
        //   for (var i=0; i < els.length; i++) {
        //   el = els[i];
        //   nedCareLog("Local track stopped. Found: " + i + ": " + el.id);
        //   }
        //   for (var i=0; i < els.length; i++) {
        //   nedCareLog("Total items start: " + els.length);
        //   nedCareLog("Stream: " + i + ": " + localTrackItem.streamId);
        //   el = els[i];
        //   tmp = el.classList;
        //   if (el !== undefined) {
        //     nedCareLog("Local track stopped streamId: " + localTrackItem.streamId + ", " + el.id);
        //     el.classList.remove(localTrackItem.streamId);
        //     nedCareLog("Local track stopped participant: " + gParticipantSessionId + ", " + el.id);
        //     el.classList.remove(gParticipantSessionId);
        //     // nedCareLog("Local track stopped participant: " + localTrackItem.participantSessionId);
        //     // el.classList.remove(localTrackItem.participantSessionId);
        //   } else {
        //     nedCareLog("Local track stopped el undefined");
        //   }
        //   nedCareLog("Total items stop: " + els.length);
        //   }
        // }

        // if (localTrackItem.type == "video") {
        //   tracks = gLocalVideoStream.getTracks();
        //   tracks.forEach(function (track) {
        //   track.stop();
        //   // track.removeTrack(); // DJC
        //   nedCareLog("Local Track Stopped: Stopping video track");
        //   }) // forEach
        // } else if (localTrackItem.type == "audio") {
        //   if (document.getElementById("audio0").srcObject !==null) {
        //   document.getElementById("audio0").srcObject = null;
        //   nedCareLog("Local Track Stopped: Stopping remote audio track");
        //   }
        // } else {
        //   nedCareLog("Local Track Stopped: Unknown track type");
        // }

        if (gScreenSharing) {
            nedCareLog("Join Meeting: Turning on the local camera");
            try {
                await gMeeting.startVideo();
                gScreenSharing = false;
            } catch (ex) {
                nedCareLog("Error occurred when trying to start video: ", ex);
            }
            enableLocalCamera("enableLocalCamera called from localTrackStopped");
        } else {
            // Clear/reset globals
            // Acts as if the call is over
            $('#video0container').fadeOut(gFadeTime);
            gLocalVideo = "secondaryVideo";
            gRemoteVideo = "primaryVideo";
            gRemoteVideoStream = null;
            gLocalVideoStream = null;
            gCameraOn = true;
            gAudioOn = false;
            gCallActive = false;
            // DJC
            gFrontCamera = true;

            nedCareLog("Local track stopped: All tracks stopped");
        }
    });

    gMeeting.on("remoteTrackStarted", function (trackItem) {
        // Error case
        if (trackItem.participantSessionId === gMeeting.participantSessionId) {
            nedCareLog("Remote track started: track is self?");
            return;
        }
        var name = trackItem.participant.name;

        nedCareLog("1. Remote track started: " + trackItem.type + ", " + name + ", " + trackItem.participantSessionId + ", " + trackItem.track.id);

        // Assumes that the remote track will always be placed on the primary display
        // What happens when there are multiple remote meeting participants?
        gRemoteVideo = "primaryVideo";

        var track = trackItem.track;
        var mediaStream = new MediaStream([track]);
        nedCareLog("2. Remote " + track.kind + " track started: " + track.id + ", " + name);
        var playPromise = null;
        var userName = trackItem.participant.name;

        // Start with the second video panel, the first is reserved for local video
        // Index 0 = local, 1 = first remote connected, 2 - second remote connected, etc.
        if (track.kind == "video") {
            // 2-participant display
            nedCareLog("3. Adding: " + trackItem.participant.name);
            if (userName.includes('resident')) {
                // Only place the resident track in gRemoteVideo and video1
                nedCareLog("4. Remote video number: " + gRemoteParticipantCount + ", " + name);
                gRemoteVideoStream = mediaStream;
                var tmp = document.getElementById(gRemoteVideo);
                tmp.srcObject = gRemoteVideoStream;
                document.getElementById("nedCarePrimaryVideoContainer").classList.add(trackItem.participantSessionId);
                document.getElementById("nedCarePrimaryVideoContainer").classList.add(trackItem.streamId);

                // Two-participant display
                // https://developer.chrome.com/blog/play-request-was-interrupted/
                playPromise = document.getElementById(gRemoteVideo).play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        nedCareLog('5. Secondary video track started play promise successful: ' + name + ", " + gRemoteParticipantCount);
                        // gRemoteParticipantCount++;
                        nedCareLog("5.1 remoteTrackStarted-gRemoteParticipantCount: " + name + ", " + gRemoteParticipantCount);
                    })
                    .catch(error => {
                        nedCareLog('6. Secondary video track started play promise failed: ' + name + ", " + gRemoteParticipantCount + ', ' + error);
                    });
                }
            }

            // N-participant display
            var IdString = "";
            if (trackItem.participant.name.includes('resident')) {
                IdString = "video1"
            } else if (gRemoteParticipantCount >= 2) {
                IdString = "video" + gRemoteParticipantCount;
            }
            nedCareLog("7. Starting N-participant video: " + name + ", " + IdString + ", " + ", " + trackItem.participantSessionId);

            var videoSrc = document.getElementById(IdString);
            // clone if duplicating
            // if (trackItem.participant.name.includes('resident')) {
            //   videoSrc.srcObject = mediaStream.clone();
            // } else {
            //   videoSrc.srcObject = mediaStream;
            // }
            videoSrc.srcObject = mediaStream;
            nedCareLog("7.1 remoteTrackStarted: " + name + ", " + IdString + ", " + ", " + trackItem.participantSessionId);
            playPromise = document.getElementById(IdString).play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    nedCareLog('8. Remote video track conference started: ' + name + ", " + IdString + ", " + ", " + trackItem.participantSessionId);
                    IdString += "container";
                    document.getElementById(IdString).classList.add(trackItem.participantSessionId);
                    document.getElementById(IdString).classList.add(trackItem.streamId);
                    var el = document.getElementById(IdString);
                    el.style.display = '';
                })
                .catch(error => {
                    nedCareLog('9. Remote video track conference started promise failed: ' + name + ", " + IdString + ", " + ", " + trackItem.participantSessionId);
                });
            }
        }

        var audioIdString = "audio" + gRemoteParticipantCount;
        if (track.kind == "audio") {
            // 2-participant
            gRemoteAudioStream = mediaStream;
            document.getElementById("remoteAudio").srcObject = gRemoteAudioStream;
            playPromise = document.getElementById("remoteAudio").play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    nedCareLog('A. Remote audio play promise successful: ' + gRemoteParticipantCount + ", " + trackItem.participantSessionId);
                    IdString += "container";
                    // document.getElementById(IdString).classList.add(trackItem.participantSessionId);

                })
                .catch(error => {
                    nedCareLog('B. Remote audio play promise failed' + error);
                });
            }

            // N-participant display
            nedCareLog("C. Starting N-participant audio: " + audioIdString + ", " + gRemoteParticipantCount);
            var audioSrc = document.getElementById(audioIdString);
            audioSrc.srcObject = mediaStream;
            playPromise = document.getElementById(audioIdString).play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    nedCareLog('F. Remote audio track conference started: ' + audioIdString + ", " + gRemoteParticipantCount);
                    // DJC Should there be a container here?
                    $(IdString).addClass(trackItem.participantSessionId);
                    $(IdString).addClass(trackItem.streamId);
                })
                .catch(error => {
                    nedCareLog('G. Remote audio track conference started promise failed: ' + audioIdString + ", " + error + ", " + gRemoteParticipantCount);
                });
            }
        }

    });

    gMeeting.on("remoteTrackStopped", function (trackItem) {
        // Test for audio or video track stopped
        nedCareLog("Remote track stopped (1): " + trackItem.type + ", " + trackItem.participantSessionId);
        if (trackItem.participantSessionId == gMeeting.participantSessionId)
            return;
        var el = document.getElementsByClassName(trackItem.participantSessionId)[0];
        if (el !== undefined) {
            // If this track is associated with a container, rather than an audio or video element
            // Remove container from the name, to get to the media element
            var elAvName = el.id.replace("container", "");
            nedCareLog("Remote track stopped (2): " + el.id + ", " + trackItem.type);
            if (trackItem.type === "video") {
                el.classList.remove(trackItem.streamId);
                el.classList.remove(trackItem.participantSessionId);
                el.style.display = 'none';
                nedCareLog("remoteTrackStopped-gRemoteParticipantCount: " + gRemoteParticipantCount);
                // DJC DO REMAINING CLEANUP TASKS - REMOVE TRACKS?
                document.getElementById(elAvName).srcObject = null;
                nedCareLog("Remote track stopped (3): " + elAvName + ", " + trackItem.type);
            } else {
                // Audio track
                if (trackItem.type === "audio") {
                    elAvName = elAvName.replace("video", "audio");
                    nedCareLog("Remote track stopped (4): " + elAvName + ", " + trackItem.type);
                }
            }
        }
    });

    gMeeting.on("participantJoined", function (participantInfo) {
        nedCareLog("Participant Joined: " + participantInfo.name);
        // .name, ._id, .roomId, .meetingSessionId
        // gConferenceParticipants...

        // Add an element to the secondary video array
        // Assign the video stream to the new secondary video element
        // Should we have fixed layouts? Primary video tracking the speaker? Configurable?
    });

    gMeeting.on("participantLeft", async function (participantInfo) {
        nedCareLog("Participant Left: " + participantInfo.name);

        // Remove, reset, hide all elements associated with this participant
        // var participantElements = document.getElementsByClassName(participantInfo._id);
        // for (var i=0; i < participantElements.length; i++) {
        //   var tmpId = participantElements[i].id;
        //   var el = document.getElementById(participantElements[i].id);
        //   el.classList.remove(participantInfo._id);
        //   el.classList.remove(participantInfo._id + "container");
        //   el.style.display = "none"
        //   var tmpName = tmpId.replace("container", "");
        //   el = document.getElementById(tmpName);
        //   el.srcObject = null;
        // }

        // gRemoteParticipantCount--;
        nedCareLog("participantLeft-gRemoteParticipantCount: " + gRemoteParticipantCount);
        if (gRemoteParticipantCount < 1) {
            // No remote participants left, so automatically close the meeting
            try {
                await meetingCleanup();
            } catch (ex) {
                nedCareLog("Error occurred in meetingCleanup in participant left: ", ex);
            }
        }

    });

    gMeeting.on("onlineParticipants", function (onlineParticipants) {
        nedCareLog("Online Participants Triggered");
        // Resident=1 is always remote, but don't count the Resident
        gRemoteParticipantCount = onlineParticipants.length - 1;
        if (gRemoteParticipantCount < 0)
            gRemoteParticipantCount = 0;
        for (var i = 0; i < onlineParticipants.length; i++) {
            nedCareLog(i + ": Participant name: " + onlineParticipants[i].name + ", ID: " + onlineParticipants[i]._id);
            if (onlineParticipants[i]._id === gParticipantSessionId) {
                // Local user
                $('#video0container').addClass(onlineParticipants[i]._id);
                $('#nedCareSecondaryVideo').addClass(onlineParticipants[i]._id);
            }
        }
        // Adjust the layout if there are only two participants in the call
        nedCareLog("onlineParticipants: " + onlineParticipants.length + ", " + "gRemoteParticipantCount" + ", " + gRemoteParticipantCount);
        ChooseLayout(onlineParticipants.length);
    });

    gMeeting.on("meetingEnded", async function () {
        nedCareLog("Meeting Ended");
        try {
            await meetingCleanup();
        } catch (ex) {
            nedCareLog("Error occurred in meetingCleanup in meeting ended: ", ex);
        }
    });

    gMeeting.on("meetingLeft", async function () {
        nedCareLog("Meeting Left: You have left the current meeting.");
        // await meetingCleanup();
    });

    gMeeting.on("stateChanged", async function (meetingState) {
        // nedCareLog(">>> Meeting State Changed: " + meetingState);
        // switch (meetingState) {
        // case 'terminated':
        //   $('#callStatus').text("Call ended");
        //   break;
        // case 'joining':
        //   nedCareLog(">>> Joining");
        //   $('#callStatus').text("Call ringing");
        //   break;
        // case 'connecting_streams':
        //   nedCareLog(">>> Connecting Streams");
        //   $('#callStatus').text("Connecting Streams");
        //   break;
        // case 'not_joined':
        //   nedCareLog(">>> Not Joined");
        //   $('#callStatus').text("Call failed");
        //   break;
        // case 'joined':
        //   nedCareLog(">>> Call Joined");
        //   $('#callStatus').text("Call joined");
        //   break;
        // case 'reconnect_success':
        //   $('#callStatus').text("Call reconnected");
        //   break;
        // case 'network_connection_lost':
        //   $('#callStatus').text("Call connection lost");
        //   break;
        // case 'network_connection_restored':
        //   $('#callStatus').text("Call connection restored");
        //   break;
        // default:
        //   nedCareLog(">>> Unknown call state: " + meetingState);
        //   $('#callStatus').text("Unknown call status: " + meetingState);
        //   nedCareLog("Unknown meeting state: " + meetingState);
        // }

    });

    var meetingInfo;
    try {
        meetingInfo = await gMeeting.join({
            roomURL: roomLink,
            name: gCurrentAccountData.firstName,
            accessToken: accessToken,
            receiveVideoStreamType: "all"
        });

        $('.userMicrophoneMuteToggle').addClass("fa-microphone");
        $('.userMicrophoneMuteToggle').removeClass("fa-microphone-slash");
        $('#userMicrophoneMuteToggle').trigger("blur");

        $('#nedCareVideoConferenceContainer').hide();
        $('#nedCareVideoContainer').hide();
        $('#nedCareDeviceConfig').fadeOut(gFadeTime);
        $('#logoHeader').fadeOut(gFadeTime);
        $('#nedCareMainControlPanelAccess').fadeOut(gFadeTime);
        $('#nedCareMainControlPanel').fadeOut(gFadeTime);
        $('#makeConnection').fadeOut(gFadeTime);

        gParticipantSessionId = meetingInfo.participantSessionId;
        nedCareLog("Join Meeting: Meeting joined: " + roomLink);
        // Ensure that the banner is hidden
        if ((gCurrentAccountData.monitor) && (gResidentMonitorPermitted)) {
            nedCareLog("In monitor mode, don't start local video")
            $('#nedCareSecondaryVideoContainer').fadeOut(gFadeTime);
        } else {
            nedCareLog("Join Meeting: Turning on the local camera");
            try {
                await gMeeting.startVideo();
            } catch (ex) {
                nedCareLog("Error occurred when trying to start video: ", ex);
                gRingTone.pause();
            }
            // Rely upon the track started events instead
            // enableLocalCamera("enableLocalCamera called from joinMeeting");
        }

        if (gAudioOn) {
            nedCareLog("Join Meeting: Audio already on");
        } else {
            // must enable meeting audio
            try {
                if (!(gResidentMonitoring)) {
                    nedCareLog("Join Meeting: Starting audio");
                    await gMeeting.startAudio();
                }
            } catch (ex) {
                nedCareLog("Error occurred when trying to start audio: ", ex);
                gRingTone.pause();

            }
            gMicrophoneMuted = false;
            gAudioOn = true;
        }
        // Mute audio if in monitor mode
        if ((gCurrentAccountData.monitor) && (gResidentMonitorPermitted)) {
            gMeeting.muteLocalAudio();
            gMicrophoneMuted = true;
        }
        gRingTone.pause();

        $('#makeConnection').fadeOut(gFadeTime, function () {
            if (gRemoteParticipantCount < 2) {
                // Use the original layout
                gRemoteVideoConferenceTarget = "secondaryVideo";
                $('#nedCareVideoConferenceContainer').fadeOut(gFadeTime, function () {
                    $('#nedCareVideoContainer').fadeIn(gFadeTime);
                    $('#nedCarePrimaryVideoContainer').fadeIn(gFadeTime);
                    $('#nedCareSecondaryVideoContainer').fadeIn(gFadeTime);
                    $('#nedCareLocalControlPanelAccess').fadeIn(gFadeTime);
                    // $('#nedCareRemoteControlPanelAccess').fadeIn(gFadeTime);
                    if ((gCurrentAccountData.monitor) && (gResidentMonitorPermitted)) {
                        // Hide the controls for remote video
                        $('#nedCareRemoteControlPanelAccess').fadeOut(gFadeTime);
                    } else {
                        $('#nedCareRemoteControlPanelAccess').fadeIn(gFadeTime);
                    }
                });
            } else {
                // Use the conference layout
                gRemoteVideoConferenceTarget = "video1";
                $('#nedCareVideoContainer').fadeOut(gFadeTime, function () {
                    $('#nedCareVideoConferenceContainer').fadeIn(gFadeTime);
                    $('#nedCareLocalControlPanelAccess').fadeIn(gFadeTime);
                    $('#nedCareRemoteControlPanelAccess').fadeIn(gFadeTime);
                });
            }

        });
        gCallActive = true;
        nedCareLog("Join meeting: Complete");

    } catch (ex) {
        nedCareLog("Error occurred when trying to join meeting: ", ex);
        if (gRingTone !== null) {
            gRingTone.pause();
        }
        gCallActive = false;
    }
} // end joinMeeting


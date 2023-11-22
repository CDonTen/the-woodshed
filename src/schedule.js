//================================================================================
// Function: AddScheduleEntry
//--------------------------------------------------------------------------------
function AddScheduleEntry() {
    nedCareLog('AddScheduleEntry: Start');
    var timeControls = '<div class="mt-4">Time:</div><div class="level is-mobile mt-3"><div class="level-left"><div class="level-item"><div class="select"><select id="userReminderHour" class="userScheduleData"><option value="None">Hour</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option></select></div></div><div class="level-item"><div class="select"><select id="userReminderMinute" class="userScheduleData"><option value="None">Min</option><option value="0">00</option><option value="5">05</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="30">30</option><option value="35">35</option><option value="40">40</option><option value="45">45</option><option value="50">50</option><option value="55">55</option></select></div></div><div class="level-item"><div class="control"><label class="radio"><input type="radio" name="userMornAft" id="userAM" value="AM" checked="true" class="userScheduleData">AM</label><label class="radio"><input type="radio" name="userMornAft" id="userPM" value="PM" class="userScheduleData">PM</label></div></div></div></div>';
    var headerString = '<div class="level is-mobile mt-4"><div class="level-left"><div class="level-item"><div class="ned-title has-text-weight-semibold has-text-left is-size-4 mt-4 userEventReminder" id="userReminderEvent">Event</div></div></div><div class="level-right"><div class="level-item"><button class="button nedcare-button has-text-weight-semibold userDeleteReminderSchedule" id="userReminderEventDelete">Delete</button></div></div></div>';
    var scheduleEntry = headerString;
    scheduleEntry += '<div class="userReminders" id="userReminderEntry"><div class="level is-mobile"><div class="level-left">'
    scheduleEntry += timeControls + '</div>';
    // <div class="level-item">Time:</div><div class="level-item"><input class="input nedcare-input mt-1 userReminderTime" placeholder="##:##" id="userReminderStartTime" autocomplete="off"></div><div class="level-right"><div class="level-item"><button class="button nedcare-button has-text-weight-semibold userDeleteReminderSchedule" id="userReminderEventDelete">Delete</button></div></div>
    scheduleEntry += '</div><div class="mt-2">Message:</div><div><input class="input nedcare-input mt-1 userMessageReminder userScheduleData" placeholder="Message" id="userReminderMessage" autocomplete="off"></div><div class="mt-2 mb-2">Frequency</div><div class="columns is-mobile is-variable is-1 userReminderDays"><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqSu" class="userScheduleData">Su</label></div><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqMo" class="userScheduleData">M</label></div><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqTu" class="userScheduleData">Tu</label></div><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqWe" class="userScheduleData">W</label></div><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqTh" class="userScheduleData">T</label></div><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqFr" class="userScheduleData">F</label></div><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqSa" class="userScheduleData">S</label></div></div></div>';
    // var scheduleEntryOld = '<div id="userReminderEntry"><div class="level is-mobile"><div class="level-left"><div class="level-item">Time:</div><div class="level-item"><input class="input nedcare-input mt-1 userReminderTime" placeholder="##:##" id="userReminderStartTime" autocomplete="off"></div></div><div class="level-right"><div class="level-item"><button class="button nedcare-button has-text-weight-semibold userDeleteReminderSchedule" id="userReminderEventDelete">Delete</button></div></div></div><div>Message:</div><div><input class="input nedcare-input mt-1 userMessageReminder" placeholder="Message" id="userReminderMessage" autocomplete="off"></div><div class="">Frequency</div><div class="columns is-mobile is-variable is-1 userReminderDays"><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqSu">Su</label></div><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqMo">M</label></div><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqTu">Tu</label></div><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqWe">W</label></div><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqTh">T</label></div><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqFr">F</label></div><div class="column is-narrow"><label class="checkbox"><input type="checkbox" id="freqSa">S</label></div></div></div>';
    // add a schedule entry
    var tmp = scheduleEntry;
    var index = gReminderScheduleCount.toString();
    tmp = tmp.replace('userReminderEntry', 'userReminderEntry' + index);
    tmp = tmp.replace('userReminderEventDelete', 'userReminderEventDelete' + index);
    // tmp = tmp.replace('userReminderEvent', 'userReminderEvent' + index);
    tmp = tmp.replace('userReminderHour', 'userReminderHour' + index);
    tmp = tmp.replace('userReminderMinute', 'userReminderMinute' + index);
    tmp = tmp.replace('userReminderMessage', 'userReminderMessage' + index);
    tmp = tmp.replace('userReminderDays', 'userReminderDays' + index);
    tmp = tmp.replace('freqSu', 'freqSu' + index);
    tmp = tmp.replace('freqMo', 'freqMo' + index);
    tmp = tmp.replace('freqTu', 'freqTu' + index);
    tmp = tmp.replace('freqWe', 'freqWe' + index);
    tmp = tmp.replace('freqTh', 'freqTh' + index);
    tmp = tmp.replace('freqFr', 'freqFr' + index);
    tmp = tmp.replace('freqSa', 'freqSa' + index);
    tmp = tmp.replaceAll('userMornAft', 'userMornAft' + index);
    tmp = tmp.replace('userAM', 'userAM' + index);
    tmp = tmp.replace('userPM', 'userPM' + index);
    gReminderSchedule.push(tmp);
    gReminderScheduleCount++;
}

//================================================================================
// Function: BuildSchedule
//--------------------------------------------------------------------------------
function BuildSchedule() {
    nedCareLog('BuildSchedule: Start');
    var htmlString = '';
    // display from most recent schedule entry to oldest
    var i = 0;
    for (i < (gReminderSchedule.length - 1); i == 0; i--) {
        htmlString += gReminderSchedule[i];
    }
    return (htmlString);
}

//================================================================================
// Function: RebuildSchedule
//--------------------------------------------------------------------------------
function RebuildSchedule() {
    nedCareLog("RebuildSchedule: Start");
    var htmlString = BuildSchedule();
    $('#userReminderSchedule').html(htmlString);
    UpdateDeleteScheduleEntryHandlers();
}

//================================================================================
// Function: DeleteScheduleEntry
//--------------------------------------------------------------------------------
function DeleteScheduleEntry() {
    nedCareLog("DeleteScheduleEntry: Start")
    var tmpId = $(this).attr("id");
    nedCareLog("Button: " + tmpId);
    // find the entry in gReminderSchedule
    for (var i = 0; i < gReminderSchedule.length; i++) {
        var tmpString = gReminderSchedule[i];
        if (tmpString.indexOf(tmpId) !== -1) {
            nedCareLog('Deleting schedule entry: ' + i);
            gReminderSchedule.splice(i, 1);
        }
    }
    // rebuild the schedule
    RebuildSchedule();
}

//================================================================================
// Function: UpdateDeleteScheduleEntryHandlers
//--------------------------------------------------------------------------------
function UpdateDeleteScheduleEntryHandlers() {
    nedCareLog('UpdateDeleteScheduleEntryHandlers: Start');
    var buttons = document.getElementById("userReminderSchedule").getElementsByClassName("userDeleteReminderSchedule");
    for (var i = 0; i < buttons.length; i++) {
        var tmpId = buttons[i].id;
        nedCareLog('Button ID: ' + tmpId);
        buttons[i].addEventListener("click", DeleteScheduleEntry, false);
    }
}

//================================================================================
// Function: ClearEventInputs
//--------------------------------------------------------------------------------
function ClearEventInputs(index) {
    nedCareLog('Enter Clear Event inputs: ' + index);
    // Get the time for this event entry
    var name = 'userEventHour' + index;
    var tmp = document.getElementById(name);
    tmp.value = 'None';
    name = 'userEventMinute' + index;
    tmp = document.getElementById(name);
    tmp.value = 'None';
    // Morning or afternoon?
    name = 'userAM' + index;
    tmp = document.getElementById(name);
    tmp.checked = false;
    name = 'userPM' + index;
    tmp = document.getElementById(name);
    tmp.checked = false;
    // Clear the message
    name = 'userEventMessage' + index;
    tmp = document.getElementById(name);
    tmp.value = '';
    // Clear the message frequency
    name = 'freqSu' + index;
    tmp = document.getElementById(name);
    tmp.checked = false;
    name = 'freqMo' + index;
    tmp = document.getElementById(name);
    tmp.checked = false;
    name = 'freqTu' + index;
    tmp = document.getElementById(name);
    tmp.checked = false;
    name = 'freqWe' + index;
    tmp = document.getElementById(name);
    tmp.checked = false;
    name = 'freqTh' + index;
    tmp = document.getElementById(name);
    tmp.checked = false;
    name = 'freqFr' + index;
    tmp = document.getElementById(name);
    tmp.checked = false;
    name = 'freqSa' + index;
    tmp = document.getElementById(name);
    tmp.checked = false;
}

//================================================================================
// Function: ReadEventInputs
//--------------------------------------------------------------------------------
function ReadEventInputs(index) {
    nedCareLog('Enter Read Event inputs: ' + index);
    var eventData = {};
    eventData.Index = index;
    var name = '';
    var tmp = null;

    // Get the time for this event entry
    name = 'userEventHour' + index;
    tmp = document.getElementById(name).value;
    eventData.Hour = tmp;
    nedCareLog('Hour: ' + tmp);
    name = 'userEventMinute' + index;
    tmp = document.getElementById(name).value;
    eventData.Minute = tmp;
    nedCareLog('Minute: ' + tmp);
    // Morning or afternoon?
    name = 'userAM' + index;
    tmp = document.getElementById(name).checked;
    eventData.AM = tmp;
    name = 'userPM' + index;
    tmp = document.getElementById(name).checked;
    eventData.PM = tmp;

    // Get the message for this schedule entry
    name = 'userEventMessage' + index;
    tmp = document.getElementById(name).value;
    // nedCareLog('Message: ' + tmp);
    eventData.Message = tmp;
    // Get the message frequency
    name = 'freqSu' + index;
    tmp = document.getElementById(name).checked;
    // nedCareLog('Su: ' + tmp);
    eventData.freqSu = tmp;
    name = 'freqMo' + index;
    tmp = document.getElementById(name).checked;
    // nedCareLog('Mo: ' + tmp);
    eventData.freqMo = tmp;
    name = 'freqTu' + index;
    tmp = document.getElementById(name).checked;
    // nedCareLog('Tu: ' + tmp);
    eventData.freqTu = tmp;
    name = 'freqWe' + index;
    tmp = document.getElementById(name).checked;
    // nedCareLog('We: ' + tmp);
    eventData.freqWe = tmp;
    name = 'freqTh' + index;
    tmp = document.getElementById(name).checked;
    // nedCareLog('Th: ' + tmp);
    eventData.freqTh = tmp;
    name = 'freqFr' + index;
    tmp = document.getElementById(name).checked;
    // nedCareLog('Fr: ' + tmp);
    eventData.freqFr = tmp;
    name = 'freqSa' + index;
    tmp = document.getElementById(name).checked;
    // nedCareLog('Sa: ' + tmp);
    eventData.freqSa = tmp;
    return (eventData);
}

//================================================================================
// Function: WriteEventInputs
//--------------------------------------------------------------------------------
function WriteEventInputs(indexIn) {
    nedCareLog('Enter Write Event inputs: ' + index);
    // Find the array entry that matches index
    var index = null;
    for (var i = 0; i < gReminderScheduleData.length; i++) {
        if (gReminderScheduleData[i].Index == indexIn) {
            index = i;
        }
    }
    nedCareLog('Found event at index: ' + index);

    // Get the time for this event entry
    var name = 'userEventHour' + indexIn;
    var tmp = document.getElementById(name);
    tmp.value = gReminderScheduleData[index].Hour;
    name = 'userEventMinute' + indexIn;
    tmp = document.getElementById(name);
    tmp.value = gReminderScheduleData[index].Minute;
    // Morning or afternoon?
    name = 'userAM' + indexIn;
    tmp = document.getElementById(name);
    tmp.checked = gReminderScheduleData[index].AM;
    name = 'userPM' + indexIn;
    tmp = document.getElementById(name);
    tmp.checked = gReminderScheduleData[index].PM;
    // Set the message
    name = 'userEventMessage' + indexIn;
    tmp = document.getElementById(name);
    tmp.value = gReminderScheduleData[index].Message;
    // Set the message frequency
    name = 'freqSu' + indexIn;
    tmp = document.getElementById(name);
    tmp.checked = gReminderScheduleData[index].freqSu;
    name = 'freqMo' + indexIn;
    tmp = document.getElementById(name);
    tmp.checked = gReminderScheduleData[index].freqMo;
    name = 'freqTu' + indexIn;
    tmp = document.getElementById(name);
    tmp.checked = gReminderScheduleData[index].freqTu;
    name = 'freqWe' + indexIn;
    tmp = document.getElementById(name);
    tmp.checked = gReminderScheduleData[index].freqWe;
    name = 'freqTh' + indexIn;
    tmp = document.getElementById(name);
    tmp.checked = gReminderScheduleData[index].freqTh;
    name = 'freqFr' + indexIn;
    tmp = document.getElementById(name);
    tmp.checked = gReminderScheduleData[index].freqFr;
    name = 'freqSa' + indexIn;
    tmp = document.getElementById(name);
    tmp.checked = gReminderScheduleData[index].freqSa;
}

//================================================================================
// Function: ClearScheduleData
//--------------------------------------------------------------------------------
function ClearScheduleData(index) {
    nedCareLog('Enter Clear Schedule Data: ' + index);
    for (var i = 0; i < gReminderScheduleData.length; i++) {
        if (index == gReminderScheduleData[i].Index) {
            // delete this entry
            gReminderScheduleData.splice(i, 1);
        }
    }
}

//================================================================================
// Function: WriteScreenSchedule
//--------------------------------------------------------------------------------
function WriteScreenSchedule() {
    nedCareLog('Enter WriteScreenSchedule');
    gReminderScheduleCount = 0;
    // clear existing schedule entries
    $('#userReminderSchedule').html('');
    // Check for schedule data
    if (gReminderScheduleData.length == 0) {
        nedCareLog('WriteScreenSchedule: No schedule entries available')
    } else {
        // add schedule entries
        for (var index = 0; index < gReminderScheduleData.length; index++) {
            AddScheduleEntry();
        }
        // Add schedule entries to the page and connect the Delete handlers
        var htmlString = BuildSchedule();
        $('#userReminderSchedule').html(htmlString);
        UpdateDeleteScheduleEntryHandlers();

        // Populate the schedule data
        var schedule = document.getElementById("userReminderSchedule");
        var scheduleEntries = schedule.getElementsByClassName("userReminders");
        var scheduleData = {};
        for (var i = 0; i < scheduleEntries.length; i++) {
            // get the index for this schedule entry
            // ID=userReminderEntry <-- 17 characters
            var tmpId = scheduleEntries[i].id;
            var index = tmpId.substring(17);
            var name = '';
            var tmp = null;
            nedCareLog('tmpId: ' + tmpId + ': ' + index);
            // Get the time for this schedule entry
            // name = 'userReminderHour' + index;
            // tmp = document.getElementById(name).value;
            // scheduleData.Hour = tmp;
            // nedCareLog('Hour: ' + tmp);
            // name = 'userReminderMinute' + index;
            // tmp = document.getElementById(name).value;
            // scheduleData.Minute = tmp;
            // nedCareLog('Minute: ' + tmp);
            // // Morning or afternoon?
            // name = 'userAM' + index;
            // tmp = document.getElementById(name).checked;
            // if (tmp) {
            //   scheduleData.AmPm = 'AM';
            // } else {
            //   scheduleData.AmPm = 'PM';
            // }

            // Get the message for this schedule entry
            name = 'userReminderMessage' + index;
            tmp = document.getElementById(name);
            document.getElementById(name).value = gReminderScheduleData[i].Message;
            // nedCareLog('Message: ' + tmp);
            scheduleData.Message = tmp;
            // Get the message frequency
            // name = 'freqSu' + index;
            // tmp = document.getElementById(name).checked;
            // // nedCareLog('Su: ' + tmp);
            // scheduleData.freqSu = tmp;
            // name = 'freqMo' + index;
            // tmp = document.getElementById(name).checked;
            // // nedCareLog('Mo: ' + tmp);
            // scheduleData.freqMo = tmp;
            // name = 'freqTu' + index;
            // tmp = document.getElementById(name).checked;
            // // nedCareLog('Tu: ' + tmp);
            // scheduleData.freqTu = tmp;
            // name = 'freqWe' + index;
            // tmp = document.getElementById(name).checked;
            // // nedCareLog('We: ' + tmp);
            // scheduleData.freqWe = tmp;
            // name = 'freqTh' + index;
            // tmp = document.getElementById(name).checked;
            // // nedCareLog('Th: ' + tmp);
            // scheduleData.freqTh = tmp;
            // name = 'freqFr' + index;
            // tmp = document.getElementById(name).checked;
            // // nedCareLog('Fr: ' + tmp);
            // scheduleData.freqFr = tmp;
            // name = 'freqSa' + index;
            // tmp = document.getElementById(name).checked;
            // // nedCareLog('Sa: ' + tmp);
            // scheduleData.freqSa = tmp;
        }
    }
}

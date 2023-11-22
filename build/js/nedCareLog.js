var gOrigLog = console.log;
var gOrigWarn = console.warn;
var gOrigError = console.error;
var gSessionId = 0;
var gLogLogs = 0; // If true, copy all nedCareLog messages to the server

console.log = function() {
  nedCareLog("Console.log: " + arguments[0]);
  gOrigLog(arguments[0]);
};

console.warn = function() {
  nedCareLog("Console.warn: " + arguments[0]);
  gOrigWarn(arguments[0]);
};

console.error = function() {
  nedCareLog("Console.error: " + arguments[0]);
  gOrigError(arguments[0]);
};

function nedCareLog(logMessage){
  let currentTime = moment().format("HH:mm:ss");
  var tmp = currentTime + "  " + logMessage;
  gOrigLog(tmp);
  gDebugString += tmp + "<br>";
  // Check for overflow (limit to 20k characters)
  if (gDebugString.length > 20000) {
    // Keep only the last 10,000 characters
    var tmp = gDebugString.slice(-10000);
    gDebugString = tmp;
  }
  // Save to local storage, just in case
  // window.localStorage.setItem('debugString', gDebugString);
  // Update rendered page
  $('#debugMessages').html(gDebugString);
  
  if ((gLogLogs) && (gCurrentAccountData.accountNumber !== "") && (gCurrentAccountData.cellNumber !== "")) {
      if (gSessionId == 0) {
        gSessionId = Math.floor(Math.random() * 90000) + 10000;
      }
  
      NedConnectLib.NedCareAction(
        {
            action: 'appLog',
            sessionId: '' + gSessionId,
            accountId: '' + gCurrentAccountData.accountNumber,
            cellNumber: '' + gCurrentAccountData.cellNumber,
            log: moment().format("YYYY-MM-DD HH:mm:ss") + ' ' + logMessage
        },
        function(result)
        {
            //gOrigLog('appLog success');
        },
        function(errors)
        {
            gOrigLog('appLog error: "' + errors + '"');
        },
        true
      ) 
  }
}

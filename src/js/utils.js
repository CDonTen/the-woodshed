'use strict';

var gVersion = '314777da7eb1';
var gBuild = 'dev'; // Either 'dev' or 'rel'

var dialogCallback = null;
var dialogCallback2 = null;
var dialogUp = false;

var gUtilsMobileCheck = undefined;

var AttendanceDialogInit = false;
var AttendanceDialogCallback = null;

function UtilsMobileCheck() 
{
    if (gUtilsMobileCheck !== undefined) {
        return gUtilsMobileCheck;
    }
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    gUtilsMobileCheck = check;
    return check;
};

function UtilsGetFields(fields)
{
    for (var key in fields) {
        // Skip loop if the property is from prototype
        if (!fields.hasOwnProperty(key)) {
            continue;
        }
        
        if (fields[key].type == 'checkbox') {
            fields[key].value = $('#' + fields[key].id).is(':checked') ? 1 : 0;
        } else if (fields[key].type == 'radio') {
            fields[key].value = $("input[name=" + fields[key].id + "]:checked").val();
        } else if (fields[key].type == 'phone') {
            var value = $('#' + fields[key].id).val();
            value = value.trim();
            fields[key].value = NedLibUtils.MemberId(value);
        } else if (fields[key].type == 'integer') {
            var value = $('#' + fields[key].id).val();
            value = parseInt(value.trim());
            if (isNaN(value)) {
                value = 0;
            }
            fields[key].value = value;
        } else if (fields[key].type == 'string') {
            var value = $('#' + fields[key].id).val();
            fields[key].value = value.trim();
        } else if (fields[key].type == 'select') {
            var value = $('#' + fields[key].id).val();
            fields[key].value = value;
        } else {
            fields[key].value = 0;
        }
        if (fields[key].value === undefined) {
            fields[key].value = 0;
        }
    }
}

function UtilsFieldsKeyValue(fields)
{
    UtilsGetFields(fields);
    var keyValue = {}
    for (var key in fields) {
        // Skip loop if the property is from prototype
        if (!fields.hasOwnProperty(key)) {
            continue;
        }
        keyValue[key] = fields[key].value;
    }
    return keyValue;
}

function UtilsRequiredFields(fields)
{
    var required = true;
    for (var key in fields) {
        // Skip loop if the property is from prototype
        if (!fields.hasOwnProperty(key)) {
            continue;
        }
        
        if (fields[key].required) {
            var value;
            if (fields[key].type != 'checkbox') {
                var value = $('#' + fields[key].id).val();
                if (value) {
                    value = value.trim();
                }
                if (!value) {
                    required = false;
                    break;
                }
            }
        }
    }
    return required;
}

function UtilsClearFields(fields)
{
    for (var key in fields) {
        // Skip loop if the property is from prototype
        if (!fields.hasOwnProperty(key)) {
            continue;
        }
        
        var field = fields[key];
        if (field.type == 'string') {
            $('#' + fields[key].id).val('');
            field.value = '';
        } else if (field.type == 'phone') {
            $('#' + fields[key].id).val('');
            field.value = '';
        } else if (field.type == 'integer') {
            $('#' + fields[key].id).val('');
            field.value = 0;
        } else if (field.type == 'checkbox') {
            if (field.value) {
                $('#' + fields[key].id).prop('checked', true);
                field.value = true;
            } else {
                $('#' + fields[key].id).prop('checked', false);
                field.value = false;
            }
        } else if (field.type == 'radio') {
            $('input[name=' + fields[key].id + ']').prop('checked', false);
            field.value = false;
        }
    }
}

function UtilsFillFields(fields, data)
{
    for (var key in data) {
        // Skip loop if the property is from prototype
        if (!data.hasOwnProperty(key)) {
            continue;
        }
        
        if (key in fields) {
            fields[key].value = data[key];
            if (fields[key].type == 'checkbox') {
                $('#' + fields[key].id).prop('checked', data[key]);
            } else if (fields[key].type == 'radio') {
                $('#' + fields[key].id).prop('checked', data[key]);
                $('input:radio[name=' + fields[key].id + ']').val([data[key]]);
            } else if (fields[key].type == 'phone') {
                $('#' + fields[key].id).val(NedConnectLib.FormatPhone(data[key]));
            } else {
                $('#' + fields[key].id).val(data[key]);
            }
        }
    }
}

function UtilsDocumentReady(module)
{
    log.setLevel('debug');

    if (module) {
        Debug.Log(module + '.documentReady');
    }
    
    $('.modal-card-head').click(function()
    {
        DialogClose();
    });
    
    $('#errorModal').on('hidden.bs.modal', function() 
    {
        if (errorCallback) {
            errorCallback();
        }
    });

    $(window).on('beforeunload', function()
    {
        $(window).scrollTop(0);
    });
    
    //NedLib.Init(Debug.Log);
    NedConnectLib.SpinnerFunction(Spinner);
}

function UtilsDeviceReady(module)
{
    if (module) {
        Debug.Log(module + '.deviceReady');
    }
    
    $('.closeNed').click(function()
    {
        Debug.Log("closeNed()");
        if (typeof cordova !== 'undefined') {
            if (navigator.app) {
                navigator.app.exitApp();
            }
            else if (navigator.device) {
                navigator.device.exitApp();
            }
        } 
        else
        {
            window.close();
        }
    });
    
    if (typeof device !== 'undefined') {
        if (device.platform == 'Android'){
            $('.closeNed').show();
        }
    }
}

var gSpinnerCount = 0;
var gSpinnerShow;
function Spinner(enable)
{
    if (enable) {
        gSpinnerCount++;
        if (!gSpinnerShow) {
            $(".loading").show();
            gSpinnerShow = true;
            /*
            setTimeout(
                function()
                {
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
                    function()
                    {
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

function Dialog(title, text, callback, callback2)
{
    if (callback === undefined) {
        callback = null;
    }
    if (callback2 === undefined) {
        callback2 = null;
    }
    Debug.Log(text);
    dialogCallback = null;
    DialogClose();
    dialogCallback = callback;
    dialogCallback2 = callback2;
    $('#modalInfoTitle').html(title);
    $('#modalInfoBody').html(text);
    if (callback2) {
        $('#dialogCloseHelp').hide();
        $('#dialogYesNo').show();
    } else {
        $('#dialogCloseHelp').show();
        $('#dialogYesNo').hide();
    }
    $('#modalInfo').addClass('is-active');
    dialogUp = true;
}

function DialogClose(secondCallback)
{
    if (secondCallback === undefined) {
        secondCallback = false;
    }
    //$('#modalInfo').removeClass('is-active');
    $('.modal').removeClass('is-active');
    //$('#modalAddRewards').removeClass('is-active');
    //$('#modalAddUser').removeClass('is-active');
    //$('#modalAddCalendarEvent').removeClass('is-active');
    //$('#modalAttendance').removeClass('is-active');
    //$('#modalAddStudent').removeClass('is-active');
    
    if (dialogUp) {
        dialogUp = false;
        if (secondCallback) {
            if (dialogCallback2 instanceof Function) {
                dialogCallback2();
            }
        } else {
            if (dialogCallback instanceof Function) {
                dialogCallback();
            }
        }
    } 
}

function AttendanceDialog(value, callback)
{
    $('input:radio[name="attendanceStatus"]').val(value);
    AttendanceDialogCallback = callback;
    if (!AttendanceDialogInit) {
        AttendanceDialogInit = true;
        
        $('#modalAttendanceConfirm').click(function()
        {
            Debug.Log('CalendarQuery.modalAttendanceConfirm');
            $('#modalAttendance').removeClass('is-active');
            if (AttendanceDialogCallback instanceof Function) {
                AttendanceDialogCallback($('input[name="attendanceStatus"]:checked').val());
            }  
        });

        $('#modalAttendanceCancel').click(function()
        {
            Debug.Log('CalendarQuery.modalAttendanceCancel');
            $('#modalAttendance').removeClass('is-active');
        });
    }
    $('#modalAttendance').addClass('is-active');
}

function UniqueFileName() {
    var d = new Date();
    var dStr = '';
    dStr += d.getFullYear();
    dStr += '_';
    var month = d.getMonth() + 1;
    if (month < 10) {
      dStr += '0' + month;
    } else { 
      dStr += month;
    };
    dStr += '_';
    dStr += d.getDate();
    dStr += '_';
    dStr += d.getHours();
    dStr += '_';
    dStr += d.getMinutes();
    return dStr;
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function ErrorDialog(errors)
{
    Dialog("Error", errors);
}

var Utils = {
    RenderInteger: function(data, type, row, meta) 
    {
        data = data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return '<div style="text-align:right">' + data + '</div>';
    },
    
    RenderRight: function(data, type, row, meta) 
    {
        return '<div style="text-align:right; font-family:monospace;">' + data + '</div>';
    },
    
    RenderRight3: function(data, type, row, meta) 
    {
        return '<div style="text-align:right; font-family:monospace;">' + (data / 1.0).toFixed(3) + '</div>';
    },
    
    RenderPhone: function(data, type, row, meta) 
    {
        return '<span style="white-space:nowrap">' + NedConnectLib.FormatPhone(data) + '</span>';
    },
    
    RenderDateTime: function(data, type, row, meta) 
    {
        var date = moment.unix(data).format("YYYY-MM-DD HH:mm:ss");
        return date;
    },
    
    RenderTimeOfDay: function(data, type, row, meta)
    {
        var hour = data / (60 * 60);
        hour = Math.floor(hour);
        var hourStr = hour.toString();
        if (hourStr.length != 2) {
            hourStr = "0" + hourStr;
        }
        var minute = (data - hour * (60 * 60)) / 60;
        minute = Math.floor(minute);
        var minuteStr = minute.toString();
        if (minuteStr.length != 2) {
            minuteStr = "0" + minuteStr;
        }
        return hourStr + ":" + minuteStr;
    },
    
    CamelCaseSpacify: function(inString)
    {
        return inString;
    },
	
	LevelIdToName: function(levelId)
	{
		var levelName;
		
		switch (levelId) {
			case 0:
				levelName = 'Not in neducation';
				break;
			case 1:
				levelName = 'Cancelled';
				break;
			case 2:
				levelName = 'Talk and Text';
				break;
			case 3:
				levelName = '1 GB Data';
				break;
			case 4:
				levelName = '5 GB Data';
				break;
			case 5:
				levelName = 'Promotion';
				break;
			default:
				levelName = '???';
				break;
		}
		return levelName;
	},
};

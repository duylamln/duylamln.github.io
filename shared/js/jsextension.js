/*
Define all extention for js object in this file
*/
System = {
    isFunction: function(object) {
        return typeof object == "function";
    },
    getVal: function(obj) {
        if (System.isObject(obj)) {
            return JSON.stringify(obj);
        }
        return System.isFunction(obj) ? obj() : obj;
    },
    isObject: function(obj) {
        return obj instanceof Object;
    }
};


Array.prototype.copyFrom = function(arr, startIndex, count) {
    if (!arr) {
        return;
    }
    for (var index = (startIndex ? startIndex : 0), max = count ? count : arr.length; index < max; index++) {
        this.push(arr[index]);
    }
    return this;
};
Array.prototype.removeItem = function(item) {
    var index = this.indexOf(item);
    if (index > -1) {
        this.splice(index, 1);
    }
    return this;
};

/* Extension for string*/
/*
Format the string. Using String.Format("{0}-{1}","1","2")="1-2"
*/
String.format = function() {
    var args = arguments;
    if (typeof args[0] !== "string") {
        args = args[0];
    }
    var inputStr = args[0],
        paramIndex;
    for (paramIndex = 0; paramIndex < args.length - 1; paramIndex++) {
        var data = System.getVal(args[paramIndex + 1]);
        var reg = new RegExp("\\{" + paramIndex + "\\}", "gm");
        inputStr = inputStr.replace(reg, data);
    }
    return inputStr;
};

String.prototype.toDateTimeFormat = function(format) {
    var date = new Date(this);
    return date.format(format);
};
String.isNullOrWhiteSpace = function(value) {
    return  value === undefined || value === null|| value === '';
};

String.prototype.isEqual = function(valueToCompare) {
    var isEqual = true;
    switch (typeof valueToCompare) {
        case 'function':
            isEqual = this.toString() === valueToCompare();
            break;
        case 'object':
            isEqual = this.toString() === valueToCompare.toString();
            break;
        default:
            isEqual = this.toString().toLowerCase() === valueToCompare.toLowerCase();
            break;
    }
    return isEqual;
};
String.prototype.camelize = function() {
    return this.replace(/(\-|_|\.|\s)+(.)?/g, function(match, separator, chr) {
        return chr ? chr.toUpperCase() : '';
    }).replace(/^([A-Z])/, function(match) {
        return match.toLowerCase();
    });
};
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.firstCharToLower = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
};
/*
return true if an string end with suffix
using:
var str='I'm an hero';
str.EndWith('hero')=true;
str.EndWith('her')=false;
*/
String.prototype.endWith = function(suffix) {
    return (this.substr(this.length - suffix.length) === suffix);
};

/*
return true if an string start with prefix
using:
var str='I'm an hero';
str.StartWith('I')=true;
str.StartWith('M')=false;
*/
String.prototype.startWith = function(prefix) {
    return (this.substr(0, prefix.length) === prefix);
};

String.prototype.replaceAllCharacter = function (oldChar, newChar) {
    var re = new RegExp(oldChar, "g");
    if (newChar === undefined || newChar === null) {
        newChar = "";
    }
    return this.replace(re, newChar);
};
/*Extension for date object*/

/*
Add the number of dates into current instance of date object.
dates: number of dates to add. It can be positive or negative number
1 date=86400000 miliseconds
*/
Date.prototype.isJSDate = function () {
    return true;
};
Date.prototype.addDates = function(dates) {
    var time = this.getTime();
    this.setTime(time + dates * 86400000);
    return this;
};

/*
Add the number of hours into current instance of date object.
seconds: number of hours to add. It can be positive or negative number
1 hour=3600000 miliseconds
*/
Date.prototype.addHours = function(hours) {
    var time = this.getTime();
    this.setTime(time + hours * 3600000);
    return this;
};

/*
Add the number of minutes into current instance of date object.
minutes: number of minutes to add. It can be positive or negative number
1 minute=60000 miliseconds
*/
Date.prototype.addMinutes = function(minutes) {
    var time = this.getTime();
    this.setTime(time + minutes * 60000);
    return this;
};

/*
Add the number of seconds into current instance of date object.
seconds: number of seconds to add. It can be positive or negative number
1 second=1000 miliseconds
*/
Date.prototype.addSeconds = function(seconds) {
    var time = this.getTime();
    this.setTime(time + seconds * 1000);
    return this;
};

/*
ToString with specified format
Code convention is not good at this time, will back to this later
*/
Date.prototype.format = function(mask, utc) {

    var dateFormat = function() {
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function(val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };

        // Regexes and supporting functions are cached through closure
        return function(date, mask, utc) {
            /*Default format*/
            mask = !mask ? "ddd mmm dd yyyy HH:MM:ss" : mask;
            var dF = dateFormat;

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date();
            if (isNaN(date)) throw SyntaxError("invalid date");

            //mask = String(dF.masks[mask] || mask || dF.masks["default"]);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d: d,
                    dd: pad(d),
                    ddd: dF.i18n.dayNames[D],
                    dddd: dF.i18n.dayNames[D + 7],
                    m: m + 1,
                    mm: pad(m + 1),
                    mmm: dF.i18n.monthNames[m],
                    mmmm: dF.i18n.monthNames[m + 12],
                    yy: String(y).slice(2),
                    yyyy: y,
                    h: H % 12 || 12,
                    hh: pad(H % 12 || 12),
                    H: H,
                    HH: pad(H),
                    M: M,
                    MM: pad(M),
                    s: s,
                    ss: pad(s),
                    l: pad(L, 3),
                    L: pad(L > 99 ? Math.round(L / 10) : L),
                    t: H < 12 ? "a" : "p",
                    tt: H < 12 ? "am" : "pm",
                    T: H < 12 ? "A" : "P",
                    TT: H < 12 ? "AM" : "PM",
                    Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, function($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    // Some common format strings
    dateFormat.masks = {
        "default": "ddd mmm dd yyyy HH:MM:ss",
        shortDate: "m/d/yy",
        mediumDate: "mmm d, yyyy",
        longDate: "mmmm d, yyyy",
        fullDate: "dddd, mmmm d, yyyy",
        shortTime: "h:MM TT",
        mediumTime: "h:MM:ss TT",
        longTime: "h:MM:ss TT Z",
        isoDate: "yyyy-mm-dd",
        isoTime: "HH:MM:ss",
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    // Internationalization strings
    dateFormat.i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };

    return dateFormat(this, mask, utc);
};

Date.prototype.parseFromMoment = function (moment, format) {
    return new Date(moment.format(format));
};
Number.prototype.toString = function (decimalPlace) {
    var number = this;
    if (number.isDecimalPartEqualZero()) {
        return number;
    }
    if (typeof decimalPlace === "undefined") {
        //return number.toFixed(2);
        return number.round(2);
    }
    //return number.toFixed(decimalPlace);
    return number.round(decimalPlace);
};

Number.prototype.isDecimalPartEqualZero = function () {
    // toFixed produces a fixed representation accurate to 20 decimal places
    // without an exponent.
    // The ^-?\d*\. strips off any sign, integer portion, and decimal point
    // leaving only the decimal fraction.
    // The 0+$ strips off any trailing zeroes.
    return ((+this).toFixed(20)).replace(/^-?\d*\.?|0+$/g, '').length === 0;
};

Number.prototype.round = function (places) {
    return +(Math.round(this + "e+" + places) + "e-" + places);
};

Number.format = function (value, decimalPlace) {
    if (value) {
        return value.toString(decimalPlace);
    } else {
        value = 0;
        return decimalPlace ? value.toFixed(decimalPlace) : 0;
    }
};

function padLeft(value, length) {
    var str = String(value);
    while (str.length < length)
        str = "0" + str;
    return str;
}

Number.prototype.padLeft = function (length) {
    return padLeft(this, length);
};

String.prototype.padLeft = function (length) {
    return padLeft(this, length);
};
Math.approx = function(num,places) {
  var p = Math.pow(10,places);
  return Math.round(num * p) / p;
}

Math.approxFixed = function(num,places) {
  return this.approx(num,places).toFixed(places);
}

Math.sinDeg = function(deg) {
  return Math.sin( (deg/180) * Math.PI);
}

Math.cosDeg = function(deg) {
  return Math.cos( (deg/180) * Math.PI);
}

Math.tanDeg = function(deg) {
  return Math.tan( (deg/180) * Math.PI);
}

Math.asinDeg = function(val) {
  return Math.asin( val ) * (180/Math.PI);
}

Math.acosDeg = function(val) {
  return Math.acos( val ) * (180/Math.PI);
}

Math.atanDeg = function(val) {
  return Math.atan( val ) * (180/Math.PI);
}

Array.prototype.max = function() {
  return Math.max.apply(Math, this);
}

Array.prototype.min = function() {
  return Math.min.apply(Math, this);
}

String.prototype.ltrim = function() {
  return this.replace(/^\s+/,'');
}

String.prototype.rtrim = function() {
  return this.replace(/\s+$/,'');
}
  
String.prototype.trim = function() {
  return this.ltrim().rtrim();
}

String.prototype.despace = function() {
  return this.trim().replace(/\s+/g,' ');
}

String.prototype.textLength = function(mode) {
  var txt = this.despace();
  switch (mode) {
    case 'alpha':
      txt = txt.replace(/[^a-z]/gi,'');
      break;
    case 'alphanum':
      txt = txt.replace(/[^a-z0-9]/gi,'');
      break;  
  }
  return txt.length;
}

String.prototype._contains = function(type,str,mode) {
  var rgx, source;
  if (str.constructor == RegExp) {
    switch (mode) {
    case 'word': case 'f': case 'fuzzy': case 'smart': case 'regex':
      default:
        mode = 'f';
        break;
    }
    var ar = str.toString().split('/');
    str = ar.length>0? ar[1] : '';
  }
  if (typeof str != 'string') {
    str = '';
  }
  switch (mode) {
    case 'i':
    case 't': case 'trim': case 'ti':
      switch (mode) {
        case 'i': case 'ti':
          source = this.toLowerCase();
          str = str.toLowerCase();
          break;
        default:
          source = this;
          break;
      }
      switch (mode) {
        case 't': case 'ti': case 'trim':
          source = source.trim();
          break;
      }
      break;
    case 'f': case 'fuzzy': case 'smart': case 'regex': case 'word':
      var b = mode=='word'? '\\b' : '';
      switch (type) {
        case 'start':
          rgx = '^' + str + b;
          break;
        case 'end':
          rgx = b + str + '$';
          break;
        default:
          rgx = b + str + b;
          break;
      }
      return new RegExp(rgx,'i').test(this);
      break;  
    default:
      source = this;
      break;
  }
  var index = source.indexOf(str);
  switch (type) {
    case 'start':
      return  index == 0;
    case 'end':
      return  index == (this.length - str.length);  
    default:
      return index >= 0;
  }
  return false;
}

String.prototype.startsWith = function(str,mode) {
  return this._contains('start',str,mode);
}

String.prototype.endsWith = function(str,mode) {
  return this._contains('end',str,mode);
}

String.prototype.contains = function(str,mode) {
  return this._contains('contain',str,mode);
}

String.prototype.first = function(separator) {
  return this.split(separator).shift();
}

String.prototype.last = function(separator) {
  return this.split(separator).pop();
}

String.prototype.tailHead = function(separator,mode) {
  var parts = this.split(separator), rest = '';
  if (mode == 'tail') {
    parts.shift();
  } else {
    parts.pop();
  }
  if (parts.length>0) {
    rest = parts.join(separator);
  }
  return rest;
}

String.prototype.tail = function(separator) {
  return this.tailHead('tail');
}

String.prototype.head = function(separator) {
  return this.tailHead('head');
}

String.prototype.segment = function(index,separator) {
  var parts = this.split(separator),segment = '';
  if (parts.length > index) {
    segment = parts[index]
  }
  return segment;
}

String.prototype.sanitize = function(separator) {
  return this.toLowerCase().replace(/[^0-9a-z]+/i,'').replace(/[^0-9a-z]+$/i,'').replace(/[^0-9a-z]+/gi,separator);
}

String.prototype.numberStrings = function() {
  return this.replace(/[^0-9.-]+/g,' ').trim().split(' ');
}

String.prototype.toNumberString = function() {
  return this.numberStrings().shift();
}

String.prototype.endNumber = function() {
  var n = -1, ns = this.numberStrings();
  if (ns.length>0) {
    n = ns.pop() - 0;
  }
  return n;
}

String.prototype.isNumeric = function(allowCommas) {
  var rgx = new RegExp('^\\s*-?\\d+(\\.\\d+)?\\s*$');
  return rgx.test(this);
}

function isNumeric(scalarVal) {
  switch (typeof scalarVal) {
    case 'number':
      return !isNaN(scalarVal);
    case 'string':
    return scalarVal.isNumeric();
  }
}

String.prototype.endInt = function() {
  return Math.abs(parseInt(this.endNumber()));
}


String.prototype.toInt = function() {
  var n = this.toNumberString();
  if ( !isNaN(n) ) {
    return parseInt(n);
  }
  return 0;
}

String.prototype.toFloat = function() {
  var n = this.toNumberString();
  if (!isNaN(n)) {
    return parseFloat(n);
  }
  return 0;
}
/*
Language-sensitive text utils library
*/
var TextUtils = {
  filterSmallWords: function(word) {
    switch (word.toLowerCase()) {
      case 'to':
      case 'the':
      case 'that':
      case 'those': 
      case 'this':  
      case 'these': 
      case 'in':
      case 'on':
      case 'upon':
      case 'over':
      case 'above': 
      case 'among': 
      case 'between':   
      case 'about': 
      case 'at':
      case 'of':
      case 'in':
      case 'for': 
      case 'and':
      case 'a':
      case 'an':
      case 'from':
      case 'with':
      case 'against':
        return false;
      default:
        return true;
    }
  }
}

/*
Capitalize irrespective of word or apply filter
*/
String.prototype.capitalize = function(smart) {
  var parts = this.split(/\b/), text = '',
    num = parts.length,word,wordLen = 0, cast = true;
  smart = smart? true : false;
  if (num > 0) {
    for (k in parts) {
      word = parts[k];
      wordLen = word.length;
      if (wordLen>0) {
        cast = (k > 0 && smart)? TextUtils.filterSmallWords(word) : true;
        if (cast) {
          text += word.substring(0,1).toUpperCase();
          if (word.length > 1) {
            text += word.substring(1,wordLen);
          }
        } else {
          text += word;
        }
      }
    }
  }
  return text;
}

String.prototype.titleCase = function(smart) {
  return this.capitalize(true);
}

/*
Clean strings that will be translated to Unix commands to avoid
writing to files, appending or piping other commands
*/
String.prototype.cleanCommand = function() {
  return this.split("|").shift().split(">").shift().split('&').shift().split("<").shift();
}

/*
Simply Word object
*/
var Word = function(str) {
  this.letters = str.split('');
}

Word.prototype.length = function() {
  return this.letters.length;
}

Word.prototype.get = function(index) {
  var letter = '';
  if (index < this.letters.length) {
    letter = this.letters[index];
  }
  return letter;
}

Word.prototype.size = function() {
  return this.letters.length;
}

Word.prototype.append = function(str) {
  if (str) {
    var letters = str.split('');
    for (l in letters) {
      this.letters.push(letters[l]);
    }
  }
  return this;
}

Word.prototype.toString = function() {
  return this.letters.join('');
}

function convertDDToDMS(D, lng){
  return {
    dir : D<0?lng?'W':'S':lng?'E':'N',
    deg : 0|(D<0?D=-D:D),
    min : 0|D%1*60,
    sec :(0|D*60%1*6000)/100
  };
}

function convertDegStringToDec(degStr) {
  if (/^\d+/.test(degStr)) {
    var parts = degStr.split(/[^0-9a-z._-]+/),
      numParts=parts.length,i=0,deg=0,min=0,sec=0;
    for (;i<numParts;i++) {
      switch (i) {
        case 0:
          deg = parseInt(parts[i]);
          break;
        case 1:
          min = parseInt(parts[i]);
          break;
        case 2:
          sec = parseFloat(parts[i]);
          break;
      }
    }
    return convertDmsToDec(deg, min,sec);
  }
}

function convertDmsToDec(deg, min,sec, dir) {
  var degrees = 0;
  if (isNumeric(deg)) {
    degrees = parseInt(deg);
  }
  if (isNumeric(min)) {
    degrees += (parseInt(min) / 60);
  }
  if (isNumeric(sec)) {
    degrees += (parseFloat(sec) / 3600);
  }
  switch (dir) {
    case 'S':
    case 's':
    case 'W':
    case 'w':
      degrees = 0 - degrees;
  }
  return degrees;
}

function toLatLngLabel(coords) {
  return toLatitudeString(coords.lat) + ' '+ toLatitudeString(coords.lng);
}

function toLatitudeString(decLat,format) {
  return _toLatLngString(decLat,'lat',format);
}

function toAstroDegree(decLat,format) {
  if (!format) {
    format = 'plain';
  }
  return _toLatLngString(decLat,'plain',format, true);
}

function parseAstroResult(val,key,pKey) {
  switch (key) {
    case 'lat':
    case 'lng':
    case 'ecl':
    case 'spd':
    case 'ascendant':
    case 'ayanamsa':
    case 'end':
      switch (pKey) {
        case 'geo':
          break;
        default:
          if (isNumeric(val)) {
            val = toAstroDegree(val);
          }
          break;
      }
      break;
    case 'et':
    case 'house':
      if (isNumeric(val)) {
        if (/\.\d\d\d\d+/.test(val)) {
          val = Math.approxFixed(val,3);
        }
      }
      break;
  }
  return val;
}

function toLongitudeString(decLng,format) {
  return _toLatLngString(decLng,'lng',format);
}

function toLatLngStr(coords) {
  if (typeof coords == 'object') {
    return toLatitudeString(coords.lat,'plain') +', '+toLongitudeString(coords.lng,'plain')
  }
}

var numEntryWidget = function(name,value,decPlaces) {
  return '<input type="number" name="degrees_'+name+'" value="' + value + '" size="3" maxlength=3" />';
}

function _toLatLngString(dec,degType,format,approx) {
  if (!approx) {
    approx = false;
  } else {
    approx = true;
  }
  if (isNumeric(dec)) {
    dec = parseFloat(dec);
    var isLng = false,max=90;
    switch (degType) {
      case 'lng':
      case 'long':
      case 'longitude':
        isLng = true;
        max = 180;
        break;
      case 'plain':
        isLng = true;
        max = 360;
        break;
    }
    var min = 0-max;
    if (dec >= max) {
      dec -= (max*2);
    } else if (dec <= min) {
      dec += (max*2);
    }

    var strDeg = '&deg;', strApos = '&apos;',strQuot='&quot;';
    switch (format) {
      case 'plain':
        strDeg='º';
        strApos = '\'';
        strQuot='”';
        break;
    }
    var degree = convertDDToDMS(dec,isLng),
    out = degree.deg + strDeg;
    if (!approx || degree.min > 0 || degree.sec > 0) {
      out +=  ' ' + degree.min + strApos;
    }
    if (!approx || degree.sec > 0) {
      out +=  ' ' + degree.sec + strQuot;
    }
    if (degType !== 'plain') {
      out += ' ' + degree.dir;
    }
    return  out;
  } 
}

var toEuroDate = function(strDate) {
    return strDate.split("-").reverse().join(".");
};

Date.prototype.format = function(order,time,separator) {
  var y = this.getFullYear(), 
    m = zeroPad2(this.getMonth() + 1 ),
    d = zeroPad2(this.getDate()),
    parts=[],
    ds = '-';
  switch (order) {
    case 'dmy':
      parts = [d,m,y];
      ds = '/';
      break;
    case 'mdy':
      parts = [m,d,y];
      ds = '/';
      break;
    default:
      parts = [y,m,d];
      break;
  }
  if (!separator) {
    separator = ds;
  }
  var out = parts.join(separator);
  var tp=[];
  switch (time) {
    case 'm':
      tp = ['h','m'];
      break;
    case 'h':
      tp = ['h'];
      break;
    case 's':
      tp = ['h','m','s'];
      break;
  }
  if (tp.length>0) {
    parts = [];
    for (var i = 0; i < tp.length;i++) {
      switch (tp[i]) {
        case 'h':
          parts.push(zeroPad2(this.getHours()));
          break;
        case 'm':
          parts.push(zeroPad2(this.getMinutes()));
          break;
        case 's':
          parts.push(zeroPad2(this.getSeconds()));
          break;
      }
    }
    out += ' ' + parts.join(':');
  }
  return out;
}

Date.prototype.dmy = function(time,separator) {
  return this.format('dmy',time,separator)
}

Date.prototype.mdy = function(time) {
  return this.format('mdy',time,'/');
}

Date.prototype.ymd = function(time) {
  return this.format('ymd',time,'-');
}

var isoDateTimeToMap = function(isoString) {
  var parts = isoString.split('T'), obj={date:"",time:"00:00:00",valid:false};
  if (parts.length>1) {
    obj.date = parts[0];
    var tob = parts[1].split('.').shift();
    if (typeof tob == 'string') {
      parts = tob.split(':');
      if (parts.length>1) {
        obj.time = parts[0]+':'+parts[1];
        obj.valid = true;
        if (parts.length>2) {
          obj.time += ':'+parts[2];
        }
      }
    }
  }
  return obj;
}

var zeroPad2 = function(num) {
    var isString = typeof num == 'string',
    isNum = typeof num == 'number', str;
    if (isString || isNum) {
       if (isNum || /^\s*\d+\s*$/.test(num)) {
            num = parseInt(num)
       }
       if (num < 10) {
            str = '0' + num;
       } else {
            str = num.toString();
       }
    }
    return str;
};

var toHourOffsetString = function(hourVal,places) {
  var str = '00';
  if (isNumeric(hourVal)) {
    var absVal = Math.abs(hourVal),
      flVal = parseFloat(hourVal),
      isNeg = flVal < 0,
      minVal = flVal % 1,
      hVal = Math.floor(absVal),
      mVal = minVal * 60;
      if (flVal > 0) {
        str = '+';
      } else if (flVal < 0) {
        str = '-';
      } else {
        str = '';
      }
      if (places !== 1) {
        str += zeroPad2(hVal);
      } else {
        str += hVal;
      }
      if (minVal > 0) {
        str += ':' + zeroPad2(mVal);
      }
  }
  return str;
}

var secondsToHours = function(secs) {
  var out = '';
  if (isNumeric(secs)) {
    var hrs = Math.floor(secs/3600),
      mins = Math.floor(secs/60) % 60,
      s = secs%60;
      out = hrs.toString();
      if (mins > 0) {
        out += ':' + zeroPad2(mins);
      }
      if (mins > 0) {
        out += ':' + zeroPad2(s);
      }
  }
  return out;
}

var toSwissEphTime = function(strTime) {
    var parts = strTime.split(":"), t;
    if (parts.length>1) {

        t= zeroPad2(parts[0]) + '.' + zeroPad2(parts[1]);
        if (parts.length>2) {
            t += zeroPad2(parts[2]);
        }
    }
    return t;
};

function objToString(obj) {
    if (typeof obj == 'object') {
        var parts = [], tp;
        for (var sk in obj) {
            tp = typeof obj[sk];
            switch (tp) {
                case 'string':
                case 'number':
                    parts.push(sk + ': ' + obj[sk]);
                    break;
            }
        }
        return parts.join(', ');
    }
}

function localStorageSupported() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function storeItem(key,data) {
  if (localStorageSupported()) {
    var ts = Date.now() / 1000,sd = ts + ':';
    if (typeof data == 'object') {
      sd += 'obj:' + JSON.stringify(data);
    } else {
      sd += 'sca:' + data;
    }
    localStorage.setItem(key,sd);
    return ts;
  }
}

function getItem(key,maxAge,unit) {
  var ts = Date.now() / 1000,obj={expired:true,valid:false},data=localStorage.getItem(key);
  if (localStorageSupported()) {
    if (data) {
      parts = data.split(':');
      if (parts.length>2) {
        if (!maxAge) {
          maxAge = (86400 * 7);
        }
        switch (unit) {
          case 'y':
            maxAge *= (86400 * 365.25);
            break;
          case 'w':
            maxAge *= (86400 * 7);
            break;
          case 'd':
            maxAge *= 86400;
            break;
          case 'h':
            maxAge *= 3600;
            break;
        }
        obj.ts = parts.shift();
        obj.ts = obj.ts - 0;
        obj.type = parts.shift();
        obj.data = parts.join(':');
        if (obj.type == 'obj') {
          obj.data = JSON.parse(obj.data); 
        }
        obj.valid = true;
        if (obj.ts > (ts - maxAge)) {
          obj.expired = false;
        }
      }
    }
  }
  return obj;
}

function deleteItem(key) {
  if (localStorageSupported()) {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      return true;
    }
  }
  return false;
}

var toParamString = function(obj, keys) {
  var str = '', parts=[],aKeys=[];
  if (keys instanceof Array) {
    aKeys = keys;
  }
  if (typeof obj == 'object') {
    var keys = Object.keys(obj),len=keys.length,i=0,k;
    for (;i<len;i++) {
      k = keys[i];
      if (aKeys.length < 1 || aKeys.indexOf(k) > -1) {
        k = keys[i];
        parts.push(k + '=' + obj[k].toString());
      }
    }
    if (parts.length>0) {
      str = parts.join('&');
    }
  }
  return str;
}

var fromParamStr = function(paramStr) {
  var obj = {};
  if (typeof paramStr == 'string') {
    paramStr = paramStr.replace(/^\?/,'');
    var parts = paramStr.split('&'),numParts=parts.length,i=0, sps,k,v;
    for (;i<numParts;i++) {
      sps = parts[i].split('=');
      if (sps.length>1) {
        k = sps[0].replace(/&amp;/,'');
        v = sps[1];
        if (v.length>0) {
          obj[k] = v;
        }
      }
    }
  }
  return obj;
}

var roundDecimal = function(num,decPlaces) {
  if (isNumeric(num)) {
    var m = Math.pow(10,decPlaces);
    num = parseFloat(num);
    return parseInt(num * m) / m;
  }
}

var dateStringFormatted = function(dateStr) {
  var d = new Date(dateStr);
  return zeroPad2(d.getDate()) + '/' + zeroPad2(d.getMonth() + 1) +'/'+ d.getFullYear() + ' ' + zeroPad2(d.getHours()) + ':' + zeroPad2(d.getMinutes());
}

/*
Map a country to country code for geonames search,
consider using Web service for full list of regions
as there are potentially 1000s of combinations
*/
countryStringMap = {
  GB: [
    'united kingdom',
    'britain',
    'england',
    'scotland',
    'wales',
    'uk'
  ],
  US: [
    'united states',
    'usa',
    'america'
  ]
}

var matchCountry = function(str) {
  var cc = 'XX',
    simpleStr = str.trim().toLowerCase().replace(',',' ').replace(/\s\s+/,' ').split(' '),
    opts = [],k,i;
  for (k in  countryStringMap) {
    opts = countryStringMap[k];
    for (i=0;i<opts.length;i++) {
      if (simpleStr.indexOf(opts[i]) >= 0) {
        return k;
      }
    }
  }
  return cc;
}


var convertFtAndMetres = function(flVal,sourceUnit,change) {
  var obj = {
    unit: sourceUnit,
    steps: 10,
    m: 0,
    ft: 0,
    display: 0,
    max:9000
  };
  if (isNumeric(flVal)) {
      var mToFt = 0.3048, 
        intVal = parseInt(flVal);
    switch (sourceUnit) {
      case 'ft':
        obj.steps = 25;
        if (change === true) {
          obj.m = intVal;
          obj.ft = Math.ceil( (intVal/obj.steps) / mToFt) * obj.steps;
        } else {
          obj.m = parseInt(Math.ceil(intVal * mToFt) / obj.steps) * obj.steps;
          obj.ft = intVal;
        }
        
        obj.max = 30000;
        obj.display = obj.ft;
        break;
      default:
        obj.steps = 10;
        if (change === true) {
          obj.m = parseInt(Math.ceil(intVal * mToFt) / obj.steps) * obj.steps;
          obj.ft = intVal;
        } else {
          obj.ft = Math.ceil( (intVal/obj.steps) / mToFt) * obj.steps;
          obj.m = intVal;
        }
        obj.display = obj.m;
        break;
    }
  }
  return obj;   
}
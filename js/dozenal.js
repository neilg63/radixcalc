var app = new Vue({
  el: '#radix-calc',
  data: {
    base: 12,
    baseId: 12,
    maxResults: 50,
    system: 'place-value',
    showDec: true,
    result: 0,
    resultOut:[],
    radixClass: 'radix-12',
    placeSep: '.',
    decResult:0,
    resultSets: [],
    hasResultSets: false,
    prevVal: 0,
    showPrev: false,
    prevNum: 0,
    baseNums: [],
    prevOut: [],
    layoutMode: 'base-12 rows-4-across',
    mode: '',
    prevClicked: '',
    resultPadClass:'',
    showOptions: false,
    optionsHideable:true,
    romanBaseNums: [
      {value: 1,name: 'I',id: 'num-i','class': 'cell-num-i'},
      {value: 5,name: 'V',id: 'num-v','class': 'cell-num-v'},
      {value: 10,name: 'X',id: 'num-x','class': 'cell-num-x'},
      {value: 50,name: 'L',id: 'num-l','class': 'cell-num-l'},
      {value: 100,name: 'C',id: 'num-c','class': 'cell-num-c'},
      {value: 500,name: 'D',id: 'num-d','class': 'cell-num-d'},
      {value: 1000,name: 'M',id: 'num-m','class': 'cell-num-m'},
      {value: 5000,name: 'v',id: 'num-v3','class': 'cell-num-v3 ten-3'},
      {value: 10000,name: 'x',id: 'num-x3','class': 'cell-num-x3 ten-3'},
      {value: 50000,name: 'l',id: 'num-l3','class': 'cell-num-l3 ten-3'},
      {value: 100000,name: 'c',id: 'num-c3','class': 'cell-num-c3 ten-3'},
      {value: 500000,name: 'd',id: 'num-d3','class': 'cell-num-d3 ten-3'},
      {value: 1000000,name: 'm',id: 'num-m3','class': 'cell-num-m3 ten-3'},
    ],
    romanSymbols:[],
    romanNums:{}
  },
  created: function() {
    this.romanSymbols = _.map(this.romanBaseNums,function(r){ return r.name;});
    this.romanNums = _.zipObject(this.romanSymbols,_.map(this.romanBaseNums,function(r){ return r.value;}));
    var stored = getItem('results');
    if (stored.valid) {
      if (stored.data instanceof Array) {
        this.resultSets = stored.data;
        this.hasResultSets = this.resultSets.length>0;
      }
    }
    stored = getItem('options');

      
    if (stored.valid) {
      if (typeof stored.data == 'object'){
        var d = stored.data;
        if (d.base) {
          this.base = parseInt(d.base);
        }
        if (d.baseId) {
          this.baseId = d.baseId;
        }
        if (d.system) {
          this.system = d.system;
        }
        if (d.hasOwnProperty('showDec')) {
          this.showDec = d.showDec;
        }
      }
    }
    this.updateBase();
  },
  watch: {
    result: function() {
      this.resultOut = this.renderOut(this.result);
    },
    prevNum: function() {
      this.prevOut = this.renderOut(this.prevNum);
    },
    base: function() {
      this.updateOptions();
    },
    baseId: function() {
      this.updateOptions();
    },
    showDec: function() {
      this.updateOptions();
    }
  },
  methods: {
    loadNums: function() {
      this.baseNums = [];
      var zeroNum = {
          value: 0,
          name: '0',
          id: 'num-0',
          class: 'cell-num-0'
        },cls='';
      for (var n=1,name; n< this.base;n++) {
        cls = 'cell-num-'+n;
        if (n < 10) {
          name = n.toString();
          if (this.base == 60) {
            name = 'a' + name;
          }
        } else {
          switch (this.base) {
            case 12:
              switch (n) {
                case 10:
                  name = 'd';
                  break;
                case 11:
                  name = 'e';
                  break;
              }
              break;
            case 60:
              name = String.fromCharCode(97 + Math.floor(n/10)) + (n%10).toString();

              break;
            default:
              name = String.fromCharCode(87 + n);
              break;
          }
        }
        if (this.base == 60) {
          cls += ' sup lot-' + Math.floor(n/10);
        }
        this.baseNums.push({
          value: n,
          name: name,
          id: 'num-'+n,
          'class': cls
        });
      }
      if (this.base <= 36) {
        this.baseNums.push(zeroNum);
      } else {
        this.baseNums.unshift(zeroNum);
      }
    },
    loadRoman: function() {
      this.baseNums=this.romanBaseNums;
    },
    enterNum: _.debounce(function(num,name) {
      var res = this.result.toString();
      if (res == '0' || res == 'a0') {
        res = '';
      }
      if (this.base == 60 && num === 0) {
        name = 'a0';
      }
      if (this.validateNum(num,name)) {
        this.result = res + name;
      }
      
      this.decResult = this.convert(this.result);
      this.prevClicked = name;
    },25),
    validateNum: function(num,name) {
      var valid = true;
      console.log(num)
      switch (this.base) {
        case 10:
          if (this.system == 'roman') {
            var chars = this.result.split(''),len=chars.length;
            if (len>0) {
              var pCh = chars[(len-1)],
                currIndex = this.romanSymbols.indexOf(name),
                prevIndex = this.romanSymbols.indexOf(pCh);
                if (currIndex % 2 == 1 && name == pCh) {
                  valid = false;
                }
                if (len>1) {
                  var ppCh = chars[(len-2)],
                    penIndex =this.romanSymbols.indexOf(ppCh);
                    if (currIndex < prevIndex && ppCh==pCh && pCh != name) {
                      valid = false;
                    }
                }
                
            }
          }
          break;
      }
      return valid;
    },
    enterDot: function() {
      if (this.result.contains(this.placeSep)==false) {
        this.result += this.placeSep;
        this.prevClicked = this.placeSep;
      }
    },
    updateBase:function() {
      var parts = this.baseId.toString().split('-');
      if (parts.length>1) {
        this.base = parseInt(parts[0]);
        switch (parts[1]) {
          case 'roman':
            this.system = 'roman';
            break;
          default:
            this.system = 'place-value';
            break;
        }
      } else {
        this.system = 'place-value';
        this.base = parseInt(this.baseId);
      }
      this.radixClass = 'radix-' + this.base;
      if (this.system == 'roman' && this.base == 10) {
        this.loadRoman();
      } else {
        this.system = 'place-value';
        this.loadNums();
      }
      
      switch (this.base) {
        case 2:
          this.layoutMode = 'base-2 rows-3-across';
          break;
        case 8:
          this.layoutMode = 'base-8 rows-4-across';
          break;
        case 10:
          this.layoutMode = 'base-10';
          if (this.system == 'roman') {
            this.layoutMode += ' rows-4-across';
          } else {
            this.layoutMode += '-roman rows-3-across';
          }
          break;
        case 12:
          this.layoutMode = 'base-12 rows-4-across';
          break;
        case 16:
          this.layoutMode = 'base-16 rows-4-across';
          break;
        case 20:
          this.layoutMode = 'base-20 rows-5-across';
          break;
        case 36:
          this.layoutMode = 'base-36 rows-6-across';
          break;
        case 60:
          this.layoutMode = 'base-60 rows-10-across';
          break;
      }
      this.clear();
    },
    _operate: function(newMode) {
      var prevMode = this.mode;
      this.mode = newMode;  
      this.showPrev = true;
      this.prevClicked = newMode;
      if (prevMode != '' && prevMode != '=') {
        this.calc(newMode);
      }
      this.prevVal = this.decResult;
      this.prevNum = this.result;
      this.zeroResult();
    },
    add:function() {
      this._operate('+');
    },
    subtract:function() {
      this._operate('-');
    },
    divide:function() {
      this._operate('/');
    },
    multiply:function() {
      this._operate('*');
    },
    power:function() {
      this._operate('^');
    },
    calc:function(op) {
      if (!op) {
        op = '=';
      }
      var resultSet = {
        first: this.prevNum,
        operator: this.mode,
        second: this.result,
        base: this.base,
        result: 0,
        dec: {
          first: this.prevVal,
          second: this.decResult,
          result: 0
        },
      };
      if (this.mode !== '') {
        var num1 = parseFloat(this.prevVal),
          num2 = parseFloat(this.decResult);
        switch(this.mode) {
          case '+':
            this.decResult = num1 + num2;
            break;
          case '-':
            this.decResult = num1 - num2;
            break;
          case '*':
            this.decResult = num1 * num2;
            break;
          case '^':
            this.decResult = Math.pow(num1,num2);
            break;
          case '/':
            if (num2 !== 0) {
              this.decResult = num1 / num2;
            }
            break;
        }
        if (this.base <= 36) {
          var res = this.decResult.toString(this.base);
        } else {
          var res = this.renderLarge(this.decResult);
        }
        switch (this.base) {
          case 12:
            this.result = res.replace(/a/g,'d').replace(/b/g,'e');
            break;
          case 10:
            if (this.system == 'roman') {
              this.result = this.renderRoman(this.decResult);
            } else {
              this.result = res;
            }
            break;
          default:
            this.result = res;
            break;
        }
        resultSet.result = this.result;
        resultSet.dec.result = this.decResult;
        this.resultSets.unshift(resultSet);
        if (this.resultSets.length > this.maxResults) {
          this.resultSets.pop();
        }
        storeItem('results',this.resultSets);
        if (op == '=') {
          this.hasResultSets = true;
          this.showPrev = false;
          this.mode = '';
          this.prevClicked = '=';
        }
      } else if (this.prevClicked == '=' && op=='=') {
        this.zeroResult();
      }
      return resultSet;
    },
    clear:function() {
      if (this.showPrev && this.decResult === 0) {
        this.prevNum = '0';
        this.prevVal = 0;
        this.showPrev = false;
      } else {
        this.zeroResult();
      }
    },
    truncate: function(numStr) {
      if (typeof numStr == 'string') {
        if (numStr.length>1 && numStr.contains(this.placeSep)) {
          var parts = numStr.split(this.placeSep);
          if (parts.length>1 && parts[1].length>8) {
            parts[1] = parts[1].substring (0,8).replace(/0+$/g,'');
            numStr = parts.join(this.placeSep);
          }
        }
      }
      return numStr;
    },
    convert: function(numStr) {
      if (this.base <= 36 && this.base !== 10) {
        return this._convertAlphaNum(numStr);
      } else if (this.base == 10) {
        if (this.system == 'roman') {
          return this._convertRoman(numStr);
        } else {
          return parseFloat(numStr);
        }
      } else {
        return this._convertDecCols(numStr);
      }
    },
    _convertRoman: function(numStr) {
      var dec=0;
      if (typeof numStr == 'string') {
        numStr = numStr.trim();
        if (numStr.length>0) {
          var chars = numStr.split(''),len=chars.length,i=0,v1,ch,pvs,pCh,currIndex,prevIndex;
          for (;i<len;i++) {
            ch = chars[i].trim();
            currIndex = this.romanSymbols.indexOf(ch);
            if (this.romanNums.hasOwnProperty(ch)) {
              v1 = this.romanNums[ch];
            }
            if (prevIndex < currIndex && pvs.length < 3) {
              dec += v1 - _.sum(pvs);
            } else {
              dec += v1;
            }
            pvs = [v1,v1];
            prevIndex = currIndex;
            pCh = ch;
          }
        }
      }
      return dec;
    },
    _convertDecCols: function(numStr) {
      var parts = numStr.split(this.placeSep),
        val = this._convertDecColPart(parts[0]);
      if (parts.length>1) {
        if (typeof parts[1] == 'string') {
          var len = parts[1].length;
          if (len>0) {
            var v2 = this._convertDecColPart(parts[1]);
            val += v2 / Math.pow(10,len);
          }
        }
      }
      return val;
    },
    _convertDecColPart: function(numStr) {
      var chars = numStr.split(''),
        num=chars.length,
        i=0,
        val=0,
        pow = Math.floor(num/2)-1,v1,v2;
      for (;i<num;i++) {
        if (i%2===0) {
          v1 = (parseInt(chars[i],36) - 10) * 10;
        } else {
          v2 = parseInt(chars[i]);
          val += (v1+v2) * Math.pow(this.base,pow);
          pow--;
          v1 = -1;
          v2 = -1;
        }
      }
      return val;
    },
    _convertAlphaNum: function(numStr) {
      var dec = 0,mult=1;
      switch (this.base) {
        case 12:
          numStr = numStr.trim().replace(/d/g,'a').replace(/e/g,'b');
          break;
      }
      var parts = numStr.split(this.placeSep);
      if (parts.length>1) {
        var frac = parts[1].trim(),
        numPlaces = frac.length,
        fracVal = this.convert(frac),
        mult = Math.pow(this.base,numPlaces),
        wholeVal = this.convert(parts[0]) * mult;
        dec = wholeVal + fracVal;
      } else {
        dec = parseInt(numStr,this.base);
      }
      return parseFloat(dec) / mult;
    },
    renderLarge: function(dec) {  
      var toUnit = function(n) {
        var out = '';
        if (n>10) {

          out = (Math.floor(n/10)+10).toString(36);
        } else {
          out = 'a';
        }
        out +=  (n%10).toString();
        return out;
      }
      var units=[],tot=dec,rem;
      var maxPow = Math.ceil(Math.pow(dec,1/this.base)),p=1;
      for (;p<=maxPow;p++) {
        rem = tot % Math.pow(this.base,p);
        if (p>1) {
          rem /= Math.pow(this.base,(p-1));
        }
        units.unshift(toUnit(rem));
        tot -= rem;
      }
      return units.join('');
    },
    renderRoman: function(dec) {
      var out='';
      if (isNumeric(dec)) {
        var rem=dec,
          n=this.romanSymbols.length,
          i=(n-1),k,v,pv,prop,ratio;
        for (;i>=0;i--) {
          k = this.romanSymbols[i];
          v = this.romanNums[k];
          if (i>0) {
            pk = this.romanSymbols[(i-1)];
            pv = this.romanNums[pk];
          }
          if (v < (rem*2)) {
            prop = v/pv == 5? 0.8 : 0.9; 
            ratio = rem / v;
            if (ratio >= prop) {
              if (ratio >= 1) {
                out += k.repeat(Math.floor(ratio));
                rem = rem%v;
              } else {
                if (prop === 0.9 && i>1) {
                  pk = this.romanSymbols[(i-2)];
                  pv = this.romanNums[pk];
                }
                out += pk + k;
                rem -= (pv + v);
              }
              
            }
          }
        }
      }
      return out;
    },
    zeroResult: function() {
      switch (this.system) {
        case 'roman':
          this.result ='';
          break;
        default:
          this.result ='0';
          break;
      }
      this.decResult = 0;
    },
    backspace: function() {
      var len = this.result.length;
      if (len > 1) {
        var remChars = this.base < 36? 1 : 2;
        this.result = this.result.substr(0,(len-remChars));
        this.decResult = this.convert(this.result);
      } else {
        this.zeroResult();
      }
      
    },
    deleteResult: function(index) {
      if (this.resultSets.length > index) {
        this.resultSets.splice(index,1);
      }
    },
    toggleAllResults: function() {
      switch (this.resultPadClass) {
        case 'show-all-results':
          this.resultPadClass = '';
          break;
        default:
          this.resultPadClass = 'show-all-results';
          break;
      }
    },
    updateOptions: function() {
      var opts = {
        showDec: this.showDec,
        base: this.base,
        system: this.system,
        baseId: this.baseId
      }
      storeItem('options', opts);
    },
    toggleOptions: function() {
      this.showOptions = !this.showOptions;
      this.optionsHideable = !this.showOptions;
    },
    showOptPane: function() {
      if (!this.showOptions) {
        this.showOptions = true;
      } else {
        this.optionsHideable = false;
      }
    },
    hideOptPane: function() {
      if (this.optionsHideable) {
        this.showOptions = false;
      }
    },
    renderOut: function(numStr) {
      var chars=[];
      if (typeof numStr == 'string') {
        if (numStr.length>0) {
          var cs = this.truncate(numStr.trim()).split(''),n=cs.length,i=0,isSup=false,cls=[],ch;
          for (;i<n;i++) {
            ch = cs[i];
            cls = [ch];
            switch (this.base) {
              case 60:
                if (ch != '.') {
                  isSup = !isNumeric(ch);
                  if (isSup) {
                    ch = (parseInt(ch,20) - 10).toString();
                  }
                }
                break;
              case 10:
                if (this.system == 'roman') {
                  isSup = false;
                  if (ch.charCodeAt(0) > 95) {
                    cls.push('ten-3');
                  }
                }
                break;
              default:
                isSup = false;
                break;
            }
            chars.push({
              classes: cls,
              name: ch,
              sup: isSup
            });
          }
        }
      }
      return chars;
    }
  }
});
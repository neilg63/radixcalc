function RationalFraction(decFrac,divisor) {
  if (typeof divisor == 'number') {
    var n=2,mult;
    if (decFrac < 1 && decFrac > 0) {
      mult = 1/decFrac;  
      divisor *= mult;
      decFrac *= mult;
      var rem = (divisor * mult) % 1;
      if (rem !== 0) {
        var fr = new RationalFraction(rem);
        divisor *= fr.divisor;
        decFrac *= fr.divisor;
      } else {
        divisor = Math.round(divisor);
      }
    }
    this.multiple = decFrac;
    this.divisor = divisor;
    if (divisor > 3) {
      for (; n <= (divisor/2);n++) {
        if (divisor % n === 0) {
          mult = this.multiple / (this.divisor/n);
          if (mult >= 1 && console % 1 === 0) {
            this.multiple = Math.round(mult);
            this.divisor = Math.round(n);
            break;
          }
        }
      }
    }
    this.dec = decFrac / divisor;
  } else {
    this.dec = decFrac;
    var convert = function(decFrac) {
      if (typeof decFrac == 'number' && decFrac > 0) {
        var n=2, units=0;
        for (;n<1024;n++) {
          units = decFrac * n;
          if (units % 1 < 0.000001 && units % 1 > -0.000001) {
            return [Math.round(units),n];
          }
        }
      }
      return [0,0];
    }
    var frac = convert(decFrac);
    this.multiple = frac[0];
    this.divisor = frac[1];
  }
}




var app = new Vue({
  el: '#radix-calc',
  data: {
    base: 12,
    baseId: 12,
    maxResults: 50,
    system: 'place-value',
    showDec: true,
    result: {
      base: 0,
      out: [],
      decVal:0,
      decFrac: 0,
      ratFrac: RationalFraction(0),
      baseFrac: {multiple:0,divisor:0},
    },
    prev: {
      base: 0,
      decVal:0,
      out: [],
      decFrac: 0,
      ratFrac: RationalFraction(0),
      baseFrac: {multiple:0,divisor:0},
    },
    radixClass: 'radix-12',
    placeSep: '.',
    resultSets: [],
    hasResultSets: false,
    showPrev: false,
    showRational: false,
    baseNums: [],
    layoutMode: 'base-12 rows-4-across',
    mode: '',
    prevMode: '',
    prevClicked: '',
    resultPadClass:'',
    showOptions: false,
    optionsHideable:true,
    baseName: "Dozenal",
    bases: [
      {id:"2", num: 2, name: "Binary"},
      {id:"8", num: 8, name: "Octal"},
      {id:"10", num: 10, name: "Decimal"},
      {id:"10-roman", num: 10, name: "Roman"},
      {id:"12", num: 12, name: "Dozenal"},
      {id:"16", num: 16, name: "Hexadeximal"},
      {id:"20", num: 20, name: "Vigesimal"},
      {id:"36", num: 36, name: "Base 36"},
      {id:"60", num: 60, name: "Sexagesimal"},
    ],
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
        if (d.hasOwnProperty('showRational')) {
          this.showRational = d.showRational;
        }
      }
    }
    this.updateBase();
  },
  watch: {
    'result.base': function() {
      this.updateNum(this.result);
    },
    'prev.base': function() {
      this.updateNum(this.prev);
    },
    base: function() {
      this.updateOptions();
    },
    baseId: function() {
      this.updateOptions();
    },
    showDec: function() {
      this.updateOptions();
    },
    showRational: function() {
      this.updateOptions();
    },
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
      var res = this.result.base.toString();
      if (res == '0' || res == 'a0') {
        res = '';
      }
      if (this.base == 60 && num === 0) {
        name = 'a0';
      }
      if (this.validateNum(num,name)) {
        this.result.base = res + name;
        if (this.system == 'roman' && this.base == 10) {
          this.rewriteRomanResult(num);
        }
      }
      
      this.result.decVal = this.convert(this.result.base);
      this.prevClicked = name;
    },25),
    validateNum: function(num,name) {
      return true;
    },
    rewriteRomanResult: function(num) {
      var chars = this.result.base.split(''),
        len=chars.length,i=(len-1),
        low = len>5? len-5 : 0,index=-2,
        prevIndex=-2,penIndex=-2,prevCount=0,next=-2;
      if (len>0) {
        for (;i >= low;i--) {
          index = this.romanSymbols.indexOf(chars[i]);
          isFive = index % 2 == 1;
          if (index == prevIndex) {
            prevCount++;
            if (isFive) {
              this.result.base = this.result.base.substring(0,(len-2)) + this.romanSymbols[(index+1)];
            } else if (prevCount>2) {
              next = index + 1;
              if (next < this.romanSymbols.length) {
                this.result.base = this.result.base.substring(0,(len-3)) + this.romanSymbols[next];
              }
            }
          } else {
            prevCount=0;
          }
          if (index == penIndex && ((index+1) == prevIndex || (index+2) == prevIndex)) {
            this.result.base = this.renderRoman(this.result.decVal + num);
          }
          else if (penIndex >= 0 && prevIndex <= penIndex && index >= prevIndex) {
            if (isFive || prevCount > 2) {
              this.result.base = this.renderRoman(this.result.decVal + num);
            }
          }
          penIndex = prevIndex;
          prevIndex = index;
        }
      }
    },
    enterDot: function() {
      if (this.result.base.contains(this.placeSep)==false) {
        this.result.base += this.placeSep;
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
      }var bId = this.baseId;
      var base = _.find(this.bases,function(b) {return b.id == bId});
      if (base) {
        this.baseName = base.name;
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
      this.prev.decVal = this.result.decVal;
      this.prev.base = this.result.base;
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
    toBase: function(decRes) {
      if (this.base <= 36) {
        var res = decRes.toString(this.base);
      } else {
        var res = this.renderLarge(decRes);
      }
      switch (this.base) {
        case 12:
          res = res.replace(/a/g,'d').replace(/b/g,'e');
          break;
        case 10:
          if (this.system == 'roman') {
            res = this.renderRoman(decRes);
          }
          break;
      }
      return res;
    },
    calc:function(op) {
      if (!op) {
        op = '=';
      }
      var resultSet = {
        first: this.prev.base,
        operator: this.mode,
        second: this.result.base,
        base: this.base,
        result: 0,
        rational: null,
        dec: {
          first: this.prev.decVal,
          second: this.result.decVal,
          result: 0
        },
      };
      if (this.mode !== '') {
        var num1 = parseFloat(this.prev.decVal),
          num2 = parseFloat(this.result.decVal);
        switch(this.mode) {
          case '+':
            this.result.decVal = num1 + num2;
            break;
          case '-':
            this.result.decVal = num1 - num2;
            break;
          case '*':
            this.result.decVal = num1 * num2;
            break;
          case '^':
            this.result.decVal = Math.pow(num1,num2);
            break;
          case '/':
            if (num2 !== 0) {
              this.result.decVal = num1 / num2;
            }
            break;
        }
        this.result.base = this.toBase(this.result.decVal);
        resultSet.result = this.result.base;
        resultSet.dec.result = this.result.decVal;
        this.resultSets.unshift(resultSet);
        if (this.resultSets.length > this.maxResults) {
          this.resultSets.pop();
        }
        storeItem('results',this.resultSets);
        if (op == '=') {
          this.hasResultSets = true;
          this.showPrev = false;
          this.prevMode = this.mode;
          this.mode = '';
          this.prevClicked = '=';
        }
      } else if (this.prevClicked == '=' && op=='=') {
        this.zeroResult();
      }
      return resultSet;
    },
    clear:function() {
      if (this.showPrev && this.result.decVal === 0) {
        this.prev.base = '0';
        this.prev.decVal = 0;
        this.showPrev = false;
      } else {
        this.zeroResult();
      }
    },
    truncate: function(numStr) {
      if (typeof numStr == 'string') {
        if (numStr.length>1 && numStr.contains(this.placeSep)) {
          var parts = numStr.split(this.placeSep),
            maxPlaces = 10;
          if (this.base < 3) {
              maxPlaces = 16;
          } else if (this.base < 4) {
              maxPlaces = 14;
          } else if (this.base < 10) {
            maxPlaces = 12;
          } else if (this.base < 21) {
            maxPlaces = 10;
          } else if (this.base < 37) {
            maxPlaces = 8;
          } else {
            maxPlaces = 12;
          }
          if (parts.length>1 && parts[1].length>maxPlaces) {
            parts[1] = parts[1].substring (0,maxPlaces).replace(/0+$/g,'');
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
    updateNum: function(num) {
      num.out = this.renderOut(num.base);
      num.decFrac = num.decVal % 1;
      
      if (this.prevMode == '/' && this.resultSets.length>0) {
        var r = this.resultSets[0];
        if (r.operator == '/') {
          num.ratFrac = new RationalFraction(r.dec.first,r.dec.second);
        }
      } else {
        num.ratFrac = new RationalFraction(num.decFrac);
      }
      num.baseFrac = this.convertBaseFrac(num.ratFrac);
      return num;
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
            val += v2 / Math.pow(this.base,(len/2));
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
      var val = this._renderLarge(Math.floor(dec)),
      frac = (dec%1);
      if (frac > 0) {
        val += this.placeSep + this._renderLargeFrac(frac);
      }
      return val;
    },
    _renderLargeFrac: function(decFrac) {
      var v1 = decFrac,v2,v3,pow,out='';
      for (var i=1;i<6;i++) {
        pow = Math.pow(60,i);
        v2 = v1 * pow;
        if (v2 < 1) {
          out += 'a0';
        } else {
          v3 = Math.floor(v2);

          if (v3 < 10) {
            out += 'a';
          } else {
            out += String.fromCharCode(97 + Math.floor(v3/10));
          }
          out += (v3%10).toString();
          v1 -= (v3/pow);
          v1 *= 1.000000001;
        }
        if (v1 <= 0) {
          break;
        }
      }
      return out.replace(/(a0)+$/,'');
    },
    _renderLarge: function(dec) {  
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
      var maxPow = Math.ceil(Math.pow(dec,1/this.base)),p=1,out='';
      for (;p<=maxPow;p++) {
        rem = tot % Math.pow(this.base,p);
        if (p>1) {
          rem /= Math.pow(this.base,(p-1));
        }
        units.unshift(toUnit(rem));
        tot -= rem;
      }
      return units.join('').replace(/^a0(\w)/,"$1");
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
                if (ratio < 4) {
                  out += k.repeat(Math.floor(ratio));
                } else {
                  out = out.substring(0,(out.length-1)) + k + this.romanSymbols[(i+2)];
                }
                rem = rem%v;
              } else {
                if (prop === 0.9 && i>1) {
                  pk = this.romanSymbols[(i-2)];
                  pv = this.romanNums[pk];
                }
                out += pk + k;
                rem -= (v - pv);
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
          this.result.base ='';
          break;
        default:
          this.result.base ='0';
          break;
      }
      this.result.decVal = 0;
    },
    backspace: function() {
      var len = this.result.base.length;
      if (len > 1) {
        var remChars = this.base < 36? 1 : 2;
        this.result.base = this.result.base.substr(0,(len-remChars));
        this.result.decVal = this.convert(this.result.base);
      } else {
        this.zeroResult();
      }
      
    },
    deleteResult: function(index) {
      if (this.resultSets.length > index) {
        this.resultSets.splice(index,1);
        storeItem('results',this.resultSets)
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
        baseId: this.baseId,
        showRational: this.showRational
      };
      storeItem('options', opts);
    },
    toggleOptions: function() {
      this.showOptions = !this.showOptions;
      this.optionsHideable = !this.showOptions;
    },
    toggleFractions: _.debounce(function() {
      this.showRational = !this.showRational;
    }),
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
          var cs = this.truncate(numStr.trim()).split(''),
            n=cs.length,i=0,isSup=false,cls=[],skip=false,isFrac=false,ch;
          for (;i<n;i++) {
            ch = cs[i];
            if (/[a-z0-9]/i.test(ch)) {
              cls = [ch];
            } else {
              cls = 'sep';
              isFrac = true;
            }
            if (ch == '0' &&  i == 0) {
              cls += ' zero';
            }
            skip = false;
            switch (this.base) {
              case 60:
                if (/[a-z0-9]/i.test(ch)) {
                  isSup = !isNumeric(ch);
                  if (isSup) {
                    ch = (parseInt(ch,20) - 10).toString();
                  }
                  if (i==(n-1) && ch=='a0') {
                    skip = true;
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
            if (!skip) {
              if (isFrac) {
                cls += ' frac';
              }
              chars.push({
                classes: cls,
                name: ch,
                sup: isSup
              });
            }
          }
        }
      }
      return chars;
    },
    convertBaseFrac: function(frac) {
      if (frac instanceof RationalFraction) {
        return {
          multiple: this.toBase(frac.multiple),
          divisor: this.toBase(frac.divisor)
        };
      }
      return {
        multiple: 0,
        divisor: 0
      };
    }
  }
});
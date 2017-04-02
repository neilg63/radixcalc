var app = new Vue({
  el: '#radix-calc',
  data: {
    base: 12,
    showDec: true,
    result: 0,
    radixClass: 'radix-12',
    placeSep: '.',
    decResult:0,
    resultSets: [],
    hasResultSets: false,
    prevVal: 0,
    showPrev: false,
    prevNum: 0,
    baseNums: [],
    layoutMode: 'base-12 rows-4-across',
    mode: '',
    prevClicked: '',
    resultPadClass:''
  },
  created: function() {
    
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
        if (d.hasOwnProperty('showDec')) {
          this.showDec = d.showDec;
        }
      }
    }
    this.updateBase();
  },
  watch: {
    base: function() {
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
        };
      for (var n=1,name; n< this.base;n++) {
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
        this.baseNums.push({
          value: n,
          name: name,
          id: 'num-'+n,
          class: 'cell-num-'+n
        });
      }
      if (this.base < 30) {
        this.baseNums.push(zeroNum);
      } else {
        this.baseNums.unshift(zeroNum);
      }
    },
    enterNum: _.debounce(function(num,name) {
      var res = this.result.toString();
      if (res == '0' || res == 'a0') {
        res = '';
      }
      if (this.base == 60 && num === 0) {
        name = 'a0';
      }
      this.result = res + name;
      this.decResult = this.convert(this.result);
      this.prevClicked = name;
    },25),
    enterDot: function() {
      if (this.result.contains(this.placeSep)==false) {
        this.result += this.placeSep;
        this.prevClicked = this.placeSep;
      }
    },
    updateBase:function() {
      this.base = parseInt(this.base);
      this.radixClass = 'radix-' + this.base;
      this.loadNums();
      switch (this.base) {
        case 2:
          this.layoutMode = 'base-2 rows-3-across';
          break;
        case 8:
          this.layoutMode = 'base-8 rows-4-across';
          break;
        case 10:
          this.layoutMode = 'base-10 rows-3-across';
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
      this.result = '0';
      this.decResult = 0;
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
          case '/':
            if (num2 !== 0) {
              this.decResult = num1 / num2;
            }
            break;
        }
        var res = this.decResult.toString(this.base);
        switch (this.base) {
          case 12:
            this.result = res.replace(/a/g,'d').replace(/b/g,'e');
            break;
          default:
            this.result = res;
            break;
        }
        resultSet.result = this.result;
        resultSet.dec.result = this.decResult;
        this.resultSets.unshift(resultSet);
        storeItem('results',this.resultSets);
        if (op == '=') {
          this.hasResultSets = true;
          this.showPrev = false;
          this.mode = '';
          this.prevClicked = '=';
        }
      } else if (this.prevClicked == '=' && op=='=') {
        this.result = '0';
        this.decResult = 0;
      }
      return resultSet;
    },
    clear:function() {
      if (this.showPrev && this.decResult === 0) {
        this.prevNum = '0';
        this.prevVal = 0;
        this.showPrev = false;
      } else {
        this.result = '0';
        this.decResult = 0;
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
      if (this.base < 36) {
        return this._convertAlphaNum(numStr);
      } else if (this.base == 10) {
        return parseFloat(numStr);
      } else {
        return this._convertDecCols(numStr);
      }
    },
    _convertDecCols: function(numStr) {
      var chars = numStr.split(''),
        num=chars.length,
        i=0,
        val=0,
        pow = Math.floor(num/2)-1,v1,v2;
      for (;i<num;i++) {
        if (i%2===0) {
          v1 = (parseInt(chars[i],20) - 10) * 10;
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
    backspace: function() {
      var len = this.result.length;
      if (len > 1) {
        var remChars = this.base < 36? 1 : 2;
        this.result = this.result.substr(0,(len-remChars));
        this.decResult = this.convert(this.result);
      } else {
        this.result ='0';
        his.decResult = 0;
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
        base: this.base
      }
      storeItem('options', opts);
    }
  }
});
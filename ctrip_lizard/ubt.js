(function(window, document, undefined){

// "use strict";

    if(!window.JSON || !window.JSON.parse || !window.JSON.stringify || typeof localStorage == 'undefined'){
        return 0;
    }

    if(window['$_bf'] && window['$_bf'].loaded === true){
        return;
    }


    try{

        /**
         * Mobile UBT
         * Support h5 & hybrid app
         */
        var u_VERSION = '1.1.0',
            u_docElem = document.documentElement,
            u_NOOP = function(){},
            u_SID_MAX_TIME = 1800000,
            u_TYPES = {
                'undefined'        : 'undefined',
                'number'           : 'number',
                'boolean'          : 'boolean',
                'string'           : 'string',
                '[object Function]': 'function',
                '[object RegExp]'  : 'regexp',
                '[object Array]'   : 'array',
                '[object Date]'    : 'date',
                '[object Error]'   : 'error',
                '[object Object]'  : 'object'
            },
            u_unload = 1,			//=閬垮厤lizard绗竴娆¤皟鐢╱nload鍙戦€丳V
            u_tostr = u_TYPES.toString,
            u_hasOwn = u_TYPES.hasOwnProperty,
            u_trim = u_VERSION.trim,

            u_rvar = /\$\{(\w+)\}/g,
            u_renv = /((test[a-z]?|dev|uat|ui|local)\.sh\.(ctrip|huixuan)travel)|(qa\.nt\.ctripcorp)/i,

            u_cfg = {
                domain	: '',
                refer	: '',
                surl	: '',
                href	: '',
                protocol: '',
                env		: 'online',
                lang 	: '',
                rerun  	: 2,
                debug	: false
            }

        window.$_bf = window.$_bf || {}
        window.$_bf.version = u_VERSION;
        window.$_bf.loaded = true;


        var u = (function(){

            var m_queue = [], m_logs = [];

            var _nav = navigator,
                colorDepth = screen.colorDepth + '-bit',
                lang = (_nav.language || _nav.browserLanguage || "").toLowerCase();

            u_cfg.lang = lang;

            var m = {

                version: u_VERSION,

                readyMax: 30,
                isReady: false,
                enter: (new Date()).getTime(),

                watchdog: function(message, type, level){

                },

                now: Date.now || function(){
                    return (new Date()).getTime();
                },

                toint: function(o){
                    return parseInt(o, 10) || 0;
                },

                plus: function(n){
                    return m.toint(n) + 1;
                },

                type: function(o){
                    return u_TYPES[typeof o] || u_TYPES[u_tostr.call(o)] || (o ? 'object' : 'null');
                },

                isArray: function(o){
                    return m.type(o) == 'array';
                },

                isFunction: function(o){
                    return m.type(o) == 'function';
                },

                isEmpty: function(o){
                    return ((o === undefined) || (o == '-') || (o == ''))
                },

                getRand: function(){
                    return ('' + Math.random()).slice(-8);
                },

                hash: function(str){
                    var hash = 1, charCode = 0, idx;

                    if(!m.isEmpty(str)){
                        hash = 0;
                        for(idx = str.length-1; idx >= 0; idx--){
                            charCode = str.charCodeAt(idx);
                            hash = (hash << 6 & 268435455) + charCode + (charCode << 14);
                            charCode = hash & 266338304;
                            hash = charCode != 0 ? hash^charCode >> 21 : hash;
                        }

                        return hash;
                    }
                },

                getHash: function(){
                    var data = [
                        _nav.appName, _nav.appVersion, _nav.platform, _nav.userAgent,
                            screen.width + screen.height, colorDepth,
                        (document.cookie ? document.cookie : ""),
                        u_cfg.refer
                    ].join('');

                    return m.hash(data);
                },

                $: function(id){
                    if(typeof id !== 'string') return false;
                    return document.getElementById(id);
                },

                $v: function(id){
                    var t = m.$(id);
                    return (t && t.value) || '';
                },

                send: function(param, fn){
                    if(typeof param !== 'string') return false;

                    var url = u_cfg.surl + '/bf.gif?';

                    var _img = new Image();
                    _img.onload = function(){
                        _img = _img.onload = _img.onerror = null;
                        if(fn && m.isFunction(fn)) fn(1);
                    }
                    _img.onerror = function(){
                        _img = _img.onload = _img.onerror = null;
                        if(fn && m.isFunction(fn)) fn(0);
                    }
                    _img.src = url + param + '&rd=' + u.now() + '&jv=' + u_VERSION;

                    return true;
                },

                decode: function(str){
                    return decodeURIComponent(str);
                },

                encode: function(str){
                    return encodeURIComponent(str);
                },

                getCookie: function(key, value, flag){
                    var reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
                    var arr = document.cookie.match(reg);
                    if(arr){
                        return flag ? m.decode(arr[2]) : arr[2];
                    }

                    return value || '';
                },

                getCookieObj: function(key, flag){
                    var ret = {
                        __k: key
                    }

                    var a = [], p;
                    var v = m.getCookie(key, '', flag);

                    if(v){
                        a = v.split('&') || [];
                        for(var i = 0; i < a.length; i++){
                            p = a[i].split('=');
                            if(p.length > 1){
                                ret[p[0]] = p[1];
                            }
                        }
                    }

                    return ret;
                },

                setCookie: function(key, value, opt_maxAge){
                    var domainStr = u_cfg.domain ? ';domain=' + u_cfg.domain : '';
                    var pathStr = ';path=/';
                    var expiresStr = '';

                    if(opt_maxAge >= 0){
                        var futureDate = new Date(m.now() + opt_maxAge);
                        expiresStr = ';expires=' + futureDate.toUTCString();
                    }

                    document.cookie = (key + '=' + m.encode(value) + domainStr + pathStr + expiresStr);
                },

                /**
                 * LocalStorage
                 */
                getItem: function(name, flag){
                    var result = localStorage.getItem(name) || '';

                    if(result && flag){
                        try{
                            result = JSON.parse(result);
                        }catch(e){
                            result = '';
                        }
                    }

                    return result;
                },

                setItem: function(name, value){
                    if(typeof value == 'object'){
                        value = JSON.stringify(value);
                    }

                    if(typeof value !== 'string'){
                        return;
                    }

                    localStorage.setItem(name, value);
                },

                extend: function(){
                    var src, copy, name, options,
                        target = arguments[0] || {},
                        i = 1,
                        length = arguments.length;

                    if(length === i){
                        target = this;
                        --i;
                    }

                    for(; i < length; i++){
                        if((options = arguments[i]) != null){
                            for(name in options){
                                src = target[name];
                                copy = options[name];

                                if(target === copy){
                                    continue;
                                }

                                if(copy !== undefined){
                                    target[name] = copy;
                                }
                            }
                        }
                    }

                    return target;
                },

                uniqueID: function(){
                    return m.getRand() ^ m.getHash() & 2147483647;
                },

                grab: function(name, options){
                    var k, v, o = {};

                    options = options || {};
                    o.v = options.v || '';
                    o.w = options.w || 'default';
                    o.l = options.l || 0;
                    o.t = options.t || 'string';

                    switch(o.w){
                        case 'input':
                            v = m.$v(name);
                            break;
                        case 'cookie':
                            v = m.getCookie(name, o.v);
                            break;
                        case 'function':
                            v = m.isFunction(o.v) ? o.v() : '';
                            break;
                        case 'object':
                        default:
                            v = o.v;
                    }

                    switch(o.t){
                        case 'number':
                            return m.toint(v);
                        case 'boolean':
                            return !!v;
                        default:
                            return o.l ? String(v).substring(0,o.l) : v;
                    }
                },

                getTagIndex: function(elem){
                    var begin = 0;

                    if(elem.parentNode){
                        var fchild = elem.parentNode.firstChild;

                        while(fchild){
                            if(fchild == elem) break;

                            if(fchild.nodeType == 1 && fchild.tagName == elem.tagName){
                                begin++;
                            }
                            fchild = fchild.nextSibling;
                        }
                    }

                    return begin > 0 ? '[' + (++begin) + ']' : '';

                },

                getXpath: function(elem){
                    var arr = [], i = 0, b;

                    while(elem){
                        if(elem.nodeType == 9){
                            break;
                        }

                        var x = elem.nodeName + m.getTagIndex(elem)+ (elem.id ?  "[@id='" + elem.id + "']" : "");

                        if(b = elem.getAttribute('block')){
                            x += "[@block='" + b + "']";
                        }
                        arr[i++] = x;
                        elem = elem.parentNode;
                    }

                    return (arr.reverse()).join('/');
                },

                initDomin: function(hn){
                    hn = hn || location.hostname;

                    if(/^(\d|\.)+$/.test(hn)){
                        return hn;
                    }

                    var r = '', arr = hn.split('.').reverse();

                    r = arr[1] + '.' + arr[0];
                    if(/com\.\w{2,}$/i.test(hn)){
                        r = arr[2] + '.' + r;
                    }

                    return r;
                },

                initEnv: function(v){
                    var protocol = u_cfg.protocol == 'file:' ? 'http:' : u_cfg.protocol;

                    if(u_cfg.debug === true){
                        u_cfg.surl = 'http://localhost';
                    }
                    else if(v == 'dev'){
                        u_cfg.surl = protocol + '//10.3.6.192:8086'
                    }
                    else if(v == 'test'){
                        u_cfg.surl = protocol + '//ubt.uat.qa.nt.ctripcorp.com';
                    }
                    else if(v == 'offline'){
                        u_cfg.surl = protocol + '//ubt.sh.ctriptravel.com';
                    }
                    else if(v == 'uat' || u_renv.test(u_cfg.href)){
                        u_cfg.surl = protocol + '//ubt.uat.qa.nt.ctripcorp.com';
                    }
                    else{
                        v = 'online';
                        u_cfg.surl = protocol + '//s.c-ctrip.com';
                    }

                    u_cfg.env = v;
                },

                init: function(){

                    var loc = window.location || document.location,
                        host = loc.hostname;

                    u_cfg.protocol = loc.protocol;
                    u_cfg.domain = m.initDomin(host);
                    u_cfg.href = loc.href;

                    var env = (typeof window.$_bf.env == 'string') ? window.$_bf.env : 'online';
                    m.initEnv(env);

                    /**
                     鑾峰彇referrer淇℃伅
                     -----------------------*/
                    var ref = '';
                    try{
                        ref = document && document.referrer;
                    }catch(e){};

                    if(ref == '' && window.opener){
                        try{
                            ref = window.opener.location.href;
                        }catch(e){};
                    }

                    u_cfg.refer = ref;
                }
            }

            m.init();

            return m;

        })();

        /**
         * Compress JS
         *	Base64缂栫爜锛屽寘鎷腑鏂囩紪鐮侊紝鍜屾爣鍑嗙殑base64绋嶆湁涓嶅悓鏈€鍚庝袱浣嶄笉鏄�+/
         *	鑰屾槸"-_"瑙ｅ喅URL鏃犻渶鍐嶇紪鐮佺殑闂
         */

        ;(function(_){
            var WinSize = 1024; /* window size */
            var MaxMatches = 63; /* max matches, DO NOT modify! */
            var MinMatches = 3; /* min matches */
            // var B64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            var B64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

            /**
             * @param s Source String
             * @return Compressed String in Base64 form
             */
            _.compress = function(s) {
                var u = new UTF8(s);
                var l = new LZ77(u);
                var b = new B64(l);
                var c, o = [];
                while ((c = b.n()) != null)
                    o[o.length] = c;
                return o.join('');
            } /* compress */

            function UTF8(s) { /* UCS-2 to bytes in utf-8 */
                var p = 0, bs = [], left = 0;

                /* next */
                this.n = function() {
                    if (left == 0) {
                        if (p >= s.length)
                            return null;

                        var c = s.charCodeAt(p++);

                        if (c <= 0x007F) { /* 0x0000 - 0x007F US-ASCII */
                            return c;

                        } else if (c <= 0x07FF) { /* 0x0080 - 0x07FF latin etc */
                            bs[1] = (0x80 | (c & 0x3F));
                            left = 1;
                            return (0xC0 | ((c>>6) & 0x1F));

                        } else if (c >= 0xD800 && c <= 0xDFFF) { /* UCS-4 */
                            throw 'unsupported char code.';
                            return null;

                        } else { /* BMP */
                            bs[0] = (0x80 | ((c>>6) & 0x3F));
                            bs[1] = (0x80 | (c & 0x3F));
                            left = 2;
                            return (0xE0 | ((c>>12) & 0x0F));
                        }

                    } else {
                        return bs[bs.length - left--];
                    }
                }
            } /* UTF8 */

            function LZ77(s) {
                var ser = new Serializer(new Compressor(s));

                /* next */
                this.n = function() {
                    return ser.n();
                }

                function Compressor(s) {
                    var winBytes = [], winHashes = []; /* window */
                    var bs = [], b;
                    var pos = 0, woff, len;

                    while ((b = s.n()) != null)
                        bs.push(b);

                    /* next */
                    this.n = function() {
                        if (pos < bs.length - MinMatches + 1) {
                            var h = hash(bs, pos);
                            woff = 0, len = 0;

                            for (var wpos = 0; wpos < winHashes.length; wpos++) {
                                if (h == winHashes[wpos]) {
                                    var i, j;
                                    for (i = wpos, j = pos;
                                         i < winBytes.length && j < bs.length;
                                         i++, j++)
                                    {
                                        if (winBytes[i] != bs[j] || j - pos >= MaxMatches)
                                            break;
                                    }
                                    if (i - wpos >= len && i - wpos >= MinMatches) {
                                        len = i - wpos;
                                        woff = wpos;
                                    }
                                }
                            }

                            if (len == 0) {
                                var t = [0, bs[pos]]
                                winPut(bs[pos++]);
                                return t;

                            } else {
                                pos += len;
                                return [len, winBytes.length - (woff + len)];
                            }

                        } else if (pos < bs.length) {
                            return [0, bs[pos++]];

                        } else {
                            return;
                        }
                    }

                    function hash(bs, pos) { /* hash first {MinMatches} bytes */
                        var h = 0;
                        for (var i = 0; i < MinMatches; i++)
                            h = h * 131 + bs[pos + i];
                        return h;
                    }

                    function winPut(b) {
                        winBytes.push(b);
                        if (winBytes.length > WinSize) {
                            winBytes.shift(); // pop is slow?
                            winHashes.shift();
                        }

                        if (winBytes.length >= MinMatches) {
                            var i = winBytes.length - MinMatches;
                            winHashes[i] = hash(winBytes, i);
                        }
                    }
                }

                function Serializer(s) {
                    var bs = [], pos = -1, t;

                    while ((t = s.n()) != null) {
                        if (t[0] == 0) {
                            if (pos == -1 || bs[pos] == 255) {
                                bs.push(0x80);
                                pos = bs.length - 1;
                            }
                            bs.push(t[1]);
                            bs[pos]++;

                        } else {
                            pos = -1;
                            /* t[0] <= 63 */
                            bs.push(t[0]);

                            var b = t[1];

                            if (b <= 127) {
                                bs.push(b);

                            } else {
                                var tmp = [];
                                while (b > 0) {
                                    tmp.push(b & 0x7F);
                                    b>>=7;
                                }

                                for (var i = tmp.length - 1; i >= 0; i--) {
                                    bs.push(tmp[i]|0x80);
                                }
                                bs[bs.length - 1] &= 0x7F;
                            }
                        }
                    }

                    pos = 0;

                    /* next */
                    this.n = function() {
                        return (pos >= bs.length) ? null : bs[pos++];
                    }
                }
            } /* LZ77 */

            function B64(s) {
                var buf = [], left = 0;

                /* next */
                this.n = function() {
                    if (left > 0) {
                        return buf[4 - left--];
                    }

                    var bs = [s.n(), s.n(), s.n()];
                    if (bs[0] == null)
                        return null;

                    buf[0] = b64ch(bs[0] >> 2);
                    buf[1] = (bs[1] == null) ?
                        b64ch((bs[0] << 4) & 0x3F) :
                        b64ch(((bs[0] << 4) | (bs[1] >> 4)) & 0x3F);
                    buf[2] = (bs[1] == null) ? '~' : (bs[2] == null) ?
                        b64ch((bs[1] << 2) & 0x3F) :
                        b64ch(((bs[1] << 2) | (bs[2] >> 6)) & 0x3F);
                    buf[3] = (bs[2] == null) ? '~' :
                        b64ch(bs[2] & 0x3F);

                    left = 3;
                    return buf[0];
                }
            } /* B64 */

            function b64ch(i) {
                return B64Chars.charAt(i);
            }
        })(u);


        /**
         UBT Class

         杩欓噷鍖呭惈UBT鐨勬墍鏈夐€昏緫鍙婃暟鎹敹闆嗙殑API
         */

        function UBT(options, fn){

            this.status = {
                destroyed: false,
                isnewvid: 0,
                islogin: 0,
                pvready: false,
                pv: false,
                ps: false
            }

            this.data = {
                orderid	: '',
                abtest	: '',
                pid		: 0,
                vid		: '',
                sid		: 0,
                pvid	: 0,
                tid 	: '',		//=Correction ID
                ppv		: 0,
                ppi		: 0
            }

            this.queue = {};		//user action/matrix queue

            this.init(options, fn);
            this.initUBT();

            /**

             */
            var oThis = this;

            function queueCheck(){

                oThis.queueCheck(true, 'useraction');
                oThis.queueCheck(true, 'matrix');

                if(!(oThis.status.destroyed && oThis.status.pv)){
                    setTimeout(queueCheck, 5000)
                }
            }

            queueCheck();
        }

        UBT.prototype = {
            constructor: UBT,

            init: function(options, fn){
                if(typeof options === 'object'){
                    if(typeof options['page_id'] != 'undefined'){
                        this.data.pid = u.toint(options['page_id']);
                    }

                    if(typeof options['url'] == 'string'){
                        u_cfg.href = options['url'];
                    }

                    if(typeof options['orderid'] == 'string' || typeof options['orderid'] == 'number'){
                        this.data.orderid = options['orderid'];
                    }

                    if(typeof options['refer'] == 'string'){
                        u_cfg.refer = options['refer'];
                    }

                    if(options['tid']){
                        this.data.tid = ('' + options['tid']).substring(0,30);
                    }
                }

                this.pvcallback = u.isFunction(fn) ? fn : u_NOOP;
            },

            initUBT: function(){
                var vid, sid = 0, pvid = 0, ts = 0, create = 0;
                var info = u.getItem('CTRIP_UBT_M', true);

                if(info && info.vid && info.create){

                    vid = info.vid;
                    sid = info.sid;
                    pvid = u.plus(info.pvid);
                    ts = info.sid_ts;
                    //1800000	30鍒嗛挓
                    if(u.now() - ts > u_SID_MAX_TIME){
                        sid = u.plus(sid);
                        this.data.ppi = 0;
                        this.data.ppv = 0;
                    }else{
                        this.data.ppi = info.pid || 0;
                        this.data.ppv = info.pvid || 0;
                    }

                    create = info.create;
                }else{
                    var  a = this.readOldBfa();

                    if(a && a.length > 6){
                        vid = a[1] + '.' + a[2];
                        sid = u.plus(a[6]);
                        pvid = u.plus(a[7]);
                    }else{
                        this.status.isnewvid = 1;
                        vid = u.enter + '.' + u.uniqueID().toString(36);
                        sid = 1;
                        pvid = 1;
                    }

                    create = u.enter;
                }

                this.data.vid = vid;
                this.data.sid = sid;
                this.data.pvid = pvid;

                this.data.ubt = {
                    pid: this.getPid(),
                    vid: vid,
                    sid: sid,
                    pvid: pvid,
                    sid_ts: u.now(),
                    create: create
                };

                this.updateUBT();
            },

            updateUBT: function(pid){
                if(typeof pid == 'number'){
                    this.data.ubt.pid = pid;
                }

                u.setItem('CTRIP_UBT_M', this.data.ubt);
            },

            readOldBfa: function(){
                var v = u.getCookie('_bfa', '', true);

                if(!v){
                    v = u.getItem('_bfa');
                }

                if(v){
                    var a = v.split('.');
                    if(a.length > 6){
                        try{
                            localStorage.removeItem('_bfa');
                            localStorage.removeItem('_bfs');
                            localStorage.removeItem('_bfi');
                        }catch(e){}

                        return a;
                    }
                }

                return false;
            },

            getPid: function(){
                if(!this.data.pid){
                    this.data.pid = u.toint(u.$v('page_id'));
                }

                return this.data.pid;
            },

            getABtest: function(){
                var targ = u.$('ab_testing_tracker'), c = [], v ='';

                while(targ){
                    v += targ.value;
                    c.push(targ);
                    targ.removeAttribute('id');
                    targ.removeAttribute('name');
                    targ = u.$('ab_testing_tracker');
                }

                for(var i = 0; i < c.length; i++){
                    c[i].setAttribute("id","ab_testing_tracker");
                }

                var _hash = '';
                if(_hash = document.location.hash){
                    if(_hash.indexOf('abtest=') !== -1){
                        v += decodeURIComponent(_hash.replace(/.*(abtest=)/i, '').replace(/#.*/i, ''));
                    }
                }

                return v.substring(0, 280);
            },

            get: function(name){
                if(typeof name != 'string') return '';

                switch(name){
                    case 'vid':
                    case 'sid':
                    case 'pvid':
                        return this.data[name];

                    case 'islogin':
                    case 'isnewvid':
                        return this.status[name];

                    case 'fullpv':
                        return this.data.vid + '.' + this.data.sid + '.' + this.data.pvid;
                }
            },

            getCommon: function(refresh){

                var data = [];


                data[0] = this.getPid();	//page_id
                data[1] = this.data.vid;			//vid
                data[2] = this.data.sid;			//sid
                data[3] = this.data.pvid;			//pvid
                data[4] = this.data.tid;
                data[5] = this.getABtest();			//abtest
                data[6] = '';				//offlie module id, h5娌℃湁杩欎釜瀛楁鐩存帴璁剧疆涓虹┖

                return data;
            },

            getUinfo: function(){

                var _param = this.getDatum();
                var info = [10];

                info[1] = this.data.ppi;											// 1	ppi	 	涓婁竴涓〉闈㈢殑page_id
                info[2] = this.data.ppv;											// 2	ppv	 	涓婁竴涓〉闈㈢殑pv_id
                info[3] = u_cfg.href;												// 3	url
                info[4] = screen.width;									// 4	resolution_h
                info[5] = screen.height;								// 5	resolution_C
                info[6] = '';											// 6	engine
                info[7] = u_cfg.lang;											// 7	language
                info[8] = _param['engine'];										// 8	search_engine
                info[9] = _param['keyword'];										// 9	search_keyword
                info[10] = u_cfg.refer;										// 10	referer
                info[11] = this.getABtest();
                info[12] = this.status.isnewvid;										// 12	isnewvid	bool 	0 鎴� 1,鏂扮殑璁垮
                info[13] = this.status.islogin;										// 13	islogin	bool	0 鎴� 1,鐢ㄦ埛鏄惁鐧诲綍

                // user info
                info[14] = _param['user_id'];							// 14	user_id
                info[15] = _param['user_grade'];								// 15	user_grade
                info[16] = _param['corpid'];								// 16	user_corp(getCorpid) 	ID鍖呭惈瀛楁瘝
                info[17] = _param['start_city'];								// 17	start_city	 	榛樿鍑哄彂鍩庡競

                // alliance
                info[18] = _param['alliance_id'];								// 18	alliance_id
                info[19] = _param['alliance_sid'];								// 19	alliance_sid
                info[20] = _param['alliance_ouid'];							// 20	alliance_ouid

                info[21] = this.data.orderid;									// 21	order_id	string	璁㈠崟ID
                info[22] = _param['duid'];										// 22	duid	string	鍔犲瘑uid	 	鐢ㄦ埛鐧诲綍鍚庣殑ID鍊�
                info[23] = _param['zdata'];										// 23	zdata	string	搴忓垪鍖栧瓧绗︿覆锛宑ookie(zdatactrip)涓幏鍙�	 	骞垮憡绯荤粺鑾峰彇鐢ㄦ埛涓庡箍鍛婄殑鍏宠仈鍏崇郴
                info[24] = _param['callid'];									// 24	call_id	string	offline call id
                info[25] = _param['bid'];									// 26 	cookie get ads (bid);

                /**
                 *鏃犵嚎娣峰悎搴旂敤锛屽鍔犱袱涓瓧娈�
                 */
                info[26] = u.getItem('GUID');		//Clientid		USERINFO
                info[27] = u.getItem('SOURCEID');		//Sourceid		SOURCEID
                info[28] = _param['appinfo'];		//hybrid appinfo

                return info;
            },

            /**
             涓氬姟鐩稿叧鏁版嵁
             */
            getDatum: function(){

                if(this.data.business){
                    return this.data.business;
                }

                var S = u.getCookieObj('Session'),
                    cui = u.getCookieObj('CtripUserInfo'),
                    spkg = u.getCookieObj('StartCity_Pkg'),
                    union = u.getCookieObj('Union');

                var params = {
                    engine: S && S.SmartLinkCode || '',
                    keyword: S && S.SmartLinkQuary || '',
                    start_city: spkg && spkg.PkgStartCity || '',
                    alliance_id: (union && union.AllianceID) ? union.AllianceID : '',
                    alliance_sid: (union && union.SID) ? union.SID : '',
                    alliance_ouid: (union && union.OUID) ? union.OUID : '',

                    user_id: u.getCookie('login_uid', ''),
                    user_grade: (cui && cui.VipGrade) || '',
                    corpid: u.getCookie('corpid', ''),
                    duid: (cui && cui.U) || '',

                    zdata: u.getCookie('zdatactrip', ''),
                    callid: u.$v('bf_ubt_tl_callid') || '',
                    bid: ''
                }

                try{
                    if(!params.alliance_id){
                        var _un = u.getItem('UNION', true);

                        if(_un && _un.data && (_un.st || _un.timeout)){
                            var _t = 0;
                            if(_un.st){
                                _t = new Date(_un.st);
                            }else{
                                _t = new Date(_un.timeout.replace(/-/g, '/'));
                            }

                            if(_t && _t >= _un.enter){
                                params.alliance_id = (union.AllianceID || union.ALLIANCEID || '');
                                params.alliance_sid = union.SID || ''
                                params.alliance_ouid = union.OUID || '';
                            }
                        }
                    }
                }catch(e){}

                /**
                 * 浠巐ocalStorage鑾峰彇鐢ㄦ埛淇℃伅
                 */
                if(!params.user_id && !params.duid){
                    try{
                        var userinfo = u.getItem('USER', true);

                        if(userinfo && userinfo.value){
                            var _user = userinfo.value;

                            params.user_id = _user.LoginName || _user.UserID || '';
                            params.user_grade = _user.VipGrade || '';
                            // params.corpid = '';
                            // params.duid = ''; 鏆備笉鐭ラ亾鍝釜瀛楁鑾峰彇
                        }
                    }catch(e){}
                }

                if(params.duid || (params.user_id && params.user_grade)){
                    this.status.islogin = 1;
                }

                if(!this.data.orderid){
                    this.data.orderid = u.$v('bf_ubt_orderid');
                }

                if(!this.data.tid){
                    this.data.tid = u.$v('CorrelationId');
                }

                /*
                 鐗堟湰鍙峰湪 Localstorage涓�,key涓篈PPINFO,鏍煎紡涓�
                 {
                 version:"5.2",  //鐗堟湰鍙�
                 appId:"com.ctrip.wrieless", //appid
                 serverVersion:"5.3",        //鏈嶅姟绔増鏈�
                 platform:1, //鍖哄垎骞冲彴锛宨Phone涓�1, Android涓�2, winPhone涓�3
                 }*/
                var appinfo = u.getItem('APPINFO', true);
                if(typeof appinfo == 'object'){
                    params.appinfo = '{"version":' + (appinfo.version || '') + ',"platform":' +(appinfo.platform || '')+ '}';
                }else{
                    params.appinfo = '';
                }

                return this.data.business = params;
            },

            sendPV: function(){

                if(this.status.pvready){
                    return false;
                }

                try{
                    this.getDatum();

                    var d = {
                        c: this.getCommon(true),
                        d: {
                            uinfo: this.getUinfo()
                        }
                    }

                    var param = 'ac=g&d=' + u.encode(JSON.stringify(d));

                    var oThis = this;

                    u.send(param, function(s){
                        if(s){
                            oThis.status.pv = true;
                            oThis.sendPS();
                            oThis.pvcallback(s);

                            var q = oThis.queue['default'];

                            if(q){
                                for(var i = 0; i < q.length; i++){
                                    var o = q[i],
                                        d = oThis.dataHandler(o);

                                    if(d){
                                        u.send(d, o.callback);
                                    }
                                }
                            }
                        }else{
                            if(--u_cfg.rerun > 0) oThis.sendPV();
                        }
                    });

                    /**
                     PV鍙戦€佺殑鏃跺€欐墠鑳借幏鍙栧埌page_id
                     */
                    this.updateUBT(this.getPid());
                    this.status.pvready = true;
                }
                catch(e){
                    //PV Can't send
                };
            },

            getPS: function(){
                var strarr = ["navigationStart", "redirectStart", "unloadEventStart", "unloadEventEnd",
                    "redirectEnd", "fetchStart", "domainLookupStart", "domainLookupEnd", "connectStart",
                    "connectEnd", "requestStart", "responseStart", "responseEnd", "domLoading",
                    "domInteractive", "domContentLoadedEventStart", "domContentLoadedEventEnd",
                    "domComplete", "loadEventStart", "loadEventEnd"];

                var timing = window['performance'].timing,
                    urlarr = [6];		//鐗堟湰淇℃伅
                for (var i = 0; i < strarr.length; i++) {
                    urlarr.push(timing[strarr[i]]);
                }
                urlarr.push(window['performance'].navigation.type || 0);
                urlarr.push(window['performance'].navigation.redirectCount || 0);

                return urlarr;
            },

            sendPS: function(){
                if(!window.performance || this.status.ps){
                    return;
                }

                var times = 0, oThis = this;;

                function checkps(){

                    if(window.performance.timing.loadEventEnd){
                        var d = {
                            c: oThis.getCommon(),
                            d: {
                                ps: oThis.getPS()
                            }
                        }

                        var param = 'ac=g&d=' + u.encode(JSON.stringify(d));
                        u.send(param);
                        return oThis.status.ps = true;
                    }
                    else if(times < 300){
                        times++;
                        setTimeout(checkps, 1000);
                    }

                }

                try{
                    checkps();
                }catch(e){}
            },

            replaceParam: function(str){
                var _param = this.getDatum();

                var d = {
                    duid: _param['duid'],
                    page_id: this.getPid(),
                    is_login: this.status.islogin
                };

                var nstr = str.replace(u_rvar, function(a,c){
                    if(c in d){
                        return d[c];
                    }

                    return a;
                });

                return nstr;
            },

            dataHandler: function(data){
                if(typeof data == 'string'){
                    return data;
                }

                if(typeof data == 'object'){

                    if(data['c'] && data['d']){
                        var d = {
                            c: this.getCommon(),
                            d: data['d']
                        }

                        return 'ac=g&d=' + u.encode(JSON.stringify(d));
                    }
                    else if(data['k'] && data['v']){
                        var v = u.encode(this.replaceParam(data['v']));
                        return 'ac=tl&pi=' + this.getPid() + '&key=' + data['k'] + '&val='+v+'&pv='+this.get('fullpv')+'&v=6';
                    }
                }
            },

            sendData: function(options){

                if(this.status.pv){
                    var param = this.dataHandler(options);

                    if(param){
                        u.send(param, options.callback);
                    }
                }else{
                    this.queuePush('default', options);
                }
            },

            queuePush: function(type, data){
                if(!this.queue[type]){
                    this.queue[type] = [];
                }

                this.queue[type].push(data);

                this.queueCheck(false, type);
            },

            queueCheck: function(last, type){
                if(!this.status.pv || type == 'default'){
                    return false;
                }

                var queue = this.queue[type];

                if(!queue){
                    return;
                }

                var l = queue.length;

                if(l > 5 || (last && l > 0)){
                    var _arr = queue.splice(0, 5);

                    var data = [
                        [1, type],
                        this.getCommon(),
                        _arr
                    ];

                    this.queueSend(data);
                }
            },

            queueSend: function(data){
                var d = '';

                try{
                    d = u.compress(JSON.stringify(data));
                }catch(e){}

                if(d){
                    var param = 'ac=a&d=' + d;
                    u.send(param);
                }
            },

            destroy: function(){
                this.queueCheck(true, 'useraction');
                this.queueCheck(true, 'matrix');

                this.status.destroyed = true;
            },

            ready: function(){
                if(!u.isReady){
                    return;
                }

                this.sendPV();
            }
        }

        var ubt = new UBT();


        /**
         * UBT瀵瑰鐨凙PI鎺ュ彛
         */
        (function(){
            var error_skip = false;

            var u_api = {
                _setDebug: function(flag){
                    if(!!flag){
                        u_cfg.debug = true;
                        u_cfg.surl = 'http://localhost';
                    }
                },

                _setEnv: function(v){
                    if(typeof v !== 'string') return;
                    u.initEnv(v);
                },

                _getFullPV: function(fn){
                    var v = ubt.get('fullpv');

                    if(fn && u.isFunction(fn)){
                        fn(v);
                    }

                    return v;
                },

                _unload: function(flag){
                    if((typeof $ != 'undefined' && $.bindFastClick || typeof Lizard == 'object') && u_unload == 1){
                        u_unload = 0;
                        return;
                    }

                    if(ubt.status.pvready){
                        ubt.destroy();
                        ubt = new UBT();
                    }else{
                        ubt.sendPV();
                        ubt.destroy();
                        ubt = new UBT();
                    }


                },

                _asynRefresh: function(options, fn){
                    if(ubt.status.pvready){
                        ubt.destroy();
                        ubt = new UBT(options || {}, fn);
                        ubt.sendPV();
                    }else{
                        ubt.init(options, fn);
                        ubt.sendPV();
                    }
                },

                _tracklog: function(key, value, fn){
                    if(!value || typeof value != 'string' || typeof key != 'string'){
                        if(u.isFunction(fn)) fn(0);
                        return false;
                    }

                    ubt.sendData({
                        k: key,
                        v: value,
                        callback: fn
                    });
                },

                _trackError: function(options, fn){
                    if(typeof options != 'object'){
                        return false;
                    }

                    if(error_skip){
                        error_skip = false;
                        return false;
                    }

                    if(options.skip === true){
                        error_skip = true;
                    }

                    var keys = ['version', 'message', 'line', 'file', 'category', 'framework', 'time', 'repeat', 'islogin', 'name', 'column'];
                    var data = [7, '', 0, '', '', '', u.now() - u.enter, 1, ubt.get('islogin'), '', 0];

                    for(var i = 1, l=keys.length; i < l; i++){
                        var key = keys[i];
                        if(options[key]){
                            var _v = options[key] + '';

                            switch(key){
                                case 'message':
                                case 'file':
                                    _v = _v.substring(0, 500);
                                    break;
                                case 'category':
                                case 'framework':
                                case 'name':
                                    _v = _v.substring(0, 100);
                                    break;
                                case 'time':
                                    _v = parseInt(_v, 10);
                                    break;
                                case 'column':
                                    _v = parseInt(_v, 10);
                                    break;
                                default:
                                    _v = parseInt(_v, 10) || 0;
                            }

                            data[i] = _v;
                        }
                    }

                    data.push('trace');

                    ubt.sendData({
                        c: true,
                        d: {'error': data},
                        callback: fn
                    });

                },

                _trackUserBlock: function(param, fn){
                    if(typeof param != 'object'){
                        return false;
                    }

                    var data = [];
                    data[0] = 6;
                    data[1] = ubt.get('islogin');
                    data[2] = String(param['message'] || '').substring(0,300);
                    data[3] = String(param['value'] || '').substring(0,300);
                    data[4] = String(param['type'] || '').substring(0,50);
                    data[5] = String(param['dom'] || '').substring(0,100);
                    data[6] = String(param['form'] || '').substring(0,100);
                    data[7] = u.toint(param['count'] || 0, 10);

                    ubt.sendData({
                        c: true,
                        d: {ub: data},
                        callback: fn
                    });
                },

                /**
                 * @param name 	{string} 		Matrix name
                 * @param tag  	{json object} 	Matrix tag
                 * @param value	{number}		Matrix value
                 * @param ts 	{timestamp}		鍙€�
                 */
                _trackMatrix: function(name, tag, value, ts, fn){
                    ts = (typeof ts == 'number') ? ts : u.now();

                    var result = 0;

                    if(typeof name === 'string' && typeof tag === 'object' && typeof value === 'number'){

                        var data = {
                            name: name,
                            tags: tag,
                            value: value,
                            ts: ts
                        }

                        ubt.queuePush('matrix', data);

                        result = 1;
                    }

                    if(u.isFunction(fn)){
                        fn(result);
                    }
                },

                push: function(arr){
                    var fn;

                    if(u.isArray){
                        var fn = arr[0];

                        if(fn[0] == '_' && u.isFunction(u_api[fn])){
                            return u_api[fn].apply(u_api, arr.slice(1));
                        }
                    }

                    return false;
                }
            }

            if(u.isArray(window.__bfi)){
                var arr = window.__bfi, l = arr.length;

                if(l > 0){
                    for(var i = 0; i < l; i++){
                        u_api.push(arr[i]);
                    }
                }
            }else{
                window.__bfi = [];
            }

            window.__bfi.push = u_api.push;


            u.extend(window.$_bf, {
                _getFullPV: u_api._getFullPV,
                tracklog: u_api._tracklog,
                trackError: u_api._trackError,
                asynRefresh: u_api._asynRefresh
            });


        })();

        /**
         * Bootstrap
         */

        var _stid = null;

        function checkReady(){

            var pid = u.$v('page_id');

            if(pid == 'wait'){

            }else{
                pid = u.toint(pid);

                if(pid != 0){
                    u.isReady = true;
                }else if(document.readyState == "complete"){
                    u.isReady = true;
                }else if(u.readyMax <= 0){
                    u.isReady = true;
                }
            }

            if(!u.isReady && u.readyMax > 0){
                u.readyMax--;
                _stid = setTimeout(checkReady, 500);
            }else{
                return ubt.ready();
            }
        }

        checkReady();


        /**
         * UserAction
         */
        document.addEventListener('click', function(e){
            var elem = e.target || e.srcElement;
            var _nodename = elem.nodeName.toUpperCase();

            if(elem.getBoundingClientRect){
                var rect = elem.getBoundingClientRect(), attr = '';

                var sx = Math.max(u_docElem.scrollLeft, document.body.scrollLeft),
                    sy = Math.max(u_docElem.scrollTop, document.body.scrollTop),
                    x = e.pageX || (e.clientX + sx),
                    y = e.pageY || (e.clientY + sy),
                    bx = parseInt((u_docElem.clientWidth || document.body.clientWidth) / 2, 10);
                if(_nodename == 'SELECT' && (y - rect.top - sy) < 0){
                    /**
                     鑾峰彇option鍏冪礌鐨勯紶鏍囧乏杈逛綅缃湁闂锛孖E6~8姝ｅ父锛�
                     IE9+,chrome,firefox鍙婂叾浠栭珮鐗堟湰娴忚鍣ㄦ湁闂,闇€瑕佷慨姝�
                     */
                    attr += "[@x='" + parseInt(x + rect.left + sx - bx, 10) + "'][@y='" + parseInt(y + rect.top,10) + "']";
                    attr += "[@rx='" + x + "']";
                    attr += "[@ry='" + (y - sy) + "']";
                }else{
                    attr += "[@x='" + (x-bx) + "'][@y='" + y + "']";
                    attr += "[@rx='" + parseInt((x - rect.left - sx),10) + "']";
                    attr += "[@ry='" + parseInt((y - rect.top - sy),10) + "']";
                }

                ubt.queuePush('useraction', {
                    action: 'click',
                    xpath: u.getXpath(elem) + attr,
                    ts: u.now()
                });
            }
        });



        /**
         * 鎹曡幏JS閿欒淇℃伅
         */
        if(window.onerror === null){
            var _ErrorsCache = {};

            window.onerror = function(){
                try{

                    var args = arguments;

                    var obj = {
                        message: '' + args[0],
                        file: '' + args[1],
                        category: 'inner-error',
                        framework: 'normal',
                        time: u.now() - u.enter,
                        line: args[2],
                        column: args[3],
                        repeat: 1
                    }

                    var key = 'err_' + u.hash(obj.message + obj.file + obj.line);

                    if(!_ErrorsCache[key]){
                        __bfi.push(['_trackError', obj]);
                        _ErrorsCache[key] = true;
                    }
                }
                catch(e){

                };
            }
        }


        /**
         * Lizard 妗嗘灦椤甸潰搴旂敤
         */
        /*
         if(typeof Lizard == 'object' && typeof Lizard.renderAt != 'undefined'){
         Lizard.viewReady(function(inView){
         if(_stid){
         clearTimeout(_stid);
         }

         __bfi.push(['_asynRefresh', {}]);

         });
         }
         */





    }catch(e){};

})(window, document);
/**
 * Created by mwli on 2014/8/5.
 */

;(function (w) {
    "use strict";
    // 分销平台验证 加载调用
    if (typeof w["__union"] === "undefined") {
        w["__union"] = [];
    }

    var Mkt = Mkt || {};
    Mkt.buildNamespace = function (str) {
        if (typeof str !== "string") {
            return false;
        }
        var root = Mkt,
            arr = str.split("."),
            arrIndex = arr[0] === "Mkt" ? 1 : 0,
            arrLen = arr.length;
        for (; arrIndex < arrLen; arrIndex++) {
            root[arr[arrIndex]] = root[arr[arrIndex]] || {};
            root = root[arr[arrIndex]];
        }
    };

    Mkt.buildNamespace( "Store" );

    /**
     * LocalStorage Factory
     * @returns {{getInstance: getInstance}}
     * @constructor
     */
    Mkt.Store.CommonStore = (function () {
        var instance = null,
            store = w.localStorage;

        if (!store) return;

        function initialize () {

            function getStore (key) {
                if (store && JSON && typeof JSON.parse === "function") {
                    return JSON.parse(store.getItem(key));
                }
                return null;
            }

            /**
             * reset local params
             * @param str
             * @param jsonObj
             * @param salesId
             */
            function setStoreParam (str, jsonObj, salesId, day) {

                if (arguments.length < 2) throw 'The arguments less than 2';
                var self = this,
                    storeObj = self.getStore(str) || null,
                    storeJson = null;

                if (str === "SALES_OBJECT") {
                    storeJson = {
                        value: jsonObj,
                        tag: salesId || storeObj.tag || "",
                        oldvalue: storeObj && storeObj.oldvalue ? storeObj.oldvalue : null,
                        timeout: Mkt.Utils.formatDate('Y/m/d H:i:s', new Date(), day), // + 30 day
                        savedate: Mkt.Utils.formatDate('Y/m/d H:i:s', new Date())
                        //serverfrom: jsonObj.value // 来源
                    }
                } else {
                    storeJson = {
                        data: jsonObj,
                        timeout: Mkt.Utils.formatDate('Y/m/d H:i:s', new Date(), day) //
                    }
                }

                self.setStore(str, storeJson);
            }
            function getStoreParam (key, subKey) {
                var self = this,
                    subKey = subKey || "data",
                    localVal = self.getStore(key);
                if ( localVal && localVal[subKey] ) {
                    return localVal[subKey];
                }
                return null;
            }
            /**
             *  setter
             * @param key string
             * @param val jsonObj
             */
            function setStore (key,val) {
                // fix iPhone/iPad上有时设置setItem()时会出现诡异的QUOTA_EXCEEDED_'''ERR错误
                store.removeItem(key);
                if (JSON && typeof JSON.stringify === "function") {
                    store.setItem(key,JSON.stringify(val));
                } else {
                    store.setItem(key,val);
                }
            }
            function removeStore (key) {
                store.removeItem(key);
            }
            return {
                getStore: getStore,
                setStore: setStore,
                setStoreParam: setStoreParam,
                getStoreParam: getStoreParam,
                removeStore: removeStore
            }
        }
        return {
            getInstance: function () {
                if (!instance) {
                    instance = initialize.call(Mkt.Store);
                }
                return instance;
            }
        }
    }());

    Mkt.buildNamespace( "Mkt.Dom" );
    Mkt.Dom.elems = [];
    Mkt.Dom.getByClass = function ( className, rootNode, tagName ) {
        var self = this,
            targetArr = [],
            root = rootNode,
            tag = typeof tagName === "string" ? tagName : "*";
        if (root) {
            root = typeof root === "string" ? self.getById( root ) : rootNode;
        } else {
            root = document.body;
        }

        var tagElems = root.getElementsByTagName( tag ),
            idx = 0, len = tagElems.length;

        for (; idx < len; idx++) {
            var tIdx = 0, tElems = tagElems[idx].className.split(" "), tLen = tElems.length;
            for (; tIdx < tLen; tIdx++) {
                if (tElems[tIdx] == className) {
                    targetArr.push(tagElems[idx]);
                    break;
                }
            }
        }

        if (targetArr.length > 0) {
            self.elems = targetArr;
        } else {
            self.elems = [];
        }

        return self;
    };
    Mkt.Dom.getById = function ( id ) {
        var self = this,
            elem = document.getElementById( id );
        self.elems = [];
        if (elem) {
            self.elems.push(elem);
        }
        return self;
    };
    Mkt.Dom.html = function ( html ) {
        var self = this,
            idx = 0, len = self.elems.length;
        for (; idx < len; idx ++) {
            if (self.elems[idx] && self.elems[idx].nodeType === 1 && typeof html === "string") {
                self.elems[idx].innerHTML = html;
            }
        }
        return self;
    };
    Mkt.Dom.show = function () {
        var self = this,
            idx = 0, len = self.elems.length;
        for (; idx < len; idx ++) {
            if (self.elems[idx] && self.elems[idx].nodeType === 1) {
                self.elems[idx].style.display = "block";
            }
        }
        return self;
    };
    Mkt.Dom.hide = function () {
        var self = this,
            idx = 0, len = self.elems.length;
        for (; idx < len; idx ++) {
            if (self.elems[idx] && self.elems[idx].nodeType === 1) {
                self.elems[idx].style.display = "none";
            }
        }
        return self;
    };

    Mkt.buildNamespace( "Mkt.Ajax" );
    Mkt.Ajax.obj = (function () {
        var xmlHttp;
        try {
            // Firefox, Opera 8.0+, Safari
            xmlHttp = new XMLHttpRequest();
        } catch (e) {
            // Internet Explorer
            try {
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                    throw "您的浏览器不支持AJAX";
                    return false;
                }
            }
        }
        return xmlHttp;
    }());
    Mkt.Ajax.httpSuccess = function( xhr ){
        return xhr.status >= 200 && xhr.status < 300 || xhr.status == 304;
    };
    /*
     *  jsonCfg {url, type, successFn, errorFn, async, param }
     * */
    Mkt.Ajax.submitRequest = function (jsonCfg) {
        if (!jsonCfg) return;

        var self = this,
            xmlhttp = self.obj;

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (self.httpSuccess(xmlhttp) && xmlhttp.responseText) {
                    jsonCfg.success(xmlhttp.responseText);
                } else {
                    jsonCfg.error(xmlhttp.responseText);
                }
            }
        };
        xmlhttp.open(jsonCfg.type, jsonCfg.url, jsonCfg.async || true);
        xmlhttp.send(jsonCfg.param);
    };

    Mkt.Utils = {
        /***
         * from Lizard
         * @param formatStr
         * @param dateObj
         * @param addDays
         * @returns {String}
         */
        formatDate: function (formatStr, dateObj, addDays) {
            var date = dateObj;
            //Y/m/d H:i:s
            var dateMaps = {
                //有前导零的日期值
                'd': function(str, date, key) {
                    var d = date.getDate().toString();
                    if (d.length < 2) d = '0' + d;
                    return str.replace(new RegExp(key, 'mg'), d);
                },
                //有前导零的月份
                'm': function(str, date, key) {
                    var d = (date.getMonth() + 1).toString();
                    if (d.length < 2) d = '0' + d;
                    return str.replace(new RegExp(key, 'mg'), d);
                },
                //四位年份
                'Y': function(str, date, key) {
                    return str.replace(new RegExp(key, 'mg'), date.getFullYear());
                },

                //有前导零的小时，24小时制
                'H': function(str, date, key) {
                    var d = date.getHours().toString();
                    if(d.length < 2) d = '0' + d;
                    return str.replace(new RegExp(key, 'mg'), d);
                },
                //有前导零的分钟
                'i': function(str, date, key) {
                    var d = date.getMinutes().toString();
                    if(d.length < 2) d = '0' + d;
                    return str.replace(new RegExp(key, 'mg'), d);
                },
                //有前导零的秒
                's': function(str, date, key) {
                    var d = date.getSeconds().toString();
                    if(d.length < 2) d = '0' + d;
                    return str.replace(new RegExp(key, 'mg'), d);
                }
            };

            function addDay (n) {
                n = n || 0;
                date.setDate(date.getDate() + n);
                return date;
            }

            /**
             * 日期格式化
             * @param format
             * @returns (String)formattedDate
             */
            function format (format) {
                if(typeof format !== 'string')
                    format = '';

                for (var key in dateMaps) {
                    format = dateMaps[key].call(this, format, date, key);
                }
                return format;
            }
            if (addDays) {
                date = addDay(addDays);
                return format(formatStr);
            }
            return format(formatStr);
        },
        getUa: function () {
            var ua = window.navigator.userAgent.toLocaleLowerCase(),
                isApple = !!ua.match(/(ipad|iphone|mac)/i),
                isAndroid = !!ua.match(/android/i),
                isWinPhone =  !!ua.match(/MSIE/i);
            return {
                isApple: isApple,
                isAndroid: isAndroid,
                isWinPhone: isWinPhone
            }
        },
        getPlatFormCode: function () {
            var self = this,
                platform = self.getUa();
            if (platform.isApple) {
                platform = "ios-app";
            } else if (platform.isAndroid) {
                platform = "andreod-app";
            } else if (platform.isWinPhone) {
                platform = "win-app";
            }
            return platform;
        },
        getUrlParam: function ( url, param ) {
            var url = url || document.location.href,
                re = new RegExp("(\\\?|&)" + param + "=([^&]+)(&|$)", "i"),
                m = url.match(re);
            if (m) {
                return m[2];
            }
            return '';
        },
        base64: function () {
            // private property
            var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

            // public method for encoding
            var encode = function (input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;
                input = _utf8_encode(input);
                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output +
                        _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                        _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
                }
                return output;
            };

            // public method for decoding
            var decode = function (input) {
                var output = "";
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                while (i < input.length) {
                    enc1 = _keyStr.indexOf(input.charAt(i++));
                    enc2 = _keyStr.indexOf(input.charAt(i++));
                    enc3 = _keyStr.indexOf(input.charAt(i++));
                    enc4 = _keyStr.indexOf(input.charAt(i++));
                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;
                    output = output + String.fromCharCode(chr1);
                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }
                }
                output = _utf8_decode(output);
                return output;
            };

            // private method for UTF-8 encoding
            function _utf8_encode (string) {
                string = string.replace(/\r\n/g,"\n");
                var utftext = "";
                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }

                }
                return utftext;
            }

            // private method for UTF-8 decoding
            function _utf8_decode (utftext) {
                var string = "";
                var i = 0;
                var c = 0, c1 = 0, c2 = 0, c3 = 0;
                while ( i < utftext.length ) {
                    c = utftext.charCodeAt(i);
                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    } else if((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i+1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    } else {
                        c2 = utftext.charCodeAt(i+1);
                        c3 = utftext.charCodeAt(i+2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }
                }
                return string;
            }

            return {
                encode: encode,
                decode: decode
            }
        }
    };

    /**
     * 分销控制组件
     */
    Mkt.Sales = (function () {

        var dom = Mkt.Dom,
            salesObj = null,
            warning404Tel = "4000086666",
            commonStore = Mkt.Store.CommonStore.getInstance();

        /***
         * getter SALES_OBJECT data
         * @param sales
         * @param callback
         * @param error
         */
        var getSalesObject = function (sales, callback, error) {
            var salesObject = commonStore.getStore("SALES_OBJECT") && commonStore.getStore("SALES_OBJECT").value ?
                commonStore.getStore("SALES_OBJECT").value : null;
            if (salesObject && salesObject.sid == sales) {
                salesObj = salesObject;
                if (!salesObject.appurl || salesObject.appurl.length <= 0) {
                    dom.getById("dl_app").hide();
                } else {
                    dom.getById("dl_app").show();
                }
                callback && callback(salesObject);
            } else {
                var url = '/html5/ClientData/GetSalesInfo/' + sales;
                Mkt.Ajax.submitRequest({
                    url: url,
                    type: "POST",
                    success: function (data) {
                        if (!JSON && typeof JSON.parse !== "function") return;
                        var _data = {};
                        data = JSON.parse(data);
                        if (data.ServerCode == 1) {
                            if (data.Data) {
                                for (var i in data.Data) {
                                    _data[i.toLowerCase()] = data.Data[i];
                                }
                                data.Data = _data;

                                var day = 30;
                                if (data.Data && (data.Data.sales === 'ydwxcs' || data.Data.sales === '1622')) {
                                    day = 5;
                                }
                                if (!data.Data.appurl || data.Data.appurl.length <= 0) {
                                    dom.getById("dl_app").hide();
                                } else {
                                    dom.getById("dl_app").show();
                                }
                                commonStore.setStoreParam("SALES_OBJECT", data.Data, sales, day);
                                commonStore.setStoreParam("SALESOBJ", data.Data, sales, day);
                            }
                            salesObj = data.Data;
                            callback && callback(data.Data);
                        } else {
                            error && error(data);
                        }
                    },
                    error: function (e) {
                        error && error(e);
                    }
                });
            }
        };
        var getSales = function () {
                var salesVal = commonStore.getStore("SALES_OBJECT") && commonStore.getStore("SALES_OBJECT").value ?
                    commonStore.getStore("SALES_OBJECT").value : null;
                return salesObj || salesVal;
            },
            setSales = function (sales) {
                commonStore.setStoreParam("SALES", { sales: sales });
            },
            setSourceId = function (sourceid) {
                commonStore.setStoreParam("SALES", { sourceid: sourceid });
            },
            setUnion = function (Union) {
                commonStore.setStoreParam("UNION", Union);
            };

        var RegTel = /400\d{3}\d{4}/i,
            RegTelTitle = /400\s+\d{3}\s+\d{4}/i,
            RegTelTitle2 = /400-\d{3}-\d{4}/i,
            ua = Mkt.Utils.getUa();

        /***
         * 替换电话
         * @param str
         * @returns {*}
         */
        function replaceTel (str) {
            var salesObj = getSales();
            if (salesObj && salesObj.tel) {
                if (typeof str === "string") {
                    str = str.replace(RegTel, salesObj.tel);
                    str = str.replace(RegTelTitle, salesObj.teltitle);
                    if (salesObj.teltitle) str = str.replace(RegTelTitle2, salesObj.teltitle.split(' ').join('-'));
                } else {
                    str = salesObj.teltitle ? salesObj.teltitle.split(' ').join('-') : str;
                }
            }
            return str;
        }

        /***
         * 替换app下载地址
         * @returns {*}
         */
        function replaceStrApp () {
            var salesObj = getSales();
            if (salesObj) {
                if (salesObj.isseo) {
                    dom.getByClass("module").show();
                }
                if (salesObj.appurl) {
                    return salesObj.appurl;
                } else {
                    var str = salesObj.sid ? salesObj.sid : salesObj.sales;
                    return "/market/download.aspx?from=" + str;
                }
            }
            return null;
        }

        /**
         * 替换页面中的文本 （电话及下载地址）
         * @param
         */
        function replaceContent() {
            //修改链接中的电话
            var MARKLINKCLASS = '__hreftel__',
            //修改内容中的电话
                MARKCONTCLASS = '__conttel__',
            //修改应用的下载链接
                MAREAPPADDRESS = '__appaddress__',
                elems,
                replacedAppHref = replaceStrApp();

            elems = dom.getByClass(MARKLINKCLASS).elems;
            for (var idx = 0, len = elems.length; idx < len; idx++) {
                elems[idx].href = replaceTel(elems[idx].href);
            }

            elems = dom.getByClass(MARKCONTCLASS).elems;
            for (var idx = 0, len = elems.length; idx < len; idx++) {
                elems[idx].innerHTML = replaceTel(elems[idx].innerHTML);
            }

            elems = dom.getByClass(MAREAPPADDRESS).elems;
            for (var idx = 0, len = elems.length; idx < len; idx++) {
                var href = replacedAppHref;
                if (!href) {
                    switch (true) {
                        case ua.isApple:
                            href = elems[idx].getAttribute("data-ios-app");
                            break;
                        case ua.isAndroid:
                            href = elems[idx].getAttribute("data-android-app");
                            break;
                        case ua.isWinPhone:
                            href = elems[idx].getAttribute("data-win-app");
                            break;
                    }
                }
                if (href) {
                    elems[idx].setAttribute("href", href);
                }
            }
        }

        function updateSales () {

            // 优先获取url中的渠道参数
            var urlSourceid = Mkt.Utils.getUrlParam(null, 'sourceid'),
                urlSales = Mkt.Utils.getUrlParam(null, 'sales');

            // 分销参数存在 清除 APP_DOWNLOAD
            if ((urlSourceid && +urlSourceid > 0) || (urlSales && urlSales.length > 0)) {
                commonStore.removeStore("APP_DOWNLOAD");
            }
            // 如果url分销参数存在，则获取服务端的渠道配置
            if (urlSourceid || urlSales) {
                if (urlSales) {
                    setSales(urlSales);
                }
                if (urlSourceid) {
                    setSourceId(urlSourceid);
                }
                getSalesObject(urlSales || urlSourceid, $.proxy(function (data) {
                    // 如果没有配置下载渠道包，则隐藏下载广告浮层2014-1-4 caof
                    if (!data.appurl || data.appurl.length <= 0) {
                        dom.getById("dl_app").hide();
                    }
                    warning404Tel = data && data.tel ? data.tel : '4000086666';
                    replaceContent();
                }));

                if (typeof window["_Mkt_"] === "object" && window["_Mkt_"].length > 0) {
                    var index = 0,
                        len = window["_Mkt_"].length,
                        obj = null;
                    for (; index < len; index++) {
                        obj = window["_Mkt_"][index];
                        obj.callback && obj.callback();
                    }
                }

            } else {
                //若已经存储有渠道信息，则替换渠道的电话，下载地址信息
                replaceContent();
            }

        }

        // push callback
        w["__union"].push({
            callback: updateSales
        });

        return {
            warning404: warning404Tel,
            // 替换当前页面中内容 (电话 下载地址)
            replaceContent: replaceContent,
            // 替换电话
            replaceTel: replaceTel,
            // SALES_OBJECT  getter
            getSales: getSales,
            // SALES_OBJECT getter
            getSalesObject: getSalesObject,
            // UNION  setter
            setUnion: setUnion,
            // SALES  setter
            setSourceId: setSourceId,
            // SALES  setter
            setSales: setSales,
            //reset分销参数
            updateSales: updateSales
        }
    }());

    /**
     * 唤醒及下载控制
     */

    Mkt.Wake = (function () {

        var CTRIP_PROTOCOL = "ctrip://wireless";  // Ctrip唤醒协议

        var getUrlParam = Mkt.Utils.getUrlParam,
            getUa = Mkt.Utils.getUa,
            commonStore = Mkt.Store.CommonStore.getInstance(),
            dom = Mkt.Dom;

        var downAppFlag = getUrlParam && getUrlParam("", "downapp"),
            openAppFlag = getUrlParam && getUrlParam("", "openapp"),
            isAndroid = getUa && getUa().isAndroid,  // Android app
            isApple = getUa && getUa().isAndroid;    // Apple app


        function openApp (ctripUrl) {
            var ctripUrl = "ctrip://wireless";
            var ifr = document.createElement("iframe");
            ifr.className = "iOpen";
            ifr.style.display = "none";
            document.body.appendChild(ifr);
            ifr.src = ctripUrl;
        }

        openApp();

        if (openAppFlag && downAppFlag) {
        //优先执行唤醒

        } else if (openAppFlag) {

            switch (+openAppFlag) {
                case 1 :

                    break;
                case 9 :

                    break;
                default :
                    break;
            }


        } else if (downAppFlag) {
            var salesVal = commonStore.getStore("SALE_OBJECT") && commonStore.getStore("SALE_OBJECT").value ?
            commonStore.getStore("SALE_OBJECT").value : null;

        if (salesVal) {

        }
    }

        function getCtripUrl (url) {
            if (url) {
                return CTRIP_PROTOCOL + "/h5_online_url?url=" + Mkt.Utils.base64().encode(url);
            }
            return "";
        }

        return {
            getCtripH5OnlineUrl: getCtripUrl
        }

    }());


    window.Mkt = Mkt;

}(typeof window !== "undefined" ? window : this));



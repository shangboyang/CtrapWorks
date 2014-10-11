;(function ( w, d ) {
    "use strict";

    if (typeof w.Mkt !== "object") throw "Mkt is not defined";

    Mkt.buildNamespace("Mkt.Ad.Utils");

    Mkt.Ad.Utils = Mkt.Utils || {};
    Mkt.Ad.deCfg = {
        KEY_POPUP: "MKT_POPUP",
        popupType: 0, // 1: main Popup 2: bottom Popup
        referKeys: ["baidu.com", "google.com", "soso.com", "so.com", "bing.com", "yahoo", "youdao.com",
            "sogou.com", "so.360.cn", "jike.com", "babylon.com", "ask.com", "avg.com", "easou.com",
            "panguso.com", "yandex.com", "sm.cn"]

    };

    /**
     * 对象扩展 支持深拷贝
     * arg [boolean] deep
     * arg object target 待扩展目标对象
     * arg object obj 待拷贝原始对象
     */
    Mkt.Ad.Utils.extend = function () {
        var slice = [].slice,
            args = slice.call(arguments);
        var self = this;
        var target = args[0] || {},
            prop,
            obj,
            index = 0,
            len = args.length,
            deep = false;

        // 只有一个对象 则返回此对象
        if (typeof target === "object" && len == 1) {
            return target;
        }

        // true work with deep copy
        if (typeof target === "boolean") {
            deep = target;
            index++;
        }

        target = args[index];
        index++;
        obj = args[index];

        for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                target[prop] = typeof obj[prop] === "object" && deep ? self.extend(deep, {}, obj[prop]) : obj[prop];
            }
        }

        return target;
    };

    Mkt.Ad.Utils.EventUtil = {
        addHandler: function (elem, type, handler) {
            if (elem.addEventListener) {
                elem.addEventListener(type, handler, false);
            } else if (elem.attachEvent) {
                elem.attachEvent("on" + type, handler);
            } else {
                elem["on" + type] = handler;
            }
        },
        removeHandler: function (elem, type, handler) {
            if (elem.removeEventListener) {
                elem.removeEventListener(type, handler, false);
            } else if (elem.detachEvent) {
                elem.detachEvent("on" + type, handler);
            } else {
                elem["on" + type] = null;
            }
        }
    };

    Mkt.Ad.Popup = (function () {

        var instance = null,
            utils = Mkt.Ad.Utils;

        function setPopupTimeout () {

        }

        /**
         *
         * @param type 1 main 中部大浮层
         * @img photo http://pic.c-ctrip.com/h5/home/...
         * @returns {string}
         */
        function getPopupStyle (type) {

            var popupHtml = "",
                type = type || 0;

            switch (+type) {
                case 1:
                    popupHtml = ['<div class="app-pop-mask" style="position:absolute;z-index:999;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.6);"></div>',
                        '<div class="app-pop">','<div class="app-pop-box">','<div class="app-pop-close"></div>','<div class="app-pop-bd">',
                        '<div class="app-pop-img">','<img src="images/app_pop_img.jpg" alt="">','</div>',
                        '<div class="app-pop-btn">','<button class="app-pop-btn01">立即体验携程APP</button>',
                        '<button class="app-pop-btn02"><i></i>联系携程客服</button>',
                        '</div>','</div>','</div>','</div>'].join("");
                    break;
                case 2:
                    popupHtml = ['<div class="app-fix-bottom">','<div class="app-close"></div>',
                        '<div class="app-text">','<p class="app-text-title">APP预订专享价</p>',
                        '<p class="app-text-cn">最高立减50%</p></div>',
                        '<div class="app-btn-box"><a href="#" class="app-btn01">立即体验</a></div></div>'].join("");
                    break;
                case 3:
                    popupHtml = ['<div class="app-fix-bottom" style="bottom:55px;">',
                        '<div class="app-close"></div>','<div class="app-text">',
                        '<p class="app-text-title">APP预订专享价</p>',
                        '<p class="app-text-cn">最高立减50%</p></div>',
                            '<div class="app-btn-box"><a href="#" class="app-btn01">立即体验</a>',
                            '<a href="#" class="app-btn02">联系客服</a></div></div>'].join("");
                    break;
                case 4:
                    popupHtml = ['<div class="app-fix-bottom" style="bottom:110px;">',
                        '<div class="app-close"></div>',
                        '<div class="app-btn-box"><a href="#" class="app-btn01 icon-btn">立即体验携程APP</a>',
                        '<a href="#" class="app-btn02 icon-btn">联系携程客服</a></div></div>'].join("");
                    break;
                case 5:
                    popupHtml = ['<div class="app-fix-bottom" style="bottom:165px;">',
                        '<div class="app-close"></div><div class="app-text app-text2">',
                        '<p class="app-text-title">立即体验携程APP</p></div></div>'].join("");
                    break;
            }

            return popupHtml;
        }

        /**
         * 父委托绑定浮层Event
         * @param type
         */
        function bindPopupEvent (type) {
            var dom = Mkt.Dom,
                eventUtil = Mkt.Ad.Utils.EventUtil,
                target = null,
                popupHtml = "",
                centerElem = dom.getByClass( "app-pop" ) && dom.getByClass( "app-pop" ).elems.length > 0 ?
                    dom.getByClass( "app-pop" ).elems[0] : null,// center 浮层
                bottomElem = dom.getByClass( "app-fix-bottom" ) && dom.getByClass( "app-fix-bottom" ).elems.length > 0 ?
                    dom.getByClass( "app-fix-bottom" ).elems[0] : null;// bottom 浮层

            // 主浮层 事件控制
            if (centerElem && type === 1) {

                eventUtil.addHandler(centerElem, "click", function (e) {
                    target = e.target;
                    switch (target.className) {
                        // 关闭popup按钮
                        case "app-pop-close":

                            dom.hide( centerElem );
                            dom.getByClass("app-pop-mask").hide();

                            //展示小浮层
                            initDomCtrl(2);

                            break;
                        // 立即体验 唤醒 or 下载 App
                        case "app-pop-btn01":
                            console.log("立即体验咯~");
                            break;
                        // 联系客服
                        case "app-pop-btn02":
                            console.log("联系客服咯");
                            break;
                        case "":
//                            console.log(target.parentNode) ;
                            if (target.parentNode && target.parentNode.className === "app-pop-btn02") {
                                console.log("联系客服咯");
                            }
                            break;
                    }

                });

            } else {
                // 底部浮层 事件控制
                eventUtil.addHandler(bottomElem, "click", function (e) {
                    target = e.target;
//                    console.log(target.className);
                    if (target.className.match("app-close")) {
                        console.log("close");
                        dom.hide(bottomElem);
                    } else if (target.className.match("app-btn01") || target.className.match("app-text-title")) {
                        console.log("activeApp or downloadApp");
                    } else if (target.className.match("app-btn02")) {
                        console.log("400-400-400");
                    }
                });

            }
        }

        /**
         * 判断url & seo refer
         * @returns {number}
         */
        function showTypeCheck () {

            var popupType = 0;
            /**
             * url中带有浮层参数sepopup，则根据浮层参数对应的值，展示不同样式浮层
             * 1: center Popup
             * 2-5: bottom Popup
             */
            if (utils.getUrlParam(null, "sepopup")) {
                popupType = utils.getUrlParam(null, "sepopup");
                return popupType;
            }

            if (utils.getUrlParam(null, "sourceid") || utils.getUrlParam(null, "sid") ||
                utils.getUrlParam(null, "allianceid")) {
                popupType = 1;
                return popupType;
            }
            // refer check
            function referMatch () {

                var flag = false,
                    referKeys = Mkt.Ad.deCfg.referKeys,
                    idx = 0,
                    len = referKeys.length;

                for (; idx < len ; idx++ ) {
                    if (document.referrer.match(referKeys[idx])) {
                        flag = true;
                        break;
                    }
                }
                return flag;
            }

            if (referMatch()) {
                popupType = 1;
                return popupType;
            }
            // 自然流量
            if (!referMatch() || (utils.getUrlParam(null, "sourceid") && !utils.getUrlParam(null, "sid") &&
                !utils.getUrlParam(null, "allianceid"))) {
                popupType = 1;
                return popupType;
            }
            // 黑名单
            if (true) {
                popupType = 9;
                return popupType;
            }
            return popupType;
        }

        function initDomCtrl (flag, popupType) {
            /**
             * 通过来源控制浮层类型
             */
            var dom = Mkt.Dom,
                footerElem = null,
                popupHtml = getPopupStyle( popupType ) || "";

            if (!flag) return;

            // 底部浮层 使用div footer
            if (popupType && popupType !== 1) {

                if (dom.getById("footer").elems[0]) {
                    footerElem = dom.getById("footer").elems[0]
                } else {
                    footerElem = document.createElement("div");
                    footerElem.id = "footer";
                    dom.appendChild(document.body, footerElem);
                }

            }

            if (popupType && popupHtml) {
                // 中部浮层 塞入html
                if (popupType === 1) {
                    dom.appendChild(document.body, popupHtml);
                } else {
                    dom.appendChild(footerElem, popupHtml);
                }
                bindPopupEvent( popupType );
            }

        }

        /**
         * 初始化LocalStorage [先行者]
         * @returns {boolean} popup = close ? false : true;
         */
        function initPopupLocal () {

            var utils = Mkt.Ad.Utils,
                commonStore = Mkt.Store && Mkt.Store.CommonStore ? Mkt.Store.CommonStore.getInstance() : null,
                popupLocalKey = Mkt.Ad.deCfg.KEY_POPUP || "",
                popupLocalVal = commonStore.getStore(popupLocalKey) || null,
                popupFlag = utils.getUrlParam && utils.getUrlParam(null, "popup") === "close" ? "close" : "open";

            if (commonStore && popupLocalKey) {

                if (!popupLocalVal) {
                    popupLocalVal = {
                        pupopShow: popupFlag,
                        pupopType: 0,
                        timeout: null
                    };
                    // 未取到local
                    commonStore.setStore(popupLocalKey, popupLocalVal);
                }
            }
            console.log(popupLocalVal);
            // 如果全局参数为关闭 不执行浮层控制
            if (popupFlag === "close") {
                return false;
            }

            return true;
        }

        function initialize () {

            var popupFlag = initPopupLocal(),
                popupType = showTypeCheck() || 0;

            initDomCtrl(popupFlag, popupType);

        }


        return {
            getInstance: function () {
                if (!instance) {
                     instance = initialize();
                }
                return instance;
            }

        }

    }());

    Mkt.Ad.Popup.getInstance();

}( window ));

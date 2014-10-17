;(function ( w, d ) {
    "use strict";

    if (typeof w.Mkt !== "object") throw "Mkt is not defined";

    Mkt.buildNamespace("Mkt.Ad.Utils");

    Mkt.Ad.Utils = Mkt.Utils || {};
    Mkt.Ad.deCfg = {
        KEY_POPUP: "MKT_POPUP",
        popupType: 0, // 1: main Popup 2: bottom Popup
        // seo update
        referKeys: ["baidu", "google", "soso.com", "sogou", "so.com", "bing.com", "yahoo", "youdao",
            "so.360", "jike.com", "babylon.com", "ask.com", "avg.com", "easou.com",
            "panguso.com", "yandex.com", "sm.cn", "chinaso"],
        appUrlId: "app_url" // hidden id - ctrip:

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

            if (!elem) return;

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
            popupTimer = null, // setInterval 浮层控制
            utils = Mkt.Ad.Utils,
            dom = Mkt.Dom,
            eventUtil = Mkt.Ad.Utils.EventUtil,
            commonStore = Mkt.Store && Mkt.Store.CommonStore.getInstance();

        /**
         * [废弃] 30分钟激活浮层 || 添加Lizard中View控制
         * @param showType
         */
        /*
        function activatePopupByTimer (showType) {

            var currTime = 0,
                popupLocalKey = Mkt.Ad.deCfg.KEY_POPUP || "",
                bottomDom = dom && dom.getByClass("app-fix-bottom").elems[0],
                activateTime = commonStore.getStoreParam(popupLocalKey, "activateTime") || "",
                popupType = commonStore.getStoreParam(popupLocalKey, "popupType") || 0;

            if (!showType || !activateTime || !bottomDom) return;

            activateTime = Date.parse(activateTime);

            clearInterval(popupTimer);
            popupTimer = setInterval(function () {

                currTime = Date.now();
                if (currTime >= activateTime && bottomDom.style.display == "none") {

                    // 添加Lizard中hasAd控制

                    initDomCtrl(showType, +popupType);
                }

            }, 5000);
        }
        */

        /**
         *
         * @param type 1 main 中部大浮层
         * @img photo http://pic.c-ctrip.com/h5/home/...
         * @returns {string}
         */
        function getPopupHtml (popupType) {

            var popupHtml = "",
                popupType = popupType || 0;

            switch (+popupType) {
                case 1:
                    popupHtml = ['<div class="se-popup" id="se-popup">',
                        '<div class="se-main" style="width:240px;height:329px;margin-top:-165px;margin-left:-120px;position:fixed;top:50%;left:50%;z-index:10000;">',
                        '<img src="http://res.m.ctrip.com/market/images/popup.png" width="100%" />',
                        '<a class="se-close" href="javascript:void(0)" style="position:absolute;width:19px;height:19px;top:9px;right:9px;"></a>',
                        '<a class="se-openapp __appaddress__" href="/market/download.aspx?from=MPopup" style="position:absolute;width:154px;height:43px;bottom:97px;right:43px;"></a>',
                        '<a class="se-phone __hreftel__" href="tel:4000086666" style="position:absolute;width:154px;height:30px;bottom:60px;right:43px;"></a>',
                        '<a class="se-continue" href="javascript:void(0)" style="position:absolute;width:154px;height:30px;bottom:21px;right:43px;"></a>',
                        '</div>',
                        '<div class="se-mask" style="position:fixed;left:0px;top:0px;width:100%;height:100%;z-index:9999;background:rgba(0,0,0,.2);"></div>',
                        '</div>'
                    ].join("");
                    break;
                case 2:
                    popupHtml = ['<div class="cui-mask"></div>', '<div class="dl_panel-bg" style="">',
                        '<div class="dl_banner"></div>', '<div class="dl_banner-mob"></div>',
                        '<i class="dl_ico-banner"></i>', '<i class="dl_btn-close"></i>',
                        '<div class="dl_btn-wrap">',
                        '<a class="dl_btn-download"><i class="dl_ico-download-bg"></i> 立即下载</a>',
                        '<a class="dl_btn-tel" href="tel:"><i class="dl_ico-tel"></i> 电话预订</a>',
                        '</div>', '</div>'].join("");
                    break;
                case 3:
                    popupHtml = ['<div class="cui-mask"></div>', '<div class="dl_panel-bg" style="">',
                        '<div class="dl_banner"></div>', '<div class="dl_banner-mob"></div>',
                        '<i class="dl_ico-banner"></i>', '<i class="dl_btn-close"></i>',
                        '<div class="dl_btn-wrap">',
                        '<a class="dl_btn-download"><i class="dl_ico-download-bg"></i> 立即下载</a>',
                        '</div>', '</div>'].join("");
                    break;
                case 4:
                    popupHtml = ['<div class="dl_panel">', '<a class="dl_btn-close"></a>',
                        '<div class="dl_cnt">', '<i class="dl_ico-logo"></i>',
                        '<p>手机预订</p>', '<p class="dl_txt-i">比官网更优惠<span class="dl_txt-bg">50%</span></p>',
                        '</div>', '<a class="dl_btn-download"><i class="dl_ico-download"></i>下载</a>',
                        '</div>'].join("");
                    break;
                /*
                case 5:
                    popupHtml = ['<div class="app-fix-bottom">','<div class="app-close"></div>',
                        '<div class="app-text">','<p class="app-text-title">APP预订专享价</p>',
                        '<p class="app-text-cn">最高立减50%</p></div>',
                        '<div class="app-btn-box"><a href="#" class="app-btn01">立即体验</a></div></div>'].join("");
                    break;
                case 6:
                    popupHtml = ['<div class="app-fix-bottom">',
                        '<div class="app-close"></div>',
                        '<div class="app-btn-box"><a href="#" class="app-btn01 icon-btn">立即体验携程APP</a>',
                        '<a href="#" class="app-btn02 icon-btn">联系携程客服</a></div></div>'].join("");
                    break;
                case 7:
                    popupHtml = ['<div class="app-fix-bottom">',
                        '<div class="app-close"></div><div class="app-text app-text2">',
                        '<p class="app-text-title">立即体验携程APP</p></div></div>'].join("");
                 break;
                */
            }

            return popupHtml;
        }


        /**
         * [废弃]  获取30分钟后时间
         * @param datetime
         * @returns {Date}
         */
        /*
        function getActivateTime (datetime) {

            var MIN_NUM = 1,
                formatDate = Mkt.Utils.formatDate || null,// 日期格式化
                currTime = datetime && new Date(datetime),
                activateTime = null;

            if (!currTime || typeof formatDate !== "function") return;

            currTime.setMinutes(currTime.getMinutes() + MIN_NUM);
            activateTime = formatDate("Y-m-d H:i:s", currTime);

            return activateTime;
        }
        */

        /**
         * 父委托绑定浮层Event 与事件流程控制
         * @param type
         */
        function bindPopupEvent (popupType) {

            var target = null,
                showType = true,
                appUrlDom = dom.getById( Mkt.Ad.deCfg.appUrlId ).elems[0] || null, // view中ctrip隐藏域
                orgnElem = dom.getByClass( "se-popup").elems[0] || null, // original center 浮层
                centerElem = dom.getByClass( "dl_panel-bg" ).elems[0] || null, // New 大浮层
                bottomElem = dom.getByClass( "dl_panel" ).elems[0] || null; // bottom 小浮层

            if (orgnElem && popupType === 1) {

                eventUtil.addHandler(orgnElem, "click", function (e) {
                    target = e.target;
                    switch (target.className) {
                        case "se-close":
                            console.log("close");
                            dom.hide(orgnElem);
                            break;
                        case "se-continue":
                            dom.hide(orgnElem);
                            break;
                    }
                });

            } else if (centerElem && (popupType === 2 || popupType == 3)) {

                eventUtil.addHandler(centerElem, "click", function (e) {
                    target = e.target;
                    switch (target.className) {
                        //  关闭popup按钮
                        case "dl_btn-close":
                            dom.hide(centerElem);
                            dom.getByClass("cui-mask").hide();
                            break;
                        // 立即体验 唤醒 or 下载 App
                        case "dl_btn-download":
                            console.log("立即体验咯~");
                            break;
                        /*
                        case "dl_btn-tel":
                            break;
                        case "":
                            if (target.parentNode && target.parentNode.className === "app-pop-btn02") {
                            }
                            break;
                        */
                    }
                });

            } else {
                // 底部浮层 事件控制
                eventUtil.addHandler(bottomElem, "click", function (e) {
                    target = e.target;
                    if (target.className == "dl_btn-close") {
                        dom.hide(bottomElem);
//                        activatePopupTime = getActivateTime(Date.now());// formatted Date
//                        showType = setPopupLocal(4, activatePopupTime);// set激活时间 调用30分钟激活策略
//                        activatePopupByTimer(showType);

                    } else if (target.className == "dl_ico-download") {
                        console.log("activeApp or downloadApp");
                    }
                });
            }
        }

        /**
         * 判断url & seo refer 定位popup 类型
         * @returns {number}
         */
        function getPopupType () {

            var popupType = 0,
                popupLocalKey = Mkt.Ad.deCfg.KEY_POPUP || "";

//            popupType = commonStore.getStoreParam(popupLocalKey, "popupType");// 优先以Local中为准

            // url中带有浮层参数sepopup，则根据浮层参数对应的值，展示不同样式浮层
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
            // seo 进来
            if (referMatch()) {
                popupType = 2;
                return popupType;
            }
            // 自然流量
            if (!referMatch() || (utils.getUrlParam(null, "sourceid") && !utils.getUrlParam(null, "sid") &&
                !utils.getUrlParam(null, "allianceid"))) {
                popupType = 1;
                return popupType;
            }
            // blacklist

            return popupType;
        }

        /**
         * 初始化浮层dom节点与事件绑定控制   显示 || 添加
         * @param flag
         * @param popupType
         */
        function initDomCtrl (showType, popupType) {

            var footerElem = null,
                maskElem = dom.getByClass("cui-mask").elems[0] || null,
                orgnElem = dom.getByClass( "se-popup").elems[0] || null, // original center 浮层
                centerElem = dom.getByClass( "dl_panel-bg" ).elems[0] || null, // New 大浮层
                bottomElem = dom.getByClass( "dl_panel" ).elems[0] || null, // bottom 小浮层
                popupHtml = getPopupHtml( popupType ) || "";

            // 出现
            if (!showType) return;

            // 底部浮层 使用div footer
            if (popupType && popupType > 3) {

                if (dom.getById("footer").elems[0]) {
                    footerElem = dom.getById("footer").elems[0]
                } else {
                    footerElem = document.createElement("div");
                    footerElem.id = "footer";
                    dom.appendChild(document.body, footerElem);
                }
            }
            // delete and add dom
            if (popupType && popupHtml) {
                if (popupType <= 3) {
                    orgnElem && document.body.removeChild(orgnElem);
                    maskElem && document.body.removeChild(centerElem);
                    centerElem && document.body.removeChild();
                    dom.appendChild(document.body, popupHtml);
                } else {
                    footerElem.innerHTML = "";
                    dom.appendChild(footerElem, popupHtml);
                }
                console.log(popupType)
                bindPopupEvent( popupType );
            }

        }

        /**
         * Popup LocalStorage 初始化 || 执行中reset
         * @param popupType
         * @param activateTime [废弃][formattedDate]
         * @returns {boolean} showType (popup = close ? false : true);
         */
        function setPopupLocal (popupType, activateTime) {

            var utils = Mkt.Ad.Utils,
                popupLocalKey = Mkt.Ad.deCfg.KEY_POPUP || "",
                popupLocalVal = commonStore.getStore(popupLocalKey) || null,
                popupFlag = utils.getUrlParam && utils.getUrlParam(null, "popup") === "close" ? "close" : "open";

            if (commonStore && popupLocalKey) {

                popupLocalVal = {
                    pupopShow: popupFlag,
                    popupType: popupType || commonStore.getStoreParam(popupLocalKey, "popupType") || 0,
                    activateTime: activateTime || commonStore.getStoreParam(popupLocalKey, "activateTime") || null
                };
                commonStore.setStore(popupLocalKey, popupLocalVal);

            }

            // 如果全局参数为关闭 不执行浮层控制
            if (popupFlag === "close") {
                return false;
            }

            return true;
        }

        function initialize () {

            var showType = setPopupLocal(),
                popupType = getPopupType() || 0;

            var popupCssElem = document.createElement("link");
            popupCssElem.type = "text/css";
            popupCssElem.rel = "stylesheet";
            popupCssElem.href = "http://webresource.fws.qa.nt.ctripcorp.com/resuniononline/r1/h5mask/styles/mob_mask.css?141017";
            document.head  && document.head.appendChild(popupCssElem);

            setTimeout(function () {
                initDomCtrl(showType, +popupType);
            }, 0);

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

;(function ( w, d ) {
    "use strict";

    if (typeof w.Mkt !== "object") throw "Mkt is not defined";

//    Mkt.buildNamespace("Mkt.Ad.Events");
    Mkt.buildNamespace("Mkt.Ad.Utils");
    Mkt.buildNamespace("Mkt.Ad.Popup");

    Mkt.Ad.Utils = Mkt.Utils || {};
    // default config
    Mkt.Ad.deCfg = {
        KEY_HASAPP: "HAS_CTRIP_APP",
        KEY_DOWNAPP: "APP_DOWNLOAD",
        PROTOCAL_APP: 'ctrip://wireless', // app 协议
        lazyTime: 600, // 毫秒
        hasApp: false, // 手机是否装app 从local去读HasApp
        popupType: 0, // 1: main Popup 2: bottom Popup
        fdsa:{
            fdsafds:{
                hello:"fdasfdsa"
            },
            fn: function () {
                return "fuck";
            }
        }
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

    var obj = Mkt.Ad.Utils.extend({},Mkt.Ad.deCfg);
    console.log(obj)
    console.log(Object.keys(obj))

}( window ));

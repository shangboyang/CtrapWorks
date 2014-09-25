/**
 * 广告组件
 * @type {adOptions|*|{}}
 */

/**
 * 判断手机是否安装app
 * l_wang
 */
(function () {
    var AppUtility = {
        t: 600,
        hasApp: false,
        key: 'HAS_CTRIP_APP',
        appProtocol: 'ctrip://wireless',
        //传入参数，第一个是有app时候处理方案，第二个是没有app时候处理方案，
        // 有点情况函数返回ture才打开app，但是初次无论如何都会打开
        openApp: function (hasAppFunc, noAppFunc, appUrl) {
            //看是否已经获取了数据，已经获取过数据便有其它方案
            var appData = AppUtility.getAppData();
            var t1 = Date.now();
            if (appData && appData != '') {
                if (appData.hasApp) {
                    if (typeof hasAppFunc == 'function') {
                        if (hasAppFunc()) {
                            if (appUrl && appUrl.length > 0) {
                                window.location = appUrl;
                            }
                        }
                    } else {
                        if (appUrl && appUrl.length > 0) {
                            window.location = appUrl;
                        }
                    }
                } else {
                    (typeof noAppFunc == 'function') && noAppFunc();
                }
                return '';
            }
            if (!appUrl || appUrl.length <= 0) {
                (typeof noAppFunc == 'function') && noAppFunc();
            }
            var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
            var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0,
                isChrome = isAndroid && u.indexOf("chrome", 0) != -1 && u.indexOf("nexus", 0) == -1;
            var ifr = $('<iframe style="display: none;"></iframe>');
            ifr.attr('src', appUrl);
            $('body').append(ifr);
            //这里需要判断是不是android下的chrome，如果是的话就使用以下逻辑
            //如果不是便使用原来的逻辑
            if (isChrome) {
                if (appUrl && appUrl.length > 0) {
                    window.location = appUrl;
                }
                setTimeout(function () {
                    (typeof noAppFunc == 'function') && noAppFunc();
                }, 1);
            }

            setTimeout(function () {
                AppUtility.testApp(t1);
            }, AppUtility.t);
            AppUtility.setTestResult(hasAppFunc, noAppFunc);
        },
        testApp: function (t1) {
            var t2 = Date.now();
            if (t2 - t1 < AppUtility.t + 200) {
                AppUtility.hasApp = false;
            } else {
                AppUtility.hasApp = true;
            }
        },
        //设置探测结果
        setTestResult: function (hasAppFunc, noAppFunc) {
            setTimeout(function () {
                if (AppUtility.hasApp) {
                    (typeof hasAppFunc == 'function') && hasAppFunc();
                } else {
                    (typeof noAppFunc == 'function') && noAppFunc()
                }
                //一小时过期
                var expireDate = new Date();
                expireDate.setHours(expireDate.getHours() + 1);
                var entity = {
                    value: { hasApp: AppUtility.hasApp },
                    timeout: expireDate.toUTCString()
                };
                window.localStorage.setItem(AppUtility.key, JSON.stringify(entity));
                window.hasApp = AppUtility.hasApp;

            }, AppUtility.t + 1000);
        },
        //获取app信息
        getAppData: function () {
            //暂时不缓存数据
            return '';
            var result = window.localStorage.getItem(AppUtility.key);
            var needReset = false; //是否需要重新设置数据，1 过期则需要, 2 没数据需要
            if (result) {
                result = JSON.parse(result);
                if (Date.parse(result.timeout) >= new Date()) {
                    return result.value;
                }
            }
            return '';
        }
    };
    window.AppUtility = AppUtility;
})();
var adOptions = adOptions || {};
adOptions.__propertys__ = function () {
};
/********************************
 * @description: AdView初始化，主要是配置rootBox、绑定按钮事件
 */
adOptions.initialize = function ($super, config) {
    this.data = config || {};
    this.storeKey = 'APP_DOWNLOAD';
    $super(config);
};
adOptions.update = function (config) {
    if (this.isInFooter) {
        this.remove();
        this.isCreate = false;
    }
    this.rootBox = config.rootBox;
    if (!this.root) {
        this.root = this.rootBox;
    }
    this.isInFooter = !!this.rootBox.hasClass('js_in_Footer');

    if (this.addEvent) {
        this.removeEvent('onShow');
        this.addEvent('onShow', this.onShow);
    }
};
/********************************
 * @description: 通过模板和开发者传入的数据生成HeaderView
 */
adOptions.createHtml = function () {
    var ss1 = adOptions.getUrlParam('sourceid'),
        ss2 = adOptions.getUrlParam('sales'),
        allianceid = adOptions.getUrlParam('allianceid'),
        sid = adOptions.getUrlParam('sid');

    var clazz = this.isInFooter ? '' : 'fix_bottom';
    var url = '/market/download.aspx?from=H5';
    var s = adOptions._get("SALES_OBJECT"),
        unionInfo = adOptions._get("UNION"),
        unionCookie = adOptions._getCookie('UNION');
    var sCss = '';

    if (allianceid && allianceid.length > 0 && sid && sid.length > 0) {
        sCss = 'display:none;';
    }
    if (unionInfo || unionCookie) {
        sCss = 'display:none;';
    }
    if (s && s.sid && +s.sid > 0) {
        if (!s.appurl || s.appurl.length <= 0) {
            sCss = 'display:none;';
        }
        url = s.appurl ? s.appurl : '/market/download.aspx?from=' + s.sid;
    }
    /*判断是否强制下载渠道*/
    /*if (ss1 && ss1.length > 0) {
     var isForceDown = 0;
     var lstSourceid = ['1657', '497', '1107', '1108', '3516', '3512', '3511', '3503', '3513', '1595', '1596', '3524', '3517', '3518', '1591', '1825', '1826', '1827', '1828', '1829', '1830', '1831', '1832', '1833'];
     for (var i = 0, len = lstSourceid.length; i < len; i++) {
     var d = lstSourceid[i];
     if (d == ss1) { isForceDown = 1; break; }
     }
     if (isForceDown) { sCss = 'display:none;'; }
     }*/
    /**判断是否已经强制下载过，若已经强制下载则不显示广告**/
    /*if (adOptions.isAutoDown(s.sid)) {
     sCss = 'display:none;';
     }*/

    if (this.checkDeviceSupport() == false) {
        sCss = 'display:none;';
    }
    // 特殊处理 出浮层的联盟ids
    var allianceArr = [5942, 1127, 7225, 5942, 3588];
    for (var idx = 0, len = allianceArr.length; idx < len; idx++){
        if (+allianceid === allianceArr[idx]) {
            sCss = "";
            break;
        }
    }

    if (sCss.length > 0) {
        if ($('footer')) $('footer').removeClass('pb85');
        if ($('div[data-role="footer"]')) $('div[data-role="footer"]').removeClass('pb85');
        if ($('#panel-box')) {
            $('#panel-box').removeClass('pb85');
        }
        if ($('.f_list')) {
            $('.f_list').removeClass('pb85');
        }
        adOptions.saveExpire(1);
        return '';
    }
    var appUrl = this.setAppUrl();
    return ['<div data-appurl="' + appUrl + '" id="dl_app" style="' + sCss + '" class="', clazz,
        '"> <div id="icon_text" class="txt_middle"><img src="http://res.m.ctrip.com/html5/content/images/icon_text_s6_1.png"/></div>',
            ' <a href="' + url + '" id="app_link" class="txt_middle __appaddress__"><img src="http://res.m.ctrip.com/html5/content/images/icon_open_s6.png"/></a>',
        '<div id="close_icon"></div>',
        '</div>'].join('');
};
adOptions.getUrlParam = function (name) {
    //var aParams = document.location.search.substr(1).split('&');
    var urls = document.location.href || '', re = new RegExp("(\\\?|&)" + name + "=([^&]+)(&|$)", "i"), m = urls.match(re);
    if (m) return m[2];
    return '';
};
//设置app协议url
adOptions.setAppUrl = function () {
    //获取渠道信息
    //应当在SALES取,SALES_OBJECT可能存在数据未取回的情况 shbzhang 2014/5/21
    var sourceInfo = adOptions._get("SALES");
    // var sourceInfo = adOptions._get("SALES_OBJECT");
    var appUrl = AppUtility.appProtocol;
    var bizName = null, searchInfo = null, c1 = null, c2 = null, c3 = null, c4 = null, c5 = null, c6 = null, c7 = null, c8 = null, c9 = null, c10 = null, c11 = null;
    var pageId = $('#page_id').val();
    console.log(pageId);
    var _reg = new RegExp("-", "g"), _reg2 = new RegExp("/", "g"); //创建正则RegExp对象
    if (pageId && +pageId > 0) {
        //begin 酒店（国内常规/周边）
        if (+pageId == 212092 || +pageId == 212093 || +pageId == 212094 || +pageId == 210090) {
            //国内常规酒店搜索/列表/详情页
            bizName = +pageId == 212092 ? 'hotel_inquire' : (+pageId == 212093 || +pageId == 210090) ? "hotel_inland_list" : +pageId == 212094 ? "InlandHotel" : "";
            searchInfo = window.localStorage ? window.localStorage.getItem("HOTELSEARCHINFO") : null;
            if (searchInfo) {
                searchInfo = JSON.parse(searchInfo);
                if (+pageId == 212092) {
                    //国内常规酒店搜索
                    if (searchInfo.data) {
                        c1 = searchInfo.data.CheckInDate.replace(_reg, ''); //入住时间（必需，格式YYYYMMDD）
                        c2 = searchInfo.data.CheckOutDate.replace(_reg, ''); //离店时间（必需，格式YYYYMMDD）
                        c3 = searchInfo.data.CheckInCityID; //酒店城市ID(必需)
                        c4 = searchInfo.data.DistrictId ? +searchInfo.data.DistrictId <= 0 ? "" : searchInfo.data.DistrictId : ""; //景区ID (可选)
                        c5 = searchInfo.data.BrandId; //品牌ID (可选)
                        c6 = searchInfo.data.BrandName; //品牌名称 (可选)
                        c7 = 0; //品牌类型(可选，0：全部品牌，1：经济型连锁品牌，默认0)
                    }
                    bizName += '?c1=' + (c1 || '') + "&c2=" + (c2 || '') + "&c3=" + (c3 || '') + "&c4=" + (c4 || '') + "&c5=" + (c5 || '') + "&c6=" + (c6 || '') + "&c7=" + (c7 || '');
                }
                if (+pageId == 212093 || +pageId == 210090) {
                    //国内常规酒店列表
                    if (searchInfo.data) {
                        c1 = searchInfo.data.CheckInDate.replace(_reg, ''); //入住时间（必需，格式YYYYMMDD）
                        c2 = searchInfo.data.CheckOutDate.replace(_reg, ''); //离店时间（必需，格式YYYYMMDD）
                        c3 = searchInfo.data.CheckInCityID; //酒店城市ID(必需)
                        c4 = searchInfo.data.DistrictId ? +searchInfo.data.DistrictId <= 0 ? "" : searchInfo.data.DistrictId : ""; //景区ID (可选)
                        c5 = 0; //酒店类型(0：国内，1：海外) (预留，目前没有海外)
                        c6 = searchInfo.data.BrandId ? +searchInfo.data.BrandId <= 0 ? "" : searchInfo.data.BrandId : ""; //品牌ID (可选)
                        c7 = searchInfo.data.BrandName || '';  //品牌名称 (可选)
                        c8 = 0; //品牌类型(可选，0：全部品牌，1：经济型连锁品牌，默认0)
                        c9 = 1; //查询类型(必须，1：按城市查询，2：按经纬度查询) 无论查询类型都需要有cityID；districtId可选 按经纬度查询必须有经纬度信息
                        c10 = ''; //纬度，按经纬度查询时必须传值
                        c11 = ''; //经度，按经纬度查询时必须传值
                        if (+pageId == 210090) {
                            c9 = 2;
                            c10 = searchInfo.data.Latitude;
                            c11 = searchInfo.data.Longitude;
                        }
                    }
                    bizName += '?c1=' + (c1 || '') + "&c2=" + (c2 || '') + "&c3=" + (c3 || '') + "&c4=" + (c4 || '') + "&c5=" + (c5 || '') + "&c6=" + (c6 || '') + "&c7=" + (c7 || '') + "&c8=" + (c8 || '') + "&c9=" + (c9 || '') + "&c10=" + (c10 || '') + "&c11=" + (c11 || '');
                }
                if (+pageId == 212094) {
                    //国内常规酒店详情页
                    if (searchInfo.data) {
                        c1 = searchInfo.data.CheckInDate.replace(_reg, ''); //入住时间（必需，格式YYYYMMDD）
                        c2 = searchInfo.data.CheckOutDate.replace(_reg, ''); //离店时间（必需，格式YYYYMMDD）
                        c3 = searchInfo.data.CheckInCityID; //酒店城市ID(必需)

                    }
                    var detailInfo = window.localStorage ? window.localStorage.getItem("HOTELDETAIL") : null;
                    if (detailInfo) {
                        detailInfo = JSON.parse(detailInfo);
                        if (detailInfo && detailInfo.data) {
                            c4 = detailInfo.data.HotelID; //酒店ID(必需)
                        }
                    }
                    bizName += '?checkInDate=' + (c1 || '') + "&checkOutDate=" + (c2 || '') + "&cityId=" + (c3 || '') + "&hotelId=" + (c4 || '');
                }
            }
        }
        //end 酒店

        //begin 团购
        if (+pageId == 212001 || +pageId == 214008) {
            //团购列表/详情页
            bizName = +pageId == 212001 ? 'hotel_groupon_list' : +pageId == 214008 ? "hotel_groupon_detail" : "";
            if (+pageId == 212001) {
                //团购列表
                searchInfo = window.localStorage ? window.localStorage.getItem("TUAN_SEARCH") : null;
                searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
                c1 = searchInfo && searchInfo.value ? searchInfo.value.ctyId : "2";
                bizName += '?c1=' + (c1 || '2');
            }
            if (+pageId == 214008) {
                //团购详情
                searchInfo = window.localStorage ? window.localStorage.getItem("TUAN_DETAILS") : null;
                searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
                c1 = searchInfo && searchInfo.value ? searchInfo.value.id : null; //产品ID（必需）
                bizName += '?c1=' + (c1 || '');
            }
        }
        // end 团购
        //begin 机票（国内/国际）
        if (+pageId == 212003 || +pageId == 212004 || +pageId == 212009 || +pageId == 214019 || +pageId == 214209 ||
            +pageId == 212042) {
            //机票搜索/列表页
            searchInfo = window.localStorage ? window.localStorage.getItem("S_FLIGHT_AirTicket") : null;
            searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
            if (searchInfo && searchInfo.value && searchInfo.value._items && searchInfo.value._items.length > 0) {
                c1 = searchInfo.value.tripType; //单程/往返(1/2)（必需）
                c2 = searchInfo.value._items[0].dCtyId; //出发城市id （必需）
                c3 = searchInfo.value._items[0].aCtyId; //到达城市id（必需）
                c4 = searchInfo.value._items[0].date.replace(_reg2, ''); //出发时间（yyyymmdd）（必需）
                if (c1 && +c1 > 1 && searchInfo.value._items.length > 1) {
                    c5 = searchInfo.value._items[1].date.replace(_reg2, ''); //出发时间（yyyymmdd）（必需）
                }

                var subInfo = window.localStorage ? window.localStorage.getItem("S_FLIGHT_SUBJOIN") : null;
                if (+pageId == 214019 || +pageId == 214209) {
                    subInfo = window.localStorage ? window.localStorage.getItem("S_FLIGHT_INTLAirTicket") : null;
                }
                subInfo = subInfo ? JSON.parse(subInfo) : null;
                c6 = ""; //筛选舱位（可选）1：经济舱  5：公务/头等舱
                c7 = ""; //排序类型（预留）1:起飞时间升序 2:起飞时间降序 3:价格升序 4：价格降序

                c8 = ''; //筛选出发/到达（预留）格式：departFilterAirportCode|arriveFilterAirportCode 通过竖线区分筛选的是出发还是到达机场
                c9 = ''; //筛选起飞时间（预留）格式：0600|1200
                c10 = ''; //筛选机型（预留）1大型机 2 中型机 3 小型机
                c11 = ''; //筛选航司（预留）航空公司二字码
                if (subInfo && subInfo.value) {
                    if (+pageId == 214019 || +pageId == 214209) {
                        c6 = 1;
                        /*国际机票
                         c6=国际乘客类型，成人/儿童（1/2）（预留，默认成人）
                         c7 仓位（可选）1：经济舱  2：超级经济舱3：公务舱4：头等舱
                         c8 排序类型（预留）1:起飞时间升序 2:起飞时间降序 3:价格升序 4：价格降序 5:耗时升序6:耗时降序
                         c9 筛选航司（可选）航空公司二字码
                         */
                        //1：经济舱  2：超级经济舱3：公务舱4：头等舱
                        if (+subInfo.value['class'] == 0) {
                            c7 = "1";
                        }
                        if (+subInfo.value['class'] == 1) {
                            c7 = "2";
                        }
                        if (+subInfo.value['class'] == 2) {
                            c7 = "3";
                        }
                        if (+subInfo.value['class'] == 3) {
                            c7 = "4";
                        }
                        //排序类型（预留）1:起飞时间升序 2:起飞时间降序 3:价格升序 4：价格降序 5:耗时升序6:耗时降序
                        if (+subInfo.value.sortRule == 2) {
                            //1:起飞时间升序 2:起飞时间降序
                            if (+subInfo.value.sortType == 2) {
                                c8 = "1";
                            }
                            if (+subInfo.value.sortType == 1) {
                                c8 = "2";
                            }
                        }
                        if (+subInfo.value.sortRule == 1) {
                            //3:价格升序 4：价格降序 5:耗时升序6:耗时降序
                            if (+subInfo.value.sortType == 2) {
                                c8 = "3";
                            }
                            if (+subInfo.value.sortType == 1) {
                                c8 = "4";
                            }
                        }
                        if (+pageId == 214209) {
                            c7 = c8 = c9 = '';
                        }
                    }
                    else {
                        if (subInfo.value['departfilter-type'] == "1") {
                            if (subInfo.value['departfilter-value'] == "3") {
                                c6 = "5";
                            }
                            if (subInfo.value['departfilter-value'] == "0") {
                                c6 = "1";
                            }
                        }
                        if (subInfo.value['depart-sorttype'] == "price") {
                            if (subInfo.value['depart-orderby'] == "asc")
                                c7 = "3";
                            if (subInfo.value['depart-orderby'] == "desc")
                                c7 = "4";
                        }
                        if (subInfo.value['depart-sorttype'] == "time") {
                            if (subInfo.value['depart-orderby'] == "asc")
                                c7 = "1";
                            if (subInfo.value['depart-orderby'] == "desc")
                                c7 = "2";
                        }
                        if (subInfo.value['departfilter-type'] == "0") {
                            //筛选起飞时间（预留）格式：0600|1200
                            c9 = subInfo.value['departfilter-value'] || '';
                            c9 = c9.replace('-', '|');
                            c9 = c9.replace(':', '');
                            c9 = c9.replace(':', '');
                        }
                        if (subInfo.value['departfilter-type'] == "2") {
                            c11 = subInfo.value['departfilter-value'] || '';
                        }
                        if (+pageId == 212009) {
                            c6 = c7 = c8 = c9 = c11 = '';
                        }
                    }
                }
            }
            //机票与旅行日程追加控制 mwli c1=20140130&c2=MU5137&c3=SHA&c4=PEK
            searchInfo = !searchInfo && window.localStorage ? window.localStorage.getItem("AIRSTATE_DETAIL_PARAM") : null;
            searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
            if (searchInfo && searchInfo.data) {
                c1 = searchInfo.data.fdate || "";
                c2 = searchInfo.data.fNo || "";
                c3 = searchInfo.data.dPort || "";
                c4 = searchInfo.data.aPort || "";
            }
            if (+pageId == 212003) {
                //机票搜索
                bizName = 'flight_inquire';
            }
            if (+pageId == 212009 || +pageId == 212004) {
                //国内机票列表页
                bizName = c1 && +c1 > 1 ? 'flight_inland_tolist' : "flight_inland_singlelist";
            }
            if (+pageId == 214019 || +pageId == 214209) {
                //国际机票列表页
                bizName = c1 && +c1 > 1 ? 'flight_int_tolist' : "flight_int_singlelist";
            }
            if (+pageId == 212042) {
                bizName = "flight_board_detail";
            }
            bizName += '?c1=' + (c1 || '') + "&c2=" + (c2 || '') + "&c3=" + (c3 || '') + "&c4=" + (c4 || '') + "&c5=" + (c5 || '') + "&c6=" + (c6 || '') + "&c7=" + (c7 || '') + "&c8=" + (c8 || '') + "&c9=" + (c9 || '') + "&c10=" + (c10 || '') + "&c11=" + (c11 || '');
        }
        //end 机票

        //begin 火车票查询/列表页
        if (+pageId == 212071 || +pageId == 212072) {
            bizName = +pageId == 212071 ? "train_inquire" : 'train_list';
            //产品查询页：出发地，目的地，出发日期。产品列表页：出发地，目的地，出发日期。
            searchInfo = window.localStorage ? window.localStorage.getItem("TRAINSSEARCHINFO") : null;
            searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
            if (searchInfo && searchInfo.data) {
                //c1出发车站ID（可选）
                //c2到达站ID（可选）
                //c3出发日期（yyyyMMdd可选）
                c1 = searchInfo.data.DepartCityId || '';
                c2 = searchInfo.data.ArriveCityId || '';
                c3 = searchInfo.data.DepartDate || '';
                c3 = c3.replace(_reg, '');
            }
            bizName += '?c1=' + (c1 || '') + "&c2=" + (c2 || '') + "&c3=" + (c3 || '');
        }
        //end 火车票
        //begin 旅游（旅游频道首页/周边短途游/团队游/邮轮游）产品查询页，产品列表页，产品详情页
        if (+pageId == 214040 || +pageId == 214045
            || +pageId == 214046 || +pageId == 214041 || +pageId == 214345
            || +pageId == 214346 || +pageId == 214042 || +pageId == 214353 || +pageId == 214354) {
            c1 = c2 = c3 = c4 = c5 = c6 = '';
            searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_PRODUCT_LIST_PARAM") : null;
            searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
            //vacation_home	旅游首页
            if (+pageId == 214040) {
                bizName = 'vacation_home';
            }
            //周边短途游产品列表页
            if (+pageId == 214045) {
                bizName = 'vacation_weekend_list';
                /*
                 cityId	出发城市ID（必需）c1
                 districtId	景区ID (可选) c2
                 travelDaysId	游玩天数ID（可选）c3
                 levelId	产品等级ID（可选）c4
                 isSelfProudct	只看携程自营（可选：1是、0否）c5
                 isDiscount	只看优惠产品（可选：1是、0否）c6
                 */
                if (searchInfo && searchInfo.value) {
                    c1 = searchInfo.value.dCtyId;
                    if (searchInfo.value.qparams || searchInfo.value.qparams.length > 0) {
                        for (var s in searchInfo.value.qparams) {
                            var qparams = searchInfo.value.qparams[s];
                            if (qparams && qparams.type) {
                                // districtId	景区ID (可选)
                                if (+qparams.type == 3) {
                                    c2 = qparams.val;
                                }
                                //travelDaysId	游玩天数ID（可选）
                                if (+qparams.type == 2) {
                                    c3 = qparams.val;
                                }
                                // isSelfProudct	只看携程自营（可选：1是、0否）
                                if (+qparams.type == 6) {
                                    c5 = qparams.val;
                                }
                                //isDiscount	只看优惠产品（可选：1是、0否）
                                if (+qparams.type == 7) {
                                    c6 = qparams.val;
                                }
                            }
                        }
                    }
                }
                bizName += '?cityId=' + (c1 || '') + "&districtId=" + (c2 || '') + "&travelDaysId=" + (c3 || '') + "&levelId=" + (c4 || '') + "&isSelfProudct=" + (c5 || '') + "&isDiscount=" + (c6 || '');
            }
            //周边短途游产品详情页
            if (+pageId == 214046) {
                bizName = 'vacation_nearby_detail';
                /*departCityId	出发城市ID（必需）c1 productId	产品ID (必需) c2 */
                c1 = c2 = '';
                searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_PRODUCT_DETAIL_PARAM") : null;
                searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
                if (searchInfo && searchInfo.value) {
                    c1 = searchInfo.value.dCtyId || '';
                    c2 = searchInfo.value.pid || '';
                }
                bizName += '?departCityId=' + (c1 || '') + "&productId=" + (c2 || '');
            }
            //团队游产品查询页214041
            if (+pageId == 214041) {
                bizName = 'vacation_group_inquire';
                c1 = c2 = c3 = c4 = '';
                searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_GROUP_SEARCH_PARAM") : null;
                searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
                if (searchInfo && searchInfo.value) {
                    /*
                     departCityId	出发城市ID（可选）c1
                     arriveName	到达城市名、关键字 （可选）c2
                     travelDaysId	游玩天数ID（可选）c3
                     levelId	产品等级ID（可选）c4
                     */
                    c1 = searchInfo.value.dCtyId;
                    c2 = searchInfo.value.destKwd;
                }
                bizName += '?departCityId=' + (c1 || '') + "&arriveName=" + (c2 || '') + "&travelDaysId=" + (c3 || '') + "&levelId=" + (c4 || '');
            }
            //团队游产品列表页214345
            if (+pageId == 214345) {
                bizName = 'vacation_group_list';
                c1 = c2 = c3 = c4 = c5 = c6 = c7 = '';
                searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_PRODUCT_LIST_PARAM") : null;
                searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
                if (searchInfo && searchInfo.value) {
                    /*
                     departCityId	出发城市ID（必需）c1
                     arriveName	到达城市名、关键字 (必需) c2
                     districtId	景区ID (可选) c3
                     travelDaysId	游玩天数ID（可选）c4
                     levelId	产品等级ID（可选）c5
                     isSelfProduct	只看携程自营（可选：1是、0否）c6
                     isDiscount	只看优惠产品（可选：1是、0否）c7
                     */
                    //begin 参数设置
                    c1 = searchInfo.value.dCtyId;
                    c2 = searchInfo.value.destKwd;
                    if (searchInfo.value.qparams || searchInfo.value.qparams.length > 0) {
                        for (var s in searchInfo.value.qparams) {
                            var qparams = searchInfo.value.qparams[s];
                            if (qparams && qparams.type) {
                                // districtId	景区ID (可选)
                                if (+qparams.type == 3) {
                                    c3 = qparams.val;
                                }
                                //travelDaysId	游玩天数ID（可选）
                                if (+qparams.type == 2) {
                                    c4 = qparams.val;
                                }
                                // isSelfProudct	只看携程自营（可选：1是、0否）
                                if (+qparams.type == 6) {
                                    c6 = qparams.val;
                                }
                                //isDiscount	只看优惠产品（可选：1是、0否）
                                if (+qparams.type == 7) {
                                    c7 = qparams.val;
                                }
                            }
                        }
                    }
                    //end 参数设置
                }
                //end
                bizName += '?departCityId=' + (c1 || '') + "&arriveName=" + (c2 || '') + "&districtId=" + (c3 || '') + "&travelDaysId=" + (c4 || '') + "&levelId=" + (c5 || '') + "&isSelfProduct=" + (c6 || '') + "&isDiscount=" + (c7 || '');
            }
            //团队游产品详情页
            if (+pageId == 214346) {
                bizName = 'vacation_group_detail';
                /*
                 departCityId	出发城市ID（必需）c1
                 productId	产品ID (必需) c2
                 */
                c1 = c2 = '';
                searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_PRODUCT_DETAIL_PARAM") : null;
                searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
                if (searchInfo && searchInfo.value) {
                    c1 = searchInfo.value.dCtyId || '';
                    c2 = searchInfo.value.pid || '';
                }
                bizName += '?departCityId=' + (c1 || '') + "&productId=" + (c2 || '');
            }
            //邮轮游产品查询页
            if (+pageId == 214042) {
                bizName = 'vacation_cruises_inquire';
                searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_CRUISE_SEARCH_PARAM") : null;
                searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
                c1 = c2 = '';
                if (searchInfo && searchInfo.value) {
                    /*
                     departCityId	出发城市ID（可选）c1
                     routeId	航线ID (可选) c2
                     */
                    c1 = searchInfo.value.dCtyId || '';
                    if (searchInfo.value.qparams || searchInfo.value.qparams.length > 0) {
                        for (var s in searchInfo.value.qparams) {
                            var qparams = searchInfo.value.qparams[s];
                            if (+qparams.type == 14) {
                                c2 = qparams.val;
                            }
                        }
                    }
                }
                bizName += '?departCityId=' + (c1 || '') + "&routeId=" + (c2 || '');
            }
            //邮轮游产品列表页
            if (+pageId == 214353) {
                bizName = 'vacation_cruises_list';
                searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_PRODUCT_LIST_PARAM") : null;
                searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
                c1 = c2 = c3 = c4 = c5 = c6 = c7 = '';
                if (searchInfo && searchInfo.value) {
                    /*
                     departCityId	出发城市ID（必需）c1
                     routeId	航线ID (必需) c2
                     companyId	油轮公司ID (可选) c3
                     productFormId	产品形态ID（可选） c4
                     portDepartId	出发港口ID（可选）c5
                     isSelfProduct	只看携程自营（可选：1是、0否）c6
                     isDiscount	只看优惠产品（可选：1是、0否）c7
                     */
                    c1 = searchInfo.value.dCtyId;
                    if (searchInfo.value.qparams || searchInfo.value.qparams.length > 0) {
                        for (var s in searchInfo.value.qparams) {
                            var qparams = searchInfo.value.qparams[s];
                            if (qparams) {
                                if (+qparams.type == 14) {
                                    //	航线ID (必需)
                                    c2 = qparams.val;
                                }
                                // 油轮公司ID (可选)
                                if (+qparams.type == 10) {
                                    c3 = qparams.val;
                                }
                                //产品形态ID（可选）
                                if (+qparams.type == 11) {
                                    c4 = qparams.val;
                                }
                                // portDepartId出发港口ID（可选）
                                if (+qparams.type == 12) {
                                    c5 = qparams.val;
                                }
                                // isSelfProudct	只看携程自营（可选：1是、0否）
                                if (+qparams.type == 6) {
                                    c6 = qparams.val;
                                }
                                //isDiscount	只看优惠产品（可选：1是、0否）
                                if (+qparams.type == 7) {
                                    c7 = qparams.val;
                                }
                            }
                            //end
                        }
                    }
                    //end
                }
                bizName += '?departCityId=' + (c1 || '') + "&routeId=" + (c2 || '') + "&companyId=" + (c3 || '') + "&productFormId=" + (c4 || '') + "&portDepartId=" + (c5 || '') + "&isSelfProduct=" + (c6 || '') + "&isDiscount=" + (c7 || '');
            }
            //邮轮游产品详情页
            if (+pageId == 214354) {
                bizName = 'vacation_cruises_detail';
                searchInfo = window.localStorage ? window.localStorage.getItem("VACATIONS_PRODUCT_DETAIL_PARAM") : null;
                searchInfo = searchInfo ? JSON.parse(searchInfo) : null;
                c1 = c2 = '';
                if (searchInfo && searchInfo.value) {
                    c1 = searchInfo.value.dCtyId || '';
                    c2 = searchInfo.value.pid || '';
                }
                bizName += '?departCityId=' + (c1 || '') + "&productId=" + (c2 || '');
            }
        }
        //end 旅游
    }
    //end bizName
    appUrl += bizName ? "/" + bizName : '';
    //h5 app 跳转hybird 传参数  slh
    var view = this.getCurrentView();
    if (view && view.getAppUrl) {
        appUrl = AppUtility.appProtocol + view.getAppUrl();
    }
    if (appUrl.indexOf('?') <= -1) {
        appUrl += '?v=2';
    }
    //取Sales数据 shbzhang 2014/5/21
    if (sourceInfo && sourceInfo.sourceid && +sourceInfo.sourceid > 0) {
        appUrl += '&extendSourceID=' + sourceInfo.sourceid;
    } else {
        appUrl += '&extendSourceID=8888';
    }
    console.log("open Url :" + appUrl);
    return appUrl;
};
/********************************
 * @description: onShow时候的回调，绑定Adview上的事件
 */
adOptions.onShow = function () {
    this.root.off('click');
    this.root.find('#close_icon').on('click', $.proxy(function () {
        this.saveExpire(1);
        this.hide();
        if ($('footer')) {
            $('footer').removeClass('pb85');
        }
        if ($('#panel-box')) {
            $('#panel-box').removeClass('pb85');
        }
        if ($('div[data-role="footer"]')) {
            $('div[data-role="footer"]').removeClass('pb85');
        }
        if ($('.f_list')) {
            $('.f_list').removeClass('pb85');
        }
    }, this));

    var scope = this;
    //修改点击逻辑l_wang
    this.root.find('#app_link').off('click').on('click', function (e) {
        e.preventDefault();
        // 修改this指向错误  slh
        var url = $(this).attr('href'),
            appUrl = scope.setAppUrl(),
            pageId = $('#page_id').val(),
            u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
        console.log(url);
        var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0;
        if (isMac) {
            window.location = appUrl;
            setTimeout(function () {
                window.location = "itms-apps://itunes.apple.com/cn/app/id379395415?mt=8";
            }, 30);
        } else {
            AppUtility.openApp(function () {
                scope.saveExpire();
                //scope.hide();非用户主动关闭，不隐藏广告浮层
                return true;
            }, function () {
                window.location = url;
            }, appUrl);
        }
        return false;
    });

    if (this.checkDeviceSupport() == false) {
        //this.hide();
        //fix pc 浏览器访问,导致团购酒店入口消失的问题 shbzhang 2014/1/6
        if (this.root.attr('id') == 'dl_app') {
            this.root.hide();
        }
        if ($('footer')) $('footer').removeClass('pb85');
        if ($('div[data-role="footer"]')) $('div[data-role="footer"]').removeClass('pb85');
        if ($('#panel-box')) {
            $('#panel-box').removeClass('pb85');
        }
        if ($('.f_list')) {
            $('.f_list').removeClass('pb85');
        }
    }
};

//l_wang测试是否android ios，不是就得关闭
adOptions.checkDeviceSupport = function () {
    var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
    var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0;
    var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0;
    if (isMac == 0 && isAndroid == 0) {
        return false;
    }
    return true;
};
/**
 * 保存失效时间 update 2014-1-13  增加isClose，用于标记是否是用户主动点击关闭（isClose=1标识用户主动关闭广告浮层）
 */
adOptions.saveExpire = function (isClose) {
    var data = { isExpire: 1 }, timeout = new Date();
    if (isClose) {
        data.isClose = isClose;
    }
    timeout.setDate(timeout.getDate() + 1);
    if (!this.storeKey) {
        this.storeKey = "APP_DOWNLOAD";
    }
    this._set(this.storeKey, data, timeout.toUTCString());
};
/***********设置是否已经自动下载过客户端************/
adOptions.saveAutoDown = function (sourceid) {
    var data = { isAutoDown: 1, sid: sourceid }, timeout = new Date();
    timeout.setDate(timeout.getDate() + 1);
    this._set("APP_AUTODOWNLOAD", data, timeout.toUTCString());
};

adOptions.appDownload = function () {
    var self = this;
    //获取渠道信息
    var s = adOptions._get("SALES_OBJECT");
    var appUrl = AppUtility.appProtocol;
    if (s && s.sid && +s.sid > 0) {
        appUrl += '?extendSourceID=' + s.sid;
    } else {
        appUrl += '?extendSourceID=8888';
    }
    var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
    var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0;
    if (isMac) {
        window.location = appUrl;
        setTimeout(function () {
            window.location = "itms-apps://itunes.apple.com/cn/app/id379395415?mt=8";
        }, 30);
    } else {
        /*************end 2014-1-13 caofu************/
            //传入处理函数，第一个是有app时候处理方案，第二个是没有app时候处理方案
            //安装app情况下，第一个参数为true才会打开app，但是初次无论如何都会打开
        AppUtility.openApp(function () {
            return true;
        }, function () {
            var url = "http://m.ctrip.com/market/download.aspx?from=H5";
            if (s) {
                if (s.appurl && s.appurl.length > 0)
                    url = s.appurl;
                else if (s.sid && +s.sid > 0) {
                    url = "http://m.ctrip.com/market/download.aspx?from=" + s.sid;
                }
            }
            window.location.href = url;
        }, appUrl);
    }
};

//check auto download，强制下载l_wang修改过了
adOptions.checkForceDownload = function (sourceid) {
    /*
     //调整自动下载需求：必须传入
     var self = this;
     if (!sourceid || sourceid.length <= 0 || +sourceid <= 0) return;
     //获取渠道信息
     var s = adOptions._get("SALES_OBJECT");
     //判断用户网络环境，若不是wifi环境，则不自动下载
     if (navigator.connection) {
     if (navigator.connection.type != navigator.connection.WIFI) {
     adOptions.saveExpire(1);
     adOptions.saveAutoDown(sourceid);
     return;
     }
     }
     //判断是否已经强制下载，若已强制下载则不再执行自动下载
     if (adOptions.isAutoDown(sourceid)) {
     adOptions.saveExpire(1);
     adOptions.saveAutoDown(sourceid);
     return;
     }
     var appUrl = adOptions.setAppUrl();//生产app协议url
     var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
     var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0;
     if (isMac) {
     adOptions.saveExpire(1);
     adOptions.saveAutoDown(sourceid);
     window.location = appUrl;
     setTimeout(function () { window.location = "itms-apps://itunes.apple.com/cn/app/id379395415?mt=8"; }, 30);
     } else {
     //传入处理函数，第一个是有app时候处理方案，第二个是没有app时候处理方案
     //安装app情况下，第一个参数为true才会打开app，但是初次无论如何都会打开
     AppUtility.openApp(function () {
     adOptions.saveExpire(1);
     adOptions.saveAutoDown(sourceid);
     //self.hide(); //强制下载后主动关闭，隐藏广告浮层
     if (self.root.attr('id') == 'dl_app') {
     self.root.hide();
     }
     return true;
     }, function () {
     var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0;
     //Android强制下载
     if (isAndroid) {
     var url = "http://m.ctrip.com/market/download.aspx?from=" + sourceid + '&App=3';
     if (s && s.sid && +s.sid > 0 && +s.sid == +sourceid && s.appurl && s.appurl.length > 0) {
     url = s.appurl;
     }
     adOptions.saveExpire(1);
     adOptions.saveAutoDown(sourceid);
     //self.hide(); //强制下载后主动关闭，隐藏广告浮层
     if (self.root.attr('id') == 'dl_app') {
     self.root.hide();
     }
     window.location.href = url;
     }
     }, appUrl);
     }*/
};
/// <summary>
/// 通过开关参数控制是否需要强制唤醒app （2014-3-17 caof）
/// </summary>
adOptions.checkAutoDownload = function () {
    //调整自动下载需求：必须传入
    var self = this,
        sourceid = this.getUrlParam('sourceid'),
        isopenapp = this.getUrlParam('openapp'),
        isodownapp = this.getUrlParam('downapp');
    if (!sourceid || sourceid.length <= 0 || +sourceid <= 0) return;
    var isdown_iosapp = 0,
        isdown_androidapp = 0,
        isopen_androidapp = 0,
        isopen_iosapp = 0;
    var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
    //判断设备类型
    var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0; //ios设备
    var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0; //android 设备
    if (isodownapp) {
        if (isMac) {
            if (+isodownapp == 2 || +isodownapp == 3) {
                //判断是否下载ios客户端
                isdown_iosapp = 1;
            }
        }
        if (isAndroid) {
            if (+isodownapp == 1 || +isodownapp == 3) {
                //判断是否下载android客户端
                isdown_androidapp = 1;
            }
        }
    }
    var appUrl = null;
    if (isopenapp) {
        if (isMac) {
            //判断是否需要自动唤醒ios app
            if (+isopenapp == 2 || +isopenapp == 3) {
                isopen_iosapp = 1;
            } else {
                isopen_iosapp = 0;
                appUrl = null;
            }
        }
        if (isAndroid) {
            //判断是否需要自动唤醒android app
            if (+isopenapp == 1 || +isopenapp == 3) {
                isopen_androidapp = 1;
            } else {
                isopen_androidapp = 0;
                appUrl = null;
            }
        }
    }
    if (isopen_androidapp || isopen_iosapp) {
        appUrl = this.setAppUrl(); //生产app协议url
    }
    var s = adOptions._get("SALES_OBJECT"); //获取渠道信息
    console.log(s);
    if (isMac) {
        if (appUrl && appUrl.length > 0) {
            //mwli
            $(".iOpenApp").remove();
            var iframe = $('<iframe name="iOpen" class="iOpenApp" frameborder="0" style="display:none;"></iframe>');
            iframe.attr("src", appUrl);
            $("body").append(iframe);
            //            window.location = appUrl;
        }
        /************判断是否已经强制下载，若已强制下载则不再执行自动下载************/
        if (adOptions.isAutoDown(sourceid) || !isdown_iosapp || +isdown_iosapp != 1) {
            adOptions.saveExpire(0);
            adOptions.saveAutoDown(sourceid);
        } else {
            adOptions.saveExpire(0);
            adOptions.saveAutoDown(sourceid);
            setTimeout(function () {
                window.location = "itms-apps://itunes.apple.com/cn/app/id379395415?mt=8";
                // a.location.replace(this.bannerUrl)
            }, 30);
        }
    } else {
        /*************end 2014-1-13 caofu************/
            //传入处理函数，第一个是有app时候处理方案，第二个是没有app时候处理方案
            //安装app情况下，第一个参数为true才会打开app，但是初次无论如何都会打开
        AppUtility.openApp(function () {
            adOptions.saveExpire(0);
            adOptions.saveAutoDown(sourceid);
            //强制下载后主动关闭，隐藏广告浮层
            /*if (self.root.attr('id') == 'dl_app') {
             self.root.hide();
             }*/
            return true;
        }, function () {
            /************判断是否已经强制下载，若已强制下载则不再执行自动下载************/
            if (adOptions.isAutoDown(sourceid)) {
                adOptions.saveExpire(0);
                adOptions.saveAutoDown(sourceid);
                return true;
            }
            /**************判断用户网络环境，若不是wifi环境，则不自动下载****************/
            if (navigator.connection) {
                if (navigator.connection.type != navigator.connection.WIFI) {
                    adOptions.saveExpire(0);
                    adOptions.saveAutoDown(sourceid);
                    return true;
                }
            }

            var url = "http://m.ctrip.com/market/download.aspx?from=" + sourceid;
            //设置下载Android客户端 url
            if (isAndroid) {
                if (!isdown_androidapp || +isdown_androidapp != 1) {
                    return true;
                }
                url += '&App=3';
            }
            //设置下载ios 客户端url
            if (isMac) {
                url += '&App=1';
            }
            if (s && s.sid && +s.sid > 0 && +s.sid == +sourceid && s.appurl && s.appurl.length > 0) {
                url = s.appurl;
            }
            adOptions.saveExpire(0);
            adOptions.saveAutoDown(sourceid);
            //强制下载后主动关闭，隐藏广告浮层 浮层的显示跟开关参数无关，注释
            /*if (self.root.attr('id') == 'dl_app') {
             self.root.hide();
             }*/
            window.location.href = url;
        }, appUrl);
    }
};
/********************************
 * @description: 重写create方法
 */
adOptions.create = function () {
    $('body').find('iframe').remove();
    if (!this.isCreate && !this.isExpire() && this.status !== this.STATE_ONCREATE) {
        //如果返回的是空字符，则不生成浮层 2014-1-4 caof
        var s = this.createHtml();
        if (s && s.length > 0) {
            this.root = $(s);
            this.rootBox.append(this.root);
            this.trigger('onCreate');
        } else {
            if ($('footer')) $('footer').removeClass('pb85');
            if ($('div[data-role="footer"]')) $('div[data-role="footer"]').removeClass('pb85');
            if ($('#panel-box')) {
                $('#panel-box').removeClass('pb85');
            }
            if ($('.f_list')) {
                $('.f_list').removeClass('pb85');
            }
        }
        this.isCreate = true;
    } else {
        if ($('footer')) {
            $('footer').removeClass('pb85');
        }
        if ($('#panel-box')) {
            $('#panel-box').removeClass('pb85');
        }
        if ($('.f_list')) {
            $('.f_list').removeClass('pb85');
        }
        if ($('div[data-role="footer"]')) {
            $('div[data-role="footer"]').removeClass('pb85');
        }
    }
    var html = adOptions.createHtml();

    //fix 2.0下，下载包错误的bug shbzhang 2014/6/26
    var self = this;
    console.log("hell yaaaaaaaaaaaaaaa");
    setTimeout(function () {
        adOptions.checkAutoDownload.call(self)
    }, 3000);
};

//验证是否过期
/************update 2014-1-13 增加判断isClose，若isClose==1表示用户已经关闭浮层，24小时内不再显示****************/
adOptions.isExpire = function () {
    var data = this._get(this.storeKey);
    if (data && data.isClose) {
        return true;
    }
    return false;
    //return !!data;
};
adOptions.isAutoDown = function (sourceid) {
    var data = this._get("APP_AUTODOWNLOAD");
    if (data && data.isAutoDown) {
        return true;
    }
    return false;
    //return !!data;
};
adOptions._getCookie = function (name) {
    var result = null;
    if (name) {
        var RegCookie = new RegExp('\\b' + name + '=([^;]*)\\b'), match = RegCookie.exec(document.cookie);
        result = match && unescape(match[1])
    } else {
        var cookies = document.cookie.split(';'), i, c;
        result = {};
        for (i = 0, len = cookies.length; i < len; i++) {
            c = cookies[i].split('=');
            result[c[0]] = unescape(c[2])
        }
    }
    return result;
};

adOptions.setCurrentView = function (view) {
    this.curView = view;
};

adOptions.getCurrentView = function () {
    return this.curView;
};
adOptions._get = function (key) {
    var result = window.localStorage.getItem(key);
    if (result) {
        result = JSON.parse(result);
        if (Date.parse(result.timeout) >= new Date()) {
            return result.value || result.data;
        }
    }
    return "";
};
adOptions._set = function (key, value, timeout) {
    var entity = {
        value: value,
        timeout: timeout
    };
    window.localStorage.setItem(key, JSON.stringify(entity));
};
if (window.location.pathname.indexOf('webapp') > -1 || window.localStorage.getItem('isInApp')) {
    define(['cBase', 'cUIAbstractView', 'libs', 'cStore'], function (cBase, AbstractView, libs, cStore) {
        var AdView = new cBase.Class(AbstractView, adOptions);
        AdView.getInstance = function () {
            if (this.instance) {
                return this.instance;
            } else {
                return this.instance = new this();
            }
        };
        return AdView;
    });
} else {
    adOptions.show = function () {
        this.status = '';
        this.create();
        this.onShow();
    };
    adOptions.hide = function () {
        this.root.hide();
    };
    adOptions.trigger = function () {

    };
    adOptions.remove = function () {
        $('#dl_app').remove();
    };

    var config = {
        rootBox: $('#footer')
    };
    setTimeout(function () {
        adOptions.initialize(function () {
        }, config);
        var AdView = adOptions;
        AdView.update(config);
        AdView.show();
    }, 800);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//自动调起当前页面对应的APP页面，失败则自动下载APP
adOptions.autoOpenDownApp = function (sourceid, openapp, downapp) {
    //调整自动下载需求：必须传入
    var isopenapp = openapp || 3,
        isodownapp = downapp || 3;

    var isdown_iosapp = 0,
        isdown_androidapp = 0,
        isopen_androidapp = 0,
        isopen_iosapp = 0;
    var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
    //判断设备类型
    var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0; //ios设备
    var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0; //android 设备
    if (isMac) {
        isdown_iosapp = 1;
    }
    if (isAndroid) {
        isdown_androidapp = 1;
    }
    var appUrl = null;
    if (isMac) {
        isopen_iosapp = 1;
    }
    if (isAndroid) {
        isopen_androidapp = 1;
    }
    try {
        appUrl = this.setAppUrl(); //生产app协议url
    } catch (e) {

    }
    var s = adOptions._get("SALES_OBJECT"); //获取渠道信息
    if (isMac) {
        if (appUrl && appUrl.length > 0) {
            window.location = appUrl;
        }
        setTimeout(function () {
            window.location = "itms-apps://itunes.apple.com/cn/app/id379395415?mt=8";
            // a.location.replace(this.bannerUrl)
        }, 30);
    } else {
        /*************end 2014-1-13 caofu************/
            //传入处理函数，第一个是有app时候处理方案，第二个是没有app时候处理方案
            //安装app情况下，第一个参数为true才会打开app，但是初次无论如何都会打开
        AppUtility.openApp(function () {
            return true;
        }, function () {
            var url = "http://m.ctrip.com/market/download.aspx?from=" + sourceid;
            //设置下载Android客户端 url
            if (isAndroid) {
                url += '&App=3';
            }
            //设置下载ios 客户端url
            if (isMac) {
                url += '&App=1';
            }
            if (s && s.sid && +s.sid > 0 && +s.sid == +sourceid && s.appurl && s.appurl.length > 0) {
                url = s.appurl;
            }

            window.location.href = url;
        }, appUrl);
    }
};

//营销浮层唤醒APP
adOptions.popupPromo = function () {
    var getStore = function (key, subkey) {
        subkey = subkey || "data";
        var detailInfo = window.localStorage ? window.localStorage.getItem(key) : null;
        if (detailInfo) {
            detailInfo = JSON.parse(detailInfo);
            if (detailInfo && detailInfo[subkey]) {
                return detailInfo[subkey];
            }
        }
        return {};
    };

    var popup = false, sourceid, allianceid, sid;
    if (adOptions._getCookie('Union')) {
        var obj = {};
        adOptions._getCookie('Union').replace(/([^&=]+)=([^&]*)/g, function ($, key, val) {
            obj[key] = val;
        });
        allianceid = obj["AllianceID"];
    }
    sourceid = adOptions.getUrlParam("sourceid") || getStore("SALES")["sourceid"] || getStore("SALES_OBJECT", "value")["sid"];
    sid = adOptions.getUrlParam("sid") || getStore("UNION").SID;
    if (!sourceid) return;
    allianceid = adOptions.getUrlParam("allianceid") || getStore("UNION")["AllianceID"] || allianceid,
        keywords = ["baidu.com", "google.com", "soso.com", "so.com", "bing.com", "yahoo", "youdao.com", "sogou.com", "so.360.cn", "jike.com", "babylon.com", "ask.com", "avg.com", "easou.com", "panguso.com", "yandex.com", "sm.cn"],
        sourceids = ["1825", "1826", "1827", "1828", "1829", "1831", "1832", "1833", "1830"];
    //Sid: 178071,Sid: 446852
    //sourceid:1833 Allianceid:18887 Sid: 447459

    sIds = [130028, 130029, 409197, 353693, 130026, 135366, 297877,
        130033, 130034, 131044, 110603, 353694, 130678, 135371, 353696, 130701,
        135374, 110611, 353698, 130709, 135376, 110614, 426566, 426568, 353701,
        130727, 135379, 139029, 110620, 353703, 130761, 135383, 353704, 130788,
        135388, 110630, 353699, 353700, 189318, 135390, 130860, 130875, 303055,
        156043, 130862, 130863, 130876, 130859, 240799, 159295, 442174, 176275,
        240801, 231208, 278782, 326416, 353680, 295517, 130999, 130907, 112563,
        176220, 110647, 3752, 125344, 144532, 120414, 171210, 86710, 110276, 447459];
    allianceids = ["4897", "4899", "4900", "4901", "4902", "4903", "4904", "5376", "5377", "3052", "13964", "13963", "18887"];

    /*matchPopup = function(){
     var matchKeyword = false, matchAllianceid = false;
     for(var i = 0, len = keywords.length; i < len; i++){
     if(document.referrer.match(keywords[i])){
     matchKeyword = true;
     break;
     }
     }
     for(var i = 0, len = allianceids.length; i < len; i++){
     if(allianceid == allianceids[i]){
     matchAllianceid = true;
     break;
     }
     }
     return matchKeyword && matchAllianceid;
     };*/
    /**
     * mwli
     */
    matchPopup = function () {
        var matchKeyword = false, matchSid = false;
        for (var i = 0, len = keywords.length; i < len; i++) {
            if (document.referrer.match(keywords[i])) {
                matchKeyword = true;
                break;
            }
        }
        for (var i = 0, len = sIds.length; i < len; i++) {
            if (+sid === sIds[i]) {
                matchSid = true;
                break;
            }
        }
        return matchKeyword && matchSid;
    };
    console.log(document.referrer ? "refer url :" + document.referrer : "referrer undefined");
    //sepopup参数为1或者命中策略时会弹层，但是如果前一个页面已出现弹层，则不再出
    if ((adOptions.getUrlParam("sepopup") == 1 || matchPopup()) && document.referrer.indexOf("sepopup=1") < 0) {
        if (document.getElementById("se-popup") === null) {
            var saleobj = getStore("SALES_OBJECT", "value");
            var telnum = saleobj.tel || "4000086666";

            var str = [
                '<div class="se-popup" id="se-popup">',
                '<div class="se-main" style="width:240px;height:329px;margin-top:-165px;margin-left:-120px;position:fixed;top:50%;left:50%;z-index:10000;">',
                '<img src="http://res.m.ctrip.com/market/images/popup.png" width="100%" />',
                '<a class="se-close" href="javascript:void(0)" style="position:absolute;width:19px;height:19px;top:9px;right:9px;"></a>',
                '<a class="se-openapp __appaddress__" href="/market/download.aspx?from=MPopup" style="position:absolute;width:154px;height:43px;bottom:97px;right:43px;"></a>',
                    '<a class="se-phone __hreftel__" href="tel:' + telnum + '" style="position:absolute;width:154px;height:30px;bottom:60px;right:43px;"></a>',
                '<a class="se-continue" href="javascript:void(0)" style="position:absolute;width:154px;height:30px;bottom:21px;right:43px;"></a>',
                '</div>',
                '<div class="se-mask" style="position:fixed;left:0px;top:0px;width:100%;height:100%;z-index:9999;background:rgba(0,0,0,.2);"></div>',
                '</div>'
            ].join("");
            $(str).appendTo($(document.body));
            $(".se-close").on("click", function () {
                $(".se-popup").css("display", "none");
            });
            $(".se-continue").on("click", function () {
                $(".se-popup").css("display", "none");
            });
            $(".se-openapp").on("click", function () {
                adOptions.autoOpenDownApp(sourceid, 3, 3);
                return false;
            });
        }
    }
};
//时序
setTimeout(function () {
    adOptions.popupPromo();
}, 2000);

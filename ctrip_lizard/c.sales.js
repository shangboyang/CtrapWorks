define(['cBase', 'cStorage', 'libs', 'CommonStore', 'cModel'], function (cBase, cStorage, libs, CommonStore, AbstractModel) {
    var __SALES__ = null;
    var salesOStore = CommonStore.SalesObjectStore.getInstance();

    var getServerUrl = function (protocol) {
        // @description 直接调用AbstractModel的方法，如果是https的站点，需要传入protocol='https'
        return AbstractModel.baseurl(protocol);
    };

    var getSalesObject = function (sales, callback, error) {
        var salesObject = salesOStore.get(sales);
        if (salesObject) {
            __SALES__ = salesObject;
            if (!salesObject.appurl || salesObject.appurl.length <= 0) {
                $('#dl_app').hide();
            } else {
                $('#dl_app').show();
            }
            callback && callback(salesObject);
        } else {
            var serverPath = getServerUrl();
            var url = '/html5/ClientData/GetSalesInfo/' + sales;
            //            var url = 'http://' + (serverPath && serverPath.domain) + '/html5/ClientData/GetSalesInfo/' + sales;
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                success: $.proxy(function (data) {
                    var _data = {};
                    if (data.ServerCode == 1) {

                        if (data.Data) {
                            for (var i in data.Data) _data[i.toLowerCase()] = data.Data[i];
                            data.Data = _data;
                            salesOStore.set(data.Data, sales);
                            var day = 30;
                            if (data.Data && (data.Data.sales === 'ydwxcs' || data.Data.sales === '1622')) {
                                day = 5;
                            }
                            if (!data.Data.appurl || data.Data.appurl.length <= 0) {
                                $('#dl_app').hide();
                            } else {
                                $('#dl_app').show();
                            }
                            cStorage.localStorage.oldSet('SALESOBJ', JSON.stringify({
                                data: data.Data,
                                timeout: (new cBase.Date(cBase.getServerDate())).addDay(day).format('Y/m/d H:i:s')
                            }));
                        }
                        __SALES__ = data.Data;
                        callback && callback(data.Data);
                    } else {
                        error && error(data);
                    }
                }, this),
                error: $.proxy(function (e) {
                    error && error(e);
                }, this)
            });
        }
    };

    var getSales = function () {
        return __SALES__ || salesOStore.get();
    },
    setSales = function (sales) {
      CommonStore.SalesStore.getInstance().set({ 'sales': sales });
    },
    setSourceId = function (sourceid) {
      CommonStore.SalesStore.getInstance().set({ 'sourceid': sourceid });
    },
    setUnion = function (Union) {
      CommonStore.UnionStore.getInstance().set(Union);
    };
    var RegTel = /400\d{3}\d{4}/i,
      RegTelTitle = /400\s+\d{3}\s+\d{4}/i,
      RegTelTitle2 = /400-\d{3}-\d{4}/i;
    var ua = navigator.userAgent;
    var isApple = !!ua.match(/(ipad|iphone)/i),
      isAndroid = !!ua.match(/android/i),
      isWinPhone = !!ua.match(/MSIE/i);
    var replaceStrTel = window.replaceStrTel = function (str) {
        var salesObj = getSales();
        if (typeof str === 'string' && salesObj && salesObj.tel) {
            str = str.replace(RegTel, salesObj.tel);
            str = str.replace(RegTelTitle, salesObj.teltitle);
            if (salesObj.teltitle) str = str.replace(RegTelTitle2, salesObj.teltitle.split(' ').join('-'));
        }
        return str;
    };
    var getPlatFormCode = function () {

        var platform = null;
        if (isApple) {
            platform = "ios-app";
        } else if (isAndroid) {
            platform = "andreod-app";
        } else if (isWinPhone) {
            platform = "win-app";
        }
        return platform;
    };
    //替换app下载地址
    var replaceStrApp = function (str) {
        var salesObj = getSales();
        if (salesObj) {
            if (salesObj.isseo) {
                $('.module').show();
            }
            if (salesObj.appurl) {
                return salesObj.appurl;
            } else {
                var str = salesObj.sid ? salesObj.sid : salesObj.sales;
                return "/market/download.aspx?from=" + str;
            }
        }
        return null;
    };

    //替换页面中的400电话
    function replaceContent(el) {
        //修改链接中的电话
        var MARKLINKCLASS = '.__hreftel__',
        //修改内容中的电话
        MARKCONTCLASS = '.__conttel__',
        //修改应用的下载链接
        MAREAPPADDRESS = '.__appaddress__';
        $(el[0]).find(MARKLINKCLASS).each(function () {
            this.href = replaceStrTel(this.href);
        });
        $(el[0]).find(MARKCONTCLASS).each(function () {
            var $this = $(this);
            $this.html(replaceStrTel($this.html()));
        });
        //$(el[0]).find(MAREAPPADDRESS).each(function () {
        $(MAREAPPADDRESS).each(function () {
            var href = replaceStrApp();
            if (!href) {
                switch (true) {
                    case isApple:
                        href = $(this).attr('data-ios-app');
                        break;
                    case isAndroid:
                        href = $(this).attr('data-android-app');
                        break;
                    case isWinPhone:
                        href = $(this).attr('data-win-app');
                        break;
                }
            }
            if (href) {
                $(this).attr('href', href);
            }

        });
    };

    function updateSales(inView) {
        var $el = inView.$el;
        // add get request UrlParameters function
        var getUrlParam = function (name) {
            var urls = document.location.href || '',
          re = new RegExp("(\\\?|&)" + name + "=([^&]+)(&|$)", "i"),
          m = urls.match(re);
            if (m) {
                return m[2];
            }
            return '';
        };
        if (!inView.getQuery) inView.getQuery = Lizard.P;
        !inView.getUrlParam ? inView.getUrlParam = getUrlParam : undefined;
        //1.优先获取url中的渠道参数
        var newSourceid = inView.getUrlParam('sourceid'),
            newSales = inView.getUrlParam('sales');
        //2.如果url中没有渠道参数，则判断referrer
        if ((!newSales || newSales.length <= 0) && (!newSourceid || newSourceid.length <= 0)) {
            var local = location.host, refUrl = document.referrer,
                seosales = '';
            if (local) {
                refUrl = refUrl.replace('http://', '').replace('https://', '').split('/')[0].toLowerCase();
                if (refUrl.indexOf('baidu') > -1) {
                    seosales = 'SEO_BAIDU';
                }
                if (refUrl.indexOf('google') > -1) {
                    seosales = 'SEO_GOOGLE';
                }
                if (refUrl.indexOf('soso.com') > -1) {
                    seosales = 'SEO_SOSO';
                }
                if (refUrl.indexOf('sogou') > -1) {
                    seosales = 'SEO_SOGOU';
                }
                if (refUrl.indexOf('so.com') > -1) {
                    seosales = 'SEO_SO';
                }
                if (refUrl.indexOf('so.360') > -1) {
                    seosales = 'SEO_360SO';
                }
                if (refUrl.indexOf('bing.com') > -1) {
                    seosales = 'SEO_BING';
                }
                if (refUrl.indexOf('yahoo') > -1) {
                    seosales = 'SEO_YAHOO';
                }
                if (refUrl.indexOf('youdao') > -1 || refUrl.indexOf('sm.cn') > -1) {
                    seosales = 'SEO_YOUDAO';
                }
                if (refUrl.indexOf('jike.com') > -1 || refUrl.indexOf('babylon.com') > -1 || refUrl.indexOf('ask.com') > -1 || refUrl.indexOf('avg.com') > -1 || refUrl.indexOf('easou.com') > -1 || refUrl.indexOf('panguso.com') > -1 || refUrl.indexOf('yandex.com') > -1) {
                    seosales = 'SEO_360SO';
                }

            }
        }

        //不需要再从LocalStorage取出渠道信息进行查询,故注释以下信息
        /*
        var appSourceid = window.localStorage.getItem('SOURCEID');
        var _sales = CommonStore.SalesStore.getInstance().get();
        var sales = inView.getUrlParam('sales') || seosales || (_sales && _sales.sales), sourceid = inView.getUrlParam('sourceid') || appSourceid || (_sales && _sales.sourceid);
        */
        if ((newSourceid && +newSourceid > 0) || (newSales && newSales.length > 0)) {
            //移除APP_DOWNLOAD
            cStorage.localStorage.oldRemove("APP_DOWNLOAD");
        }
        //3.如果渠道参数存在，则获取服务端的渠道配置
        if (newSourceid || newSales) {
            if (newSales) {
                setSales(newSales);
            }
            if (newSourceid) {
                setSourceId(newSourceid);
            }
            getSalesObject(newSales || newSourceid, $.proxy(function (data) {
                //如果没有配置下载渠道包，则隐藏下载广告浮层2014-1-4 caof
                if (!data.appurl || data.appurl.length <= 0) {
                    if (inView && inView.footer && inView.footer.rootBox) {
                        var ad = inView.footer.rootBox.find('#dl_app');
                        if (ad && ad.length > 0) { ad.hide() };
                    }
                }
                // end caof
                inView.warning404.tel = data && data.tel ? data.tel : '4000086666';
                replaceContent($el);
            }, inView));
        } else {
            if (newSales) setSales(newSales);
            //若已经存储有渠道信息，则替换渠道的电话，下载地址信息
            setTimeout(function () {
                replaceContent($el);
            }, 100);
        }
    }

    return {
        //替换当前页面中内容
        replaceContent: replaceContent,
        //接受一个参数，让其替换为
        replaceStrTel: replaceStrTel,
        //设置sales渠道
        setSales: setSales,
        getSales: getSales,
        getSalesObject: getSalesObject,
        setUnion: setUnion,
        //设置sourceid渠道
        setSourceId: setSourceId,
        updateSales: updateSales
    };
});
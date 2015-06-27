//google universal analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','__ga_new');

if (window.location.host.match('zhubajie.com')) {
	__ga_new('create', 'UA-2919274-25', 'zhubajie.com');
} else {
    // 如果是域名www.zbj.com下面, 但是不包含www.t6.zbj.com， 则添加如下代码
    if(location.host.indexOf('zbj.com') > -1 && location.host.indexOf('t6.') == -1){
        __ga_new('create', 'UA-45159514-3', 'zbj.com');
        // 添加此图片，用于访问www.zbj.com的时候，增加推广员cookie到www.zhubajie.com域名
        new Image().src = 'http://union.zhubajie.com/yx/zbjbdunion.gif';
    }else{
        __ga_new('create', 'UA-45159514-1', 'zbj.com');
    }
}


__ga_new('send', 'pageview');

//google
var _gaq = _gaq || [];
if (location.host.match('zhubajie.com')) {
    _gaq.push(['_setAccount', 'UA-2919274-4']);
    _gaq.push(['_setDomainName', 'zhubajie.com']);
    _gaq.push(['_setLocalGifPath', location.protocol + '//galog.zhubajie.com/dot.gif'],['_setLocalRemoteServerMode']);
} else {
    _gaq.push(['_setAccount', 'UA-45159514-2']);
    _gaq.push(['_setDomainName', 'zhubajie.la']);
	_gaq.push(['_setLocalGifPath', 'http://ga.log.zhubajie.la/dot.gif'],['_setLocalRemoteServerMode']);
}
_gaq.push(['_trackPageview']);


(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

// comment out by chengchao. www.google.com 不可用导致页面一直显示loading
//var google_conversion_id = 1063042944;
//var google_conversion_label = "L6d8CKDHqAMQgP_y-gM";
//var google_custom_params = window.google_tag_params;
//var google_remarketing_only = true;
//
//(function(){
//    var script = document.createElement('script');
//    script.type="text/javascript"
//    script.src='//www.googleadservices.com/pagead/conversion.js';
//    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(script, s);
//    (new Image).src='//googleads.g.doubleclick.net/pagead/viewthroughconversion/1063042944/?value=0&amp;label=L6d8CKDHqAMQgP_y-gM&amp;guid=ON&amp;script=0';
//})();

// JavaScript Document
if(location.host.indexOf('zbj.com') > -1 && location.host.indexOf('t6.') == -1){
    var _bdhmProtocol = (("https:" == document.location.protocol) ? " https://" : " http://");
    document.write(unescape("%3Cscript src='" + _bdhmProtocol + "hm.baidu.com/h.js%3Fa9be76f51f7880c755391d2e0ff3e4f8' type='text/javascript'%3E%3C/script%3E"));
}else{
    var _bdhmProtocol = (("https:" == document.location.protocol) ? " https://" : " http://");
    document.write(unescape("%3Cscript src='" + _bdhmProtocol + "hm.baidu.com/h.js%3F20e969969d6befc1cc3a1bf81f6786ef' type='text/javascript'%3E%3C/script%3E"));
}

var _sgq = _sgq || [];
_sgq.push(['setSgAccount', 'odoallsz']);

setTimeout(function() {
    var sg = document.createElement('script'); sg.type = 'text/javascript'; sg.async = true;
    sg.src = ("https:" == document.location.protocol ? "https://dc" : "http://cdn0") + ".skyglue.com/sgtracker.js";
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(sg, s);
}, 1);
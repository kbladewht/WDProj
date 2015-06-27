var jQuery18 = jQuery;

window.console = window.console || {};
console.log = console.log||function(){}
window.historyLoaded = false;

//prepare webim button, indicat that the webim system is loading...
function prepareWebIMButton(){
    jQuery18('[webim]').each(function(){
        var _this = jQuery18(this);
        (function(ctx){
        	var wb = ctx.attr('webim');
            var reg = /bname:'([\s\S]*)('[},])/;
            reg.exec(wb);
            wb = wb.replace(reg,function(a){
                var exp1 = RegExp.$1;
                var exp2 = RegExp.$2;
                return "bname:'"+exp1.replace(/'/g,'\\\'')+exp2;
            });
            var options = eval( "(" + wb + ")" );
            //1. give basic layout and css.
//          ctx.css('display','none');
            ctx.addClass('butn').addClass(options.style+"-butn").addClass(options.style+"-butn-yellow");
            ctx.html('<i></i><u>联系我</u>');
        })(_this);
    });
}
prepareWebIMButton();

(function(exports, global) {
    var WebIM = exports;
//  var hosts = [ 'http://localhost:16384' ];
//  var hosts = [ 'http://www.v5.zbj.com:16384' ];
//  var hosts = [ 'http://corpnet.julumobile.com:32768' ];
//  var hosts = [ 'http://203.156.233.35:32768' ];
//  var hosts = [ 'http://webim.zhubajie.com:32768' ];
    var hosts = [window.WEBIMCONFIG.host];
    WebIM.socket = null;// global socket
    WebIM.version = '0.0.1';
    if ( document.location.href.indexOf("failed=1") > 0 ) {
        WebIM.sendTimeout = 10 * 1000;//10s
    } else {
        WebIM.sendTimeout = 120000;//2 minutes
    }
    WebIM.initialized = false;
    WebIM.statusReady = false;
    WebIM.currentStatus = {};
    WebIM.getbrandnameurl = window.WEBIMCONFIG.getbrandnameurl;

    WebIM.setting = {
        //静音
        mute: 0
    }
    
    WebIM.userBrandName = '';
    
    WebIM.pageId = '';
    
    WebIM.watchUserStatus = function(p){
        if(!WebIM.pageWatchUsers){
            WebIM.pageWatchUsers = {};
        }
        for ( var i in p) {
            if(!WebIM.pageWatchUsers[i]){
                WebIM.pageWatchUsers[i] = new Array();
            }
            WebIM.pageWatchUsers[i].push(p[i]);
        }
    };
    
    WebIM.onNotification = function(callback){
        if(!WebIM.notificationCallBacks){
            WebIM.notificationCallBacks = [];
        }
        WebIM.notificationCallBacks.push(callback);
    };
(function (exports, global) {
    /**
     * page voting namespace
     */
    var voting = exports.voting = {};
//  voting.startpolling = function(){
//      if(WebIM.pageId == ''){
//          WebIM.pageId = WebIM.createUUID();
//          document.
//      }
//      voting.timer = setInterval(function(){
//          //check self is main page or not.
//      },800);
//  }
//  voting.checkmainpage = function(){
//      return {
//          mainexist:true,
//          maintime:12313001819237,
//          mainid:asdoiqwerADSfoqw
//      };
//  }
//  voting.vote = function(){
//      
//  }
})(exports,this);

(function (exports, global) {
    /**
     * page hibernating namespace
     */
    var hibernate = exports.hibernate = {};
    hibernate.disable = true;//to not hibernate.
    hibernate.hibernatetimer = null;
    hibernate.wakeuptimer = null;
    hibernate.ishibernate = false;
    hibernate.focustimer = null;
    hibernate.blurtimer = null;
    hibernate.initDone = function(){
        if(hibernate.disable) return true;
        //bind page focus and unfocus event.
        jQuery18(window).focus(function() {
            hibernate.cleartimer();
            hibernate.focustimer = setTimeout(function(){
                hibernate.wakeup();
                hibernate.autohibernate(2*60*1000,2*60*1000);
            },10000);
        });

        jQuery18(window).blur(function() {
            hibernate.cleartimer();
            hibernate.blurtimer = setTimeout(function(){
                hibernate.hibernate();
            },1*60*1000);
        });
        
        hibernate.autohibernate(2*60*1000,2*60*1000);
    }
    
    hibernate.autohibernate = function(htime,wtime){
        if(hibernate.disable) return true;
        hibernate.cleartimer();
        hibernate.hibernatetimer = setTimeout(function(){
            hibernate.hibernate();
            hibernate.wakeuptimer = setTimeout(function(){
                hibernate.wakeup();
                hibernate.autohibernate(2*60*1000,2*60*1000);
            },wtime);
        },htime);
    }
    hibernate.cleartimer = function(){
        if(hibernate.hibernatetimer){
            clearTimeout(hibernate.hibernatetimer);
        }
        if(hibernate.wakeuptimer){
            clearTimeout(hibernate.wakeuptimer);
        }
        if(hibernate.focustimer){
            clearTimeout(hibernate.focustimer);
        }
        if(hibernate.blurtimer){
            clearTimeout(hibernate.blurtimer);
        }
    }
    hibernate.hibernate = function(){
        if(!hibernate.ishibernate){
            hibernate.ishibernate = true;
            WebIM.ui.alert("WebIM已进入休眠状态，点击唤醒!",true);
            WebIM.socket.socket.disconnect();
        }
    }
    hibernate.wakeup = function(){
        if(hibernate.disable) return true;
        if(hibernate.ishibernate){
            hibernate.ishibernate = false;
            WebIM.ui.alert("正在唤醒WebIM，请稍后！",true);
            WebIM.socket.socket.connect();
        }
    }
})(exports,this);
    
(function (exports, global) {
    /**
     * outbound queue namespace
     */
    var outboundQueue = exports.outboundQueue = {};
    outboundQueue.queue = [];
    outboundQueue.get = function(uuid){
        for(var i in this.queue){
            if(this.queue[i].uuid == uuid){
                return this.queue[i];
            }
        }
        return null;
    }
    outboundQueue.remove = function(uuid){
        for(var i in outboundQueue.queue){
            if(outboundQueue.queue[i].uuid == uuid){
                outboundQueue.queue.splice(i,1);
//              console.info(uuid+" got deleted!");
                break;
            }
        }
    }
    outboundQueue.add = function(msg){
        var uuid = WebIM.createUUID();
        var msgObj = {uuid:uuid,msg:msg,status:'sending',timer:null};
        this.queue.push(msgObj);
    }
    outboundQueue.sendMsgTimeout = function(uuid){
//      console.info("got timeout: "+uuid);
        var msgObj = outboundQueue.get(uuid);
        if(msgObj != null){
            WebIM.ui.alert(msgObj.msg.msg  + " 没有发送成功", false);
            outboundQueue.remove(msgObj.uuid);//delete failed message.

            setTimeout(function(){
                WebIM.ui.alertClean();
            }, 5 * 1000);
//          msgObj.status = 'timeout';
////            console.info(msgObj.msg.msg+":"+ uuid+ " got timeout!");
//          this.handle();
        }
    }
    outboundQueue.reset = function(){
        for(var i in this.queue){
            var msgObj = this.queue[i];
            clearTimeout(msgObj.timer);
            msgObj.status = 'sending';
        }
    }
    outboundQueue.handle = function(){
        if(WebIM.initialized){
            for(i=0;i<outboundQueue.queue.length;i++){
                var msgObj = outboundQueue.queue[i];
                if(msgObj.status == 'sending'){
//                  console.info("settimeout "+msgObj.uuid);
                    msgObj.timer = setTimeout(function( uuid ){
                        return function(){
                            WebIM.outboundQueue.sendMsgTimeout( uuid );
                        }
                    }(msgObj.uuid), WebIM.sendTimeout);
//                    msgObj.timer = setTimeout("WebIM.outboundQueue.sendMsgTimeout('"+msgObj.uuid+"')",WebIM.sendTimeout);
                    msgObj.msg.sendtime = +new Date();
                    msgObj.status = 'sent';
                    (function(msgObj){
                        privateSendMsg(msgObj.msg,function(resp){
//                      console.info(msgObj.msg.msg+" got receipt! "+resp+": "+i);
                            clearTimeout(msgObj.timer);
                            outboundQueue.remove(msgObj.uuid);
//                      console.info("after remove "+outboundQueue.queue);
                        });
                    })(msgObj);
                    
                }
//              else if(msgObj.status == 'timeout'){
//                      
//                  i--;
//                  continue;
//              }
                else if(msgObj.status == 'sent'){
                    //nothing here!
                }
            }
        }
    }
    function privateSendMsg(msgPayload, callBack) {
        WebIM.hibernate.autohibernate(5*60*1000,2*60*1000);
        WebIM.socket.emit('chat', msgPayload, function(resp) {
            if(resp == 'TOO FAST'){
                WebIM.ui.alert("您的消息发送频率太快了！休息一下吧。如果有需要您可以联系客服",true);
                return; 
            }
            if(resp == 'NOT MEMBER'){
                WebIM.ui.alert("你没有沟通特权，不能进行对话。如果有需要请联系客服",true);
                return;
            }
            if(resp != 'OK'){
                alert(resp);
            }
            if ('function' == typeof callBack) {
                callBack(resp);
            }
        });
    }
})(exports,this);

(function (exports, global) {
    /**
     * inbound queue namespace
     */
    var inboundQueue = exports.inboundQueue = {};
    inboundQueue.queue = [];
    inboundQueue.add = function(msgs){
        //sort by timestamp;
        msgs.sort(function(a,b){
            return a.timestamp - b.timestamp;
        });
        this.queue.push(msgs);
    }
    inboundQueue.handle = function(){
        console.log('inboundQueue.handle: webim.inited=',WebIM.initialized,',subArray=',this.queue[0])
        if(WebIM.initialized && window.historyLoaded ){
            while(subArray = this.queue.shift()){
                WebIM.ui.recieveMsg(subArray);
            }
        }
    }
})(exports,this);

(function (exports, global) {
    /**
     * inbound queue namespace
     */
    var statusQueue = exports.statusQueue = {};
    statusQueue.queue = [];
    statusQueue.add = function(status){
        this.queue.push(status);
    }
    statusQueue.handle = function(){
        if(WebIM.initialized){
            while(statusObj = this.queue.shift()){
                //handle status here!
                switch (statusObj.type) {
                case 'MESSAGE':
                    var orig = statusObj.original;
                    orig.to = statusObj.target;
//                  orig.toNick = statusObj.targetNick;
                    WebIM.ui.recieveMsg([orig]);
                    break;
                case 'STORE':
                    WebIM.ui.changeStatus(statusObj.content);
                    break;
                case 'PRESENCE':
                    if(typeof statusObj.source === "string"){
                        if(WebIM.pageWatchUsers && WebIM.pageWatchUsers[statusObj.source]){
                            for(var i in WebIM.pageWatchUsers[statusObj.source]){
                                WebIM.pageWatchUsers[statusObj.source][i](statusObj.source,statusObj.status);
                            }
                        }
                        WebIM.ui.changeUserStatus(statusObj.source,statusObj.status == 'OFFLINE'?false:true);
                    }else{
                        var userids = statusObj.source;
                        var userOnlines = statusObj.status;
                        for ( var idx = 0; idx < userids.length; idx++) {
                            var isOnline = userOnlines[idx] == 'OFFLINE'?false:true;
                            WebIM.ui.changeUserStatus(userids[idx],isOnline);
                            if(WebIM.pageWatchUsers && WebIM.pageWatchUsers[userids[idx]]){
                                for(var i in WebIM.pageWatchUsers[userids[idx]]){
                                    WebIM.pageWatchUsers[userids[idx]][i](userids[idx],userOnlines[idx]);
                                }
                            }
                        }
                    }
                    break;
                default:
                    break;
                }
            }
        }
    }
})(exports,this);

    WebIM.connect = function(userid, callBacks) {
        WebIM.socket = io.connect(choiceHost(), {
            query : 'user=' + userid,
            "connect timeout":60000
//          ,
//          'sync disconnect on unload' : true
        });

        WebIM.socket.on('connect', function() {
            WebIM.ui.alertClean();
            if (callBacks && 'function' == typeof callBacks.onConnect) {
                callBacks.onConnect();
            }
        });
        
        WebIM.socket.on('close', function() {
            WebIM.ui.alert("与服务器的连接已断开，1分钟后重连...",true);
            WebIM.socket.socket.disconnect();
            setTimeout(function(){
                WebIM.socket.socket.connect();
            },1*60*1000);
        });

        WebIM.socket.on('chat', function(msgs) {
            //console.log('onchat',msgs);
            
            WebIM.inboundQueue.add(msgs);
            WebIM.inboundQueue.handle();
            
            if (callBacks && 'function' == typeof callBacks.onMessage) {
                callBacks.onMessage(msg);
            }
        });

        WebIM.socket.on('reconnect', function() {
            WebIM.ui.alertClean();
            if (callBacks && 'function' == typeof callBacks.onReconnect) {
                callBacks.onReconnect();
            }
        });

        WebIM.socket.on('disconnect', function() {
            if (callBacks && 'function' == typeof callBacks.onDisconnect) {
                callBacks.onDisconnect();
            }
        });

        WebIM.socket.on('reconnecting', function() {
            WebIM.ui.alert("与服务器的连接已断开，正在尝试重连...",true);
            if (callBacks && 'function' == typeof callBacks.onReconnecting) {
                callBacks.onReconnecting();
            }
        });

        WebIM.socket.on('error', function(e) {
            WebIM.ui.alert("无法连接服务器，请稍后刷新页面重试",true);
            if (callBacks && 'function' == typeof callBacks.onError) {
                callBacks.onError(e);
            }
        });
        
        WebIM.socket.on('connect_failed', function () {
            WebIM.ui.alert("无法连接服务器，请稍后刷新页面重试",true);
            if (callBacks && 'function' == typeof callBacks.onFailed) {
                callBacks.onFailed(e);
            }
        });
        WebIM.socket.on('reconnect_failed', function () {
            WebIM.ui.alert("经过重试，仍无法连接服务器，请稍后刷新页面重试",true);
        })
        
        WebIM.socket.on('shutdown',function(){
            WebIM.socket.socket.disconnect();
            WebIM.ui.alert("与服务器的连接已断开，正在重新连接......",true);
            setTimeout(function(){
                WebIM.socket.socket.connect();
            },1000);
        });
        
        WebIM.socket.on('status', function(status) {
            if(status.type == 'STORE' && !WebIM.statusReady){
                //the first time, build the UI with 
                WebIM.currentStatus = status;
                WebIM.ui.init(status.content);
                WebIM.statusReady = true;
                WebIM.initDone();
//              WebIM.initHistory();//boris. history will be load when every time "createTab" be called.
            }else{
                //use queue to handle the status change event.
                WebIM.statusQueue.add(status);
                WebIM.statusQueue.handle();
            }
        });
        
        WebIM.socket.on('notification', function(notificationMsg){
            console.info(notificationMsg);
            for ( var i in  WebIM.notificationCallBacks) {
                WebIM.notificationCallBacks[i](notificationMsg);
            }
        });
        
    };
    
    function watchPageUsers(){
        if(WebIM.pageWatchUsers){
            var userids = new Array();
            for ( var userid in WebIM.pageWatchUsers) {
                userids.push(userid);
            }
            WebIM.watchUsers(userids);
        }
    }
    WebIM.buildWebIMButtons = function(){
        jQuery18('[webim]').each(function(){
            var _this = jQuery18(this);
            (function(ctx){
	        	var wb = ctx.attr('webim');
                var reg = /bname:'([\s\S]*)('[},])/;
                reg.exec(wb);
                wb = wb.replace(reg,function(a){
                    var exp1 = RegExp.$1;
                    var exp2 = RegExp.$2;
                    return "bname:'"+exp1.replace(/'/g,'\\\'')+exp2;
                });
	        	
	        	
	            var options = eval('('+wb+')');
                //2. binding onclick event.
                ctx.click(function(){
                    if(options.abouttype){
                        WebIM.requestChat(options.uid,options.bname,options.abouttype,options.aboutid);
                    }else{
                        WebIM.requestChat(options.uid,options.bname);
                    }
                });
                //3. track user status.
                var param = new Array();
                param[options.uid] = function(userid,status){
                    if(status == 'ONLINE'){
                        ctx.removeClass(options.style+'-butn-offline').addClass(options.style+'-butn-online');
                        ctx.find('u').text('联系我');
                    }else{
                        ctx.removeClass(options.style+'-butn-online').addClass(options.style+'-butn-offline');
				    	ctx.find('u').text('给我留言');
                    }
                    ctx.css('display','');
                };
                WebIM.watchUserStatus(param);
            })(_this);
            
        });
    }
    
//  WebIM.initHistory = function(){
//      if(WebIM.currentStatus && WebIM.currentStatus.tabs){
//          for(var i in WebIM.currentStatus.tabs){
//              var tab = WebIM.currentStatus.tabs[i];
//              var userId = tab.userid;
//              //query initialize history here:
//              var mockHistory = [];
//              WebIM.ui.recieveMsg(mockHistory);
//          }
//      }
//      WebIM.initDone();
//  }
    
    WebIM.requestChat = function(userid,userNick,aboutType,aboutId){
        if(WebIM.hibernate.ishibernate){
            WebIM.hibernate.wakeup();
        }
        WebIM.hibernate.autohibernate(5*60*1000,2*60*1000);
        WebIM.ui.requestChat(userid,userNick,aboutType,aboutId);
        WebIM.watchUsers([userid]);
    }
    
    WebIM.watchUsers = function(userids){
        WebIM.socket.emit('watch',{action: 'WATCH', id_list: userids},function(response){
            if(response != userids.length+''){
//              console.error("watch failed");
            }
        });
    }
    WebIM.unwatchUsers = function(userids){
        WebIM.socket.emit('watch',{action: 'UNWATCH', id_list: userids},function(response){
            if(response != userids.length+''){
//              console.error("watch failed");
            }
        });
    }
    
    WebIM.sendMsg = function(msgPayload) {
        WebIM.outboundQueue.add(msgPayload);
        WebIM.outboundQueue.handle();
    }
    
    WebIM.ack = function(msgIds){
        WebIM.socket.emit('ack',{ackid:msgIds});
    }
    
    WebIM.updateStatus = function(statusObj){
        WebIM.socket.emit('update',{type:'STORE',content:statusObj});
    }
    
    WebIM.loadHistory = function(participant,offset,pagesize,callback){
        WebIM.socket.emit('query',{'type':'HISTORY','participant':participant,'offset':offset,'size':pagesize},function(msgs) {
            if (callback && 'function' == typeof callback) {
                callback(msgs);
            }
        });
    }
    

    WebIM.getBrandName = function(userid, callback) {
        WebIM.socket.emit('query',{'type':'NICK','id_list':[userid]},function(result) {
            if (callback && 'function' == typeof callback) {
                callback(result[0].brandname, result[0].photo,result[0].userid);
            }
        });
    }

    WebIM.getBrandNames = function(userids, callback) {
        WebIM.socket.emit('query',{'type':'NICK','id_list':userids},function(result) {
            if (callback && 'function' == typeof callback) {
                callback(result);
            }
        });
    }
    
    WebIM.getContacts = function(callback){
        var userid = WebIM.getUserId();
        WebIM.socket.emit('query',{'type':'CONTACTS','uid':userid},function(result) {
            if (callback && 'function' == typeof callback) {
                callback(result);
            }
        });
    }
    
    WebIM.getRecentContacts = function(callback){
        var userid = WebIM.getUserId();
        WebIM.socket.emit('query',{'type':'HISTORY','offset':0,'pagesize':20},function(msgs) {
            if (callback && 'function' == typeof callback) {
                callback(msgs);
            }
        });
    }
    
    WebIM.getUserName = function(){
        return WebIM.userBrandName;
//      return _getCookie('brandname');
    }
    WebIM.getUserId = function(){
        return _getCookie('userid');
    }   
    function _getCookie(name){
        var arg = name + "="; 
        var alen = arg.length;
        var clen = document.cookie.length;
        var i = 0;
        while (i < clen) {
            var j = i + alen;
            if (document.cookie.substring(i, j) == arg) return _getCookieVal (j);
            i = document.cookie.indexOf(" ", i) + 1;
            if (i == 0) break; 
        } 
        return null;
    }
    function _getCookieVal(offset) {
        var endstr = document.cookie.indexOf (";", offset);
        if (endstr == -1)endstr = document.cookie.length;
        return decodeURI(document.cookie.substring(offset, endstr));
    }

    function _setCookie (name, value) {
        var argv = _setCookie.arguments;
        var argc = _setCookie.arguments.length;
        var expires = (argc > 2) ? argv[2] : null;
        var path = (argc > 3) ? argv[3] : null;
        var domain = (argc > 4) ? argv[4] : null;
        var secure = (argc > 5) ? argv[5] : false;
        document.cookie = name + "=" + escape (value)
            + ((expires == null) ? "" : ("; expires=" + expires.toGMTString()))
            + ((path == null) ? "" : ("; path=" + path))
            + ((domain == null) ? "" : ("; domain=" + domain))
            + ((secure == true) ? "; secure" : "");
    }

    WebIM.isUserOnline = function(){
        return true;
    }

    function choiceHost() {
        return hosts[0];
    }
    
//  WebIM.createUUID = (function (uuidRegEx, uuidReplacer) {  
//        return function () {  
//            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();  
//        };  
//    })(/[xy]/g, function (c) {  
//        var r = Math.random() * 16 | 0,  
//            v = c == "x" ? r : (r & 3 | 8);  
//        return v.toString(16);  
//    });
    WebIM.createUUID = function(){
        return Math.random().toString(36).substring(2);
    }
    
    WebIM.startTrackCookie = function(){
        WebIM.pageId = WebIM.createUUID();
        //write myself as the mainPage.
        _setCookie('webimMainPage', WebIM.pageId, null, '/', '.zhubajie.com');
        timer = setInterval(function(){
            if(_getCookie("webimMainPage") == null || _getCookie("webimMainPage") == "null"){
                _setCookie('webimMainPage', WebIM.pageId, null, '/', '.zhubajie.com');
            }
        },1000);
        jQuery18(window).bind('beforeunload', function(){
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            _setCookie('webimMainPage', WebIM.pageId, exp, '/', '.zhubajie.com');
        });
    }
    
    WebIM.isMainPage = function(){
        if(_getCookie("webimMainPage") == null || _getCookie("webimMainPage") == "null"){
            _setCookie('webimMainPage', WebIM.pageId, null, '/', '.zhubajie.com');
        }
        if(_getCookie("webimMainPage") == WebIM.pageId){
            return true;
        }else{
            return false;
        }
    }
    
    WebIM.initDone = function(){
        if (WebIM.statusReady == false) {
            return;
        }
        WebIM.startTrackCookie();
        WebIM.initialized = true;
        //after init, start handle the inbound and outbound queue.
        WebIM.statusQueue.handle();
        WebIM.outboundQueue.reset();
        WebIM.outboundQueue.handle();
        WebIM.inboundQueue.handle();
        WebIM.buildWebIMButtons(); 
        watchPageUsers();
        WebIM.hibernate.initDone();
        //1. get self brandname first.
        WebIM.getBrandName(WebIM.getUserId(),function(userNick,photo){
            WebIM.userBrandName = userNick;
            WebIM.userPhoto = photo;
        });
    }
})((this.WebIM = 'undefined' != typeof WebIM ? WebIM : {}), this);

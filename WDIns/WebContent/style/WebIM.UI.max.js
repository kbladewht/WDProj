this.WebIM = 'undefined' != typeof WebIM ? WebIM : {};

String.prototype.httpHtml = function(){
    var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
    return this.replace(reg, '<a target="_blank" href="$1$2">$1$2</a>');
};

Object.keys = Object.keys || function( obj ){
    var rs = [];
    for ( var i in obj ) {
        if ( obj.hasOwnProperty( i ) ) {
            rs.push( i );
        }
    }
    return rs;
};

WebIM.notifier = {
    _clue: /\[cbx123654Notifier:([^\]]+)\]/,
    _cbList: {},
    _msg: {},
    _lastTime: null,
    getMsg: function( type ){
        var data = this._msg[type];

        if ( !data ) {
            return null;
        }

        return data[data.length-1];
    },
    isNotifierMsg: function( msg ){
        return this._clue.test( msg );
    },
    updateNotifierMsg: function( data ){
        var msg = data.msg;
        var clueRs = msg.match( this._clue );

        if ( this._lastTime && data.publishTime <= this._lastTime ) {
            return;
        }

        this._lastTime = data.publishTime;

        WebIM.ui.msgBox.readMsg([data.ackid]);

        if ( clueRs ) {
            var type = clueRs[1];
            var msgData = msg.replace( this._clue, '' );
            msgData = $.parseJSON( msgData );
            if ( msgData.status != 'close' && (msgData.time * 1000 < (+new Date())) ) {
                return;
            }
            (this._msg[type] ? this._msg[type] : this._msg[type] = []).push( msgData );
            this.run( type, msgData );
        }
    },
    register: function( type, fn ) {
        (this._cbList[type] ? this._cbList[type] : this._cbList[type] = []).push( fn );
    },
    run: function( type, msgData ) {
        $(window).trigger('WebIM:notifier:' + type, msgData);
    },
    loadNotify: function(){
        var self = this;
        WebIM.loadHistory(9, 0, 1,function(msgs){
            if ( msgs && msgs.length ) {
                self.updateNotifierMsg( msgs[0] );
            }
        });
    }
};

WebIM.fixUserName = function( userid, username ){
    if ( userid == '0' ) {
        username = '猪八戒官方';
    }
    return username;
};

var browserUtil = {
    isIe: function () {
        return navigator.appVersion.indexOf("MSIE") != -1;
    },
    navigator: navigator.appVersion,
    getVersion: function() {
        var version = 999; // we assume a sane browser
        if (navigator.appVersion.indexOf("MSIE") != -1)
        // bah, IE again, lets downgrade version number
            version = parseFloat(navigator.appVersion.split("MSIE")[1]);
        return version;
    }
};

(function(exports, global){
    var ui = exports;
    ui.version = '0.0.1';
//  ui.userHost = 'http://u.v5.zbj.com';
//  ui.filterUrl = 'http://task.v5.zbj.com/api/filter';
//  ui.getAboutUrl = 'http://task.v5.zbj.com/api/urltitle';
//  ui.defaultIcon = 'http://face.zbjimg.com/images/face_small.gif';
//  ui.rulepage = 'http://help.zhubajie.com/1037.html';
    ui.userHost = window.WEBIMCONFIG.userHost;
    ui.filterUrl = window.WEBIMCONFIG.filterUrl.replace('comapi','com/api');
    ui.getAboutUrl = window.WEBIMCONFIG.getAboutUrl;
    ui.defaultIcon = window.WEBIMCONFIG.defaultIcon;
    ui.rulepage = window.WEBIMCONFIG.rulepage;
    ui.soundResourcesPath = 'http://t5.zbjimg.com/c/product/webim/sound/';


    ui.mainDom = null;
    ui.tabScrollSpeed = 100;
    ui.tabScrollStep = 20;
    ui.queryOffset = 0;
    ui.initPageSize = 5;
    ui.MAX_WIN_COUNT = 10; // 允许同时打开的聊天窗口数量
    ui.MAX_WIN_COUNT_ALLUNREAD = 20; // 全部是未读消息时允许同时打开的聊天窗口数量
    
//  ui.historyDone = 0;
    ui.init = function(initData){
        ui.mainDom = jQuery18(ui.templates.main).appendTo(document.body);
        
        //jQuery18('<div class="huhuad"><a href="http://huhu.zhubajie.com/version/hh_download/index.html " target="blank" title="下载桌面版呼呼"><img src="http://p6.zbjimg.com/task/2013-07/11/pub/51de078beda2d.jpg" alt="桌面版呼呼"/></a></div>').insertBefore(ui.mainDom);
        ui.mainDom.click(function(){
            if(WebIM.hibernate.ishibernate){
                WebIM.hibernate.wakeup();
            }
            WebIM.hibernate.autohibernate(5*60*1000,2*60*1000);
        });
        ui.contactWin.init(initData);
        ui.msgBox.init(initData);
        ui.msgIndicator.init(initData);
        ui.chatWin.init(initData);
        var userids = [];
        for ( var i in ui.chatWin.tabs) {
            userids.push(ui.chatWin.tabs[i].userid);
        }
        WebIM.watchUsers(userids);
//      ui.chatWin.win.draggable({ handle: "#move-window-handler" });
        jQuery18(document).ready(function(){
            initChatDetail();
        });
    };
    
    function initChatDetail() {
        if(location.href.indexOf('/notice/chat')>0) {
            jQuery18('p.name-tit+p.gray6').each(function(p){
                var dom = jQuery18(this);
                var encodeHTML = dom.html();
                var cont = encodeHTML;
                var msg = ui.faceBuilder.convertFaceimage(cont.httpHtml());
                msg = ui.faceBuilder.convertUploadImage(msg);
                dom.html(msg);
            });
        }
    }
    ui.requestChat = function(userid,userNick,aboutType,aboutId){
        ui.chatWin.requestChatWin(userid,userNick,aboutType,aboutId);
    }
    ui.changeStatus = function(statusData){
        if(statusData){
            var currUserIds = [];
            var tobeUserIds = [];
            for(var i in ui.chatWin.tabs){
                var tab = ui.chatWin.tabs[i];
                currUserIds.push(tab.userid);
            }
            for(var i in statusData.tabs){
                var tab = statusData.tabs[i];
                tobeUserIds.push(tab.userid);
            }
            
//          WebIM.unwatchUsers(currUserIds);
            WebIM.watchUsers(tobeUserIds);
            
            for(var i in currUserIds){
                if(jQuery18.inArray(currUserIds[i], tobeUserIds) == -1){
                    ui.chatWin.removeTabByUserId(currUserIds[i],true);
                }
            }
            for(var i in tobeUserIds){
                if(jQuery18.inArray(tobeUserIds[i], currUserIds) == -1){
                    ui.chatWin.addTab(statusData.tabs[i],true);
                }
            }
            
            if(statusData.currentUserId){
                ui.chatWin.selectTabByUserId(statusData.currentUserId,true,true);
            }
            if(tobeUserIds.length > 0){
//              if(WebIM.ui.msgBox.mainDom)WebIM.ui.msgBox.mainDom.show();
                if(WebIM.ui.msgIndicator)WebIM.ui.msgIndicator.mainDom.show();
            }
            
            ui.chatWin.changeStatus(statusData);
            
            if(statusData.mute){
                WebIM.setting.mute = true;
            }else{
                WebIM.setting.mute = false;
            }
            WebIM.ui.chatWin.updatesettingstatus();
            
//          if(statusData.chatWinOpen){
//              ui.chatWin.show(true);
//          }else{
//              ui.chatWin.hide(true);
//          }
        }
    }
    
    ui.changeUserStatus = function(userid,userOnline){
        ui.chatWin.changeUserStatus(userid,userOnline);
        ui.contactWin.changeUserStatus(userid,userOnline);
    };
    ui.faceDir ='http://t5.zbjimg.com/r/webim/faces/'; 
    ui.faces = {
        'default':{
            text: '默认',
            faces: {"生气":"1.gif","吃饭":"2.gif","疑问(微笑)":"3.gif","打针":"4.gif","大哭":"5.gif","拳击":"6.gif","投降":"7.gif","俯卧撑":"8.gif","疑问(不解)":"9.gif","发财":"10.gif","瞌睡":"11.gif","打酱油":"12.gif","憨笑":"13.gif","吃西瓜":"14.gif","汗":"15.gif","惊恐":"16.gif","中标":"17.gif","越狱":"18.gif","摇头":"19.gif","念经":"20.gif","害羞":"21.gif","睡觉":"22.gif","勤奋":"23.gif","真棒":"24.gif","偷笑":"25.gif","听音乐":"26.gif","晕":"27.gif"}
        }
    }
    ui.faceBuilder = {
        FacePickerCol: 7,
        FacePickerRow: 4,
        buildFaces: function(groupName,page) {
            var dom = jQuery18('.ui-webim-rcont:visible .ui-webim-face-grid:eq(0)');

            groupName = groupName || 'default';
            page = page || 1;
            
            // 表情选择表格
            var faceTable = [];
            var faceGroup = ui.faces[groupName];
            faceTable.push('<table class="faces" cellpadding="0" cellspacing="0"><tr>');
            var count = 0;
            var pageSize = ui.faceBuilder.FacePickerCol * ui.faceBuilder.FacePickerRow
            var startIndex = (page-1)*pageSize;
            var endIndex = (page)*pageSize-1;
            jQuery18.each(faceGroup.faces, function(name,src){
                if(count>=startIndex && count<=endIndex) {
                    if(count>0 && count % ui.faceBuilder.FacePickerCol == 0) {
                        faceTable.push('</tr><tr>');
                    }
                    faceTable.push('<td title="'+name+'" facedata="'+name+'"><img src="'+ui.faceDir+groupName+'/'+src+'" alt="['+name+']" facedata="'+name+'"></td>');
                }
                count++;
            });
            faceTable.push('</tr></table>');
            
            jQuery18(dom).html(faceTable.join(''));
            
            // 表情分页条
            var totalPage = Math.ceil(count/pageSize);
            var pageInfoDom = jQuery18('.ui-webim-rcont:visible .ui-webim-face-pageinfo:eq(0)')
            var pageBtnDom = jQuery18('.ui-webim-rcont:visible .ui-webim-face-pagebtn:eq(0)');
            pageInfoDom.html('');
            pageBtnDom.html('');
            var pageInfo = '';
            if(totalPage>1) {
                pageInfoDom.html(page+"/"+totalPage);
                if(page==1) {
                    pageInfo = '上一页  <a href="javascript:void(0);" class="next">下一页</a>';
                } else if(page==totalPage) {
                    pageInfo = '<a href="javascript:void(0);" class="prev">上一页</a> 下一页';
                } else {
                    pageInfo = '<a href="javascript:void(0);" class="prev">上一页</a> <a href="javascript:void(0);" class="next">下一页</a>';
                }
            }
            pageBtnDom.html(pageInfo);
            pageBtnDom.find('a.next').click(function(){
                ui.faceBuilder.buildFaces(groupName,page+1);
            });
            pageBtnDom.find('a.prev').click(function(){
                ui.faceBuilder.buildFaces(groupName,page-1);
            });
            
        },
        // 在光标处插入字符串
        // myField    文本框对象
        // 要插入的值
        insertAtCursor: function(myField, myValue){
            //IE support
            if (document.selection) 
            {
                myField.focus();
                sel            = document.selection.createRange();
                sel.text    = myValue;
                sel.select();
            }
            //MOZILLA/NETSCAPE support
            else if (myField.selectionStart || myField.selectionStart == '0') 
            {
                var startPos    = myField.selectionStart;
                var endPos        = myField.selectionEnd;
                // save scrollTop before insert
                var restoreTop    = myField.scrollTop;
                myField.value    = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
                if (restoreTop > 0)
                {
                    // restore previous scrollTop
                    myField.scrollTop = restoreTop;
                }
                myField.focus();
                myField.selectionStart    = startPos + myValue.length;
                myField.selectionEnd    = startPos + myValue.length;
            } else {
                myField.value += myValue;
                myField.focus();
            }
        },
        convertFaceimage: function(text) {
            for(var groupName in ui.faces) {
                for(var name in ui.faces[groupName]['faces']) {
                    text = text.replace( new RegExp('\\['+(name.replace(/([\(\)])/g,'\\$1'))+'\\]','g') ,'<img title="'+name+'" src="'+ui.faceDir+groupName+'/'+ui.faces[groupName]['faces'][name]+'"></img>');
                }
            }
            return text;
        },
        convertUploadImage: function(text) {
            text = text.replace( /\[pic-(.*?)\]/ ,'<a target="_blank" title="点击查看原图" href="http://p6.zbjimg.com/$1"><img src="http://p6.zbjimg.com/$1" onload="WebIM.ui.scrollCurrentChatWinToBottom()" width="80"/></a>');
            return text;
        }
    }
    
    var webIMDisabledTip = '';
    if ( browserUtil.isIe() && browserUtil.getVersion() <= 9 ) {
        webIMDisabledTip = '<div style="\
            position: absolute;\
            bottom: 22px;\
            width: 100%;\
            background: #F9F0C5;\
            border-top: 1px solid #eef;\
            height: 30px;\
            line-height: 30px;\
            border-bottom: 1px solid #ffc;\
            text-align: center;\
            ">浏览器版本过低，请用更快更安全的 <a class="blue" href="https://www.baidu.com/s?ie=UTF-8&amp;wd=%E8%B0%B7%E6%AD%8C%E6%B5%8F%E8%A7%88%E5%99%A8" target="_blank">谷歌浏览器Chrome</a></div>';
    }
    ui.templates = {
        main : '<div id="ui-webim-taskbar" class="webim-collapse"/>',
//      msgBox : '<div id="ui-webim-toolbar"><div id="ui-webim-toolbar-inside">消息(<span>0</span>)<div></div>',
        contactIndicator : '<div id="ui-webim-toolbar" data-linkid="ui-webim-toolbar">最近联系人</div>',
        contactor: '        <li class="" userid="{userid}" brandname = "{brandname}" dateline="{dateline}" online="false">'+
                     '           <div class="ui-webim-avatar" >'+
                     ' <img width="32" height="32"  onerror="this.src=\''+ui.defaultIcon+'\';" src="{photo}"><i class="ui-webim-icons ui-webim-offline" height="32" width="32"></i></div>'+
                     '           <div class="ui-webim-letterhead" >'+
                     '             <p class="ui-webim-username" >{brandname}</p>'+
                     '           </div>'+
                     '           <a class="ui-webim-icons ui-webim-itemclose"  href="javascript:;"></a></li>',
        contactWin : '<div style="display: none;" id="ui-webim-list"> '+
                  '     <div id="ui-webim-setting">'+
                  '    <div class="ui-webim-inner">'+
                  '      <p>最近联系人</p>'+
                  '      <a class="ui-webim-min ui-webim-icons " href="javascript:void(0);"></a>'+/*<a class="ui-webim-seting ui-webim-icons" href="javascript:;"></a>*/
                  '    </div>'+
//                '    <div id="ui-webim-setlist" style="display: block;">'+
//                '      <ul>'+
//                '        <li><i class="ui-webim-icons ui-webim-checked"></i><b>新消息时直接弹出</b></li>'+
//                '        <li><i class="ui-webim-icons ui-webim-checked"></i><b>新消息时候声音提示</b></li>'+
//                '      </ul>'+
//                '    </div>'+
                  '  </div>'+
                  '  <div style="position: relative;">'+
                  '     <div style="" id="ui-webim-meslist" class="ui-webim-icons">'+
                 '       <div id="myContactBox" style="display:none;overflow-y:auto;overflow-x:hidden;height: 303px;">'+
                 '         <ul style="">'+
                 '         </ul>'+
                 '          <p class="nomessage">正在加载好友列表...</p>'+
                 '       </div>'+
                 '       <div id="recentContactBox" style="overflow-x:hidden;overflow-y:auto;height: 303px;">'+
                 '         <ul class="unstyled">'+
                 '         </ul>'+
                 '          <p class="nomessage">正在加载最近联系人...</p>'+
                 '       </div>'+
                 '     </div>'+
                 '   </div>'+
//               '   <div id="ui-webim-listmore"><a href="http://u.zhubajie.com/chat/mylist" target="_blank">查看更多&gt;&gt;</a></div>'+
                 ' </div>',
        msgBox : ' <div id="ui-webim-contact" style="display:none;z-index:2" class="ui-webim-icons ui-msg" > '+
                 ' <div><a href="javascript:;" >你有<u class="orange">3</u>条新消息</a></div> '+
                 ' </div>',
        tabBar : '       <li class="" data-userid="{userid}"> '+
          '         <div><span>{username}</span><i class="ui-webim-icons">&nbsp;&nbsp;&nbsp;&nbsp;</i></div> '+
          '         <a href="javascript:;" class="ui-webim-icons ui-webim-closeline"></a></li> ',
          
        msgContainer : '<div style="display:none" class="ui-webim-rcont ui-webim-iphone"> '+
          '       <div style="display:none;" class="ui-webim-corritor"><a target="_blank" href=""></a></div> '+
          '       <div class="ui-webim-notice"><i ui-webim-noticeico"></i><div>服务商不管以任何形式要求线下交易，都存在诈骗的风险，请提高警惕</div><a href="javascript:;" class="ui-webim-icons"></a></div> '+
          '       <div style="height: 193px;" class="ui-webim-content"> '+
          '         <div style="position: relative; height: 100%;"> '+
//        '           <div style="height: 233px;" class="ui-webim-scroll "> '+
//        '             <div class="ui-webim-scrollarea" style="display:none;"></div> '+
//        '             <div class="ui-webim-scrollbar" style="display: none;"><b></b><i></i></div> '+
//        '           </div> '+
          '           <div style="height: 100%;" class="ui-webim-continner"> '+
          '             <div style="" class="ui-webim-wrapper clearfix"><a class="ui-webim-more" style="display:none" href="javascript:;" title="查看历史消息">查看消息历史</a> '+
                            //message line goes here!
          '             </div> '+
          '           </div> '+
          '         </div> '+
          '       </div> '+
          '       <div class="ui-webim-actionarea">' +

          // 表情
          '       <div class="ui-webim-tools">' + webIMDisabledTip +
          '         <ol class="ui-webim-toollist unstyled">' +
          '             <li class="ui-webim-tools-face" title="添加表情"><i></i>表情</li>'+
          '             <li class="ui-webim-tools-image" title="发送图片"><i></i>图片</li>'+
          '             <li class="ui-webim-tools-mobile" title="猪八戒手机客户端"><a target="_blank" href="http://m.zhubajie.com/bz/">下载猪八戒客户端，沟通更畅通</a></li>'+
          '         </ol>'+ 
          '         <div class="ui-webim-faces" style="display:none;">' +
          '             <ol class="ui-webim-facegroups">' +
          '             </ol> '+
          '             <div class="ui-webim-face-grid">' +
          '             </div> '+
          '             <div class="ui-webim-face-page">' +
          '                 <div class="ui-webim-face-pageinfo">' +
          '                 </div> '+
          '                 <div class="ui-webim-face-pagebtn">' +
          '                 </div> '+
          '             </div> '+
          '         </div> '+
          '       </div> '+
          
          '         <div class="ui-webim-textarea"> '+
          '           <textarea maxlength="500"></textarea> '+
          '         </div> '+
          '         <div class="ui-webim-button"><a href="javascript:;" class="ui-webim-abutton"></a><span>enter发送，ctrl+enter换行</span><span style="float:left"><a href="'+ui.rulepage+'" target="_blank" class="ui-webim-ainfo">《消息系统使用规则》</a></span></div> '+
          '       </div>'+
          '     </div> ',
        msgLine :         '<div class="ui-webim-rline"> '+
          '                 <h4><a href="http://home.zhubajie.com/{from}/" target="_blank">{fromNick}</a><span class="sendtime">{sendtime}</span></h4> '+
          '                 <div><b class="tl"></b><b class="tr"></b><b class="bl"></b><b class="br"></b><b class="mr"></b> '+
          '                   <p></p> '+
          '                   <span class="client-type client-type-{client_type}"><a href="http://app.zhubajie.com" class="client-link" target="_blank"></a></span> '+
          '                 </div> '+
          '               </div> ',
        chatWin : '<div id="ui-webim-window" style="display:block; left: auto; top: -363px;right:101%;"> '+
          ' <div style="display: none;" id="ui-webim-tips">亲，您的消息正在发送...</div> '+
          ' <div id="ui-webim-winheader"> '+
          '   <div id="move-window-handler"> '+
          '     <p id="ui-webim-title"><i></i><span></span></p> '+
          '     <a href="javascript:;" class="ui-webim-icons ui-webim-min" onclick="WebIM.ui.chatWin.hide(true);"></a>'+
          '     <a href="javascript:;" title="放大" class="ui-webim-icons ui-webim-max" onclick="WebIM.ui.chatWin.fullscreen()"></a>' +
          '     <a href="javascript:;" title="设置" class="ui-webim-icons ui-webim-setting" onclick="WebIM.ui.chatWin.showsetting()"></a>' +
          '   </div> '+
          ' </div> '+
          ' <div id="ui-webim-message" class="clearfix"> '+
          '   <div class="ui-webim-left"> '+
          '     <a class="act top-action" href="#"></a> '+
          '     <div id="ui-webim-tabbar-box" class="ui-webim-tabbar-box"> '+
          '     <ul> '+
          // tab bar goes here!
          '     </ul> '+
          '     </div> '+
          '     <a class="act nex-action" href="#"></a> '+
          '   </div> '+
          '   <div id="ui-webim-right"> '+
          '   </div> '+
          ' </div> '+
          '</div>',
        msgIndicator : '<div id="ui-webim-contact" data-linkid="ui-webim-contact" style="display:none" class="ui-webim-icons ui-webim-contact ui-webim-conact" > '+
            '<div><i class="ui-webim-icons"></i><a href="javascript:;">{currentUserName}</a></div> '+
            '</div>',

        imSoundFlashContainer: '<div id="imSoundFlashContainer" style="position: absolute; top: -10000px; left: -10000px; width: 1px; height: 1px;">'+
                                '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" '+
                                    'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0" width="160" height="21">'+
                                    '<param name="movie" value="'+ ui.soundResourcesPath +'sound.swf?mp3='+ escape(ui.soundResourcesPath) +'newmsg.mp3&autostart=1&bgcolor=ffffff" />' +
                                    '<param name="quality" value="high" />' +
                                    '<param value="transparent" name="wmode" />' +
                                    '<embed src="'+ ui.soundResourcesPath +'sound.swf?mp3='+ escape(ui.soundResourcesPath) +'newmsg.mp3&autostart=1&bgcolor=ffffff" width="160" height="21" quality="high" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash"></embed>'+
                                '</object>'+
                            '</div>',
        settingPop: '<div class="ui-webim-setting-popup">'+
                        '<div class="ui-webim-setting-popup-inner">'+
                            '<a href="javascript:;" class="ui-webim-setting-sound"><span class="ui-webim-setting-soundon">√</span>已开启声音提示</a>'+
                        '</div>' +
                    '</div>'
    };
    
    function formatDate(date) {
        var today = new Date();
        var iDays = parseInt(Math.floor(today-date) / 1000 / 60 / 60 /24);
        if(today.getFullYear() == date.getFullYear() &&
                today.getMonth() == date.getMonth() && 
                today.getDate() == date.getDate()){
          return date.getHours()+'点'+date.getMinutes()+'分';
        }else if(today.getFullYear() == date.getFullYear()){
          return (date.getMonth()+1)+'月'+date.getDate()+'日 ' +
                date.getHours()+'点'+date.getMinutes()+'分'
        }else{
          return date.getFullYear() +'年' +(date.getMonth()+1)+'月'
                +date.getDate()+'日 ' + date.getHours()+'时'+date.getMinutes()+'分'
        }
    }


    ui.sound = {
        generateSoundDom: function(){
            jQuery18(ui.templates.imSoundFlashContainer).appendTo(document.body);
        },
        notice: function(  ){
            jQuery18('#imSoundFlashContainer').remove();
            if( WebIM.setting.mute == 0){
                ui.sound.generateSoundDom();
            }
        }
    };

(function (exports, global) {
    /**
     * ChatWin namespace.
     */
    var chatWin = exports.chatWin = {};
    chatWin.win = {};
    chatWin.tabs = [];
    chatWin.showing = false;
    chatWin.isFullScreen = false;
    //chatwin内部组件的尺寸
    chatWin.defaultComponentSize = {};

    var fullscreenClsName = 'ui-webim-window-fullscreen';
    var fullscreenActBtn = {
        tip: {'fullscreen':'还原', 'normal': '放大'},
        cls: 'ui-webim-restore'
    };
    //聊天窗口默认的位置
    var defaultRect = {
        width: 485,
        height: 391,
        left:  'auto',
        top: -363,
        right:'101%'
    };

    chatWin.init = function(initData){
        chatWin.win = jQuery18(exports.templates.chatWin).appendTo(exports.mainDom);
        chatWin.hide(true);
        chatWin.defaultComponentSize = {
            'ui-webim-corritor': 30/*chatWin.win.find('.ui-webim-corritor').height()*/,
            'ui-webim-notice': 50/*chatWin.win.find('.ui-webim-notice').height()*/,
            'ui-webim-actionarea': 118
        };
        if (initData && initData.tabs){
            if (initData.tabs.length == 0) {
               window.historyLoaded  = true;
               WebIM.inboundQueue.handle();
            }
            for ( var i in initData.tabs) {
                var tab = createTab(initData.tabs[i]);
                chatWin.tabs.push(tab);
                chatWin.compactTabs();
                chatWin.handleAbout(tab,initData.tabs[i].aboutType,initData.tabs[i].aboutId);
            }
            //select last tab as active tab.
            if(initData.currentUserId){
                chatWin.selectTabByUserId(initData.currentUserId,true);
            }else {
                chatWin.selectTab(initData.tabs.length-1);
            }
            
            if(initData.tabs.length == 0){
                WebIM.ui.msgIndicator.mainDom.hide();
                WebIM.ui.msgBox.mainDom.hide();
            }
            
            if(initData.mute){
                WebIM.setting.mute = true;
            }else{
                WebIM.setting.mute = false;
            }
            WebIM.ui.chatWin.updatesettingstatus();
        } else {
            window.historyLoaded  = true;
            WebIM.inboundQueue.handle();
        }
        if(!initData || initData.tabs.length == 0){
            WebIM.initDone();
        }
//      if(initData && initData.chatWinOpen){
//          chatWin.show(true);
//      }else{
//          chatWin.hide(true);
//      }
        chatWin.win.find('.act.top-action').mousedown(function(){
            if(chatWin.tabTimer){window.clearInterval(chatWin.tabTimer);}
            scrollUp();
            chatWin.tabTimer=window.setInterval(function(){
                scrollUp();
            },WebIM.ui.tabScrollSpeed);
        }).mouseup(function(){
            if(chatWin.tabTimer){window.clearInterval(chatWin.tabTimer);}
        }).mouseout(function(){
            if(chatWin.tabTimer){window.clearInterval(chatWin.tabTimer);}
        });
        chatWin.win.find('.act.nex-action').mousedown(function(){
            if(chatWin.tabTimer){window.clearInterval(chatWin.tabTimer);}
            scrollDown();
            chatWin.tabTimer=window.setInterval(function(){
                scrollDown();
            },WebIM.ui.tabScrollSpeed);
        }).mouseup(function(){
            if(chatWin.tabTimer){window.clearInterval(chatWin.tabTimer);}
        }).mouseout(function(){
            if(chatWin.tabTimer){window.clearInterval(chatWin.tabTimer);}
        });

        // webIM发送表情
        jQuery18('body').click(function(){
            jQuery18('.ui-webim-faces').hide();
        });
        jQuery18('.ui-webim-tools-face').add(jQuery18('.ui-webim-faces')).click(function(e){
            e.stopPropagation();
            e.preventDefault();
        });
        
        function scrollUp(){
            if(jQuery18('#ui-webim-tabbar-box').scrollTop() - WebIM.ui.tabScrollStep > 0){
                jQuery18('#ui-webim-tabbar-box').scrollTop(jQuery18('#ui-webim-tabbar-box').scrollTop() - WebIM.ui.tabScrollStep);
            }else{
                currTop = 0;
                jQuery18('#ui-webim-tabbar-box').scrollTop(0);
            }
        }
        function scrollDown(){
            var maxHeight = WebIM.ui.chatWin.tabs.length*35;
            if(jQuery18('#ui-webim-tabbar-box').scrollTop() > maxHeight-290) return;
            jQuery18('#ui-webim-tabbar-box').scrollTop(jQuery18('#ui-webim-tabbar-box').scrollTop() +WebIM.ui.tabScrollStep );
        }

        //当窗口改变大小时，如果当前聊天窗口是处于放大状态，那么需要update当前的聊天窗口尺寸
        jQuery18(window).resize(function(){
            if( WebIM.ui.chatWin.isFullScreen ){
                toFullScreen();
            }
        });
    };
    
    chatWin.changeStatus = function(statusData){
        for(var i in statusData.tabs){
            var statusTab = statusData.tabs[i];
            var tab = getTabByUserId(statusTab.userid);
            chatWin.handleAbout(tab,statusTab.aboutType,statusTab.aboutId);
        }
    };
    
    chatWin.changeUserStatus = function(userid,isOnline){
        var tab = getTabByUserId(userid);
        if(!tab)return;
        if(isOnline){
            tab.isOnline = true;
            tab.tabBar.find('i').removeClass('ui-webim-offline');
            tab.tabBar.find('i').addClass('ui-webim-online').addClass('ui-webim-icons');
        }else{
            tab.isOnline = false;
            tab.tabBar.find('i').removeClass('ui-webim-online');
            tab.tabBar.find('i').addClass('ui-webim-offline');
        }
        if(tab.selected){
            if(isOnline){
                WebIM.ui.chatWin.win.find('#ui-webim-title').find('i').removeClass('ui-webim-offline');
                WebIM.ui.chatWin.win.find('#ui-webim-title').find('i').addClass('ui-webim-online');
            }else{
                WebIM.ui.chatWin.win.find('#ui-webim-title').find('i').removeClass('ui-webim-online');
                WebIM.ui.chatWin.win.find('#ui-webim-title').find('i').addClass('ui-webim-offline');
            }
        }
    }
    
    chatWin.selectTabByUserId = function(userId,notUpdateStatus,fromStatus){
        var tab = getTabByUserId(userId);
        if(tab != null){
            chatWin.selectTab(tab.userid,notUpdateStatus,fromStatus);
        }
    }
    
    chatWin.requestChatWin = function(userid,userNick,aboutType,aboutId,notUpdateStatus){
        var tab = getTabByUserId(userid);
        if(tab != null){
            chatWin.selectTab(tab.userid);
        }else{
            tab = createTab({username:userNick,userid:userid,isUserOnline:false,msgs:[]});
            chatWin.tabs.push(tab);
            chatWin.compactTabs();
            chatWin.selectTab(tab.userid);
        }
        chatWin.handleAbout(tab,aboutType,aboutId);
        if(!chatWin.showing){
            chatWin.show(true);
        }
//      if(WebIM.ui.msgBox.mainDom)WebIM.ui.msgBox.mainDom.show();
        if(!notUpdateStatus){
            WebIM.ui.updateStatus();
        }
        
    }
    
    chatWin.handleAbout = function(tab,aboutType,aboutId){
        if(aboutType && aboutId && aboutType != tab.aboutType && aboutId != tab.aboutId /*&& today-aboutdate < 5days*/){
            tab.aboutType = aboutType;
            tab.aboutId = aboutId;
            //show title area.
            chatWin.showRelatedTitle(tab,aboutId,aboutType);
        }else if(!aboutType || !aboutId){
            tab.aboutType = null;
            tab.aboutId = null;
            //show title area.
            chatWin.hideRelatedTitle(tab);
        }
    }
    
    chatWin.hideRelatedTitle = function(tab){
        tab.container.relatedtitle.find('a').attr('href','###').text('');
        tab.container.relatedtitle.hide();
        tab.container.mainDom.find('.ui-webim-content').css('height', computeWebIMContentHeight());
    };
    chatWin.showRelatedTitle = function(tab,id,type){
        jQuery18.ajax({
            url: WebIM.ui.getAboutUrl,
            type: "POST",
            dataType: "jsonp",
            jsonp:'jsonp',
            data:{'rid':id,'type':type},
            success: function(data, textStatus, jqXHR){
                tab.container.relatedtitle.find('a').attr('href',data.url).text("关于：“"+data.title+"”的聊天");
                tab.container.relatedtitle.show();
                tab.container.mainDom.find('.ui-webim-content').css('height',computeWebIMContentHeight());
            },
            error: function(data, textStatus, jqXHR){
                if(console)console.info(textStatus);
            }
        });
    }
    
    chatWin.changeTitle = function(isOnline,username, userid){
        if(isOnline){
            WebIM.ui.chatWin.win.find('#ui-webim-title').find('i').removeClass('ui-webim-offline');
            WebIM.ui.chatWin.win.find('#ui-webim-title').find('i').addClass('ui-webim-online ui-webim-icons');
        }else{
            WebIM.ui.chatWin.win.find('#ui-webim-title').find('i').removeClass('ui-webim-online');
            WebIM.ui.chatWin.win.find('#ui-webim-title').find('i').addClass('ui-webim-offline ui-webim-icons');
        }

        updateChatTitle(username, userid);
    }
    chatWin.changeTitleName = function(username, userid){
        updateChatTitle(username, userid);
    }

    function updateChatTitle( username, userid ){
        var chatTitle = '<a class="webim-chat-title" href="http://shop.zhubajie.com/'+ userid +'/" target="_blank" title="'+ username +'">' +
            username +
            '</a>';
        WebIM.ui.chatWin.win.find('p').find('span').html( chatTitle );
    }
    
    chatWin.removeTitle = function(){
        WebIM.ui.chatWin.win.find('#ui-webim-title').find('i').removeClass();
        WebIM.ui.chatWin.win.find('p').find('span').html('');
    }
    
    chatWin.getSelectedChatTabIndex = function(){
        for(var j in chatWin.tabs){
            if(chatWin.tabs[j].selected == true){
                return chatWin.tabs[j].userid;
            }
        }
        return -1;
    }
    
    chatWin.selectTab = function(tab_user_id,notUpdateStatus,fromStatus){
        if(!chatWin.showing){
            chatWin.highlightTab(tab_user_id);
            for(var j in chatWin.tabs){
                if(chatWin.tabs[j].userid == tab_user_id){
                    chatWin.tabs[j].hasHighLight = false;
                    if(fromStatus)chatWin.readTab(chatWin.tabs[j]);
                    chatWin.tabs[j].container.mainDom.show();
                    chatWin.changeTitle(chatWin.tabs[j].isOnline,chatWin.tabs[j].username, chatWin.tabs[j].userid);
                    chatWin.tabs[j].selected = true;
                    WebIM.ui.msgIndicator.change(chatWin.tabs[j].username);
                    chatWin.tabs[j].container.msgParent.parent().scrollTop(9999999);
                }else{
                    if(!chatWin.tabs[j].hasHighLight){
                        chatWin.unhighlightTab(chatWin.tabs[j]);
                    }
                    chatWin.tabs[j].container.mainDom.hide();
                    chatWin.tabs[j].selected = false;
                    chatWin.tabs[j].container.msgParent.parent().scrollTop(9999999);
                }
            }
            return;//next time, when open the window, the tap will be re-select.
        }
        for (var i=0; i < chatWin.tabs.length; i++) {
          tab = chatWin.tabs[i];
          if(tab.userid == tab_user_id){
            chatWin.unhighlightTab(tab);
            tab.tabBar.addClass('ui-webim-hover');
            tab.container.mainDom.show();
            tab.selected = true;
            chatWin.changeTitle(tab.isOnline,tab.username, tab.userid);
            WebIM.ui.msgIndicator.change(tab.username);
            chatWin.readTab(tab);
            tab.container.msgParent.parent().scrollTop(9999999);
            chatWin.scrollToTab(tab);
          }else{
            tab.tabBar.removeClass('ui-webim-hover');
            tab.container.mainDom.hide();
            tab.selected = false;
          }
        }
        if(!notUpdateStatus){
            WebIM.ui.updateStatus();
        }
    }
    
    chatWin.scrollToTab = function(tab){
        var tabTop = jQuery18.inArray(tab, chatWin.tabs)*35;
        if(tabTop > jQuery18('#ui-webim-tabbar-box').height() || tabTop < 0){
            jQuery18('#ui-webim-tabbar-box').scrollTop(tabTop);
        }
    }
    
    chatWin.readTab = function(tab){
        if(!tab)return;
        var readAckIds = [];
        for(var j in tab.container.msgs){
            if(tab.container.msgs[j].isUnread()){
                readAckIds.push(tab.container.msgs[j].msgData.ackid);
                tab.container.msgs[j].setUnread(false);
            }
        }
        WebIM.ui.msgBox.readMsg(readAckIds);
        WebIM.ui.msgBox.msgOutline.rmReadedUser( tab.userid );
    };
    
    chatWin.highlightTab = function( tab_user_id ){
      var tab = getTabByIndex( tab_user_id );
      if(tab == null)return;
      if(tab.highlightTimer)clearInterval(tab.highlightTimer);
      tab.tabBar.addClass('webim-tabbar-highlight');
      tab.tabBar.find('i').removeClass();
      tab.highlightTimer = setInterval(function(){
          tab.tabBar.find('i').toggleClass('ui-webim-icons ui-webim-online');
      },500);
//    tab.tabBar.addClass('ui-webim-highlight');
    }
    chatWin.unhighlightTab = function(tab){
        if(tab.highlightTimer)clearInterval(tab.highlightTimer);
        tab.tabBar.removeClass('webim-tabbar-highlight');
        if(tab.isOnline){
            tab.tabBar.find('i').removeClass('ui-webim-offline');
            tab.tabBar.find('i').addClass('ui-webim-online').addClass('ui-webim-icons');
        }else{
            tab.tabBar.find('i').removeClass('ui-webim-online');
            tab.tabBar.find('i').addClass('ui-webim-offline').addClass('ui-webim-icons');
        }
//      tab.tabBar.removeClass('ui-webim-highlight');
    }
    
    chatWin.hide = function(notUpdateStatus){
        chatWin.showing = false;
        chatWin.win.hide();
//      WebIM.ui.msgIndicator.mainDom.show();
        if(!notUpdateStatus){
            WebIM.ui.updateStatus();
        }
        WebIM.ui.msgBox.msgOutline.updateMsgBox();
    };

    chatWin.soundLang = {
            indicatorText: {
                on: '<span class="ui-webim-setting-soundon">√</span>已开启声音提示',
                off: '<span class="ui-webim-setting-soundon"></span>已关闭声音提示'
            },
            titleText: {
                on: '点击关闭声音提醒',
                off: '点击开启声音提醒'
            }
    };
    chatWin.updatesettingstatus = function(){
        var soundSettingDom = chatWin.win.find('.ui-webim-setting-sound');
        if( WebIM.setting.mute){
            soundSettingDom.html(chatWin.soundLang.indicatorText.off);
            soundSettingDom.attr('title', chatWin.soundLang.titleText.off);
        }else{
            soundSettingDom.html(chatWin.soundLang.indicatorText.on);
            soundSettingDom.attr('title', chatWin.soundLang.titleText.on);
        }
    } 
    chatWin.showsetting = function(){
        var soundSettingDom;
        if( !chatWin.settingPopup ){
            chatWin.settingPopup = jQuery18(ui.templates.settingPop);
            chatWin.settingPopup.appendTo(chatWin.win);
            chatWin.settingPopup.hide();
            initSetting();
        }
        
        chatWin.updatesettingstatus();
        
        chatWin.win.find('.ui-webim-setting').toggleClass('ui-webim-setting-hover');
        chatWin.settingPopup.toggle();
        
        function initSetting(){
            var soundSettingDom = chatWin.win.find('.ui-webim-setting-sound');
            soundSettingDom.on('click', function(){
                var toStatus = WebIM.setting.mute ? 'on' : 'off';
                soundSettingDom.html(chatWin.soundLang.indicatorText[toStatus]);
                soundSettingDom.attr('title', chatWin.soundLang.titleText[toStatus]);
                WebIM.setting.mute = !WebIM.setting.mute;

                //save setting. add by Boris
                WebIM.ui.updateStatus();
            });
        }
    };




    chatWin.fullscreen = function(){

        if( chatWin.isFullScreen ){
            toNormalScreen();
        }else{
            toFullScreen();
        }
    };


    function toFullScreen(){

        chatWin.isFullScreen = 1;

        var currentRect = getChatWinClientRect();

        var fullscreenRect = {
            width: (parseFloat(chatWin.win.css('width')) + currentRect.left) + 'px',
            height: (parseFloat(chatWin.win.css('height')) + currentRect.top) + 'px',
            left:  (parseFloat(chatWin.win.css('left')) - currentRect.left) + 'px',
            top: (parseFloat(chatWin.win.css('top')) - currentRect.top ) + 'px'
        };
        WebIM.ui.mainDom.addClass(fullscreenClsName);
        //更新聊天窗口内部的dom的高度
        autoUpdateInnerHeight( currentRect.top );

       chatWin.win.css(fullscreenRect);

        updateFullscreenBtn('fullscreen');
    }

    function toNormalScreen(){
        chatWin.isFullScreen = 0;

        var currentTop = parseFloat(chatWin.win.css('top'));
        chatWin.win.css(defaultRect);
        autoUpdateInnerHeight(currentTop - defaultRect.top);
        WebIM.ui.mainDom.removeClass(fullscreenClsName);

        updateFullscreenBtn('normal');
    }
    
    chatWin.toFullScreen = toFullScreen;

    function updateFullscreenBtn( state ){
        var btn = chatWin.win.find('.ui-webim-max');
        var methodMap = {
            'fullscreen': 'addClass',
            'normal': 'removeClass'
        };
        chatWin.win.find('.ui-webim-max').attr('title', fullscreenActBtn.tip[state]);
        chatWin.win.find('.ui-webim-max')[methodMap[state]](fullscreenActBtn.cls);
    }

    function autoUpdateInnerHeight( delta ){
        //聊天窗口
        var jContactTab = chatWin.win.find('.ui-webim-left'),
            jMsgWrapArea = chatWin.win.find('#ui-webim-right'),
            jMsgListArea = chatWin.win.find('.ui-webim-content'),
            jContactTabList = chatWin.win.find('#ui-webim-tabbar-box');

        //我的好友列表
        var jUserList = WebIM.ui.contactWin.mainDom;
        var jUserFriend = jUserList.find('#myContactBox'),
            jUserRecentList = jUserList.find('#recentContactBox');


        var toChangeList = [jUserList, jUserFriend, jUserRecentList, jMsgWrapArea,
            jContactTab, jContactTabList];

        for( var i = 0; i < toChangeList.length; i++){
            setHeight( toChangeList[i] );
        }

        jMsgListArea.css({
            height: computeWebIMContentHeight()
        });

        function setHeight( jDom ){
            jDom.css({
                height: parseFloat(jDom.css('height')) + delta
            });
        }
    }

    function getChatWinClientRect(){
        //拿到当前的 chatWin的rect
        var chatWinDom = chatWin.win.get(0);
        var currentRect = chatWinDom.getBoundingClientRect();
        return currentRect;
    }

    function computeWebIMContentHeight(){
        var wrapHeight = chatWin.win.find('#ui-webim-right').height();
        var defaultComponentSize = chatWin.defaultComponentSize;
        var jCorritor = chatWin.win.find('.ui-webim-corritor');
        var jCorritorVisible = jCorritor.css('display') == 'block';
        var contentHeight = wrapHeight - defaultComponentSize['ui-webim-notice'] - defaultComponentSize['ui-webim-actionarea'] -
            (jCorritorVisible ? defaultComponentSize['ui-webim-corritor'] : 0);
        return contentHeight;
    }
    
    chatWin.show = function(notUpdateStatus){
        //msgs in current window will become read!
        chatWin.showing = true;
        chatWin.win.show();

        var msgFromIDList = Object.keys(WebIM.ui.msgBox.msgOutline.msgFromList);

        for (var i in chatWin.tabs) {
          if(chatWin.tabs[i].selected){
              chatWin.selectTab(chatWin.tabs[i].userid,true);//re-select to mark the message to read.
          }
        }

        // 将新消息的tab 插入到tablist的顶部
        if( msgFromIDList.length ){
            $.each(msgFromIDList, function( idx, item ){
                chatWin.win.find('ul').prepend( chatWin.win.find('li[data-userid="' + item + '"]') );
            });
            chatWin.selectTab(msgFromIDList[msgFromIDList.length - 1], true);
        }

        // 滚动到顶部
        jQuery18('#ui-webim-tabbar-box').scrollTop(0);


//      WebIM.ui.msgIndicator.mainDom.hide();
        if(!notUpdateStatus){
            WebIM.ui.updateStatus();
        }
    }
    chatWin.removeTabByUserId = function(userid,notUpdateStatus){
        var tab = getTabByUserId(userid);
        if(tab != null){
            chatWin.removeTab(tab.userid,notUpdateStatus);
        }
    }
    chatWin.removeTab = function(tab_user_id, notUpdateStatus){
        var tab = null;
        var i;
        for ( i = 0; i < chatWin.tabs.length; i++) {
            if(chatWin.tabs[i].userid == tab_user_id){
                tab = chatWin.tabs[i];
                break;
            }
        }
        if(tab == null)return;
//      WebIM.unwatchUsers([tab.userid]);
        chatWin.readTab(tab);
        if(tab.selected){
            if(i != 0){
                chatWin.selectTab(chatWin.tabs[i-1].userid);
            }else if(i != chatWin.tabs.length-1){
                chatWin.selectTab(chatWin.tabs[i+1].userid);
            }else{
                //close the last one.
                WebIM.ui.msgIndicator.change('');
                chatWin.removeTitle();
                chatWin.hide(true);
                WebIM.ui.msgIndicator.mainDom.hide();
                WebIM.ui.msgBox.mainDom.hide();
            }
            
            tab.tabBar.remove();
            tab.container.mainDom.remove();
            chatWin.tabs.splice(i,1);
        }else{
            tab.tabBar.remove();
            tab.container.mainDom.remove();
            chatWin.tabs.splice(i,1);
        }
        if(!notUpdateStatus){
            WebIM.ui.updateStatus();
        }
    }
    
    chatWin.sendMsg = function(tab_user_id, msgBody){
        var tab = getTabByIndex(tab_user_id);
        msgBody = msgBody || tab.container.mainDom.find('textarea').val();
        if(msgBody == '' || /^[\s]+$/.test(msgBody)){
            tab.container.mainDom.find('textarea').val('');
            return ;
        }
        var msgData = {
                fromNick:WebIM.getUserName(),
                from:WebIM.getUserId(),
                to:tab.userid,
                toNick:tab.username,
                msg:msgBody,
                sendtime:new Date(),
                senderTrackId: WebIM.createUUID(),
                aboutType: tab.aboutType,
                aboutId: tab.aboutId };
        //update recent contacts.
        WebIM.ui.contactWin.onMessage(tab.userid);
        //validate msgBody here!
        jQuery18.ajax({
            url: WebIM.ui.filterUrl,
            type: "POST",
            dataType: "jsonp",
            jsonp:'jsonp',
            data:{str:msgData.msg},
            success: function(data, textStatus, jqXHR){
                if(data.pass || data.code==2){
                    msgData.timestamp = new Date().getTime();
                    msgData.key = data.key;
                    WebIM.sendMsg(msgData);
                    //TODO get timestamp from server.
                    addMsg(tab,msgData);
                }else{
                    addMsg(tab,{
                        from : msgData.from,
                        to : msgData.to,
                        fromNick : msgData.fromNick,
                        toNick : msgData.toNick,
                        msg : msgData.msg + " 未能成功发送，原因【"+data.msg+"】",
                        sendtime : new Date().getTime(),
                        timestamp : new Date().getTime(),
                        isSelf : true,
                        isFailAlert:true});
                }
            },
            error: function(data, textStatus, jqXHR){
                
            }
        });
        tab.container.mainDom.find('textarea').val('');
    }
    function isSelf(from){
        return WebIM.getUserId() == from;
    }
    function addMsg(tab,msgData,isOnTop){
        if ( WebIM.notifier.isNotifierMsg( msgData.msg ) ) {
            return;
        }
        //filter same msgs.
        for ( var i in tab.container.msgs) {
            var existMsg = tab.container.msgs[i];
            if(existMsg.msgData.ackid && (existMsg.msgData.ackid == msgData.ackid)){
                return;
            }
        }
        var fromIsSelf = WebIM.getUserId() == msgData.from;
        if(!fromIsSelf){
            var msgDom = jQuery18(exports.templates.msgLine
                    .replace('{fromNick}',tab.username)
                    .replace('{from}',msgData.from)
                    .replace('{client_type}',msgData.client_type)
//                  .replace('{messageBody}',msgData.msg)
                    .replace('{sendtime}',formatDate(new Date(msgData.timestamp)))
                    );
            if(msgData.client_type) {
                var clientTypeDom = msgDom.find('.client-link');
                if (msgData.client_type == 'ios') {
                    clientTypeDom.html('来自iPhone客户端');
                    clientTypeDom.attr('href','http://app.zhubajie.com/index_pc.html');
                } else if (msgData.client_type == 'android') {
                    clientTypeDom.html('来自Android客户端');
                    clientTypeDom.attr('href','http://app.zhubajie.com/index_pc_an.html');
                }
                    
            }
        }else{
            var msgDom = jQuery18(exports.templates.msgLine
                    .replace('{fromNick}',msgData.fromNick)
                    .replace('{from}',msgData.from)
//                  .replace('{messageBody}',msgData.msg)
                    .replace('{sendtime}',formatDate(new Date(msgData.timestamp)))
                    );  
        }
        // htmlEncode
        var encodeHTML = jQuery("<div/>").text(msgData.msg).html();
        
        
        var cont = jQuery18.trim(encodeHTML).replace(/\n/g,'<br/>');
        
        var msg = ui.faceBuilder.convertFaceimage(cont.httpHtml());
        msg = ui.faceBuilder.convertUploadImage(msg);
        
        var p =msgDom.find('p');
        p.html(msg);
        
        if(msgData.isFailAlert){
            p.css("color","red");
        }
        p = null;
        
        if(!fromIsSelf){
            msgDom.removeClass('ui-webim-rline');
            msgDom.addClass('ui-webim-lline');  
        }else{
            msgDom.removeClass('ui-webim-lline');
            msgDom.addClass('ui-webim-rline');  
        }
        if(isOnTop){
            msgDom.prependTo(tab.container.msgParent);
        }else{
            msgDom.appendTo(tab.container.msgParent);
        }
        msgObj = {msgDom:msgDom,
                msgData:msgData,
                isUnread:function(){
                    return this.msgData.unread;
                },
                setUnread:function(unread){
                    this.msgData.unread = unread;
                }};
        tab.container.msgs.push(msgObj);
        if(isOnTop){
            tab.container.msgParent.parent().scrollTop(tab.container.msgParent.parent().scrollTop()+msgDom.height());
        }else{
            tab.container.msgParent.parent().scrollTop(9999999);
        }
    }
    
    chatWin.recieveMsg = function(msgs){
        var userId = WebIM.getUserId();
        for( var i=0,len= msgs.length;i<len;i++){
            var msgData = msgs[i];
            //for the one that has no tab, create tab and push msg.
            var tab;
            var fromIsSelf = (userId == msgData.from); 
            if(!fromIsSelf){
                tab = getTabByUserId(msgData.from);
            }else{
                tab = getTabByUserId(msgData.to);
            }
            if(tab == null){
                tabUserId = fromIsSelf?msgData.to:msgData.from;
                tabUserNick = fromIsSelf?msgData.toNick:msgData.fromNick;
                var tabData = {
                    username:tabUserNick,
                    userid:tabUserId,
                    isUserOnline:WebIM.isUserOnline(tabUserId),
                    msgs:[msgData]};
                tab = createTab(tabData);
                chatWin.tabs.push(tab);
                chatWin.compactTabs();
            }
            chatWin.handleAbout(tab,msgData.aboutType,msgData.aboutId);

            if(msgData.isFailAlert){
                continue;
            }
            WebIM.ui.contactWin.onMessage(tab.userid);
            
            //add message into the tab.
            addMsg(tab,msgData);
            
            //for the ones that not in current, high light them.
            if((userId != msgData.from)&&(!tab.selected)){
                if(chatWin.tabs.length > 1){
                    tab.hasHighLight = true;
                    chatWin.highlightTab(tab.userid);
                }else{
                    chatWin.selectTab(tab.userid);
                }
            }else{
                if(chatWin.showing){
                    chatWin.readTab(tab);
                }
                chatWin.scrollToTab(tab);
            }
//          if(i == msgs.length - 1){
//              chatWin.selectTab(tab.index);
//          }else{//for the others, highlight the tabs.
//              chatWin.highlightTab(tab.index);
//          }
            
            tab.container.msgParent.parent().scrollTop(9999999);
            
        }
    }
    // 当打开一个新窗口的时候,如果窗口太多则自动关闭先前打开的窗口，策略如下：
    //  1. 如果未读消息窗口不超过10个，那么以上限10个窗口为准，关闭其他的窗口；
    //  2. 如果未读消息窗口超过10个，那么放大窗口上限，比如有15个未读消息窗口，那么上限就是15个，关闭多余的窗口；
    //  3. 窗口最大限制20个（全部是未读的情况），其他的窗口就算是未读，也自动关闭（关闭的时候会自动的变为“已读历史消息”）
    chatWin.compactTabs = function() {
        /**
         * 获取未读消息窗口的数量
         */
        function unreadWinCount() {
            var count = 0;
            jQuery18.each(chatWin.tabs,function(index,tab){
                if(tab.hasHighLight == true) {
                    count++;
                }
            });
            return count;
        }
        /**
         * 选择要关闭的窗口，返回窗口的index
         */
        function chooseCloseWin(){
            if (chatWin.tabs.length == 0) {
                return -1;
            }
            return chatWin.tabs[0].userid;
        }
        
        var unreadCount = unreadWinCount();
        var allWinCount = chatWin.tabs.length;
        // 窗口个数限制，最多MAX_WIN_COUNT_ALLUNREAD个窗口
        var winCountLimit = WebIM.ui.MAX_WIN_COUNT_ALLUNREAD;
        if (unreadCount <= WebIM.ui.MAX_WIN_COUNT) {
            winCountLimit = WebIM.ui.MAX_WIN_COUNT;
        } else if (unreadCount <WebIM.ui.MAX_WIN_COUNT_ALLUNREAD ) {
            winCountLimit = unreadCount;
        }
        for(var i = 0,len = allWinCount-winCountLimit; i<len;i++) {
            var closeTabIndex = chooseCloseWin();
            chatWin.removeTab(closeTabIndex);
        }
    }
    chatWin.addTab = function(tabData){
        var tab = createTab(tabData);
        chatWin.tabs.push(tab);
        chatWin.compactTabs();
    }
    
    chatWin.loadMore = function( tab_user_id ){
        var tab = getTabByIndex( tab_user_id );
        var offset = tab.histoyLength?tab.histoyLength:0;
        var pageSize = 20;
        WebIM.ui.alert("正在加载历史...",false);
        WebIM.loadHistory(tab.userid,offset,pageSize,function(msgs){
            tab.histoyLength = tab.histoyLength?tab.histoyLength:0;
            tab.histoyLength += pageSize>msgs.length?msgs.length:pageSize;
            for ( var i = 0; i < pageSize && i< msgs.length; i++) {
                addMsg(tab,msgs[i],true);
            }
            WebIM.ui.alertClean();
        });
    }
    
    function getTabByUserId(userid){
        for(var i=0,len=chatWin.tabs.length;i<len;i++){
            if(chatWin.tabs[i].userid == userid){
                return chatWin.tabs[i];
            }
        }
        return null;
    }
    
    function getTabByIndex( tab_user_id ){
        for(var i in chatWin.tabs){
            if(chatWin.tabs[i].userid == tab_user_id){
                return chatWin.tabs[i]
            }
        }
        return null;
    }
    
    function createTab(tabData){
        var lastIndex = -1;
        if(chatWin.tabs.length > 0){
            lastIndex = chatWin.tabs[chatWin.tabs.length-1].index;
        }
        index = lastIndex + 1;

        var tab_user_name = WebIM.fixUserName( tabData.userid, tabData.username );
//      var tab_user_name = '';//TODO use this to load user nick from server.
        var tab_user_id = tabData.userid;
        var isOnline = tabData.isUserOnline?true:false;
        var tab_msgs = tabData.msgs;
        var tab = {
            tabBar : createTabBar(tab_user_name, tab_user_id, isOnline),
            container : createMsgContainer(tab_msgs, tab_user_id),
            selected : false,
            index : index,
            username : tab_user_name,
            userid : tab_user_id,
            isOnline : isOnline
        }
        tab.container.mainDom.find('.ui-webim-more').click(function(){
            //jQuery18(this).hide();
            window.open( WebIM.ui.userHost+"/notice/chatdetail-part-"+tab_user_id+".html" );
        });
        //首先构建历史消息。
        WebIM.ui.alert("正在加载历史消息...",false);
        
        WebIM.loadHistory(tab_user_id,WebIM.ui.queryOffset,WebIM.ui.initPageSize,function(msgs){
            tab.histoyLength = tab.histoyLength?tab.histoyLength:0;
            tab.histoyLength += WebIM.ui.initPageSize>msgs.length?msgs.length:WebIM.ui.initPageSize;
            if(msgs[0])tab.container.msgParent.prepend('<div style="float:left;width:100%;text-align:center;color:#AAAAAA;padding-bottom:100px">------上次聊天'+formatDate(new Date(msgs[0].timestamp))+'------</div>');
            for ( var i = 0; i < WebIM.ui.initPageSize && i< msgs.length; i++) {
                addMsg(tab,msgs[i],true);
            }
            if(msgs.length>0){
                tab.container.mainDom.find('.ui-webim-more').show();
            }
            WebIM.ui.alertClean();
//          WebIM.ui.historyDone++;
//          if(WebIM.ui.historyDone == WebIM.ui.chatWin.tabs.length)WebIM.initDone();
            window.historyLoaded  = true;
            WebIM.inboundQueue.handle();
        });
        
        
        WebIM.getBrandName(tab_user_id,function(userNick, iconUrl){
            tab.username = WebIM.fixUserName( tab_user_id, userNick );
//            console.log(iconUrl);
            tab.tabBar.find('span').text(userNick);
//            tab.tabBar.find('a').eq(0).attr('title',userNick).attr('href','http://home.zhubajie.com/'+tab_user_id+'/saler');
            tab.container.mainDom.find('.ui-webim-lline h4').each(function(){
                var timeDom = jQuery18(this).find('span');
                jQuery18(this).html('');
                jQuery18(this).text(userNick);
                jQuery18(this).append(timeDom);
            });
            if(tab.selected){
                WebIM.ui.msgIndicator.change(userNick);
                WebIM.ui.chatWin.changeTitleName(userNick, tab_user_id);
            }
        });
        
        return tab;
    }
    
    function createTabBar(username, tab_user_id, isOnline){
        var tabBar = jQuery18(exports.templates.tabBar.replace(/{username}/g,username).replace("{userid}", tab_user_id)).appendTo(chatWin.win.find('ul'));
        if(isOnline){
            tabBar.find('i').addClass('ui-webim-online');
        }else{
            tabBar.find('i').addClass('ui-webim-offline');
        }
        tabBar.click(function(){
            WebIM.ui.chatWin.selectTab(tab_user_id);
        });
        tabBar.find('a.ui-webim-closeline').click(function(){
            WebIM.ui.chatWin.removeTab( tab_user_id );
        });
        return tabBar;
    }
    
    function createMsgContainer(msgsData, tab_user_id){
        //create container dom object.
        var container = jQuery18(exports.templates.msgContainer.replace(/{tabIndex}/g,index)).appendTo(jQuery18('#ui-webim-right'));
        
        // webIM发送表情
        container.find('.ui-webim-tools-face').click(function(evt){
            var grid = jQuery18('.ui-webim-rcont:visible .ui-webim-face-grid').eq(0);
            var toolsDom = jQuery18(this).parents('.ui-webim-tools');
            toolsDom.find('.ui-webim-faces').toggle();
            if(grid && grid.html().replace(/^\s*/,'').replace(/\s*$/,'') == ''){
                ui.faceBuilder.buildFaces();
            }
            toolsDom.find('.ui-webim-tools-face').add(toolsDom.find('.ui-webim-faces')).click(function(e){
                e.stopPropagation();
                e.preventDefault();
            });
            evt.stopPropagation();
            evt.preventDefault();
        });
        container.find('.ui-webim-faces').click(function(e){
            var text = jQuery18(e.target).attr('facedata');
            if(text) {
                ui.faceBuilder.insertAtCursor(jQuery18('.ui-webim-rcont:visible textarea').get(0),'['+text+']');
            }
        });
        // webIM发送图片
        var mark = container;
        var cache = {};
        var mupload = new WebIM.upload({
            target:mark.find(".ui-webim-tools-image"),
            // 开始发送文件
            onprogresreading:function(data){
                jQuery18('#ui-webim-right .ui-upload-btn:not(:visible)').attr('disabled','disabled');
                jQuery18('#ui-webim-right [UPLOAD_IDENTIFIER]:not(:visible)').attr('disabled','disabled');
                mupload.opt.tips('正在发送图片...',300000);
            },
            // 成功发送文件
            onprogresed:    function(data){
                mupload.opt.tips('图片发送成功');
                jQuery18('#ui-webim-right .ui-upload-btn').removeAttr('disabled')
                jQuery18('#ui-webim-right [UPLOAD_IDENTIFIER]').removeAttr('disabled')
                window.console && console.log('up end',data);
                
                var imgUrlReg = /^.*?(task\/\d{4}-\d{2}\/.*?)".*$/;
                if (data.url.match(imgUrlReg)) {
                    var imgUrl = data.url.replace(imgUrlReg,"$1");
                    var curChatIndex = WebIM.ui.chatWin.getSelectedChatTabIndex();
                    WebIM.ui.sendMsg(curChatIndex, '[pic-'+imgUrl+']');
                } else {
                     mupload.opt.tips('图片发送失败，请重试');
                }
            },
            // 发送文件失败
            onprogresserror:function(data,cac){
                jQuery18('#ui-webim-right .ui-upload-btn').removeAttr('disabled')
                jQuery18('#ui-webim-right [UPLOAD_IDENTIFIER]').removeAttr('disabled')
                mupload.opt.tips('图片发送失败，请重试');
            },
            tips:  function(msg,time){
                var delect = chatWin.win.find(".delect");
                if(delect.length == 0){
                    delect = jQuery18('<p style="margin-left: -54px; margin-top: 35px; display: block;" class="delect"></p>').appendTo(mark);
                }
                delect.html(msg);
                if(delect.is(":animated")){
                    delect.stop(true,true);
                }
                delect.css({opacity:1}).animate({
                    opacity:0
                },time || 3000);
            }
        });
        
        container.find('textarea').keydown(function(e) { 
            if ((!e.ctrlKey && e.which == 13)||(!e.ctrlKey && e.which == 10)) {
                WebIM.ui.sendMsg(tab_user_id);
                return false;
            }else if ((e.ctrlKey && e.which == 13)||(e.ctrlKey && e.which == 10)) {
                if (document.selection) {
                    sel = document.selection.createRange();
                    sel.text = '\n';
                } else if (this.selectionStart || this.selectionStart == '0') {
                    var startPos = this.selectionStart;
                    var endPos = this.selectionEnd;
                    var scrollTop = this.scrollTop;
                    this.value = this.value.substring(0, startPos)
                            + "\n"
                            + this.value.substring(endPos,this.value.length);
                    this.selectionStart = startPos + "\n".length;
                    this.selectionEnd = startPos + "\n".length;
                    this.scrollTop = scrollTop;
                } else {
                    this.value += myValue;
                    this.focus();
                }
                return false;
            }
        });
        container.find('.ui-webim-button').find('a').click(function(){
            WebIM.ui.sendMsg(tab_user_id);
        });
        
//      var msgs = [];
//      for ( var i in msgsData) {
//          var msg = msgsData[i];
//          var msgDom = jQuery18(exports.templates.msgLine
//              .replace('{from}',msg.from)
//              .replace('{messageBody}',msg.msg)
//              .replace('{sendtime}',msg.sendtime)
//              ).appendTo(container.find(jQuery18('.ui-webim-wrapper')));
//          if(!msg.isSelf){
//              msgDom.removeClass('ui-webim-rline');
//              msgDom.addClass('ui-webim-lline');  
//          }
//          msgs.push({msgDom:msgDom,msdData:msg});
//      }
//      container.find(jQuery18('.ui-webim-wrapper')).parent().scrollTop(9999999);
        return {
            mainDom : container,
            relatedtitle : container.find('.ui-webim-corritor'),
            msgParent : container.find(jQuery18('.ui-webim-wrapper')),
            msgs : []
        };
    }
    
})(ui,this);

(function (exports, global) {
    /**
     * msgBox namespace.
     */
    var msgBox = exports.msgBox = {};
    msgBox.unread = 0;
    msgBox.unreadmsgs = [];
    msgBox.mainDom = {};
    msgBox.increaseUnread = function(number){

        msgBox.unread += number;
        updateMsgBox();
        //alert new messages in top bar and title bar.
        msgBox.alertNewMessage(1);
        msgBox.startFlashTitle();
    }
    msgBox.decreaseUnread = function(number){
        msgBox.unread -= number;
        updateMsgBox();
        if(msgBox.unread <= 0){
            msgBox.unread = 0;
            msgBox.slient();
        }
        msgBox.decreaseNewMessageAlert(number);
    }

    msgBox.slient = function(){
        msgBox.mainDom.hide();
        clearInterval(WebIM.ui.msgBox.timer);
        WebIM.ui.msgBox.timer = null;
        msgBox.stopFlashTitle();
    }

    function updateMsgBox(){
        var msgOutline = msgBox.msgOutline;
        var peerNum = msgOutline.getPeerNum();
        var newMsgStr = '';
        if ( peerNum > 1 ) {
            newMsgStr = peerNum + '个用户的新消息';
        } else if( peerNum == 1 ) {
            newMsgStr = msgOutline.latestPeerName + '的新消息';
        } else {
            msgBox.slient();
        }
        msgBox.mainDom.find('a').html( newMsgStr );
    }

    msgBox.timer = {};
    // 消息提示策略：当一个人时，显示用户名，多个人时提示用户数
    msgBox.msgOutline = {
        'latestPeerName': '',
        'msgFromList': {},
        rmReadedUser: function( userid ){
            delete this.msgFromList[userid];
        },
        getPeerNum: function(){
            return Object.keys( msgBox.msgOutline.msgFromList).length;
        },
        updateMsgBox: updateMsgBox
    };

    msgBox.recieveMsg = function(msgs){
        var userId = WebIM.getUserId();
        var isMainPage = WebIM.isMainPage();
        var c = 0;
        var otherMsg = [];
        var selfMsg = [];

        var firstPeerName = '';


        for(var i=0,len=msgs.length;i<len;i++){
            var msg = msgs[i];
            if(userId != msg.from){
                if ( WebIM.notifier.isNotifierMsg ( msg.msg ) ) {
                    WebIM.notifier.updateNotifierMsg( msg );
                    continue;
                }
                //message from self.
                if( jQuery18.inArray(msg, msgBox.unreadmsgs) == -1){
                    msgBox.unreadmsgs.push(msg);
                    otherMsg.push(msg);
                    msgBox.msgOutline.msgFromList[msg.from] = 1;
                    firstPeerName = msg.fromNick;
                }
            }else{
                selfMsg.push(msg);
            }
        }

        msgBox.msgOutline.latestPeerName = firstPeerName;

        WebIM.ui.chatWin.recieveMsg(otherMsg);
        WebIM.ui.chatWin.recieveMsg(selfMsg);
        if (otherMsg.length>0) {
            msgBox.increaseUnread(otherMsg.length);
//            if(!WebIM.ui.chatWin.showing){
                if(msgBox.mainDom)msgBox.mainDom.show();
                if(WebIM.ui.msgIndicator)WebIM.ui.msgIndicator.mainDom.show();
                clearInterval(WebIM.ui.msgBox.timer);
                msgBox.timer = setInterval(function(){ msgBox.mainDom.find('div').fadeOut(500).fadeIn(500);},1001);
//            }
             try{
                if(isMainPage){
                    ui.sound.notice();
                }
            }catch(ex){}
        }
    }
    msgBox.decreaseNewMessageAlert = function(number){
        try{
            var currNum = parseInt(jQuery('.lot.ui-msg .num').html());
            currNum = currNum == NaN?0:currNum;
            var num = currNum - number;
            if(num <=0){
                jQuery('.lot.ui-msg .num').html('');
                jQuery('.lot.ui-msg .num').hide();
            }else{
                jQuery('.lot.ui-msg .num').html(num);
            }
            
            if(msgBox.unread <= 0){
                jQuery('.lot.ui-msg .um-chat').remove();
            }else{
                jQuery('.lot.ui-msg .um-chat').find('span').html(msgBox.unread);
            }
            
        }catch(e){
            
        }
    }
    msgBox.alertNewMessage = function(newNum){
        try{
            var currNum = parseInt(jQuery('.lot.ui-msg .num').html());
            currNum = isNaN(currNum)?0:currNum;
            var num = currNum + newNum;
            jQuery('.lot.ui-msg .num').html(num);
            jQuery('.lot.ui-msg .num').show();
            
            var topalertdom = jQuery('<li class="um-chat" data-title="聊天记录"> '+
            ' <a target="_blank" href="###"><span>'+msgBox.unread+'</span>即时聊天</a> '+
            ' </li>');
            if(jQuery('.lot.ui-msg .um-chat').length > 0){
                topalertdom = jQuery('.lot.ui-msg .um-chat');
            }else{
                jQuery('.lot.ui-msg .um-logs').after(topalertdom);
            }
            topalertdom.find('span').html(msgBox.unread);
            
            topalertdom.click(function(){
                WebIM.ui.chatWin.show(false);
                return false;
            });
            
            
        }catch(e){
            
        }
    }
    
    var origtitle = document.title;
    var _title = document.title;
    var _space = '';
    var isshow = false;
    var flashTimer = null;
    var isflashing = false;

    var newMsg = '【新消息】';
    var flashMsg = '【　　　】';
    
    msgBox._flash_title = function(){
        if(isshow){document.title = newMsg + origtitle; isshow=false;}
        else{ document.title = flashMsg + origtitle;isshow = true;}
    }
    msgBox.startFlashTitle = function(){
        if(isflashing) return;
        flashTimer = setInterval("WebIM.ui.msgBox._flash_title()",1000);
        isflashing = true;
    }
    
    msgBox.stopFlashTitle = function(){
        clearInterval(flashTimer);
        document.title = origtitle;
        isflashing = false;
    }
    
    msgBox.readMsg = function(ackids){
//      clearInterval(WebIM.ui.msgBox.timer);
        for(i=0;i<msgBox.unreadmsgs.length;i++){
            var msg = msgBox.unreadmsgs[i];
            if(jQuery18.inArray(msg.ackid, ackids) != -1){
                msgBox.unreadmsgs.splice(i,1);
                msgBox.decreaseUnread(1);
                i--;
            }
        }
        WebIM.ack(ackids);
    }
    msgBox.init = function(){
        msgBox.mainDom = jQuery18(exports.templates.msgBox).appendTo(exports.mainDom.find('#ui-webim-toolbar'));
        msgBox.mainDom.bind("click",function(){
            WebIM.ui.chatWin.show(false);
            return false;
        });
    }
})(ui,this);

(function (exports, global) {
    /**
     * msgIndicator namespace.
     */
    var msgIndicator = exports.msgIndicator = {};
    msgIndicator.mainDom = jQuery18();
    msgIndicator.init = function(initData){
        if(initData && initData.currentUserName){
            msgIndicator.mainDom = jQuery18(exports.templates.msgIndicator.replace('{currentUserName}',initData.currentUserName?initData.currentUserName:'')).appendTo(exports.mainDom.find('#ui-webim-toolbar'));
            msgIndicator.mainDom.show();
        }else{
            msgIndicator.mainDom = jQuery18(exports.templates.msgIndicator.replace('{currentUserName}','')).appendTo(exports.mainDom.find('#ui-webim-toolbar'));
        }
        msgIndicator.mainDom.bind("click",function(){
            WebIM.ui.chatWin.show(false);
            return false;
        });
    }
    msgIndicator.change = function(userName){
        msgIndicator.mainDom.find('a').html(userName);
    }
})(ui,this);

(function (exports, global) {
    /**
     * contactWin namespace.
     */
    var contactWin = exports.contactWin = {};
    contactWin.onlineUsers = [];
    contactWin.changeUserStatus = function(userid,userOnline){
        myContactChange(userid,userOnline);
        recentContactChange(userid,userOnline);
    }
    function recentContactChange(userid,userOnline){
        //only change the icon status;
        var indicator = contactWin.recentContactDom.find('li[userid="'+userid+'"] .ui-webim-icons');
        if(!userOnline){
            indicator.parent().attr('online',false);
            indicator.removeClass('ui-webim-online');
            indicator.addClass('ui-webim-offline');
        }else{
            indicator.parent().attr('online',true);
            indicator.removeClass('ui-webim-offline');
            indicator.addClass('ui-webim-online');
        }
    }
    function myContactChange(userid,userOnline){
        //change ui status and re-location the user into right place.
        var indicator = contactWin.myContactDom.find('li[userid="'+userid+'"] .ui-webim-icons');
        if(indicator.length == 0){
            return;
        }else{
            var userIndex = jQuery18.inArray(userid, contactWin.onlineUsers);
            if(userOnline){
                if(userIndex < 0){
                    contactWin.onlineUsers.push(userid);
                }
            }else{
                if(userIndex ){
                    contactWin.onlineUsers.splice(userIndex,1);
                }
            }
            jQuery18('.online-count').text(contactWin.onlineUsers.length);
        }
        if(!userOnline){
            indicator.parent().attr('online',false);
            indicator.removeClass('ui-webim-online');
            indicator.addClass('ui-webim-offline');
        }else{
            indicator.parent().attr('online',true);
            indicator.removeClass('ui-webim-offline');
            indicator.addClass('ui-webim-online');
        }
        
        var mydateline = indicator.parent().attr('dateline');
        var myDom = contactWin.myContactDom.find('li[userid="'+userid+'"]');
        if(!userOnline){
            //if my status is offline, search all offline lis thru the last one.
            var allOfflineLis = contactWin.myContactDom.find('li[online="false"]');
            var last = null;
            allOfflineLis.each(function(){
                if(userid == jQuery18(this).attr('userid')){
                    //is myself, continue, last should be the previous one.
                    return true;
                }
                last = jQuery18(this);
                if(parseInt(mydateline) > parseInt(last.attr('dateline'))){
                    return false;
                }
            });
            if(last == null){
                if(myDom.index(contactWin.myContactDom.find('li')) != (contactWin.myContactDom.find('li').length-1) ){
                    myDom.appendTo(contactWin.myContactDom.find('ul'));
                }
            }else if(userid == last.attr('userid')){
                //nothing
            }else if(parseInt(mydateline) > parseInt(last.attr('dateline'))){
                myDom.insertBefore(last);
            }else{
                myDom.insertAfter(last);
            }
        }else{
            //if my status is online, search all online lis thru the last one.
            var allOnlineLis = contactWin.myContactDom.find('li[online="true"]');
            var last = null;
            allOnlineLis.each(function(){
                if(userid == jQuery18(this).attr('userid')){
                    //is myself, continue, last should be the previous one.
                    return true;
                }
                last = jQuery18(this);
                if(parseInt(mydateline) > parseInt(last.attr('dateline'))){
                    return false;
                }
            });
            if(last == null){
                if( myDom.index(contactWin.myContactDom.find('li')) != 0 ){
                    myDom.prependTo(contactWin.myContactDom.find('ul'));
                }
            }else if(userid == last.attr('userid')){
                //nothing
            }else if(parseInt(mydateline) > parseInt(last.attr('dateline'))){
                myDom.insertBefore(last);
            }else{
                myDom.insertAfter(last);
            }
        }
    }
    contactWin.onContactsLoaded = function(data){
        var userids = [];
        contactWin.myContactDom.find('ul').html('');
        if(data && data.length > 0){
            contactWin.indicator.show();
        }
        for ( var i in data) {
            var contactor = {};
            contactor.dom = jQuery18(exports.templates.contactor.
                    replace(/{brandname}/g,data[i].brandname).
                    replace(/{photo}/g,data[i].photo).
                    replace(/{userid}/g,data[i].userid).
                    replace(/{dateline}/g,data[i].dateline));
            contactor.dom.mouseenter(function(){
                jQuery18(this).css('background-color','#f5f5f5');
            });
            contactor.dom.mouseleave(function(){
                jQuery18(this).css('background-color','#FFFFFF');
            });
            contactor.dom.appendTo(contactWin.myContactDom.find('ul'));
            userids.push(data[i].userid);
            contactor.dom.click(function(){
                var userid = jQuery18(this).attr('userid');
                var brandname = jQuery18(this).attr('brandname');
                WebIM.requestChat(userid,brandname);
            });
        }
        WebIM.watchUsers(userids);
        if ( data && data.length ) {
            contactWin.myContactDom.find('.nomessage').hide();
        } else {
            contactWin.myContactDom.find('.nomessage').html('暂无最近联系人');
        }

    }
    
    contactWin.onRecentContactsLoaded = function(data){
        var userids = [];
        //clear the ul first.
        contactWin.recentContactDom.find('ul').html('');
        for ( var i in data) {
            var contactor = {};
            contactor.dom = jQuery18(exports.templates.contactor.
                    replace(/ src="{photo}"/g,"").
                    replace(/{userid}/g,data[i].participant));//only have userid here.
            contactor.dom.mouseenter(function(){
                jQuery18(this).css('background-color','#f5f5f5');
            });
            contactor.dom.mouseleave(function(){
                jQuery18(this).css('background-color','#FFFFFF');
            });
            contactor.dom.hide();//hide it first, will show it after got brandname and img.
            contactor.dom.appendTo(contactWin.recentContactDom.find('ul'));
            userids.push(data[i].participant);
            contactor.dom.click(function(){
                var userid = jQuery18(this).attr('userid');
                var brandname = jQuery18(this).attr('brandname');
                WebIM.requestChat(userid,brandname);   
            });
        }
        WebIM.getBrandNames(userids,function(result){//result: [{"userid":"14034393","brandname":"\u7b11\u7b11\u7238","photo":"http:\/\/p6.zbjimg.com\/user_avat_new\/014\/03\/43\/48x48_avatar_93.jpg"}]
            
            for ( var i in result) {
                var liObj = contactWin.recentContactDom.find('li[userid="'+result[i].userid+'"]');
                liObj.attr('brandname',result[i].brandname);
                liObj.find('img').attr('src',result[i].photo);
                liObj.find('.ui-webim-username').text(result[i].brandname);
                liObj.show();
            }
        });
        
        WebIM.watchUsers(userids);
        if ( data && data.length ) {
            contactWin.recentContactDom.find('.nomessage').hide();
        } else {
            contactWin.recentContactDom.find('.nomessage').html('暂无最近联系人');
        }
    }
    
    contactWin.onMessage = function(userid){
        contactWin.indicator.show();
        var liObj = contactWin.recentContactDom.find('li[userid="'+userid+'"]');
        if(liObj.length == 0){
            //if there is a new message sender, then we should update the contact list also.
            WebIM.getContacts(function(data){
                contactWin.onContactsLoaded(data);
            });
            //create a recent contact, put it on top.
            liObj = jQuery18(exports.templates.contactor.
                    replace(/{userid}/g,userid));//only have userid here.
            liObj.mouseenter(function(){
                jQuery18(this).css('background-color','#f5f5f5');
            });
            liObj.mouseleave(function(){
                jQuery18(this).css('background-color','#FFFFFF');
            });
            liObj.hide();//hide it first, will show it after got brandname and img.
            liObj.prependTo(contactWin.recentContactDom.find('ul'));
            liObj.click(function(){
                var userid = jQuery18(this).attr('userid');
                var brandname = jQuery18(this).attr('brandname');
                WebIM.requestChat(userid,brandname);
            });
            WebIM.getBrandName(userid,function(userNick, iconUrl){
                liObj.attr('brandname',userNick);
                liObj.find('img').attr('src',iconUrl);
                liObj.find('.ui-webim-username').text(userNick);
                liObj.show();
            });
            WebIM.watchUsers([userid]);
        }else{
            //move it to the top.
            if( liObj.index(contactWin.recentContactDom.find('li')) != 0 ){
                liObj.prependTo(contactWin.recentContactDom.find('ul'));
            }
        }
    }
    
    contactWin.init = function(initData){
        contactWin.indicator = jQuery18(exports.templates.contactIndicator).appendTo(exports.mainDom);
        contactWin.mainDom = jQuery18(exports.templates.contactWin).appendTo(exports.mainDom);
        contactWin.myContactDom = jQuery18('#myContactBox');
        contactWin.recentContactDom = jQuery18('#recentContactBox');
        
        contactWin.indicator.click(function(){
            //jQuery18('.huhuad').animate({'bottom':jQuery18(contactWin.mainDom).is(':visible')?'50px':'400px'})
            jQuery18('#ui-webim-taskbar').removeClass('webim-expand webim-collapse').addClass(jQuery18(contactWin.mainDom).is(':visible')?'webim-collapse':'webim-expand');
            contactWin.mainDom.slideToggle();
            if( WebIM.ui.chatWin.isFullScreen ){
                WebIM.ui.chatWin.toFullScreen();
            }
        });
        contactWin.mainDom.find('.ui-webim-min').click(function(){
            //jQuery18('.huhuad').animate({'bottom':jQuery18(contactWin.mainDom).is(':visible')?'50px':'400px'})
            jQuery18('#ui-webim-taskbar').removeClass('webim-expand webim-collapse').addClass(jQuery18(contactWin.mainDom).is(':visible')?'webim-collapse':'webim-expand');
            contactWin.mainDom.slideUp();
        });
        contactWin.mainDom.find('.cutover .my').click(function(){
            jQuery18(this).addClass('cur');
            jQuery18(this).next().next().removeClass('cur');
            contactWin.myContactDom.show();
            contactWin.recentContactDom.hide();
        });
        contactWin.mainDom.find('.cutover .recent').click(function(){
            jQuery18(this).addClass('cur');
            jQuery18(this).prev().prev().removeClass('cur');
            contactWin.myContactDom.hide();
            contactWin.recentContactDom.show();
        });
        
        //start load contacts.
        //WebIM.getContacts(function(data){
        //    //contacts loaded.
        //    contactWin.onContactsLoaded(data);
        //});
        
        WebIM.getRecentContacts(function(data){
            //recent contacts loaded.
            contactWin.onRecentContactsLoaded(data);
        });
    }
    
})(ui,this);

WebIM.ui.recieveMsg = function(msgs){
    return WebIM.ui.msgBox.recieveMsg(msgs);
}
WebIM.ui.sendMsg = function(tab_user_id, msg){
    //keyward filter.
    WebIM.ui.chatWin.sendMsg(tab_user_id, msg);
}
WebIM.ui.scrollCurrentChatWinToBottom = function(){
    var currentChatWinIndex = WebIM.ui.chatWin.getSelectedChatTabIndex();
    if(currentChatWinIndex>=0 && WebIM.ui.chatWin.tabs[currentChatWinIndex] && WebIM.ui.chatWin.tabs[currentChatWinIndex].container) { 
        WebIM.ui.chatWin.tabs[currentChatWinIndex].container.msgParent.parent().scrollTop(9999999);
    }
}
WebIM.ui.alert = function(msg,disableChatWin){
    if(WebIM.ui.chatWin.win && WebIM.ui.chatWin.win.find){
        WebIM.ui.chatWin.win.find('#ui-webim-tips').html(msg);
        WebIM.ui.chatWin.win.find('#ui-webim-tips').show();
        if(disableChatWin){
            WebIM.ui.chatWin.win.find('textarea').attr('disabled',true);
        }else{
            WebIM.ui.chatWin.win.find('textarea').removeAttr('disabled');
        }
    }
}

WebIM.ui.alertClean = function(){
    if(WebIM.ui.chatWin.win && WebIM.ui.chatWin.win.find){
        WebIM.ui.chatWin.win.find('textarea').removeAttr('disabled');
        WebIM.ui.chatWin.win.find('#ui-webim-tips').hide();
    }
}
WebIM.ui.updateStatus = function(){
    var status_tabs = [];
    var current_userid;
    var current_username;
    for(var k in WebIM.ui.chatWin.tabs){
        if(WebIM.ui.chatWin.tabs[k].selected){
            current_userid = WebIM.ui.chatWin.tabs[k].userid;
            current_username = WebIM.ui.chatWin.tabs[k].username;
        }
        isUserOnline = WebIM.ui.chatWin.tabs[k].isOnline;
        status_tabs.push({username:WebIM.ui.chatWin.tabs[k].username,
            userid:WebIM.ui.chatWin.tabs[k].userid,
            isUserOnline:isUserOnline,
            aboutType:WebIM.ui.chatWin.tabs[k].aboutType,
            aboutId:WebIM.ui.chatWin.tabs[k].aboutId});
    }
//  WebIM.updateStatus({tabs:status_tabs,currentUserId:current_userid,currentUserName:current_username,chatWinOpen:WebIM.ui.chatWin.showing});
    WebIM.updateStatus({tabs:status_tabs,currentUserId:current_userid,currentUserName:current_username,chatWinOpen:false,mute:WebIM.setting.mute});//not auto open window.
}
})((this.WebIM.ui = {}), this);


function buildOfflineButton(container){
    jQuery18(document).ready(function(){
        container = container || 'body';
        jQuery18(container).find('[webim]').each(function(){
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
                ctx.removeClass(options.style+'-butn-online').removeClass(options.style+'-butn-offline');
                ctx.find('u').text('联系我');
                //2. binding onclick event.
                ctx.click(function(){
                    //if already logged in, then show refresh page.
                    if(WebIM.getUserId() != null && "https:" != document.location.protocol){
                        window.location.reload();
                        return;
                    }else{
                        //bind to login popup.
                        if ( ZDK.passport ) {
                            ZDK.passport.quickLogin(function(json) {
                                window.location.reload();
                            });
                        } else {
                            var login = new ZDK.module.login();
                            login.createLogin({
                                login:function(json,win){
                                    window.location.reload();
                                },
                                register:function(json,win){
                                    window.location.reload();
                                }
                            });
                            login.win.Close.click(function(){
                                //nothing.
                            });
                        }
                    }
                });
            })(_this);
        });
    });
}
(function(exports, global) {
    var WebIM = exports;
    WebIM.init = function(){
    	
    	// 无权限按钮控制
        jQuery18('.btn-no-limits').each(function(){
           var btn = jQuery18(this);
           if (!btn.hasClass('butn')) {
               btn.addClass("butn butn-orange min-butn min-butn-yellow tips_hover");
           }
           var dataTip = btn.attr('data-tip');
//           var dataHref = btn.attr('data-href');
//           var dataHref = "http://www.zhubajie.com/vip/buy?level=1";
           
           //var tip = "您是普通服务商，暂时不能联系雇主，如需联系雇主请"+'<a href="'+dataHref+'" target="_blank">加入银牌服务商</a>(银牌及以上服务商均可享有此功能)';
           
           var dataHref = btn.attr('data-href');
           
           var tip = dataTip.replace('{加入签约服务商}','<a href="'+dataHref+'" target="_blank">加入签约服务商</a>');
           
           var obj = btn;
           var hovertimer;
           
           obj.attr('target','_blank').attr('href',dataHref);

           
           
           var obj = btn;
           obj.attr('tips_text',tip).attr('target','_blank').attr('href',dataHref);
        });
        // 未登录按钮控制
        jQuery18('.wbim-btn-no-login').each(function(){
           var btn = jQuery18(this);
           if (!btn.hasClass('butn')) {
               btn.addClass("butn butn-orange min-butn min-butn-yellow tips_hover");
           }
           btn.prepend('<i></i>');
           
           var tip = '请登录后再使用该功能。<a href="https://login.zhubajie.com/">登录</a>';
           var obj = btn;
           obj.attr('tips_text',tip).attr('target','').attr('href',"https://login.zhubajie.com/");
        });
    	
        if(WebIM.getUserId() == null||"https:" == document.location.protocol||WebIM.getUserId()=='8296634'){
            buildOfflineButton();
            jQuery18('.im-me[webim]').css('visibility','visible');
            return;
        }
//          WebIM.connect();//1. connect to the server.
        WebIM.connect(WebIM.getUserId(),{
            onConnect:function() {
            	jQuery18('.im-me[webim]').css('visibility','visible');
                WebIM.notifier.loadNotify();
            }
        });
        //2. get status.
        //3. get message history.
        //initialization will be finish in "initDone"
    }
})(window.WebIM,this);


/**
 * webim 发送图片控件
 * @type 
 */
WebIM.UPLOAD_CONFIG = {
    uploadURI: 'http://task.zhubajie.com/pub/uploadnew',// 上传路径
    fileExt: '.jpg,.jpeg,.png,.gif',// 允许上传类型
    target: null,//目标按钮区域
    file: 'file',//文件上传名
    fileinputClass: 'ui-upload-btn',
    buttonClass: 'ui-upload',
    onprogresreading: function(){},
    onprogresed: function(){},
    onprogresserror: function(){},
    tips:  function(msg){}
};

WebIM.upload = function(opt) {
    this.opt = jQuery18.extend({},WebIM.UPLOAD_CONFIG,opt);
    this.target = jQuery18(this.opt.target).addClass(this.opt.buttonClass);;
    this.progressID = new Date().getTime();
    this.createButtonFile();
};

WebIM.upload.prototype = {
    createButtonFile: function(){
        var self = this ,opt = self.opt;
        self.buttonFile && self.buttonFile.remove();
        self.buttonFile = jQuery18('<input   class="'+opt.fileinputClass+'" type="file" size="100" name="'+opt.file+'" ' +
            'data-progressID="'+self.progressID+'" />').appendTo(self.target);
        self.buttonFile.bind('change',function(){
            //判断文件名
            var file = jQuery18(this).val();
            // 获取后缀
            var fileExt = file.substring(file.lastIndexOf('.'),file.length).toLowerCase();
            if(opt.fileExt.indexOf(fileExt) == -1){
                return opt.tips('不允许上传此类型文件');
            }
            self.onProgresreading();
        });
    },
    //当准备开始上传
    onProgresreading: function(){
        var self = this;
        this.progressID = new Date().getTime();
        var progressID = this.progressID;
        
        //准备上传
        var filename =this.buttonFile.val();
        filename = filename.indexOf("\\")<0 ? filename : filename.substring(filename.lastIndexOf("\\")+1) ;
        this.opt.onprogresreading({progress:progressID,traget:this,name:filename});
        //开始上传,当前没有开始一个上传的时候
        this.createFormIframe();
        this.buttonFile.appendTo(this.FORM);
        this.nowProgressID =progressID;
        this.FORM.prepend('<input type="hidden" value="'+progressID+'" name="UPLOAD_IDENTIFIER" />');
        
        try{
            self.FORM.submit();
        }catch(e){
            self.opche.tips('请用IE6以上浏览器发送图片!');
        }
        this.createButtonFile();
    },
    //创建上传代理文件
    createFormIframe: function(){
        if ( !this.IFrame ) {
            var name = 'uploadpRrogress_'+(+new Date) , self = this;
            var callback = this.callback = 'uploadSuccess'+(+new Date);
            var url  = this.opt.uploadURI+(this.opt.uploadURI.indexOf('?')>-1?'&':'?')+'&ifr=2&iframe=1&domain='+document.domain+
                    '&jsonpcallback='+callback + "&X-Progress-ID=" + this.progressID;
            window[callback]= function(json){
                self.uploading = false;
                self.removeFormIframe();
                if(json.state == 1){
                    self.onProgresed(json.msg||json.img,json);
                //上传失败
                } else {
                    self.onProgressError(json.msg);
                }
            };
            this.IFrame = jQuery18('<iframe name="'+name+'" width="0" height="0" frameborder="0" style="dispaly:none;"></iframe>').appendTo(document.body);
            this.FORM   = jQuery18('<form action="'+url+'" target="'+name+'" method="post" enctype="multipart/form-data" style="display:none;"></form>').appendTo(document.body);
        }
    },
    //删除代理
    removeFormIframe: function(){
        if(this.IFrame){
            this.IFrame.remove();
            this.FORM.remove();
            this.IFrame = this.FORM = null;
        }
    },
    onProgresed: function(url,json){
        var self = this; 
        this.removeFormIframe();
        this.opt.onprogresed({progress:self.nowProgressID,target:self,url:url,json:json});
    },
    onProgressError: function(msg){
        this.opt.tips(msg);
        this.opt.onprogresserror({progress:self.nowProgressID,target:this});
    }
};
try{WebIM.init();}catch(e){
    try{
        console.info("webim init failed! "+e);
    }catch(e){}
}
if (ZBJInfo && ZBJInfo.pageDomain) {
    document.domain=ZBJInfo.pageDomain;
} else{
    document.domain="zhubajie.com";
}


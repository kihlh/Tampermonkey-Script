// ==UserScript==
// @name                Eagle淘宝工具箱
// @description         一键发送商品主图,详情页,SKU,长图,主图视频到Eagle软件中，方便数据收集和分析，支持一键查看手机端详情页
// @author              黄逗酱酱
// @match               *://chaoshi.detail.tmall.com/*
// @match               https://detail.1688.com/offer/*
// @match               *://item.taobao.com/*
// @match               *://detail.tmall.com/*
// @match               *://h5.m.taobao.com*
// @match               *://detail.m.tmall.com*
// @match               http://localhost:41595*
// @note                2020-01-24 UI化脚本增加更加稳定的功能，模块化发送的图片支持归类文件夹
// @note                2021-04-10 支持快捷键shift+s快速保存图片下个版本支持定义和按钮排序主题等... 那个...挤牙膏般的更新脚本，当前这是为了过段时间更新前的小改变，因为当前软件基本上完善了，不会有特别大的更新
// @note                划掉-_-太忙了得鸽了 2.2版本：立个小flag：支持下载长图（800*1200），支持按钮排序，支持设置（界面化），支持创建详情文件夹归类 支持判断SKU是否为无库存SKU 支持自定义功能快捷键
// @grant               GM_xmlhttpRequest
// @grant               GM_setClipboard
// @grant               GM_setValue
// @grant               GM_getValue
// @grant               unsafeWindow
// @connect             *
// @run-at              document-body
// @require             https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js
// @require             https://cdn.bootcdn.net/ajax/libs/keypress/2.1.5/keypress.min.js
// @require https://greasyfork.org/scripts/430351-eagle%E4%BA%A4%E4%BA%92%E8%84%9A%E6%9C%AC/code/Eagle%E4%BA%A4%E4%BA%92%E8%84%9A%E6%9C%AC.js?version=957317
// @date                8/05/2021
// @version             2.3
// @license             MPL-2.0
// @namespace           https://greasyfork.org/users/710095
// ==/UserScript==
/***************************************************************************************************************************\
 *                                                功能版权声明
 * UI交互界面源码参考自@头号否 https://greasyfork.org/users/39238  许可协议GPL-3.0-only本脚本变更许可协议MPL-2.0
 * Eagle功能开发和参考来自于@Eagle软件开发者  许可协议GPL-3.0-only本脚本变更许可协议MPL-2.0
 * 用户许可协议：只作为对商品的查看作用商品详细增强，不得用于其他用途
 * 主图视频解析参考于@Fatkun图片批量下载 感谢此优秀的软件
 * Eagle接口处理函数来自于用户 @miracleXL https://greasyfork.org/zh-CN/scripts/419792 的优秀封装
 *
 *                                                    待完成
 * --------------------------------------------------------------------------------------------------------------------------
 * 还有几个端还没写 天猫后台淘宝后台
 * 以后支持花瓣自动下载批量收集
 * 懒加载的网站专门细写加载功能
 * 如果发现url为空或者不是//...[.](...)的话删除防止Eagle崩溃
 *
 * // @match               *://m.1688.com* 大部分功能不支持，下架
 * *****在编************
// @match               *://sell.publish.tmall.com*
// @match               *://ipublish.tmall.com*
// @match               *item.upload.taobao.com*
*
/****************************************************************************************************************************/


// Eagle API 服务器位置
(async function () {
        if(GM_getValue('OFF'))return;
'use strict';
const EAGLE_SERVER_URL = "http://localhost:41595";
const EAGLE_IMPORT_API_URL = `${EAGLE_SERVER_URL}/api/item/addFromURL`;
const EAGLE_IMPORT_API_URLS = `${EAGLE_SERVER_URL}/api/item/addFromURLs`;
const EAGLE_CREATE_FOLDER_API_URL = `${EAGLE_SERVER_URL}/api/folder/create`;
const EAGLE_GET_FOLDERS_API_URL = `${EAGLE_SERVER_URL}/api/folder/list`;
let startTime = Date.now(); // 时间戳 主图时间戳是 %*1+(i*0.1)   详情时间戳是 %*1+(i*0.3)   SKU时间戳是%*1+(i*0.2)
let tb_ID = '';
let hot_name = window.location.hostname;
let lazyload =0;
let fold = "";
let fetch=unsafeWindow.fetch
let HM={
     TB: {
        MaxURL(URL, 注释_解析大图) { return HM.GetTB_Max_IMAG(URL) },
        oflazy(URL, 注释_判断是否懒加载链接) { for (let i = 0; i < this.lazyARR.length; i++) { if (URL.indexOf(this.lazyARR[i]) !== -1) { return true } }; return false }
        , lazyARR: ["imglazyload/spaceball.gif", 'T1BYd_XwFcXXb9RTPq-90-90.png', "T1BYd_XwFcXXb9RTPq-90-90", "TB1k9XsQpXXXXXLXpXXXXXXXXXX-750-368", "TB1oOXFXDM11u4jSZPxSuuhcXXa", "TB1AHXiGXXXXXXAXVXX.uTD.FXX-10-10", "wAAACH5BAUAAAAALAAAAAACAAEAAAICBAoAOw", "T10B2IXb4cXXcHmcPq-85-85", "CUdsY9YBuNjy0FgXXcxcXXa-1572-394", "T1BYd_XwFcXXb9RTPq-90-90", "spaceball.gif", "TB1k9XsQpXXXXXLXpXXXXXXXXXX-750-368", "other/lazyload.png", "TB1l8I3dlv0gK0jSZKbXXbK2FXa-226-226"]
    },
GetTB_Max_IMAG(url, 注释_解析大图) {

        if (typeof url !== "string") return url
        let run = url
            .replace(/_[.]webp/img, '')    //_.webp
            .replace(/_\d+x\d+[.](je?pg|png|gif|wepb)/img, '')  //_pic.jpg_60x60.jpg
            .replace(/_\d+x\d+[a-z]\d+[.](je?pg|png|gif|wepb)/img, '') //.jpg_60x60q90.jpg
            .replace(/https?:/img, '') //移除所有连接的协议头无论有没有
            .replace(/(\\\\+|\/\/+)?img\.alicdn\.com\/tps\/[a-z]\d\/T10B2IXb4cXXcHmcPq(-\d+-\d+[.]gif)?/img, '') //详情页默认的gif懒加载
            .replace(/(\\\\+|\/\/+)?img\.alicdn\.com.{1,12}\/spaceball.gif/img, '') //详情页默认的png懒加载
            .replace(/([.](je?pg|png|gif|wepb))_\d+x\d+[a-z]\d+/img, '$1') //.jpg_640x640q80
            .replace(/([.](je?pg|png|gif|wepb))_\d+x\d+([a-z]\d+){2,3}([.](je?pg|png|gif|wepb))?/img, '$1')// .jpg_760x760Q50s50.jpg
            .replace(/(?:.+?)?(\/\/.{1,6}(?:ali|taobao|tb)cdn[.]com\/.+?[.](?:jpe?g|png|gif))(.+?)?$/i, 'https:$1')//只单行加头并且移除本行内所有不需要的信息
            .replace(/[.]\d+x\d+[.](jpe?g|png|gif|webp)(?:(?:_\d+x\d+[a-z]\d+.[a-z]+_(?:.webp)?)?)/i, '.$1')
            .replace(/^[\/\\]{1,2}.+/, 'https:$&')
        return !HM.TB.oflazy(run) ? run : ""
    }
    , async GoBottom(注释_滑动到底) {
        let n = window.screenTop || 0;
        let max = 999999;
        let get = () => { return document.body.offsetHeight }
        let Last = get();
        scrollTo(0, get() ? get() : max);
        for (let i = 0; i < 20; i++) {
            let newLast = get();
            scrollTo(0, newLast ? newLast : max);
            await HM.Sleep(500)
            if (Last - newLast === 0) return scrollTo(0, n)
        }
        await this.Sleep(500)
        scrollTo(0, 99999) //最后一击
    },
            Sleep(ms, 注释_阻塞) { return new Promise(resolve => setTimeout(resolve, ms)) },

    }
    let MAXimg=HM.GetTB_Max_IMAG
    let scroAll=HM.GoBottom
// 判断当前网页类型
let tb, tm, cs, m_tm, m_tb, tmm, tmup, tbup, _1688, m1688 = 0;
(function ifhot() {
   if (hot_name === "detail.tmall.com") {
      tm = 1
   } else if (hot_name === "chaoshi.detail.tmall.com") {
      cs = 1
   } else if (hot_name === "item.taobao.com") {
      tb = 1
   } else if (hot_name === "detail.m.tmall.com") {
      m_tm = 1
   } else if (hot_name === "h5.m.taobao.com") {
      m_tb = 1
   } else if (hot_name === "detail.1688.com") {
      _1688 = 1
   } else if (hot_name === "m.1688.com") {
      m1688 = 1
   } else if (hot_name === "ipublish.tmall.com") {
      tmm = 1
   } else if (hot_name === "sell.publish.tmall.com") {
      tmup = 1
   } else if (hot_name === "item.upload.taobao.com") {
      tbup = 1
   }
})();
        // 为了网站的权益 提示用户需要查看后删除
    function UserAgreement() {
            if (GM_getValue('UserAgreement')) {
                    return true;
            } else {
                    let info = confirm(`
            用户协议：
        ----我同意仅作为查看,学习图片用途----，
             并且我将在稍后移除图片，
             并且在本网页关闭后我将移除图片，

             点击取消之后请帮我关闭此功能
             并且请不再提问我这个问题，

        `);
                    if (!info) {
                            GM_setValue('OFF', true)
                    } else {
                            GM_setValue('UserAgreement', true)
                    }
            }
            return false
    }
//获取最短链接
function tb_url() {
   let id = 0;
   let i = document.URL;
   if (i.match(/[\?&]id=(\d{9,13})/)) {
      id = i.match(/[\?&]id=(\d{9,13})/)[1]
   }else if(i.match(/\/offer\/(\d+)[.]html/)){
      id = i.match(/\/offer\/(\d+)[.]html/)[1]
   }
   if ((tm + m_tm) === 1) {
      i = `https://detail.tmall.com/item.htm?id=${id}`
   } else if ((tb + m_tb) === 1) {
      i = `https://item.taobao.com/item.htm?id=${id}`
   } else if (cs === 1) {
      i = `https://chaoshi.detail.tmall.com/item.htm?id=${id}`
   }  else if(_1688===1){
      i= `https://detail.1688.com/offer/${id}.html`
   }  else if(m1688===1){
      i= `https://m.1688.com/offer/${id}.html`
   }else{
      i = `https://detail.tmall.com/item.htm?id=${id}`
   }
   tb_ID = id;
   if (tb_ID === 0) {
      tb_ID = ""
   }
   return i;
}
async  function btn_ALL() {
                   if(!UserAgreement())return;
//    getFolderId(title()).then(function (i){
//      fold=i;
//    let arr =[zhutu,Details,SKU,Video,Details_Video];
//    // let arr =[zhutu]
//      HM_goArr(arr)
//    })
scroAll()
   let arr =[zhutu,Details,SKU,Video,Details_Video];
   let FoldALl=["商品主图","商品详情","SKU"]
   let FoldallID=[];
   let ALLID=await ToEagle.SetNewFolder(title()||"商品图片收集");
   let ID=ALLID.data.id;
   for (const newFolder of FoldALl) {
    FoldallID.push((await ToEagle.SetNewFolder(newFolder,ID)).data.id)
   }
   let Getzhutu=arr[0]();
   let GetDetails=arr[1]();
   let GetSKU=arr[2]();
   Getzhutu.folderId=FoldallID[0]
   GetDetails.folderId=FoldallID[1]
   GetSKU.folderId=FoldallID[2]
   console.log(Getzhutu,GetDetails,GetSKU);
   ToEagle.AddImagesURLAll(Getzhutu)
   ToEagle.AddImagesURLAll(GetDetails)
   ToEagle.AddImagesURLAll(GetSKU)

   btn_HM_Video()

    if(GM_getValue('Eagle'))return;
    Qmsg.info("开发者HM：按下【shift+s】试试呗(此消息在按下shift+s之后不再弹出)",{
autoClose:false,
 onClose:function(){
     console.log('啊哈你又学会了一项新技能')

 }
})
}
function btn_SKU() {
                           if(!UserAgreement())return;

   getFolderId(title()).then(function (i){
      fold=i;
    let arr =[SKU];
      HM_goArr(arr)
    })
}
function  btn_Details() {
                           if(!UserAgreement())return;

   getFolderId(title()).then(function (i){
      fold=i;
    let arr =[Details,Details_Video];
      HM_goArr(arr)
    })
}
function btn_zhutu() {
                           if(!UserAgreement())return;

   getFolderId(title()).then(function (i){
      fold=i;
    let arr =[zhutu];
      HM_goArr(arr)
    })
}
function btn_HM_Video() {
                           if(!UserAgreement())return;

   getFolderId(title()).then(function (i){
      fold=i;
    let arr =[Video,Details_Video];
      HM_goArr(arr)
    })
}
function btn_HM_copy() {
   GM_setClipboard(tb_url() );
   Qmsg.info(`已复制内容是:${tb_url()}`)

}
 let listener = new window.keypress.Listener();
 listener.simple_combo("shift s", function() {
btn_ALL()
     Qmsg.closeAll()
     if(GM_getValue('Eagle'))return;
     GM_setValue('Eagle',{type:"yes"})
 });



(function () {

   window.layerstart = '<div id = "layer" style = "border-radius:2px;top:0em;left:0;width:32%;height:92%;background-color:#FFFFFF;position:fixed;z-index:9999999999999999999999;display:none;border:1px solid #ffffff;overflow:hidden;padding-bottom:30px;border-radius:10px;">';
   layerstart += '<div style="text-align: right; padding: 15px; border-bottom: 1px solid #F8F8F8; height: 20px;background-color: #1a7cd;"><a class="close" href="javascript:;" id="sdghdshhf">X</a><div style="float: left; font-size: 17px; margin-top: -2px; margin-left: 10px; font-family: sans-serif; color: #333;">无线端详情</div></div>';
   window.layerend = '</div>';

   //让层居中显示
   window.layerCenter = function () {
      let bwidth = window.screen.availWidth;
      let bheight = window.screen.availHeight;
      let layertop = (bheight - 720) / 2;
      let layerleft = (bwidth - 1280) / 2;

      if (layertop <= 70) {
         layertop = "1em";
      }
      else {
         layertop = (layertop - 125) + "px";
      }
      document.getElementById("layer").style.top = "20px";
      document.getElementById("layer").style.left = "35%";
   }
   //创建一个遮罩层
   window.keepout = function () {
      var fade = '<div id = "fade" style = "width:100%;height:100%;background:rgba(0, 0, 0, 0.2);position: fixed;left: 0;top: 0;z-index: 999999999;" onclick = "closelayer()"></div>';
      var div = document.createElement("div");
      div.innerHTML = fade;
      document.body.appendChild(div);
   }

   //显示按钮
   if (tb===1) {
      window.showaliwx = function () {
         var up = layerstart;
         up += '<iframe id="thfou_wx" src = "https://h5.m.taobao.com/awp/core/detail.htm?id=' + tb_ID + '" width="100%" height="100%" frameborder="0"></iframe>';
         up += layerend;
         //$("body").append(up);
         var div = document.createElement("div");
         div.innerHTML = up;
         document.body.appendChild(div);

         //$("#layer").show();
         document.getElementById("layer").style.display = "block";

         //显示遮罩
         keepout();
         //居中显示层
         layerCenter();

         let  isncd= document.getElementById('sdghdshhf');
         isncd.addEventListener('click', closelayer, false);

      }
   }
   else if (tm) {
      window.showaliwx = function () {
         var up = layerstart;
         up += '<iframe id="thfou_wx" src = "https://detail.m.tmall.com/item.htm?id=' + tb_ID + '" width="100%" height="97.5%" frameborder="0"></iframe>';
         up += layerend;
         var div = document.createElement("div");
         div.innerHTML = up;
         document.body.appendChild(div);
         document.getElementById("layer").style.display = "block";
         //显示遮罩
         keepout();
         //居中显示层
         layerCenter();
         let  isncd= document.getElementById('sdghdshhf');
         isncd.addEventListener('click', closelayer, false);

      }
   }else{
      window.showaliwx=function () {}
   }
   var alicmz = '<div id="onii_alicmz"></div>';
   var getbody = document.getElementsByTagName('body')[0];
   getbody.insertAdjacentHTML('afterbegin', alicmz);

   var style = document.createElement('style');
   style.type = 'text/css';
   style.innerHTML = `#onii_alicmz,.aliwx {
      font: 14px "PingFang SC","Lantinghei SC","Microsoft YaHei","HanHei SC","Helvetica Neue","Open Sans",Arial,"Hiragino Sans GB","微软雅黑",STHeiti,"WenQuanYi Micro Hei",SimSun,sans-serif;
      position: fixed;  top: 25%;  right: 50px;  padding: 10px;  min-width: 130px;  text-align: center;  z-index: 999999999999999;  background: #fff;  border-radius: 15px;  border: 1px solid #1a7cda;}
      .alicmzbtn { font: 14px "PingFang SC","Lantinghei SC","Microsoft YaHei","HanHei SC","Helvetica Neue","Open Sans",Arial,"Hiragino Sans GB","微软雅黑",STHeiti,"WenQuanYi Micro Hei",SimSun,sans-serif; background-color: #1a7cda;  color: #ffffff;  border: 0px solid #f0cab6;  right: 20em;  top: 40em;  z-index: 88;  cursor: pointer;  padding: 5px 20px;  border-radius: 50px;  margin-bottom: 10px;  transition: 0.3s;}
      .alicmzbtn2 { font: 14px "PingFang SC","Lantinghei SC","Microsoft YaHei","HanHei SC","Helvetica Neue","Open Sans",Arial,"Hiragino Sans GB","微软雅黑",STHeiti,"WenQuanYi Micro Hei",SimSun,sans-serif; background-color: #e0244bb0;  color: #ffffff;  border: 0px solid #f0cab6;  right: 20em;  top: 40em;  z-index: 88;  cursor: pointer;  padding: 5px 20px;  border-radius: 50px;  margin-bottom: 10px;  transition: 0.3s;}
      .alicmzbtn:hover {  color: #fff;  background-color: #1c8ded;}
      .close {  color: #828282;  background-color: #e6e6e6;  width: 80px;  text-align: center;  padding: 0.5em;  border-radius: 2px;  padding-left: 1em;  padding-right: 1em;  text-decoration: none;  transition: 0.3s;}
      .close:hover {  color: #5d5d5d;  background-color: #ffffff;  text-decoration: none;}
      .alicmzbtn a {  color: #1c8ded;  text-decoration: none;}
      .dmcss a {  color: #d3d3d3;  text-decoration: none;}
      .xflogo {  width: 110px;  padding: 15px 10px 15px 10px;}
      #gbxf {  color: #1c8ded;  position: absolute;  right: 8px;  top: 6px;  font-size: 12px;  cursor: pointer;  transition: 0.3s;  border: 1px #000000 solid;  line-height: 9px;  border-radius: 3px;  padding: 1px;}
      #gbxf:hover {  color: #fff;  border: 1px #fa630a solid;background-color: #fa630a;  opacity: 0.8;}
      #smallxf {  position: fixed;  bottom: 36px;  right: 36px;  color: #fe4514;  background-color: #fff;  border: 2.5px solid #1a7cda;  padding: 8px;  font-weight: bold;  font-size: 14px;  cursor: pointer;  border-radius: 27px;  z-index: 999999999999999999;  transition: 0.6s;}
      #smallxf:hover {  bottom: 5px;  box-shadow: rgba(0, 0, 0, 0.04) 0 1px 5px 0px;}
     .smlogo {  width: 100px;  padding: 2px 5px 0px 5px;}
     .qmsg.qmsg-wrapper{box-sizing:border-box;margin:0;padding:0;color:rgba(0,0,0,.55);font-size:13px;font-variant:tabular-nums;line-height:1;list-style:none;font-feature-settings:"tnum";position:fixed;top:16px;left:0;z-index:999999999999999999999999999;width:100%;pointer-events:none}.qmsg .qmsg-item{padding:8px;text-align:center;-webkit-animation-duration:.3s;animation-duration:.3s;position:relative}.qmsg .qmsg-item .qmsg-count{text-align:center;position:absolute;left:-4px;top:-4px;background-color:red;color:#fff;font-size:12px;line-height:16px;border-radius:2px;display:inline-block;min-width:16px;height:16px;-webkit-animation-duration:.3s;animation-duration:.3s}.qmsg .qmsg-item:first-child{margin-top:-8px}.qmsg .qmsg-content{text-align:left;position:relative;display:inline-block;padding:17px 26px;background:#fff;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.15);pointer-events:all;font-weight:700;font-size:18px;max-width:80%;min-width:80px}.qmsg .qmsg-content [class^="qmsg-content-"]{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qmsg .qmsg-content .qmsg-content-with-close{padding-right:20px}.qmsg .qmsg-icon{display:inline-block;color:inherit;font-style:normal;line-height:0;text-align:center;text-transform:none;vertical-align:-.125em;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;position:relative;top:1px;margin-right:8px;font-size:16px}.qmsg .qmsg-icon svg{display:inline-block}.qmsg .qmsg-content-info .qmsg-icon{color:#1890ff;user-select:none}.qmsg .qmsg-icon-close{position:absolute;top:11px;right:5px;padding:0;overflow:hidden;font-size:12px;line-height:22px;background-color:transparent;border:0;outline:0;cursor:pointer;color:rgba(0,0,0,.45);transition:color .3s}.qmsg .qmsg-icon-close:hover>svg path{stroke:#555}.qmsg .animate-turn{animation:MessageTurn 1s linear infinite;-webkit-animation:MessageTurn 1s linear infinite}@keyframes MessageTurn{0%{-webkit-transform:rotate(0deg)}25%{-webkit-transform:rotate(90deg)}50%{-webkit-transform:rotate(180deg)}75%{-webkit-transform:rotate(270deg)}100%{-webkit-transform:rotate(360deg)}}@-webkit-keyframes MessageTurn{0%{-webkit-transform:rotate(0deg)}25%{-webkit-transform:rotate(90deg)}50%{-webkit-transform:rotate(180deg)}75%{-webkit-transform:rotate(270deg)}100%{-webkit-transform:rotate(360deg)}}@-webkit-keyframes MessageMoveOut{0%{max-height:150px;padding:8px;opacity:1}to{max-height:0;padding:0;opacity:0}}@keyframes MessageMoveOut{0%{max-height:150px;padding:8px;opacity:1}to{max-height:0;padding:0;opacity:0}}@-webkit-keyframes MessageMoveIn{0%{transform:translateY(-100%);transform-origin:0 0;opacity:0}to{transform:translateY(0);transform-origin:0 0;opacity:1}}@keyframes MessageMoveIn{0%{transform:translateY(-100%);transform-origin:0 0;opacity:0}to{transform:translateY(0);transform-origin:0 0;opacity:1}}@-webkit-keyframes MessageShake{0%,100%{transform:translateX(0px);opacity:1}25%,75%{transform:translateX(-4px);opacity:.75}50%{transform:translateX(4px);opacity:.25}}@keyframes MessageShake{0%,100%{transform:translateX(0px);opacity:1}25%,75%{transform:translateX(-4px);opacity:.75}50%{transform:translateX(4px);opacity:.25}}
     `
   document.getElementsByTagName('HEAD').item(0).appendChild(style);
   //创建一个显示按钮
   (function () {
      let getkj = document.getElementById("onii_alicmz");
      getkj.innerHTML = `
    <div id="HM_M_TB" class= "alicmzbtn" >查看移动端</div>
     <div id="HM_dowAll" class= "alicmzbtn" >下载全部</div>
      <div id="HM_SKU_GO" class= "alicmzbtn" >下载SKU</div>
       <div id="HM_zhutu" class= "alicmzbtn" >下载主图</div>
         <div id="HM_Details_GO" class= "alicmzbtn" >下载详情</div>
           <div id="HM_Video" class= "alicmzbtn" >下载视频</div>
             <div id="HM_copy" class= "alicmzbtn" >复制短链</div>
              <div id="HM_AII_ail" class= "alicmzbtn2" >下载更多</div>
                 <div id="HM_AII_off" class= "alicmzbtn2" >返回菜单</div>
                 <div id="HM_UPDATES"<a style="text-decoration:none;" target="_blank" href="https://greasyfork.org/zh-CN/scripts/417000"><div class="alicmzbtn">检查更新</div></a></div>
         `;
      document.body.appendChild(getkj);
   })();
   let gbxf = '<div id="gbxf" onclick="hidexf();" title="点击隐藏">—</div>';
   let xfkj = document.getElementById('onii_alicmz');
   xfkj.insertAdjacentHTML('afterbegin', gbxf);

   let hdxf = document.getElementById('gbxf');
   hdxf.addEventListener('click', hidexf, false);

   let  HM_M_TB= document.getElementById('HM_M_TB');
   HM_M_TB.addEventListener('click', showaliwx, false);

   let  HM_dowAll= document.getElementById('HM_dowAll');
   HM_dowAll.addEventListener('click', btn_ALL, false);

   let  HM_SKU_GO= document.getElementById('HM_SKU_GO');
   HM_SKU_GO.addEventListener('click', btn_SKU, false);

   let  HM_zhutu= document.getElementById('HM_zhutu');
   HM_zhutu.addEventListener('click', btn_zhutu, false);

   let  HM_Details_GO= document.getElementById('HM_Details_GO');
   HM_Details_GO.addEventListener('click', btn_Details, false);

   let  HM_Video= document.getElementById('HM_Video');
   HM_Video.addEventListener('click', btn_HM_Video, false);

   let  HM_copy= document.getElementById('HM_copy');
   HM_copy.addEventListener('click', btn_HM_copy, false);

   let  HM_AII_off= document.getElementById('HM_AII_off');
   HM_AII_off.addEventListener('click', btn_HM_AII_off, false);


   // 按下这个按钮将增加其他按钮以保证其他功能能够正常运行
   let  HM_AII_ail= document.getElementById('HM_AII_ail');
   HM_AII_ail.addEventListener('click', btn_all_ail, false);
   function btn_all_ail() {
      document.querySelector('#HM_AII_ail').style.display="none";
      document.querySelector('#HM_M_TB').style.display="block";
      document.querySelector('#HM_dowAll').style.display="block";
      document.querySelector('#HM_SKU_GO').style.display="block";
      document.querySelector('#HM_zhutu').style.display="block";
      document.querySelector('#HM_Details_GO').style.display="block";
      document.querySelector('#HM_Video').style.display="block";
      document.querySelector('#HM_copy').style.display="block";
      document.querySelector('#HM_AII_off').style.display="block";
       if(cs===1){
       document.querySelector('#HM_SKU_GO').style.display="none";
       }if(document.querySelector('.tb-video video')){}
       else if(document.querySelector('.lib-video video')){}
       else{document.querySelector('#HM_Video').style.display="none";}



   }
   // 如果不是淘宝网或者天猫就把手机端模拟的移除（包含了1688因为网站设置了拦截）默认四个比较美观太多了用户体验不好
   // 默认开启和关闭的开关
   function btn_HM_AII_off() {
      document.querySelector('#HM_AII_ail').style.display="block";
      document.querySelector('#HM_M_TB').style.display="block";
      document.querySelector('#HM_dowAll').style.display="block";
      document.querySelector('#HM_SKU_GO').style.display="block";
      document.querySelector('#HM_zhutu').style.display="none";
      document.querySelector('#HM_Details_GO').style.display="block";
      document.querySelector('#HM_Video').style.display="none";
      document.querySelector('#HM_copy').style.display="none";
      document.querySelector('#HM_AII_off').style.display="none";
      document.querySelector('#HM_UPDATES').style.display="none";

      if(tb===1){document.querySelector('#HM_Details_GO').style.display="none";
   }else if(tm===1){document.querySelector('#HM_Details_GO').style.display="none";
   }else if(cs===1){
      document.querySelector('#HM_zhutu').style.display="block";
      document.querySelector('#HM_M_TB').style.display="none";
      document.querySelector('#HM_Details_GO').style.display="block";
       document.querySelector('#HM_SKU_GO').style.display="none";
   }else{document.querySelector('#HM_M_TB').style.display="none";}

   }btn_HM_AII_off();

  //关闭层
function closelayer(){
   //$("#layer").hide();
   document.getElementById("layer").style.display = "none";
  //showSidebar();
  //$("#layer").remove();
  var layer = document.getElementById("layer");
  layer.parentNode.removeChild(layer);

  //$("#fade").remove();
  var fade = document.getElementById("fade");
  fade.parentNode.removeChild(fade);
};


   var smallxf = '<div id="smallxf" style="display:none;"title="点击恢复"><img src="https://kiic.oss-cn-beijing.aliyuncs.com/ico/Eagle_box_icc.svg" class="smlogo"></div>';
   var getcmz = document.getElementById('onii_alicmz');
   getcmz.insertAdjacentHTML('afterend', smallxf);

   var showxf = document.getElementById('smallxf');
   showxf.addEventListener('click', showcmz, false);

   function hidexf() {
      document.getElementById('onii_alicmz').style.display = 'none';
      document.getElementById('smallxf').style.display = 'block';
   };
   function showcmz() {
      document.getElementById('onii_alicmz').style.display = 'block';
      document.getElementById('smallxf').style.display = 'none';
   };



   hidexf();

})();
//发送模块支持数据函数,因为要模块化和异步等id
function HM_goArr(arr) {
   if(arr)
   for (let a = 0; a < arr.length; a++) {
      let g = arr[a];
      if(g.name!=="Details"){
         g();
      if(g){go_eagleAll(g())}}
      // 解决详情页懒加载问题
      if(g.name==="Details"){
        scroAll();
        setTimeout( function(){go_eagleAll(g())},1200);}
   }
}
// 网站是哪个？如果是数值定为1

//发送
function go_eagle(data) {
   GM_xmlhttpRequest({
      url: EAGLE_IMPORT_API_URL,
      method: "POST",
      data: JSON.stringify(data),
      onload: function (response) {
         if (response.statusText !== "OK") {
            console.log(response);
            alert("下载失败！")
         }
      }
   });
}
function go_eagleAll(items) {
   let newarr =[];
   let data ={"items":newarr,"folderId":fold}
   if(items.items){
      let arr =items.items;
      for (let s = 0; s < arr.length; s++) {
         let ari = arr[s];
         if(typeof(ari.url)==="string"){
            if(ari.url.match(/.+?\/.+[.](jpe?g|jpg|gif|wepb|png|svg|mp\d|avi|flv|rm|pdf|ai)/i)){
            newarr.push(ari)
         } }
      }
   }
   GM_xmlhttpRequest({
      url: EAGLE_IMPORT_API_URLS,
      method: "POST",
      data: JSON.stringify(data),
      onload: function (response) {
         if (response.statusText !== "OK") {
            alert("请检查eagle是否打开！");
            console.log("下载失败！")
         }
      }
   });
}
// 获取文件夹id实际上他会直接创建文件夹
async function getFolderId(Folder_name) {
   let folders = await getFolders();
   let dlFolder;
   if (folders) {
      for (let folder of folders) {
         if (folder.name === Folder_name) {
            dlFolder = folder;
         }
      }
      if (dlFolder === undefined) dlFolder = await creatFolder(Folder_name);
   }
   else {
      console.log("获取文件夹信息失败！");
      alert("下载失败！");
      return;
   }
   return dlFolder.id;
}
// 获取文件夹
function getFolders() {
   return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
         url: EAGLE_GET_FOLDERS_API_URL,
         method: "GET",
         redirect: 'follow',
         onload: function (response) {
            if (response.status !== 200) {
               reject();
            }
            resolve(JSON.parse(response.response).data);
         }
      });
   })
}
// 创建文件夹
function creatFolder(folderName) {
   return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
         url: EAGLE_CREATE_FOLDER_API_URL,
         method: "POST",
         data: JSON.stringify({ folderName: folderName }),
         onload: function (response) {
            var result = JSON.parse(response.response);
            if (result.status === "success" && result.data && result.data.id) {
               return resolve(result.data);
            }
            else {
               return reject();
            }
         }
      })
   })
}
// 数组去重
function Do_not(arr) {
   console.log('---开始数据去重---');
   if (!Array.isArray(arr)) {
      console.log('数据错误!');
      return;
   }
   let res = [arr[0]]
   for (let i = 1; i < arr.length; i++) {
      let flag = true
      for (let j = 0; j < res.length; j++) {
         if (arr[i] === res[j]) {
            flag = false;
            break;
         }
      }
      if (flag) {
         res.push(arr[i]);
      }
   }
   return res;
}
// 解决网页懒加载最简单粗暴的方法翻页翻页的时候创建文件夹
// 因为我懒
function log(a) { console.log(a) }
// 设置一个排序
function MIU_NUM(num, n) {
   return (Array(n).join(0) + num).slice(-n);
}
// 大图解析

// 获取标题
function title(y) {
   let n = document.title;
   if (n.match(/天猫超市/i)) {
      n = n.match(/^(.+)-天猫超市-(?:.+)?/i)[1];
   } else if
      (n.match(/tmall.com/)) {
      n = n.replace(/-tmall.com天猫/i, '');
   } else if (n.match(/-淘宝网/i)) {
      n = n.replace(/-淘宝网/i, '');
   }
   if (y) {
      n = `标题:${title}`
   }
   return n
}
// 获取属性
function Attribute() {
   let mtitle = '该商品没有填写卖点';
   let head = `${tb_ID}的属性表：\n标题:${title()}\n商品卖点:${mtitle}`
   let list = `${head}很抱歉属性表未找到`
   if (document.querySelector('#detail .tb-detail-hd .newp')) {
      mtitle = document.querySelector('#detail .tb-detail-hd .newp').innerText
   } else if (document.querySelector('#J_mod20 .newAttraction')) {
      mtitle = document.querySelector('#J_mod20 .newAttraction').innerText.replace(/^"|"$/g, '');
   }
   if (document.querySelector('#attributes')) {
      list = head + document.querySelector('#attributes').innerText;
   } else if (document.querySelector('#attributes')) {
      list = head + document.querySelector('#attributes').innerText
   }
   return list;
}
// 主图获取
function zhutu() {
   let zt;
   if (tm === 1) {
      zt = document.querySelectorAll('#J_UlThumb img')
   } else if (tm === 1) {
      zt = document.querySelectorAll('#J_UlThumb img')
   } else if (tb === 1) {
      zt = document.querySelectorAll('#J_UlThumb img')
   } else if (m_tm === 1) {
      zt = document.querySelectorAll('.preview-scroller img')
   } else if (m_tb === 1) {
      zt = document.querySelectorAll('.siema-wrapper .siema img')
   } else if (cs === 1) {
      zt = document.querySelectorAll('#J_UlThumb img')
   } else if (_1688 === 1) {
      zt = document.querySelectorAll('#dt-tab img')
   } else if (m1688 === 1) {
      //懒加载太多放弃手机端的1688了
      zt = document.querySelectorAll('#J_Detail_ImageSlides img')
   }
   else {
      log('HM:你好我是HM此脚本的作者当你看到此消息则证明此脚本运行出现严重错误，请联系作者修复');
      log('HM:未找到主图有可能是网页更新了');
   }
   let jn = new Array();
   for (let i of zt) {
      if (i.src) {
         jn.push(MAXimg(i.src))
      }
   }
   //主图命名规则
   function _name() {
      let na_me = [
         "商品主图",
         "主图_02",
         "主图_03",
         "主图_04",
         "主图_05",
         "主图_06",
         "主图_07",
         "主图_08",
         "主图_09",
         "主图_10",
         "主图_11",
         "主图_12",
         "主图_13",
         "主图_14",
         "主图_15",
         "主图_16",
         "主图_17",
         "主图_18",
         "主图_19",
         "主图_20",
         "主图_21",
         "主图_22",
         "主图_23",
         "主图_24",
         "主图_25",
         "主图_26",
         "主图_27",
         "主图_28",
         "主图_29"
      ]
      if (jn.length = 6) {
         na_me = ["商品主图", "主图_02", "主图_03", "主图_04", "主图_05", "长图"];
      }
      if (tb) {
         na_me = ["商品主图", "主图_02", "主图_03", "主图_04", "白底图", "长图"];
      }
      if (jn) {
         if (jn[0].match(/tbvideo\./)) {
            na_me = ["视频封面", "商品主图", "主图_02", "主图_03", "主图_04", "白底图", "长图"];
         }
      } if (_1688 === 1 && m1688 === 1) {
         na_me = [
            "商品主图",
            "主图_02",
            "主图_03",
            "主图_04",
            "主图_05",
            "主图_06",
            "主图_07",
            "主图_08",
            "主图_09",
            "主图_10",
            "主图_11",
            "主图_12",
            "主图_13",
            "主图_14",
            "主图_15",
            "主图_16",
            "主图_17",
            "主图_18",
            "主图_19",
            "主图_20",
            "主图_21",
            "主图_22",
            "主图_23",
            "主图_24",
            "主图_25",
            "主图_26",
            "主图_27",
            "主图_28",
            "主图_29"
         ]
      }
      return na_me;
   }
   //拼接Eagle数组
   let ju = new Array();
   let ji = { "items": ju, "folderId": fold }
   for (let i in jn) {
      ju.push({ url: jn[i], name: (_name()[i]), website: tb_url(), annotation: Attribute(), tags: [tb_ID, "商品主图"], modificationTime: (startTime-i*2+1500) })
   }
   // 后台图片与前台不一样这里有分无线端PC端主图和透明图所以另外写个规则
   // arrPC pc端图片组 arrm 手机端图片组  png 透明图  maximg 长图
   function 未支持(params) {
      if (tmm) {
         let name = {
            arrPC: ["PC主图", "PC主图_02", "PC主图_03", "PC主图_04", "PC主图_05"],
            arrm: ["手机主图", "手机主图_02", "手机主图_03", "手机主图_04", "手机主图_05"],
            png: "透明图",
            maximg: "商品长图"
         }
         // 天猫描述页
         let arrPC = document.querySelectorAll('#struct-images img');
         let arrm = document.querySelectorAll('#struct-tmWirelessImages .image-wrap img');
         let png = document.querySelector('#struct-whiteBgImage .tmall-o-image-preview  img')
         let maximg = document.querySelector('#struct-verticalImage img')

      } else if (tmup) {
         let name = {
            arrPC: ["PC主图", "PC主图_02", "PC主图_03", "PC主图_04", "PC主图_05"],
            arrm: ["手机主图", "手机主图_02", "手机主图_03", "手机主图_04", "手机主图_05"],
            png: "透明图",
            maximg: "商品长图",
            _34: ["3-4主图_01", "3-4主图_02", "3-4主图_03", "3-4主图_04", "3-4主图_05", "3-4主图_06",]
         }
         // 天猫标准商家后台
         let arrPC = document.querySelectorAll('#struct-images img');
         let arrm = document.querySelectorAll('#struct-tmWirelessImages .image-wrap img');
         let png = document.querySelector('#struct-whiteBgImage .tmall-o-image-preview  img')
         let maximg = document.querySelector('#struct-verticalImage img')
         let _34 = document.querySelectorAll('#struct-threeToFourImages img')
      } else if (tbup) {
         // 淘宝后台
         let name = {
            arrPC: ["商品主图", "主图_02", "主图_03", "主图_04", "白底图"],
            maximg: "商品长图",
            _34: ["3-4主图_01", "3-4主图_02", "3-4主图_03", "3-4主图_04", "3-4主图_05", "3-4主图_06",]
         }
         let arrPC = document.querySelectorAll('#struct-images img');
         let maximg = document.querySelector('#struct-verticalImage img')
         let _34 = document.querySelectorAll("#struct-threeToFourImages img")

      }
   }
   return ji;
}
// 详情页获取
function Details() {
   let img = [];
   if(tm===1){
   if (document.querySelector('#description img')) {
      //天猫PC
      img = document.querySelectorAll('#description img')
   }} else if (tb===1){ if (document.querySelector('#J_DivItemDesc img')) {
      //淘宝PC
      img = document.querySelectorAll('#description img')
   } }else if (m_tm===1) {if (document.querySelector('#modules-desc img')) {
      //天猫移动端
      img = document.querySelectorAll('#modules-desc img')
   }} else if(m_tb===1){if (document.querySelector('#detail img')) {
      //淘宝移动端 事情最多的网页
      img = document.querySelectorAll('#detail img')
   }} else if(m1688===1){if (document.querySelector('#J_WapDetailCommonDescription_Content img')) {
      //1688移动端，我挺好奇这id为啥这么丧心病狂的长
      img = document.querySelectorAll('#J_WapDetailCommonDescription_Content img')
   }} else if(_1688===1){if(document.querySelector('#de-description-detail img')){
      // 1688pc端
      img = document.querySelectorAll('#de-description-detail img')
   }} else if(cs===1){
      // 天猫超市
      img = document.querySelectorAll('#description img')
   }
   //还有几个端还没写 天猫后台淘宝后台
   let text = "详情页没有找到文本";
   if (document.querySelector('#description')) {
      //天猫PC 天猫超市也一样
      text = document.querySelector('#description').innerText
   } else if (document.querySelector('#J_DivItemDesc')) {
      //淘宝PC
      text = document.querySelector('#J_DivItemDesc').innerText
   } else if (document.querySelector('#modules-desc')) {
      //天猫移动端
      text = document.querySelector('#modules-desc').innerText
   } else if (document.querySelector('#detail')) {
      //淘宝移动端 事情最多的网页
      text = document.querySelector('#detail').innerText
   } else if (document.querySelector('#J_WapDetailCommonDescription_Content')) {
      //1688移动端
      text = document.querySelector('#J_WapDetailCommonDescription_Content').innerText
   } else if (document.querySelector('#de-description-detail')) {
      text = document.querySelector('#de-description-detail').innerText
   }
   if (text === "" && text.replace(/[\s\n\r]+/, '') === "") { text = "详情页没有找到文本" }
   //还有几个端还没写 天猫后台淘宝后台
   let imgurl = new Array();
   for (let url of img) {
      let src = url.dataset.src || url.dataset.ksLazyload || url.src;
      if (!src) {
         if (url.innerHTML.match(/(\/\/img.+?com.+?[.](?:jpe?g|png|webp|gif))/)) {
            src = url.innerHTML.match(/(\/\/img.+?com.+?[.](?:jpe?g|png|webp|gif))/)[1]
         }else if(url.outerHTML.match(/(\/\/img.+?com.+?[.](?:jpe?g|png|webp|gif))/)){
            src =  url.outerHTML.match(/\/\/.+?(?:com|cn|xyz|top).+[.](?:jpe?g|png|webp|gif)/)
         }
      }

      if (src) {
         // 默认的懒加载图片
         if (!src.match(/img-tmdetail.alicdn.com\/tps\/i3\/T1BYd_XwFcXXb9RTPq-90-90.png/)
            && !src.match(/spaceball.gif/)
            && !src.match(/CUdsY9YBuNjy0FgXXcxcXXa-1572-394.png/)
            && !src.match(/T10B2IXb4cXXcHmcPq-85-85.gif/)
            && !src.match(/wAAACH5BAUAAAAALAAAAAACAAEAAAICBAoAOw/)
            && !src.match(/TB1k9XsQpXXXXXLXpXXXXXXXXXX-750-368.png/)
            && !src.match(/TB1AHXiGXXXXXXAXVXX.uTD.FXX-10-10.png/)
            && !src.match(/TB1oOXFXDM11u4jSZPxSuuhcXXa.jpg/)
         ) {
            imgurl.push(MAXimg(src))
         }
      }
   }
   let ju = new Array();
   let ji = { "items": ju, "folderId": fold }
   for (let i = 0; i < imgurl.length; i++) {
      ju.push({ url: imgurl[i], name: `详情页_${MIU_NUM((i * 1 + 1), 2)}`, website: tb_url(), annotation: text, tags: [tb_ID, "详情页"], modificationTime: ((startTime-i*2-2800)) })
   }
   return ji;
}
// 获取SKU
function SKU() {
  // 获取点击才能显示的SKU
  let noimagesSKU = () => {
     let HM_GETvalItemInfo=()=>{
        let dom=document.querySelectorAll('script');
        for(let x=0;x<dom.length;x++){
        if(dom[x].innerHTML&&dom[x].innerHTML.match('valItemInfo')&&dom[x].innerHTML.match(/"valItemInfo"(.{1,6})?:/)){
        let i=dom[x].innerHTML.match(/\{"valItemInfo".+"\}/);
        return JSON.parse(i)
        }
        }};


        let n=[];
        let valItem=HM_GETvalItemInfo();
        let i=-1;
        let s=Date.now();
        document.querySelectorAll("#J_DetailMeta .tm-img-prop [data-value]").forEach(value=>{
        n.push(
           {
              url:document.location.protocol+valItem.propertyPics[`;${value['dataset']?value['dataset']['value']:null};`][0],
              name:value.querySelector(".tb-txt,.tb-img a span").innerText.replace(/\n?已选中$/, ''),ID:value['dataset']?value['dataset']['value']:null,
              website:tb_url(),
              tags: value.style.display==="none"?[tb_ID, "SKU","无货的SKU"]:[tb_ID, "SKU"],
              getSORT:i+=1,
              type:value.style.display==="none"?false:true,
              modificationTime:s+(i.getSORT * 50)
           })}
        )
        let ji = { "items": n, "folderId": typeof fold !=="undefined"?fold:null }

        return ji
  }
  let nullsku = null
  let sku = [{ url: '', name: '' }];
  if (tm === 1) {
     if (document.querySelector('#J_DetailMeta .tb-img  li')) {
        //天猫的SKU
        let img = document.querySelectorAll('#J_DetailMeta .tb-img  li');
        let json = [];
        for (let sd = 0; sd < img.length; sd++) {
           const l = img[sd];
           let s = () => {
              //  console.log('s',l)
              if (l.style.display === "none") return false;
              return true;
           }
           let sdf = s();
           if (l.innerHTML.replace(/[\r\n\s\t ]/img, '').match(/\/\/.+?(?:jpe?g|png|gif|wepb)/)) {
              let _name = l.innerText.replace(/\n?已选中$/, '').replace(/[\n]+/img, '').replace(/([\t\s ])+/img, '$1');
              let url = l.innerHTML.replace(/[\r\n\s\t ]/img, '').match(/\/\/.+?(?:jpe?g|png|gif|wepb)/)[0];
              json.push({ url: MAXimg(url), name: _name, type: sdf, getSORT: sd })
              sdf = null;
           }
        }
        sku = json
        //   try {
        //    if(sku[0].url.match(/^https:\/\/img/)) sku=noimagesSKU();
        //   } catch (error) {

        //   }
        console.log(sku);
     }
  } else if (tb === 1) {
     if (document.querySelector('#J_isku .tb-img li')) {
        //淘宝网的SKU
        let json = [];
        let img = document.querySelectorAll('#J_isku .tb-img li');
        for (let sd = 0; sd < img.length; sd++) {
           const l = img[sd];
           let s = () => {
              if (l.style.display === "none") return false;
              return true;
           }
           let sdf = s();
           if (l.innerHTML.replace(/[\r\n\s\t ]/img, '').match(/\/\/.+?(?:jpe?g|png|gif|wepb)/)) {
              let _name = l.querySelector('span').innerText.replace(/[\n]+/img, '').replace(/([\t\s ])+/img, '$1');
              let url = l.innerHTML.replace(/[\r\n\s\t ]/img, '').match(/\/\/.+?(?:jpe?g|png|gif|wepb)/)[0];
              json.push({ url: MAXimg(url), name: _name, type: sdf, getSORT: sd })
              sdf = null;
           }
        }
        sku = json
     }
  } else if (m_tm === 1) {
     //手机天猫的SKU
     if (document.querySelector("#s-actionBar-container .trade .buy")) {
        document.querySelector("#s-actionBar-container .trade .buy").click()
        setTimeout(function () {
           if (document.querySelector('.sku-list-wrap .items a .prop-img')) {

              for (let i of document.querySelectorAll('.sku-list-wrap .items a')) {
                 if (i.querySelector('.prop-img')) {
                    let url = i.querySelector('.prop-img').src;
                    let name = i.innerText.replace(/[\n]+/img, '').replace(/([\t\s ])+/img, '$1');
                    sku.push({ url: MAXimg(url), name: name })
                 }
              }

           }
        }, 200);
     }
  } else if (m_tb === 1) {
     log('SKU：该网站千变万化正在寻找更好方式')
  } else if (_1688 === 1) {
     ; if (document.querySelector("#mod-detail-bd > div.region-custom.region-detail-property.region-takla.ui-sortable.region-vertical > div.widget-custom.offerdetail_ditto_purchasing > div > div > div > div.obj-sku > div.obj-expand > a > i > em")) {
        document.querySelector("#mod-detail-bd > div.region-custom.region-detail-property.region-takla.ui-sortable.region-vertical > div.widget-custom.offerdetail_ditto_purchasing > div > div > div > div.obj-sku > div.obj-expand > a > i > em").click()
     }
     if (
        document.querySelector('#mod-detail-bd .list-leading li ')) {
        let arr = document.querySelectorAll('#mod-detail-bd .list-leading li');
        let ar = [];
        if (document.querySelectorAll('#mod-detail-bd .list-leading li a')) {
           for (let i = 0; i < arr.length; i++) {
              if (arr[i].querySelector('a')) {
                 let o = arr[i].querySelector('a');
                 if (arr[i].querySelector('a .vertical-img-title')) {
                    let name = o.querySelector('.vertical-img-title').innerText.replace(/[\n]+/img, '').replace(/([\t\s ])+/img, '$1');
                    let img = o.querySelector('img').src;
                    ar.push({ url: MAXimg(img), name: name });
                 }
              }

           } sku = ar;
        }
     } else if (document.querySelectorAll('#mod-detail-bd  .table-sku  ')) {
        let arr = document.querySelectorAll('#mod-detail-bd  .table-sku tr ');
        let ar = [];
        for (let i = 0; i < arr.length; i++) {
           let name = arr[i].querySelector('span').title;
           let img = arr[i].querySelector('img').src;
           ar.push({ url: MAXimg(img), name: name });
        } sku = ar;
     }
  } else if (m1688 === 1) {
     log('该网站千变万化正在寻找更好方式')
  } else {
     log('很抱歉找不到SKU图片')
  }
  let ju = [];
  let ji = { "items": ju, "folderId": fold }
  let n = 0;

  for (let x = 0; x < sku.length; x++) {
     let i = sku[x];
     let data = { url: i.url, name: i.name, website: tb_url(), tags: [tb_ID, "SKU"], getSORT: i.getSORT, type: i.type, modificationTime: (((startTime + (i.getSORT * 50)))) };
     if (i.type === false) data.tags.push('无货的SKU');
     ju.push(data);
     n + 1;
  }
  try {
     if (ji.items[0].url) {
        return ji;
     }
  } catch (error) {
     try {
        return noimagesSKU();

     } catch (error) {
        return
     }
  }

}
// 获取视频
function Video() {
   let url = '';
   if (tm === 1 ) {
      // 天猫主图视频
      if (document.querySelector('#J_DetailMeta .lib-video ')) {
         // 网页元素法优先
         if (document.querySelector('#J_DetailMeta .lib-video ').innerHTML.match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)) {
            url = document.querySelector('#J_DetailMeta .lib-video ').innerHTML.match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)[0]
         }
         //找不到网页元素的链接使用枚举法拼接链接
         if (!url) {
            let script = document.querySelectorAll('script');
            let ID_img = '';
            let user_id = '';
            for (let i of script) {
               if (i.innerText) {
                  if (i.innerText.match(/"imgVedioID":"(\d+)"/)) {
                     ID_img = i.innerText.match(/"imgVedioID":"(\d+)"/)[1]
                  }
                  if (i.innerText.match(/"userId":"(\d+)"/)) {
                     user_id = i.innerText.match(/"userId":"(\d+)"/)[1]
                  }
                  if (ID_img || user_id) {
                     url = `https://cloud.video.taobao.com/play/u/${user_id}/p/1/e/6/t/1/${ID_img}.mp4`;
                     break;
                  }
               }
            }

         }

      }
   }
   else if (cs === 1 ) {
      // 天猫主图视频
      if (document.querySelector('#J_DetailMeta .lib-video ')) {
         // 网页元素法优先
         if (document.querySelector('#J_DetailMeta .lib-video ').innerHTML.match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)) {
            url = document.querySelector('#J_DetailMeta .lib-video ').innerHTML.match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)[0]
         }
         //找不到网页元素的链接使用枚举法拼接链接
         if (!url) {
            let script = document.querySelectorAll('script');
            let ID_img = '';
            let user_id = '';
            for (let i of script) {
               if (i.innerText) {
                  if (i.innerText.match(/"imgVedioID":"(\d+)"/)) {
                     ID_img = i.innerText.match(/"imgVedioID":"(\d+)"/)[1]
                  }
                  if (i.innerText.match(/"userId":"(\d+)"/)) {
                     user_id = i.innerText.match(/"userId":"(\d+)"/)[1]
                  }
                  if (ID_img || user_id) {
                     url = `https://cloud.video.taobao.com/play/u/${user_id}/p/1/e/6/t/1/${ID_img}.mp4`;
                     break;
                  }
               }
            }

         }

      }
   }else
   if (m_tm === 1) {
      if (document.querySelector('#content .item-video ')) {
         if (document.querySelector('#content  ').innerHTML.match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)) {
            url = document.querySelector('#content  ').innerHTML.match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)[0];
         }
         if (!url) {
            for (let i of script) {
               if (i.innerText.match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)) {
                  url = i.innerText.match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)[0];
                  if (url) {
                     break;
                  }
               }
            }
         }
      }
   }else
   if (tb === 1) {
      let script = document.querySelectorAll('script');
      let ID_img = '';
      let user_id = '';
      if (document.querySelector('meta[name="microscope-data"]')) {
         user_id = document.querySelector('meta[name="microscope-data"]').content.match(/userid=(\d+);/)[1]
      }
      if (user_id) {
         for (let i of script) {
            if (i.innerText) {
               if (i.innerText.match(/"videoId":"(\d+)"/)) {
                  ID_img = i.innerText.match(/"videoId":"(\d+)"/)[1];
                  url = `https://cloud.video.taobao.com/play/u/${user_id}/p/1/e/6/t/1/${ID_img}.mp4`;
                  break;
               }
            }
         }
      }
   }else
   if (m_tb === 1) {
      log('手机端的淘宝暂时不支持主图视频获取')
   }else
   if (_1688 === 1) {
      if (document.querySelector('#detail-main-video-content .lib-video ')) {
         if (document.querySelector('#detail-main-video-content .lib-video ').innerHTML.match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)) {
            url = document.querySelector('#detail-main-video-content .lib-video ').innerHTML.match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)[0]
         }
      }
   }else
   if (m1688 === 1) {
      let i = document.querySelector('#widget-wap-detail-common-image .video-tag')
      if (i) {
         if (i.innerHTML) {
            if (i.innerHTML.match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)) { url = i.innerHTML.match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)[0] }
         }
      }
   }
   let ji = { "items": [{ url: url, name: "主图视频", website: tb_url(), tags: [tb_ID, "主图视频"], modificationTime: startTime }], "folderId": fold }
   return ji;
}
// 获取详情页上的视频（只返回链接）
function Details_Video() {
   let url = '';
   if (tm === 1 && cs === 1) {
      if (document.querySelector('#page #item-flash ')) {
         if (document.querySelector('#page #item-flash .lib-video  source ')) {
            url = document.querySelector('#page #item-flash .lib-video  source ').src;
         }
      }
   } else if (tb === 1) {
      //没找到相关链接
   } else if (m_tm === 1) {
      if (document.querySelector('#modules-desc .item a')) {
         url = document.querySelector('#modules-desc .item a').href;
      }
   }
   let ju = new Array();
   let ji = { "items": ju, "folderId": fold }
   ju.push({ url: url, name: "详情页视频", website: tb_url(), tags: [tb_ID, "详情视频"], modificationTime: startTime })
   if (ji.items[0].url) {
      return ji;
   }
}



})();

/**这个是用于弹窗的库 没必要使用未压缩文本*/
/**
* gitee地址:https://gitee.com/jesseqin/JavaScript_base
*/
;(function(root,Msg){
if(typeof exports === 'object' && typeof module !== 'undefined'){
    module.exports = Msg
}else if(typeof define === 'function' && define.amd){
    define([],function () {
        return Msg(root);
    });
}else{
    root.Qmsg = Msg(root);
}
})(this,function(global){
'use srtict';

//assign 兼容处理
if (typeof Object.assign != 'function') {
    Object.assign = function(target) {
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source != null) {
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
            }
        }
        }
    }
    return target;
 }
};

// 'classList' 兼容处理
var isClsList = 'classList' in HTMLElement.prototype;
if(!isClsList) {
    Object.defineProperty(HTMLElement.prototype,'classList',{
        get:function(){
            // add, remove ,contains,toggle
            // this  - >
            var _self = this;
            return {
                add:function(cls){
                    if(!this.contains(cls)){
                        _self.className +=' ' + cls;
                    }
                },
                remove:function(cls){
                    if(this.contains(cls)){
                        var reg= new RegExp(cls);
                        _self.className =  _self.className.replace(reg,'');
                    }
                },
                contains:function(cls){
                var index =  _self.className.indexOf(cls);
                    return  index!=-1 ? true : false;
                },
                toggle:function(cls){
                    if(this.contains(cls)){
                        this.remove(cls)
                    } else {
                        this.add(cls)
                    }
                }
            }
        }
    })
}

/**
 * 声明插件名称
 */
var PLUGIN_NAME = "qmsg";

/**
 * 命名空间 用于css和事件
 */
var NAMESPACE = global && global.QMSG_GLOBALS && global.QMSG_GLOBALS.NAMESPACE || PLUGIN_NAME;

/**
 * 状态 & 动画
 * 显示中，显示完成，关闭中
 */
var STATES = {
    opening : 'MessageMoveIn',
    done : '',
    closing : 'MessageMoveOut'
}

/**
 * 全局默认配置
 * 可在引入js之前通过QMSG_GLOBALS.DEFAULTS进行配置
 * position {String} 位置，仅支持'center','right','left',默认'center'
 * type {String} 类型，支持'info','warning','success','error','loading'
 * showClose {Boolean} 是否显示关闭图标，默认为false不显示
 * timeout {Number} 多久后自动关闭，单位ms,默认2500
 * autoClose {Boolean} 是否自动关闭，默认true,注意在type为loading的时候自动关闭为false
 * content {String} 提示的内容
 * onClose {Function} 关闭的回调函数
 */
var DEFAULTS = Object.assign({
    position:'center',
    type:"info",
    showClose:false,
    timeout:2500,
    animation:true,
    autoClose:true,
    content:"",
    onClose:null,
    maxNums:5,
    html:false
},global && global.QMSG_GLOBALS && global.QMSG_GLOBALS.DEFAULTS)

 /**
 * 设置icon html代码
 */
var ICONS = {
    info:'<svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" fill-opacity="0.01"/><path d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z" fill="#1890ff" stroke="#1890ff" stroke-width="4" stroke-linejoin="round"/><path fill-rule="evenodd" clip-rule="evenodd" d="M24 11C25.3807 11 26.5 12.1193 26.5 13.5C26.5 14.8807 25.3807 16 24 16C22.6193 16 21.5 14.8807 21.5 13.5C21.5 12.1193 22.6193 11 24 11Z" fill="#FFF"/><path d="M24.5 34V20H23.5H22.5" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 34H28" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    warning:'<svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" fill-opacity="0.01"/><path d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z" fill="#faad14" stroke="#faad14" stroke-width="4" stroke-linejoin="round"/><path fill-rule="evenodd" clip-rule="evenodd" d="M24 37C25.3807 37 26.5 35.8807 26.5 34.5C26.5 33.1193 25.3807 32 24 32C22.6193 32 21.5 33.1193 21.5 34.5C21.5 35.8807 22.6193 37 24 37Z" fill="#FFF"/><path d="M24 12V28" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error:'<svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" fill-opacity="0.01"/><path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#f5222d" stroke="#f5222d" stroke-width="4" stroke-linejoin="round"/><path d="M29.6569 18.3431L18.3432 29.6568" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.3432 18.3431L29.6569 29.6568" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    success:'<svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" fill-opacity="0.01"/><path d="M24 4L29.2533 7.83204L35.7557 7.81966L37.7533 14.0077L43.0211 17.8197L41 24L43.0211 30.1803L37.7533 33.9923L35.7557 40.1803L29.2533 40.168L24 44L18.7467 40.168L12.2443 40.1803L10.2467 33.9923L4.97887 30.1803L7 24L4.97887 17.8197L10.2467 14.0077L12.2443 7.81966L18.7467 7.83204L24 4Z" fill="#52c41a" stroke="#52c41a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 24L22 29L32 19" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    loading:'<svg class="animate-turn" width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" fill-opacity="0.01"/><path d="M4 24C4 35.0457 12.9543 44 24 44V44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4" stroke="#1890ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M36 24C36 17.3726 30.6274 12 24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36V36" stroke="#1890ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close:'<svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" fill-opacity="0.01"/><path d="M14 14L34 34" stroke="#909399" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 34L34 14" stroke="#909399" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}

 /**
 * 是否支持动画属性
 * @type {Boolean}
 */
var CAN_ANIMATION = (function() {
    var style = document.createElement('div').style;
    return style.animationName !== undefined ||
      style.WebkitAnimationName !== undefined ||
      style.MozAnimationName !== undefined ||
      style.msAnimationName !== undefined ||
      style.OAnimationName !== undefined;
})();

/**
 * 生成带插件名的名称
 * @param {...String}
 * @returns {String}
 */
function namespacify(){
    var res = NAMESPACE;
    for(var i = 0; i < arguments.length; ++i){
        res += '-' + arguments[i];
    }
    return res;
}

/**
 * 每条消息的构造函数
 * @param {Objetc} opts 配置参数，参考DEFAULTS
 */
function Msg(opts){
    var oMsg = this;
    oMsg.settings = Object.assign({},DEFAULTS,opts||{});
    oMsg.id = Qmsg.instanceCount;
    var timeout = oMsg.settings.timeout;
    timeout = timeout && parseInt(timeout>=0) & parseInt(timeout)<=Math.NEGATIVE_INFINITY ?parseInt(timeout):DEFAULTS.timeout;
    oMsg.timeout = timeout;
    oMsg.settings.timeout = timeout;
    oMsg.timer = null;
    var $elem = document.createElement("div");
    var $svg = ICONS[oMsg.settings.type || 'info'];
    var contentClassName = namespacify("content-"+oMsg.settings.type || 'info');
    contentClassName +=oMsg.settings.showClose ?' '+ namespacify('content-with-close'):''
    var content = oMsg.settings.content || '';
    var $closeSvg = ICONS['close'];
    var $closeIcon = oMsg.settings.showClose ? '<i class="qmsg-icon qmsg-icon-close">'+$closeSvg+'</i>':'';
    var $span = document.createElement("span");
    if(oMsg.settings.html){
        $span.innerHTML = content;
    }else{
        $span.innerText = content;
    }
    $elem.innerHTML = '<div class="qmsg-content">\
        <div class="'+contentClassName+'">\
            <i class="qmsg-icon">'+$svg+'</i>'+$span.outerHTML + $closeIcon +
            '</div>\
    </div>';

    $elem.classList.add(namespacify('item'));
    $elem.style.textAlign = oMsg.settings.position;
    var $wrapper = document.querySelector('.'+NAMESPACE);
    if(!$wrapper){
        $wrapper =  document.createElement("div");
        $wrapper.classList.add(NAMESPACE,namespacify('wrapper'),namespacify('is-initialized'));
        document.body.appendChild($wrapper);
    }
    $wrapper.appendChild($elem);
    oMsg.$wrapper = $wrapper;
    oMsg.$elem = $elem;
    setState(oMsg,'opening');
    if(oMsg.settings.showClose){ //关闭按钮绑定点击事件
        $elem.querySelector(".qmsg-icon-close").addEventListener('click',function(){
            oMsg.close();
        }.bind($elem))
    }
    $elem.addEventListener("animationend", function(e) {   // 监听动画完成
        var target = e.target,animationName = e.animationName;
        if(animationName == STATES['closing']){
            clearInterval(this.timer);
            this.destroy();
        }
        target.style.animationName = '';
        target.style.webkitAnimationName = '';
    }.bind(oMsg))
    if(oMsg.settings.autoClose){ // 自动关闭
        var intvMs = 10; // 定时器频率
        oMsg.timer = setInterval(function(){
            this.timeout -= intvMs;
            if(this.timeout <= 0){
                clearInterval(this.timer)
                this.close();
            }
        }.bind(oMsg),intvMs);
        oMsg.$elem.addEventListener('mouseover',function(){
            clearInterval(this.timer)
        }.bind(oMsg))
        oMsg.$elem.addEventListener('mouseout',function(){
            if(this.state!='closing'){ // 状态为关闭则不重启定时器
                this.timer = setInterval(function(){
                    this.timeout -= intvMs;
                    if(this.timeout <= 0){
                        clearInterval(this.timer);
                        this.close();
                    }
                }.bind(oMsg),intvMs);
            }
        }.bind(oMsg))
    }
}

function setState(inst,state){
    if(!state || !STATES[state]) return;
    inst.state = state;
    inst.$elem.style.animationName = STATES[state];
}

/**
 * 直接销毁元素，不会触发关闭回调函数
 */
Msg.prototype.destroy = function(){
    this.$elem.parentNode && this.$elem.parentNode.removeChild(this.$elem);
    clearInterval(this.timer);
    Qmsg.remove(this.id);
}
/**
 * 关闭，支持动画则会触发动画事件
 */
Msg.prototype.close = function(){
    setState(this,'closing');
    if(!CAN_ANIMATION){ // 不支持动画
        this.destroy();
    }else{
        Qmsg.remove(this.id);
    }
    var callback = this.settings.onClose;
    if(callback && callback instanceof Function){
        callback.call(this);
    }
}

/**
 * 设置消息数量统计
 * @private
 */
function setMsgCount(oMsg){
    var countClassName = namespacify('count');
    var $content = oMsg.$elem.querySelector("."+namespacify('content')),
    $count = $content.querySelector('.'+countClassName);
    if(!$count){
        $count = document.createElement("span");
        $count.classList.add(countClassName);
        $content.appendChild($count);
    }
    $count.innerHTML = oMsg.count;
    $count.style.animationName = "";
    $count.style.animationName = "MessageShake";
    oMsg.timeout = oMsg.settings.timeout || DEFAULTS.timeout;
}

/**
 * 合并参数为配置信息，用于创建Msg实例
 * @param {String} txt 文本内容
 * @param {Object} config 配置
 * @private
 */
function mergeArgs(txt,config){
    var opts = Object.assign({},DEFAULTS);
    if(arguments.length===0){
        return opts;
    }
    if(txt instanceof Object){
        return Object.assign(opts,txt);
    }else{
        opts.content = txt.toString();
    }
    if(config instanceof Object){
        return Object.assign(opts,config)
    }
    return opts;
}

/**
 * 通过配置信息 来判断是否为同一条消息,并返回消息实例
 * @param {Object} params 配置项
 * @private
 */
function judgeReMsg(params){
    params = params || {};
    var opt = JSON.stringify(params)
    var oInx = -1;
    var oMsg ;
    for(var i in this.oMsgs){
        var oMsgItem = this.oMsgs[i];
        if(oMsgItem.config == opt) {
            oInx = i;
            oMsg = oMsgItem.inst;
            break;
        }
    }
    if(oInx < 0){
        this.instanceCount ++;
        var oItem = {};
        oItem.id = this.instanceCount;
        oItem.config = opt;
        oMsg = new Msg(params);
        oMsg.id = this.instanceCount;
        oMsg.count = '';
        oItem.inst = oMsg;
        this.oMsgs[this.instanceCount] = oItem;
        var len = this.oMsgs.length;
        var maxNums = this.maxNums;
        /**
         * 关闭多余的消息
        */
        if(len > maxNums){
            var oIndex = 0;
            var oMsgs = this.oMsgs;
            for(oIndex;oIndex<len-maxNums;oIndex++){
                oMsgs[oIndex] && oMsgs[oIndex].inst.settings.autoClose && oMsgs[oIndex].inst.close();
            }
        }
    }else{
        oMsg.count = !oMsg.count ? 2 : oMsg.count>=99 ? oMsg.count : oMsg.count+1;
        setMsgCount(oMsg);
    }
    oMsg.$elem.setAttribute("data-count",oMsg.count);
    return oMsg;
}


var Qmsg = {
    version:'0.0.1',
    instanceCount:0,
    oMsgs:[],
    maxNums:DEFAULTS.maxNums || 5,
    config:function(cfg){
        DEFAULTS = cfg && cfg instanceof Object ? Object.assign(DEFAULTS,cfg):DEFAULTS;
        this.maxNums = DEFAULTS.maxNums && DEFAULTS.maxNums > 0 ? parseInt(DEFAULTS.maxNums) : 3;
    },
    info:function(txt,config){
        var params = mergeArgs(txt,config);
        params.type = 'info';
       return judgeReMsg.call(this,params);
    },
    warning:function(txt,config){
        var params = mergeArgs(txt,config);
        params.type = 'warning';
       return judgeReMsg.call(this,params);
    },
    success:function(txt,config){
        var params = mergeArgs(txt,config);
        params.type = 'success';
       return judgeReMsg.call(this,params);
    },
    error:function(txt,config){
        var params = mergeArgs(txt,config);
        params.type = 'error';
       return judgeReMsg.call(this,params);
    },
    loading:function(txt,config){
        var params = mergeArgs(txt,config);
        params.type = 'loading';
        params.autoClose = false;
       return judgeReMsg.call(this,params);
    },
    remove:function(id){
        this.oMsgs[id] && delete this.oMsgs[id];
    },
    closeAll:function(){
        for(var i in this.oMsgs){
            this.oMsgs[i] && this.oMsgs[i].inst.close();
        }
    }
}

return Qmsg;
})
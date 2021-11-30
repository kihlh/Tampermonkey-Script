// ==UserScript==
// @name                生意参谋访客下载
// @author              黄逗酱酱
// @icon                https://kiic.oss-cn-beijing.aliyuncs.com/HMicc.png
// @match               *sycm.taobao.com/ipoll/visitor*
// @namespace 	        黄逗酱酱
// @description         生意参谋实时访客下载，方便运营对自己的店铺的商品进行分析和收集支持一次性下载50页和单页下载包含商品id，图片等信息，请勿用于其他用途
// @note                v2.0.0 2021-01-21 功能增加了 一次性下载所有页面，UI化了本脚本，增加了一键复制的功能，更加良好的交互界面版本更新到2.0（革命性升级）
// @note                v2.0.1 2021-01-22 修复了无法一次性下载所有数据的BUG
// @note                v2.1.0 2021-01-23 支持提前结束下载全部功能，功能基本完结 下次更新只会是解决重大bug或者重大功能更新，看着密密麻麻的代码头就疼，肝了这么多天肝完了
// @note                v2.1.2 2021-04-17 紧急修复全部功能
// @note                v2.1.2.1 2021-04-18 修复不显示入店来源
// @connect             *
// @date                01/27/2021
// @require             https://cdn.bootcdn.net/ajax/libs/keypress/2.1.5/keypress.min.js
// @require             https://cdn.jsdelivr.net/npm/file-saver@1.3.8/FileSaver.min.js
// @require             https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant               GM_setClipboard
// @version             2.1.2
// @description         zh-cn
// @run-at              document-body
// @license             MPL-2.0
// @namespace           https://greasyfork.org/users/710095
// ==/UserScript==

/**创建一个显示按钮，源码参考自@头号否 ID=39238  许可协议GPL-3.0-only本脚本变更许可协议MPL-2.0
 * ***外部库引用声明***
 * *作者引用的js库均为各大公司cdn 静态资源公共库，感谢：字节跳动，新浪网，bootcdn
 * 用户许可协议：版权声明：本脚本只作为卖家进行本店内数据查看，请尊重网页的robots（https://sycm.taobao.com/robots.txt）文件内的抓取声明在本脚本发布时间内所检索的内容为同意访问
*/
;

( async function(){
   let dasfsagdshsgag=null;

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }
var MIU_NUMX =1;
var HM_get_;
/**表单头：*日期	访问时间	商品缩略图	商品ID/来源	搜索来源	关键词	标题	IP地址	访客编号	商品主图	商品链接	访客唯一编号 */
var Table_title = ['日期,访问时间,商品缩略图,商品ID/来源,搜索来源,关键词,标题,IP地址,访客编号,商品主图,商品链接,访客唯一编号\n'];
function HM_go() {
	var alicmz = '<div id="onii_alicmz"></div>';
	var getbody = document.getElementsByTagName('body')[0];
	getbody.insertAdjacentHTML('afterbegin', alicmz);
	var style = document.createElement('style');
	style.type = 'text/css';
	var inn_ocss = `#onii_alicmz,.aliwx {
      position: fixed;  top: 5%;  right: 50px;  padding: 10px;  min-width: 130px;  text-align: center;  z-index: 999999999999999;  background: #fff;  border-radius: 15px;  border: 1px solid #1a7cda;}
      .alicmzbtn {  background-color: #1a7cda;  color: #ffffff;  border: 0px solid #f0cab6;  right: 20em;  top: 40em;  z-index: 88;  cursor: pointer;  padding: 5px 20px;  border-radius: 50px;  margin-bottom: 10px;  transition: 0.3s;}
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
	  `;
	style.innerHTML = inn_ocss;
	document.getElementsByTagName('HEAD').item(0).appendChild(style);
	//定义一个全局弹出层

	//创建一个显示按钮
	function aliwxframe() {
		var getkj = document.getElementById("onii_alicmz");
		getkj.innerHTML = `<div id="innbe_xg" class= "alicmzbtn" >开启自动下载</div>
    <div id="thwx" class= "alicmzbtn" >下载本页</div>
	<div id="innbe_xf" class= "alicmzbtn" >下载全部</div>
	<div id="copy_thwx" class= "alicmzbtn" >复制本页</div>
	`;
		document.body.appendChild(getkj);
	}
	aliwxframe();

	var gbxf = '<div id="gbxf" onclick="hidexf();" title="点击隐藏">—</div>';
	var xfkj = document.getElementById('onii_alicmz');
	xfkj.insertAdjacentHTML('afterbegin', gbxf);

	var hdxf = document.getElementById('gbxf');
	hdxf.addEventListener('click', hidexf, false);

	var  omatic_dow= document.getElementById('innbe_xg');
	omatic_dow.addEventListener('click', Automatic_download, false);

	var  d_HM_CSV_At_p= document.getElementById('thwx');
	d_HM_CSV_At_p.addEventListener('click', download_HM_CSV_At_present, false);

	var  HM_HY_= document.getElementById('innbe_xf');
	HM_HY_.addEventListener('click', HM_HY_ALLgo, false);

	var  copy_JHM= document.getElementById('copy_thwx');
	copy_JHM.addEventListener('click', copy_thwxNN, false);

	var smallxf = '<div id="smallxf" style="display:none;" onclick="showcmz();" title="点击恢复"><img src="https://kiic.oss-cn-beijing.aliyuncs.com/imag/sy_cm_icc.svg" class="smlogo"></div>';
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
}

HM_go();
   // 大图解析
   function MAXimg(url) {
	return url
	   .replace(/_[.]webp/img, '')    //_.webp
	   .replace(/_\d+x\d+[.](je?pg|png|gif|wepb)/img, '')  //_pic.jpg_60x60.jpg
	   .replace(/_\d+x\d+[a-z]\d+[.](je?pg|png|gif|wepb)/img, '') //.jpg_60x60q90.jpg
	   .replace(/https?:/img, '') //移除所有连接的协议头无论有没有
	   .replace(/(\\\\+|\/\/+)?img\.alicdn\.com\/tps\/[a-z]\d\/T10B2IXb4cXXcHmcPq(-\d+-\d+[.]gif)?/img, '') //详情页默认的gif防盗
	   .replace(/(\\\\+|\/\/+)?img\.alicdn\.com.{1,12}\/spaceball.gif/img, '') //详情页默认的png防盗
	   .replace(/([.](je?pg|png|gif|wepb))_\d+x\d+[a-z]\d+/img, '$1') //.jpg_640x640q80
	   .replace(/([.](je?pg|png|gif|wepb))_\d+x\d+([a-z]\d+){2,3}([.](je?pg|png|gif|wepb))?/img, '$1')// .jpg_760x760Q50s50.jpg
	   .replace(/(?:.+?)?(\/\/.{1,6}(?:ali|taobao|tb)cdn[.]com\/.+?[.](?:jpe?g|png|gif))(.+?)?$/i, 'https:$1')//只单行加头并且移除本行内所有不需要的信息
	   .replace(/[.]\d+x\d+[.](jpe?g|png|gif|webp)(?:(?:_\d+x\d+[a-z]\d+.[a-z]+_(?:.webp)?)?)/i, '.$1')
	   .replace("https://cbu01.alicdn.com/cms/upload/other/lazyload.png", '');//黑名单
 }

/**关闭网页点击功能 */
function HM_off_html(t) {
	let d = 0;
	if (t !== 1) { d = 'body{pointer-events: none;}' }
	if (t === 1) { d = 'body{pointer-events: all;}' }
	let style = document.createElement('style'); style.type = 'text/css'; let
		inn_ocss = d;
	style.innerHTML = inn_ocss; document.getElementsByTagName('HEAD').item(0).appendChild(style)
}
/**数组拼接器 回执式*/
function push_Array(a, b) {
	var ar = new Array();
	for (var i = 0; i < a.length; i++) {
		ar.push(a[i]);
	}
	for (var j = 0; j < b.length; j++) {
		ar.push(b[j]);
	}
	return ar;
}
/**数组去重函数，回执式 */
function Do_not_repeat_HM(arr) {
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
var yyyy_mm_dd;
var hM_NAME = 'HM_ROM_users_DATAall';

var store={
    set(value){
        sessionStorage.setItem(hM_NAME,JSON.stringify(value));
    },
    get(){
      return JSON.parse(sessionStorage.getItem(hM_NAME));
    },
    remove(){
        sessionStorage.removeItem(hM_NAME);
    }
  }


/**时间获取器 */
function HM_Time() {
	let date = new Date();
	let yyyy = date.getFullYear(); //获取完整的年份(4位)
	let mm = (date.getMonth() + 1); //获取当前月份(0-11,0代表1月)
	let dd = date.getDate(); //获取当前日(1-31)
	let nn = date.getHours(); //获取当前小时数(0-23)
	let nm = date.getMinutes(); //获取当前分钟数(0-59)
	let nu = date.getSeconds(); //获取当前秒数(0-59)
	yyyy_mm_dd = yyyy + '-' + mm + '-' + dd;
	return yyyy + '-' + mm + '-' + dd;
}
var MAXM;

/***全局数组 */
var AJSON = '';
AJSON = new Array();
var Stoperr = 0;
/**包含全部数据的数组 */
var get_json = new Array();
/**
 * 核心本体这个是数据获取器
 * @param {*} din_Timag  商品主图
 * @param {*} din_TimagN 商品缩略图
 * @param {*} din_title  标题
 * @param {*} din_idurl  链接
 * @param {*} din_id     ID
 * @param {*} dinis_GC   搜索关键词（如果有）
 * @param {*} dinis_LY   入店来源
 * @param {*} dinis_YIN  访客位置
 * @param {*} dinis_YDM  访问时间
 * @param {*} dinis_YINR 访问时间+访客编号
 * @param {*} dinis_YMU  访客编号
 * @param {*} Nt         制表符
 */
function getGO_HM(din_Timag, din_TimagN, din_title, din_idurl, din_id, dinis_GC, dinis_LY, dinis_YIN, dinis_YDM, dinis_YINR, dinis_YMU, Nt) {
	AJSON = '';
	AJSON = new Array();
	Nt = "\t"; //制表符分隔
	var YMD =  HM_Time();
	[din_Timag, din_TimagN, din_title, din_idurl, din_id, dinis_GC, dinis_LY, dinis_YIN, dinis_YDM, dinis_YINR, dinis_YMU] = '';
	var diom = document.querySelectorAll(" .table-container.table-container-2  table  tbody tr");
		diom=document.querySelectorAll("#visitor-detail .oui-card-content  table   tbody tr");
		for (let i = 0; i < diom.length; i++) {
			let n = diom[i].querySelectorAll('td');
			// n=循环主目录
			let [SORT,UVPage,Source,Region,PVTime,Serial] =[n[0],n[1],n[2],n[3],n[4],n[5]];
				if(UVPage){
				if(UVPage.querySelector('.sycm-goods-td a')){
				  din_Timag  =MAXimg(UVPage.querySelector('.sycm-goods-td img').src);
				  din_TimagN = `![img](${din_Timag}_20x20.jpg)`;
				  din_idurl  = UVPage.querySelector('.sycm-goods-td a').href;
				  if(din_idurl.match(/[\?&]id=(\d+)/)){
					  din_id = '#'+din_idurl.match(/[\?&]id=(\d+)/)[1];
				  }
				  din_title =UVPage.querySelector('.sycm-goods-td a').title
				}else {
					din_id =	UVPage.innerText.replace(/[\s \t\n]+/g,'')
				}}
				if(Source){
					if(Source.querySelector('span .keyword')){
					dinis_GC=Source.querySelector('span .keyword').innerText;
					dinis_LY=Source.innerText.replace(/[\s \t\n]+/g,'');
					let newsrc= new RegExp(`${dinis_GC}$`);
					dinis_LY=dinis_LY.replace(newsrc,'')

				}else{
					// 没有内容就是纯入店来源
						dinis_LY=Source.innerText.replace(/[\s \t\n]+/g,'');
				}}
				if(Region){dinis_YIN=Region.innerText.replace(/[\s \t\n]+/g,'')}
				if(PVTime){dinis_YDM=PVTime.innerText.replace(/[\s \t\n]+/g,'')}
				if(Serial){dinis_YMU=Serial.innerText.replace(/[\s \t\n]+/g,'')}
				if(dinis_YMU){dinis_YINR=HM_Time()+'-'+dinis_YDM+"-"+dinis_YMU}

				var AJSONNU = ((YMD + Nt + dinis_YDM + Nt + din_TimagN + Nt + din_id + Nt + dinis_LY + Nt + dinis_GC + Nt + din_title + Nt + dinis_YIN + Nt + dinis_YMU + Nt + din_Timag + Nt + din_idurl + Nt + dinis_YINR + '\n')
				.replace(/undefined/igm, '')
				.replace(/,/igm, '，')
				.replace(/\t/igm, ','));
	// 		/*输出给用户的是逗号分隔文件 */
	// 		// 我需要的格式  日期   访问时间    商品缩略图   商品ID/来源 搜索来源    关键词 标题  IP地址    访客编号    商品主图    商品链接    访客唯一编号
			AJSON.push(AJSONNU);
            // 清空数据防止下行有问题，小bug懒得找反正要重构了
            [din_Timag, din_TimagN, din_title, din_idurl, din_id, dinis_GC, dinis_LY, dinis_YIN, dinis_YDM, dinis_YINR, dinis_YMU] = '';
		}
}
/**顺序数值编号器 参数：开始数字，位数(2=01,3=001) */
function MIU_NUM(num, n) {
	return (Array(n).join(0) + num).slice(- n);
};
/**复制本页 */
function copy_thwxNN() {
	getGO_HM();
	let text =AJSON.join('').replace(/,/img,'\t');
	GM_setClipboard(text);
	Qmsg.info("已复制可粘贴到表格增量")
	HM_get_new();
	AJSON = '';
	AJSON = new Array();
}

/**下载本页，下载后会自动删除内存中的数据不叠加下一页 */
function download_HM_CSV_At_present() {
	getGO_HM();
	download_HM_CSV();
	HM_get_new();
	AJSON = '';
	AJSON = new Array();
}
/**下载数据的函数 */
function download_HM_CSV(u, f) {
	let NAJSON;
	if (!u) {
		NAJSON = Do_not_repeat_HM(AJSON);
	} if (u) {
		NAJSON = Do_not_repeat_HM(u);
	}
	let blob = new Blob(NAJSON, {
		type: "text/plain;charset=utf-8"
	});

	if (f) { saveAs(blob, "合集_生意参谋访客数据_" + HM_Time() + ".csv"); } else {
		saveAs(blob,HM_Time()+"_"+"生意参谋访客数据_" +MIU_NUM(MIU_NUMX,2)+ ".csv");
	}MIU_NUMX =MIU_NUMX+1;
	/**清空储存中的数据 */

}
/**
 * 随机数值
 * @param {*} Min 最小
 * @param {*} Max 最大
 */
function GetRandomNum(Min, Max) {
	var Range = Max - Min;
	var Rand = Math.random();
	return (Min + Math.round(Rand * Range));
}

/**自动执行下载 */
function Automatic_download() {
	Qmsg.loading(`已开启自动下载,关闭此消息停止`, {
		autoClose: true,
		showClose: true
	});
	var idnf = setInterval(function () {
		document.querySelector("#visitor-detail > div.oui-card-header-wrapper > div.oui-card-header > div.oui-card-header-item.oui-card-header-item-pull-right > button").click();
		setTimeout(function () { if (document.querySelector('.qmsg-content')) { download_HM_CSV_At_present(); } }, 800);
		if (!document.querySelector('.qmsg-content')) { clearInterval(idnf); console.log('已停止') }
	}, (GetRandomNum(32000, 60000)));

}
/**声明这个函数在本脚本任意地方可执行 */
var NHM_idn;
var HM_get_newALLgoget_=[];

/**下载全部：网页显示有多少次就下载多少次 下一页时间为1秒到3秒防止性能占用过多 因为是整页自动添加表头 下载完成延时（5秒）删除数据中的全部数据*/
// function HM_HY_ALLgo(params) {
// 	Qmsg.info("该功能特别复杂，还在恢复中")
// }
async function  HM_HY_ALLgo() {
	HM_off_html(0);
    // 获取多少页
  let next=  document.querySelector("#visitor-detail .ant-pagination-next");
        // 下一页前面是总页数
  let  Countlength =next.parentElement.querySelectorAll('li').length-2;
  let  Count =  next.parentElement.querySelectorAll('li')[Countlength];
  if(Count)
  if(Count.innerText.match(/\d+/)){
    Count=Count.innerText.match(/\d+/)[0]*1;
  }else{return 	Qmsg.info("可能是网站更新了无法获取全部数据")}
  dasfsagdshsgag= Qmsg.loading(`正在下载中请勿关闭网页...`, {
    autoClose: true,
    showClose: true
});


  for(let i=0;i<Count;i++){
    getGO_HM();
    await sleep(200);
    HM_get_newALLgoget_.push(AJSON)
    // 随机异步阻塞
    await sleep(GetRandomNum(800,3000));
    next.click();
    AJSON=[];

}
// 下载

await sleep(200);
let data =Do_not_repeat_HM(HM_get_newALLgoget_)

let newdata =[];
for (let s = 0; s < data.length; s++) {
    const i = data[s];

    for (let c = 0; c < i.length; c++) {
        const v = i[c];
        newdata.push(v)
    }

}


await sleep(200);



// console.log(data)
// 敲代码就是要敷衍变量名也是不懒编程干嘛
// <= <=
//   __
dasfsagdshsgag.close();

	let blob = new Blob(newdata, {
		type: "text/plain;charset=utf-8"
	});
   let name= `${HM_Time()}_生意参谋访客数据_${MIU_NUM(MIU_NUMX,2)}.csv`
    saveAs(blob,name);
   delete data,HM_get_newALLgoget_,AJSON;
   HM_off_html(1)
   Qmsg.info("下载完成")
}

let keyMAXM=1;
/**按钮点击器 */
function HM_get_new() {

     document.querySelector("#visitor-detail .ant-pagination-next").click();
	 if( document.querySelector("#visitor-detail .ant-pagination-next").classList.toString().match("ant-pagination-disabled"))
	 return {type:"Success"}
}


/**这个是用于弹窗的库 没必要使用未压缩文本*//**
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


})();
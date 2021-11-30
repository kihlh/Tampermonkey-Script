// ==UserScript==
// @name                采集微博到Eagle
// @version             0.1
// @description         采集微博图片到Eagle
// @match               weibo.com/*
// @match               http://localhost:41595*
// @grant               GM_setValue
// @grant               GM_getValue
// @connect             *
// @run-at              document-body
// @require             https://greasyfork.org/scripts/430351-eagle%E4%BA%A4%E4%BA%92%E8%84%9A%E6%9C%AC/code/Eagle%E4%BA%A4%E4%BA%92%E8%84%9A%E6%9C%AC.js?version=957317
// @namespace           https://greasyfork.org/users/710095
// @author              黄逗酱酱
// @date                11/28/2021
// @license             BSD
// ==/UserScript==
(function () {
    "use strict";
    // 没有需要采集的界面则或者用户未同意使用协议则退出
    if (GM_getValue("OFF") || !!document.querySelector("#plc_main .WB_frame_c,#v6_pl_content_homefeed,.WB_feed_detail")) return;
    console.log("开始注入");
    /**
     * 一些全局快速调用的方法
     */
    const HM = {
        /**
         * 按钮元素 后期直接复制节省用户性能 来自开发者的苛刻~
         */
        //     CopyElement: new Element,
        CopyElement: null,
        /**
         * 代码阻塞
         * @param {number} ms 毫秒
         * @returns
         */
        Sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }, // 排序 _00  _%NN
        MIU_NUM(num, n) {
            return (Array(n).join("0") + num).slice(-n);
        },
        /**
         * 用户协议
         * @returns {boolean}
         */
        UserAgreement() {
            if (GM_getValue("UserAgreement")) {
                return true;
            } else {
                if (!confirm(`\n                用户协议：\n            ----我同意仅作为查看,学习图片用途----，\n                 并且我将在稍后移除图片，\n                 并且在本网页关闭后我将移除图片，\n\n                 点击取消之后请帮我关闭此功能\n                 并且请不再提问我这个问题，\n            `)) {
                    GM_setValue("OFF", true);
                } else {
                    GM_setValue("UserAgreement", true);
                    return true;
                }
            }
        },
        BackTotal: 0,
    };;
    (() => {
        // 创建一个将来用于调用的按钮元素
        let NewDoment = document.createElement("li");
        NewDoment.id = "ToEagle";
        NewDoment.innerHTML = `
    <a class="S_txt2  HM__AddCollection">
    <span class="pos">
      <span class="line S_line1">
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.12 18.02" style="margin-bottom: -1px;width: 12.5px;"><defs><style>.c{stroke:#808080;}.f{fill:#808080}.cls-2{fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px}</style></defs><g><g><path class="f" d="M15 2.33c-1.4 1.1-2.4 2.4-3.7 2.8-4.5 1.5-8.3 3.6-9.7 8.8-2.6-4.3-2-8.6 1.3-11.6s7.72-3.2 12.1 0Z"></path><path class="f" d="M10.92 17.93c-3.2.3-5.9 0-7.6-2.2-1-1.3 1.3-5.3 3.6-6.8 1-.6 2.2-1 4.1-1.9-2.5 3.9-3.1 7.2-.1 10.9ZM13.42 5.63c.9-1 1.6-1.7 2.6-2.8.7 1.5 1.3 2.7 2.1 4.5-1.7-.6-3-1.1-4.7-1.7Z"></path><path class="cls-2 c" d="M14.08 16.1V9.43M16.43 13.74l-2.36 2.36-2.36-2.36"></path></g></g></svg>
          <em>采集</em>
        </span>
      </span>
    </span>
  </a>
    `;
        HM.CopyElement = NewDoment;
        // 注入CSS 为了让用户界面更好看
        let NewStyle = document.createElement("style");
        NewStyle.innerHTML = ".HM_row_r5 li{width: 20%;}";
        document.querySelector("body").appendChild(NewStyle);
    })();

    /**
     * 执行获取和发送的真正功能
     * @param Event
     * @param This_btn
     * @param MainElement
     */

    function Click_CollectButton(Event, This_btn, MainElement) {
        Event.stopPropagation();
        Event.preventDefault();
        if (!HM.UserAgreement()) return;
        Event.stopPropagation();
        Event.preventDefault();
        const Data = {
            UserName: MainElement.querySelector(".WB_detail .WB_info a.S_txt1").innerText || "",
            Text: MainElement.querySelector(".WB_detail div.WB_text").innerText || "",
            images: new Set,
            ToEagleData: {
                "items": [],
                "folderId": null
            }
        }
        const GetImagesNodeList = MainElement.querySelectorAll(".WB_detail .WB_media_wrap ul img");
        for (let index = 0; index < GetImagesNodeList.length; index++) {
            const element = GetImagesNodeList[index];
            let Url = element.src.replace(/(sinaimg.cn[/])([a-z]+\d+)[/]/i, '$1/large/');
            if (!Url) continue;
            if (Url.match(/^\/\//)) Url = document.location.protocol + Url;
            Url = Url.replace(/([^:])[\\/]+/, '$1/')
            Data.images.add(Url);
        }
        //转不重复的数组
        const Getimages_no_repeatList = Data.images.keys();
        //当前网站
        const documentURL = document.location.href;
        const tagList = [Data.UserName, "微博采集"];
        let index = 0;
        //    获取链接
        for (const URLs of Getimages_no_repeatList) {
            if (URLs) Data.ToEagleData.items.push({
                url: URLs,
                name: `图片_${HM.MIU_NUM(index + 1/*不从0开始*/, 2)}`,
                website: documentURL,
                modificationTime: +new Date(),
                annotation: Data.Text,
                tags: tagList
            })
        }
        // 发送
        ToEagle.SetNewFolder(Data.UserName + "的微博_" + Data.Text).then(EagleinfoData => {
            Data.ToEagleData.folderId = EagleinfoData.data.id
            if (Data.ToEagleData.items.length) {
                ToEagle.AddImagesURLAll(Data.ToEagleData).then(e => {
                    // 完成后 归还位置并且删除按钮
                    MainElement.querySelector("#ToEagle").remove()
                    MainElement.querySelector(".WB_row_line").classList.remove("HM_row_r5")
                    MainElement.querySelector(".WB_row_line").classList.add("WB_row_r4")
                })
            }

        })

    }

    /**
     * 添加收集按钮到模块中
     * @param {Element} _Detail 元素@  #Pl_Official_MyProfileFeed__18 [action-type].WB_cardwrap
     */
    function SetCollectButton(_Detail /**/ ) {
        //对模块检查
        if (_Detail["Add__Collection"] || //已经添加按钮了
            !_Detail.querySelector(".WB_handle") || //没有按钮列表
            _Detail.querySelector("a.HM__AddCollection") || //已经添加按钮了
            !_Detail.querySelector(".WB_handle ul") || //按钮列表不可添加
            !_Detail.querySelector(".media_box img") //界面内没有图片
        ) return;
        // 复制一个新的按钮
        const SetElementData = HM.CopyElement.cloneNode(true);
        const WB_handle = _Detail.querySelector(".WB_handle ul");
        // 按钮列表
        WB_handle.appendChild(SetElementData);
        //重新计算元素宽度
        if (WB_handle.querySelectorAll("li > a").length <= 5) {
            WB_handle.classList.remove("WB_row_r4")
            WB_handle.classList.add("HM_row_r5")
        }
        // 开始监听用户点击因为循环的原因复杂函数会在外层执行 减少内存占用
        SetElementData.addEventListener("click", function (Event) {
            Event.stopPropagation();
            Event.preventDefault();
            return Click_CollectButton(Event, SetElementData, _Detail);
        })
        _Detail["Add__Collection"] = true;
    }
    /**
     * 添加全部列表中的按钮 用户拉动滚动条之后会执行这个函数，因为消耗会很小所以直接全部过一遍
     */
    function SetButAll() {
        const NodeList = document.querySelectorAll("#Pl_Official_MyProfileFeed__18 [action-type].WB_cardwrap,#v6_pl_content_homefeed .WB_cardwrap[action-type],.WB_feed_type[action-type]");
        for (let index = 0; index < NodeList.length; index++) {
            const element = NodeList[index];
            SetCollectButton(element);
        }
    }
    // 防抖节流
    const shake = {
        Data:new Set,
        isset(key,time=1200){
            if(this.Data.has(key))return true;
            this.Data.add(key)
            time&&setTimeout(this.Data.delete(key),time)
            return false;
        }
    }
    document.addEventListener("scroll",function(){
        // 1.5秒内只执行一次
        if(shake.isset("scroll",1500))return;
        SetButAll()
    })
    setTimeout(SetButAll,1500)
})();
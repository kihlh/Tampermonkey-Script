// ==UserScript==
// @name                采集微博到Eagle
// @version             0.2Add@0.1
// @description         采集微博图片到Eagle
// @match               weibo.com/*
// @match               http://localhost:41595*
// @grant               GM_setValue
// @grant               GM_getValue
// @grant               unsafeWindow
// @connect             *
// @run-at              document-body
// @require             https://greasyfork.org/scripts/430351-eagle%E4%BA%A4%E4%BA%92%E8%84%9A%E6%9C%AC/code/Eagle%E4%BA%A4%E4%BA%92%E8%84%9A%E6%9C%AC.js?version=957317
// @namespace           https://greasyfork.org/users/710095
// @github              https://github.com/kihlh/Tampermonkey-Script/blob/main/Eagle/%E5%BE%AE%E5%8D%9A%E6%94%B6%E9%9B%86%E5%8A%A9%E6%89%8B@0.3/%E5%BE%AE%E5%8D%9A%E6%94%B6%E9%9B%86%E5%8A%A9%E6%89%8B@0.3.ts
// @develop             @es6  @chrome85  @TypeScript @eagle:2.0 Build40  自带旧版兼容(此特性会在网站关闭旧版主题后移除)
// cmd                  tsc 微博收集助手.ts -w '--downlevelIteration' --target ES6 
// @author              黄逗酱酱
// @date                11/28/2021
// @license             BSD
// ==/UserScript==
/**
    脚本声明(statement):
脚本由TS(TypeScript)编写因此会自动做低版本兼容处理，因此有些地方会像被压缩过，如果需要源码建议到我的github中获取完整的TS(未编译)代码 源代码采用BSD协议
Script use“TS(TypeScript)“to write It will be automatically compiled and available to most users, so like minimization, we didn't do it. Please follow BSD   The code details can be viewed in GitHub
可以随意修改 使用但是衍生版本与原作者无关
It can be modified and used at will, but the derivative version has nothing to do with the original author

*/
// 延时等待页面加载
setTimeout((function () {
    // 所有需要查找的元素会在这里获取
    const Main = {
        // 运行条件
        IF: [
            /*旧版以后会移除（*/ "#plc_main", "#v6_pl_content_homefeed", ".WB_frame_c .WB_media_wrap",
            "#homeWrap"
        ],
        Isobsolete: "#v6_pl_content_homefeed .WB_feed_detail.clearfix .WB_detail .WB_info",
        /**
         * 定位主界面
         */
        Main: "#scroller",
        /**
         * 卡片
         */
        Card: ".vue-recycle-scroller__item-view",
        button: "article > footer > div",
        /**
         * 按钮内容
         */
        buttonMain: `
         <div class="woo-box-flex woo-box-alignCenter woo-box-justifyCenter toolbar_wrap_np6Ug">
         <div class="woo-pop-wrap">
           <span class="woo-pop-ctrl">
             <div class="woo-box-flex woo-box-alignCenter woo-box-justifyCenter toolbar_wrap_np6Ug">
               <div class="woo-box-flex woo-box-alignCenter woo-box-justifyCenter " style="margin: 0 0 0 10px;">
                 <div style="margin: 4px -2px 0 0;">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.12 18.02" style="margin-bottom: 2px;width: 12.5px;">
                     <defs>
                       <style>.c{stroke:#808080;}.f{fill:#808080}.cls-2{fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px}</style>
                     </defs>
                     <g>
                       <g>
                         <path class="f" d="M15 2.33c-1.4 1.1-2.4 2.4-3.7 2.8-4.5 1.5-8.3 3.6-9.7 8.8-2.6-4.3-2-8.6 1.3-11.6s7.72-3.2 12.1 0Z">
                         </path>
                         <path class="f" d="M10.92 17.93c-3.2.3-5.9 0-7.6-2.2-1-1.3 1.3-5.3 3.6-6.8 1-.6 2.2-1 4.1-1.9-2.5 3.9-3.1 7.2-.1 10.9ZM13.42 5.63c.9-1 1.6-1.7 2.6-2.8.7 1.5 1.3 2.7 2.1 4.5-1.7-.6-3-1.1-4.7-1.7Z">
                         </path>
                         <path class="cls-2 c" d="M14.08 16.1V9.43M16.43 13.74l-2.36 2.36-2.36-2.36">
                         </path>
                       </g>
                     </g>
                   </svg>
                 </div>
                 <a style="color: grey;font-size: 13.5px;line-height: 12px;margin: 0 0 0 7px;">采集</a>
               </div>
               <span class="toolbar_num_JXZul">
             </div>
             </span>
             <!---->
         </div>
       </div>
       `,
        buttonElement: "div",
        /*卡片中含有这些元素才执行*/
        AddSwitch: ".woo-picture-main,video,.woo-picture-square",
    };
    /*-----------------------------------旧版主题兼容--------------------------------------------*/
    if (document.querySelector(Main.Isobsolete)) {
        return;
    }
    const HM = {
        OFF: false,
        UserAgreement() {
            // @ts-ignore 获取是否已经同意同意后不再弹出
            if (GM_getValue("UserAgreement")) {
                return true;
            }
            else {
                if (!confirm(`\n                用户协议：\n            ----我同意仅作为查看,学习图片用途----，\n                 并且我将在稍后移除图片，\n                 并且在本网页关闭后我将移除图片，\n\n                 点击取消之后请帮我关闭此功能\n                 并且请不再提问我这个问题，\n            `)) {
                    // @ts-ignore 用户不同意使用退出脚本            
                    GM_setValue("OFF", true);
                    this.OFF = true;
                }
                else {
                    // @ts-ignore 用户同意 不再询问
                    GM_setValue("UserAgreement", true);
                    return true;
                }
            }
        },
    };
    ;
    /*-----------------------------------旧版主题兼容--------------------------------------------*/
    /**判断脚本是否运行*/
    let $IS_funStart = {
        IF: {
            // @ts-ignore
            UserOFF: !GM_getValue("OFF"),
            is: (() => {
                for (const Elname of Main.IF) {
                    if (document.querySelector(Elname))
                        return true;
                }
                return false;
            })()
        },
        StartMun: 2,
        HM__IF() {
            let IFMun = 0;
            for (const key in this.IF) {
                if (Object.hasOwnProperty.call(this.IF, key)) {
                    const element = this.IF[key];
                    if (element)
                        IFMun++;
                    console.log(IFMun);
                    if (IFMun >= $IS_funStart.StartMun)
                        return true;
                }
            }
            return false;
        }
    };
    if (!$IS_funStart.HM__IF())
        return; // 没有需要采集的界面则或者用户未同意使用协议则退出
    /***********************会被多数函数调用的模块*************************** */
    /**
     * Call类型
     * @param a
     * @returns
     */
    function CallType(a) {
        return Object.prototype.toString.call(a);
    }
    /**
     *  _00 _02...
     * @param num
     * @param n
     * @returns
     */
    function MIU_NUM(num, n) {
        return (Array(n).join("0") + num).slice(-n);
    }
    /**
     * 去重
     * @param List
     * @returns
     */
    function RemoveRepeat(List) {
        const NewARRAY = [];
        const ToSet = new Set();
        for (const Data of List)
            ToSet.add(Data);
        for (const iterator of ToSet)
            NewARRAY.push(iterator);
        return NewARRAY;
    }
    /************************************************* */
    /**
     * 创建或复制元素
     * @param ElementType 创建类型
     *  - 如果是元素不会重写节点和样式
     *  - div....
     * @param AddCode 添加代码
     * @param id
     * @param AddSelect 添加到哪里 元素或者元素名
     * @param options
     */
    function NewElement(ElementType = "div", AddCode = "", id, AddSelect, options) {
        // 如果传入的是元素则不新建而是复制元素
        const IsElementType = CallType(ElementType).includes('Element');
        // @ts-ignore 允许不重新生产元素
        let NewDoment = IsElementType ? ElementType.cloneNode(true) : document.createElement(ElementType);
        NewDoment.id = id || "";
        if (!IsElementType)
            NewDoment.innerHTML = AddCode;
        for (const key in options) {
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                const value = options[key];
                //  特殊属性添加  
                if (!IsElementType && key == "class") {
                    // @ts-ignore 支持数组或者文本
                    NewDoment.className = CallType(options.class.concat) == '[object Array]' ? options.class.join(' ') : options.class;
                    continue;
                }
                if (!IsElementType && key == "style") {
                    if (CallType(value) == '[object Object]') {
                    }
                    else {
                        ElementType;
                        NewDoment.style.cssText = options[key];
                    }
                    continue;
                }
                if (key == "event") {
                    if (value.event) {
                        NewDoment.addEventListener(value.event, (value.function || value.Function || value.fun || value.Fun));
                    }
                    else {
                        NewDoment.addEventListener(value[0], value[1]);
                    }
                    continue;
                }
                // 添加元素信息
                NewDoment[key] = options[key];
            }
        }
        if (CallType(AddSelect).includes('Element')) {
            // @ts-ignore 支持node元素
            AddSelect.appendChild(NewDoment);
        }
        else if (NewDoment) {
            // 没有添加位置则返回元素
            return NewDoment;
        }
        else {
            const Add_To_Select = document.querySelector("" + AddSelect);
            Add_To_Select && Add_To_Select.appendChild(NewDoment);
        }
    }
    /**
     * 循环所有链接创建一个EagleAPi能识别的 URL发送对象
     * @param ImagesList
     */
    function ImagesList_To_Eagle_URL_Data(ImagesList, AddData, folderId) {
        // @ts-ignore  允许文本输入
        if (CallType(ImagesList).includes('String'))
            ImagesList = [ImagesList];
        const data = {
            folderId: (AddData && AddData.folderId || AddData && folderId) || null,
            items: []
        };
        let index = 0;
        ImagesList = RemoveRepeat(ImagesList);
        for (const URLs of ImagesList) {
            if (!URLs)
                continue;
            index += 1;
            data.items.push(Object.assign({
                name: "图片_" + MIU_NUM(index, 2),
                url: URLs
            }, 
            // 引用数据插入
            AddData || {}));
        }
        return data;
    }
    /**
     * 通过Vue获取用户可见的图片
     * @param event
     * @param CardMain
     * @param Btn
     * @returns
     */
    function Vue_Get_images(event, CardMain, Btn) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        let imagesList = [];
        let AddData = {
            website: document.URL + "",
            modificationTime: +new Date(),
            annotation: "",
            tags: [],
            UserName: ""
        };
        // @ts-ignore 尝试从VUE中提取数据
        if ((_a = CardMain.querySelector(".content_row_-r5Tk")) === null || _a === void 0 ? void 0 : _a.__vue__) {
            const Data = CardMain.querySelector(".content_row_-r5Tk").__vue__;
            // 是否存在这个用户可见对象
            if ((_c = (_b = Data === null || Data === void 0 ? void 0 : Data.$attrs) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.pic_infos) {
                for (const key in Data.$attrs.content.pic_infos) {
                    // 查找图片数据
                    if (Object.prototype.hasOwnProperty.call(Data.$attrs.content.pic_infos, key)) {
                        const element = Data.$attrs.content.pic_infos[key];
                        if (!((_d = element === null || element === void 0 ? void 0 : element.largest) === null || _d === void 0 ? void 0 : _d.url))
                            break;
                        imagesList.push(element.largest.url + "");
                    }
                }
                if ((_f = (_e = Data.$attrs) === null || _e === void 0 ? void 0 : _e.content) === null || _f === void 0 ? void 0 : _f.pic_ids) {
                    // 九宫格以外的图
                    for (let index = imagesList.length; index < Data.$attrs.content.pic_ids.length; index++) {
                        const imagids = Data.$attrs.content.pic_ids[index] + "";
                        let NewURL = (imagesList[0] + "").replace(/($.+sinaimg.cn\/[a-z]+\/).+/i, "$1" + imagids + ".jpg");
                        imagesList.push(NewURL);
                    }
                }
            }
            //@ts-ignore  用户可见的用户名
            AddData.UserName = ((_j = (_h = (_g = Data === null || Data === void 0 ? void 0 : Data.$attrs) === null || _g === void 0 ? void 0 : _g.content) === null || _h === void 0 ? void 0 : _h.user) === null || _j === void 0 ? void 0 : _j.screen_name) || "";
            //@ts-ignore  用户可见的描述
            AddData.annotation = ((_l = (_k = Data === null || Data === void 0 ? void 0 : Data.$attrs) === null || _k === void 0 ? void 0 : _k.content) === null || _l === void 0 ? void 0 : _l.text) || "";
        }
        if (AddData.UserName)
            AddData.tags.push(AddData.UserName);
        AddData.tags.push("微博采集");
        // @ts-ignore 返回数据
        return Object.assign({ UserName: AddData.UserName }, ImagesList_To_Eagle_URL_Data(imagesList, AddData));
    }
    /**
     * 向API发起
     * @param Data
     */
    function launch(Data, Callback) {
        if (!Data.items.length)
            return;
        // @ts-ignore 来自引用Eagle交互脚本.js
        ToEagle.SetNewFolder("来自" + Data.UserName + "的微博").then(EagleinfoData => {
            Data.folderId = EagleinfoData.data.id;
            // @ts-ignore 来自引用Eagle交互脚本.js
            ToEagle.AddImagesURLAll(Data).then(e => {
                Callback && Callback();
            });
        }).catch(err => {
            alert("无法连接Eagle  请检查是否未打开");
        });
    }
    /**
     * 获取和发送图片的主函数
     * @param event
     * @param CardMain
     * @param Btn
     */
    function Btn___GotuEagle__Click(event, CardMain, Btn) {
        event.stopPropagation();
        event.preventDefault();
        //判断是否允许运行
        if (!HM.UserAgreement())
            return;
        const _Vue = Vue_Get_images(event, CardMain, Btn);
        if (_Vue.items.length)
            return launch(_Vue);
        // 仅视频
        if (CardMain.querySelector("video")) {
            return launch(
            // @ts-ignore  直接发送
            ImagesList_To_Eagle_URL_Data([CardMain.querySelector("video").src], {
                // 名称
                "name": "视频",
                // 链接
                website: document.URL + "",
                // 创建时间
                modificationTime: +new Date(),
                // @ts-ignore 描述
                annotation: CardMain.querySelector(".detail_wbtext_4CRf9").innerText + "",
                // @ts-ignore 标签
                tags: ["微博采集", CardMain.querySelector(".woo-box-alignCenter.head_nick_1yix2 > a > span").innerText + ""],
                UserName: "",
            }));
        }
    }
    Main.buttonElement = NewElement(Main.buttonElement, Main.buttonMain, "GotuEagle", null, { class: "woo-box-item-flex toolbar_item_1ky_D", });
    // 开始执行用户可操作功能
    // --------------------------------------------------------------------------------------------
    /**
     * 执行按钮添加
     */
    function SetButAll() {
        var _a;
        // 获取所有卡片
        const domNodeList = (_a = document.querySelector(Main.Main)) === null || _a === void 0 ? void 0 : _a.querySelectorAll(Main.Card);
        if (!(domNodeList === null || domNodeList === void 0 ? void 0 : domNodeList.length))
            return;
        const domList = [...domNodeList];
        for (const element of domList) {
            // 防止第二次添加
            if (!element['SetGotuEagle'] && !element.querySelector("#GotuEagle")) {
                //卡片中没有被允许的对象  
                if (!element.querySelector(Main.AddSwitch))
                    continue;
                NewElement(Main.buttonElement, Main.buttonMain, "GotuEagle", element.querySelector(Main.button), {
                    class: "woo-box-item-flex toolbar_item_1ky_D",
                    // 点击事件
                    event: ["click", function (event) {
                            // 事件不再冒泡
                            event.stopPropagation();
                            event.preventDefault();
                            //异步处理了 指针估计会被指向全局需要先储存当前指向
                            let This = this;
                            let request = Btn___GotuEagle__Click(event, element, This);
                            // @ts-ignore 成功后移除按钮      
                            request.finally && request.then(function () { This.remove(); });
                        }]
                });
                // 防止第二次添加
                element['SetGotuEagle'] = true;
            }
        }
    }
    SetButAll(); // 执行按钮添加
    // 防抖节流
    const shake = {
        Data: new Set,
        /**
         * 到期后自动删除 如果被添加将会返回true
         * - 使用方法： if (shake.isset("scroll", 1500)) return;
         * @param key 防抖的名称
         * @param time 毫秒
         * @return {boolean}
         */
        isset(key, time = 1200) {
            if (this.Data.has(key))
                return true;
            this.Data.add(key);
            time && setTimeout(this.Data.delete(key), time);
            return false;
        }
    };
    // 控制条事件
    document.addEventListener("scroll", function () {
        // 用户不同意协议 不再添加按钮
        if (HM.OFF)
            return;
        // 1.5秒内只执行一次
        if (shake.isset("scroll", 1500))
            return;
        SetButAll();
    });
    // --------------------------------------------------------------------------------------------
    //debugger;
    setInterval(function () {
        // @ts-ignore
        if (!unsafeWindow.HM)
            return;
        unsafeWindow.HM = false;
        debugger;
        console.log("this=> ", this);
    }, 1200);
}), 2000);

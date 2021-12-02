// ==UserScript==
// @name                采集微博到Eagle
// @version             0.3
// @description         采集微博图片到Eagle
// @match               weibo.com/*
// @match               http://localhost:41595*
// @grant               GM_setValue
// @grant               GM_getValue
// @grant               unsafeWindow
// @connect             *
// @run-at              document-body
// @require             https://greasyfork.org/scripts/430351-eagle%E4%BA%A4%E4%BA%92%E8%84%9A%E6%9C%AC/code/Eagle%E4%BA%A4%E4%BA%92%E8%84%9A%E6%9C%AC.js?version=957317
// @namespace           https://github.com/kihlh/Tampermonkey-Script
// @license             BSD
// @develop             @es6  @chrome85  @TypeScript @eagle:2.0 Build40  @cmd:  tsc 微博收集助手.ts -w '--downlevelIteration' --target ES2017 
// @author              黄逗酱酱
// @date                11/28/2021
// @note                @0.1 JS编写  兼容旧版的脚本诞生 但是并未深度获取九宫格以外和视频
// @note                @0.2 ts重写  支持新版支持所有图片视频加入旧版兼容特性(并未支持)
// @note                @0.3 优化    兼容性:ES2017 通过多次定时执行以获得更快的按钮添加速度 并解决部分小问题 减少@ts-ignore便签使用方便后期更好维护
// ==/UserScript==

/**
---------------------------------
    脚本声明(statement):
脚本由TS(TypeScript)编写因此会自动做低版本兼容处理，因此有些地方会像被压缩过，如果需要源码建议到我的github中获取完整的TS(未编译)代码 源代码采用BSD协议
Script use“TS(TypeScript)“to write It will be automatically compiled and available to most users, so like minimization, we didn't do it. Please follow BSD   The code details can be viewed in GitHub
可以随意修改 使用但是衍生版本与原作者无关
It can be modified and used at will, but the derivative version has nothing to do with the original author
---------------------------------
*/
// TS格式声明在ts源文件中的尾部  因为环境没办法单独引入
(function (unsafeWindow: Window, Store, $: Function, $$: Function, Sleep = ToEagle._Sleep) {
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
        isset(key: string, time = 1200): boolean {
            if (this.Data.has(key)) return true;
            this.Data.add(key)
            time && setTimeout(this.Data.delete(key), time)
            return false;
        }
    }
    /**
     * 普通函数转异步函数
     * @param Fun 函数
     * @param Variable  执行变量
     * @returns 
     */
    function Fun_toPromise(Fun: Function, ...Variable: any): Promise<any> {
        return new Promise(async function (resolve, reject) {
            try {
                let ResponseData =await Fun(...Variable);
                return resolve(ResponseData);
            } catch (error) { return reject(error) }
        })
    }
    /**
     * 主函数
     * @returns 
     */
    function FunMian(): void {
        // 所有需要查找的元素会在这里获取
        const Main: {
            IF: Array<string>
            Isobsolete: string
            Main: string
            Card: string
            button: string
            buttonMain: string
            buttonElement: Element | string
            AddSwitch: string
        } = {
            // 运行条件
            IF: [
                "#homeWrap"/*主页*/, "#scroller"/*用户主页*/
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
             * 按钮元素
            */
            buttonElement: "div",
            /*卡片中含有这些元素才执行*/
            AddSwitch: ".woo-picture-main,video,.woo-picture-square,.wbpro-feed-content,.content_row_-r5Tk",
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
                 <!--用i便签解决a标签全局污染-->
                 <i style="font-size: 13.5px;font-style: inherit;line-height: 12px;margin: 0 0 0 7px;">采集</i>
               </div>
               <span class="toolbar_num_JXZul">
             </div>
             </span>
             <!---->
         </div>
       </div>
       `,
        }
        /*-----------------------------------旧版主题兼容--------------------------------------------*/
        const HM = {
            OFF: false,
            UserAgreement() {
                // 获取是否已经同意同意后不再弹出
                if (Store.Get("UserAgreement")) {
                    return true;
                } else {
                    if (!confirm(`\n                用户协议：\n            ----我同意仅作为查看,学习图片用途----，\n                 并且我将在稍后移除图片，\n                 并且在本网页关闭后我将移除图片，\n\n                 点击取消之后请帮我关闭此功能\n                 并且请不再提问我这个问题，\n            `)) {
                        //用户不同意使用退出脚本            
                        Store.Set("OFF", true);
                        this.OFF = true;
                    } else {
                        //用户同意 不再询问
                        Store.Set("UserAgreement", true);
                        return true;
                    }
                }
            },
        };;
        /*-----------------------------------旧版主题兼容--------------------------------------------*/
        /**判断脚本是否运行*/
        let $IS_funStart = {
            IF: {
                UserOFF: !Store.Get("OFF"),//用户没关闭脚本
                is: ((): boolean => {
                    for (const Elname of Main.IF) {
                        if ($(Elname)) return true;
                    }
                    return false
                })()
            },
            StartMun: 2,//满足两项则运行
            HM__IF() {
                let IFMun = 0;
                for (const key in this.IF) {
                    if (Object.hasOwnProperty.call(this.IF, key)) {
                        const element = this.IF[key];
                        if (element) IFMun++;
                        console.log(IFMun);

                        if (IFMun >= $IS_funStart.StartMun) return true;
                    }
                }
                return false;
            }
        }; 
        //@ts-ignore
        if (!$IS_funStart.HM__IF()) {return new Error("移交外层异常处理")};// 没有需要采集的界面则或者用户未同意使用协议则退出
        /***********************会被多数函数调用的模块*************************** */
        /**
         * Call类型
         * @param a 
         * @returns 
         */
        function CallType(a: any): string {
            return Object.prototype.toString.call(a)
        }
        /**
         *  _00 _02...
         * @param num 
         * @param n 
         * @returns 
         */
        function MIU_NUM(num: number, n: number): string {
            return (Array(n).join("0") + num).slice(-n);
        }
        /**
         * 去重
         * @param List 
         * @returns 
         */
        function RemoveRepeat(List): Array<any> {
            const NewARRAY = [];
            const ToSet = new Set();
            for (const Data of List) ToSet.add(Data);
            for (const iterator of ToSet) NewARRAY.push(iterator);
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
        function NewElement(ElementType: (Element | "div" | "li" | "i" | "script" | "link" | "p" | "ul" | "a" | "span" | "a" | "img" | string) = "div", AddCode: string = "", id?: string, AddSelect?: Element | string | Node, options?: { style?: string, class?: Array<string> | string, event?: [string, Function] }): Element | undefined {
               function CallType(a: any): string {return Object.prototype.toString.call(a)}
            // 如果传入的是元素则不新建而是复制元素
            const IsElementType = CallType(ElementType).includes('Element');
            // @ts-ignore 允许不重新生产元素
            let NewDoment = IsElementType ? ElementType.cloneNode(true) : document.createElement(ElementType);
            NewDoment.id = id || "";
            if (!IsElementType) NewDoment.innerHTML = AddCode;
            for (const key in options) {
                if (Object.prototype.hasOwnProperty.call(options, key)) {
                    const value = options[key]
                    //  特殊属性添加  
                    if (!IsElementType && key == "class") {
                        // @ts-ignore 支持数组或者文本
                        NewDoment.className = CallType(options.class.concat) == '[object Array]' ? options.class.join(' ') : options.class;
                        continue
                    }
                    if (!IsElementType && key == "style") {
                        if (CallType(value) == '[object Object]') {
                        } else {
                            ElementType
                            NewDoment.style.cssText = options[key];
                        }
                        continue
                    }
                    if (key == "event") {
                        if (value.event) {
                            NewDoment.addEventListener(value.event, (value.function || value.Function || value.fun || value.Fun))
                        } else {
                            NewDoment.addEventListener(value[0], value[1])
                        }
                        continue
                    }
                    // 添加元素信息
                    NewDoment[key] = options[key];
                }
            }
            if (CallType(AddSelect).includes('Element')) {
                // @ts-ignore 支持node元素
                AddSelect.appendChild(NewDoment)
            } else if (NewDoment) {
                // 没有添加位置则返回元素
                return NewDoment
            }
            else {
                const Add_To_Select = $("" + AddSelect);
                Add_To_Select && Add_To_Select.appendChild(NewDoment);
            }
        }
        /**
         * 循环所有链接创建一个EagleAPi能识别的 URL发送对象
         * @param ImagesList 
         */
        function ImagesList_To_Eagle_URL_Data(ImagesList: Set<string> | string | Array<string>, AddData?: { name?: string, website?: string, url?: string, tags?: null | Array<string>, annotation?: string, UserName?: string, modificationTime?: number, folderId?: null | string, headers?: string }, folderId?) {
            // @ts-ignore  允许文本输入
            if (CallType(ImagesList).includes('String')) ImagesList = [ImagesList];
            const data = {
                folderId: (AddData && AddData.folderId || AddData && folderId) || null,
                items: []
            }
            let index = 0;
            ImagesList = RemoveRepeat(ImagesList)
            for (const URLs of ImagesList) {
                if (!URLs) continue;
                index += 1
                data.items.push(Object.assign(
                    {
                        name: "图片_" + MIU_NUM(index, 2),
                        url: URLs
                    },
                    // 引用数据插入
                    AddData || {}
                ))
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
        function Vue_Get_images(event: Event, CardMain: Element, Btn: Element): { UserName: "", folderId?: "" | null; items: Array<string>; } {
            let imagesList = [];
            let AddData = {
                website: document.URL + "",
                modificationTime: +new Date(),
                annotation: "",
                tags: [],
                UserName: ""
            }

            // @ts-ignore 尝试从VUE中提取数据
            if (CardMain.querySelector(".content_row_-r5Tk")?.__vue__) {
                interface DataO_Vue_ {
                    $attrs: {
                        content: {
                            // 用户可见的描述
                            text: string,
                            // 九宫格
                            pic_infos: {
                                "...key": {
                                    "thumbnail": {
                                        "url": "",
                                        "width": 0,
                                        "height": 0,
                                        "cut_type": 0,
                                        "type": null
                                    }
                                },
                                // 用户可见的用户名
                                user: { screen_name: "" }
                            },
                            pic_ids: Array<string>,
                            // 用户可见的用户名
                            user: { screen_name: string }
                        }
                    }
                }
                // @ts-ignore
                const Data: DataO_Vue_ = CardMain.querySelector(".content_row_-r5Tk").__vue__;
                // 是否存在这个用户可见对象
                if (Data?.$attrs?.content?.pic_infos) {
                    for (const key in Data.$attrs.content.pic_infos) {
                        // 查找图片数据
                        if (Object.prototype.hasOwnProperty.call(Data.$attrs.content.pic_infos, key)) {
                            const element = Data.$attrs.content.pic_infos[key];
                            if (!element?.largest?.url) break;
                            imagesList.push(element.largest.url + "")
                        }
                    }
                    if (Data.$attrs?.content?.pic_ids) {
                        // 九宫格以外的图
                        for (let index = imagesList.length; index < Data.$attrs.content.pic_ids.length; index++) {
                            const imagids = Data.$attrs.content.pic_ids[index] + "";
                            let NewURL = (imagesList[0] + "").replace(/($.+sinaimg.cn\/[a-z]+\/).+/i, "$1" + imagids + ".jpg");
                            imagesList.push(NewURL)
                        }

                    }
                }
                AddData.UserName = (Data?.$attrs?.content?.user?.screen_name) || "";
                AddData.annotation = Data?.$attrs?.content?.text || ""
            }
            if (AddData.UserName) AddData.tags.push(AddData.UserName);
            AddData.tags.push("微博采集")
            // @ts-ignore 返回数据
            return Object.assign({ UserName: AddData.UserName }, ImagesList_To_Eagle_URL_Data(imagesList, AddData))
        }
        /**
         * 向API发起
         * @param Data 
         */
        function launch(Data: { UserName: "", folderId?: "" | null; items: Array<string>; }, Callback?) {
            if (!Data.items.length) return;
            ToEagle.SetNewFolder("来自" + Data.UserName + "的微博").then(EagleinfoData => {
                Data.folderId = EagleinfoData.data.id;
                ToEagle.AddImagesURLAll(Data).then(e => {
                    Callback && Callback()
                })
            }).catch(err => {
                alert("无法连接Eagle  请检查是否未打开")
            })
        }
        /**
         * 获取和发送图片的主函数
         * @param event 
         * @param CardMain 
         * @param Btn 
         */
        function Btn___GotuEagle__Click(event: Event, CardMain: Element, Btn: Element) {
            event.stopPropagation();
            event.preventDefault();
            /*
            *移除按钮
            */
            function DelBtn(This){
                This.remove();
            }
            //判断是否允许运行
            if (!HM.UserAgreement()) return;
            const _Vue = Vue_Get_images(event, CardMain, Btn);
            if (_Vue.items.length) return launch(_Vue,DelBtn(Btn));
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
                    })
                ,DelBtn(Btn)
                )
            }


        }


        Main.buttonElement = NewElement(Main.buttonElement, Main.buttonMain, "GotuEagle", null, { class: "woo-box-item-flex toolbar_item_1ky_D", });
        // 开始执行用户可操作功能
        // --------------------------------------------------------------------------------------------
        /**
         * 执行按钮添加
         */
        function SetButAll() {
            // 获取所有卡片
            const domNodeList = $(Main.Main)?.querySelectorAll(Main.Card);
            if (!domNodeList?.length) return;
            const domList = [...domNodeList];
            for (const element of domList) {
                // 防止第二次添加
                if (!element['SetGotuEagle'] && !element.querySelector("#GotuEagle")) {
                    //卡片中没有被允许的对象  
                    if (!element.querySelector(Main.AddSwitch)) continue
                    NewElement(Main.buttonElement, Main.buttonMain, "GotuEagle", element.querySelector(Main.button), {
                        class: "woo-box-item-flex toolbar_item_1ky_D",
                        // 点击事件
                        event: ["click", function (event: Event) {
                            // 事件不再冒泡
                            event.stopPropagation();
                            event.preventDefault();
                            let request = Btn___GotuEagle__Click(event, element, this);
                        }]
                    });
                    // 防止第二次添加
                    element['SetGotuEagle'] = true;
                }
            }

        }
        SetButAll()  // 执行按钮添加
        // 控制条事件
        document.addEventListener("scroll", function () {
            // 用户不同意协议 不再添加按钮
            if (HM.OFF) return
            // 1.5秒内只执行一次
            if (shake.isset("scroll", 1500)) return;
            SetButAll()
        })

        // --------------------------------------------------------------------------------------------
        //为按钮添加CSS
        NewElement(
            "style",
            `\n#GotuEagle{color: grey;stroke:grey;fill: grey;}#GotuEagle svg:hover{stroke:#ff8200;fill: #ff8200;}#GotuEagle:hover{color: #ff8200;}#GotuEagle a{color: grey;}`,
            "HMCss",
            "body")










        //debugger;
        setInterval(function () {
            if (!unsafeWindow.HM) return; unsafeWindow.HM = false;
            debugger;
            console.log("this=> ", this);
        }, 1200)

    }
    // 延时等待页面加载

    ; (async function (): Promise<void> {
        let Error_NUMBER_OF=0;
        async function Fun_Goto(){
            Error_NUMBER_OF+=1;
             await Sleep(1500);
             Fun_toPromise(FunMian)
            .catch(async function (/*失败第一次*/) {
                if(Error_NUMBER_OF>3)return/*4次了放弃治疗*/
                await Sleep(1500);
                console.error("脚本错误第"+Error_NUMBER_OF+"次", this)
                return Fun_Goto();
            })
        };
        Fun_Goto();
    })();


})(
    unsafeWindow, {/**Store*/"Get": GM_getValue, "Set": GM_setValue, "get": GM_getValue, "set": GM_setValue },
    // 模拟现代浏览器才有的jq选择器方法
    /**
     * 获取单个元素
     * @param ElName 
     * @returns {Element}
     */
    function $(ElName: string): Element {
        const $Element = document.querySelector(ElName);
        return $Element;
    },
    /**
     * 获取多个元素
     * @param ElName 
     * @returns  {Element}
     */
    function $$(ElName: string): NodeList {
        const $NodeList = document.querySelectorAll(ElName);
        return $NodeList
    }
);






/*设置本地存储'name'的值*/
declare function GM_setValue(name: string, value: any): void;
/*从存储中获取'name'的值*/
declare function GM_getValue(name: string, defaultValue?: any): string | number | object | any | Array<any>;
/**
 * 系统窗口的变量
 */
declare var unsafeWindow: Window;
interface Window {
    HM: boolean;
}
interface folder_Run_Data {
    "status": "success",
    "data": {
        "id": "KBJJSMMVF9WYL",
        "name": "文件夹名称",
        "images": [],
        "folders": [],
        "modificationTime": 1592409993367,
        "imagesMappings": {},
        "tags": [],
        "parent": "KRFUPRMIMSNFP",
        "children": [],
        "isExpand": true
    }
}
interface addFromURLs {
    "items": [
        {
            "url": "...jpg",
            "name": "Work",
            "website": "...",
            "tags": ["便签", "Design"],
            "modificationTime": 1591325171767,
            "headers": {
                "referer": "..."
            }
        }
    ],
    "folderId": "KAY6NTU6UYI5Qa"
}
interface folderData {
    "folderName": "文件夹名称"
    "parent"?: "KRFUPRMIMSNFP"
}
declare var ToEagle: any;
interface ToEagle {
    /**
 * 批量添加网络图片
 * @param Obj Eafle支持的数据
 * @param ID 文件夹ID
 */
    AddImagesURLAll(Obj: addFromURLs, ID?: null | string): Promise<{ "status": "success" }>;
    /**
* 创建文件夹
* @param folderName 文件夹名称
* @param parent 添加到哪个文件夹
*/
    SetNewFolder(folderName: folderData, ID?: null | string): Promise<folder_Run_Data>
    /**
* 集成工具集 异步阻塞(进程阻塞 进程休眠)
* @param ms 毫秒
* @returns 
* 调用： await this._Sleep(500);
*/
    _Sleep(ms: number): Promise<void>
}

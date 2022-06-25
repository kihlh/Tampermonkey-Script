
// ==UserScript==
// @name                Eagle淘宝工具箱
// @name:zh-CN          Eagle淘宝工具箱
// @name:en-US          Eagle In Taobao's toolbox
// @description         一键发送商品主图,详情页,SKU,长图,主图视频,买家秀,全尺寸详情到Eagle软件中，方便数据收集和分析
// @author              黄逗酱酱
// @match               *://chaoshi.detail.tmall.com/*
// @match               *://detail.1688.com/offer/*
// @match               *://item.taobao.com/*
// @match               *://detail.tmall.com/*
// @match               *://h5.m.taobao.com*
// @match               *://detail.m.tmall.com*
// @match               *://chaoshi.detail.tmall.com/*
// @match               *://kiic.top/*
// @connect             http://localhost:41595
// @connect             127.0.0.1:41595
// @connect             kiic.top
// @grant               GM_xmlhttpRequest
// @grant               GM_setClipboard
// @grant               GM_setValue
// @grant               GM_getValue
// @grant               GM_removeValueChangeListener
// @grant               GM_addValueChangeListener
// @grant               GM_listValues
// @grant               GM_deleteValue
// @grant               unsafeWindow
// @run-at              document-body
// @icon                https://cos.kiic.top/_APP__SDK/taobaozhushuo-icon.png
// @version             3.11
// @license             MPL-2.0
// @namespace           https://greasyfork.org/users/710095
// @compatible          chrome
// @compatible          edge
// @compatible          safari
// @compatible          firefox
// @require             https://cdn.bootcdn.net/ajax/libs/nprogress/0.2.0/nprogress.min.js
// @RequireNote         涓流进度条
// @require             https://greasyfork.org/scripts/430351-eagle%E4%BA%A4%E4%BA%92%E8%84%9A%E6%9C%AC/code/Eagle%E4%BA%A4%E4%BA%92%E8%84%9A%E6%9C%AC.js?version=957317
// @RequireNote         Eagle交互脚本
// @require             https://greasyfork.org/scripts/442667-on-change%E8%BD%AC%E4%B8%BA%E6%B5%8F%E8%A7%88%E5%99%A8%E5%8F%AF%E7%94%A8/code/on-Change%E8%BD%AC%E4%B8%BA%E6%B5%8F%E8%A7%88%E5%99%A8%E5%8F%AF%E7%94%A8.js?version=1037496
// @RequireNote         对象监听
// @require             https://greasyfork.org/scripts/443032-%E5%9B%BE%E7%89%87%E6%8B%BC%E6%8E%A5/code/%E5%9B%BE%E7%89%87%E6%8B%BC%E6%8E%A5.js?version=1043571
// @RequireNote         合成图片(拼接)
// @require             https://cdn.bootcdn.net/ajax/libs/keypress/2.1.5/keypress.min.js
// @RequireNote         快捷键功能支持  https://github.com/dmauro/Keypress  documen: http://dmauro.github.io/Keypress/
// @SourceCodeLink      源代码链接：https://cos.kiic.top/_APP__SDK/ScriptsAPP/EagleTaoBaoZhuShou.ts
// @SourceCodeLink      源代码链接：https://github.com/kihlh/Tampermonkey-Script/tree/main/Eagle
// @esbulid             esbuild ./Eagle_In_Taobao_toolbox/index.ts --platform=browser --watch --bundle --analyze=verbose --format=cjs --tree-shaking=true --sourcemap --target=chrome58 --target=firefox57 --outfile=index0.js
// @date                2022-06-21
// ==/UserScript==

(function (win, WebWin, setTimeout, GM_setClipboard, Btn_Gather: Btn_Gather, Version = Number(GM_info.script.version.replace(".", '')), date = (+ new Date()), FolderID?: folder_Run_Data,) {


    function SetObjectValue(target: object, key: string, newValue: any) {
        return Object.defineProperty(target, key, { value: newValue, writable: true, enumerable: true, configurable: true });
    }
    function GetObjectValue(target: object, key: string) {
        return Object.getOwnPropertyDescriptor(target, key)?.value || undefined;
    }
    function IsDef(value: any) {
        return typeof value == "undefined" && value !== null
    }
    /**顺序数值编号器 参数：开始数字，位数(2=01,3=001) */
    function MIU_NUM(num: number, n: number) {
        return (Array(n).join(String(0)) + num).slice(-n);
    }
    let Store = (function () {
        class Store {
            _data = {}
            constructor() {
                let StoreClassThis = this;
                this._data = this.Get();
                // 对本脚本设置数据变化进行实时监听
                for (const on_key of GM_listValues()) {
                    this.on(on_key, function (key: string, OidValue: any, NewValue: any, remote: boolean) {
                        SetObjectValue(StoreClassThis._data, key, NewValue)
                    })
                }

            }
            get data() {
                return this._data;
            }
            Get(KeyName?: string, defaultValue?: any) {
                if (typeof KeyName == "undefined") {
                    let StoreData = {};
                    for (const key of GM_listValues()) {
                        SetObjectValue(StoreData, key, GM_getValue(key))
                    }
                    return StoreData
                }
                if (KeyName != undefined) return GM_getValue(KeyName, defaultValue)
            }
            remove(KeyName: string) {
                return GM_deleteValue(KeyName)
            }
            on(key: string, Callback: (this: Store["_data"], key: string, OidValue: any, NewValue: any, remote: boolean) => void) {
                let StoreClassThis = this;
                return GM_addValueChangeListener(key, function (...a) {
                    Callback.apply(StoreClassThis._data, a)
                })
            }
            Set(name: string, value: any) {
                return GM_setValue(name, value)
            }
        }

        interface Store {
            _data: {}
        }

        return new Store();
    })();
    let FilterURL = {
        /**过滤视频链接 */
        FilterVideoURL: /http:\/\/blob:|item\.taobao\.com\//i,
    }
    let APIPreset = {

        /**所有需要加载CSS都会在这里压入 */
        "CSS": ["https://cos.kiic.top/assets/GreasyFork/EagleToolUI.css","https://cdn.bootcdn.net/ajax/libs/nprogress/0.2.0/nprogress.css",],
        /**检查更新的接口 可以自行更改版本永远是整数值  比如3.01 则为300 */
        "Update": "https://api.kiic.top/APP/GM_TB",
        /**脚本更新的主页 */
        "ScriptHome": "https://greasyfork.org/zh-CN/scripts/417000-eagle%E6%B7%98%E5%AE%9D%E5%B7%A5%E5%85%B7%E7%AE%B1",
        /**各种直接通过js加载的图标  
         * !不包含html代码中的图标
         * */
        ICON: {
            icon: "https://cos.kiic.top/_APP__SDK/taobaozhushuo-icon.svg"
        },
        /**Eagle唤醒 */
        "OpenEagle": "eagle:\/\/"
    }
    // 对第一次使用的用户返回使用的版本号，防止漏更新
    let First = Store.Get("Setup.UpdateSwitchVersion") || false;
    type EventName = "add" | "has" | "delete" | "clear" | "size" | "append";
    type HM_SetValue = any | null | undefined;
    type HM_Event = {
        add: (Value: HM_SetValue) => void
        has: (Value: HM_SetValue) => void
        delete: (Value: HM_SetValue) => void
        clear: () => void
        size: (size: number) => void
        append: (Value: HM_SetValue) => void
    }
    if (Store.Get("User_OFF")) return;
    // 原本打算用二叉树对象存储但是考虑兼容性 直接全键值存储
    if (!Store.Get("shortcut.ToEagleAllImages")) {
        let AddShortcut = {
            "ToEagleAllImages": "Shift+S",
            "CopyLink": null,
            "DetailPage": null,
            "SKU": null,
            "ShopWindow": null,
            "ShowAllBtn": null,
            "SetTakeShortcut": null,
            "Video": null,
            "Push_Download_DetailPage": null,
        };
        for (const key in AddShortcut) {
            Store.Set("shortcut.".concat(key), Object.getOwnPropertyDescriptor(AddShortcut, key)?.value || null)
        }
    }
    let listener = new win.keypress.Listener();
    // 模拟现代浏览器才有的jq选择器方法
    /**
     * 获取单个元素
     * @param ElName
     * @returns {Element}
     */
    function $(ElName?: string): Element | null {
        if (!ElName) return document.querySelector("body");
        const $Element = document.querySelector(ElName);
        return $Element || null;
    }
    /**
     * 获取多个元素
     * @param ElName
     * @returns  {Element}
     */
    function $$(ElName: string): NodeList {
        const $NodeList = document.querySelectorAll(ElName);
        return $NodeList;
    }
    /**
     * 添加CSS代码/CSS链接
     * @param Code 代码或者链接/或者数组(多个代码)
     * @param LinkMode 是否以href链接方式写入
     */
    function AddStyle(Code: string | string[] | Set<string>, LinkMode?: boolean): HTMLLinkElement | HTMLLinkElement[] | Set<HTMLLinkElement> | HTMLStyleElement | HTMLStyleElement[] | Set<HTMLStyleElement> | undefined {
        let Head = $('head');
        function AddAdjStyle(Code: string) {
            if (!LinkMode) {
                let NewElement = document.createElement('style');
                NewElement.setAttribute("type", "text/css");
                NewElement.setAttribute("Signer", "Kiic");
                Head?.appendChild(NewElement)
                return NewElement
            }
            let NewElement = document.createElement('link');
            NewElement.setAttribute("rel", "stylesheet");
            NewElement.setAttribute("href", Code);
            NewElement.setAttribute("type", "text/css");
            Head?.appendChild(NewElement)
            return NewElement
        }
        if (Code instanceof String) return AddAdjStyle(String(Code))
        let RunElementList = [];
        if (Code instanceof Array || Code instanceof Set) {
            for (const ForCode of Code) {
                RunElementList.push(AddAdjStyle(ForCode));
            }
        }
        if (Code instanceof Array) return RunElementList
        if (Code instanceof Set) return new Set(RunElementList)
    }

    AddStyle(APIPreset.CSS, true)
    /**
     *  代码阻塞
     *
     * @param {*} ms 毫秒
     * @return undefined
     * 调用： await this._Sleep(500);
     */
    function Sleep(ms: number): Promise<unknown> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // 主题（UI）
    let Theme = {
        Replace(Data: string, ReplaceList: ReplaceList): string {
            for (const iterator of ReplaceList) {
                let Lock = new RegExp(iterator[0], 'g')
                Data = Data.replace(Lock, iterator[1])
            }
            return Data
        },
        /**API 无法连接 */
        API_Failure(ReplaceList?: ReplaceList): string {
            let Element_Code = `<div id="APPMain">
                <div id="InfoFrame">
                    <!-- 左上角关闭按钮 -->
                    <div class="Menu">
                        <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" fill-opacity=".01" d="M0 0h48v48H0z"/><path d="M14 14l20 20M14 34l20-20" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div class="HM-TextMain">
                        <h1>无法连接API</h1>
                        <a>已经对API发送了处理的请求</a>
                        <a>但是API并未返回处理结果</a>
                        <a></br></a>
                        <a>您可以检查以下内容</a>
                        <a>①检查Eagle软件是否已经启动</a>
                        <a>②已允许脚本链接网络(需要连接EagleAPI)</a>
                        <a>③依然失败则重启Eagle</a>
                        <a>④检查脚本是否是最新版本</a>
                    </div>
                    <div class="HM-info-images">
                        <img src="https://cos.kiic.top/_APP__SDK/ScriptsAPP/404_Error.svg">
                    </div>
                    <div class="HMbutton" >
                        <cii>尝试唤醒</cii>
                    </div>
            
                </div>
            
                <style>
                    #APPMain {
                        backdrop-filter: blur(2px);
                        top: 0px;
                        left: 0px;
                        animation: prompt_boxMainBackkk 0.5s;
                        width: 100vw;
                        height: 100vh;
                        position: fixed;
                        z-index: 999999999999999;
                        display: flex;
                        align-content: center;
                        justify-content: center;
                        align-items: center;
                    }
            
                    #APPMain a {
                        text-decoration: none;
                        font-family: auto;
                    }
            
                    #APPMain h1,
                    h2,
                    h3,
                    h4,
                    h5,
                    h6 {
                        font-size: 200%;
                        font-weight: normal;
                        font-family: auto;
                    }
            
                    #APPMain * {
                        -webkit-user-drag: none;
                        user-select: none;
                    }
            
                    @keyframes prompt_boxMainBackkk {
                        0% {
                            backdrop-filter: blur(0.2px);
                            opacity: 0.25;
                        }
            
                        25% {
                            backdrop-filter: blur(0.5px);
                            opacity: 0.5;
                        }
            
                        50% {
                            backdrop-filter: blur(1px);
                            opacity: 1;
                        }
            
                        100% {
                            backdrop-filter: blur(2px);
                            opacity: 1;
                        }
                    }
            
                    #APPMain  #InfoFrame {
                        border-radius: 40px;
                        overflow: hidden;
                        background: linear-gradient(131.46deg, #f6f7fb 2.97%, rgb(246 247 251) 150.02%);
                        box-shadow: 0px 2px 27px rgb(25 32 56 / 9%);
                        height: 423px;
                        width: 534px;
                        position: relative;
                        z-index: 99999;
                    }
            
                    #APPMain  .Menu {
                        background: #0000;
                        position: absolute;
                        width: 24px;
                        height: 24px;
                        right: 25px;
                        top: 25px;
                        border: 1px solid #7E8C95;
                        border-radius: 15px;
                        display: flex;
                        flex-direction: row;
                        align-content: center;
                        justify-content: center;
                        align-items: center;
                        z-index: 100000;
                    }
            
                    #APPMain  .Menu:hover {
                        cursor: pointer;
                        border: 1px solid #505b62;
                    }
                    #APPMain  .HM-TextMain h1{
                        padding-bottom: 30px;
                    }
                    #APPMain  .HM-TextMain {
                        position: absolute;
                        width: 282px;
                        height: 92px;
                        left: 42px;
                        top: 75px;
                        font-family: 'Roboto';
                        font-style: normal;
                        font-weight: 500;
                        font-size: 14px;
                        line-height: 15px;
                        color: #1C3177;
                        display: flex;
                        flex-direction: column;
                        align-content: flex-start;
                        align-items: flex-start;
                    }
            
                    #APPMain  .HM-TextMain a {
                        padding: 3.9px;
                    }
            
                    #APPMain  .HM-info-images {
                        width: 230px;
                        height: 230px;
                        position: absolute;
                        top: 11%;
                        right: 5%
                    }
            
                    #APPMain  .HM-info-images img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
            
                    #APPMain  .HMbutton:hover {
                        transform: scale(1.15)
                    }
            
                    #APPMain  .HMbutton {
                        position: absolute;
                        z-index: 999999;
                        background: linear-gradient(274.42deg, #92A3FD 0%, #9DCEFF 124.45%);
                        border-radius: 86.8684px;
                        width: 115px;
                        height: 40px;
                        color: white;
                        letter-spacing: 0.06em;
                        font-size: 17px;
                        border-width: 0px;
                        cursor: pointer;
                        bottom: 116px;
                        right: 68px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        align-content: center;
                        font-family: auto;
                    }
                </style>
                        </div>`
            if (ReplaceList) Element_Code = this.Replace(Element_Code, ReplaceList)
            return Element_Code
        },
        /**APP 主界面 */
        APP_Main(ReplaceList?: ReplaceList): string {
            let ICON = APIPreset.ICON.icon
            let Element_Code = `
            <div id="HM_APP_Main">
                <img class="Center" src="${ICON}">
                <div class="link_BtnList"></div>
                <div id="BtnList" class="popIn">
                    <div class="btn_Unit" id="CollectAllSetEagle">
                        <div class="btn_Unit_back">
                            <div class="icon">
                                <img src="${ICON}">
                            </div>
                            <div class="Purpose"><a>收藏全部</a></div>
                        </div>
                    </div>
                    <!--  -->
                    <div class="btn_Unit" id="CollectDetailPageSetEagle">
                        <div class="btn_Unit_back">
                            <div class="icon">
                                <img src="${ICON}">
                            </div>
                            <div class="Purpose"><a>收藏详情</a></div>
                        </div>
                    </div>
                    <div class="btn_Unit  ShowAll"  id="ShowAllBtn" >
                        <div class="btn_Unit_back ">
                            <div class="icon">
                                <img src="${ICON}">
                            </div>
                            <div class="Purpose"><a>更多选项</a></div>
                        </div>
                    </div>
                    <div class="btn_Unit All"  id="Collect_SKU_SetEagle" style="display: none;">
                        <div class="btn_Unit_back">
                            <div class="icon">
                                <img src="${ICON}">
                            </div>
                            <div class="Purpose"><a>收藏SKU</a></div>
                        </div>
                    </div>
                    <div class="btn_Unit All"  id="Collect_ShopWindow_SetEagle"  style="display: none;">
                        <div class="btn_Unit_back">
                            <div class="icon">
                                <img src="${ICON}">
                            </div>
                            <div class="Purpose"><a>收藏主图</a></div>
                        </div>
                    </div>
                    <div class="btn_Unit All"  id="Collect_Video_SetEagle"  style="display: none;">
                        <div class="btn_Unit_back">
                            <div class="icon">
                                <img src="${ICON}">
                            </div>
                            <div class="Purpose"><a>收藏视频</a></div>
                        </div>
                    </div>
                    <div class="btn_Unit All"  id="CopyLink"  style="display: none;">
                        <div class="btn_Unit_back">
                            <div class="icon">
                                <img src="${ICON}">
                            </div>
                            <div class="Purpose"><a>复制短链</a></div>
                        </div>
                    </div>
                    <div class="btn_Unit All"  id="Download_DetailPage"  style="display: none;">
                        <div class="btn_Unit_back">
                            <div class="icon">
                                <img src="${ICON}">
                            </div>
                            <div class="Purpose"><a>下全页详情</a></div>
                        </div>
                    </div>
                    <div class="btn_Unit All"  id="userShowToEagle"  style="display: none;">
                    <div class="btn_Unit_back">
                        <div class="icon">
                            <img src="${ICON}">
                        </div>
                        <div class="Purpose"><a>评论快采(双击设置)</a></div>
                    </div>
                </div>
                    <div class="btn_Unit All"  id="SetTakeShortcut"  style="display: none;">
                    <div class="btn_Unit_back">
                        <div class="icon">
                            <img src="${ICON}">
                        </div>
                        <div class="Purpose"><a>设置快捷键</a></div>
                    </div>
                </div>
                    <div class="Purpose Version Center"   id="VersionLink"  ><a>已是最新版${String(Version).replace(/(.+)(..)$/, "$1.$2")}</a></div>
   
                    <!--  -->
            
                </div>
            </div>
            
            <style>
            #nprogress .bar{z-index:9999999999999999999999;}
            #HM_APP_Main {
               z-index: 9999999999999999999999;
               cursor: pointer;
            }
            #HM_APP_Main .Center,
            #HM_APP_Main .btn_Unit .icon {
                    display: grid;
                    align-content: center;
                    justify-content: center;
                    align-items: center;
                }
            
                #HM_APP_Main img {
                    width: 100%;
                    height: auto;
                }
            
                #HM_APP_Main {
                    position: fixed;
                    right: 3.5em;
                    bottom: 5em;
                    width: 50px;
                    height: 50px;
            
                }
            
                #HM_APP_Main .btn_Unit_back {
                    width: 91%;
                    height: 75%;
                    display: flex;
                    flex-direction: row;
                    align-content: center;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                }
            
                #HM_APP_Main .btn_Unit_back:hover {
                    background: whitesmoke;
            
                }
            
                #HM_APP_Main .Purpose {
                    margin: 0 0 0 11px;
                    opacity: .8;
                    font-size: 13px;
                }
                #HM_APP_Main .Purpose a{
                 color: #000;
                }
                #HM_APP_Main .btn_Unit .icon {
                    width: 25px;
                    height: auto;
                }
            
                #HM_APP_Main #BtnList .btn_Unit {
                    -webkit-user-drag: none;
                    cursor: pointer;
                    width: 100%;
                    height: 50px;
                    display: flex;
                    flex-direction: row;
                    align-content: center;
                    align-items: center;
                    justify-content: center;
                }
            
            
                #HM_APP_Main #BtnList {
                    position: fixed;
                    width: 191px;
                    height: auto;
                    right: 130px;
                    bottom: 39px;
                    background: #FFFFFF;
                    box-shadow: 3px 4px 16px rgb(0 0 0 / 12%);
                    border-radius: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    align-content: center;
                    flex-direction: column;
                    display: none;
                }
            
                #HM_APP_Main .link_BtnList {
                    width: 5em;
                    height: 14em;
                    top: -7em;
                    right: 40px;
                    position: absolute;
                    -webkit-user-drag: none;
                    opacity: 0;
                }
            
                #HM_APP_Main:hover #BtnList,
                #HM_APP_Main .link_BtnList:hover,
                #HM_APP_Main .show,
                [show] {
                    display: block;
            
                }
            
                #HM_APP_Main img {
                    width: 100%;
                    height: 100%;
            
                }
            
                #HM_APP_Main img,#HM_APP_Main a {
                    -webkit-user-drag: none;
                    pointer-events: none;
                    user-select: none;
                }
            
                #HM_APP_Main .hide,
                [hide] {
                    display: none;
                }
                #HM_APP_Main  .Version{
                   height: 30px;
                }
                #HM_APP_Main  .Version a{
                   color: #2953ff9c;
                   font-size: 13px;
                }
            </style>`;
            if (ReplaceList) Element_Code = this.Replace(Element_Code, ReplaceList)
            return Element_Code
        },
        /**APP 用户协议 */
        UserAgreement(ReplaceList?: ReplaceList): string {
            let Element_Code = `
            <div style="display: block;" id="HM_UserAgre">
    <div style="position: fixed; max-width: 0.1px; max-height: 0.1px; overflow: hidden;top: 900vh;left: 900vw;">
        <!-- 导入图片 -->
        <img src="https://cos.kiic.top/_APP__SDK/ScriptsAPP/FirstUse_TextMain_UserAgreement_background%40Text.svg">
        <img src="https://cos.kiic.top/_APP__SDK/ScriptsAPP/FirstUse_TextMain_UserAgreement_background.svg">
    </div>
    <div class="prompt_boxMain_Center">
        <div class="prompt_Main">
            <!-- 左上角关闭按钮 -->
            <div class="Menu" >
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" fill-opacity=".01" d="M0 0h48v48H0z"/><path d="M14 14l20 20M14 34l20-20" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="NextMenu_Default" ><cii>下一步</cii></div>
            <div class="prompt_boxBox_Main">
                <div id="FirstUse">
                    <div class="FirstUse_TextMain">
                        <h1>欢迎使用!</h1>
                        <a>这是您第一次试用</a>
                        <a>为了您更加清楚插件用途</a>
                        <a>您需要阅读并且同意用户协议</a>
                        <a>我们仅会询问一次</a>
                        <a>当您关闭此协议我们将不再启用脚本</a>
                        <a>第一次使用该版本也会收到该消息</a>
                    </div>
                    <img style="margin: 15px 0 0 0;" alt="欢迎使用.svg" id="FirstUse"
                        src="https://cos.kiic.top/_APP__SDK/ScriptsAPP/FirstUse_TextMain_UserAgreement_background.svg">
                </div>
                <div id="FirstUse_Next" style="display: none;">
                    <div class="study">
                        <img
                            src="https://cos.kiic.top/_APP__SDK/ScriptsAPP/FirstUse_TextMain_UserAgreement_background%40Text.svg">
                    </div>
                    <div class="FirstUse_TextMain">
                        <h1 style="font-size: 1.5em;">用户协议</h1>
                        <a class="NextText_1">点击开始使用后则认为我同意以下内容</a>
                        <a class="NextText_2">仅作为查看,学习,观赏图片用途</br>
                            我将在稍后移除引用</br>
                            我不会查看所有页面不提供的内容</br>
                            我允许脚本在我操作时候对Eagle数据库进行读写</br>
                            在本网页关闭后我将移除引用</a>
                        <a class="NextText_3">以下为名称解释：</a>
                        <a class="NextText_4">我:用户或使用者,</br>
                            引用:包含但不限于查看,保存,储存,展示</br>
                            本站:当前域名当前网页包含但不限于相关页面</a>
                    </div>
                </div>

                <!-- <img style="display: none;margin: 16px 0 0 0;" alt="用户协议.png" id="FirstUse_Next"
                    src="https://hmc-m.oss-cn-shanghai.aliyuncs.com/%E7%94%A8%E6%88%B7%E5%8D%8F%E8%AE%AE.png"> -->
            </div>

        </div>
        <style>
        #HM_UserAgre .NextMenu_Default {
            position: absolute;
            z-index: 999999;
            background: linear-gradient(274.42deg, #92A3FD 0%, #9DCEFF 124.45%);
            border-radius: 86.8684px;
            width: 95px;
            height: 40px;
            color: white;
            font-size: 17px;
            border-width: 0px;
            cursor: pointer;
            bottom: 86px;
            left: 38px;
        }
        #HM_UserAgre .NextMenu {
            position: absolute;
            z-index: 999999;
            bottom: 90px;
            right: 70px;
            background: linear-gradient(274.42deg, #92A3FD 0%, #9DCEFF 124.45%);
            border-radius: 86.8684px;
            width: 95px;
            height: 40px;
            color: white;
            font-size: 17px;
            border-width: 0px;
            cursor: pointer;
        }
        #HM_UserAgre h1, h2, h3, h4, h5, h6 {
            font-size:200%;
            font-weight:normal;
            font-family: auto;
        }
        #HM_UserAgre  a{ text-decoration:none;    font-family: auto;}

         #HM_UserAgre #FirstUse_Next a,
            h1 {
                color: #4A707A;
            }

            #HM_UserAgre .FirstUse_TextMain {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }

            #HM_UserAgre .NextText_1 {
                font-size: 14px;
                text-decoration-line: underline;
                height: 1;
            }

            #HM_UserAgre .NextText_2 {
                font-size: 13px;
                padding-top: 30px;
            }

            #HM_UserAgre .NextText_3{
                font-size: 13px;
                padding-top: 30px;
            }

            #HM_UserAgre .NextText_4 {
                font-size: 11px;
                padding-top: 7px;
            }

            #HM_UserAgre #FirstUse_Next>div.FirstUse_TextMain a {line-height: 175%;}

            #HM_UserAgre .FirstUse_TextMain {
                position: absolute;
                top: 50px;
                left: 50px;
            }

            #HM_UserAgre #FirstUse_Next .study {
                width: 100px;
                height: 100px;
                position: absolute;
                right: 150px;
                top: 60px;
            }

            #HM_UserAgre #FirstUse .FirstUse_TextMain {
                color: rgb(28, 49, 119);
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                position: absolute;
                left: 40px;
                top: 57px;

            }
            #HM_UserAgre #FirstUse h1{
                color:#1C3177;
                padding-bottom: 20px;
            }
            #HM_UserAgre #FirstUse .FirstUse_TextMain a {
                font-size: 13px;
                padding: 0 0 8px 0;
            }

            #HM_UserAgre .NextMenu:hover,.NextMenu_Default:hover {
                transform: scale(1.15)
            }

            #HM_UserAgre .prompt_boxMain_Center {
                backdrop-filter: blur(2px);
                top: 0px;
                left: 0px;
                animation: prompt_boxMainBackkk 0.5s;
                width: 100vw;
                height: 100vh;
                position: fixed;
                z-index: 999999999999999;
                display: flex;
                align-content: center;
                justify-content: center;
                align-items: center;
            }

            #HM_UserAgre .prompt_boxMain_Center * {
                -webkit-user-drag: none;
                user-select: none;
            }

            #HM_UserAgre .prompt_Main {
                border-radius: 40px;
                overflow: hidden;
                background: linear-gradient(131.46deg, #f6f7fb 2.97%, rgb(246 247 251) 150.02%);
                box-shadow: 0px 2px 27px rgb(25 32 56 / 9%);
                height: 423px;
                width: 534px;
                position: relative;
                z-index: 99999;
            }
            #HM_UserAgre .NextMenu,.NextMenu_Default {
                display: grid;
                justify-content: center;
                align-items: center;
            }
            #HM_UserAgre .prompt_boxMain_Center .Menu {
                background: #0000;
                position: absolute;
                width: 24px;
                height: 24px;
                right: 25px;
                top: 25px;
                border: 1px solid #7E8C95;
                border-radius: 15px;
                display: flex;
                flex-direction: row;
                align-content: center;
                justify-content: center;
                align-items: center;
                z-index: 100000;
            }

            #HM_UserAgre .prompt_boxMain_Center .Menu:hover {
                cursor: pointer;
                border: 1px solid #505b62;
            }

            #HM_UserAgre .prompt_boxMain_Center img,
            i {
                -webkit-user-drag: none;
            }

            @keyframes prompt_boxMainBackkk {
                0% {
                    backdrop-filter: blur(0.2px);
                    opacity: 0.25;
                }

                25% {
                    backdrop-filter: blur(0.5px);
                    opacity: 0.5;
                }

                50% {
                    backdrop-filter: blur(1px);
                    opacity: 1;
                }

                100% {
                    backdrop-filter: blur(2px);
                    opacity: 1;
                }
            }

            #HM_UserAgre .prompt_boxBox_Main {
                display: flex;
                position: absolute;
                bottom: 0px;
                width: 100%;
                height: 100%;
                align-content: center;
                justify-content: center;
                align-items: center;
                z-index: 99999;
            }
           

        </style>
    </div>
</div>
            `;
            if (ReplaceList) Element_Code = this.Replace(Element_Code, ReplaceList)
            return Element_Code
        },
        /**APP 快捷键设置 */
        SetTakeShortcut(ReplaceList?: ReplaceList): string {
            let Element_Code = `
            <div id="DefaultMain">
    <div id="InfoFrame">
        <!-- 左上角关闭按钮 -->
        <div class="Menu" @click="Shortcut.EnterState=true;">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#fff" fill-opacity=".01" d="M0 0h48v48H0z" />
                <path d="M14 14l20 20M14 34l20-20" stroke="#333" stroke-width="4" stroke-linecap="round"
                    stroke-linejoin="round" />
            </svg>
        </div>
        <div id="Main" >
            <!-- 标题 -->
            <div class="titleMain">
                <a class="title">{{Shortcut.title}}</a>
                <a class="introduce">{{Shortcut.introduce}}</a>
            </div>
            <!-- 两个基础交互按键 -->
            <div class="QuickMain">
                <div class="NowQuickFrame QuickFrame">
                    <a class="speak">{{Shortcut.NowQuick.speak}}</a>
                    <a class="Quick">{{Shortcut.NowQuick.Quick}}</a>
                </div>
                <div class="NewQuickFrame QuickFrame">
                    <a class="speak">{{Shortcut.NewQuick.speak}}</a>
                    <a class="Quick">{{Shortcut.NewQuick.Quick}}</a>
                </div>
            </div>
            <!-- 键盘监听显示按键 -->
            <div class="ON_TakeShortcutList" hide v-show="Shortcut.TakeShortcutList.size">
                <!-- <div class="FOR_TakeShortcut">
                    <a>{{item}}</a>
                </div> -->
            </div>
            <div class="SetTakeShortcutButtonList"  >
                <!-- <div class="Buttonitem" :class="item.frozen?'frozen':(item.click?'clicks':'')"
                    @click="SetTakeShortcutButtonClick(item)" v-for="(item, index) in ShortcutList" :key="index">
                    <div class="ICON absolute"><img :src="item.icon"></div>
                    <div class="Shortcut absolute"><a>{{item.Shortcut==null?'未设置':item.Shortcut}}</a></div>
                    <div class="name absolute"><a>{{item.name}}</a></div>
                    <div class="effect absolute"><a>{{item.effect}}</a></div>
                </div> -->
            </div>
        </div>
    </div>
    <style>
#DefaultMain{backdrop-filter:blur(2px);top:0;left:0;animation:prompt_boxMainBackkk .5s;width:100vw;height:100vh;position:fixed;z-index:999999999999999;display:flex;align-content:center;justify-content:center;align-items:center}#DefaultMain a{text-decoration:none;font-family:auto}#DefaultMain img{width:100%;height:100%}#DefaultMain h1,h2,h3,h4,h5,h6{font-size:200%;font-weight:400;font-family:auto}#DefaultMain *{-webkit-user-drag:none;user-select:none}@keyframes prompt_boxMainBackkk{0%{backdrop-filter:blur(.2px);opacity:.25}25%{backdrop-filter:blur(.5px);opacity:.5}50%{backdrop-filter:blur(1px);opacity:1}100%{backdrop-filter:blur(2px);opacity:1}}#DefaultMain #InfoFrame{border-radius:40px;overflow:hidden;background:linear-gradient(131.46deg,#f6f7fb 2.97%,rgb(246 247 251) 150.02%);box-shadow:0 2px 27px rgb(25 32 56 / 9%);height:423px;width:534px;position:relative;z-index:99999}#DefaultMain .Menu{background:#0000;position:absolute;width:24px;height:24px;right:25px;top:25px;border:1px solid #7e8c95;border-radius:15px;display:flex;flex-direction:row;align-content:center;justify-content:center;align-items:center;z-index:100000}#DefaultMain .Menu:hover{cursor:pointer;border:1px solid #505b62}#DefaultMain .HM-info-images{width:230px;height:230px;position:absolute;top:11%;right:5%}#DefaultMain .HM-info-images img{width:100%;height:100%;object-fit:cover}#DefaultMain .HMbutton:hover{transform:scale(1.15)}#DefaultMain .HMbutton{position:absolute;z-index:999999;background:linear-gradient(274.42deg,#92a3fd 0,#9dceff 124.45%);border-radius:86.8684px;width:115px;height:40px;color:#fff;letter-spacing:.06em;font-size:17px;border-width:0;cursor:pointer;bottom:116px;right:68px;display:flex;align-items:center;justify-content:center;align-content:center;font-family:auto}#DefaultMain #Main{width:100%;height:100%}#DefaultMain #Main .title{font-family:Poppins;font-style:normal;font-weight:700;font-size:16px;line-height:24px;color:#4a707a}#DefaultMain #Main .introduce{font-family:Poppins;font-style:normal;font-weight:400;font-size:11px;line-height:0;color:#94b0b7}#DefaultMain .titleMain{display:flex;flex-direction:column;align-content:flex-start;position:absolute;top:45px;left:38px}#DefaultMain .titleMain a{padding:6px}#DefaultMain .QuickMain{display:flex;position:absolute;right:70px;top:44px}#DefaultMain .QuickFrame{background:#fff;border:1px solid #94b0b7;box-sizing:border-box;border-radius:12px;width:117.21px;height:47.91px;display:flex;flex-direction:column;justify-content:space-evenly;padding:0 15px;margin-left:12px;align-content:center;align-items:center;cursor:pointer}#DefaultMain .QuickFrame .speak{font-family:Poppins;font-style:normal;font-weight:400;font-size:9px;line-height:24px;color:#4a707a;margin-left:-62px}#DefaultMain .QuickFrame .Quick{font-family:Poppins;font-style:normal;font-weight:700;font-size:16px;line-height:24px;color:#4a707a;margin-top:-6px}#DefaultMain .ON_TakeShortcutList{position:absolute;z-index:999;width:100%;height:100%;display:flex;flex-direction:row;align-content:center;justify-content:center;align-items:center;background:#ffffff57;backdrop-filter:blur(2px)}#DefaultMain .FOR_TakeShortcut{width:140px;background:rgba(92,92,104,.247);height:80px;display:grid;align-items:center;justify-content:center;align-content:center;overflow:hidden;border-radius:15px;animation:prompt_boxMainBackkk .5s;margin-right:15px}#DefaultMain .FOR_TakeShortcut a{color:#fff}#DefaultMain .Buttonitem{display:grid;align-content:center;justify-content:center;align-items:center;width:95%;height:95%;background:#c7dcf9;box-sizing:border-box;border-radius:10px;cursor:pointer;position:relative;border:2px solid #c7dcf9}#DefaultMain .Buttonitem.clicks{border:2px solid #7289f4}#DefaultMain .Buttonitem.clicks:hover{border:2px solid #7289f4}#DefaultMain .Buttonitem:hover{border:2px solid rgba(114,137,244,.21)}#DefaultMain .SetTakeShortcutButtonList{width:90%;left:5%;height:70%;position:absolute;bottom:12px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);grid-column-gap:10px;grid-row-gap:10px}#DefaultMain .SetTakeShortcutButtonList a{color:#fff}#DefaultMain .Buttonitem .effect{font-family:Inter;font-style:normal;font-weight:500;font-size:9px;line-height:18px;height:22px;left:12px;top:85px}#DefaultMain .Buttonitem .effect a{color:#868686}#DefaultMain .Buttonitem .name{font-style:normal;font-weight:700;font-size:19px;line-height:23px;left:9px;top:49px}#DefaultMain .Buttonitem .name a{color:#3c5190}#DefaultMain .Buttonitem .Shortcut{font-family:Inter;font-style:normal;font-weight:500;font-size:11px;line-height:13px;position:absolute;height:13px;left:50px;top:18px}#DefaultMain .Buttonitem .Shortcut a{color:#868686}#DefaultMain .Buttonitem .ICON{width:30px;height:30px;left:9px;top:9px}#DefaultMain .absolute{position:absolute}#DefaultMain .frozen{border:2px solid #e8e9ea;background:#e8e9ea;cursor:auto;pointer-events:none}#DefaultMain .frozen:hover{border:2px solid #e8e9ea}#DefaultMain [hide]{display:none}#DefaultMain [show]{display:block}#DefaultMain .ON_TakeShortcutList[show]{display:flex}
</style>
</div>`;
            if (ReplaceList) Element_Code = this.Replace(Element_Code, ReplaceList)
            return Element_Code
        },
        /**API默认框 */
        DefaultMain(ReplaceList?: ReplaceList): string {
            let Element_Code = `<div id="DefaultMain">
            <div id="InfoFrame">
                <!-- 左上角关闭按钮 -->
                <div class="Menu">
                    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#fff" fill-opacity=".01" d="M0 0h48v48H0z" />
                        <path d="M14 14l20 20M14 34l20-20" stroke="#333" stroke-width="4" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>
                <div id="Main">
        
                </div>
            </div>
        
            <style>
                #DefaultMain {
                    backdrop-filter: blur(2px);
                    top: 0px;
                    left: 0px;
                    animation: prompt_boxMainBackkk 0.5s;
                    width: 100vw;
                    height: 100vh;
                    position: fixed;
                    z-index: 999999999999999;
                    display: flex;
                    align-content: center;
                    justify-content: center;
                    align-items: center;
                }
        
                #DefaultMain a {
                    text-decoration: none;
                    font-family: auto;
                }
        
                #DefaultMain h1,
                h2,
                h3,
                h4,
                h5,
                h6 {
                    font-size: 200%;
                    font-weight: normal;
                    font-family: auto;
                }
        
                #DefaultMain * {
                    -webkit-user-drag: none;
                    user-select: none;
                }
        
                @keyframes prompt_boxMainBackkk {
                    0% {
                        backdrop-filter: blur(0.2px);
                        opacity: 0.25;
                    }
        
                    25% {
                        backdrop-filter: blur(0.5px);
                        opacity: 0.5;
                    }
        
                    50% {
                        backdrop-filter: blur(1px);
                        opacity: 1;
                    }
        
                    100% {
                        backdrop-filter: blur(2px);
                        opacity: 1;
                    }
                }
        
                #DefaultMain #InfoFrame {
                    border-radius: 40px;
                    overflow: hidden;
                    background: linear-gradient(131.46deg, #f6f7fb 2.97%, rgb(246 247 251) 150.02%);
                    box-shadow: 0px 2px 27px rgb(25 32 56 / 9%);
                    height: 423px;
                    width: 534px;
                    position: relative;
                    z-index: 99999;
                }
        
                #DefaultMain .Menu {
                    background: #0000;
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    right: 25px;
                    top: 25px;
                    border: 1px solid #7E8C95;
                    border-radius: 15px;
                    display: flex;
                    flex-direction: row;
                    align-content: center;
                    justify-content: center;
                    align-items: center;
                    z-index: 100000;
                }
        
                #DefaultMain .Menu:hover {
                    cursor: pointer;
                    border: 1px solid #505b62;
                }
        
                #DefaultMain .HM-info-images {
                    width: 230px;
                    height: 230px;
                    position: absolute;
                    top: 11%;
                    right: 5%
                }
        
                #DefaultMain .HM-info-images img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
        
                #DefaultMain .HMbutton:hover {
                    transform: scale(1.15)
                }
        
                #DefaultMain .HMbutton {
                    position: absolute;
                    z-index: 999999;
                    background: linear-gradient(274.42deg, #92A3FD 0%, #9DCEFF 124.45%);
                    border-radius: 86.8684px;
                    width: 115px;
                    height: 40px;
                    color: white;
                    letter-spacing: 0.06em;
                    font-size: 17px;
                    border-width: 0px;
                    cursor: pointer;
                    bottom: 116px;
                    right: 68px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    align-content: center;
                    font-family: auto;
                }
        
                #DefaultMain #Main {
                    width: 100%;
                    height: 100%;
                }
            </style>
        </div>
            `;
            if (ReplaceList) Element_Code = this.Replace(Element_Code, ReplaceList)
            return Element_Code
        },
        /**API默认框 */
        userShowToEagle(ReplaceList?: ReplaceList): string {
            let Element_Code = `<div class="HM-btn-user-show-to-eagle">
            <img src="https://cos.kiic.top/assets/GreasyFork/Eagle-icon-min-fffff.svg">
            <a>发送</a>
        </div>

        `;
            if (ReplaceList) Element_Code = this.Replace(Element_Code, ReplaceList)
            return Element_Code
        }
    }
    // 防抖节流
    const shake = {
        Data: new Set(),
        /**
         * 到期后自动删除 如果被添加将会返回true
         * - 使用方法： if (shake.isset("scroll", 1500)) return;
         * @param key 防抖的名称
         * @param time 毫秒
         * @return {boolean}
         */
        isset(key: string, time = 1200): boolean {
            if (this.Data.has(key)) return true;
            this.Data.add(key);
            time && setTimeout(() => this.Data.delete(key), time);
            return false;
        },
    };
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
    function NewElement(
        ElementType: NewElementType = "div",
        AddCode: string = "",
        id?: string,
        AddSelect?: Element | string | Node,
        options?: {
            style?: string;
            class?: any | Array<string> | string;
            event?: [string, Function];
        }
    ): Element | undefined {
        function CallType(a: any): string {
            return Object.prototype.toString.call(a);
        }
        // 如果传入的是元素则不新建而是复制元素
        const IsElementType = CallType(ElementType).includes("Element");
        // @ts-expect-error 允许不重新生产元素
        let NewDoment = IsElementType ? ElementType.cloneNode(true) : document.createElement(ElementType);
        NewDoment.id = id || "";
        if (!IsElementType) NewDoment.innerHTML = AddCode;
        for (const key in options) {
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                // @ts-expect-error
                const value = options[key];
                //  特殊属性添加
                if (!IsElementType && key == "class") {
                    // 支持数组或者文本
                    NewDoment.className =
                        CallType(options.class.concat) == "[object Array]"
                            ? options.class.join(" ")
                            : options.class;
                    continue;
                }
                if (!IsElementType && key == "style") {
                    if (CallType(value) == "[object Object]") {
                    } else {
                        ElementType;
                        NewDoment.style.cssText = options[key];
                    }
                    continue;
                }
                if (key == "event") {
                    if (value.event) {
                        NewDoment.addEventListener(
                            value.event,
                            value.function || value.Function || value.fun || value.Fun
                        );
                    } else {
                        NewDoment.addEventListener(value[0], value[1]);
                    }
                    continue;
                }
                // @ts-expect-error 添加元素信息
                NewDoment[key] = options[key];
            }
        }
        if (CallType(AddSelect).includes("Element")) {
            // @ts-expect-error 支持node元素
            AddSelect.appendChild(NewDoment);
        } else if (NewDoment) {
            // 没有添加位置则返回元素
            return NewDoment;
        } else {
            const Add_To_Select = $("" + AddSelect);
            Add_To_Select && Add_To_Select.appendChild(NewDoment);
        }
    }
    /**元素位置 预设 有能力自行修改(该脚本稳定维护很多年了) */
    let TreatmentMethod: TreatmentMethod = {
        /**是否分类 */
        Classify: Store.Get("Classify") === false ? false : true,
        /**快捷键 */
        shortcut: {
            ShowAllBtn: Store.Get("shortcut.ShowAllBtn"),
            Video: Store.Get("shortcut.Video"),
            ShopWindow: Store.Get("shortcut.ShopWindow"),
            SKU: Store.Get("shortcut.SKU"),
            DetailPage: Store.Get("shortcut.DetailPage"),
            CopyLink: Store.Get("shortcut.CopyLink"),
            ToEagleAllImages: Store.Get("shortcut.ToEagleAllImages"),
            SetTakeShortcut: Store.Get("shortcut.SetTakeShortcut"),
            Push_Download_DetailPage: Store.Get("shortcut.Push_Download_DetailPage")
        },
        /**排序 */
        WeightSorting: {
            SKU: 0,
            video: 1800,
            thumb: 1500,
            details: -2800,
        },
        /**  天猫  */
        'detail.tmall.com': {
            thumb: "#J_UlThumb > li",
            details: "#description img",
            detailsText: "#description",
            SKU: "#J_DetailMeta .tb-img  li",
            Information: "#J_AttrUL",
            video: "",
            title: "",
            Link: "https://detail.tmall.com/item.htm?id=${ID}"
        },
        /**  天猫国际  */
        'detail.tmall.hk': {
            thumb: "#J_UlThumb > li",
            details: "#description img",
            detailsText: "#description",
            SKU: "#J_DetailMeta .tb-img  li",
            Information: "#J_AttrUL",
            video: "",
            title: "",
            Link: "https://detail.tmall.hk/hk/item.htm?id=${ID}"
        },
        /**  C店  */
        'item.taobao.com': {
            thumb: "#J_UlThumb [data-index]",
            details: "#J_DivItemDesc img",
            detailsText: "#J_DivItemDesc",
            SKU: "#J_isku .tb-img li",
            Information: "#attributes > ul",
            video: "",
            title: "",
            Link: "https://item.taobao.com/item.htm?id=${ID}"
        },
        /**  天猫超市  */
        'chaoshi.detail.tmall.com': {
            thumb: "#J_UlThumb > li",
            details: "#description img",
            detailsText: "#description",
            SKU: "#J_DetailMeta .tb-img  li",
            Information: "#J_AttrUL",
            video: "",
            title: "",
            Link: "https://chaoshi.detail.tmall.com/item.htm?id=${ID}"
        },
        /**  1688  */
        'detail.1688.com': {
            thumb: ".od-pc-layout-two-columns .detail-gallery-turn-wrapper,.detail-gallery-turn-wrapper,.prepic-active img.detail-gallery-img",
            details: ".detail-desc-module img",
            detailsText: ".detail-desc-module",
            SKU: ".pc-sku-wrapper .sku-item-wrapper",
            Information: "div.od-pc-attribute",
            video: "",
            title: "",
            Link: "https://detail.1688.com/offer/${ID}.html"
        }
    }
    /**移除所有快捷键监听 并重新绑定 */
    function AnewListener() {
        listener.reset();
        for (const key in TreatmentMethod.shortcut) {
            // @ts-expect-error
            let Gather: Btn_Gather_Data = Btn_Gather[key], shortcut: string = TreatmentMethod.shortcut[key]
            if (!shortcut) continue;
            shortcut = (typeof shortcut == "string" ? shortcut : "").toLowerCase().replace(/[ \+] /g, " space").replace(/[+]/g, " ")
            // @ts-expect-error 
            listener.simple_combo(shortcut, Gather.function)
        }

    }
    /**监听快捷键变更并且写入到GM的存储机制 */
    let Store_Shortcut = onChange(TreatmentMethod.shortcut, function (path, NewValue, previousValue, applyData) {
        const PathToList = path.split('.');
        if (!NewValue) return Store.Set("shortcut.".concat(PathToList[0]), null);
        Store.Set("shortcut.".concat(PathToList[0]), NewValue);
    })
    /**
    * 按照当前网站查看是否支持执行 是否能够找到元素
    */
    class APP_Start {
        /**支持的网站子域名 */
        constructor() {
            const THIS = this;

        }
        get Start() {
            let HostUpholdList = new Set(Object.keys(TreatmentMethod));
            return HostUpholdList.has(location.host)
        }
        thumb(): Element {
            let Element_ID: 'HM_TAOBAOZHUSHOU_030_APP_UI_Element' = "HM_TAOBAOZHUSHOU_030_APP_UI_Element";
            let Element_Code = Theme.APP_Main([["HM_APP_Main", Element_ID]])
            let APP_Element = NewElement("div", Element_Code, Element_ID, $() || document) || document.querySelector("#".concat(Element_ID));
            // 执行按钮事件绑定
            setTimeout(() => {
                function GetBtn_Gather(ID: Element_ID_OF): Btn_Gather_Data {
                    let El = APP_Element?.querySelector("#".concat(ID))
                    return {
                        id: ID,
                        el: El,
                        display: "",
                        show() {
                            // @ts-expect-error
                            El.style.display = this.display
                        },
                        SetName(Names: string) {
                            // @ts-expect-error
                            if (El?.querySelector(".Purpose > a")?.innerText) El.querySelector(".Purpose > a").innerText = Names;
                        },
                        remove() {
                            El?.remove()
                        },
                        hide() {
                            if(!El)return;
                            // @ts-expect-error
                            let display = El.style.display || ""; El.style.display = "none"
                            this.display = display;
                        }

                    }
                }
                Btn_Gather.BtnMain == GetBtn_Gather(Element_ID)
                Btn_Gather.Push_Download_DetailPage = GetBtn_Gather("Download_DetailPage")
                Btn_Gather.ShopWindow = GetBtn_Gather("Collect_ShopWindow_SetEagle")
                Btn_Gather.SKU = GetBtn_Gather("Collect_SKU_SetEagle")
                Btn_Gather.ShowAllBtn = GetBtn_Gather("ShowAllBtn")
                Btn_Gather.DetailPage = GetBtn_Gather("CollectDetailPageSetEagle")
                Btn_Gather.ToEagleAllImages = GetBtn_Gather("CollectAllSetEagle")
                Btn_Gather.Video = GetBtn_Gather("Collect_Video_SetEagle")
                Btn_Gather.CopyLink = GetBtn_Gather("CopyLink")
                Btn_Gather.SetTakeShortcut = GetBtn_Gather("SetTakeShortcut")
                Btn_Gather.userShowToEagle = GetBtn_Gather("userShowToEagle")
                this.Btn_Gather = Btn_Gather;
                /**显示所有按钮 （排除更新按钮 屏蔽显示所有按钮） */
                function showAllButtons() {
                    let ShowButtonsList = [Btn_Gather['userShowToEagle'], Btn_Gather['SetTakeShortcut'], Btn_Gather['CopyLink'], Btn_Gather["Video"], Btn_Gather["ToEagleAllImages"], Btn_Gather["DetailPage"], Btn_Gather["ShowAllBtn"], Btn_Gather["SKU"], Btn_Gather["ShopWindow"], Btn_Gather["Push_Download_DetailPage"]];
                    for (const Buttons of ShowButtonsList) {
                        Buttons?.show();
                    }
                    Btn_Gather.ShowAllBtn?.hide();
                }
                /**
                 * 隐藏所有其他按钮 /恢复默认
                 */
                function showDefaultButtons() {
                    let ShowButtonsList = [Btn_Gather['CopyLink'], Btn_Gather["Video"], Btn_Gather["ToEagleAllImages"], Btn_Gather["DetailPage"], Btn_Gather["ShowAllBtn"], Btn_Gather["SKU"], Btn_Gather["ShopWindow"], Btn_Gather["Push_Download_DetailPage"]];
                    for (const Buttons of ShowButtonsList) {
                        Buttons?.hide();
                    }
                    Btn_Gather.ShowAllBtn?.show();
                }

                Btn_Gather.ShowAllBtn.el?.addEventListener("click", showAllButtons)
                APP_Element?.querySelector(".Version.Center")?.addEventListener("click", function () {
                    open(APIPreset.ScriptHome)
                })

                /**
                 * 检查更新的函数
                 * @returns 
                 */
                function UpdateVersion() {
                    /**返回年月日 */
                    function GetThisDate() {
                        let date = new Date();
                        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
                    }

                    /**负责对比版本的函数 */
                    function InspectUpdateSDK(data: { "name"?: string, "Version": number }) {
                        if (data.Version > Version) {
                            let VersionText = APP_Element?.querySelector(".Version.Center a");
                            // @ts-expect-error 
                            VersionText.innerText = "有新版本:" + String(data.Version).replace(/(.+)(..)$/, "$1.$2"); VersionText.style.color = "#ff0000";
                        } else {
                        }
                        Store.Set("NewVersion", data.Version)
                    }

                    // 按照GreasyFork规定每天只能检查一次
                    if (Store.Get("InspectUpdateVersion") == GetThisDate()) {
                        // 今天检查更新过了 检查今天获取的版本号是否跟现在版本一致
                        InspectUpdateSDK({ Version: Number(Store.Get("NewVersion")) });
                        return;
                    }

                    // 联网检查更新
                    Store.Set("InspectUpdateVersion", GetThisDate());
                    WebWin.fetch(APIPreset.Update + First ? '/Version=' + Version : '', { method: 'GET', mode: 'cors', redirect: 'follow' }).then(onfulfilled => onfulfilled.json()).then((data: { "name": "Eagle淘宝工具箱", "Version": 300 }) => {
                        Store.Set("Setup.UpdateSwitchVersion", true)
                        InspectUpdateSDK(data)
                    })
                }
                //开始检查更新 
                UpdateVersion();
            }, 500)

            this.APP_Element = APP_Element;
            // @ts-expect-error
            return APP_Element
        }
        API_Failure(): Element {
            let div = document.createElement('div');
            let ID = "HM_API_Failure_APPMain_300__K9DUKOQ9L68JP";
            div.innerHTML = Theme.API_Failure([["APPMain", ID]])
            div.querySelector(".HMbutton")?.addEventListener("click", function () {
                open(APIPreset.OpenEagle)
            });
            div.querySelector(".Menu")?.addEventListener("click", function (events) {
                div.remove();
            });
            document.querySelector('body')?.appendChild(div);
            return div
        }
    }
    const app = new APP_Start;
    if (!app.Start) return; app.thumb();


    class APP_Get {
        constructor() {
            let THIS = this
            /**处理SKU获取的函数 */
            this.GetSKU_Content = function () {
                let ReturnSKU_ContentItems: EagleSetAllImagesURL_Items_Data[] = [];
                /**
                 * 天猫 获取SKU信息
                 */
                function DetailTmall() {
                    let List_SKU_Content: Array<SKU_Content> = [];
                    for (let Script of $$('script')) {
                        // @ts-expect-error 获取脚本内容
                        let HTML_Text = Script?.innerText || "";
                        if (HTML_Text && HTML_Text.includes("TShop.Setup")) {
                            let ScriptMatchJSON = HTML_Text.match(/ TShop.Setup\(\n(.+)\n/i);
                            if (ScriptMatchJSON && ScriptMatchJSON[1]) {
                                try {
                                    let ScriptJSON: ScriptJSON = JSON.parse(ScriptMatchJSON[1])
                                    let sort_index = 0;
                                    // @ts-expect-error
                                    for (let FOR_Element of $$(TreatmentMethod[location.host].SKU || "")) {
                                        // @ts-expect-error 按照顺序压入SKU信息
                                        let SKU_Element: Element = FOR_Element
                                        let SKU_Content: SKU_Content = {
                                            // @ts-expect-error 
                                            name: (SKU_Element.innerText || "").replace(/\n?已选中$/, '').replace(/[\n]+/img, '').replace(/([\t\s ])+/img, '$1'),
                                            url: '',
                                            stock: 0,
                                            price: "",
                                            // @ts-expect-error 不显示的就是没库存
                                            show: !(SKU_Element?.style?.display === "none"),
                                            sort: sort_index += 1,
                                            // @ts-expect-error
                                            id: `;${SKU_Element.attributes["data-value"].value};`
                                        }
                                        // @ts-expect-error
                                        SKU_Content.url = ScriptJSON.propertyPics[SKU_Content.id][0];

                                        List_SKU_Content.push(SKU_Content)
                                    }
                                } catch (error) {
                                    //console.log(ScriptMatchJSON); //console.error(error);
                                }
                            }

                        }

                    }
                    return List_SKU_Content
                }

                /**
                 * 淘宝网 获取SKU信息
                 */
                function DetailTaoBao() {
                    let List_SKU_Content: Array<SKU_Content> = [];
                    let sort_index = 0;
                    // @ts-expect-error
                    for (const FOR_Element of $$(TreatmentMethod[location.host].SKU || "")) {
                        // @ts-expect-error
                        let HTML: string = FOR_Element?.innerHTML || "", Name_Element: Element = FOR_Element.querySelector("a span"), MatchURL = HTML.match(/[\/\\][\/\\].+?\.(jpe?g|png|webp|gif)/);
                        if (MatchURL) List_SKU_Content.push({
                            // @ts-expect-error 
                            name: Name_Element.innerText || "",
                            url: MatchURL[0],
                            //@ts-expect-error
                            show: Name_Element?.style?.display || '' != "none",
                            sort: sort_index += 1
                        })
                    }

                    return List_SKU_Content
                }

                /**
                 * 1688网 获取SKU信息
                 */
                function Detail1688() {
                    let List_SKU_Content: Array<SKU_Content> = [];
                    let sort_index = 0;
                    // @ts-expect-error 寻找元素
                    for (const FOR_Element of $$(TreatmentMethod[location.host].SKU)) {
                        // @ts-expect-error 强制指定为元素  
                        let Get_Element: Element = FOR_Element;
                        let SKU_Name = Get_Element.querySelector(".sku-item-name");
                        let SKU_Image = Get_Element.querySelector(".sku-item-image");
                        let LOCK_SKU_URL = SKU_Image?.outerHTML.match(/[\/\\][\/\\].+?[.](?:jpe?g|png|webp|gif)/);
                        List_SKU_Content.push({
                            // @ts-expect-error 
                            name: SKU_Name && SKU_Name?.innerText || "无名称的SKU图片",
                            url: LOCK_SKU_URL ? LOCK_SKU_URL[0] : "",
                            //@ts-expect-error
                            show: FOR_Element?.style?.display || '' != "none",
                            sort: sort_index += 1
                        })

                    }
                    return List_SKU_Content
                }
                let GetSKU_ContentFunction = {
                    'detail.1688.com': Detail1688,
                    'chaoshi.detail.tmall.com': DetailTmall,
                    'item.taobao.com': DetailTaoBao,
                    'detail.tmall.com': DetailTmall,
                    'detail.tmall.hk': DetailTmall,
                }
                // @ts-expect-error
                let GetSKU_Content: Array<SKU_Content> = GetSKU_ContentFunction[location.host]();
                for (const SKU_Content of GetSKU_Content) {
                    let tags: string[] = ["SKU", this.id], Link = this.GetLink;
                    if (!SKU_Content.show) tags.push("无货的SKU")
                    if (SKU_Content.url)
                        ReturnSKU_ContentItems.push({
                            "url": this.Max_Imag(SKU_Content.url),
                            "name": SKU_Content.name || "无名称的SKU图片",
                            "tags": tags,
                            // 定义排序  放大sort数据5倍让其误差更大
                            "modificationTime": date + TreatmentMethod.WeightSorting.SKU - (SKU_Content.sort * 200),
                            "website": Link,
                        })
                }
                return ReturnSKU_ContentItems

            }

            /**处理主图视频获取的函数 */
            this.GetVideo_Content = function () {
                let ReturnSKU_ContentItems: EagleSetAllImagesURL_Items_Data[] = [];

                /**
                 * 获取1688的主图视频
                 * @returns 
                 */
                function Video1688(): string {
                    // @ts-expect-error 直接在元素上获取
                    let VideoURL = $("#detail-main-video-content video")?.src
                    // @ts-expect-error 直接访问全局变量中的数据                    
                    let __INIT_DATA: __INIT_DATA = WebWin.__INIT_DATA;
                    if (!VideoURL && __INIT_DATA) {
                        let MatchVideoURL = __INIT_DATA?.globalData?.offerDomain.match(/[\\\/].{1,12}cloud.video.taobao.com.+?\d+\.mp4/) || [""];
                        VideoURL = MatchVideoURL[0]
                    }

                    return VideoURL

                }


                /**
                 * 淘宝C店获取视频链接
                 * @returns 
                 */
                function VideoTaoBao(): string {
                    // @ts-expect-error 从元素获取链接
                    let VideoURL: string = $("#detail div.tb-gallery .tb-video  video")?.src || ""
                    // 元素中找不到用枚举拼接法
                    if (!VideoURL || VideoURL.match(FilterURL.FilterVideoURL)) {
                        // @ts-expect-error 获取UserID
                        let UserID = $('meta[name="microscope-data"]')?.content?.match(/userid=(\d+);/)?.pop() || "";
                        let ScriptList = $$('script');
                        for (const Script of ScriptList) {
                            // @ts-expect-error 获取视频ID
                            if (Script?.innerText && (Script.innerText || "").includes('"videoId"')) {
                                // @ts-expect-error 查找ID
                                let MatchVideoID = Script.innerText.match(/"videoId":"(\d+)"/);
                                if (!MatchVideoID) continue;
                                return `https://cloud.video.taobao.com/play/u/${UserID}/p/1/e/6/t/1/${MatchVideoID[1]}.mp4`
                            }
                        }
                    }

                    return VideoURL
                }

                /**
                * 天猫获取视频链接
                * @returns 
                */
                function VideoTmall(): string {
                    // 从元素获取链接
                    let MatchVideoURL = ($("#J_DetailMeta .lib-video")?.innerHTML || "").match(/\/\/cloud.+?play.+?[.]mp4(?:[?]appKey=\d+)?/)
                    let VideoURL = MatchVideoURL ? MatchVideoURL[1] : ""
                    // 元素中找不到用枚举拼接法
                    if (!VideoURL || VideoURL.match(FilterURL.FilterVideoURL)) {
                        // @ts-expect-error 获取UserID
                        let UserID = $('meta[name="microscope-data"]')?.content?.match(/userid=(\d+);/)?.pop() || "";
                        let ScriptList = $$('script');
                        for (const Script of ScriptList) {
                            // @ts-expect-error 获取视频ID
                            if (Script?.innerText && Script.innerText.includes('"imgVedioID"')) {
                                // @ts-expect-error 查找ID
                                let MatchVideoID = Script.innerText.match(/"imgVedioID":"(\d+)"/);
                                if (!MatchVideoID) continue;
                                return `https://cloud.video.taobao.com/play/u/${UserID}/p/1/e/6/t/1/${MatchVideoID[1]}.mp4`
                            }
                        }
                    }

                    return VideoURL
                }
                let GetVideo_ContentFunction = {
                    'detail.1688.com': Video1688,
                    'chaoshi.detail.tmall.com': VideoTmall,
                    'item.taobao.com': VideoTaoBao,
                    'detail.tmall.com': VideoTmall,
                    'detail.tmall.hk': VideoTmall,
                }
                // @ts-expect-error 获取链接
                let GetSKU_Content: string = GetVideo_ContentFunction[location.host](), Link = this.GetLink;
                if (GetSKU_Content) {
                    ReturnSKU_ContentItems.push({
                        "url": GetSKU_Content,
                        "name": "主图视频",
                        "tags": ["主图视频", this.id],
                        "modificationTime": (+date) - TreatmentMethod.WeightSorting.video,
                        "website": Link,
                    })
                }
                return ReturnSKU_ContentItems
            }

            /**处理详情页获取的函数 */
            this.GetDetails_Content = async function () {
                let ReturnSKU_ContentItems: EagleSetAllImagesURL_Items_Data[] = [], Link = this.GetLink;;
                await this.ScrollToBottom();
                // @ts-expect-error 寻找所有图片
                let SeekImagesElementList = $$(TreatmentMethod[location.host].details || "") || [], ForIndex: number = 0, SeekDetailsText = $(TreatmentMethod[location.host].detailsText);
                for (const ImagesElement of SeekImagesElementList) {
                    function SeekImagesURL(): string {
                        let ImagesURL: string = '';
                        // @ts-expect-error 天猫懒加载
                        if (ImagesElement && ImagesElement.attributes && ImagesElement.attributes['data-ks-lazyload']) { ImagesURL = ImagesElement.attributes['data-ks-lazyload'].value }
                        // @ts-expect-error 1688懒加载
                        if (!ImagesURL && ImagesElement && ImagesElement.attributes && ImagesElement.attributes['data-lazyload-src']) { ImagesURL = ImagesElement.attributes['data-lazyload-src'].value }
                        // @ts-expect-error 淘宝懒加载
                        if (!ImagesURL && ImagesElement && ImagesElement.attributes && ImagesElement.attributes['data-src']) { ImagesURL = ImagesElement.attributes['data-src'].value }
                        // @ts-expect-error 常规
                        if (!ImagesURL && ImagesElement && ImagesElement.src) { ImagesURL = ImagesElement.src }

                        return ImagesURL
                    }
                    let GetMaxImagesURL = THIS.Max_Imag(SeekImagesURL());
                    if (GetMaxImagesURL) ReturnSKU_ContentItems.push({
                        "url": GetMaxImagesURL,
                        "name": "详情页_".concat(MIU_NUM(ForIndex += 1, 2)),
                        "tags": ["详情页", THIS.id],
                        "modificationTime": date + (TreatmentMethod.WeightSorting.details * ForIndex),
                        "website": Link,
                        // @ts-expect-error 
                        "annotation": SeekDetailsText?.innerText || ""
                    });
                }

                return ReturnSKU_ContentItems
            }

            /**处理主图获取的函数 */
            this.GetThumb_Content = function () {
                let tags: string[] = ["商品主图", this.id], Link = this.GetLink;
                // 0-22 （1688主图多的夸张）
                let NameForm = ["商品主图", "主图_02", "主图_03", "主图_04", "主图_05", "主图_06", "主图_07", "主图_08", "主图_09", "主图_10", "主图_11", "主图_12", "主图_13", "主图_14", "主图_15", "主图_16", "主图_17", "主图_18", "主图_19", "主图_20", "主图_21", "主图_22"]
                let ReturnSKU_ContentItems: EagleSetAllImagesURL_Items_Data[] = [];
                /**
                 * 淘宝 获取主图信息
                 */
                function ThumbTaoBao() {
                    // @ts-expect-error
                    let $_ = TreatmentMethod[location.host].thumb;
                    for (const index in $$($_)) {
                        let ThumbIndex = $$($_)[index]
                        //@ts-expect-error 源码里面找链接
                        let MatchHTML: string = ThumbIndex?.outerHTML?.match(/[\/\\][\/\\].+?\.(jpe?g|png|webp|gif)/)
                        if (MatchHTML) {
                            let Max_Imag = THIS.Max_Imag(MatchHTML[0]);
                            if (Max_Imag) ReturnSKU_ContentItems.push({
                                "url": Max_Imag,
                                "name": NameForm[index],
                                "tags": tags,
                                // 定义排序  放大sort数据5倍让其误差更大
                                "modificationTime": date + TreatmentMethod.WeightSorting.thumb - (Number(index) * 200),
                                "website": Link,
                            })
                        }
                    }
                }

                /**
               * 天猫 获取主图信息
               */
                function ThumbTmall() {
                    // @ts-expect-error
                    let $_ = TreatmentMethod[location.host].thumb;
                    for (const index in $$($_)) {
                        let ThumbIndex = $$($_)[index]
                        //@ts-expect-error 源码里面找链接
                        let MatchHTML: string = ThumbIndex?.outerHTML?.match(/[\/\\][\/\\].+?\.(jpe?g|png|webp|gif)/)
                        if (MatchHTML) {
                            let Max_Imag = THIS.Max_Imag(MatchHTML[0]);
                            if (Max_Imag) ReturnSKU_ContentItems.push({
                                "url": Max_Imag,
                                "name": NameForm[index],
                                "tags": tags,
                                // 定义排序  放大sort数据5倍让其误差更大
                                "modificationTime": date + TreatmentMethod.WeightSorting.thumb - (Number(index) * 200),
                                "website": Link,
                            })
                        }
                    }
                }

                /**
             * 淘宝 获取主图信息
             */
                function Thumb1688() {
                    // @ts-expect-error
                    let $_ = TreatmentMethod[location.host].thumb;
                    for (const index in $$($_)) {
                        let ThumbIndex = $$($_)[index]
                        //@ts-expect-error 源码里面找链接
                        let MatchHTML: string = ThumbIndex?.outerHTML?.match(/[\/\\][\/\\].+?\.(jpe?g|png|webp|gif)/)
                        if (MatchHTML) {
                            let Max_Imag = THIS.Max_Imag(MatchHTML[0]);
                            if (Max_Imag) ReturnSKU_ContentItems.push({
                                "url": Max_Imag,
                                "name": NameForm[index],
                                "tags": tags,
                                // 定义排序  放大sort数据5倍让其误差更大
                                "modificationTime": date + TreatmentMethod.WeightSorting.thumb - (Number(index) * 200),
                                "website": Link,
                            })
                        }
                    }
                }

                let GetThumb_ContentFunction = {
                    'detail.1688.com': Thumb1688,
                    'chaoshi.detail.tmall.com': ThumbTmall,
                    'item.taobao.com': ThumbTaoBao,
                    'detail.tmall.com': ThumbTmall,
                    'detail.tmall.hk': ThumbTmall,
                }
                // @ts-expect-error
                GetThumb_ContentFunction[location.host]()
                return ReturnSKU_ContentItems
            }
            /**处理商品详细信息的函数 */
            this.GetInformation_Content = function () {
                // @ts-expect-error
                return $(TreatmentMethod[location.host].Information)?.innerText || ""
            }

        }
        get id() {
            let href = location.href;
            let GetID = href.match(/[\?\&(?:object_)]id=([0-9]{8,13})/i) || href.match(/1688.*?([0-9]{8,13})\.html/i);
            return GetID && GetID[1] || ""
        }
        get title() {
            let title = document.title;
            const RemoveTextList = ["-tmall.hk天猫国际", "-淘宝网", "-天猫超市-天猫Tmall.com-上天猫，就购了-理想生活上天猫", "-tmall.com天猫", "-天猫超市-天猫Tmall.com",]
            for (const RemoveText of RemoveTextList) {
                title = title.replace(RemoveText, '')
            }
            return title
        }

        UserAgreement() {
            if (Store.Get("User_OFF") !== undefined) return;
            window.NProgress && window.NProgress.set(0.1)
            let Element_ID = "HM_news_-UserAgreement_____Mian"
            if (document.querySelector("#".concat(Element_ID))) return;
            let Element_Code = Theme.UserAgreement([["HM_UserAgre", Element_ID]]);
            let UserAgreement_Main = NewElement("div", Element_Code, Element_ID, $() || document) || document.querySelector("#".concat(Element_ID));

            setTimeout(function () {

                // 用户关闭协议 注销脚本功能 
                document.querySelector(`.Menu`)?.addEventListener("click", function (event) {
                    if (confirm("您确定要注销脚本功能?")) {
                        UserAgreement_Main?.remove();
                        Store.Set("User_OFF", true);
                        app.APP_Element?.remove();
                        window.NProgress && NProgress.start()
                    }
                });

                // 绑定协议按钮
                document.querySelector(`.NextMenu_Default,.NextMenu`)?.addEventListener("click", function (event) {
                    event.stopPropagation();
                    let button = UserAgreement_Main?.querySelector(`.NextMenu_Default,.NextMenu`);
                    // @ts-expect-error 
                    if (button?.innerText == '开始使用') {
                        Store.Set("User_OFF", false);
                        UserAgreement_Main?.remove();
                        window.NProgress && NProgress.done()
                    } else {
                        // @ts-expect-error 更新按钮文本
                        button.innerText = '开始使用';
                        button?.classList.remove('NextMenu_Default')
                        button?.classList.add('NextMenu')

                        UserAgreement_Main?.querySelector('#FirstUse')?.remove();
                        // @ts-expect-error 恢复显示
                       if(UserAgreement_Main?.querySelector('#FirstUse_Next')) UserAgreement_Main.querySelector('#FirstUse_Next').style.display = 'block'
                        window.NProgress && NProgress.set(0.5)
                    };

                })
            }, 800)
        }

        Max_Imag(URL: string) {
            if (typeof URL !== "string") return ''
            // 拒绝处理懒加载图片
            let lazyload = ["O1CN01SSxwRB1oD4HJCgfqd_!!6000000005190-2-tps-48-48.png", "imglazyload/spaceball.gif", 'T1BYd_XwFcXXb9RTPq-90-90.png', "T1BYd_XwFcXXb9RTPq-90-90", "TB1k9XsQpXXXXXLXpXXXXXXXXXX-750-368", "TB1oOXFXDM11u4jSZPxSuuhcXXa", "TB1AHXiGXXXXXXAXVXX.uTD.FXX-10-10", "wAAACH5BAUAAAAALAAAAAACAAEAAAICBAoAOw", "T10B2IXb4cXXcHmcPq-85-85", "CUdsY9YBuNjy0FgXXcxcXXa-1572-394", "T1BYd_XwFcXXb9RTPq-90-90", "spaceball.gif", "TB1k9XsQpXXXXXLXpXXXXXXXXXX-750-368", "other/lazyload.png", "TB1l8I3dlv0gK0jSZKbXXbK2FXa-226-226"]
            for (const LazyLoadIterator of lazyload) {
                if (URL.includes(LazyLoadIterator)) return ''
            }
            let RunURL = URL
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
            return RunURL || ""
        }
        async ScrollToBottom() {
            let ThisScroll = window.screenTop || 0;
            // 上次到达哪里
            let LastScroll = 0;
            for (let ExecutionsIndex = 0; ExecutionsIndex < 20; ExecutionsIndex++) {
                // 本次到达的像素
                let CurrentScroll = window.screenTop;
                // 没有步进更新了跳出下一步 最少跳5次
                if (ExecutionsIndex >= 3 && CurrentScroll <= LastScroll) break;
                LastScroll = CurrentScroll;
                scrollTo(0, 500 * ExecutionsIndex);
                await Sleep(800)
            }
            scrollTo(0, 99999) //最后一击
            await Sleep(500)
            scrollTo(0, ThisScroll) //最后一击
            return void 0
        }
        async Update() {
            return false
        }
        /**获取最短链接 */
        get GetLink() {
            // @ts-expect-error
            if (!TreatmentMethod[location.host]) return ""
            // @ts-expect-error
            return TreatmentMethod[location.host].Link.replace(/\$\{ID\}/, this.id)
        }
    }

    let APP_FUN = new APP_Get();
    function StartNProgress(Setmun?: number) {
        if (Setmun) window.NProgress && NProgress.set(Setmun);
        window.NProgress && NProgress.start();
    }
    // 异步延迟绑定按钮功能
    setTimeout(function () {

        /**让用户设置快捷键 */
        function SetTakeShortcut() {
            // 执行原有快捷键注销   
            listener.reset();
            let Element_ID = "HM__SetTakeShortcut___KFCXBU9PDHC6D";
            // @ts-expect-error 
            let Element_app: HTMLDivElement = NewElement("div", Theme.SetTakeShortcut([["DefaultMain", Element_ID]]), Element_ID, document.querySelector("body"), {}) || document.querySelector("#".concat(Element_ID))
            // tampermonkey 不支持Vue  使用原生代码实现页面
            /**APP 数据 */
            let createApp = (() => {
                /**判断为undefined*/
                function isDef(Value: any) {
                    return typeof Value === "undefined" && Value !== null
                }
                const Element_Close = Element_app?.querySelector("div.Menu"),
                    Element_titleMain = Element_app?.querySelector("div.titleMain"),
                    Element_QuickMain = Element_app?.querySelector("div.QuickMain"),
                    Element_ON_TakeShortcutList = Element_app?.querySelector("div.ON_TakeShortcutList"),
                    Element_SetTakeShortcutButtonList = Element_app?.querySelector("div.SetTakeShortcutButtonList");
                /**
                 * 设置元素的文字内容
                 * @param Element 
                 * @param Text 
                 */
                function SetInnerText(Element: Element | HTMLDivElement | HTMLElement | string | null | undefined, Text?: string | null | undefined | unknown) {
                    if (typeof Element == "string") Element = $(Element);
                    // @ts-expect-error 
                    if (isDef(Text)) return Element?.innerText || ""
                    // @ts-expect-error
                    Element.innerText = Text || ""
                }
                const _APP__SDK: createApp = {
                    Element: {
                        // 监听快捷键
                        FOR_TakeShortcut: (() => {
                            let _Element = document.createElement("div");
                            _Element.classList.add("FOR_TakeShortcut");
                            _Element.innerHTML = `<a>{{item}}<a/>`
                            return _Element
                        })(),
                        app: Element_app,
                        Close: Element_Close,
                        titleMain: Element_titleMain,
                        QuickMain: Element_QuickMain,
                        ON_TakeShortcutList: Element_ON_TakeShortcutList,
                        SetTakeShortcutButtonList: Element_SetTakeShortcutButtonList,
                        BindElement: {
                            introduce: null,
                            title: null,
                            NewQuick: null,
                            NewSpeak: null,
                            NowQuick: null,
                            NowSpeak: null,
                        }
                    },
                    Shortcut: {
                        TakeShortcutList: new Set,
                        ShortcutClear: -1,
                        EnterState: false,
                        /*标题*/
                        title: "设置快捷键",
                        /*标题底下小字*/
                        introduce: "让助手游刃有余插上翅膀~",
                        /*现在的 ：快捷键设置*/
                        NowSpeak: "之前：",
                        NowQuick: "请选择功能",
                        /*新的 ：快捷键设置*/
                        NewSpeak: "新的：",
                        NewQuick: "点击录入"
                    },
                    ShortcutList: [{
                        name: "收藏全部",
                        id: "ToEagleAllImages",
                        Shortcut: Store_Shortcut.ToEagleAllImages,
                        effect: "将当前页面\n所有支持的图片打包",
                        icon: null,
                        frozen: false,
                        key: "ToEagleAllImages",
                        index: 0
                    }, {
                        name: "收藏详情",
                        id: "DetailPage",
                        Shortcut: Store_Shortcut.DetailPage,
                        effect: "将当前页面\n所有支持的详情图片打包",
                        icon: null,
                        frozen: false,
                        key: "DetailPage",
                        index: 1
                    }, {
                        name: "收藏SKU",
                        id: "SKU",
                        Shortcut: Store_Shortcut.SKU,
                        effect: "将当前页面\n所有支持的SKU图片打包",
                        icon: null,
                        frozen: false,
                        key: "SKU",
                        index: 2
                    }, {
                        name: "收藏主图",
                        id: "ShopWindow",
                        Shortcut: Store_Shortcut.ShopWindow,
                        effect: "将当前页面\n所有支持的主图打包",
                        icon: null,
                        frozen: false,
                        key: "ShopWindow",
                        index: 3
                    }, {
                        name: "收藏视频",
                        id: "Video",
                        Shortcut: Store_Shortcut.Video,
                        effect: "将当前页面\n所有支持的视频打包",
                        icon: null,
                        frozen: false,
                        key: "Video",
                        index: 4
                    }, {
                        name: "收藏全页详情",
                        id: "Push_Download_DetailPage",
                        Shortcut: Store_Shortcut.Push_Download_DetailPage,
                        effect: "将详情页拼接为单张\n发送到Eagle",
                        icon: null,
                        frozen: false,
                        key: "Push_Download_DetailPage",
                        index: 5
                    }]
                }
                let createApp: createApp = onChange(_APP__SDK, function (path, NewValue, previousValue, applyData) {
                    const { BindElement } = this.Element;
                    const PathKeys = path.split(".")
                    const { Shortcut } = this;
                    // 当元素被绑定 进行赋值
                    let GetBindElement = {
                        "Element.BindElement.title": [BindElement.title, Shortcut.title],
                        "Element.BindElement.introduce": [BindElement.introduce, Shortcut.introduce],
                        "Element.BindElement.NewQuick": [BindElement.NewQuick, Shortcut.NewQuick],
                        "Element.BindElement.NewSpeak": [BindElement.NewSpeak, Shortcut.NewSpeak],
                        "Element.BindElement.NowQuick": [BindElement.NowQuick, Shortcut.NowQuick],
                        "Element.BindElement.NowSpeak": [BindElement.NowSpeak, Shortcut.NowSpeak],
                    }
                    // @ts-expect-error
                    if (Object.keys(GetBindElement).includes(path)) SetInnerText(GetBindElement[path][0], GetBindElement[path][1])

                    //console.log('当前的对象:', this);
                    //console.log('路径:', path);
                    //console.log('新的值:', NewValue);
                    //console.log('之前的值:', previousValue);
                    //console.log('应用数据:', applyData);

                    // 单个数据体变更
                    if (PathKeys[0] === "ShortcutList") {
                        let ShortcutData = _APP__SDK.ShortcutList[Number(PathKeys[1])];

                        if (PathKeys[2] === "Shortcut") {
                            let Value = "";
                            for (let iterator of String(NewValue).split(' ')) {
                                Value = (Value.concat(String(iterator)[0].toUpperCase() + String(iterator).slice(1), "+"));

                            }
                            SetInnerText(ShortcutData.el?.querySelector(".Shortcut"), Value.replace(/\+$/, ''))
                            // @ts-expect-error 
                            Store_Shortcut[ShortcutData.key] = NewValue;
                        }
                        if (PathKeys[2] === "frozen") {
                            if (NewValue) ShortcutData.el?.classList.add("frozen")
                            if (!NewValue) ShortcutData.el?.classList.remove("frozen")
                        }
                        if (PathKeys[2] === "icon") {
                            let img = ShortcutData.el?.querySelector(".Shortcut")?.querySelector("img");
                            if (img) img.src = NewValue ? String(NewValue) : APIPreset.ICON.icon
                        }
                    }
                    if (path == "Shortcut.ShortcutClear") {
                        if (NewValue) {
                            Element_ON_TakeShortcutList?.setAttribute("hide", '')
                            Element_ON_TakeShortcutList?.removeAttribute("show")
                        } else {
                            Element_ON_TakeShortcutList?.setAttribute("show", '')
                            Element_ON_TakeShortcutList?.removeAttribute("hide")
                        }
                    }
                    if (path == "Shortcut.NowQuick") SetInnerText(this.Element.BindElement.NowQuick, NewValue);
                    if (path == "Shortcut.NowSpeak") SetInnerText(this.Element.BindElement.NowSpeak, NewValue);
                    if (path == "Shortcut.NewSpeak") SetInnerText(this.Element.BindElement.NewSpeak, NewValue);
                    // 设置并记录上次的快捷键
                    if (path == "Shortcut.NewQuick") {
                        if (previousValue != "未设置" && previousValue != "点击录入" && previousValue != "点击完成") {
                            this.Shortcut.NowQuick = String(previousValue);
                        }
                        SetInnerText(this.Element.BindElement.NewQuick, NewValue);

                    }
                    // 是否正在录入中
                    if (path == 'Shortcut.EnterState') {
                        if (NewValue) {
                            createApp.Shortcut.title = "正在记录...";
                            createApp.Shortcut.introduce = "键盘按下快捷键自动录入";
                            createApp.Shortcut.NewQuick = "点击完成";
                            document.addEventListener("keydown", TakeShortcut)
                            document.addEventListener("keyup", TakeShortcut_End)

                        }
                        if (!NewValue) {
                            createApp.Shortcut.title = "设置快捷键";
                            createApp.Shortcut.introduce = "让助手游刃有余插上翅膀~";
                            createApp.Shortcut.NewQuick = "点击录入";
                            document.removeEventListener("keydown", TakeShortcut)
                            document.removeEventListener("keyup", TakeShortcut_End)

                        }

                    }
                    if (path == 'Shortcut.title') {
                        if (NewValue != "正在记录..." && NewValue != "设置快捷键" && this.Shortcut.TakeShortcutList.size > 1) {
                            this.Shortcut.NewQuick = String(NewValue);
                            if (this.PresentShortcut) {
                                this.ShortcutList[this.PresentShortcut.index].Shortcut = this.Shortcut.title;
                            }

                        }
                        SetInnerText(BindElement.title, NewValue)
                    }
                    if (path == 'Shortcut.introduce') SetInnerText(BindElement.introduce, NewValue)
                    // 监听快捷键添加 删除 清空
                    if (path == "Shortcut.TakeShortcutList") {
                        const DataValue = (() => {
                            let Value = applyData.args[0];
                            if (Value == " ") Value = "空格";
                            if (Value == "Control") Value = "Ctrl";

                            return Value
                        })();
                        createApp.Shortcut.ShortcutClear = !this.Shortcut.TakeShortcutList.size;
                        if (!this.Shortcut.TakeShortcutList.size) {
                            Element_ON_TakeShortcutList?.querySelectorAll(".FOR_TakeShortcut").forEach(value => {
                                value.remove();
                            })
                        }

                        if (applyData.name == "delete") {
                            Element_ON_TakeShortcutList?.querySelectorAll(".FOR_TakeShortcut").forEach(value => {
                                if (value.getAttribute("HM_key_FOR_TakeShortcut_Data") == DataValue) {
                                    value.remove();
                                }
                            })
                        }
                        if (applyData.name == "add") {
                            let ClearTextList = new Set(["请选择功能板块", "只允许Shift+字母"]);
                            let ElementData = _APP__SDK.Element.FOR_TakeShortcut.cloneNode(true);
                            // @ts-expect-error 
                            ElementData.innerHTML = `<a>${DataValue}</a>`; ElementData.setAttribute("HM_key_FOR_TakeShortcut_Data", DataValue)
                            Element_ON_TakeShortcutList?.appendChild(ElementData)
                            if (ClearTextList.has(DataValue)) {
                                setTimeout(function () {
                                    createApp.Shortcut.TakeShortcutList.clear()
                                }, 1200)
                            }
                        }
                    }
                }, {});

                // 初始化页面赋值
                let { BindElement } = createApp.Element;
                BindElement.title = Element_titleMain?.querySelector(".title")
                BindElement.introduce = Element_titleMain?.querySelector(".introduce")
                BindElement.NowSpeak = Element_QuickMain?.querySelector(".NowQuickFrame .speak")
                BindElement.NowQuick = Element_QuickMain?.querySelector(".NowQuickFrame .Quick")
                BindElement.NewSpeak = Element_QuickMain?.querySelector(".NewQuickFrame .speak")
                BindElement.NewQuick = Element_QuickMain?.querySelector(".NewQuickFrame .Quick")
                let index = -1;
                for (const Shortcut of createApp.ShortcutList) {
                    let Shortcut_Element = document.createElement("div");
                    Shortcut_Element.classList.add("Buttonitem");
                    Shortcut_Element.setAttribute("HM-Shortcut-index", String(index += 1))
                    Shortcut_Element.innerHTML = `
        <div class="ICON absolute"><img src="${(Shortcut.icon || APIPreset.ICON.icon).replace(/\\/g, "/")}"></div>
        <div class="Shortcut absolute"><a>${Shortcut.Shortcut || "未设置"}</a></div>
        <div class="name absolute"><a>${Shortcut.name}</a></div>
        <div class="effect absolute"><a>${Shortcut.effect}</a></div>        `;
                    if (Shortcut.frozen) {
                        Shortcut_Element.classList.add("frozen")
                    } else
                        if (Shortcut.click) Shortcut_Element.classList.add("clicks")
                    Element_SetTakeShortcutButtonList?.appendChild(Shortcut_Element);
                    Shortcut.el = Shortcut_Element;
                    // 功能模块点击事件绑定
                    Shortcut_Element.addEventListener("click", function () {
                        createApp.Shortcut.NewQuick = "点击完成"
                        createApp.Shortcut.title = "正在记录..."
                        createApp.PresentShortcut = createApp.ShortcutList[Number(this.getAttribute("HM-Shortcut-index"))];
                        createApp.Shortcut.NowQuick = !Shortcut.Shortcut ? "未设置" : Shortcut.Shortcut
                        // @ts-expect-error 移除高亮的类
                        for (const Element of Element_SetTakeShortcutButtonList?.querySelectorAll(".Buttonitem")) Element.classList.remove("clicks")
                        for (const Shortcut of createApp.ShortcutList) Shortcut.click = false;
                        Shortcut.click = true;
                        if (Shortcut.click) {
                            Shortcut_Element.classList.add("clicks")
                            Shortcut_Element.classList.remove("frozen")
                        } else {
                            if (Shortcut.frozen) Shortcut_Element.classList.add("frozen")
                            Shortcut_Element.classList.remove("clicks")
                        }
                        createApp.Shortcut.EnterState = true

                    })
                }
                /**判断用户是否未点击过任何功能板块 */
                function IsUserNotClickfun() {
                    const { ShortcutList } = createApp;
                    let Enable = false;
                    for (const i of ShortcutList) {
                        if (i.click) { Enable = true; break }
                    }
                    if (!Enable) {
                        createApp.Shortcut.TakeShortcutList.clear()
                        createApp.Shortcut.TakeShortcutList.add("请选择功能板块")
                    }
                    return Enable
                }
                /**原来的按钮 点击之后将上次的快捷键恢复 */
                function ShortcutExChange(Event: Event) {
                    // 数据交换
                    const Shortcut = createApp.Shortcut
                    if (Shortcut.NowQuick == "未设置" || Shortcut.NowQuick == "请选择功能") return;
                    let NewQuick_Bak = Shortcut.NewQuick + ''
                    Shortcut.NewQuick = Shortcut.NowQuick;
                    if (NewQuick_Bak !== "未设置" && NewQuick_Bak !== "点击录入" && NewQuick_Bak !== "点击完成")
                        Shortcut.NowQuick = NewQuick_Bak;
                }
                _APP__SDK.Element.QuickMain?.querySelector(".NowQuickFrame")?.addEventListener("click", ShortcutExChange);
                /**录入新的按钮 */
                function ClickNewQuick() {
                    if (!IsUserNotClickfun()) return;
                    createApp.Shortcut.EnterState = !createApp.Shortcut.EnterState;


                }
                _APP__SDK.Element.QuickMain?.querySelector(".NewQuickFrame")?.addEventListener("click", ClickNewQuick);
                /**用户点击关闭 */
                function UserClickClose() {
                    createApp.Shortcut.EnterState = false;
                    createApp.Shortcut.TakeShortcutList.clear();
                    Element_app.remove();
                    // 重新绑定按钮
                    AnewListener()
                }
                _APP__SDK.Element.Close?.addEventListener("click", UserClickClose);



                function TakeShortcut(Event: KeyboardEvent) {
                    let key = Event.key
                    if (key == "Backspace" || createApp.Shortcut.TakeShortcutList.has("只允许Shift+字母")) return;
                    //console.log(Event, createApp.Shortcut.TakeShortcutList);
                    if (key == "Control" || key == "Alt") {
                        createApp.Shortcut.TakeShortcutList.clear();
                        createApp.Shortcut.TakeShortcutList.add("只允许Shift+字母");
                        return
                    }
                    createApp.Shortcut.TakeShortcutList.add(key)
                    let TakeShortcutList = createApp.Shortcut.TakeShortcutList
                    if (TakeShortcutList.size <= 2) {
                        let Shortcut = "";
                        if (TakeShortcutList.has("Control")) {
                            Shortcut += "Control+"
                        }
                        if (TakeShortcutList.has("Shift")) {
                            Shortcut += "Shift+"
                        }
                        if (TakeShortcutList.has("Alt")) {
                            Shortcut += "Alt+"
                        }
                        TakeShortcutList.forEach((key: string) => {
                            if (key !== "Control" && key !== "Alt" && key !== "Shift") {
                                Shortcut += key;
                            }
                        })
                        if (Shortcut !== "Alt+" && Shortcut !== "Shift+" && Shortcut !== "Control+" && Shortcut !==
                            "Control+Shift+" && Shortcut !== "Control+Shift+Alt+" && Shortcut !== "Control+Alt+" &&
                            Shortcut !== "Shift+Alt+") createApp.Shortcut.title = Shortcut
                    }
                }

                function TakeShortcut_End(Event: KeyboardEvent) {
                    let key = Event.key
                    createApp.Shortcut.TakeShortcutList.delete(key);
                    if (key == "Backspace") createApp.Shortcut.TakeShortcutList.clear();
                    //console.log("结束", Event, createApp.Shortcut.TakeShortcutList);
                }







                //console.log(createApp);


                type HM_ElementType = null | Element | HTMLDivElement | undefined
                interface createApp {
                    PresentShortcut?: Shortcut
                    Shortcut: {
                        introduce: string
                        /**标题 */
                        title: string
                        /**标题： 两个交互按钮 -上次的快捷键  */
                        NowSpeak: "之前："
                        /**显键： 两个交互按钮 -上次的快捷键  */
                        NowQuick: "请选择功能" | "未设置" | string
                        /**标题： 两个交互按钮 -新的快捷键 */
                        NewSpeak: "新的："
                        /**显键： 两个交互按钮 -新的快捷键 */
                        NewQuick: "点击录入" | "点击完成" | string
                        /**防抖 是否正在录入中 */
                        EnterState: boolean
                        /**是否清除当前按下的按钮 */
                        ShortcutClear: boolean | -1
                        /**用户当前按下的按钮 */
                        TakeShortcutList: Set<string>

                    }
                    /**元素绑定 */
                    Element: {
                        /*按钮的单个 供复制 */
                        FOR_TakeShortcut: HTMLDivElement
                        /**整个元素最外层 */
                        app: HM_ElementType
                        /**关闭该页面 */
                        Close: HM_ElementType
                        /**标题位置 */
                        titleMain: HM_ElementType
                        /**两个基础交互按键的界面 */
                        QuickMain: HM_ElementType
                        /**监听并显示当前按键给用户 */
                        ON_TakeShortcutList: HM_ElementType
                        /**功能按钮 */
                        SetTakeShortcutButtonList: HM_ElementType
                        /**精细的绑定 */
                        BindElement: {
                            /**标题提醒 */
                            introduce: HM_ElementType,
                            /**标题 */
                            title: HM_ElementType,
                            NewQuick: HM_ElementType,
                            NewSpeak: HM_ElementType,
                            NowQuick: HM_ElementType,
                            NowSpeak: HM_ElementType,
                        }
                    }
                    ShortcutList: ShortcutList
                }
                return createApp;
            })();



            type ShortcutKEY = "Video" | "ToEagleAllImages" | "DetailPage" | "SKU" | "ShopWindow" | "Push_Download_DetailPage" | ""
            type Shortcut = {
                name: "收藏全部" | "收藏视频" | "收藏主图" | "收藏SKU" | "收藏详情" | "收藏全页详情"
                el?: Element,
                id: ShortcutKEY
                index: number
                /**快捷键 */
                Shortcut: null | string
                /**解释 */
                effect: string
                /**显示的图标 */
                icon: null | string
                /**是否冻结选项 */
                frozen: boolean
                /**GM记录的key和变量中的key */
                key: ShortcutKEY
                click?: boolean
            }
            type ShortcutList = Shortcut[]
        }
        /**
         * 创建主文件夹 并且不重复创建
         * @param FolderName 
         * @returns 
         */
        function GetNewMainFolderData(FolderName: string): Promise<folder_Run_Data> {
            return new Promise(async function (resolve, reject) {
                if (FolderID) return resolve(FolderID)
                await ToEagle.SetNewFolder(FolderName).then(data => {
                    FolderID = data
                    resolve(data)
                }).catch(error => reject(error))
            })
        }
        // 采集全部内容
        async function ToEagleAllImages() {
            APP_FUN.UserAgreement();
            StartNProgress()
            if (Store.Get("User_OFF") || Store.Get("User_OFF") == undefined) return;
            let AllContentList = {
                Details: await APP_FUN.GetDetails_Content(),
                Information: APP_FUN.GetInformation_Content(),
                SKU: APP_FUN.GetSKU_Content(),
                Video: APP_FUN.GetVideo_Content(),
                Thumb: APP_FUN.GetThumb_Content(),
            }
            NProgress.inc()
            await GetNewMainFolderData(APP_FUN.title).then(data => {

                // 子级详情页
                if (AllContentList.Details.length) ToEagle.SetNewFolder("商品详情", data.data.id).then(data => {
                    ToEagle.AddImagesURLAll({
                        items: AllContentList.Details,
                        "folderId": data.data.id
                    }).finally(function () { NProgress.inc() })
                })
                // 子级SKU
                if (AllContentList.SKU.length) ToEagle.SetNewFolder("SKU", data.data.id).then(data => {
                    ToEagle.AddImagesURLAll({
                        items: AllContentList.SKU,
                        "folderId": data.data.id
                    }).finally(function () { NProgress.inc() })
                })
                // 子级商品主图
                if (AllContentList.Thumb.length) ToEagle.SetNewFolder("商品主图", data.data.id).then(data => {
                    ToEagle.AddImagesURLAll({
                        items: AllContentList.Thumb,
                        "folderId": data.data.id
                    }).finally(function () { NProgress.inc() })
                })
                // 同级归类视频
                if (AllContentList.Video.length) ToEagle.AddImagesURLAll({
                    items: AllContentList.Video,
                    "folderId": data.data.id
                }).finally(function () { NProgress.inc() })

            }).catch(_ => { app.API_Failure() })
            setTimeout(function () { NProgress.done() }, 3500)

            // //console.log('收藏全部', AllContentList);



        }
        async function CopyLink() {
            // //console.log('复制短连接');
            APP_FUN.UserAgreement();
            if (Store.Get("User_OFF") || Store.Get("User_OFF") == undefined) return;
            StartNProgress()
            GM_setClipboard(APP_FUN.GetLink)
            setTimeout(function () {
                app.Btn_Gather.CopyLink?.SetName("已复制短链")
                window.NProgress && NProgress.done()
            }, 800)
        }
        async function Push_Download_DetailPage() {
            //console.log('采集全页详情页');
            APP_FUN.UserAgreement();
            if (Store.Get("User_OFF") || Store.Get("User_OFF") == undefined) return;
            StartNProgress()
            APP_FUN.GetDetails_Content().then(async GetDate => {
                let Data = GetDate.map(e => e.url);
                let StartComposeImages = new ComposeImages();
                let IMAGESComposeImagesS = StartComposeImages.Compose(Data, { "filter": (URL: string, width: number, height: number) => (width > 700 && height > 5) })
                let Base64 = await StartComposeImages.GetBase64(IMAGESComposeImagesS)
                GetNewMainFolderData(APP_FUN.title).then(data => {
                    ToEagle.AddImagesURLAll({
                        items: [{
                            url: Base64,
                            name: `来自${APP_FUN.title}的全页详情`,
                            tags: [APP_FUN.id, "全页详情"],
                            website: APP_FUN.GetLink()
                        }],
                        "folderId": data.data.id
                    }).finally(function () { NProgress.done() })

                }).catch(_ => { app.API_Failure() })
            })

        }
        async function SKU() {
            // //console.log('收藏SKU');
            APP_FUN.UserAgreement();
            if (Store.Get("User_OFF") || Store.Get("User_OFF") == undefined) return;
            StartNProgress()

            let GetDate = APP_FUN.GetSKU_Content()
            GetNewMainFolderData(APP_FUN.title).then(data => {
                ToEagle.SetNewFolder("SKU", data.data.id).then(data => {
                    ToEagle.AddImagesURLAll({
                        items: GetDate,
                        "folderId": data.data.id
                    }).finally(function () { NProgress.done() })
                })
            }).catch(_ => { app.API_Failure() })
        }
        async function ShopWindow() {
            // //console.log('收藏主图');
            APP_FUN.UserAgreement();
            if (Store.Get("User_OFF") || Store.Get("User_OFF") == undefined) return;
            StartNProgress()

            let GetDate = APP_FUN.GetThumb_Content()
            GetNewMainFolderData(APP_FUN.title).then(data => {
                ToEagle.SetNewFolder("商品主图", data.data.id).then(data => {
                    ToEagle.AddImagesURLAll({
                        items: GetDate,
                        "folderId": data.data.id
                    }).finally(function () { NProgress.done() })
                })
            }).catch(_ => { app.API_Failure() })
        }
        async function Video() {
            APP_FUN.UserAgreement();
            if (Store.Get("User_OFF") || Store.Get("User_OFF") == undefined) return;
            StartNProgress()

            let GetDate = APP_FUN.GetVideo_Content()
            if (!GetDate.length) return;
            GetNewMainFolderData(APP_FUN.title).then(data => {
                ToEagle.AddImagesURLAll({
                    items: GetDate,
                    "folderId": data.data.id
                }).finally(function () { NProgress.done() }).catch(_ => { app.API_Failure() })
            })
        }
        async function ShowAllBtn() {
            //console.log('显示所有功能');
            APP_FUN.UserAgreement();
        }
        async function DetailPage() {
            //console.log('采集详情页');
            APP_FUN.UserAgreement();
            if (Store.Get("User_OFF") || Store.Get("User_OFF") == undefined) return;
            StartNProgress()
            APP_FUN.GetDetails_Content().then(GetDate => {
                GetNewMainFolderData(APP_FUN.title).then(data => {
                    ToEagle.SetNewFolder("商品详情", data.data.id).then(data => {
                        ToEagle.AddImagesURLAll({
                            items: GetDate,
                            "folderId": data.data.id
                        }).finally(function () { NProgress.done() })
                    })
                }).catch(_ => { app.API_Failure() })
            })
        }
        let $UserShowImagesList = new Set();
        document.querySelector("#userShowToEagle")?.addEventListener("dblclick", function () {
            Store.Set("SetUserShowToEagleAutoAdd", confirm("自动添加/取消=>评论采集按钮？(在下次使用)"))
        })
        /**
         * 买家秀
         */
        function SetUserShowToEagle(NotInfo?: boolean) {
            if (shake.isset("————SetUserShowToEagle————", 999 * 999)) { return; }
            let website: string = "", tags: string[] = ["买家秀"], modificationTime: number = +new Date(); website = location.hash;
            let addFromURLs: addFromURLs = {
                items: []
            };
                let index = 0;
            if (FolderID) addFromURLs.folderId = FolderID.data.id;
            let icon = document.createElement("div");
            icon.innerHTML = Theme.userShowToEagle([]);
            // 位置调整
            if (location.host == 'item.taobao.com') {
                icon.style.left = "90%";
                icon.style.position = "relative";
                icon.style.top = "-96px";
            } else {
                icon.style.right = "45px";
                icon.style.position = "relative";
                icon.style.top = "10px";
            }

            // import {shake} from './modules/shake'
            let J_Reviews = document.querySelector(location.host == 'detail.tmall.com' ? "#J_Reviews" : "#reviews");
            /**
             * 处理天猫的买家秀
             * @param this 按钮
             * @param Event 事件
             * @param tr_Element 评论单条
             */
            function tmallProcessingPictureEmission(this: HTMLDivElement, Event: Event, tr_Element: Element): addFromURLs {

                // let website: string = APP_FUN.GetLink, tags: string[] = ["买家秀",APP_FUN.id], modificationTime: number = +new Date();
                // let addFromURLs: addFromURLs = {
                //     items: [],

                // }
                // if(FolderID)addFromURLs.folderId=FolderID.data.id;
                // console.log({
                //     this: this,
                //     tr_Element,
                //     Event
                // });
                let $this = this;
                // @ts-expect-error
                this.querySelector("a").innerText = "已处理";
                /**首次评价 */
                let tmRatePremiere = tr_Element.querySelector(".tm-rate-premiere,.tm-col-master");
                /**追评 */
                let tmRateAppend = tr_Element.querySelector(".tm-rate-append");
                function PushSelectorAllimg(tmRate: Element, Next?: boolean) {
                    for (const img of tmRate?.querySelectorAll("img") || []) {
                        if (!img.width || !img.src || img.src === location.href) continue;
                        let URL = APP_FUN.Max_Imag(img.src);
                        if ($UserShowImagesList.has(URL)) continue;
                        $UserShowImagesList.add(URL)
                        addFromURLs.items.push({
                            name: "买家秀_" + MIU_NUM(index += 1, 2),
                            url: URL,
                            // @ts-ignore
                            annotation: tmRate?.querySelector(".tm-rate-fulltxt")?.innerText || "",
                            website: APP_FUN.GetLink,
                            tags: tags.concat(Next ? ["追评"] : ["首评"]),
                            modificationTime: modificationTime - (index * 16)
                        })
                    }
                }
                tmRatePremiere && PushSelectorAllimg(tmRatePremiere);
                tmRateAppend && PushSelectorAllimg(tmRateAppend);
                // console.log(addFromURLs);
                GetNewMainFolderData(APP_FUN.title).then(data => {
                    addFromURLs.folderId = data.data.id
                    ToEagle.AddImagesURLAll(addFromURLs).then(() => {
                        // @ts-expect-error
                        $this.querySelector("a").innerText = "已添加"
                        addFromURLs.items.length = 0;
                    });
                }).catch(() => app.API_Failure())
                return addFromURLs;
            }
            /**
             * 处理taobao的买家秀
             * @param this 按钮
             * @param Event 事件
             * @param tr_Element 评论单条
             */
            function taobaoProcessingPictureEmission(this: HTMLDivElement, Event: Event, tr_Element: Element): addFromURLs {
                let $this = this;

                // console.log({
                //     this: this,
                //     tr_Element,
                //     Event
                // });
                // @ts-expect-error
                this.querySelector("a").innerText = "已处理";
                /**首次评价 */
                let tmRatePremiere = tr_Element.querySelector(".tb-rev-item");
                /**追评 */
                let tmRateAppend = tr_Element.querySelector(".tb-rev-item.tb-rev-item-append");
                function PushSelectorAllimg(tmRate: Element, Next?: boolean) {
                    for (const img of tmRate?.querySelectorAll("img") || []) {
                        if (!img.width || !img.src || img.src === location.href) continue;
                        let URL = APP_FUN.Max_Imag(img.src);
                        if ($UserShowImagesList.has(URL)) continue;
                        $UserShowImagesList.add(URL)
                        addFromURLs.items.push({
                            name: "买家秀_" + MIU_NUM(index += 1, 2),
                            url: URL,
                            // @ts-ignore
                            annotation: tmRate?.querySelector(".tb-tbcr-content")?.innerText || "",
                            website: APP_FUN.GetLink,
                            tags: tags.concat(Next ? ["追评"] : ["首评"]),
                            modificationTime: modificationTime - (index * 16)
                        })
                    }
                }
                tmRatePremiere && PushSelectorAllimg(tmRatePremiere);
                tmRateAppend && PushSelectorAllimg(tmRateAppend);
                // console.log(addFromURLs);
                GetNewMainFolderData(APP_FUN.title).then(data => {
                    addFromURLs.folderId = data.data.id
                    ToEagle.AddImagesURLAll(addFromURLs).then(() => {
                        // @ts-expect-error
                        $this.querySelector("a").innerText = "已添加"
                        $this.querySelector(".HM-btn-user-show-to-eagle").style.backgroundColor="#4395ff82";
                        addFromURLs.items.length = 0;
                    });
                }).catch(() => app.API_Failure())
                return addFromURLs;
            }

            function addBtnUserShowToEagle() {
                if (!J_Reviews) return;
                let list = J_Reviews.querySelectorAll(".rate-grid tbody > tr,.tb-revbd > ul .J_KgRate_ReviewItem");
                // 性能优化
                J_Reviews.removeEventListener("mouseover", addBtnUserShowToEagle);
                setTimeout(function () {
                    J_Reviews?.addEventListener("mouseover", addBtnUserShowToEagle);
                }, 1500)
                for (let tr of list) {
                    //  性能优化 在el元素中插入独有的布尔值 以防止重复添加，但是ts并不理解 因此使用了绕开错误声明
                    if (tr &&!tr["HM-btn-user-show-to-eagle"]) 
                    if (tr.querySelector("[data-src],.photo-item img")) {
                        let _icon = icon.cloneNode(true);
                        // @ts-expect-error
                        tr["HM-btn-user-show-to-eagle"] = true;
                        _icon.addEventListener("click", function (this: HTMLDivElement, Event) {
                            location.host == 'detail.tmall.com' && tmallProcessingPictureEmission.apply(this, [Event, tr])
                            location.host == 'item.taobao.com' && taobaoProcessingPictureEmission.apply(this, [Event, tr])
                        })
                        tr.appendChild(_icon);
                    }
                }
            }
            J_Reviews?.addEventListener("mouseover", addBtnUserShowToEagle);

        }

        ; (function (Btn_Gather) {
            let EventListenerList = {
                "ToEagleAllImages": ToEagleAllImages,
                "CopyLink": CopyLink,
                "DetailPage": DetailPage,
                "SKU": SKU,
                "ShopWindow": ShopWindow,
                "ShowAllBtn": ShowAllBtn,
                "SetTakeShortcut": SetTakeShortcut,
                "Video": Video,
                "Push_Download_DetailPage": Push_Download_DetailPage,
                "userShowToEagle": SetUserShowToEagle,
            }
            for (const ForKey of Object.keys(EventListenerList)) {
                // @ts-expect-error
                let key: Btn_GatherKEY = ForKey; Btn_Gather[key].function = EventListenerList[key]
                Btn_Gather[key]?.el?.addEventListener("click", EventListenerList[key])
            }
            if (Store.Get("SetUserShowToEagleAutoAdd")) {
                SetUserShowToEagle(true);
            }
        })(app.Btn_Gather);
        AnewListener();

        // 绑定执行的功能
        // 绑定评论功能
        // Btn_Gather?.BtnMain?.el?.querySelector("#userShowToEagle")?.addEventListener("click", SetUserShowToEagle);
    }, 800)





    /**SKU内处理的输出信息 */
    interface SKU_Content {
        /**专用的id  */
        id?: string,
        /**排序 */
        sort: number,
        /**是否有货 */
        show: boolean,
        /**价格   稳定为主该脚本中不添加*/
        price?: string,
        /**库存   稳定为主该脚本中不添加*/
        stock?: number,
        /**图片链接 */
        url: string,
        /**图片名称 */
        name: string
    }
    interface APP_Start {
        /**主界面元素 */
        APP_Element: Element | null

        Btn_Gather: Btn_Gather
    }

    interface APP_Get {
        /**显示用户协议 */
        UserAgreement: () => void
        /**解析大图 */
        Max_Imag: (URL: string) => string
        /**下拉到底部 */
        ScrollToBottom(): Promise<void>
        /**检查更新 */
        Update(): Promise<boolean>
        /**处理SKU获取的函数 */
        GetSKU_Content: () => EagleSetAllImagesURL_Items_Data[]
        /**处理主图视频获取的函数 */
        GetVideo_Content: () => EagleSetAllImagesURL_Items_Data[]
        /**处理主图获取的函数 */
        GetThumb_Content: () => EagleSetAllImagesURL_Items_Data[]
        /**处理详情页 */
        GetDetails_Content: () => Promise<EagleSetAllImagesURL_Items_Data[]>
        /**获取商品表单信息 */
        GetInformation_Content: () => string
    }



    if (location.host === "kiic.top") console.timeEnd("--------------------------ScriptStartingSpeed--------------------------")
})(window, unsafeWindow, setTimeout, GM_setClipboard, {},);

type NewElementType =
    | Element
    | "div"
    | "li"
    | "i"
    | "script"
    | "link"
    | "p"
    | "ul"
    | "a"
    | "span"
    | "a"
    | "img"
    | string;

type TreatmentMethodData = {
    /**主图元素位置 */
    thumb: string | null
    /**详情页元素位置 */
    details: string | null
    /**SKU元素位置 */
    SKU: string | null
    /**信息表元素位置 */
    Information: string | null
    /**主图视频元素位置 */
    video: string | null
    /**标题元素位置 */
    title: string | null
    /**格式化链接 */
    Link: string
    /**详情页图片位置 */
    detailsText: string
}
/**判断是否支持运行该脚本 */
interface TreatmentMethod {
    /**  天猫  */
    'detail.tmall.com': TreatmentMethodData
    /**  天猫国际  */
    'detail.tmall.hk': TreatmentMethodData
    /**  C店  */
    'item.taobao.com': TreatmentMethodData
    /**  天猫超市  */
    'chaoshi.detail.tmall.com': TreatmentMethodData
    /**  1688  */
    'detail.1688.com': TreatmentMethodData
    /**排序  例如我预设要求 顺序：主图=》详情=》SKU  视频不管*/
    WeightSorting: {
        /**SKU权重 */
        SKU: number,
        /**视频权重 */
        video: number,
        /**主图权重 */
        thumb: number,
        /**详情权重 */
        details: number,
    }
    /**为不同类型的文件归类主文件夹 */
    Classify: boolean
    /**快捷键 */
    shortcut: {
        /**显示全部 */
        ShowAllBtn: null | string,
        /**采集视频 */
        Video: null | string,
        /**采集主图 */
        ShopWindow: null | string,
        /**采集SKU */
        SKU: null | string,
        /**采集详情页 */
        DetailPage: null | string,
        /**复制链接 */
        CopyLink: null | string,
        /**采集全部 */
        ToEagleAllImages: null | string
        /**设置快捷键 */
        SetTakeShortcut: null | string
        /**收藏全页详情 */
        Push_Download_DetailPage: null | string
    }
}
type Element_ID_OF = "userShowToEagle" | "SetTakeShortcut" | "HM_TAOBAOZHUSHOU_030_APP_UI_Element" | "CollectDetailPageSetEagle" | "ShowAllBtn" | "CollectAllSetEagle" | "Collect_SKU_SetEagle" | "Collect_ShopWindow_SetEagle" | "Collect_Video_SetEagle" | "CopyLink" | "Download_DetailPage"
/**按钮基础操作 */
interface Btn_Gather_Data {
    /**绑定的ID名 */
    id: Element_ID_OF,
    /**显示 */
    show: () => void,
    /**隐藏 */
    hide: () => void,
    /**删除 */
    remove: () => void,
    /**设置新的名称 */
    SetName: (Name: string) => void,
    /**元素绑定 */
    el: Element | null | undefined
    display: string
    /**显示所有按钮  仅在主按钮上面挂载 */
    showAllButtons?: () => void
    /**默认按钮（3按钮）  仅在主按钮上面挂载 */
    showDefaultButtons?: () => void
    /**绑定的函数 */
    function?: Function
}

/**按钮基础绑定操作 */
interface Btn_Gather {
    /**拼接并下载整页详情 */
    Push_Download_DetailPage?: Btn_Gather_Data,
    /**采集主图 */
    ShopWindow?: Btn_Gather_Data,
    /**采集SKU */
    SKU?: Btn_Gather_Data,
    /**显示所有按钮 */
    ShowAllBtn?: Btn_Gather_Data,
    /**采集详情页 */
    DetailPage?: Btn_Gather_Data,
    /**采集全部 */
    ToEagleAllImages?: Btn_Gather_Data,
    /**采集视频 */
    Video?: Btn_Gather_Data,
    /**复制短连接 */
    CopyLink?: Btn_Gather_Data,
    /**总按钮信息 */
    BtnMain?: Btn_Gather_Data,
    /**添加快捷键 */
    SetTakeShortcut?: Btn_Gather_Data,
    /**评论快采 */
    userShowToEagle?: Btn_Gather_Data,
}
type ScriptJSON = typeof HM_ScriptJSON

interface EagleSetAllImagesURL_Items_Data {
    /**必填，欲添加图片链接，支持 http、 https、 base64*/
    url: string
    /**必填，欲添加图片名 */
    name: string
    /**图片来源网址 */
    website?: string
    /**注释 */
    annotation?: string
    /**标签 */
    tags?: string[]
    /**创建时间  参与排序*/
    modificationTime?: number
    /**请求头 */
    headers?: object
}
/**发送到Eagle的格式 */
interface EagleSetAllImagesURL_Items {
    folderId: null | string,
    items: EagleSetAllImagesURL_Items_Data[]
}

type __INIT_DATA = typeof __INIT_DATA

type ReplaceList = [string, string][];
type ShortcutKEYType = "Video" | "ToEagleAllImages" | "DetailPage" | "SKU" | "ShopWindow" | "Push_Download_DetailPage"
type ShortcutContent = {
    name: "收藏全部" | "收藏视频" | "收藏主图" | "收藏SKU" | "收藏详情" | "收藏全页详情"

    id: ShortcutKEYType
    /**快捷键 */
    Shortcut: null | string
    /**解释 */
    effect: "将当前页面\n所有支持的图片打包"
    /**显示的图标 */
    icon: string
    /**是否冻结选项 */
    frozen: boolean
    /**GM记录的key和变量中的key */
    key: "ToEagleAllImages"
    click?: boolean
}
type ShortcutContentList = ShortcutContent[]
type Btn_GatherKEY = "ToEagleAllImages" | "CopyLink" | "DetailPage" | "SKU" | "ShopWindow" | "ShowAllBtn" | "SetTakeShortcut" | "Push_Download_DetailPage"
declare class Store {
    constructor()
}



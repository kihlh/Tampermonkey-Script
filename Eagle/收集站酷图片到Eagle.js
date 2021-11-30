// ==UserScript==
// @name                收集站酷图片到Eagle
// @namespace           http://tampermonkey.net/
// @version             0.2
// @description         收集图片到Eagle
// @match               http://localhost:41595*
// @match               www.zcool.com.cn/work/*
// @grant               GM_xmlhttpRequest
// @grant               GM_setClipboard
// @grant               GM_setValue
// @grant               GM_getValue
// @grant               unsafeWindow
// @connect             *
// @run-at              document-body
// @require             https://greasyfork.org/scripts/430351-eagle%E4%BA%A4%E4%BA%92%E8%84%9A%E6%9C%AC/code/Eagle%E4%BA%A4%E4%BA%92%E8%84%9A%E6%9C%AC.js?version=957317
// @namespace           https://greasyfork.org/users/710095
// @date                11/28/2021
// ==/UserScript==

(function () {
        if(GM_getValue('OFF'))return;
        // 创建按钮
        let NewDoment = document.createElement("div");
        NewDoment.id = "ToEagle";
        // 图标和提示...
        NewDoment.innerHTML = '<div style="width: 25px;margin: 6px 0 0 0;" ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.12 18.02"><defs><style>.cls-1{fill:#282828;}.cls-2{fill:none;stroke:#282828;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px;}</style></defs><g id="图层_2" data-name="图层 2"><g id="图层_1-2" data-name="图层 1"><path class="cls-1" d="M15,2.33c-1.4,1.1-2.4,2.4-3.7,2.8-4.5,1.5-8.3,3.6-9.7,8.8-2.6-4.3-2-8.6,1.3-11.6S10.62-.87,15,2.33Z"/><path class="cls-1" d="M10.92,17.93c-3.2.3-5.9,0-7.6-2.2-1-1.3,1.3-5.3,3.6-6.8,1-.6,2.2-1,4.1-1.9C8.52,10.93,7.92,14.23,10.92,17.93Z"/><path class="cls-1" d="M13.42,5.63c.9-1,1.6-1.7,2.6-2.8.7,1.5,1.3,2.7,2.1,4.5C16.42,6.73,15.12,6.23,13.42,5.63Z"/><path class="cls-2" d="M14.08,16.1V9.43"/><path class="cls-2" d="M16.43,13.74,14.07,16.1l-2.36-2.36"/></g></g></svg></div><div class="sidebar-fixed_warm-prompt" style="top:95%;">添加到Eagle</div>';
        NewDoment.style.borderRadius = "4px";
        NewDoment.style.width = "50px";
        NewDoment.style.height = "50px";
        NewDoment.style.marginTop = "5px";
        NewDoment.style.borderRadius = "10px";
        NewDoment.style.background = "#FFF";
        NewDoment.style.border = "1px solid #E9E9E9";
        NewDoment.style.borderRadius = "4px";
        NewDoment.style.cursor = "pointer";
        NewDoment.style.transition = " background .3s";
        NewDoment.style.display = "flex";
        NewDoment.style.justifyContent = "center";
        NewDoment.style.alignContent = "center";
        NewDoment.style.alignItems = "center";
        setTimeout(function () {
                document.querySelector(".sidebar-fixed-wrapper .js-details-sidebar").appendChild(NewDoment);
        }, 800)
        NewDoment.addEventListener("mouseover", function () {
                NewDoment.querySelector(".sidebar-fixed_warm-prompt").style.display = "block"
        });
        NewDoment.addEventListener("mouseout", function () {
                NewDoment.querySelector(".sidebar-fixed_warm-prompt").style.display = "none"
        });
        // 排序 _00  _%NN
        function MIU_NUM(num, n) {
                return (Array(n).join(0) + num).slice(-n);
        }
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


        // 主函数
        function Send_pictures_to_Eagle() {
                if(!UserAgreement())return;
                const ImagesList = new Set;
                // 数据表 在网站中
                const shareZ = unsafeWindow.shareZ
                // 数据转数组
                const GetimagsUrlList = shareZ.pic.split("||");
                for (const URLs of GetimagsUrlList) {
                        ImagesList.add(URLs.replace(/^[\s\t\n]+|[\s\t\n]+$/, '').replace(/@.+$/, ''))
                };
                if (!ImagesList.size) return;
                //     文件夹创建完了执行
                ToEagle.SetNewFolder(shareZ.title + "").then(Data => {
                        console.log(Data);
                        const FolderID = Data.data.id;
                        // 发送的数据表
                        const DataSent = {
                                "items": [],
                                "folderId": FolderID || null
                        }
                        console.log(ImagesList);
                        //转不重复的数组
                        const Getimages_no_repeatList = ImagesList.keys();
                        //当前网站
                        const documentURL = document.location.href;
                        const tagList=[];
                        // 网站自带的标签
                        const {productCates}=unsafeWindow;
                        if(productCates){
                                if(Object.prototype.toString.call(productCates)=='[object Array]'){
                                        for (let index = 0; index < productCates.length; index++) {
                                                // 标签  强制转换为文本为了用户安全
                                                const TagText = productCates[index] + "";
                                                if(TagText=='原创作品')continue
                                                tagList.push(TagText)
                                        }
                                }
                        }
                        let index = 0;
                        for (const URLs of [...Getimages_no_repeatList]) {
                                if (URLs) DataSent.items.push({
                                        url: URLs,
                                        name: `图片_${MIU_NUM(index+1/*不从0开始*/,2)}`,
                                        website: documentURL,
                                        modificationTime: +new Date(),
                                        annotation: shareZ.summary + "",
                                        tags:tagList
                                })
                                // 搞完了隐藏按钮
                        }
                        if (!DataSent.items.length) return;
                        console.log(DataSent);
                        ToEagle.AddImagesURLAll(DataSent).then(e=>NewDoment.style.display = "none")

                });

        }
        // 执行点击监听
        NewDoment.addEventListener("click", Send_pictures_to_Eagle);
})();

// ==UserScript==
// @name                Eagle交互脚本
// @author              黄逗酱酱
// @icon                https://kiic.oss-cn-beijing.aliyuncs.com/HMicc.png
// @grant               unsafeWindow
// @version             1.0.1
// @description         zh-cn
// @license             MPL-2.0
// @namespace           https://greasyfork.org/users/710095
// ==/UserScript==

const EAGLE_APIROOT = "http://localhost:41595";
try { if (typeof fetch === "undefined") { if (typeof unsafeWindow !== "undefined") fetch = unsafeWindow.fetch } } catch (E) { }//为了兼容油猴脚本懒得维护第二个脚本
var ToEagle = {
    _Totype: {
        Get() { return { method: 'GET', mode: 'cors', redirect: 'follow' } },
        POST(Data) { return { method: 'POST', mode: 'cors', body: JSON.stringify(Data), redirect: 'follow' } }
    },
    _url: {
        /**
         * API接口
         *@Folder 创建文件夹及创建子文件夹API接口
         *@FolderReName 仅设置文件夹名称
         *@GetlistRecent  获取最近使用的项目
         *@UPFolder   对文件夹进行更加详细的设置
         *@AddImagesURL 添加单张 URL
         *@AddImagesURLAll 添加多个图片 URL
         *@AddImagesPATH 添加单张 本地
         *@AddImagesPATHAll 添加多个图片 本地
         *@Getthumbnail 取得缩略图
         *@UPthumbnail 刷新缩略图
         *@Getinfo 获取该ID的项目详细
         *@GetRootFolder 获取根目录下所有的文件夹
         * */
        Folder: `${EAGLE_APIROOT}/api/folder/create`,//{"folderName": "文件夹名称"};  //子文件夹{"folderName": "文件夹名称","parent": "KRFUPRMIMSNFP"}
        FolderReName: `${EAGLE_APIROOT}/api/folder/rename`,//{"folderId": "KBHOIWCUO6U9I","folderName": "新的名称"};
        GetlistRecent: `${EAGLE_APIROOT}/api/folder/list`,//to Get()
        UPFolder: `${EAGLE_APIROOT}/api/folder/update`,
        AddImagesURL: `${EAGLE_APIROOT}/api/item/addFromURL`,
        AddImagesURLAll: `${EAGLE_APIROOT}/api/item/addFromURLs`,
        AddImagesPATH: `${EAGLE_APIROOT}/api/item/addFromPath`,
        AddImagesPATHAll: `${EAGLE_APIROOT}/api/item/addFromPaths`,
        Getthumbnail: `${EAGLE_APIROOT}/api/item/thumbnail?id=`,
        UPthumbnail: `${EAGLE_APIROOT}/api/item/refreshThumbnail`,
        Getinfo: `${EAGLE_APIROOT}/api/item/info?id=`,
        GetRootFolder: `${EAGLE_APIROOT}/api/folder/list`,
        UPdata: `${EAGLE_APIROOT}/api/item/update`
    },
    /**
     * 创建新的文件夹
     *
     * @param {*} name 名称
     * @param {*} [ID=null] 添加到哪个文件夹下
     * @return 
     */
    async SetNewFolder(name, ID = null) {
        return fetch(
            this._url.Folder,
            this._Totype.POST(
                { "parent": ID, "folderName": name }))
            .then(response => response.json())
            .catch(E => console.log('error', E));
    },
    /**
     * 仅设置文件夹名称
     * @param {*} name 
     * @param {*} ID 
     * @return {*}  - {"status": "success","data": {"id": "KBJJSMMVF9WYL","name": "新的名称","images": [],"folders": []...}}
     */
    async SetFolderNewName(name, ID) {
        if (!name || !ID) return;
        return fetch(this._url.FolderReName,
            this._Totype.POST({ "folderId": ID, "folderName": name }))
            .then(response => response.json())
            .catch(error => console.log('error', error));
    },
    /**
     * 获取最近使用的文件夹
     * @return {object} - {"status": "success","data": [ {}...]}
     */
    async GetlistRecent() {
        return fetch(this._url.GetlistRecent, this._Totype.Get())
            .then(response => response.json())
            .catch(error => console.log('error', error));
    },
    /**
     * 设置文件夹信息 值为 null不更新
     *
     * @param {string} ID 文件夹 ID
     * @param {string} [newName=null] 新的文件夹名
     * @param {string} [newDescription=null] 新的文件夹描述
     * @param {string} [newColor=null] 设置文件夹颜色   "red","orange","green","yellow","aqua","blue","purple","pink"
     * @return 
     */
    async UPFolder(ID, newName, newDescription, newColor) {
        if (!ID) return;
        let Obj = {
            "folderId": ID,
            "newName": newName || null,
            "newDescription": newDescription || null,
            "newColor": newColor || null
        };

        return fetch(this._url.UPFolder, this._Totype.POST(Obj))
            .then(response => response.json())
            .catch(error => console.log('error', error));
    },
    /**
     * 添加单张链接图片
     *
     * @param {string} URL 可以是url也可以是obj
     * @param {object} Obj - 可以是name  - 也可以是Object 
     * @param {*} - {
    "url": "...",
    "name": "Work",
    "website": "https://...",
    "tags": ["Illustration", "Design"],
    "modificationTime": 1591325171766,
    "headers": {
      "referer": "..."
    }
  };
     */
    async AddImagesURL(URL, Obj) {
        let Data = this._GetImagesURLOBJ(URL, Obj);
        console.log(Data);
        return fetch(this._url.AddImagesURL, this._Totype.POST(Data))
            .then(response => response.json())
            .catch(error => console.log('error', error));
    },
    /**
     * 添加单张本地图片
     *
     * @param {string} URL 可以是url也可以是obj
     * @param {object} Obj - 可以是name  - 也可以是Object 
     * @param {*} - {
    "url": "...",
    "name": "Work",
    "website": "https://...",
    "tags": ["Illustration", "Design"],
    "modificationTime": 1591325171766,
    "headers": {
      "referer": "..."
    }
  };
     */
    async AddImagesPATH(URL, Obj) {
        let Data = this._GetImagesURLOBJ(URL, Obj);
        return fetch(this._url.AddImagesPATH, this._Totype.POST(Data))
            .then(response => response.json())
            .catch(error => console.log('error', error));
    },
    /**
     * 对单张图片的格式分析的
     *
     * @param {string} URL 可以是url也可以是obj
     * @param {object} Obj - 可以是name  - 也可以是Object 
     * @return 
     */
    _GetImagesURLOBJ(URL, Obj) {
        if (!URL) return;
        let data = {
            "url": "",
            "path": "",
            "name": null,
            "website": "",
            "tags": [],
            "modificationTime": Date.now()
        };
        if (typeof Obj === "string") { data.name = Obj; data.url = URL; data.path = URL }
        else {
            if (typeof URL === "object") {
                data = Object.assign(data, URL)
            }
            if (typeof Obj === "object") {
                data = Object.assign(data, Obj)
                data.url = URL
                data.path = URL
            }
            if (typeof URL === "string") data.url = URL, data.path = URL;
        }
        return data
    },
    /**
     * 获取缩略图
     *
     * @param {*} ID 
     * @return - {
    "status": "success",
    "data": "/Users/augus/Pictures/test.library/images/KBKE04XSTXR7I.info/Rosto.jpg"}
     */
    async Getthumbnail(ID) {
        return fetch(this._url.Getthumbnail + ID, this._Totype.Get())
            .then(response => response.json())
            .catch(error => console.log('error', error));
    },
    async Getinfo(ID) {
        return fetch(this._url.Getinfo + ID, this._Totype.Get())
            .then(response => response.json())
            .catch(error => console.log('error', error));
    },
    async UPthumbnail(ID) {
        let Data = {
            "id": ID
        }
        return fetch(this._url.Getthumbnail + ID, this._Totype.POST(Data))
            .then(response => response.json())
            .catch(error => console.log('error', error))
    },
    /**
     *  代码阻塞 
     *
     * @param {*} ms 毫秒
     * @return undefined
     * 调用： await this._Sleep(500);
     */
    _Sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) },
    /**
     * 获取根目录下所有的文件夹
     *
     * @return 
     */
     async GetRootFolder() {
        return fetch(this._url.Getinfo + ID, this._Totype.Get())
            .then(response => response.json())
            .catch(error => console.log('error', error));
    },
    _IsArray(Is) { return toString.apply(Is) === '[object Array]'; },
    /**
     * 
     *
     * @param {string} ID 必填
     * @param {Array} tags 必填 可以是标签：[...]也可以是数据obj全集
     * @param {string} annotation 注释
     * @param {string} url 来源网站
     * @param {number} star 星级
     * @return  object
     */
    UPdata(ID, tags, annotation, url, star,name="官方未支持") {
        if(!ID)return console.error(new Error("未传入id"))
        let Data = {
            "id": ID,
            tags: this._IsArray(tags)?tags: null,
            annotation: annotation,
            url: url,
            star: star
        }
        if(typeof tags==="object")Data=Object.assign(Data,tags)
        return fetch(this._url.Getthumbnail + ID, this._Totype.POST(Data))
            .then(response => response.json())
            .catch(error => console.log('error', error))
    },
    async AddImagesURLAll(Obj,ID){
        let GetID=ID||Obj.folderId
        Obj.folderId=GetID
        return fetch(this._url.AddImagesURLAll, this._Totype.POST(Obj))
        .then(response => response.json())
        .catch(error => console.log('error', error))
    },
    async AddImagesPATHAll(Obj,ID){
        let GetID=ID||Obj.folderId
        Obj.folderId=GetID
        return fetch(this._url.AddImagesPATHAll, this._Totype.POST(Obj))
        .then(response => response.json())
        .catch(error => console.log('error', error))
    },
}

try { if (typeof module === "object" && typeof module.exports === "object") module.exports = ToEagle } catch (E) { }//为了兼容非模块调用
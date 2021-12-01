
// https://www.yuque.com/augus-gsjgn/eagle-api/yw0rd9
interface folderData {
    "folderName": "文件夹名称"
    "parent"?: "KRFUPRMIMSNFP"
}
// https://www.yuque.com/augus-gsjgn/eagle-api/yw0rd9
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
// https://www.yuque.com/augus-gsjgn/eagle-api/zwwmw0
interface listRecentData {
    "status": "success",
    "data": [
        {
            "id": "KBCB8BK86WIW1",
            "name": "工业风",
            "description": "",
            "children": [],
            "modificationTime": 1591972345736,
            "tags": [],
            "password": "",
            "passwordTips": "",
            "images": [],
            "isExpand": true,
            "newFolderName": "工业风",
            "imagesMappings": {},
            "imageCount": 11,
            "descendantImageCount": 11,
            "pinyin": "GONGYEFENG",
            "extendTags": []
        }
    ]
}
interface addFromPaths {

}
interface Eagle_status {
    "status": "success"
}

// https://www.yuque.com/augus-gsjgn/eagle-api/eivucp
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
interface addFromPaths {
    "items": [
        {
            "path": "F:/...jpg",
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
interface EagleinfoData {
    "status": "success",
    "data": {
        "id": "KBKE04XSTXR7I",
        "name": "Rosto",
        "size": 21950,
        "ext": "jpg",
        "tags": [],
        "folders": [
            "KBKE0240V8OII"
        ],
        "isDeleted": false,
        "url": "https://www.pinterest.com/pin/380343131025657796/",
        "annotation": "",
        "modificationTime": 1592460728472,
        "width": 623,
        "height": 623,
        "noThumbnail": true,
        "lastModified": 1592460776990,
        "palettes": [
            {
                "color": [
                    132,
                    236,
                    244
                ],
                "ratio": 49,
                "$$hashKey": "object:604"
            },
            {
                "color": [
                    249,
                    220,
                    221
                ],
                "ratio": 24,
                "$$hashKey": "object:605"
            },
            {
                "color": [
                    250,
                    149,
                    150
                ],
                "ratio": 12,
                "$$hashKey": "object:606"
            },
            {
                "color": [
                    8,
                    45,
                    142
                ],
                "ratio": 11,
                "$$hashKey": "object:607"
            },
            {
                "color": [
                    189,
                    76,
                    91
                ],
                "ratio": 1.16,
                "$$hashKey": "object:608"
            },
            {
                "color": [
                    174,
                    214,
                    221
                ],
                "ratio": 0.39,
                "$$hashKey": "object:609"
            }
        ]
    }
}

interface EagleRootList {
    "status": "success",
    "data": [
        {
            "id": "JMHB2Y3Y3AA75",
            "name": "UI Design",
            "description": "",
            "children": [],
            "modificationTime": 1537854867502,
            "tags": [],
            "imageCount": 33,
            "descendantImageCount": 33,
            "pinyin": "UI Design",
            "extendTags": []
        }
    ]
}

interface itemsData {
    "url"?: "",
    "path"?: "",
    "name"?: null,
    "website"?: "",
    "tags"?: [],
    "modificationTime"?: 0
}
interface ADD_Images_OKK_info {
    "url": "...",
    "name": "Work",
    "website": "https://...",
    "tags": ["Illustration", "Design"],
    "modificationTime": 1591325171766,
    "headers": {
        "referer": "..."
    }
}
interface DeveloperInterface {
    Get(): { method: 'GET', mode: 'cors', redirect: 'follow' }
    POST(Data): { method: 'POST', mode: 'cors', body: string, redirect: 'follow' }
}



interface ToEagle {
    /**
 * 创建文件夹
 * @param folderName 文件夹名称
 * @param parent 添加到哪个文件夹
 */
    SetNewFolder(folderName: folderData, ID?: null | string): Promise<folder_Run_Data>
    /**
     * 仅设置文件夹名称
     * @param {*} name 
     * @param {*} ID 
     */
    SetFolderNewName(folderName: folderData, ID?: null | string): Promise<folder_Run_Data>

    /**
     * 获取最近使用的文件夹
     * @return {object} - {"status": "success","data": [ {}...]}
     */
    GetlistRecent(): listRecentData
    /**
     * 批量添加网络图片
     * @param Obj Eafle支持的数据
     * @param ID 文件夹ID
     */
    AddImagesURLAll(Obj: addFromURLs, ID?: null | string): Promise<Eagle_status>;
    /**
     * 刷新指定图片的缩略图
     * @param ID 
     */
    UPthumbnail(ID: string): Promise<any>
    /**
    * 获取缩略图
    * @param {*} ID 
    */
    Getthumbnail(ID: string): Promise<{ "status": "success", "data": "F:/....jpg" }>
    /**
     * 获取项目信息
     * @param ID 
     */
    Getinfo(ID: string): Promise<EagleinfoData>
    /**
     * 修改项目信息
     * @param {string} ID 必填
     * @param {Array} tags 必填 可以是标签：[...]也可以是数据obj全集
     * @param {string} annotation 注释
     * @param {string} url 来源网站
     * @param {number} star 星级
     * @return  object
     */
    UPdata(ID: string, tags?: Array<string>, annotation?: string, url?: string, star?: string): Promise<EagleinfoData>
    /**
     * 获取根目录下所有的文件夹
     */
    GetRootFolder(): Promise<EagleRootList>
    /**
     * 批量添加本地图片
     * @param Obj Eafle支持的Path数据
     * @param ID 文件夹ID
     */
    AddImagesPATHAll(Obj: addFromPaths, ID?: null | string): Promise<Eagle_status>
    /**
     * 添加单张本地图片
     * @param {string} URL 可以是url也可以是obj
     * @param {object} Obj - 可以是name  - 也可以是Object 
     */
    AddImagesPATH(PATH: string | itemsData, Obj?: itemsData): Promise<ADD_Images_OKK_info>
    /**
     * 添加单张链接图片
     *
     * @param {string} URL 可以是url也可以是obj
     * @param {object} Obj - 可以是name  - 也可以是Object 
     */
    AddImagesURL(URL: string | itemsData, Obj?: itemsData): Promise<ADD_Images_OKK_info>

    //集成工具或者信息集-------------------------------
    /**
   *生产出items中的单张格式
   * @param {string} URL 可以是url也可以是obj
   * @param {object} Obj - 可以是name  - 也可以是Object 
   */
    _GetImagesURLOBJ(URL: string | itemsData, Obj?: itemsData)
    /**
    * 集成工具集 异步阻塞(进程阻塞 进程休眠)
    * @param ms 毫秒
    * @returns 
    * 调用： await this._Sleep(500);
    */
    _Sleep(ms: number): Promise<void>
    /**
     * 集成工具集 是否是数组
     * @param Is 
     */
    _IsArray(Is): boolean
    _Totype: DeveloperInterface
    /**
     * API接口
     */
    _url: {
        /**创建文件夹及创建子文件夹API接口 */
        Folder: `http://localhost:41595/api/folder/create`,
        /**仅设置文件夹名称 */
        FolderReName: `http://localhost:41595/api/folder/rename`,
        /**获取最近使用的项目 */
        GetlistRecent: `http://localhost:41595/api/folder/list`,
        /**对文件夹进行更加详细的设置 */
        UPFolder: `http://localhost:41595/api/folder/update`,
        /**添加单张 URL */
        AddImagesURL: `http://localhost:41595/api/item/addFromURL`,
        /**添加多张 URL */
        AddImagesURLAll: `http://localhost:41595/api/item/addFromURLs`,
        /**添加单张 本地 */
        AddImagesPATH: `http://localhost:41595/api/item/addFromPath`,
        /**添加多张 本地 */
        AddImagesPATHAll: `http://localhost:41595/api/item/addFromPaths`,
        /**取得缩略图 */
        Getthumbnail: `http://localhost:41595/api/item/thumbnail?id=`,
        /**刷新缩略图 */
        UPthumbnail: `http://localhost:41595/api/item/refreshThumbnail`,
        /**获取该ID的项目详细 */
        Getinfo: `http://localhost:41595/api/item/info?id=`,
        /**获取根目录下所有的文件夹 */
        GetRootFolder: `http://localhost:41595/api/folder/list`,
        /**修改项目信息 */
        UPdata: `http://localhost:41595/api/item/update`
    }
}



declare var ToEagle
declare module 'Eagle' {
    export = ToEagle;
}

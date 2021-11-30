// ==UserScript==
// @name         花瓣花瓣
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://huaban.com/*
// @grant        none
// @run-at      context-menu

// ==/UserScript==

(function() {
    'use strict';
if(document.querySelector("#KR5XFZG5MI637CSS")){
document.querySelector("#KR5XFZG5MI637CSS").remove()
}else{
    let Css = document.createElement("style");
    Css.id = "KR5XFZG5MI637CSS";
    Css.innerHTML =`.pin .actions .repin.pin-quick {
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
    float: left;
    width: 300px;
    height: 1000px;
    padding: 0 5px0 4px;
    background: #e76464eb;
    border: 0;
    border-left: 1px
    solid #0000007a;}`;
    document.querySelector("body").appendChild(Css)


}















})();
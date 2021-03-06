//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        //当前页数
        this.pageNumCurrent = 0;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    Main.prototype.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    Main.prototype.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    Main.prototype.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    Main.prototype.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    Main.prototype.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    Main.prototype.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 翻页函数，在画场景中调用
     */
    Main.prototype.pageTurningBitmap = function (pageArray, pageNumAll) {
        var _this = this;
        var distance = 0;
        var stageYBeforeMove = 0;
        var stageYAfterMove = 0;
        pageArray[this.pageNumCurrent].touchEnabled = true;
        for (var i = 0; i < pageArray.length; i++) {
            if (i != this.pageNumCurrent) {
                pageArray[i].touchEnabled = false;
            }
        }
        pageArray[this.pageNumCurrent].addEventListener(egret.TouchEvent.TOUCH_BEGIN, function (e) {
            console.log(e.stageY);
            stageYBeforeMove = e.stageY;
        }, this);
        pageArray[this.pageNumCurrent].addEventListener(egret.TouchEvent.TOUCH_END, function (e) {
            console.log("move to Y:" + e.stageY);
            stageYAfterMove = e.stageY;
            distance = stageYBeforeMove - stageYAfterMove;
            //往后翻
            if (distance > 0) {
                _this.pageTurningDetermine(pageNumAll, distance, pageArray[_this.pageNumCurrent], pageArray[_this.pageNumCurrent + 1]);
            }
            else {
                _this.pageTurningDetermine(pageNumAll, distance, pageArray[_this.pageNumCurrent - 1], pageArray[_this.pageNumCurrent]);
            }
        }, this);
    };
    /**
     *两个参数为before是当前页，after是想要翻到的页数，判断要怎么翻页
     */
    Main.prototype.pageTurningDetermine = function (pageNumAll, moveDistance, pictureBeforeMove, pictureAfterMove) {
        if (moveDistance > 300 && this.pageNumCurrent == pageNumAll) {
            alert("最后一页不能往后翻");
        }
        else if (moveDistance < -300 && this.pageNumCurrent == 0) {
            alert("第一页不能往前翻");
        }
        else if (moveDistance < -300 && this.pageNumCurrent != 0) {
            //alert("中间的页往前翻");
            this.pageTurningTween(pictureAfterMove);
            if (pictureAfterMove.y == 0) {
                this.pageNumCurrent--;
            }
            console.log("中间的页往前翻" + pictureAfterMove.y);
        }
        else if (moveDistance > 300 && this.pageNumCurrent != pageNumAll) {
            //alert("中间的页往后翻");
            this.pageTurningTween(pictureAfterMove);
            //防止动画动到一半还改变了页数
            if (pictureAfterMove.y == 1136) {
                this.pageNumCurrent++;
            }
            console.log("中间的页往后翻" + pictureAfterMove.y);
        }
        console.log("page:" + this.pageNumCurrent);
    };
    /**
     * 实现翻页
     */
    Main.prototype.pageTurningTween = function (pageAfterMove) {
        var pageAfterTween = egret.Tween.get(pageAfterMove);
        if (pageAfterMove.y == 1136) {
            pageAfterTween.to({ y: 0 }, 500);
        }
        else if (pageAfterMove.y == 0) {
            pageAfterTween.to({ y: 1136 }, 500);
        }
    };
    // egret.TouchEvent.TOUCH_BEGIN
    //20160928Begin
    /*var tween = egret.Tween.get(icon);
    tween.to({x:100}, 2000).to({y:200}, 2000).call(function(){
        //alert("aaa")
    },this).to({x:26, y:33}, 20);*/
    /**
     * 创建游戏场景
     * Create a game scene
     */
    Main.prototype.createGameScene = function () {
        //加载第一张图片
        var sky = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        //黑框部分
        var topMask = new egret.Shape();
        topMask.graphics.beginFill(0x000000, 0.5);
        topMask.graphics.drawRect(0, 0, stageW, 172);
        topMask.graphics.endFill();
        topMask.y = 33;
        this.addChild(topMask);
        //Egret图标
        var icon = this.createBitmapByName("egret_icon_png");
        this.addChild(icon);
        icon.x = 26;
        icon.y = 33;
        //pageTurning(pageNumCurrent);
        //2016touch
        /*icon.touchEnabled = true;
        icon.addEventListener(egret.TouchEvent.TOUCH_BEGIN,()=>{
            alert(1111);
        },this);*/
        var line = new egret.Shape();
        line.graphics.lineStyle(2, 0xffffff);
        line.graphics.moveTo(0, 0);
        line.graphics.lineTo(0, 117);
        line.graphics.endFill();
        line.x = 172;
        line.y = 61;
        this.addChild(line);
        var colorLabel = new egret.TextField();
        colorLabel.textColor = 0xffffff;
        colorLabel.width = stageW - 172;
        colorLabel.textAlign = "center";
        colorLabel.text = "Hello Egret";
        colorLabel.size = 24;
        colorLabel.x = 172;
        colorLabel.y = 80;
        this.addChild(colorLabel);
        var textfield = new egret.TextField();
        this.addChild(textfield);
        textfield.alpha = 0;
        textfield.width = stageW - 172;
        textfield.textAlign = egret.HorizontalAlign.CENTER;
        textfield.size = 24;
        textfield.textColor = 0xffffff;
        textfield.x = 172;
        textfield.y = 135;
        this.textfield = textfield;
        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        RES.getResAsync("description_json", this.startAnimation, this);
        //第二张图片
        var sky2 = this.createBitmapByName("bg_2_jpg");
        this.addChild(sky2);
        sky2.width = stageW;
        sky2.height = stageH;
        sky2.x = 0;
        sky2.y = 1136;
        var sky3 = this.createBitmapByName("bg_3_jpg");
        this.addChild(sky3);
        sky3.width = stageW;
        sky3.height = stageH;
        sky3.x = 0;
        sky3.y = 1136;
        var pageNumAll = 2;
        //总页面数写作2其实是3页
        var pageArray = [sky, sky2, sky3];
        this.pageTurningBitmap(pageArray, pageNumAll);
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    Main.prototype.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    Main.prototype.startAnimation = function (result) {
        var self = this;
        var parser = new egret.HtmlTextParser();
        var textflowArr = [];
        for (var i = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }
        var textfield = self.textfield;
        var count = -1;
        var change = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];
            self.changeDescription(textfield, lineArr);
            var tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, self);
        };
        change();
    };
    /**
     * 切换描述内容
     * Switch to described content
     */
    Main.prototype.changeDescription = function (textfield, textFlow) {
        textfield.textFlow = textFlow;
    };
    return Main;
}(egret.DisplayObjectContainer));

//*** SHIM ***
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      };
  })();
  
  (function() {
      "use strict";
      
      //************
      //VARIABLES
      //************
      var _Canvas;
      let _frontImageSrc = './test-tan.jpg';
      let _backImageSrc = './test.jpg';
      let _frontImage;
      let _backImage;
      let _blackMask;
      let _mouseX = 0;
      let _mouseY = 0;
      let _maskCount = 25;
      let _tweenTime = 0.5;
      let _pauseTime = 0.25;
      let _delayTime = 0.08;
      let _maskArray = [];
      let _srcArray = ["http://insidedown.com/codepen/stock/newstain1.png", "http://insidedown.com/codepen/stock/newstain2.png", "http://insidedown.com/codepen/stock/newstain3.png"];
      
      //************
      //METHODS
      //************
      function init() {
          _Canvas = new Canvas({stage:document.getElementById('stage')});
          _backImage = new MaskedImage({src:_backImageSrc});
          _frontImage = new MaskedImage({src:_frontImageSrc});
          
          for(let i=0;i<_maskCount;i++){
              let ranSrc = _srcArray[Math.floor(Math.random() * _srcArray.length)];
              let mask = new MaskedImage({src:ranSrc, delay:i, width:300});
              _maskArray.push(mask);
          }
          addListeners();
      }
      
      //************
      //EVENTS
      //************
      function addListeners() {
          _Canvas.el.addEventListener('mousemove', onCanvasMouseMove);
          _Canvas.el.addEventListener('mouseout', onCanvasMouseOut);
      }
      
      function onCanvasMouseMove(event) {
          _mouseX = event.pageX - $(this).offset().left;
          _mouseY = event.pageY - $(this).offset().top;
      }
      
      function onCanvasMouseOut(event) {
      }
      
      function onEnterFrame() {
              _Canvas.clearStage();
              drawStage();
              window.requestAnimFrame(onEnterFrame, 60);
      }
      
      function drawStage() {
          _Canvas.context.save();
          
          for(let i=0;i<_maskCount;i++){
              let mask = _maskArray[i];
              mask.tweenDraw();
          }
          
          //_blackMask.draw(_mouseX,_mouseY);
          _Canvas.context.globalCompositeOperation = 'source-in';
          _backImage.draw();
          _Canvas.context.globalCompositeOperation = 'destination-over';
          _frontImage.draw();
          _Canvas.context.restore();
      }
      
      
      //************
      //CLASSES
      //************
      
      class MaskedImage {
          constructor(options) {
              this.hasImg = false;
              this.img = new Image();
              this.empty = {scale:0, alpha:1, x:0, y:0};
              this.delay = options.delay;
              this.rotation = Math.random() * 360;
              this.width = options.width;
              this.halfWidth = this.width/2;
              this.img.src = options.src;
              this.img.onload = function() {
                  this.hasImg = true;
                  if(this.delay){ 
                      setTimeout(function() {this.scale();}.bind(this), this.delay*(_delayTime * 1000));
                  }
                  this.draw(); 
              }.bind(this);
          }
          
          draw(x=0,y=0) {
              if(this.hasImg) {
                  _Canvas.context.drawImage(this.img,x,y);
              }
          }
          
          tweenDraw() {
              if(this.hasImg) {
                  let curWidth = this.width * this.empty.scale; 
                  _Canvas.context.save();
                  _Canvas.context.globalAlpha = this.empty.alpha;
                  
                  _Canvas.context.translate(this.empty.x, this.empty.y);
                  _Canvas.context.rotate(this.rotation * Math.PI / 180);
                  _Canvas.context.scale(1.5 * (curWidth/this.width), 1.5*(curWidth/this.width));
                  _Canvas.context.translate(-this.empty.x, -this.empty.y);
                  _Canvas.context.drawImage(this.img,this.empty.x-this.halfWidth,this.empty.y-this.halfWidth);
                  _Canvas.context.globalAlpha = 1;
                  _Canvas.context.restore();
              }
          }
          
          scale() {
              this.empty.x = _mouseX;
              this.empty.y = _mouseY;
              this.rotation = Math.random() * 360;
              TweenMax.fromTo(this.empty, _tweenTime, {alpha:1, scale:0},{alpha:1, scale:1, onComplete:function(){
                  setTimeout(this.fadeOut.bind(this), _pauseTime * 1000);
              }.bind(this)
              });
          }
          
          fadeOut() {
              TweenMax.to(this.empty, _tweenTime,{alpha:0, onComplete:this.scale.bind(this)});
          }
          
      }
      
      class Canvas {
          constructor(options) {
              this._stage = options.stage;
              this._stageWidth = this._stage.width = window.innerWidth;
              this._stageHeight = this._stage.height = window.innerHeight;
              this._stageContext = this._stage.getContext('2d');
          }
          
          // clear stage of current content
          clearStage(options) {
              if(typeof options === "undefined") {
                  this._stageContext.clearRect(0,0,this._stageWidth, this._stageHeight);
              }
          }
          
          get width() { return this._stageWidth; }
          get height() { return this._stageHeight; }
          get el() {return this._stage; }
          get context() {return this._stageContext; }
      } //end Canvas class
      
      init();
      onEnterFrame();
      
  })();
  
YUI.add("widget-anim",function(c){var p="boundingBox",o="host",s="node",l="opacity",r="",k="visible",q="destroy",n="hidden",b="rendered",m="start",f="end",i="duration",d="animShow",j="animHide",a="_uiSetVisible",g="animShowChange",h="animHideChange";function e(t){e.superclass.constructor.apply(this,arguments);}e.NS="anim";e.NAME="pluginWidgetAnim";e.ANIMATIONS={fadeIn:function(){var v=this.get(o),t=v.get(p),u=new c.Anim({node:t,to:{opacity:1},duration:this.get(i)});if(!v.get(k)){t.setStyle(l,0);}u.on(q,function(){this.get(s).setStyle(l,(c.UA.ie)?1:r);});return u;},fadeOut:function(){return new c.Anim({node:this.get(o).get(p),to:{opacity:0},duration:this.get(i)});}};e.ATTRS={duration:{value:0.2},animShow:{valueFn:e.ANIMATIONS.fadeIn},animHide:{valueFn:e.ANIMATIONS.fadeOut}};c.extend(e,c.Plugin.Base,{initializer:function(t){this._bindAnimShow();this._bindAnimHide();this.after(g,this._bindAnimShow);this.after(h,this._bindAnimHide);this.beforeHostMethod(a,this._uiAnimSetVisible);},destructor:function(){this.get(d).destroy();this.get(j).destroy();},_uiAnimSetVisible:function(t){if(this.get(o).get(b)){if(t){this.get(j).stop();this.get(d).run();}else{this.get(d).stop();this.get(j).run();}return new c.Do.Prevent();}},_uiSetVisible:function(u){var t=this.get(o),v=t.getClassName(n);t.get(p).toggleClass(v,!u);},_bindAnimShow:function(){this.get(d).on(m,c.bind(function(){this._uiSetVisible(true);},this));},_bindAnimHide:function(){this.get(j).after(f,c.bind(function(){this._uiSetVisible(false);},this));}});c.namespace("Plugin").WidgetAnim=e;},"@VERSION@",{requires:["plugin","anim-base","widget"]});
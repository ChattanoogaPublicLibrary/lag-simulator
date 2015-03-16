# Lag Simulator

Show how internet lag affects performance. Based of off [Living With Lag](http://livingwithlag.com/) experiments with Oculus Rift and Raspberry Pi.

This demo uses WebGL and the rear-camera of your phone. It's meant for use with [Google Cardboard](http://www.google.com/get/cardboard/). With Google Cardboard, you **do not** need a build of Firefox or Chrome that supports WebVR.

It probably works with Oculus Rift, but you will need to find a way to put a camera/computer on your head. With Oculus Rift, you probably need a browser with WebVR support.

Uses [WebVR Boilerplate](https://github.com/borismus/webvr-boilerplate) for base template.


## Issues

* Assumes that last camera detected is the rear camera.
* Camera zoom is set a little bit too far in.
* Needs a way to adjust lag.

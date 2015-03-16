var DISTANCE = 250;
var ASPECT_WIDTH = 4;
var ASPECT_HEIGHT = 3;

function calculateFOV(dist, width, aspect){
  return 2 * Math.atan((width / aspect) / (2 * dist)) * (180 / Math.PI);
}

function getAspectRatio() {
  return window.innerWidth / window.innerHeight;
}

function getBestResolution() {
  var bestWidth = 0;
  for (var i = window.innerWidth; i >= 0; i--) {
    if (i % ASPECT_WIDTH === 0) {
      bestWidth = i;
      break;
    }
  }

  return {width: bestWidth, height: Math.floor(bestWidth / (ASPECT_WIDTH / ASPECT_HEIGHT))};
}

function getAdjustedAspect() {
  var res = getBestResolution();
  return res.width / res.height;
}

function randomBoolean() {
  return _.shuffle([false, false, false, false, false, false, false, false, false, true])[0];
}

var adjustedAspect = getAdjustedAspect();
var bestRes = getBestResolution();

var video = document.createElement('video');
video.id = 'screen';
video.width  = bestRes.width;
video.height = bestRes.height;
video.autoplay = true

MediaStreamTrack.getSources(function(sourceInf) {
  var videos = [];

  for (var i = 0; i != sourceInf.length; i++) {
    var sourceInfo = sourceInf[i];
    if (sourceInfo.kind === 'video') {
      videos.push(sourceInfo.id);
    } else {
      console.log('Something went wrong: ', sourceInfo);
    }
  }

  var lastVideo = videos.slice(-1)[0];

  selectSource(lastVideo);
});

function selectSource(vidsource) {
  var constraints = {
    video: {
      optional: [{sourceId: vidsource}]
    }
  };


  navigator.webkitGetUserMedia(constraints, function(stream){
    video.src = URL.createObjectURL(stream);
  }, function(error){
    console.log("Failed to get a stream due to", error);
  });
}


var videoTexture = new THREE.Texture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
var vidmaterial = new THREE.MeshBasicMaterial({map: videoTexture, overdraw: true});

//Setup three.js WebGL renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });

// Append the canvas element created by the renderer to document body element.
document.body.appendChild(renderer.domElement);

// Create a three.js scene
var scene = new THREE.Scene();

// Create a three.js camera
var camera = new THREE.PerspectiveCamera(calculateFOV(DISTANCE, window.innerWidth, getAspectRatio()), getAspectRatio(), 1, 100000);

// Apply VR stereo rendering to renderer
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

// Create a VR manager helper to enter and exit VR mode.
var vrmgr = new WebVRManager(effect);

// Create 3d objects
var vidgeom = new THREE.PlaneGeometry(bestRes.width, bestRes.height);
var plane = new THREE.Mesh(vidgeom, vidmaterial);

// Position plane mesh
plane.position.z = -DISTANCE;
plane.rotation.x = Math.PI * 2;

// Add screen mesh to your three.js scene
scene.add(plane);

// Request animation frame loop function
function animate() {
  if(video.readyState === video.HAVE_ENOUGH_DATA){
    if (randomBoolean()) {
      videoTexture.needsUpdate = true;
    }
  }

  // Render the scene through the VREffect, but only if it's in VR mode.
  if (vrmgr.isVRMode()) {
    effect.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }

  requestAnimationFrame( animate );
}

// Kick off animation loop
animate();

// Handle window resizes
function onWindowResize() {
  var br = getBestResolution();
  var asp = getAspectRatio();
  plane.width = br.width;
  plane.height = br.height;
  video.width = br.width;
  video.height = br.height;
  camera.aspect = asp;
  camera.fov = calculateFOV(DISTANCE, br.width, asp);
  camera.updateProjectionMatrix();

  effect.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('resize', onWindowResize, false);

var vgaButton = document.querySelector('button#vga');
var qvgaButton = document.querySelector('button#qvga');
var hdButton = document.querySelector('button#hd');
var video = document.querySelector('video');

navigator.getUserMedia = navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia;

function successCallback(stream){
    window.stream = stream;
    video.src = window.URL.createObjectURL(stream);
}

function errorCallback(err){
    alert("Có lỗi xảy ra");
    console.log('navigator.getUserMedia error: ', err);
}

function displayVideoDimensions(){
    dimensions.textContent ='Kích thước của video: ' + video.videoWidth + 'x' + video.videoHeight + 'px';
}

video.addEventListener('play',function(){
    setTimeout(function() {
        displayVideoDimensions();
    }, 500);
})

var qvgaConstraints = {
    video: {
      mandatory: {
        maxWidth: 320,
        maxHeight: 180
      }
    }
  };
  var vgaConstraints = {
    video: {
      mandatory: {
        maxWidth: 640,
        maxHeight: 360
      }
    }
  };
  var hdConstraints = {
    video: {
      mandatory: {
        minWidth: 1280,
        minHeight: 720
      }
    }
  };

  function getMedia(constraints){
      if(window.stream){
          video.src = null;
          window.stream.getVideoTracks()[0].stop();
      }
      navigator.getUserMedia(constraints,successCallback,errorCallback);
  }

  qvgaButton.onclick = function(){
      getMedia(qvgaConstraints);
  }
  vgaButton.onclick = function(){
      getMedia(vgaConstraints);
  }
  hdButton.onclick = function(){
    getMedia(hdConstraints);
  }

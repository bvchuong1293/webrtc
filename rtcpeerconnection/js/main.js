var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var hangupButton = document.getElementById('hangupButton');

callButton.disabled = true;
hangupButton.disabled =true;

startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

var startTime;

var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');

localVideo.addEventListener('loadedmetadata',function(){
    trace('Local video videoWidth: ' + this.videoWidth + 'px, videoHeight: ' + this.videoHeight + 'px');
})

remoteVideo.addEventListener('loadedmetadata', function() {
    trace('Remote video videoWidth: ' + this.videoWidth +
      'px,  videoHeight: ' + this.videoHeight + 'px');
  });

  remoteVideo.onresize = function() {
    trace('Kích thước của remote thay đổi thành ' +
      remoteVideo.videoWidth + 'x' + remoteVideo.videoHeight);
    

    if (startTime) {
      var elapsedTime = window.performance.now() - startTime;
      trace('Thời gian cài đặt: ' + elapsedTime.toFixed(3) + 'ms');
      startTime = null;
    }
  };

  var localStream;
  var pc1;
  var pc2;
  var offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };

  function getName(pc){
      return (pc===pc1)?'pc1':'pc2';
  }

  function getOrtherPc(pc){
      return (pc==pc1)?pc2: pc1;
  }

  function gotStream(stream){
      trace('Đã nhận luồng local');
      localVideo.srcObject = streaml;
      callButton.disabled = false;
  }

  function start(){
      trace('Yêu cầu luồng local');
      startButton.disabled = true;
      navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true
      }).then(gotStream)
      .catch(function(e){
          alert('getUserMedia() lỗi: ' + e.name);
      });
  }

  function call(){
      callButton.disabled = true;
      hangupButton.disabled = false;
      strace('Bắt đầu cuộc gọi');
      startTime = window.performance.now();

      var videoTracks = localStream.getVideoTracks();
      var audioTracks = localStream.getAudioTracks();
      if(videoTracks.length>0){
          trace('Sử dụng thiết bị video: ' + videoTracks[0].label);
      }

      if (audioTracks.length > 0) {
        trace('Sử dụng thiết bị âm thanh: ' + audioTracks[0].label);
      }

      var servers = null;
      pc1 = new RTCPeerConnection(servers);
      trace('Khởi tạo 1 đối tượng kết nối pc1');
      pc1.onicecandidate = function(e){
          onicecandidate(pc1,e);
      }

      pc2 = new RTCPeerConnection(servers);
      trace('Khởi tạo 1 đối tượng kết nối pc2');
      pc2.onicecandidate = function(e){
          onicecandidate(pc2,e);
      }

      pc1.oniceconnectionstatechange = function(e) {
        onIceStateChange(pc1, e);
      };

      pc2.oniceconnectionstatechange = function(e) {
        onIceStateChange(pc2, e);
      };

      pc2.onaddstream = gotRemoteStream;

      pc1.addStream(localStream);
      trace('Đã thêm 1 luồng local pc1');

      trace('pc1 bắt đầu tạo createOffer ');
      pc1.createOffer(
          offerOptions
      ).then(
          onCreateOfferSuccess,
          onCreateSessionDescriptionError
      );

      function onCreateSessionDescriptionError(error) {
        trace('Không thể khởi tạo session: ' + error.toString());
      }

      function onCreateOfferSuccess(desc) {
        trace('Offer từ pc1\n' + desc.sdp);
        trace('pc1 bắt đầu setLocalDescription');
        pc1.setLocalDescription(desc).then(
          function() {
            onSetLocalSuccess(pc1);
          },
          onSetSessionDescriptionError
        );
        trace('pc2 setRemoteDescription start');
        pc2.setRemoteDescription(desc).then(
          function() {
            onSetRemoteSuccess(pc2);
          },
          onSetSessionDescriptionError
        );
        trace('pc2 bắt đầu createAnswer');
        // Bởi vì 'remote' không có dòng phương tiện mà chúng ta cần 
        // để vượt qua trong các ràng buộc phải để cho nó
        // chấp nhận cung cấp audio và video
        pc2.createAnswer().then(
          onCreateAnswerSuccess,
          onCreateSessionDescriptionError
        );
      }
    }

      function onSetLocalSuccess(pc) {
        trace(getName(pc) + ' setLocalDescription thành công');
      }
      
      function onSetRemoteSuccess(pc) {
        trace(getName(pc) + ' setRemoteDescription thành công');
      }

      function onSetSessionDescriptionError(error) {
        trace('Không thể thiết lập session description: ' + error.toString());
      }
      
      function gotRemoteStream(e) {
        remoteVideo.srcObject = e.stream;
        trace('pc2 nhận được luồng từ remote');
      }

      function onCreateOfferSuccess(desc) {
        trace('Offer from pc1\n' + desc.sdp);
        trace('pc1 setLocalDescription start');
        pc1.setLocalDescription(desc).then(
          function() {
            onSetLocalSuccess(pc1);
          },
          onSetSessionDescriptionError
        );
        trace('pc2 setRemoteDescription start');
        pc2.setRemoteDescription(desc).then(
          function() {
            onSetRemoteSuccess(pc2);
          },
          onSetSessionDescriptionError
        );
        trace('pc2 createAnswer start');
        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        pc2.createAnswer().then(
          onCreateAnswerSuccess,
          onCreateSessionDescriptionError
        );
      }

      function onSetLocalSuccess(pc) {
        trace(getName(pc) + ' setLocalDescription complete');
      }
      
      function onSetRemoteSuccess(pc) {
        trace(getName(pc) + ' setRemoteDescription complete');
      }
      
      function onSetSessionDescriptionError(error) {
        trace('Failed to set session description: ' + error.toString());
      }
      
      function gotRemoteStream(e) {
        remoteVideo.srcObject = e.stream;
        trace('pc2 received remote stream');
      }
      
      function onCreateAnswerSuccess(desc) {
        trace('Answer from pc2:\n' + desc.sdp);
        trace('pc2 setLocalDescription start');
        pc2.setLocalDescription(desc).then(
          function() {
            onSetLocalSuccess(pc2);
          },
          onSetSessionDescriptionError
        );
        trace('pc1 setRemoteDescription start');
        pc1.setRemoteDescription(desc).then(
          function() {
            onSetRemoteSuccess(pc1);
          },
          onSetSessionDescriptionError
        );
      }
      
      function onIceCandidate(pc, event) {
        getOtherPc(pc).addIceCandidate(event.candidate)
          .then(
            function() {
              onAddIceCandidateSuccess(pc);
            },
            function(err) {
              onAddIceCandidateError(pc, err);
            }
          );
        trace(getName(pc) + ' ICE candidate: \n' + (event.candidate ?
          event.candidate.candidate : '(null)'));
      }
      
      function onAddIceCandidateSuccess(pc) {
        trace(getName(pc) + ' addIceCandidate success');
      }
      
      function onAddIceCandidateError(pc, error) {
        trace(getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
      }
      
      function onIceStateChange(pc, event) {
        if (pc) {
          trace(getName(pc) + ' ICE state: ' + pc.iceConnectionState);
          console.log('ICE state change event: ', event);
        }
      }
      
      function hangup() {
        trace('Ending call');
        pc1.close();
        pc2.close();
        pc1 = null;
        pc2 = null;
        hangupButton.disabled = true;
        callButton.disabled = false;
      }
      
      // logging utility
      function trace(arg) {
        var now = (window.performance.now() / 1000).toFixed(3);
        console.log(now + ': ', arg);
      }
      


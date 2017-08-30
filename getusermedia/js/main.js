var contraints = {
    video: true
};

var video = document.querySelector('video');

function handleSuccess(stream){
    window.stream = stream;
    video.src = window.URL.createObjectURL(stream);
}

function handleError(error){
    alert("Có lỗi xảy ra");
    console.log('navigator.getUserMedia error: ',error);
}

navigator.mediaDevices.getUserMedia(contraints).then(handleSuccess).catch(handleError);
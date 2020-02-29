import { Delay, /* Distortion,  */Tremolo } from 'audio-effects';
import $ from 'blingblingjs';

// getUserMedia block - grab stream
// put it into a MediaStreamAudioSourceNode
const toggleButton = (e: MouseEvent) => {
    console.log(e);
}

$('.effect-box__button').on('click', toggleButton);
const getUserMedia = () => {
    if (navigator.mediaDevices) {
        console.log('getUserMedia supported.');
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                // Create a MediaStreamAudioSourceNode
                // Feed the HTMLMediaElement into it
                const audioCtx = new AudioContext();
                const source = audioCtx.createMediaStreamSource(stream);
                const tremolo = new Tremolo(audioCtx);
                tremolo.speed = 1; // Set the speed to 1Hz
                // connect the AudioBufferSourceNode to the gainNode
                // and the gainNode to the destination, so we can play the
                // music and adjust the volume using the mouse cursor
                /* const distortion = new Distortion(audioCtx);
                distortion.intensity = 200; // Set the intensity to 200
                distortion.gain = 100; // Set the gain to 100
                distortion.lowPassFilter = false; // Enable the lowpass filter */

                const delay = new Delay(audioCtx);
                delay.wet = .5; // Set the wetness to 100%
                delay.speed = 1; // Set the speed to 1 second
                delay.duration = 0.4; // Set the delay duration to 40%
                source.connect(delay.node);
                delay.node.connect(tremolo.node);
                tremolo.connect(audioCtx.destination);
                /* distortion.connect(audioCtx.destination); */
            })
            .catch(function (err) {
                console.log('The following gUM error occured: ' + err);
            });
    } else {
        console.log('getUserMedia not supported on your browser!');
    }

}



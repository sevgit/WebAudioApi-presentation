import {Delay, Distortion, Tremolo} from 'audio-effects';
import Mixer, { IEffects, Effects } from './Mixer';
import $ from 'jquery';
// getUserMedia block - grab stream
// put it into a MediaStreamAudioSourceNode
const toggleButton = (e: MouseEvent) => {
    console.log(e);
}

const mixer = new Mixer();


$('#mixer-play-button').click(() => mixer.playSound());

$('#distortion-button, #tremolo-button, #reverb-button').click(e => {
 let effect: keyof IEffects;

 switch(e.target.id) {
    case 'distortion-button':
         effect = Effects.Distortion;
         break;
    case 'tremolo-button':
        effect = Effects.Tremolo;
        break;
    case 'reverb-button': 
        effect =  Effects.Reverb;
        break;
 }

    if ($(e.target).hasClass('active')) {
        mixer.turnEffectOff(effect);
        e.target.innerHTML = 'Turn on';
    } else {
        mixer.turnEffectOn(effect);
        e.target.innerHTML = 'Turn off';
    }
    
    $(e.target).toggleClass('active');
});

$('#distortion-gain').change(e => mixer.distortion.effect.intensity = (e.target as HTMLInputElement).value)
$('#tremolo-speed').change(e => mixer.tremolo.effect.speed = (e.target as HTMLInputElement).value)

const getUserMedia = () => {

if (navigator.mediaDevices) {
    console.log('getUserMedia supported.');
    navigator.mediaDevices.getUserMedia ({audio: true})
    .then(function(stream) {
        // Create a MediaStreamAudioSourceNode
        // Feed the HTMLMediaElement into it
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const tremolo = new Tremolo(audioCtx);
      tremolo.speed = 10; // Set the speed to 1Hz
        // connect the AudioBufferSourceNode to the gainNode
        // and the gainNode to the destination, so we can play the
        // music and adjust the volume using the mouse cursor
        const distortion = new Distortion(audioCtx);
        distortion.intensity = 200; // Set the intensity to 200
        distortion.gain = 100; // Set the gain to 100
        distortion.lowPassFilter = true; // Enable the lowpass filter

        const delay = new Delay(audioCtx);
        delay.wet = .5; // Set the wetness to 100%
        delay.speed = .4; // Set the speed to 1 second
        delay.duration = 0.2; // Set the delay duration to 40%
        source.connect(distortion.node);
        distortion.connect(delay.node);
       /*  delay.connect(audioCtx.destination); */
        tremolo.connect(audioCtx.destination);
        distortion.connect(audioCtx.destination);
    })
    .catch(function(err) {
        console.log('The following gUM error occured: ' + err);
    });
} else {
   console.log('getUserMedia not supported on your browser!');
}
}

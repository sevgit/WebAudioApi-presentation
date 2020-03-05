import Mixer, { IEffects, Effects } from './Mixer';
import $ from 'jquery';

const mixer = new Mixer(document.getElementById('background-canvas') as HTMLCanvasElement);

$('#mixer-play-button').click(() => mixer.playSound());
$('#mixer-request-user-media-button').click(() => mixer.getUserMediaAndPlayIt());
$('#distortion-button, #tremolo-button, #reverb-button').click(e => {
    let effect: keyof IEffects;

    switch (e.target.id) {
        case 'distortion-button':
            effect = Effects.Distortion;
            break;
        case 'tremolo-button':
            effect = Effects.Tremolo;
            break;
        case 'reverb-button':
            effect = Effects.Reverb;
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

$('#distortion-gain').change(e => mixer.distortion.effect.intensity = (e.target as HTMLInputElement).value);
$('#tremolo-speed').change(e => mixer.tremolo.effect.speed = (e.target as HTMLInputElement).value);
$('#reverb-mix').change(e => mixer.reverb.effect.node.mix((e.target as HTMLInputElement).value));
$('#reverb-decay').change(e => mixer.reverb.effect.node.decay((e.target as HTMLInputElement).value));

import { Reverb, Distortion, Tremolo } from 'audio-effects';

export enum Effects {
    Distortion = 'distortion',
    Tremolo = 'tremolo',
    Reverb = 'reverb'
}

export interface IEffect {
    status: boolean;
    effect: any;
}

export interface IEffects {
    distortion: IEffect;
    tremolo: IEffect;
    reverb: IEffect;
}

export default class Mixer implements IEffects{
    // AudioContext
    public audioContext = new AudioContext();
    public MP3Buffer: AudioBuffer;
    public sourceNode: AudioBufferSourceNode;
    public isReady = false;

    // Effects
    public distortion = { status: false, effect: new Distortion(this.audioContext) };
    public tremolo = { status: false, effect: new Tremolo(this.audioContext) };
    public reverb = { status: false, effect: new Reverb(this.audioContext) };

    constructor() {
        console.log(this.reverb.effect)

          fetch('./src/ir-files/baptist-church-nashville.wav')
        .then(response => response.arrayBuffer())
        .then(audioBuffer => this.reverb.effect.buffer = audioBuffer);
        this.reverb.effect.wet = 0.5;
        this.reverb.effect.level = 1;
    }

    public turnEffectOn = (effect: keyof IEffects) => {
        this[effect].status = true;
        this.updateSignalChain();
    };

    public turnEffectOff = (effect: keyof IEffects) => {
        this[effect].status = false;
        this.updateSignalChain();
    }

    private updateSignalChain = () => {
        this.disconnectAllNodes();
        const effects = [ this.distortion, this.tremolo, this.reverb]
        let lastEffect: IEffect;
        effects.map((node, index) => {
            console.log(node)
            if (node.status && lastEffect) {
                lastEffect.effect.node.connect(node.effect.node);
                lastEffect = node;
            } else if (node.status) {
                this.sourceNode.connect(node.effect.node);
                lastEffect = node;
            }
        });

        if (lastEffect) {
            lastEffect.effect.node.connect(this.audioContext.destination);
        } else {
            this.sourceNode.connect(this.audioContext.destination);
        }
    }

    public playSound = async () => {
        if (!this.isReady) {
            await this.loadMP3File();
        }
        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = this.MP3Buffer;

        this.sourceNode.connect(this.audioContext.destination);
        this.sourceNode.start();
    }

    private loadMP3File = () => fetch('./sample.mp3')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => this.MP3Buffer = audioBuffer);

    private disconnectAllNodes = () => {
        this.sourceNode.disconnect();
        this.distortion.effect.node.disconnect();
        this.tremolo.effect.node.disconnect();
        this.reverb.effect.node.disconnect();
    }
}
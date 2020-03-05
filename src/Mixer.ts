import { Distortion, Tremolo } from 'audio-effects';
import * as Reverb from '@logue/reverb';

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

export default class Mixer implements IEffects {
    // AudioContext
    public audioContext = new AudioContext();
    public MP3Buffer: AudioBuffer;
    public sourceNode: AudioBufferSourceNode | MediaStreamAudioSourceNode;
    public isReady = false;
    public analyser: AnalyserNode;
    public canvas: HTMLCanvasElement;
    // Effects
    public distortion: IEffect = { status: false, effect: new Distortion(this.audioContext) };
    public tremolo: IEffect = { status: false, effect: new Tremolo(this.audioContext) };
    public reverb: IEffect = {
        status: false, effect: {
            node: new Reverb.default(this.audioContext, {
                decay: 5,                 // Amount of IR (Inpulse Response) decay. 0~100
                delay: 0,                 // Delay time o IR. (NOT delay effect) 0~100 [sec] 
                filterFreq: 2200,         // Filter frequency. 20~5000 [Hz]
                filterQ: 1,               // Filter quality. 0~10
                filterType: 'lowpass',    // Filter type. 'bandpass' etc. See https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/type .
                mix: 0.5,                 // Dry (Original Sound) and Wet (Effected sound) raito. 0~1
                reverse: false,           // Reverse IR.
                time: 25                   // Time length of IR. 0~50 [sec]
            })
        }
    };

    constructor(canvas?: HTMLCanvasElement) {
        if (canvas) {
            this.canvas = canvas;
            this.analyser = this.audioContext.createAnalyser();

            // Paint canvas
            this.fillCanvasBackground();
        }
    }

    public turnEffectOn = (effect: keyof IEffects) => {
        this[effect].status = true;
        this.updateSignalChain();
    };

    public turnEffectOff = (effect: keyof IEffects) => {
        this[effect].status = false;
        this.updateSignalChain();
    }

    public analyzerFn = () => {
        window.requestAnimationFrame(this.analyzerFn);
        const fbc_array = new Uint8Array(this.analyser.frequencyBinCount);
        const ctx = this.canvas.getContext('2d');
        this.analyser.getByteFrequencyData(fbc_array);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear the canvas
        this.fillCanvasBackground();
        ctx.fillStyle = '#d91e26'; // Color of the bars
        const bars = 100;
        for (var i = 0; i < bars; i++) {
            const bar_x = i * 3;
            const bar_width = 2;
            const bar_height = -(fbc_array[i] / 2);
            ctx.fillRect(bar_x, this.canvas.height, bar_width, bar_height);
        }
    }

    public getUserMediaAndPlayIt = () => {
        this.audioContext.resume();
        if (navigator.mediaDevices) {
            console.log('getUserMedia supported.');
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    // Create a MediaStreamAudioSourceNode
                    this.sourceNode = this.audioContext.createMediaStreamSource(stream)
                    this.updateSignalChain();
                    console.log('con')
                })
                .catch(function (err) {
                    console.log('The following gUM error occured: ' + err);
                });
        } else {
            console.log('getUserMedia not supported on your browser!');
        }
    }

    public playSound = async () => {
        if (!this.isReady) {
            await this.loadMP3File();
        }

        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = this.MP3Buffer;

        this.updateSignalChain();
        this.sourceNode.start();
    }

    private fillCanvasBackground = () => {
        const ctx = this.canvas.getContext('2d');
        this.canvas.getContext('2d').fillStyle = "#0b0b0b";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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

    private updateSignalChain = () => {
        this.disconnectAllNodes();
        const effects = [this.distortion, this.tremolo]
        let lastEffect: IEffect;
        effects.map(node => {
            if (node.status && lastEffect) {
                lastEffect.effect.node.connect(node.effect.node);
                lastEffect = node;
            } else if (node.status) {
                console.log(node)
                this.sourceNode.connect(node.effect.node);
                lastEffect = node;
            }
        });

        if (lastEffect) {
            if (this.reverb.status) {
                this.reverb.effect.node.connect(lastEffect.effect.node).connect(this.audioContext.destination);
            } else {
                lastEffect.effect.node.connect(this.audioContext.destination);
            }

            lastEffect.effect.node.connect(this.analyser);
        } else {
            this.sourceNode.connect(this.audioContext.destination);
            this.sourceNode.connect(this.analyser);

            if (this.reverb.status) {
                this.reverb.effect.node.connect(this.sourceNode).connect(this.audioContext.destination);
            }
        }

        if (this.analyser) {
            this.analyzerFn();
        }
    }
}

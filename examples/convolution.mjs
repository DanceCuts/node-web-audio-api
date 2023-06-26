import path from 'node:path';
import { AudioContext, ConvolverNode, load } from '../index.mjs';

// create an `AudioContext` and load a sound file
const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

// let cap = audioContext.render_capacity();
// cap.onupdate(|e| println!("{:?}", e));
// cap.start(AudioRenderCapacityOptions {
//     update_interval: 1.,
// });

const file = load(path.join(process.cwd(), 'samples', 'vocals-dry.wav'));
const audio_buffer = await audioContext.decodeAudioData(file);

const impulse_file1 = load(path.join(process.cwd(), 'samples', 'small-room-response.wav'));
const impulse_buffer1 = await audioContext.decodeAudioData(impulse_file1);

const impulse_file2 = load(path.join(process.cwd(), 'samples', 'parking-garage-response.wav'));
const impulse_buffer2 = await audioContext.decodeAudioData(impulse_file2);

const src = audioContext.createBufferSource();
src.buffer = audio_buffer;

const convolve = new ConvolverNode(audioContext);

src.connect(convolve);
convolve.connect(audioContext.destination);

src.start();

console.log('Dry');
await new Promise(resolve => setTimeout(resolve, 4000));

console.log('Small room');
convolve.buffer = impulse_buffer1;
await new Promise(resolve => setTimeout(resolve, 4000));

console.log('Parking garage');
convolve.buffer = impulse_buffer2;
await new Promise(resolve => setTimeout(resolve, 5000));

console.log('Stop input - flush out remaining impulse response');
src.stop();
await new Promise(resolve => setTimeout(resolve, 2000));

audioContext.close();


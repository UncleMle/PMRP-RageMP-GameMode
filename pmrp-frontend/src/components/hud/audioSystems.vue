<template>
<div>
    <h1>Howler Audio Demonstration</h1>
</div>
</template>
<script src="/path/to/howler.js"></script>
<script>
/* eslint-disable */
import {Howl, Howler} from 'howler';
var sound = new Howl({
  src: ['sound.mp3']
});

sound.play();

export default {
}
</script>

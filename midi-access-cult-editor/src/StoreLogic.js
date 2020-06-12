/* eslint-disable no-unused-vars */
import React from 'react';
import MidiPlayer from 'midi-player-js';
import Soundfont from 'soundfont-player';
import {Midi} from '@tonejs/midi';
import * as Store from './Store';

var ac = new AudioContext();
var Player;

export const loadMidiTrack = async (dispatch, midi) => {
    const midiUrl = `/midis/${midi.filename}`;
    const midiData = await Midi.fromUrl(midiUrl);
    dispatch({
        type: Store.LOAD_TRACK_FROM_MIDI,
        payload: {...midi, data: midiData}
    });
    /*
    const res = await fetch(midiUrl);
    const blob = await res.blob();

    const arrayBuffer = await new Response(blob).arrayBuffer();
    Soundfont.instrument(ac, 'clavinet', { soundfont: 'FluidR3_GM' }).then(instrument => {
        Player = Player || new MidiPlayer.Player(event => {
            if (event.name === 'Note on' && event.velocity > 0) {
                instrument.play(event.noteName, ac.currentTime, {gain:event.velocity/100});
            }
        });
        Player.stop();
        Player.loadArrayBuffer(arrayBuffer);
        Player.play();
    });
    */
}

export const fetchPromise = (route) =>
    fetch(route)
        .then(res => {
            if (!res.ok) {
                return Promise.reject();
            }
            return res.json();
        })
        .catch(error => console.error(error));

export const getNotesFromFirstTrack = (data) => {
    if (!data.tracks) {
        return [];
    }
    const scaleTicks = ticks => +(ticks / data.header.ppq / 4).toFixed(3);
    return data.tracks[0].notes.map((note, index) => ({
        id: `note${index}`,
        pitch: note.midi,
        start: scaleTicks(note.ticks),
        duration: scaleTicks(note.durationTicks),
        vel: +note.velocity.toFixed(2),
        selected: index === 0,
        playing: false,
    }));
};

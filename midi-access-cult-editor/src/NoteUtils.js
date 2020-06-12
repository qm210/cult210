export const BASE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const NOTES = [];
for (let octave = -1; octave < 10; octave++) {
    BASE_NOTES.forEach(note => NOTES.push(`${note}${octave}`));
}

export const isBlack = note => note.includes('#');

import { create } from 'zustand'

export const useArchApp = create(() => {
  return {
    //
    cmd_begin: '',
    messages: [],
    status: ['pending', 'in-progress', 'completed'],
    todo: [] as any[],
    blocks: [] as any[],
    done: '',

    //
    getSeed: () => {
      return `${[`[${Math.random().toString(35).slice(2, 9)}]`, `${mindsetSlugs[Math.floor(Math.random() * mindsetSlugs.length)]}`].join('-')}`
    },
    seed: `${[`[${Math.random().toString(35).slice(2, 9)}]`, `${mindsetSlugs[Math.floor(Math.random() * mindsetSlugs.length)]}`].join('-')}`,
    // baseURL: `http://127.0.0.1:7777/v1`,
    baseURL: `http://127.0.0.1:1234/v1`,
    apiKey: `nono`,

    //
    // appModel: `Qwen3.5-4B-MLX-4bit`,
    appModel: `qwen/qwen3.5-4b`,

    appName: 'audio-youtube-downloader',

    // Tool should receive an "website url" input and take a full-page screenshot and write a website summary with the website text and screenshot
    appUserPrompt: `
Please download mp4 video from youtube link: 
https://www.youtube.com/watch?v=XVsf_2UMXwU
https://www.youtube.com/watch?v=yyXwaUQOzlg
and put it into a ouput folder for me and open the folder for me when all done.
`.trim(),

    // appModel: `qwen/qwen3.5-35b-a3b`,

    stream: '',
    thinking: '',
    terminalCalls: [],
    terminalWindow: ''
  }
})

export const mindsetSlugs = [
  'i-can-do-all-things-philippians-4-13',
  'no-spirit-of-fear-2-timothy-1-7',
  'the-lord-is-my-light-psalm-27-1',
  'fearfully-and-wonderfully-made-psalm-139-14',
  'greater-is-he-in-me-1-john-4-4',
  'with-god-all-things-possible-matthew-19-26',
  'joy-of-the-lord-is-my-strength-nehemiah-8-10',
  'more-than-a-conqueror-romans-8-37',
  'mercies-new-every-morning-lamentations-3-22-23',
  'walk-by-faith-not-by-sight-2-corinthians-5-7',
  'be-strong-and-courageous-joshua-1-9',
  'peace-i-give-to-you-john-14-27',
  'trust-in-the-lord-proverbs-3-5',
  'new-creation-in-christ-2-corinthians-5-17',
  'the-lord-will-perfect-psalm-138-8',
  'cast-your-anxiety-on-him-1-peter-5-7',
  'nothing-too-hard-for-the-lord-jeremiah-32-17',
  'i-will-not-be-shaken-psalm-16-8',
  'god-works-for-my-good-romans-8-28',
  'have-the-mind-of-christ-1-corinthians-2-16',
  'god-is-my-refuge-psalm-46-1',
  'my-grace-is-sufficient-2-corinthians-12-9',
  'the-lord-is-my-shepherd-psalm-23-1',
  'chosen-holy-and-loved-colossians-3-12',
  'lamp-to-my-feet-psalm-119-105',
  'he-restores-my-soul-psalm-23-3',
  'secret-place-of-the-most-high-psalm-91-1',
  'be-still-and-know-psalm-46-10',
  'the-lord-will-fight-for-me-exodus-14-14',
  'kind-words-like-honey-proverbs-16-24',
  'hope-and-a-future-jeremiah-29-11',
  'righteousness-of-god-in-christ-2-corinthians-5-21',
  'peace-of-christ-rule-heart-colossians-3-15',
  'bless-the-lord-at-all-times-psalm-34-1',
  'faith-can-move-mountains-matthew-17-20',
  'loved-with-everlasting-love-jeremiah-31-3',
  'keep-me-in-perfect-peace-isaiah-26-3',
  'think-on-these-things-philippians-4-8',
  'i-am-a-child-of-god-john-1-12',
  'my-help-comes-from-the-lord-psalm-121-2',
  'give-thanks-he-is-good-psalm-107-1',
  'my-rock-and-fortress-psalm-18-2',
  'ask-and-it-will-be-given-matthew-7-7',
  'in-all-things-give-thanks-1-thessalonians-5-18',
  'god-provides-all-needs-philippians-4-19',
  'faithful-to-all-promises-psalm-145-13',
  'sing-of-lords-love-forever-psalm-89-1',
  'light-shines-in-darkness-john-1-5',
  'your-faith-has-healed-you-mark-5-34',
  'love-never-fails-1-corinthians-13-8',
  'the-lord-on-my-side-psalm-118-6',
  'power-to-the-weak-isaiah-40-29',
  'hidden-with-christ-in-god-colossians-3-3',
  'let-your-light-shine-matthew-5-16',
  'god-is-love-1-john-4-8',
  'wait-for-the-lord-psalm-27-14',
  'the-lord-is-my-helper-hebrews-13-6',
  'i-am-gods-masterpiece-ephesians-2-10',
  'stand-firm-in-faith-1-corinthians-16-13',
  'hope-does-not-shame-romans-5-5',
  'god-is-for-me-romans-8-31',
  'praise-for-wonderfully-made-psalm-139-14',
  'peace-be-with-you-john-20-19',
  'fruit-of-the-spirit-galatians-5-22',
  'count-it-all-joy-james-1-2',
  'beside-quiet-waters-psalm-23-2',
  'gracious-and-compassionate-psalm-145-8',
  'heart-trusts-and-helped-psalm-28-7',
  'guard-your-heart-proverbs-4-23',
  'your-word-is-truth-john-17-17',
  'the-lord-sustains-me-psalm-3-5',
  'seek-first-the-kingdom-matthew-6-33',
  'joyful-in-hope-romans-12-12',
  'strength-and-my-shield-psalm-28-7',
  'truth-will-set-you-free-john-8-32',
  'heals-the-brokenhearted-psalm-147-3',
  'strength-and-dignity-proverbs-31-25',
  'rest-god-in-control-psalm-4-8',
  'let-heart-take-courage-psalm-31-24',
  'light-of-the-world-matthew-5-14',
  'lord-will-guide-always-isaiah-58-11',
  'steadfast-love-endures-psalm-136-1',
  'commit-way-to-lord-psalm-37-5',
  'favor-in-eyes-of-lord-genesis-6-8',
  'our-refuge-and-strength-psalm-46-1',
  'fix-eyes-on-jesus-hebrews-12-2',
  'by-his-wounds-healed-isaiah-53-5',
  'hope-in-the-lord-psalm-130-7',
  'near-to-all-who-call-psalm-145-18',
  'mercy-endures-2-chronicles-20-21',
  'complete-in-christ-colossians-2-10',
  'taste-see-lord-is-good-psalm-34-8',
  'beauty-for-ashes-isaiah-61-3',
  'blessed-are-peacemakers-matthew-5-9',
  'soul-finds-rest-psalm-62-1',
  'rejoice-in-the-lord-philippians-4-4',
  'not-afraid-of-bad-news-psalm-112-7',
  'immeasurably-more-ephesians-3-20',
  'strength-and-my-song-exodus-15-2',
  'name-lord-strong-tower-proverbs-18-10'
]

// appUserPrompt: `
// I want to build an inspiration tool.

// For home page "/":
//   - I can view featured inspirations

// For app page "/inspire":
//   - I can enter a website URL to the inspiration entry box to "save inspiration".
//   - When I click "save inspiration" button, we spin up a browser to take a fullpage screenshot, make a thumbnail and collect some essential text from the webpage. and then it will send to AI to generate inspirational notes. I want to use lmstudio and "uses qwen/qwen3.5-4b" AI model

// For each inspiration post page "/inspire/[id]":
// i can view inspiration items in the grid below the entry box.
// - There's a thumbnail header
// - Website name
// - Textual Analysis
// `.trim(),

//     appUserPrompt: `
// The tool should be able to receive input of a website url,
// then the tool can spin up a browser to take a fullpage screenshot,
// make a thumbnail and collect some essential text from the webpage.
// and then it will send to AI to generate inspirational notes.
// Use lmstudio and pick "qwen/qwen3.5-4b" AI model as default AI
//     `.trim(),

// export type Reward = 'insult' | 'cheer' | 'smau'
// export type FreeSound = '!cheese' | '!sheesh' | '!yerr' | '!angel'

const VLC_PATH = 'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe'
const VLC_AUDIO_OUT = 'CABLE Input (VB-Audio Virtual C ($1,$64)'
const SOUNDS_DIR = 'C:\\Coding\\projects\\soundboard\\sounds\\'
const CHANNEL_NAME = 'squishydough'

const REWARDS = {
  insult: '8288e094-4fdc-4bf5-a177-178fa27ca137',
  cheer: '1bc17c01-802b-488b-8d26-da42ad23fc5e',
  smau: '4c288387-66a0-4b26-b5f4-845c2084d1de',
  hello: '01216987-2fa6-404f-81d5-3f1ec09a2b15',
  bye: 'f89290d1-4dea-430f-a21a-e16bd7ee6b5c',
}

const FREE_SOUNDS = {
  '!angel': `yeah that's what you get [i killed].mp3`,
  '!cheese': 'please please please please please stop [beg, stop].mp3',
  '!sheesh': 'sheeeeeesh [good wow, bad wow, moon].mp3',
  '!yerr': 'yerrrr [moon, random, yes, encourage].mp3',
  '!cringe': `that's so cringe [moon, sad].mp3`,
  '!potg': 'potg potg potg [moon, cheer, boast, taunt].mp3',
  '!moon': `i'm not going to be a fake and a fraud [moon, bravery].mp3`,
}

export default {
  VLC_PATH,
  VLC_AUDIO_OUT,
  SOUNDS_DIR,
  REWARDS,
  FREE_SOUNDS,
  CHANNEL_NAME,
}

export type Reward = keyof typeof REWARDS
export type FreeSound = keyof typeof FREE_SOUNDS

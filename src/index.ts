import tmi from 'tmi.js'
import childProcess from 'child_process'
import config from './config'
import { FreeSound, Reward } from './types'
import fs from 'fs'

const soundList = buildSoundList()

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: [config.CHANNEL_NAME],
})

client.connect()

client.on('message', (channel, userState, message, self) => {
  // Check FREE_SOUNDS first to see if the command is recognized
  const freeSoundKeys = Object.keys(config.FREE_SOUNDS) as FreeSound[]
  const freeSoundKey: FreeSound | undefined = freeSoundKeys.find(
    (soundKey) => message.indexOf(soundKey) > -1
  )

  if (freeSoundKey !== undefined) {
    playSound(config.FREE_SOUNDS[freeSoundKey])
    return
  }

  // if no custom-reward-id, ignore this message
  if (!userState['custom-reward-id']) {
    return
  }
  const customRewardId = userState['custom-reward-id']
  // console.info(`Reward ID ${customRewardId} triggered.`)
  const rewardKeys = Object.keys(config.REWARDS) as Reward[]
  const reward: Reward | undefined = rewardKeys.find(
    (k) => config.REWARDS[k] === customRewardId
  )
  // if no reward found, exit
  if (!reward) {
    return
  }
  const categorySounds = soundList[reward]
  // Exit if no sounds found for this category
  if (!categorySounds) {
    return
  }
  const randomSoundIndex = randomNumber(0, categorySounds.length - 1)
  playSound(categorySounds[randomSoundIndex])
})

console.info('Listening to Twitch chat...')

function playSound(soundPath: string) {
  childProcess.spawn(config.VLC_PATH, [
    `--aout=waveout`,
    `--waveout-audio-device=${config.VLC_AUDIO_OUT}`,
    `--play-and-exit`,
    `--qt-start-minimized`,
    `--qt-system-tray`,
    `${config.SOUNDS_DIR}\\${soundPath}`,
  ])
}

function buildSoundList() {
  console.info('Building sound list.')
  const rewardCategories = Object.keys(config.REWARDS) as Reward[]
  const soundList: Partial<Record<Reward, string[]>> = {}

  // Loop through sound folder and find all files that match the categories in config.REWARDS
  fs.readdirSync(config.SOUNDS_DIR).forEach((file) => {
    // Grab the portion of the filename after the [ to search categories
    const fileSplit = file.split('[')
    if (!fileSplit[1]) {
      return
    }
    const fileCategories = fileSplit[1]
    // Go through each key in the config.REWARDS object and see if this sound qualifies
    rewardCategories.forEach((rewardCategory) => {
      if (fileCategories.indexOf(rewardCategory) > -1) {
        // Add the sound to the list
        soundList[rewardCategory] = soundList[rewardCategory] || []
        soundList[rewardCategory]?.push(file)
      }
    })
  })

  // Write to the sounds.json output file
  console.info('Finished building sound list.')
  return soundList
}

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

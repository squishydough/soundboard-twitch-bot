import childProcess from 'child_process'
import fs from 'fs'
import { randomNumber } from './utils'

interface ISoundLibrary {
  vlcPath: string
  vlcAudioOut: string
  soundsDir: string
  twitchChannel: string
  streamElementsRewards: Record<string, string | string[]>
  twitchChannelPointRewards: Record<string, string>
  allSounds: Record<string, string[]>
}

export class SoundLibrary {
  private vlcPath: ISoundLibrary['vlcPath'] = ''
  private vlcAudioOut: ISoundLibrary['vlcAudioOut'] = ''
  private soundsDir: ISoundLibrary['soundsDir'] = ''
  private allSounds: ISoundLibrary['allSounds'] = {}
  public twitchChannel: ISoundLibrary['twitchChannel'] = ''
  public streamElementsRewards: ISoundLibrary['streamElementsRewards'] = {}
  private twitchChannelPointRewards: ISoundLibrary['twitchChannelPointRewards'] =
    {}

  constructor({
    vlcPath,
    vlcAudioOut,
    soundsDir,
    twitchChannel,
    streamElementsRewards,
    twitchChannelPointRewards,
  }: Omit<ISoundLibrary, 'allSounds'>) {
    this.vlcPath = vlcPath
    this.vlcAudioOut = vlcAudioOut
    this.soundsDir = soundsDir
    this.twitchChannel = twitchChannel
    this.streamElementsRewards = streamElementsRewards
    this.twitchChannelPointRewards = twitchChannelPointRewards
    this.buildSoundLibrary()
  }

  /**
   * Loop through sounds directory and find all sounds with categories that match the
   * keys in:
   *    1. this.twitchChannelPointRewards;
   *    2. this.streamElementsRewards (where the value is '')
   */
  private buildSoundLibrary() {
    console.info('Building sound list.')
    const rewardCategories = Object.keys(this.twitchChannelPointRewards)
    const freeSoundCategories: string[] = Object.keys(
      this.streamElementsRewards
    ).map((freeSoundCategory) => {
      if (this.streamElementsRewards[freeSoundCategory] === '') {
        return freeSoundCategory.replace('!', '')
      }
      return ''
    })
    const sounds: ISoundLibrary['allSounds'] = {}

    // Loop through sound folder and find all files that match the categories in this.twitchChannelPointRewards
    fs.readdirSync(this.soundsDir).forEach((file) => {
      // Grab the portion of the filename after the [ to search categories
      const fileSplit = file.split('[')
      if (!fileSplit[1]) {
        return
      }
      const fileCategories = fileSplit[1]
      // Go through each key in the this.twitchChannelPointRewards object and see if
      // this sound qualifies
      rewardCategories.forEach((rewardCategory) => {
        if (fileCategories.indexOf(rewardCategory) > -1) {
          // Add the sound to the list
          sounds[rewardCategory] = sounds[rewardCategory] || []
          sounds[rewardCategory]?.push(file)
        }
      })
      // Add free sound categories to the list
      freeSoundCategories
        .filter((c) => c !== '')
        .forEach((freeCategory) => {
          if (fileCategories.indexOf(freeCategory) > -1) {
            // Add the sound to the list
            sounds[freeCategory] = sounds[freeCategory] || []
            sounds[freeCategory]?.push(file)
          }
        })
    })

    // Write to the sounds.json output file
    console.info('Finished building sound list.')
    this.allSounds = sounds
  }

  // Silently launches VLC, plays the sound, then closes the player
  private playSound(soundPath: string) {
    childProcess.spawn(this.vlcPath, [
      `--aout=waveout`,
      `--waveout-audio-device=${this.vlcAudioOut}`,
      `--play-and-exit`,
      `--qt-start-minimized`,
      `--qt-system-tray`,
      `${this.soundsDir}\\${soundPath}`,
    ])
  }

  // Plays a random sound from a specified category
  private playSoundFromCategory(category: string) {
    const categorySounds = this.getCategorySounds(category)
    const randomSoundIndex = randomNumber(0, categorySounds.length - 1)
    this.playSound(categorySounds[randomSoundIndex])
  }

  /**
   * Check this.streamElementsRewards to see if a matching command
   * is found. If so, play the sound and return true.
   * @returns Whether a sound was played
   */
  public playStreamElementsReward(message: string) {
    const streamElementRewardKeys = Object.keys(this.streamElementsRewards)
    const streamElementRewardKey = streamElementRewardKeys.find(
      (soundKey) => message.indexOf(soundKey) > -1
    )

    if (!streamElementRewardKey) {
      return false
    }

    const soundOrSounds = this.streamElementsRewards[streamElementRewardKey]
    if (typeof soundOrSounds === 'string' && soundOrSounds !== '') {
      this.playSound(soundOrSounds)
      return true
    } else if (Array.isArray(soundOrSounds)) {
      const streamElementsRewardsIndex = randomNumber(
        0,
        soundOrSounds.length - 1
      )
      this.playSound(soundOrSounds[streamElementsRewardsIndex])
      return true
    }
    return false
  }

  /**
   * Check this.twitchChannelPointRewards to see if a matching command
   * is found. If so, play a random song from the reward category.
   */
  public playTwitchChannelPointsReward(rewardId: string) {
    const rewardCategories = Object.keys(this.twitchChannelPointRewards)
    const matchingRewardCategory = rewardCategories.find(
      (k) => this.twitchChannelPointRewards[k] === rewardId
    )
    // if no reward found, exit
    if (!matchingRewardCategory) {
      return
    }
    this.playSoundFromCategory(matchingRewardCategory)
  }

  // Returns all sounds for a specified category
  public getCategorySounds(category: string) {
    const safeCategory = category.replace('!', '')
    return this.allSounds[safeCategory]
  }

  // Loads an entire sound category into a StreamElements command, as well as any aliases.
  public addSoundsFromCategory({
    command,
    category,
    aliases,
  }: {
    command: string
    category: string
    aliases?: string[]
  }) {
    this.streamElementsRewards[command] = this.getCategorySounds(category)

    if (!aliases) {
      return
    }

    aliases.map(
      (alias) =>
        (this.streamElementsRewards[alias] = this.getCategorySounds(category))
    )
  }
}

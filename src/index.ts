import tmi from 'tmi.js'
import { SoundLibrary } from './SoundLibrary'

/**
 * Initialize the sound library with your custom configuration here.
 *
 * This was designed to work with my soundboard library:
 * https://github.com/joshwaiam/soundboard
 *
 * Sounds are in a folder with the option to specify categories between brackets.
 * So for example, a file could be named:
 *    /some sound file [cat1, cat2].mp3
 * And the sound file would be added to the categories: cat1 and cat2.
 *
 * This script relies on sounds being formatted in the same way.
 */

/******************************* START CONFIGURATION ***************************************/

const soundLibrary = new SoundLibrary({
  // Path to your VLC executable
  vlcPath: 'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
  /**
   * The audio device to play the sound on
   *
   * If you are unsure of how to determine this, please
   * reference https://joshpayette.dev/posts/introducing-my-ultimate-soundboard,
   * in the section "Determine your vlc_audio_out" value
   */
  vlcAudioOut: 'CABLE Input (VB-Audio Virtual C ($1,$64)',
  // Path to your folder with sound effects
  soundsDir: 'C:\\Coding\\projects\\soundboard\\sounds\\',
  // Name of your Twitch channel
  twitchChannel: 'squishydough',
  /**
   * These correspond to Twitch channel point rewards.
   *    The key is the sound category you want to play a random sound from.
   *    The value is the Twitch channel reward id.
   *
   * Setup
   *    1.  Set up a reward in Twitch with any settings or name you'd like.
   *        The reward MUST require the user to enter text - that's the only way the
   *        message will have a channel id.
   *    2.  Once the reward is set up, start the bot and redeem the reward.
   *        The console will log the channel reward ID, which you can use below.
   */
  twitchChannelPointRewards: {
    insult: '8288e094-4fdc-4bf5-a177-178fa27ca137',
    cheer: '1bc17c01-802b-488b-8d26-da42ad23fc5e',
    smau: '4c288387-66a0-4b26-b5f4-845c2084d1de',
  },
  /**
   * These correspond to custom commands set up in StreamElements.
   * Each command can point to a single sound file or an array of sound files.
   * In the event you have an array of sound files, a random sound will be chosen.
   * In the event of an empty string, you can load sounds by category just below this config.
   *
   * Single file example:
   * !command = 'sound.mp3'
   *
   * Multiple file example:
   * !command = ['sound1.mp3', 'sound2.mp3']
   *
   */
  streamElementsRewards: {
    '!angel': `yeah that's what you get [i killed].mp3`,
    '!cheese': 'please please please please please stop [beg, stop].mp3',
    '!sheesh': 'sheeeeeesh [good wow, bad wow, moon].mp3',
    '!yerr': 'yerrrr [moon, random, yes, encourage].mp3',
    '!cringe': `that's so cringe [moon, sad].mp3`,
    '!potg': 'potg potg potg [moon, cheer, boast, taunt].mp3',
    '!moon': `i'm not going to be a fake and a fraud [moon, bravery].mp3`,
    /**
     * Initialize the following below the config, since the object must be constructed
     * before we can call the method to pick a random sound for these categories.
     */
    '!hello': '',
    '!bye': '',
  },
})

/**
 * For each streamElementsRewards that is set to an empty string,
 * you must populate sounds from a specific sound category.
 * If your command has aliases, add those to the optional `aliases` prop.
 */
soundLibrary.addSoundsFromCategory({
  command: '!hello',
  category: 'hello',
  aliases: ['!hi'],
})
soundLibrary.addSoundsFromCategory({
  command: '!bye',
  category: 'bye',
  aliases: ['!goodbye'],
})

/******************************* END CONFIGURATION ***************************************/

// Create the Twitch client
const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: [soundLibrary.twitchChannel],
})
client.connect()
console.info('Listening to Twitch chat...')

// Listen to messages in order to trigger sounds
client.on('message', (_channel, userState, message, _self) => {
  // Check if the message is one of the StreamElements free command sounds
  const streamElementsRewardPlayed =
    soundLibrary.playStreamElementsReward(message)
  if (streamElementsRewardPlayed) {
    return
  }

  // if no custom-reward-id, ignore this message
  if (!userState['custom-reward-id']) {
    return
  }
  const customRewardId = userState['custom-reward-id']
  console.info(`Channel reward id: ${customRewardId}`)

  // Check if the message is one of the Twitch channel points reward sounds
  soundLibrary.playTwitchChannelPointsReward(customRewardId)
})

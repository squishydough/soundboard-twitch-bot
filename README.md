# Squishy's Soundboard Twitch Bot

## What is this?

This is a Twitch bot that is a companion to [my soundboard project](https://github.com/joshwaiam/soundboard#naming-the-sounds).
You do not need to use the soundboard project to use this bot.  However, this bot works by default
with the file name conventions established in that project.

## Requirements

In order to run this script, you must have [NodeJS](https://nodejs.org/en/download/) installed.  Additionally, this script
utilizes [VLC Media Player](https://www.videolan.org/vlc/download-windows.html).

## How it works

This bot will monitor a specified Twitch channel's chat for specific commands from Twitch channel rewards and StreamElements rewards.
Then it will play a sound or random sound from a specified `/sounds` folder through an audio device of your choosing.

## Setting up audio cables

This is designed to work with virtual audio cables, where you can route your mic and soundboard through a single device
which can then be used on your stream.  Your setup doesn't have to be the exact same, as this script will
allow you to specify a device to play the sound on.  However, if you need more info on setting up virtual audio cables and a
mixer, [this article I wrote for my soundboard](https://joshpayette.dev/posts/introducing-my-ultimate-soundboard) is a good place to start.

## Setting up the bot

### Download this repository

If you are familiar with Github, you can simply clone this repository.  Otherwise, you can [download this zip file](https://github.com/joshwaiam/soundboard-twitch-bot/archive/refs/heads/main.zip) and 
extract to a folder on your computer.

### Install dependencies

Open up a terminal or command prompt and navigate to the folder where you extracted the repository.  Then run the following command:

`npm install`

## Configure the bot

Open `./src/index.ts` in order to configure the bot. The code is heavily commented to try and
make it easy to update. You can look for the lines `START CONFIGURATION` and `END CONFIGURATION` for guidance
on what you should be updating.

### Determine your `vlcAudioOut` value

1. Run VLC Media Player.

1. Go to **Tools -> Preferences**.

1. Click on the **Audio** tab.  **Click this tab first or else you won't get a list of sound devices!**

1. Under *Show settings* section at the bottom left of the window, choose **All**.

1. Under the *Audio* category on the left, expand **Output Modules** and select **WaveOut**.

1. Under the *Select Audio Device* dropdown box, look for your desired output device. You need to copy **EXACTLY** what it shows in the dropdown box. Write or type down exactly what is in here.

### Naming the sounds

Your file names should follow this structure: 

`file name [category1, category2].mp3.`  

The script will check each file name and take the comma-separated category names from with the `[]`
square brackets.  You can add as many categories as you want, allowing this file to be included
when you tell the bot to pick a random sound from a category.

### StreamElements Rewards

After adding a chat command to StreamElements, you can incorporate a behavior into the bot by 
adding the command to the `streamElementsRewards` option of the configuration.

Example:

`'!command_name': 'filename.mp3'`

You can link sounds to commands in three ways:

- **Single File**: `'!command_name': 'filename.mp3'`
- **Multiple Files**: `'!command_name': ['filename1.mp3', 'filename2.mp3']`
- **Random Sound From Category:** `'!command_name': ''`

### Random sound from category

In order to choose a random sound from a category, you use an empty string next to the command name.
Just below the main configuration, you will need to add the following for each command:

```typescript
soundLibrary.addSoundsFromCategory({
  command: '!hello',
  category: 'hello',
  aliases: ['!hi'],
})
```

### Twitch Channel Point Rewards

1. Add the Twitch Channel Point Reward, being sure to select **User Response Required.**  This is the only way 
the bot is able to determine if a Twitch Channel Point Reward was redeemed.
1. With the bot running (see the Testing the Bot section below), redeem the reward in your chat.  Look for 
**Channel reward id:** in your terminal or command prompt, and copy the ID.
1. In the configuration, update `twitchChannelPointsRewards` with a sound category and the ID.

Example, playing a random sound from the `insult` category:

`insult: YOUR_REWARD_ID_COPIED_FROM_TERMINAL`

## Testing the Bot

In your terminal or command prompt, navigate to the folder where you extracted the repository.  Then run the following command:

`npm run dev`

## Building and Using the Bot

Once you have tested the bot and everything looks good, you can build the bot and run it.  In your terminal or command prompt, navigate to the folder where you extracted the repository.  Then run the following command:

`npm run build`

This will create a `./dist` folder with the compiled bot.  You can then run the bot via your terminal or command prompt by navigating to the folder where you extracted the repository, then running the following command:

`node dist/index.js`

### Quickly Starting the Bot

Inlcuded in the root of this project is a file called `start.bat`.  Update the script to point to
your compiled bot.  Then you can run this bat file, or create a shortcut to it on your desktop, to quickly start the bot.

Example `start.bat`:

`START cmd /k "cd C:\Coding\projects\soundboard-twitch-bot\dist & node index.js"`

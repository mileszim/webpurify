# WebPurify API for Node.js #
[![npm version](https://badge.fury.io/js/webpurify.svg)](https://badge.fury.io/js/webpurify) [![Build Status](https://travis-ci.org/mileszim/webpurify.svg?branch=master)](https://travis-ci.org/mileszim/webpurify)

This module allows simple interaction with the WebPurify API within Node.js. For more information about WebPurify and the services it offers, check out http://webpurify.com/.

### Commands ###

##### Filters #####
* [check](#check)
* [checkCount](#checkcount)
* [replace](#replace)
* [return](#return)

##### Blacklist #####
* [addToBlacklist](#addtoblacklist)
* [removeFromBlacklist](#removefromblacklist)
* [getBlacklist](#getblacklist)

##### Whitelist #####
* [addToWhitelist](#addtowhitelist)
* [removeFromWhitelist](#removefromwhitelist)
* [getWhitelist](#getWhitelist)

##### Image Moderation #####
* [imgCheck](#imgcheck)
* [imgStatus](#imgstatus)
* [imgAccount](#imgaccount)
* [aimImgCheck](#aimimgcheck)
* [aimImgAccount](#aimimgaccount)
* [hybridImgCheck](#hybridimgcheck)

# Install & Initialize #

`npm install webpurify`

To initialize:

```js
// ES6
import WebPurify from 'webpurify';

// Otherwise
const WebPurify = require('webpurify');

const wp = new WebPurify({
    api_key: ENV['WEBPURIFY_API_KEY']
    //, endpoint:   'us'  // Optional, available choices: 'eu', 'ap'. Default: 'us'.
    //, enterprise: false // Optional, set to true if you are using the enterprise API, allows SSL
});
```

# Commands #

### check ###

Check a string of text for profanity. Returns true if profanity found, false if none.

```js
wp.check('some profane text')
.then(profanity => {
  if (profanity) {
    console.log('A bunch of sailors in here!');
  } else {
    console.log('This is a pure string');
  }
});
```

### checkCount ###

Check a string of text for profanity. Returns number of words if profanity found, 0 if none.

```js
wp.checkCount('some profane text')
.then(profanity => {
  if (profanity > 0) {
    console.log(profanity.toString() + ' sailors in here!');
  } else {
    console.log('This is a pure string');
  }
});
```

### replace ###
Check a string of text for profanity. Replaces any found profanity with a provided symbol, and returns the formatted string.

```js
wp.replace('some profane text', '*')
.then(purifiedText => {
  console.log(purifiedText);
});
```

### return ###
Check a string of text for profanity. If any found, returns an array of profane words. Else, returns empty array.

```js
wp.return('some profane text')
.then(profanity => {
  for (word in profanity) {
    console.log(profanity[word]);
  }
});
```


### Options ###
All filter commands can take an additional options object, just before the callback. The available options are:

```js
var optional = {
  lang:   'en', // the 2 letter language code for the text you are submitting
  semail: 1,    // treat email addresses like profanity
  sphone: 1,    // treat phone numbers like profanity
  slink:  1     // treat urls like profanity
};

wp.check('some profane text', optional)
.then(profanity => {
  console.log(profanity);
});
```

### addToBlacklist ###
Add a word to the blacklist.

```js
wp.addToBlacklist('my_word')
.then(success => {
  if (success) { console.log('success!'); }
});
```

Can also be called without callback:

```js
wp.addToBlacklist('my_word');
```

For Deep search, add optional parameter 1 after word:

```js
wp.addToBlacklist('my_word', 1);
```


### removeFromBlacklist ###
Remove a word from the blacklist.

```js
wp.removeFromBlacklist('my_word')
.then(success => {
  if (success) { console.log('success!'); }
});
```

Can also be called without callback:

```js
wp.removeFromBlacklist('my_word');
```

### getBlacklist ###
Get the blacklist as an array of words.

```js
wp.getBlacklist()
.then(blacklist => {
  for (word in blacklist) {
    console.log(blacklist[word]);
  }
});
```


### addToWhitelist ###
Add a word to the whitelist.

```js
wp.addToWhitelist('my_word')
.then(success => {
  if (success) { console.log('success!'); }
});
```

Can also be called without callback:

```js
wp.addToWhitelist('my_word');
```


### removeFromWhitelist ###
Remove a word from the whitelist.

```js
wp.removeFromWhitelist('my_word')
.then(success => {
  if (success) { console.log('success!'); }
});
```

Can also be called without callback:

```js
wp.removeFromWhitelist('my_word');
```

### getWhitelist ###
Get the whitelist as an array of words.

```js
wp.getWhitelist()
.then(whitelist => {
  for (word in whitelist) {
    console.log(whitelist[word]);
  }
});
```

## Image Moderation ##

### imgCheck ###
Use this method to submit an image to the moderation service. It will return an image ID that is used to return the results of the moderation to a callback function.

```js
wp.imgCheck('http://imageURL...')
.then((imgid) => {
  // this imgid could be used to check the status later
});
```

### imgStatus ###
Returns the moderation status of an image. Possible results can be: pending, approved, declined.

```js
wp.imgStatus('imgid')
.then((status) => {
  // this is the status of your moderation
});
```

### imgAccount ###
Check the number of image submissions remaining on your license.

```js
wp.imgAccount()
.then((remaining) => {
  // this is how many subscriptions you have to use
});
```

### aimImgCheck ###
Use this method to submit an image to the WebPurify Automated Intelligent Moderation (AIM) Service. A percentage probability that the submitted image contains nudity will be returned in real-time.

```js
wp.aimImgCheck('http://imageURL...')
.then((nudity) => {
  if (nudity > 95) {
      console.log('there\'s probably some nudity going on');
  }
});
```

### aimImgAccount ###
Check the number of AIM image submissions remaining on your license.

```js
wp.aimImgAccount()
.then((remaining) => {
  // this is how many subscriptions you have to use
});
```

### hybridImgCheck ###
Combine our Automated Intelligent Moderation system (AIM) and our Live moderators to create a powerful low cost solution.

Images submitted to this method, are first sent to AIM and then sent to our live moderation team based on thresholds you set.

I.E any image that is given a 50% or greater probability by AIM can then be sent to our human moderation team for further review.

```js
wp.hybridImgCheck('http://imageURL...')
.then((nudity) => {
  if (nudity > 55) {
      console.log('Maybe there\'s nudity');

      // use the customimgid parameter to poll for the live check
  }
});
```

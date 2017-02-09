WebPurify API for Node.js
=========================

This module allows simple interaction with the WebPurify API within Node.js. For more information about WebPurify and the services it offers, check out http://webpurify.com/.

### Commands

##### Filters
* [check](#check)
* [checkCount](#checkCount)
* [replace](#replace)
* [return](#return)

##### Blacklist
* [addToBlacklist](#addToBlacklist)
* [removeFromBlacklist](#removeFromBlacklist)
* [getBlacklist](#getBlacklist)

##### Whitelist
* [addToWhitelist](#addToWhitelist)
* [removeFromWhitelist](#removeFromWhitelist)
* [getWhitelist](#getWhitelist)

##### Image Moderation
* [imgcheck](#imgcheck)
* [imgstatus](#imgstatus)
* [imgaccount](#imgaccount)

Install & Initialize
--------------------

`npm install webpurify`

To initialize:

```js
var WebPurify = require('webpurify');

var wp = new WebPurify({
    api_key: ENV['WEBPURIFY_API_KEY']
    //, endpoint:   'us'  // Optional, available choices: 'eu', 'ap'. Default: 'us'.
    //, enterprise: false // Optional, set to true if you are using the enterprise API, allows SSL
});
```

Commands
--------

<a name="check" />
### check

Check a string of text for profanity. Returns true if profanity found, false if none.

```js
wp.check('some profane text')
.then((profanity) => {
  if (profanity) {
    console.log('A bunch of sailors in here!');
  } else {
    console.log('This is a pure string');
  }
});
```

<a name="checkCount" />
### checkCount

Check a string of text for profanity. Returns number of words if profanity found, 0 if none.

```js
wp.checkCount('some profane text')
.then(function(profanity) {
  if (profanity > 0) {
    console.log(profanity.toString() + ' sailors in here!');
  } else {
    console.log('This is a pure string');
  }
});
```

<a name="replace" />
### replace
Check a string of text for profanity. Replaces any found profanity with a provided symbol, and returns the formatted string.

```js
wp.replace('some profane text', '*')
.then(function(purified_text) {
  console.log(purified_text);
});
```

<a name="return" />
### return
Check a string of text for profanity. If any found, returns an array of profane words. Else, returns empty array.

```js
wp.return('some profane text')
.then(function(profanity) {
  for (word in profanity) {
    console.log(profanity[word]);
  }
});
```


### Options
All filter commands can take an additional options object, just before the callback. The available options are:

```js
var optional = {
  lang:   'en', // the 2 letter language code for the text you are submitting
  semail: 1,    // treat email addresses like profanity
  sphone: 1,    // treat phone numbers like profanity
  slink:  1     // treat urls like profanity
};

wp.check('some profane text', optional)
.then(function(profanity) {
  console.log(profanity);
});
```

<a name="addToBlacklist" />
### addToBlacklist
Add a word to the blacklist.

```js
wp.addToBlacklist('my_word')
.then(function(success) {
  if (success) console.log('success!');
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


<a name="removeFromBlacklist" />
### removeFromBlacklist
Remove a word from the blacklist.

```js
wp.removeFromBlacklist('my_word')
.then(function(success) {
  if (success) console.log('success!');
});
```

Can also be called without callback:

```js
wp.removeFromBlacklist('my_word');
```

<a name="getBlacklist" />
### getBlacklist
Get the blacklist as an array of words.

```js
wp.getBlacklist()
.then(function(blacklist) {
  for (word in blacklist) {
    console.log(blacklist[word]);
  }
});
```


<a name="addToWhitelist" />
### addToWhitelist
Add a word to the whitelist.

```js
wp.addToWhitelist('my_word')
.then(function(success) {
  if (success) console.log('success!');
});
```

Can also be called without callback:

```js
wp.addToWhitelist('my_word');
```


<a name="removeFromWhitelist" />
### removeFromWhitelist
Remove a word from the whitelist.

```js
wp.removeFromWhitelist('my_word')
.then(function(success) {
  if (success) console.log('success!');
});
```

Can also be called without callback:

```js
wp.removeFromWhitelist('my_word');
```

<a name="getWhitelist" />
### getWhitelist
Get the whitelist as an array of words.

```js
wp.getWhitelist()
.then(function(whitelist) {
  for (word in whitelist) {
    console.log(whitelist[word]);
  }
});
```

Image Moderation
------

<a name="imgcheck" />
### imgcheck
Use this method to submit an image to the moderation service. It will return an image ID that is used to return the results of the moderation to a callback function.

```js
wp.imgcheck('http://imageURL...')
.then(function(imgid) {
  // this imgid could be used to check the status later
});
```

<a name="imgstatus" />
### imgstatus
Returns the moderation status of an image. Possible results can be: pending, approved, declined.

```js
wp.imgstatus('imgid')
.then(function(status) {
  // this is the status of your moderation
});
```

<a name="imgaccount" />
### imgaccount
Check the number of image submissions remaining on your license.

```js
wp.imgaccount()
.then(function(remaining) {
  // this is how many subscriptions you have to use
});
```

Status
------
v1.0.0

 - The WebPurify module is now written in ES6, using babel + babel-runtim to convert into ES5.
 - Now uses promises

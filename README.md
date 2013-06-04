WebPurify API for Node.js
=========================

This module allows simple interaction with the WebPurify API within Node.js. For more information about WebPurify and the services it offers, check out (http://webpurify.com/).

### Commands
* [check](#check)
* [checkCount](#checkCount)
* [replace](#replace)
* [return](#return)
* [addToBlacklist](#addToBlacklist)
* [removeFromBlacklist](#removeFromBlacklist)
* [getBlacklist](#getBlacklist)
* [addToWhitelist](#addToWhitelist)
* [removeFromWhitelist](#removeFromWhitelist)
* [getWhitelist](#getWhitelist)


Install & Initialize
--------------------

`npm install webpurify`

To initialize:

```js
var WebPurify = require('webpurify');

var wp = new WebPurify({
    api_key: 'my_api_key'
    //, endpoint:   'us'  // Optional, available choices: 'eu', 'ap'. Default: 'us'.
    //, enterprise: false // Optional, set to true if you are using the enterprise API, allows SSL
});
```

Commands
--------

<a name="check" />
### check

Check a string of text for profanity. Returns 1 if profanity found, 0 if none.

```js
wp.check('some profane text', function(err, profanity) {
  if (profanity===1) {
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
wp.checkCount('some profane text', function(err, profanity) {
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
wp.replace('some profane text', '*', function(err, purified_text) {
  console.log(purified_text);
});
```

<a name="return" />
### return
Check a string of text for profanity. If any found, returns an array of profane words. Else, returns empty array.

```js
wp.return('some profane text', function(err, profanity) {
  for (word in profanity) {
    console.log(profanity[word]);
  }
});
```

<a name="addToBlacklist" />
### addToBlacklist
Add a word to the blacklist.

```js
wp.addToBlacklist('my_word', function(err, success) {
  if (success===1) console.log('success!');
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
wp.removeFromBlacklist('my_word', function(err, success) {
  if (success===1) console.log('success!');
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
wp.getBlacklist(function(err, blacklist) {
  for (word in blacklist) {
    console.log(blacklist[word]);
  }
});
```


<a name="addToWhitelist" />
### addToWhitelist
Add a word to the whitelist.

```js
wp.addToWhitelist('my_word', function(err, success) {
  if (success===1) console.log('success!');
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
wp.removeFromWhitelist('my_word', function(err, success) {
  if (success===1) console.log('success!');
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
wp.getWhitelist(function(err, whitelist) {
  for (word in whitelist) {
    console.log(whitelist[word]);
  }
});
```


Status
------

So far it mimics the WebPurify API as closely as possible. In the future, I might change it to have 1 and 0 be replaced with true and false natively, but we'll see. If you find bugs or want to contribute, please do, that would be amazing.
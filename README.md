WebPurify API for Node.js
=========================

This project is designed to allow simple interaction with the WebPurify API within Node.js. For more information about WebPurify and the services it offers, check out (http://webpurify.com/).

Install & Initialize
--------------------

`npm install webpurify`

To initialize:

    var WebPurify = require('webpurify');
    
    var wp = new WebPurify({
        api_key: 'my_api_key'
        //, endpoint:   'us'  // Optional, available choices: 'eu', 'ap'. Default: 'us'.
        //, enterprise: false // Optional, set to true if you are using the enterprise API, allows SSL
    });


Commands
--------

### check

Check a string of text for profanity. Returns 1 if profanity found, 0 if none.

    wp.check('some profane text', function(err, profanity) {
      if (profanity===1) {
        console.log('A bunch of sailors in here!');
      } else {
        console.log('This is a pure string');
      }
    });


### checkCount

Check a string of text for profanity. Returns number of words if profanity found, 0 if none.

    wp.checkCount('some profane text', function(err, profanity) {
      if (profanity > 0) {
        console.log(profanity.toString() + ' sailors in here!');
      } else {
        console.log('This is a pure string');
      }
    });


### replace
Check a string of text for profanity. Replaces any found profanity with a provided symbol, and returns the formatted string.

    wp.replace('some profane text', '*', function(err, purified_text) {
      console.log(purified_text);
    });


### return
Check a string of text for profanity. If any found, returns an array of profane words. Else, returns empty array.

    wp.return('some profane text', function(err, profanity) {
      for (word in profanity) {
        console.log(profanity[word]);
      }
    });


### addToBlacklist
Add a word to the blacklist.

    wp.addToBlacklist('my_word', function(err, success) {
      if (success===1) console.log('success!');
    });
    
Can also be called without callback:

    wp.addToBlacklist('my_word');
    
For Deep search, add optional parameter 1 after word:

    wp.addToBlacklist('my_word', 1);


### removeFromBlacklist
Remove a word from the blacklist.

    wp.removeFromBlacklist('my_word', function(err, success) {
      if (success===1) console.log('success!');
    });
    
Can also be called without callback:

    wp.removeFromBlacklist('my_word');


### getBlackList
Get the blacklist as an array of words.

    wp.getBlacklist(function(err, blacklist) {
      for (word in blacklist) {
        console.log(blacklist[word]);
      }
    });


In Progress
-----------

The plan is to make this mimic the WebPurify API as closely as possible. Features will be added eventually. If you want to contribute, please do, that would be amazing.
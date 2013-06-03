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
    });
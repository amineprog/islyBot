var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var request = require('request');
// database init
var DB = "mongodb://aminerifi:aitammart2020@ds143030.mlab.com:43030/islybot";
var mongoose = require('mongoose');
// load Database model
var Product = require('./models/product.js');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', function (req, res) {
    var produit = new Product({
        'name': 'product1',
        'desctiption': 'description 1',
        'marque': 'marque 1',
        'type': 'type 1',
        'image': 'https://blooming-taiga-15564.herokuapp.com/',
        'price': 250,
        'qte': 1200
    });
    produit.save(function (err, resource) {
        if (err) {
            console.log(err);
            response.send(err).status(501);
        } else {
            response.json(resource).status(201);
        }
    });
    res.send('Isly Bot for facebook messenger')
});

app.get('/webhook', function (req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === 'islybot_my_messenger_bot_hehehehe') {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

app.post('/webhook', function (req, res) {
    var data = req.body;
    // Make sure this is a page subscription
    if (data.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function (entry) {
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            // Iterate over each messaging event
            entry.messaging.forEach(function (event) {
                if (event.message) {
                    receivedMessage(event);
                } else {
                    console.log("Webhook received unknown event: ", event);
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
        res.sendStatus(200);
    }
});

function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {

        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        switch (messageText) {
            case 'generic':
                sendGenericMessage(senderID);
                break;

            default:
                sendTextMessage(senderID, messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}

function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };

    callSendAPI(messageData);
}

function callSendAPI(messageData) {
    var PAGE_ACCESS_TOKEN = 'EAAFqBX7yOZCwBALfcYDxVwnUuFsbk4T0c0hgGkZAqYsI3bj29bIZAXA1lZA30KzZAGW6ZCzaOIdXN2YWzQYwVZBauewM1vSErZA7nZBwH9TKqjjeU3PrIh0ikU67bSQqvU6fmZBumVK95z4tXSv1iRhDvm9wDZCCKQS27G43bFw1qyfzgZDZD';
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            console.log("Successfully sent generic message with id %s to recipient %s",
                messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}

function sendGenericMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "rift",
                        subtitle: "Next-generation virtual reality",
                        item_url: "https://www.oculus.com/en-us/rift/",
                        image_url: "http://wallpaper-gallery.net/images/imagenes-de-robot/imagenes-de-robot-17.jpg",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.oculus.com/en-us/rift/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Call Postback",
                            payload: "Payload for first bubble",
                        }],
                    }, {
                        title: "touch",
                        subtitle: "Your Hands, Now in VR",
                        item_url: "https://www.oculus.com/en-us/touch/",
                        image_url: "https://www.securitykiss.com/images/hero/robot_voip.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.oculus.com/en-us/touch/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Call Postback",
                            payload: "Payload for second bubble",
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

mongoose.connect(DB, function (err) {
    if (err) {
        console.log(err);
        // return err;
    } else {
        console.log('Successfully connected to ' + DB);
    }
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port ' + process.env.PORT + '!');
});

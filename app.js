var express = require('express');
const TARGET_URL = 'https://api.line.me/v2/bot/message/reply'
const TOKEN1 = '1MmOyOjNSOuxKa6my3rtUXlbK0QRzh0iXnKpyfO12oW'
const TOKEN = 'cpsmvOgIR2WS4CHk3eu9x4wlBMtQ6NDzf5fsvrjmqvwj+CBWOD5e3IO+hYjjGG+BeANByun6mUAACTfi9YOOkcvJ1XPtvpZbwZJwPsZ0xw+YweK3acXEuQflZYD3+34yqmYVPce5JuTNdak3a48g8wdB04t89/1O/w1cDnyilFU='
const PAPAGO_URL = 'https://openapi.naver.com/v1/papago/n2mt'
const PAPAGO_ID = 'FygtYFb_9jeJOb4Zy61c'
const PAPAGO_SECRET = 'ejYHtQNy08'
const fs = require('fs');
const path = require('path');
const HTTPS = require('https');
const domain = "www.daydream123.tk"
const sslport = 23023;
const bodyParser = require('body-parser');

let targetLang = "en";
const request = require('request');

const broadTargetUrl = "https://api.line.me/v2/bot/message/broadcast";

var app = express();
app.use(bodyParser.json());

app.post('/hook', function (req, res) {
    // console.log("req", req);
    var eventObj = req.body.events[0];
    var source = eventObj.source;
    var message = eventObj.message;

    // request log
    //console.log('======================', new Date() ,'======================');
    //console.log('[request]', req.body);
    console.log('[request source] ', eventObj.source);
    //console.log('[request message]', eventObj.message);

    trans(eventObj.replyToken, eventObj.message.text);
    
   
    res.sendStatus(200);
});

function trans(replyToken, message) {
    //console.log("msg", message);
    request.post(
        {
            url: PAPAGO_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Naver-Client-Id': `${PAPAGO_ID}`,
                'X-Naver-Client-Secret': `${PAPAGO_SECRET}`
            },
            body: `source=ko&target=${targetLang}&text=` + message,
            json:true
        },(error, response, body) => {
            if(!error && response.statusCode == 200) {
                console.log("response error", body.message);
                var transMessage = body.message.result.translatedText;
      //         console.log("translated:", transMessage);
		    
		    if(message === "영어"){targetLang = "en"}
		    else if(message === "일본어"){targetLang = "ja"}
		    else if(message === "프랑스어"){targetLang = "fr"}
		    else{

		    request.post(
                    {
                        url: broadTargetUrl,
                        headers: {
                            'Authorization': `Bearer ${TOKEN}`
                        },
                        json: {
                            //"replyToken":replyToken,
                            "messages":[
                                {
                                    "type":"text",
                                    "text":transMessage
                                }
                            ]
                        }
                    },(error, response, body) => {
                        console.log("broad",body)
                    });
		    }
            }
        });

}

try {
    const option = {
      ca: fs.readFileSync('/etc/letsencrypt/live/' + domain +'/fullchain.pem'),
      key: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/privkey.pem'), 'utf8').toString(),
      cert: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/cert.pem'), 'utf8').toString(),
    };
  
    HTTPS.createServer(option, app).listen(sslport, () => {
      console.log(`[HTTPS] Server is started on port ${sslport}`);
    });
  } catch (error) {
    console.log('[HTTPS] HTTPS 오류가 발생하였습니다. HTTPS 서버는 실행되지 않습니다.');
    console.log(error);
  }
  

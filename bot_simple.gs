// Configuración global
const TOKEN = "7719314719:AAHgdp9YdKkPKN9bziUVPDop8csZfoRjqPM"
const config = {
  webhook: "https://script.google.com/macros/s/AKfycbzQdRK5DVKBZUIF6h7eFaUdWIZRFS7QIoJhIYwXObcLcrMb7WyhhWycq0hd9M3ySRLmtw/exec"
}

function setWebhook() {
  var bot = new Telegram.Bot(TOKEN, {}, config);
  var result = bot.request('setWebhook', {
    url: bot.config.webhook
  });
  Logger.log(result);
}

function doPost(e) {
  if (e.postData.type == "application/json") {
    // Parse the update sent from Telegram
    var update = JSON.parse(e.postData.contents);
    // Instantiate our bot passing the update 
    var bot = new Telegram.Bot(TOKEN, update, config);

    bot.onCommand(/\/start/, function () {
      this.replyToSender("It works!");
    });

    // If the update is valid, process it
    if (update) {
      bot.process();
    }
  }
}

/**
 * Creates a new instance of the Bot Handler
 * @constructor
 * @param {string} token - The token of the Bot
 * @param {json} update - The specific update to process
 * @param {json} config - Optional configuration settings
 */
function Bot(token, update, config) {
  this.token = token;
  this.update = update;
  this.handlers = [];
  this.config = config || {};
}

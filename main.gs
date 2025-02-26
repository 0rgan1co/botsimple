// Configuración global

var TOKEN = "7719314719:AAHgdp9YdKkPKN9bziUVPDop8csZfoRjqPM";
var telegramUrl = "https://api.telegram.org/bot" + TOKEN;
var webAppUrl = ""; // 2. FILL IN YOUR GOOGLE WEB APP ADDRESS
var ssId = "";      // 3. FILL IN THE ID OF YOUR SPREADSHEET
var adminID = "";   // 4. Fill in your own Telegram ID for debugging

function getMe() {
  var url = telegramUrl + "/getMe";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function setWebhook() {
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function sendText(id,text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + id + "&text=" + encodeURIComponent(text);
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function doGet(e) {
  return HtmlService.createHtmlOutput("Hi there");
}

function doPost(e) {
  try {
    // this is where telegram works
    var data = JSON.parse(e.postData.contents);
    var text = data.message.text;
    var id = data.message.chat.id;
    var name = data.message.chat.first_name + " " + data.message.chat.last_name;
    var answer = "Hi " + name;
    sendText(id,answer);
    SpreadsheetApp.openById(ssId).getSheets()[0].appendRow([new Date(),id,name,text,answer]);
    
    if(/^@/.test(text)) {
      var sheetName = text.slice(1).split(" ")[0];
      var sheet = SpreadsheetApp.openById(ssId).getSheetByName(sheetName) ? SpreadsheetApp.openById(ssId).getSheetByName(sheetName) : SpreadsheetApp.openById(ssId).insertSheet(sheetName);
      var newText = text.split(" ").slice(1).join(" ");
      sheet.appendRow([new Date(),id,name,newText,answer]);
      sendText(id,"your text '" + newText + "' is now added to the sheet '" + sheetName + "'");
    }
  } catch(e) {
    sendText(adminID, JSON.stringify(e,null,4));
  }
}

const token = ''; // REPLACE IT WITH YOUR BOTS TOKEN
const telegramApi = 'https://api.telegram.org/bot' + token;

function sendKeyboard(chatId, choices, text = 'Menu') {
  const buttons = transformArrayToKeyboard(choices);
  const replyKeyboardMarkup = {keyboard: buttons, 
                one_time_keyboard: true,
                resize_keyboard: true};
  const replyMarkup = JSON.stringify(replyKeyboardMarkup);
  const url = telegramApi + '/sendMessage?chat_id=' + encodeURIComponent(chatId) + '&text=' + encodeURIComponent(text) + '&disable_web_page_preview=true&reply_markup=' + encodeURIComponent(replyMarkup);
  const response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function transformArrayToKeyboard(choices) {
  const maxLengthRowKeyboardMenu = 3;
  const arr = choices.map(item => ({text: item }));
  const result = [];
  let index = 0;
  while(arr.slice(index).length > 0) {
    const newRowValuesForButtons = arr.slice(index,index+maxLengthRowKeyboardMenu);
    result.push(newRowValuesForButtons);
    index += maxLengthRowKeyboardMenu;
  }
  return result;
}
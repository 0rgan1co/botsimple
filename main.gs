function setWebhook() {
  var url = TELEGRAM_URL + "/setWebhook?url=" + WEBAPP_URL;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function deleteWebhook() {
  var url = TELEGRAM_URL + "/deleteWebhook";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function doGet(e) {
  return HtmlService.createHtmlOutput("Hola mundo");
}

function testSendText(){
  sendText(CHAT_ID, "Probando SendText", { "remove_keyboard": true })
}

function sendText(chatId, text, keyboard) {
  var data = {
    method: "post",
    payload: {
      method: "sendMessage",
      chat_id: String(chatId),
      text: text,
      parse_mode: "HTML",
      reply_markup: JSON.stringify(keyboard)
    }
  };
  UrlFetchApp.fetch(TELEGRAM_URL + '/', data);
  SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(), data]);
}

function backupDoPost() {
  if (!e || !e.postData) {
    return;
  }
  var contents = JSON.parse(e.postData.contents);
  sendText(CHAT_ID, contents.message.text, { "remove_keyboard": true });
  SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(), contents]);

  if (contents.message.text.slice(0, COMMANDS[1].length) == COMMANDS[1]){
  SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(),"Entramos a Zumbido"]);
}

}

function doPost(e) {
  if (!e || !e.postData) {
    Logger.log("No recibi ningun evento.");
    return;
  }

  var contents;
  try {
    contents = JSON.parse(e.postData.contents);
  } catch (error) {
    Logger.log("Error parseando el JSON: " + error);
    return;
  }

  var text = contents.message.text;
  var chatId = contents.message.chat.id;

  // Log chatId and incoming message to the spreadsheet
  try {
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(), chatId + text]);
  } catch (error) {
    Logger.log("Error escribiendo en spreadsheet: " + error);
    return;
  }

  Logger.log("Texto recibido: " + text); // Log the incoming text
  if (contents.message.text.slice(0, COMMANDS[0].length) == COMMANDS[0]){
  SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(),"Entramos a Zumbido"]);

    }
      // Log if no command matched
  Logger.log("No command matched for text: " + text);
}

    // if (contents.message.text.slice(0, COMMANDS[0].length) == COMMANDS[0]){
    // SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(),"Entramos a Zumbido"]);
    // sendText(contents.message.chat.id, "Te damos la bienvenida a BeeZum! Utiliza /ayuda para saber que puedo hacer.", { "remove_keyboard": true });
    //} else if (text === "/ayuda") {
    //  sendText(contents.message.chat.id, "Estas son las cosas que puedo hacer...", { "remove_keyboard": true });
   // } 
  // Agregar otros comandos 
  // else {
    // Ignorar otros mensajes
 //   return;
 // }
  // Logs de los mensajes en excel
 // SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(), text]);



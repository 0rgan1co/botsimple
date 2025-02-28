let userStates = {}; // Almacenamiento en memoria

function onMessageReceived(update) {
    var chatId = update.message.chat.id;
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(), chatId]);
    Logger.log("Chat ID: " + chatId);
}

function handleStart(chatId) {
  sendText(chatId, "🐝 <b>¡Hola!</b> ✨\n\nEste chatBot existe para <b>dar y recibir</b> reconocimientos y auto-reconocimientos generando un <b>✨ zumbido ✨</b> que quedara registrado en \"BeeZum 🐝\"\n\nCada zumbido quedará abierto por 48 horas para que otras personas puedan <b>celebrar</b> y <b>sumarse +1</b> a ese reconocimiento.\n\n🌱 <b>Sabemos que es un gran desafío navegar la tensión entre conexión y eficiencia. Por esta razón quedemos generar condiciones apoyantes para que existe más reconocimiento en los equipos.</b>\n\n¿Qué puedo hacer?\n/start - Iniciar el bot\n/zumbido - Dar un reconocimiento\n/sumarme - Sumarme +1\n/reporte - Ver historial");
}

function getChatMembers(chatId) {
    try {
        var url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/getChatMembers?chat_id=" + chatId;
        var response = UrlFetchApp.fetch(url);
        var data = JSON.parse(response.getContentText());
        SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(), data]);
        return data.result; // Lista de miembros
    } catch (error) {
        Logger.log("Error obteniendo miembros del chat: " + error);
        return [];
    }
}

function handleZumbido(chatId) {
    try {
        if (!userStates[chatId]) {
            userStates[chatId] = {};
        }

        // Obtener la lista de miembros del chat
        var members = getChatMembers(chatId);

        if (members.length === 0) {
            sendText(chatId, "❌ No se pudo obtener la lista de miembros del chat.");
            return;
        }

        var message = "🐝 <b>Paso 1: ¿Para quién(es) es este zumbido?</b>\n\n";
        message += "Menciona a los destinatarios usando sus nombres o @usernames.\n\n";
        message += "Ejemplo: @usuario1, @usuario2";

        sendText(chatId, message);
        userStates[chatId].step = "awaitingRecipient";

        logEvent(chatId, "Inició flujo de zumbido", userStates[chatId]);
    } catch (error) {
        Logger.log("Error en handleZumbido: " + error);
        logEvent(chatId, "Error en handleZumbido: " + error, null);
    }
}


// Paso 6 => Zumbido
function closeZumbido(zumbidoId) {
  var zumbido = getZumbidoById(zumbidoId); // Obtener el zumbido de la hoja de cálculo
  var message = "🐝 <b>¡Este zumbido se ha cerrado!</b>\n\n";
  message += "👤 <b>Destinatario(s):</b> " + zumbido.recipients + "\n";
  message += "📝 <b>Descripción:</b> " + zumbido.description + "\n\n";
  message += "¡Gracias a todos por participar! 🎉";

  sendText(CHAT_ID, message); // Enviar al grupo
}

function handleSumarme(chatId) {
  // Obtener zumbidos de los últimos 48 horas
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Zumbidos");
    var data = sheet.getDataRange().getValues();
    var activeZumbidos = data.filter(function (row) {
      var fecha = new Date(row[0]);
      var ahora = new Date();
      return (ahora - fecha) <= 48 * 60 * 60 * 1000; // Últimas 48 horas
    });

    if (activeZumbidos.length === 0) {
      sendText(chatId, "No hay zumbidos activos en este momento. ¡Sé el primero en crear uno usando /zumbido!");
      return;
    }

    // Mostrar lista de zumbidos
    var message = "🎉 <b>Zumbidos activos:</b>\n\n";
    activeZumbidos.forEach(function (zumbido, index) {
      message += (index + 1) + ". " + zumbido[2] + " - " + zumbido[3] + "\n";
    });
    message += "\nResponde con el número del zumbido al que deseas sumarte.";

    sendText(chatId, message);
    userStates[chatId] = "awaitingSumarme";
  } catch (error) {
    Logger.log("Error obteniendo zumbidos: " + error);
    sendText(chatId, "❌ Hubo un error al obtener los zumbidos. Por favor, inténtalo de nuevo.");
  }
}

// Función para procesar la suma a un zumbido
function processSumarme(chatId, text) {
  var index = parseInt(text) - 1;
  if (isNaN(index)) {
    sendText(chatId, "❌ Por favor, responde con un número válido.");
    return;
  }

  // Obtener el zumbido seleccionado
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Zumbidos");
    var data = sheet.getDataRange().getValues();
    var activeZumbidos = data.filter(function (row) {
      var fecha = new Date(row[0]);
      var ahora = new Date();
      return (ahora - fecha) <= 48 * 60 * 60 * 1000; // Últimas 48 horas
    });

    if (index < 0 || index >= activeZumbidos.length) {
      sendText(chatId, "❌ Número de zumbido no válido.");
      return;
    }

    var zumbido = activeZumbidos[index];
    var nombre = zumbido[2];
    var motivo = zumbido[3];

    // Incrementar el contador de sumados (aquí puedes agregar lógica adicional)
    sendText(chatId, "🎉 ¡Te has sumado al reconocimiento de <b>" + nombre + "</b> por: <i>" + motivo + "</i>!");

    // Limpiar el estado del usuario
    delete userStates[chatId];
  } catch (error) {
    Logger.log("Error procesando suma: " + error);
    sendText(chatId, "❌ Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.");
  }
}

function handleSumarme(chatId) {
  sendText(chatId, "¡Te has sumado +1! 🎉");
}

function handleReporte(chatId) {
  sendText(chatId, "Aquí está tu historial de reconocimientos...");
}

function handleAyuda(chatId) {
  var message = "🐝 <b>¿En qué puedo ayudarte?</b> ✨\n\n";
  message += "Estas son las cosas que puedo hacer:\n\n";
  message += "✅ <b>/zumbido</b> - Dar un reconocimiento\n";
  message += "✅ <b>/sumarme</b> - Sumarme a un reconocimiento existente\n";
  message += "✅ <b>/reporte</b> - Ver el historial de reconocimientos\n";
  message += "✅ <b>/ayuda</b> - Mostrar esta ayuda\n\n";
  message += "¡No dudes en probar estos comandos! 😊";

  sendText(chatId, message);
}


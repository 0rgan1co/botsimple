let userStates = {}; // Almacenamiento en memoria


function onMessageReceived(update) {
    var chatId = update.message.chat.id;
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(), chatId]);
    Logger.log("Chat ID: " + chatId);
}

function handleStart(chatId) {
  sendText(chatId, "🐝 <b>¡Hola!</b> ✨\n\nEste chatBot existe para <b>dar y recibir</b> reconocimientos y auto-reconocimientos generando un <b>✨ zumbido ✨</b> que quedara registrado en \"BeeZum 🐝\"\n\nCada zumbido quedará abierto por 48 horas para que otras personas puedan <b>celebrar</b> y <b>sumarse +1</b> a ese reconocimiento.\n\n🌱 <b>Sabemos que es un gran desafío navegar la tensión entre conexión y eficiencia. Por esta razón quedemos generar condiciones apoyantes para que existe más reconocimiento en los equipos.</b>\n\n¿Qué puedo hacer?\n/start - Iniciar el bot\n/zumbido - Dar un reconocimiento\n/sumarme - Sumarme +1\n/reporte - Ver historial");
}

function handleZumbido(chatId, fromUser) {
    try {
        if (!userStates[chatId]) {
            userStates[chatId] = {};
        }

        // Verificar si hay miembros en el chat
        if (!CHAT_MEMBERS || CHAT_MEMBERS.length === 0) {
            sendText(chatId, "❌ No se pudo obtener la lista de miembros del chat. Por favor, inténtalo más tarde.");
            return;
        }

        // Paso 1: Selección de destinatarios
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

function processZumbidoRecipient(chatId, text, fromUser) {
    try {
        // Guardar los destinatarios seleccionados
        userStates[chatId].recipients = text.split(",").map(r => r.trim());

        // Paso 2: Selección de categoría
        var message = "🐝 <b>Paso 2: ¿Cuál es la categoría del zumbido?</b>\n\n";
        message += "Por favor, escribe la categoría (ejemplo: Reconocimiento, Agradecimiento).";

        sendText(chatId, message);
        userStates[chatId].step = "awaitingCategory";
    } catch (error) {
        Logger.log("Error en processZumbidoRecipient: " + error);
        sendText(chatId, "❌ Ocurrió un error al procesar los destinatarios.");
    }
}

function processZumbidoCategory(chatId, text, fromUser) {
    try {
        // Guardar la categoría seleccionada
        userStates[chatId].category = text.trim();

        // Paso 3: Solicitar motivo
        var message = "🐝 <b>Paso 3: ¿Cuál es el motivo del zumbido?</b>\n\n";
        message += "Escribe brevemente el motivo por el que estás enviando este zumbido.";

        sendText(chatId, message);
        userStates[chatId].step = "awaitingReason";
    } catch (error) {
        Logger.log("Error en processZumbidoCategory: " + error);
        sendText(chatId, "❌ Ocurrió un error al procesar la categoría.");
    }
}

function processZumbidoReason(chatId, text, fromUser) {
    try {
        // Validar que hay un motivo
        if (!text || text.trim().length === 0) {
            sendText(chatId, "❌ Por favor, escribe un motivo para el zumbido.");
            return;
        }

        // Guardar el motivo en el estado
        userStates[chatId].reason = text.trim();

        // Guardar el zumbido en la hoja de cálculo
        saveZumbidoToSpreadsheet(chatId, userStates[chatId]);

        // Enviar el zumbido a todos los miembros
        sendZumbido(chatId, fromUser, userStates[chatId].recipients, userStates[chatId].reason);

        // Resetear el estado después de enviar
        resetUserState(chatId);

        logEvent(chatId, "Zumbido enviado", {
            from: fromUser.username || fromUser.first_name,
            reason: userStates[chatId].reason
        });

        // Cerrar el zumbido después de 48 horas
        closeZumbidoAfter48Hours(chatId, userStates[chatId].recipients, userStates[chatId].reason);
    } catch (error) {
        Logger.log("Error en processZumbidoReason: " + error);
        sendText(chatId, "❌ Ocurrió un error al procesar el motivo. Por favor, intenta nuevamente.");
        resetUserState(chatId);
    }
}

function saveZumbidoToSpreadsheet(chatId, userState) {
    // Lógica para guardar el zumbido en la hoja de cálculo
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Zumbidos");
    sheet.appendRow([new Date(), chatId, userState.recipients.join(", "), userState.category, userState.reason]);
}

function closeZumbidoAfter48Hours(chatId, recipients, reason) {
    // Lógica para cerrar el zumbido y notificar al grupo después de 48 horas
    var message = "🔔 <b>Zumbido cerrado</b> 🔔\n\n";
    message += "El zumbido para " + recipients.join(", ") + " por " + reason + " ha sido cerrado después de 48 horas.";
    sendText(chatId, message);
}

function sendZumbido(chatId, fromUser, recipients, reason) {
    try {
        var senderName = fromUser.first_name || fromUser.username || "Usuario";
        
        // Formatear la lista de destinatarios (todos los miembros)
        var recipientsList = recipients
            .map(u => u.username ? "@" + u.username : u.first_name)
            .join(", ");
        
        var message = "🔔 <b>¡ZUMBIDO!</b> 🔔\n\n";
        message += "De: <b>" + senderName + "</b>\n";
        message += "Para: <b>" + recipientsList + "</b>\n\n";
        message += "📝 <b>Motivo:</b>\n";
        message += reason + "\n\n";
        message += "⏰ " + new Date().toLocaleString() + "\n";
        
        // Añadimos menciones para notificar a los usuarios
        message += "\n" + recipientsList;
        
        // Enviar el mensaje con formato
        sendText(chatId, message);
        
        // Enviar una animación de zumbido
        sendAnimation(chatId, "https://media.giphy.com/media/3o7TKwmBiXfwA951ra/giphy.gif");
    } catch (error) {
        Logger.log("Error en sendZumbido: " + error);
        sendText(chatId, "❌ Ocurrió un error al enviar el zumbido.");
    }
}

function handleMessage(message) {
    var chatId = message.chat.id;
    var text = message.text || "";
    var fromUser = message.from;
    
    // Verificar si estamos en un flujo activo
    if (userStates[chatId] && userStates[chatId].step) {
        // Procesar según el paso actual
        if (userStates[chatId].step === "awaitingRecipient") {
            return processZumbidoRecipient(chatId, text, fromUser);
        } else if (userStates[chatId].step === "awaitingCategory") {
            return processZumbidoCategory(chatId, text, fromUser);
        } else if (userStates[chatId].step === "awaitingReason") {
            return processZumbidoReason(chatId, text, fromUser);
        }
    }
    
    // Si el mensaje es un comando o no estamos en un flujo activo
    if (text.startsWith('/')) {
        // Procesar comandos
        if (text.startsWith('/zumbido')) {
            return handleZumbido(chatId, fromUser);
        }
        // Otros comandos...
    } else {
        // Mensaje no reconocido
        sendText(chatId, "No reconozco ese comando. Usa /ayuda para ver las opciones disponibles.");
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

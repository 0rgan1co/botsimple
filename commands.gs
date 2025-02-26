// Configuración global
var token = "7719314719:AAHgdp9YdKkPKN9bziUVPDop8csZfoRjqPM";
var chatId = "-4687334611";  // Reemplaza con el ID correcto del chat

/**
 * Maneja el comando /start
 * @param {number} chatId - ID del chat de Telegram.
 */
function handleStartCommand(chatId) {
  var chatId = "-4687334611";  // Reemplaza con el ID correcto del chat
  var texto = `
🐝 <b>¡Hola!</b> ✨

En este chat podés <b>dar y recibir</b> reconocimientos y auto-reconocimientos generando un <b>✨ zumbido ✨</b> que quedara registrado en "BeeZum 🐝" para que el equipo pueda utilizarlo como ayuda memoria de sus interacciones cotidianas. Cada zumbido quedará abierto por 48 horas para que otras personas puedan <b>celebrar</b> y sumarse a ese reconocimiento.  

🌱 <b>Creemos que el reconocimiento es una forma de nutrir la conexión, los vínculos y hacer visible lo que contribuye a nuestro bienestar y la colaboración.</b>

<b>Comandos disponibles:</b>
/start - Iniciar el bot
/zumbido - Enviar un reconocimiento
/sumarme - Para expresar +1 
/reporte - Historial de reconocimientos
`;

  var url = "https://api.telegram.org/bot" + token + "/sendMessage";
  var options = {
    method: "post",
    payload: {
      chat_id: chatId,
      text: texto,
      parse_mode: "HTML"
    }
  };

  UrlFetchApp.fetch(url, options);
}

/**
 * Maneja el comando /zumbido
 * @param {number} chatId - ID del chat de Telegram.
 */
function handleZumbidoCommand(chatId) {
  sendText(chatId, "Estamos trabajando para que la funcionalidad /zumbido este disponible pronto 🐝.");
}

/**
 * Maneja el comando /sumarme
 * @param {number} chatId - ID del chat de Telegram.
 */
function handleSumarmeCommand(chatId) {
    sendText(chatId, "Estamos trabajando para que la funcionalidad /sumarme este disponible pronto.");
}

/**
 * Maneja el comando /reporte
 * @param {number} chatId - ID del chat de Telegram.
 */
function handleReporteCommand(chatId) {
    sendText(chatId, "Estamos trabajando para que la funcionalidad /reporte este disponible pronto 🐝.");
}
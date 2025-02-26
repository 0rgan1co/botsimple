/**
 * Maneja el comando /start
 * @param {number} chatId - ID del chat de Telegram.
 */
function handleStartCommand(chatId) {
  const welcomeMessage = `
# 🐝 **¡Bienvenide a BeeZum!** ✨
Aquí podés generar un **zumbido** para reconocer, valorar o auto-reconocerte dentro del equipo. Cada zumbido quedará abierto por 48 horas para que otras personas puedan **resonar** y sumar su perspectiva.  

🌱 **El reconocimiento es una forma de nutrir los vínculos y hacer visible lo que contribuye al bienestar y la colaboración.**

**Comandos disponibles:**
/start - Iniciar el bot y explicar qué puedo hacer
/zumbido - Enviar un reconocimiento
/sumarme - Para expresar +1 con algún reconocimiento
/reporte - Generar un reporte con el historial de reconocimientos
  `;
  sendText(chatId, welcomeMessage);
}

/**
 * Maneja el comando /zumbido
 * @param {number} chatId - ID del chat de Telegram.
 */
function handleZumbidoCommand(chatId) {
  sendText(chatId, "Estamos trabajando en esta funcionalidad 🐝.");
}

/**
 * Maneja el comando /sumarme
 * @param {number} chatId - ID del chat de Telegram.
 */
function handleSumarmeCommand(chatId) {
  sendText(chatId, "Estamos trabajando en esta funcionalidad +1.");
}

/**
 * Maneja el comando /reporte
 * @param {number} chatId - ID del chat de Telegram.
 */
function handleReporteCommand(chatId) {
  sendText(chatId, "Estamos trabajando en esta funcionalidad 📊.");
}
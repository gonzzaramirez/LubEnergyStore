/**
 * Sincronización LubEnergy → POST /products/sync-sheets
 */

// Variables configuradas para tu entorno local con ngrok
var SYNC_BASE_URL = 'https://unscreened-elfreda-uncurbed.ngrok-free.dev'; // Reemplazar por tu ngrok o dominio real en el futuro
var SYNC_API_KEY = 'mi_clave_secreta_local_para_saas';

function getSyncBaseUrl_() {
  var p = PropertiesService.getScriptProperties().getProperty('SYNC_BASE_URL');
  return String(p || SYNC_BASE_URL || '').replace(/\/$/, '');
}

function getSyncApiKey_() {
  var p = PropertiesService.getScriptProperties().getProperty('SYNC_API_KEY');
  return String(p || SYNC_API_KEY || '');
}

var COL_SKU = 0; // Columna A
var COL_STOCK_CASEROS = 4; // Columna E
var COL_STOCK_CORRIENTES = 5; // Columna F
var COL_PRECIO = 7; // Columna H

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ Sincronización')
    .addItem('Actualizar Web', 'syncConWeb')
    .addToUi();
}

/** Limpia el código para que Google no lo convierta en fechas raras */
function normalizeSkuFromDisplay_(displayVal, rawVal) {
  var fromDisplay = String(displayVal != null ? displayVal : '').trim();
  if (fromDisplay) return fromDisplay;
  if (rawVal instanceof Date) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Cuidado con el Código',
      'Hay una celda en la columna de códigos que parece una fecha. Por favor, poné la columna A como "Texto plano".',
      SpreadsheetApp.getUi().ButtonSet.OK,
    );
    return '';
  }
  return String(rawVal != null ? rawVal : '').trim();
}

/** Extrae el número de las celdas de dinero (Soporta $ 29.500,00) */
function parseMoneyToNumber_(displayOrRaw) {
  var s = String(displayOrRaw != null ? displayOrRaw : '').trim();
  if (!s) return null;
  s = s.replace(/\$/g, '').replace(/\s/g, '');
  var hasComma = s.indexOf(',') !== -1;
  var hasDot = s.indexOf('.') !== -1;
  if (hasComma && hasDot) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma && !hasDot) {
    s = s.replace(',', '.');
  } else {
    s = s.replace(/,/g, '');
  }
  var n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

/** Limpia los números de la columna de stock */
function parseStockCell_(v) {
  if (v === '' || v === null || v === undefined) return 0;
  if (typeof v === 'number' && !isNaN(v)) return Math.round(v);
  var n = parseInt(String(v).replace(/[^\d-]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

function syncConWeb() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var range = sheet.getDataRange();
  var values = range.getValues();
  var displays = range.getDisplayValues();
  var payload = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var rowDisp = displays[i];
    var sku = normalizeSkuFromDisplay_(rowDisp[COL_SKU], row[COL_SKU]);

    // Ignora filas vacías o encabezados
    if (!sku || sku === 'Codigo' || sku === 'Código') continue;

    var stockCaseros = parseStockCell_(row[COL_STOCK_CASEROS]);
    var stockCorrientes = parseStockCell_(row[COL_STOCK_CORRIENTES]);
    var stockTotal = stockCaseros + stockCorrientes;

    var precioDisplay = rowDisp[COL_PRECIO];
    var precioNum = parseMoneyToNumber_(
      precioDisplay.length ? precioDisplay : row[COL_PRECIO],
    );

    var item = { sku: sku, stock: stockTotal };
    if (precioNum !== null) item.price = precioNum;
    payload.push(item);
  }

  if (!payload.length) {
    SpreadsheetApp.getUi().alert(
      'Información',
      'No se encontraron productos para actualizar. Revisá que la tabla tenga datos.',
      SpreadsheetApp.getUi().ButtonSet.OK,
    );
    return;
  }

  var base = getSyncBaseUrl_();
  var key = getSyncApiKey_();
  var url = base + '/products/sync-sheets';

  var options = {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true, // Esto es clave para que el script no crashee y podamos leer el error amigable
    headers: {
      'x-api-key': key,
      'ngrok-skip-browser-warning': 'true',
    },
    payload: JSON.stringify(payload),
  };

  try {
    var res = UrlFetchApp.fetch(url, options);
    var code = res.getResponseCode();

    // LÓGICA DE MENSAJES PARA CLIENTES NO PROGRAMADORES
    if (code >= 200 && code < 300) {
      SpreadsheetApp.getUi().alert(
        '✅ ¡Actualización Exitosa!',
        'El stock y los precios se mandaron a la tienda web.\n\n(El sistema ya se encargó de procesar únicamente los códigos que coinciden).',
        SpreadsheetApp.getUi().ButtonSet.OK,
      );
    } else if (code === 401 || code === 403) {
      SpreadsheetApp.getUi().alert(
        '🔒 Problema de Permisos',
        'No se pudo actualizar la web. Parece que la clave de seguridad no es correcta o el enlace de prueba se cortó.\n\nAvisale al equipo de sistemas.',
        SpreadsheetApp.getUi().ButtonSet.OK,
      );
    } else {
      SpreadsheetApp.getUi().alert(
        '⚠️ Error de comunicación',
        'Hubo un problema temporal con el servidor de la tienda web.\n\nIntentá de nuevo en unos minutos. Si el problema sigue, avisá que ocurrió un error de servidor (Código ' +
          code +
          ').',
        SpreadsheetApp.getUi().ButtonSet.OK,
      );
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert(
      '❌ Sin conexión',
      'No se pudo conectar con la tienda web.\n\nVerificá que tengas buena conexión a internet o que la página web esté funcionando correctamente.',
      SpreadsheetApp.getUi().ButtonSet.OK,
    );
  }
}

/**
 * Google Apps Script - CRUD de Productos y Fotos
 * Spreadsheet ID: 18Z7NSfrBCune-1nk04J2WZ9D4nS5bXjBU98TNDT4Z1w
 * Hojas:
 *  - Productos
 *  - Fotos
 *  - Fotos Home
 */

var SPREADSHEET_ID = '18Z7NSfrBCune-1nk04J2WZ9D4nS5bXjBU98TNDT4Z1w';
var SHEET_PRODUCTOS = 'Productos';
var SHEET_FOTOS = 'Fotos';
var SHEET_FOTOS_HOME = 'Fotos Home';
var SHEET_CONFIG_HOME = 'Configuracion Home';

/* ---------- Imgur API creds (Bearer) ---------- */
var IMGUR_CLIENT_ID     = '252b1ea8367c8bc';
var IMGUR_CLIENT_SECRET = '28fb1a1922c9194a07f4f1545f69dfa77ec43a5';
var IMGUR_ACCESS_TOKEN  = '26f8834a2115d894d6eb07f4d6330a059591ac3f';
var IMGUR_REFRESH_TOKEN = 'a1cd36d335b9dbe3db1d5f2faa6ad14835f1bc1c';
var IMGUR_EXPIRES_UNIX  = Math.floor(Date.now() / 1000) + 315360000;

/**
 * Entry points
 */
function doGet(e) {
  return handleRequest(e.parameter || {});
}

function doPost(e) {
  var requestData;
  try {
    requestData = JSON.parse(e.postData.contents);
  } catch (err) {
    requestData = e.parameter || {};
  }
  return handleRequest(requestData);
}

/**
 * Dispatcher principal
 */
function handleRequest(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var action = data.action;
  var result;

  try {
    ensureSheetsAndHeaders_(ss);

    switch (action) {
      /* PRODUCTOS */
      case 'agregar_producto':
        result = agregarProducto(ss, data);
        break;
      case 'obtener_producto':
        result = obtenerProducto(ss, data);
        break;
      case 'listar_productos':
        result = listarProductos(ss);
        break;
      case 'actualizar_producto':
        result = actualizarProducto(ss, data);
        break;
      case 'eliminar_producto':
        result = eliminarProducto(ss, data);
        break;

      /* FOTOS */
      case 'agregar_fotos_producto':
        result = agregarFotosProducto(ss, data);
        break;
      case 'obtener_fotos_producto':
        result = obtenerFotosProducto(ss, data);
        break;
      case 'eliminar_foto_producto':
        result = eliminarFotoProducto(ss, data);
        break;
      case 'reemplazar_fotos_producto':
        result = reemplazarFotosProducto(ss, data);
        break;

      /* HOME */
      case 'listar_fotos_home':
        result = listarFotosHome(ss, data);
        break;
      case 'agregar_fotos_home':
        result = agregarFotosHome(ss, data);
        break;
      case 'actualizar_foto_home':
        result = actualizarFotoHome(ss, data);
        break;
      case 'eliminar_foto_home':
        result = eliminarFotoHome(ss, data);
        break;
      case 'actualizar_config_home':
        result = actualizarConfigHome(ss, data);
        break;

      default:
        result = { status: 'error', message: 'Action no válida' };
    }
  } catch (e) {
    result = { status: 'error', message: e.message };
  }

  return json(result);
}

/* =========================================================
   PRODUCTOS
========================================================= */

function agregarProducto(ss, data) {
  var shProd = ss.getSheetByName(SHEET_PRODUCTOS);

  var idProducto = data.id_producto || generarIdProducto_();
  var nombre = valueOrEmpty_(data.nombre);
  var tipoProducto = valueOrEmpty_(data.tipo_de_producto);
  var categoria = valueOrEmpty_(data.categoria);
  var precio = toNumberOrEmpty_(data.precio);
  var descuentoPromocion = parseBoolean_(data.descuento_por_promocion);
  var porcentajePromocion = toNumberOrEmpty_(data.porcentaje_de_promocion);
  var descripcion = valueOrEmpty_(data.descripcion);

  if (!nombre) {
    return { status: 'error', message: 'El campo nombre es obligatorio' };
  }

  if (buscarFilaProductoPorId_(shProd, idProducto) !== -1) {
    return { status: 'error', message: 'Ya existe un producto con ese ID' };
  }

  // 1) Primero crear el producto con Fotos vacío
  shProd.appendRow([
    idProducto,
    nombre,
    tipoProducto,
    categoria,
    precio,
    descuentoPromocion,
    porcentajePromocion,
    descripcion,
    ''
  ]);

  // 2) Luego guardar las fotos, si existen
  var idsFotos = [];
  if (data.fotos && Array.isArray(data.fotos) && data.fotos.length > 0) {
    idsFotos = guardarMultiplesFotos_(ss, idProducto, data.fotos);
  }

  // 3) Finalmente actualizar columna Fotos del producto
  actualizarCampoFotosProducto_(ss, idProducto);

  return {
    status: 'success',
    message: 'Producto agregado correctamente',
    id_producto: idProducto,
    fotos_ids: idsFotos
  };
}

function obtenerProducto(ss, data) {
  var shProd = ss.getSheetByName(SHEET_PRODUCTOS);
  var shFotos = ss.getSheetByName(SHEET_FOTOS);

  var idProducto = data.id_producto;
  if (!idProducto) {
    return { status: 'error', message: 'Falta id_producto' };
  }

  var fila = buscarFilaProductoPorId_(shProd, idProducto);
  if (fila === -1) {
    return { status: 'error', message: 'Producto no encontrado' };
  }

  var row = shProd.getRange(fila, 1, 1, 9).getValues()[0];
  var producto = {
    id_producto: row[0],
    nombre: row[1],
    tipo_de_producto: row[2],
    categoria: row[3],
    precio: row[4],
    descuento_por_promocion: row[5],
    porcentaje_de_promocion: row[6],
    descripcion: row[7],
    fotos_ids: row[8] ? String(row[8]).split(',').map(trimSafe_).filter(String) : []
  };

  producto.fotos = obtenerFotosPorProducto_(shFotos, idProducto);

  return {
    status: 'success',
    producto: producto
  };
}

function listarProductos(ss) {
  var shProd = ss.getSheetByName(SHEET_PRODUCTOS);
  var shFotos = ss.getSheetByName(SHEET_FOTOS);

  var data = shProd.getDataRange().getValues();
  if (data.length <= 1) {
    return { status: 'success', total: 0, productos: [] };
  }

  var rows = data.slice(1);
  var productos = rows.map(function(r) {
    var idProducto = r[0];
    return {
      id_producto: r[0],
      nombre: r[1],
      tipo_de_producto: r[2],
      categoria: r[3],
      precio: r[4],
      descuento_por_promocion: r[5],
      porcentaje_de_promocion: r[6],
      descripcion: r[7],
      fotos_ids: r[8] ? String(r[8]).split(',').map(trimSafe_).filter(String) : [],
      fotos: obtenerFotosPorProducto_(shFotos, idProducto)
    };
  });

  return {
    status: 'success',
    total: productos.length,
    productos: productos
  };
}

function actualizarProducto(ss, data) {
  var shProd = ss.getSheetByName(SHEET_PRODUCTOS);

  var idProducto = data.id_producto;
  if (!idProducto) {
    return { status: 'error', message: 'Falta id_producto' };
  }

  var fila = buscarFilaProductoPorId_(shProd, idProducto);
  if (fila === -1) {
    return { status: 'error', message: 'Producto no encontrado' };
  }

  if (data.nombre !== undefined) {
    shProd.getRange(fila, 2).setValue(data.nombre);
  }
  if (data.tipo_de_producto !== undefined) {
    shProd.getRange(fila, 3).setValue(data.tipo_de_producto);
  }
  if (data.categoria !== undefined) {
    shProd.getRange(fila, 4).setValue(data.categoria);
  }
  if (data.precio !== undefined) {
    shProd.getRange(fila, 5).setValue(toNumberOrEmpty_(data.precio));
  }
  if (data.descuento_por_promocion !== undefined) {
    shProd.getRange(fila, 6).setValue(parseBoolean_(data.descuento_por_promocion));
  }
  if (data.porcentaje_de_promocion !== undefined) {
    shProd.getRange(fila, 7).setValue(toNumberOrEmpty_(data.porcentaje_de_promocion));
  }
  if (data.descripcion !== undefined) {
    shProd.getRange(fila, 8).setValue(data.descripcion);
  }

  return {
    status: 'success',
    message: 'Producto actualizado correctamente',
    id_producto: idProducto
  };
}

function eliminarProducto(ss, data) {
  var shProd = ss.getSheetByName(SHEET_PRODUCTOS);

  var idProducto = data.id_producto;
  if (!idProducto) {
    return { status: 'error', message: 'Falta id_producto' };
  }

  var fila = buscarFilaProductoPorId_(shProd, idProducto);
  if (fila === -1) {
    return { status: 'error', message: 'Producto no encontrado' };
  }

  eliminarTodasLasFotosDelProducto_(ss, idProducto);
  shProd.deleteRow(fila);

  return {
    status: 'success',
    message: 'Producto y sus fotos eliminados correctamente',
    id_producto: idProducto
  };
}

/* =========================================================
   FOTOS
========================================================= */

function agregarFotosProducto(ss, data) {
  var shProd = ss.getSheetByName(SHEET_PRODUCTOS);

  var idProducto = data.id_producto;
  if (!idProducto) {
    return { status: 'error', message: 'Falta id_producto' };
  }

  var filaProd = buscarFilaProductoPorId_(shProd, idProducto);
  if (filaProd === -1) {
    return { status: 'error', message: 'Producto no encontrado' };
  }

  if (!data.fotos || !Array.isArray(data.fotos) || data.fotos.length === 0) {
    return { status: 'error', message: 'Debes enviar el arreglo fotos' };
  }

  var nuevosIds = guardarMultiplesFotos_(ss, idProducto, data.fotos);
  actualizarCampoFotosProducto_(ss, idProducto);

  return {
    status: 'success',
    message: 'Fotos agregadas correctamente',
    id_producto: idProducto,
    fotos_ids_agregadas: nuevosIds
  };
}

function obtenerFotosProducto(ss, data) {
  var shProd = ss.getSheetByName(SHEET_PRODUCTOS);
  var shFotos = ss.getSheetByName(SHEET_FOTOS);

  var idProducto = data.id_producto;
  if (!idProducto) {
    return { status: 'error', message: 'Falta id_producto' };
  }

  var filaProd = buscarFilaProductoPorId_(shProd, idProducto);
  if (filaProd === -1) {
    return { status: 'error', message: 'Producto no encontrado' };
  }

  var fotos = obtenerFotosPorProducto_(shFotos, idProducto);

  return {
    status: 'success',
    id_producto: idProducto,
    total: fotos.length,
    fotos: fotos
  };
}

function eliminarFotoProducto(ss, data) {
  var shFotos = ss.getSheetByName(SHEET_FOTOS);

  var idProducto = data.id_producto;
  var idFoto = data.id_foto;

  if (!idProducto) {
    return { status: 'error', message: 'Falta id_producto' };
  }
  if (!idFoto) {
    return { status: 'error', message: 'Falta id_foto' };
  }

  var dataFotos = shFotos.getDataRange().getValues();
  var idx = dataFotos.slice(1).findIndex(function(r) {
    return String(r[0]) === String(idFoto) && String(r[2]) === String(idProducto);
  });

  if (idx === -1) {
    return { status: 'error', message: 'Foto no encontrada para ese producto' };
  }

  shFotos.deleteRow(idx + 2);
  actualizarCampoFotosProducto_(ss, idProducto);

  return {
    status: 'success',
    message: 'Foto eliminada correctamente',
    id_producto: idProducto,
    id_foto: idFoto
  };
}

function reemplazarFotosProducto(ss, data) {
  var shProd = ss.getSheetByName(SHEET_PRODUCTOS);

  var idProducto = data.id_producto;
  if (!idProducto) {
    return { status: 'error', message: 'Falta id_producto' };
  }

  var filaProd = buscarFilaProductoPorId_(shProd, idProducto);
  if (filaProd === -1) {
    return { status: 'error', message: 'Producto no encontrado' };
  }

  if (!data.fotos || !Array.isArray(data.fotos)) {
    return { status: 'error', message: 'Debes enviar el arreglo fotos' };
  }

  eliminarTodasLasFotosDelProducto_(ss, idProducto);
  var nuevosIds = guardarMultiplesFotos_(ss, idProducto, data.fotos);
  actualizarCampoFotosProducto_(ss, idProducto);

  return {
    status: 'success',
    message: 'Fotos reemplazadas correctamente',
    id_producto: idProducto,
    fotos_ids: nuevosIds
  };
}

/* =========================================================
   FOTOS HOME
========================================================= */

function listarFotosHome(ss, data) {
  var shHome = ss.getSheetByName(SHEET_FOTOS_HOME);
  var soloActivas = parseBoolean_(data.solo_activas);
  var rows = shHome.getDataRange().getValues();
  var heroConfig = obtenerConfigHome_(ss);

  if (rows.length <= 1) {
    return { status: 'success', total: 0, hero_fotos: [], hero_config: heroConfig };
  }

  var fotos = rows.slice(1).map(function(r) {
    return {
      id_foto: String(r[0] || ''),
      foto: String(r[1] || ''),
      orden: toNumberSafe_(r[2]),
      activo: parseBoolean_(r[3]),
      position_x: toNumberWithDefault_(r[4], 50),
      position_y: toNumberWithDefault_(r[5], 50)
    };
  }).sort(function(a, b) {
    if (a.orden !== b.orden) return a.orden - b.orden;
    return String(a.id_foto).localeCompare(String(b.id_foto));
  });

  if (soloActivas) {
    fotos = fotos.filter(function(f) { return f.activo; });
  }

  return {
    status: 'success',
    total: fotos.length,
    hero_fotos: fotos,
    hero_config: heroConfig
  };
}

function agregarFotosHome(ss, data) {
  var shHome = ss.getSheetByName(SHEET_FOTOS_HOME);

  if (!data.fotos || !Array.isArray(data.fotos) || data.fotos.length === 0) {
    return { status: 'error', message: 'Debes enviar el arreglo fotos' };
  }

  var rows = shHome.getDataRange().getValues();
  var maxOrden = 0;

  if (rows.length > 1) {
    maxOrden = rows.slice(1).reduce(function(max, row) {
      return Math.max(max, toNumberSafe_(row[2]));
    }, 0);
  }

  var idsFotos = [];

  data.fotos.forEach(function(fotoObj, i) {
    var base64Data = fotoObj.base64Data || fotoObj.base64 || fotoObj.imagen_base64;
    var fileName = fotoObj.fileName || fotoObj.nombre_archivo || ('home_' + Date.now() + '_' + (i + 1));

    if (!base64Data) {
      throw new Error('Una de las fotos del home no contiene base64Data');
    }

    var fotoLimpia = limpiarBase64_(base64Data);
    var fotoUrl = uploadToImgurBase64_(fotoLimpia, fileName);
    var idFoto = fotoObj.id_foto || generarIdFoto_();
    var orden = fotoObj.orden !== undefined ? toNumberSafe_(fotoObj.orden) : (maxOrden + i + 1);
    var activo = fotoObj.activo === undefined ? true : parseBoolean_(fotoObj.activo);
    var positionX = toNumberWithDefault_(fotoObj.position_x, 50);
    var positionY = toNumberWithDefault_(fotoObj.position_y, 50);

    shHome.appendRow([
      idFoto,
      fotoUrl,
      orden,
      activo,
      positionX,
      positionY
    ]);

    idsFotos.push(idFoto);
  });

  return {
    status: 'success',
    message: 'Fotos del home agregadas correctamente',
    fotos_ids_agregadas: idsFotos
  };
}

function actualizarFotoHome(ss, data) {
  var shHome = ss.getSheetByName(SHEET_FOTOS_HOME);
  var idFoto = data.id_foto;

  if (!idFoto) {
    return { status: 'error', message: 'Falta id_foto' };
  }

  var fila = buscarFilaHomePorId_(shHome, idFoto);
  if (fila === -1) {
    return { status: 'error', message: 'Foto del home no encontrada' };
  }

  if (data.orden !== undefined) {
    shHome.getRange(fila, 3).setValue(toNumberSafe_(data.orden));
  }
  if (data.activo !== undefined) {
    shHome.getRange(fila, 4).setValue(parseBoolean_(data.activo));
  }
  if (data.position_x !== undefined) {
    shHome.getRange(fila, 5).setValue(toNumberWithDefault_(data.position_x, 50));
  }
  if (data.position_y !== undefined) {
    shHome.getRange(fila, 6).setValue(toNumberWithDefault_(data.position_y, 50));
  }

  return {
    status: 'success',
    message: 'Foto del home actualizada correctamente',
    id_foto: idFoto
  };
}

function eliminarFotoHome(ss, data) {
  var shHome = ss.getSheetByName(SHEET_FOTOS_HOME);
  var idFoto = data.id_foto;

  if (!idFoto) {
    return { status: 'error', message: 'Falta id_foto' };
  }

  var fila = buscarFilaHomePorId_(shHome, idFoto);
  if (fila === -1) {
    return { status: 'error', message: 'Foto del home no encontrada' };
  }

  shHome.deleteRow(fila);

  return {
    status: 'success',
    message: 'Foto del home eliminada correctamente',
    id_foto: idFoto
  };
}

function actualizarConfigHome(ss, data) {
  var aspectRatio = valueOrEmpty_(data.aspect_ratio) || '4:5';
  setConfigHomeValue_(ss, 'aspect_ratio', aspectRatio);

  return {
    status: 'success',
    message: 'Configuración del home actualizada correctamente',
    hero_config: obtenerConfigHome_(ss)
  };
}

/* =========================================================
   HELPERS DE NEGOCIO
========================================================= */

function guardarMultiplesFotos_(ss, idProducto, fotos) {
  var shFotos = ss.getSheetByName(SHEET_FOTOS);
  var idsFotos = [];

  fotos.forEach(function(fotoObj, i) {
    var base64Data = fotoObj.base64Data || fotoObj.base64 || fotoObj.imagen_base64;
    var fileName = fotoObj.fileName || fotoObj.nombre_archivo || ('producto_' + idProducto + '_' + (i + 1) + '_' + Date.now());

    if (!base64Data) {
      throw new Error('Una de las fotos no contiene base64Data');
    }

    var fotoLimpia = limpiarBase64_(base64Data);
    var fotoUrl = uploadToImgurBase64_(fotoLimpia, fileName);
    var idFoto = fotoObj.id_foto || generarIdFoto_();

    shFotos.appendRow([
      idFoto,
      fotoUrl,
      idProducto
    ]);

    idsFotos.push(idFoto);
  });

  return idsFotos;
}

function actualizarCampoFotosProducto_(ss, idProducto) {
  var shProd = ss.getSheetByName(SHEET_PRODUCTOS);
  var shFotos = ss.getSheetByName(SHEET_FOTOS);

  var filaProd = buscarFilaProductoPorId_(shProd, idProducto);
  if (filaProd === -1) {
    throw new Error('Producto no encontrado al actualizar el campo Fotos');
  }

  var fotos = obtenerFotosPorProducto_(shFotos, idProducto);
  var ids = fotos.map(function(f) { return f.id_foto; });

  shProd.getRange(filaProd, 9).setValue(ids.join(','));
}

function obtenerFotosPorProducto_(shFotos, idProducto) {
  var data = shFotos.getDataRange().getValues();
  if (data.length <= 1) return [];

  return data.slice(1)
    .filter(function(r) { return String(r[2]) === String(idProducto); })
    .map(function(r) {
      return {
        id_foto: r[0],
        foto: r[1],
        id_producto: r[2]
      };
    });
}

function eliminarTodasLasFotosDelProducto_(ss, idProducto) {
  var shFotos = ss.getSheetByName(SHEET_FOTOS);
  var data = shFotos.getDataRange().getValues();

  if (data.length <= 1) {
    return;
  }

  for (var i = data.length; i >= 2; i--) {
    if (String(data[i - 1][2]) === String(idProducto)) {
      shFotos.deleteRow(i);
    }
  }

  var shProd = ss.getSheetByName(SHEET_PRODUCTOS);
  var filaProd = buscarFilaProductoPorId_(shProd, idProducto);
  if (filaProd !== -1) {
    shProd.getRange(filaProd, 9).setValue('');
  }
}

function buscarFilaProductoPorId_(sheet, idProducto) {
  var data = sheet.getDataRange().getValues();
  var idx = data.slice(1).findIndex(function(r) {
    return String(r[0]) === String(idProducto);
  });
  return idx === -1 ? -1 : idx + 2;
}

function buscarFilaHomePorId_(sheet, idFoto) {
  var data = sheet.getDataRange().getValues();
  var idx = data.slice(1).findIndex(function(r) {
    return String(r[0]) === String(idFoto);
  });
  return idx === -1 ? -1 : idx + 2;
}

function obtenerConfigHome_(ss) {
  return {
    aspect_ratio: getConfigHomeValue_(ss, 'aspect_ratio', '4:5')
  };
}

function getConfigHomeValue_(ss, key, defaultValue) {
  var sheet = ss.getSheetByName(SHEET_CONFIG_HOME);
  var data = sheet.getDataRange().getValues();

  if (data.length <= 1) return defaultValue;

  var row = data.slice(1).find(function(r) {
    return String(r[0]) === String(key);
  });

  return row && row[1] !== undefined && row[1] !== '' ? String(row[1]) : defaultValue;
}

function setConfigHomeValue_(ss, key, value) {
  var sheet = ss.getSheetByName(SHEET_CONFIG_HOME);
  var data = sheet.getDataRange().getValues();
  var idx = data.slice(1).findIndex(function(r) {
    return String(r[0]) === String(key);
  });

  if (idx === -1) {
    sheet.appendRow([key, value]);
    return;
  }

  sheet.getRange(idx + 2, 2).setValue(value);
}

/* =========================================================
   HELPERS GENERALES
========================================================= */

function ensureSheetsAndHeaders_(ss) {
  var shProd = ss.getSheetByName(SHEET_PRODUCTOS);
  if (!shProd) {
    shProd = ss.insertSheet(SHEET_PRODUCTOS);
  }

  var shFotos = ss.getSheetByName(SHEET_FOTOS);
  if (!shFotos) {
    shFotos = ss.insertSheet(SHEET_FOTOS);
  }

  var shHome = ss.getSheetByName(SHEET_FOTOS_HOME);
  if (!shHome) {
    shHome = ss.insertSheet(SHEET_FOTOS_HOME);
  }

  var shConfigHome = ss.getSheetByName(SHEET_CONFIG_HOME);
  if (!shConfigHome) {
    shConfigHome = ss.insertSheet(SHEET_CONFIG_HOME);
  }

  var expectedProd = [
    'ID de Producto',
    'Nombre',
    'Tipo de Producto',
    'Categoría',
    'Precio',
    'Descuento por promoción',
    '% de promoción',
    'Descripción',
    'Fotos'
  ];

  var expectedFotos = [
    'ID Foto',
    'Foto',
    'ID Producto'
  ];

  var expectedFotosHome = [
    'ID Foto',
    'Foto',
    'Orden',
    'Activo',
    'Posición X',
    'Posición Y'
  ];

  var expectedConfigHome = [
    'Clave',
    'Valor'
  ];

  ensureHeaders_(shProd, expectedProd);
  ensureHeaders_(shFotos, expectedFotos);
  ensureHeaders_(shHome, expectedFotosHome);
  ensureHeaders_(shConfigHome, expectedConfigHome);
  ensureDefaultConfigHome_(shConfigHome);
}

function ensureHeaders_(sheet, expectedHeaders) {
  var lastCol = sheet.getLastColumn();
  var current = lastCol > 0
    ? sheet.getRange(1, 1, 1, Math.max(lastCol, expectedHeaders.length)).getValues()[0]
    : [];

  var isEmpty = current.join('').trim() === '';
  if (isEmpty) {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    return;
  }

  var normalizedCurrent = current.slice(0, expectedHeaders.length).map(normalizeHeader_);
  var normalizedExpected = expectedHeaders.map(normalizeHeader_);

  var ok = normalizedExpected.every(function(h, i) {
    return normalizedCurrent[i] === h;
  });

  if (!ok) {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
  }
}

function normalizeHeader_(h) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[áà]/g, 'a')
    .replace(/[éè]/g, 'e')
    .replace(/[íì]/g, 'i')
    .replace(/[óò]/g, 'o')
    .replace(/[úù]/g, 'u');
}

function valueOrEmpty_(v) {
  return v === undefined || v === null ? '' : v;
}

function toNumberOrEmpty_(v) {
  if (v === undefined || v === null || v === '') return '';
  var n = Number(v);
  return isNaN(n) ? '' : n;
}

function toNumberSafe_(v) {
  var n = Number(v);
  return isNaN(n) ? 0 : n;
}

function toNumberWithDefault_(v, defaultValue) {
  if (v === undefined || v === null || v === '') return defaultValue;
  var n = Number(v);
  return isNaN(n) ? defaultValue : n;
}

function parseBoolean_(v) {
  if (v === true || v === 'true' || v === 'TRUE' || v === 'True' || v === 1 || v === '1') return true;
  if (v === false || v === 'false' || v === 'FALSE' || v === 'False' || v === 0 || v === '0') return false;
  return false;
}

function trimSafe_(s) {
  return String(s || '').trim();
}

function limpiarBase64_(base64Data) {
  var s = String(base64Data || '').trim();
  if (s.indexOf('base64,') !== -1) {
    return s.split('base64,')[1];
  }
  return s;
}

function generarIdProducto_() {
  return 'PROD-' + new Date().getTime();
}

function generarIdFoto_() {
  return 'FOTO-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
}

function ensureDefaultConfigHome_(sheet) {
  var data = sheet.getDataRange().getValues();
  var hasAspect = data.slice(1).some(function(r) {
    return String(r[0]) === 'aspect_ratio';
  });

  if (!hasAspect) {
    sheet.appendRow(['aspect_ratio', '4:5']);
  }
}

function json(o) {
  return ContentService
    .createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

/* =========================================================
   IMGUR
========================================================= */

function ensureImgurToken() {
  var props = PropertiesService.getScriptProperties();

  if (!props.getProperty('IMGUR_CLIENT_ID')) {
    props.setProperty('IMGUR_CLIENT_ID', IMGUR_CLIENT_ID);
    props.setProperty('IMGUR_CLIENT_SECRET', IMGUR_CLIENT_SECRET);
    props.setProperty('IMGUR_ACCESS_TOKEN', IMGUR_ACCESS_TOKEN);
    props.setProperty('IMGUR_REFRESH_TOKEN', IMGUR_REFRESH_TOKEN);
    props.setProperty('IMGUR_EXPIRES_UNIX', IMGUR_EXPIRES_UNIX.toString());
  }

  var accessToken = props.getProperty('IMGUR_ACCESS_TOKEN');
  var refreshToken = props.getProperty('IMGUR_REFRESH_TOKEN');
  var expUnix = Number(props.getProperty('IMGUR_EXPIRES_UNIX') || 0);
  var now = Math.floor(Date.now() / 1000) + 120;

  if (expUnix > now) return accessToken;

  var res = UrlFetchApp.fetch('https://api.imgur.com/oauth2/token', {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: {
      refresh_token: refreshToken,
      client_id: props.getProperty('IMGUR_CLIENT_ID'),
      client_secret: props.getProperty('IMGUR_CLIENT_SECRET'),
      grant_type: 'refresh_token'
    }
  });

  var j = JSON.parse(res.getContentText());
  if (!j.access_token) {
    throw new Error('No se pudo refrescar token Imgur: ' + res.getContentText());
  }

  accessToken = j.access_token;
  refreshToken = j.refresh_token;
  expUnix = Math.floor(Date.now() / 1000) + j.expires_in;

  props.setProperty('IMGUR_ACCESS_TOKEN', accessToken);
  props.setProperty('IMGUR_REFRESH_TOKEN', refreshToken);
  props.setProperty('IMGUR_EXPIRES_UNIX', expUnix.toString());

  return accessToken;
}

function uploadToImgurBase64_(base64Data, fileName) {
  var token = ensureImgurToken();

  var resp = UrlFetchApp.fetch('https://api.imgur.com/3/image', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + token },
    payload: {
      image: base64Data,
      type: 'base64',
      name: fileName || ('foto_' + Date.now())
    },
    muteHttpExceptions: true
  });

  var code = resp.getResponseCode();
  if (code !== 200) {
    throw new Error('Imgur HTTP ' + code + ': ' + resp.getContentText());
  }

  var j = JSON.parse(resp.getContentText());
  if (!j || !j.data || !j.data.link) {
    throw new Error('Respuesta inválida de Imgur: ' + resp.getContentText());
  }

  return j.data.link;
}

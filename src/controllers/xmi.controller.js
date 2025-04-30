const fs = require('fs');
delete require.cache[require.resolve('../utils/xmi-parser')];
const { parseXMI_LIMPIO } = require('../utils/xmi-parser');


// en xmi.controller.js
exports.analizarXMI = async (req, res) => {
    
    try {
      const archivoPath = req.file.path;
      const xml = fs.readFileSync(archivoPath, 'utf-8');
      const resultado = parseXMI_LIMPIO(xml);
      
      console.log('🎯 Resultado procesado:', JSON.stringify(resultado, null, 2)); // <-- clave
      res.json({
        clases: resultado.clases,
        relaciones: resultado.relaciones
      });
      
    } catch (error) {
      console.error('[ERROR XMI]', error);
      res.status(500).json({ error: 'No se pudo procesar el XMI' });
    }
  };
  

const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  allowBooleanAttributes: true
});

function parseXMI_LIMPIO(xml) {
  const parsed = parser.parse(xml);
  const root = parsed['xmi:XMI'] || parsed.XMI || parsed;
  const ext = root['xmi:Extension'] || root.Extension || {};

  const elements = toArray(ext.elements?.element);
  const connectors = toArray(ext.connectors?.connector);

  const clases = [];
  const relacionesCrudas = [];
  const relacionesLimpias = [];
  const id2name = {};

  // ✅ CLASES
  for (const el of elements) {
    let type = el.type || el['xmi:type'];
    let name = el.name;

    if (!type || !name) {
      const model = el.model || {};
      type = type || model.type;
      name = name || model.name;
    }

    if ((type === 'uml:Class' || type === 'Class') && name) {
      const attrs = toArray(el.attributes?.attribute).map(a => ({
        nombre: a.name,
        tipo: (a.type || '').includes('int') ? 'number' : 'string'
      }));

      clases.push({ nombre: name, atributos: attrs });

      const id = el.id || el.idref || el['xmi:idref'];
      if (id) id2name[id] = name;
    }
  }

  // ✅ RELACIONES CRUDAS COMPLETAS
  for (const c of connectors) {
    relacionesCrudas.push({
      origen: c.end1 || c.source || {},
      destino: c.end2 || c.target || {},
      multiplicidadOrigen: c.end1?.type?.multiplicity || '1',
      multiplicidadDestino: c.end2?.type?.multiplicity || '1'
    });
  }

  relacionesCrudas.forEach((rel, i) => {
    const origenNombre = rel.origen?.model?.name || '(sin nombre)';
    const destinoNombre = rel.destino?.model?.name || '(sin nombre)';
    const multOrigen = rel.origen?.type?.multiplicity || '(sin multiplicidad)';
    const multDestino = rel.destino?.type?.multiplicity || '(sin multiplicidad)';

    relacionesLimpias.push({
      origen: origenNombre,
      destino: destinoNombre,
      multiplicidadOrigen: multOrigen,
      multiplicidadDestino: multDestino
    });
  });

  return {
    clases,
    relaciones: relacionesLimpias
  };
}

// 🔧 Utilidades
function toArray(x) {
  return Array.isArray(x) ? x : (x ? [x] : []);
}

module.exports = { parseXMI_LIMPIO };

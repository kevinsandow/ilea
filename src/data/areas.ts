import type { Area, AreaId } from '../types';

export const AREAS: Record<AreaId, Area> = {
  'ma-zahlen-auffassen': { id: 'ma-zahlen-auffassen', subject: 'mathe', label: 'Zahlen auffassen und darstellen' },
  'ma-zahlen-ordnen': { id: 'ma-zahlen-ordnen', subject: 'mathe', label: 'Zahlen ordnen und vergleichen' },
  'ma-zahlbeziehungen': { id: 'ma-zahlbeziehungen', subject: 'mathe', label: 'Zahlbeziehungen (Zahlzerlegungen)' },
  'ma-operationen': { id: 'ma-operationen', subject: 'mathe', label: 'Operationsvorstellungen (Rechengeschichten)' },
  'ma-rechenstrategien': { id: 'ma-rechenstrategien', subject: 'mathe', label: 'Rechenstrategien (kleines 1 ± 1)' },
  'de-phonologische-bewusstheit': { id: 'de-phonologische-bewusstheit', subject: 'deutsch', label: 'Phonologische Bewusstheit (Silben)' },
  'de-lesefluessigkeit': { id: 'de-lesefluessigkeit', subject: 'deutsch', label: 'Leseflüssigkeit' },
  'de-leseverstaendnis': { id: 'de-leseverstaendnis', subject: 'deutsch', label: 'Leseverständnis' },
  'de-rechtschreiben': { id: 'de-rechtschreiben', subject: 'deutsch', label: 'Rechtschreiben' },
};

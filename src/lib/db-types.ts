// Type definitions voor database responses

export type OpnameType = 'basis' | 'geavanceerd';
export type OpnameStatus = 'in_progress' | 'completed' | 'archived';

export type SectieNaamBasis = 
  | 'algemeen'
  | 'verwarmingssysteem'
  | 'warmTapwater'
  | 'ventilatie'
  | 'verlichting'
  | 'airconditioning'
  | 'zonwering'
  | 'gebouwmanagement';

export type SectieNaamGeavanceerd =
  | 'algemeen'
  | 'ruimtetypes'
  | 'distributie'
  | 'opwekking'
  | 'systeem'
  | 'details'
  | 'afronden';

export type GebouwType = 
  | 'kantoor'
  | 'winkel'
  | 'school'
  | 'ziekenhuis'
  | 'hotel'
  | 'wooncomplex'
  | 'industrieel'
  | 'ander';

export type Energielabel = 
  | 'A+++'
  | 'A++'
  | 'A+'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'onbekend';


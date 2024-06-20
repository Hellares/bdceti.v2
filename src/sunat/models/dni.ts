export interface DniResponse {
  status:  number;
  message: string;
  data:    Data;
  fuente:  number;
}

export interface Data {
  numero:             string;
  nombres:            string;
  apellido_paterno:   string;
  apellido_materno:   string;
  nombre_completo:    string;
  departamento:       string;
  provincia:          string;
  distrito:           string;
  direccion:          string;
  direccion_completa: string;
  ubigeo_reniec:      string;
  ubigeo_sunat:       string;
  ubigeo:             string[];
  fecha_nacimiento:   string;
  estado_civil:       string;
  foto:               string;
  sexo:               string;
}
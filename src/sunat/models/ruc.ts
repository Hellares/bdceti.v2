export interface RucResponse {
  status:  number;
  message: string;
  data:    Data;
}

export interface Data {
  numero:                string;
  nombre_o_razon_social: string;
  tipo_contribuyente:    string;
  estado:                string;
  condicion:             string;
  departamento:          string;
  provincia:             string;
  distrito:              string;
  direccion:             string;
  direccion_completa:    string;
  ubigeo_sunat:          string;
  ubigeo:                string[];
}

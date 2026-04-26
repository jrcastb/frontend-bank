export type ClientGender = 'MASCULINO' | 'FEMENINO' | 'OTRO';

export interface ClientResponse {
  id: number;
  nombre: string;
  genero: ClientGender;
  edad: number;
  identificacion: string;
  direccion: string;
  telefono: string;
  estado: boolean;
}

export interface ClientUpsertRequest {
  nombre: string;
  genero: ClientGender;
  edad: number;
  identificacion: string;
  direccion: string;
  telefono: string;
  contrasena: string;
  estado: boolean;
}

export interface ClientPatchRequest {
  nombre?: string;
  genero?: ClientGender;
  edad?: number;
  identificacion?: string;
  direccion?: string;
  telefono?: string;
  contrasena?: string;
  estado?: boolean;
}

export interface ClientFormValue {
  id: number | null;
  nombre: string;
  genero: ClientGender;
  edad: string;
  identificacion: string;
  direccion: string;
  telefono: string;
  contrasena: string;
  estado: boolean;
}

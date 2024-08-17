import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosResponse, AxiosError } from 'axios';
import { catchError, map, Observable } from 'rxjs';
import { DniResponse } from './models/dni';
import { API_DNI, API_RUC, TOKENSUNAT_HEADERS } from './constants';
import { RucResponse } from './models/ruc';

@Injectable()
export class SunatService {
  constructor(private readonly httpService: HttpService){}

  getDniInfo(dni: string): Observable<AxiosResponse<DniResponse>> {
    const apiUrl = `${API_DNI}${dni}`;
    return this.httpService.get(apiUrl, {headers: {Authorization:'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMzciLCJuYW1lIjoianRvcnJlcyIsImVtYWlsIjoiaGVsbGFyZXM5OEBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJjb25zdWx0b3IifQ.1NM6FG7X1D11yNB4zvo6ljVHXj1W6Uo2QFejUhQNnOk'}}).pipe(
      map(response => response.data),
      catchError(error => {
        throw new HttpException(error.response?.data, error.response?.status);
      })
    );
  }

  getRucInfo(ruc: string): Observable<AxiosResponse<RucResponse>> {
    const apiUrl = `${API_RUC}${ruc}`;
    return this.httpService.get(apiUrl, {headers: {Authorization:'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMzciLCJuYW1lIjoianRvcnJlcyIsImVtYWlsIjoiaGVsbGFyZXM5OEBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJjb25zdWx0b3IifQ.1NM6FG7X1D11yNB4zvo6ljVHXj1W6Uo2QFejUhQNnOk'}}).pipe(
      map(response => response.data),
      catchError(error => {
        throw new HttpException(error.response?.data, error.response?.status);
      })
    );
  }
}

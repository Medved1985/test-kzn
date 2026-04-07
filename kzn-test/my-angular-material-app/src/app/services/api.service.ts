import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PushData } from '../push-modal/push-modal.component';

export interface Client {
  user_id: number;
  template: string;
  fio: string;
  first_name: string;
  last_name: string;
  pat_name: string;
  phone: string;
  city: string | null;
  sms_verify: string | null;
  email: string | null;
  birthday: string | null;
  gender: string | null;
  car_number: string | null;
  discount: number | null;
  bonus: number;
  inactive_bonus: number | null;
  bonus_last: number | null;
  write_off_last: number | null;
  loyalty_level: string | null;
  summ: number | null;
  summ_all: number | null;
  summ_last: number | null;
  visits: number | null;
  visits_all: number | null;
  date_last: string | null;
  barcode: string;
  key1: string | null;
  key2: string | null;
  key3: string | null;
  key4: string | null;
  key5: string | null;
  key6: string | null;
  trg_action_type: string | null;
  trg_action_value: string | null;
  trg_date_type: string | null;
  trg_date_value: string | null;
  delivery_form: string | null;
  o_s: string;
  link: string;
  referal: string | null;
  backgroundColor: string | null;
  created_at: string;
  H1: string | null;
  H2: string | null;
  H3: string | null;
  S1: string | null;
  S2: string | null;
  S3: string | null;
  B1: string | null;
  B2: string | null;
  B3: string | null;
  B4: string | null;
  B5: string | null;
  B6: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  telegram: boolean;
  confirm_code: string | null;
}

export interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private readonly API_URL = 'https://api.teyca.ru';

  constructor(private http: HttpClient) { }

  getClientById(userId: string): Observable<ApiResponse<Client>> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      throw new Error('Токен авторизации не найден');
    }

    const url = `${this.API_URL}/v1/${token}/passes/userid/${userId}`;

    return this.http.get<ApiResponse<Client>>(url, {
      headers: {
        'Authorization': `${token}`
      }
    });
  }

  getClients(params: {
    page: number;
    limit: number;
    search?: string;
    searchField?: string;
    sortField?: string;
    sortDirection?: string;
  }): Observable<ApiResponse<Client>> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      throw new Error('Токен авторизации не найден');
    }

    const offset = (params.page - 1) * params.limit;

    let httpParams = new HttpParams()
      .set('limit', params.limit.toString())
      .set('offset', offset.toString());

    if (params.search && params.searchField) {
      httpParams = httpParams
        .set('search', params.search)
        .set('searchField', params.searchField);
    }

    if (params.sortField && params.sortDirection) {
      httpParams = httpParams
        .set('sort', params.sortField)
        .set('order', params.sortDirection);
    }

    const url = `${this.API_URL}/v1/${token}/passes`;

    return this.http.get<ApiResponse<Client>>(url, {
      params: httpParams,
      headers: {
        'Authorization': `${token}`
      }
    });
  }

  sendPush(data: {
    user_id?: string;
    push_message?: string;
    date_start?: string
  }): Observable<object> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      throw new Error('Токен авторизации не найден');
    }

    const url = `${this.API_URL}/v1/${token}/message/push`;

    const body: PushData = {
      user_id: data.user_id,
      push_message: data.push_message
    };

    if (data.date_start) {
      body.date_start = data.date_start;
    }

    return this.http.post(url, body, {
      headers: {
        'Authorization': `${token}`
      }
    });
  }

}
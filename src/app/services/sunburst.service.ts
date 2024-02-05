import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SunburstService {
  constructor(private http: HttpClient) {}

  getData() {
    return this.http.get('assets/data/sunburst.json');
  }
}

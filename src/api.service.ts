import { Injectable } from '@angular/core';
import { Headers, Http, Response, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/catch';

import { AuthenticationService } from './authentication.service';
import { ConfigurationService } from './configuration.service';

export interface Status {
  loading?: boolean;
  error?: Error;
}

export interface Error {
  type: string;
  message: string;
  traceback:string[];
}

@Injectable()
export class APIService {

  public status: BehaviorSubject<Status> = new BehaviorSubject(
    { loading: false }
  );

  constructor(
    private authentication: AuthenticationService,
    private config: ConfigurationService,
    private http: Http,
  ) { }

  get(path: string): Observable<any> {
    let url = this.getFullPath(path);
    let headers = this.authentication.getHeaders();
    this.status.next({ loading: true });
    return this.http.get(url, { headers: headers }).map(res => {
      this.status.next({ loading: false });
      return res.json()
    })
    .catch(this.error.bind(this));
  }

  post(path: string, data: Object): Observable<any> {
    let url = this.getFullPath(path);
    let headers = this.authentication.getHeaders();
    this.status.next({ loading: true });
    return this.http.post(url, data, { headers: headers }).map(res => {
      this.status.next({ loading: false });
      return res.json()
    })
    .catch(this.error.bind(this));
  }

  patch(path: string, data: Object): Observable<any> {
    let url = this.getFullPath(path);
    let headers = this.authentication.getHeaders();
    this.status.next({ loading: true });
    return this.http.patch(url, data, { headers: headers }).map(res => {
      this.status.next({ loading: false });
      return res.json()
    })
    .catch(this.error.bind(this));
  }

  delete(path: string): Observable<any> {
    let url = this.getFullPath(path);
    let headers = this.authentication.getHeaders();
    this.status.next({ loading: true });
    return this.http.delete(url, { headers: headers }).map(res => {
      this.status.next({ loading: false });
      return res.json()
    })
    .catch(this.error.bind(this));
  }

  download(path: string): Observable<any> {
    let url = this.getFullPath(path);
    let headers: Headers = this.authentication.getHeaders();
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
    this.status.next({ loading: true });
    return this.http.get(url, {
      responseType: ResponseContentType.Blob,
      headers: headers
    }).map(res => {
      return new Blob([res.blob()], { type: (res as any)._body.type });
    })
    .catch(this.error.bind(this));
  }

  getFullPath(path: string): string {
    const base = this.config.get('BACKEND_URL');
    // if path is already prefixed by base, no need to prefix twice
    // if path is already a full url, and base is a local url, no need to prefix either
    if (path.startsWith(base) || (base.startsWith('/') && path.startsWith('http'))) {
      return path;
    } else {
      return base + path;
    }
  }

  private error(err: Error | Response) {
    if (err instanceof Response) {
      err = <Error>(err.json());
    }
    this.status.next({ loading: false, error: err });
    return Observable.throw(err);
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NewUserModel } from '../models/usermodel';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiServerUrl = environment.apiUrl + '/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  //set the role in localstoreag so later i can send every one in his page
  public setRoles(roles: string[]) {
    if (isPlatformBrowser(this.platformId)) {
      const rolesString = roles.join(',');
      localStorage.setItem('roles', rolesString);
      console.log (rolesString);
    }
  }

  public getRoles(): string[] {
    if (isPlatformBrowser(this.platformId)) {
      const roles = localStorage.getItem('roles');
      return roles ? roles.split(',') : [];
    }
    return [];
  }
  //
  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      // get the role from the token and pass it to the localstorage
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.router.navigate(['signin']);
  }

  authenticate({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Observable<{ token: string }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email, password };
    return this.http.post<{ token: string }>(`${this.apiServerUrl}/login`, body, {
      headers,
    });
  }

  new(user: NewUserModel) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
    };
    return this.http.post<string>(`${this.apiServerUrl}/register`, body, {
      headers,
      responseType: 'text' as 'json',
    });
  }
}

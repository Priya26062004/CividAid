import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../models/user.model';
import { Role } from '../models/role.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;//means that the apiUrl is defined in the environment.ts file. This allows us to easily switch between different API endpoints for development and production.
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getStoredUser()); //what si BehaviorSubject? It is a type of Observable that holds a value and emits it to new subscribers. In this case, it holds the current user's login response, which includes their token and role. When the user logs in or out, we update this subject so that any component that subscribes to currentUser$ will get the latest user information.
  public currentUser$ = this.currentUserSubject.asObservable(); //means that we are exposing the currentUserSubject as an Observable that components can subscribe to. This allows components to reactively get updates on the user's authentication status and role whenever it changes (e.g. after login or logout).

  constructor(private http: HttpClient, private router: Router) {}

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, request);
  }
  //what is use of pipe and tap? The pipe method is used to chain RxJS operators to the Observable returned by the HTTP request. The tap operator allows us to perform side effects (like storing the token and user info) without modifying the actual response that gets passed to subscribers. In this case, when the login HTTP request succeeds, we use tap to store the authentication token and user information in local storage and update the currentUserSubject so that any component subscribed to currentUser$ will receive the new user data.
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response));
        this.currentUserSubject.next(response);
        if (response.userId) {
          this.setUserId(response.userId);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('citizen_id');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Extracts the clean role from the login response.
   *
   * The backend's AuthService returns the Spring Security authority string
   * in the `role` field (e.g. "ROLE_CITIZEN", "ROLE_ADMINISTRATOR").
   * We strip the "ROLE_" prefix so it matches our Role enum values
   * ("CITIZEN", "ADMINISTRATOR", etc.).
   */
  getUserRole(): Role | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    // Backend login response role is "ROLE_CITIZEN", "ROLE_ADMINISTRATOR" etc.
    // Strip "ROLE_" prefix to match our frontend Role enum.
    const rawRole = user.role;
    const cleanRole = rawRole.startsWith('ROLE_') ? rawRole.substring(5) : rawRole;
    return cleanRole as Role;
  }

  hasRole(...roles: Role[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Returns a display-friendly role name.
   * e.g. "WELFARE_OFFICER" → "Welfare Officer"
   */
  getRoleDisplayName(): string {
    const role = this.getUserRole();
    if (!role) return '';
    return role.replace(/_/g, ' ').replace(/\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
  }

  setUserId(id: number): void {
    console.log('Setting userId:', id);
    localStorage.setItem('user_id', id.toString());

    const user = this.getCurrentUser();
    if (user && user.userId !== id) {
      const updated = { ...user, userId: id };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      this.currentUserSubject.next(updated);
    }
  }

  getUserId(): number | null {
    const id = localStorage.getItem('user_id');
    if (id) {
      return parseInt(id, 10);
    }

    const user = this.getCurrentUser();
    if (user?.userId) {
      this.setUserId(user.userId);
      return user.userId;
    }

    console.log('Getting userId from localStorage: null');
    return null;
  }

  setCitizenId(id: number): void {
    localStorage.setItem('citizen_id', id.toString());
  }
     
  getCitizenId(): number | null {
    const id = localStorage.getItem('citizen_id');
    return id ? parseInt(id, 10) : null;
  }

  private getStoredUser(): LoginResponse | null {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  }
}

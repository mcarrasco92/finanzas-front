import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Space } from '../../models/space';
import { environment } from '../../environment/environment';

const SPACE_KEY = 'selectedSpaceId';

@Injectable({ providedIn: 'root' })
export class SpaceService {

  private baseUrl = environment.apiUrl;

  private _activeSpace$ = new BehaviorSubject<Space | null>(null);
  activeSpace$ = this._activeSpace$.asObservable();

  private _spaces$ = new BehaviorSubject<Space[]>([]);
  spaces$ = this._spaces$.asObservable();

  constructor(private http: HttpClient) {}

  getSpaces(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/spaces`).pipe(
      tap(response => {
        if (response.coderr === '0000') {
          this._spaces$.next(response.data);
          // Restaura el espacio activo guardado en localStorage
          const savedId = localStorage.getItem(SPACE_KEY);
          if (savedId && !this._activeSpace$.value) {
            const saved = response.data.find((s: Space) => s.spaceId === savedId);
            if (saved) this._activeSpace$.next(saved);
          }
        }
      })
    );
  }

  setActiveSpace(space: Space): void {
    this._activeSpace$.next(space);
    localStorage.setItem(SPACE_KEY, space.spaceId);
  }

  activeSpaceId(): string | null {
    return this._activeSpace$.value?.spaceId ?? localStorage.getItem(SPACE_KEY);
  }

  createSpace(name: string, type: 'personal' | 'shared'): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/spaces`, { name, type });
  }

  updateSpace(spaceId: string, name: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/spaces/${spaceId}`, { name });
  }

  deleteSpace(spaceId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/spaces/${spaceId}`);
  }

  invitarUsuario(spaceId: string, email: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/spaces/${spaceId}/invitations`, { email, role });
  }

  getInvitations(spaceId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/spaces/${spaceId}/invitations`);
  }

  getMembers(spaceId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/spaces/${spaceId}/members`);
  }

  deleteMember(spaceId: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/spaces/${spaceId}/members/${userId}`);
  }

  aceptarInvitacion(code: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/invitations/accept`, { code });
  }

  clearActiveSpace(): void {
    this._activeSpace$.next(null);
    localStorage.removeItem(SPACE_KEY);
  }
}

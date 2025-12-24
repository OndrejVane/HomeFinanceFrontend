import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiEndpoints } from '@/api/api-endpoints';
import { MovementTag } from '@/pages/account/model/movement-tag.model';

@Injectable({
    providedIn: 'root'
})
export class MovementTagService {
    constructor(private http: HttpClient) {}

    getById(id: number): Observable<MovementTag> {
        return this.http.get<MovementTag>(ApiEndpoints.MovementTag.byId(id));
    }

    getAll(): Observable<MovementTag[]> {
        return this.http.get<MovementTag[]>(ApiEndpoints.MovementTag.base);
    }

    create(movementTag: MovementTag): Observable<MovementTag> {
        return this.http.post<MovementTag>(ApiEndpoints.MovementTag.base, movementTag);
    }

    update(movementTag: MovementTag): Observable<MovementTag> {
        if (movementTag.id == null) {
            throw new Error('MovementTag.id is required for update');
        }
        return this.http.put<MovementTag>(ApiEndpoints.MovementTag.byId(movementTag.id), movementTag);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(ApiEndpoints.MovementTag.byId(id));
    }
}

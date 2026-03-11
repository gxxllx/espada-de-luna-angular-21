import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiService, ApiResponse } from '../api';
import { ENDPOINTS } from '../constants/endpoints';
import { Observable, catchError, forkJoin, map, switchMap, throwError } from 'rxjs';
import { ImageS3Payload, ImageUploadResponse } from '../models/image.models';
import { ProductCreateRequest } from '../models/product.models';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly routes = ENDPOINTS.IMAGE;

  createImageUploadUrl(images: ImageS3Payload): Observable<ApiResponse<ImageUploadResponse[]>> {
    return this.api.post<ImageUploadResponse[], ImageS3Payload>(
      `${this.routes.BASE}/${this.routes.CREATE}`,
      images,
    );
  }

  uploadImagesAndHydratePayload(
    payload: ProductCreateRequest,
    filesToUpload: Array<{ index: number; file: File; name: string; type: string }>,
  ): Observable<ProductCreateRequest> {
    const requestBody: ImageS3Payload = {
      images: filesToUpload.map(({ name, type }) => ({ name, type })),
    };

    return this.createImageUploadUrl(requestBody).pipe(
      switchMap((response) => {
        const uploadTargets = this.normalizeUploadTargets(response?.data ?? response);
        if (!uploadTargets.length) {
          throw new Error('create-image no devolvio URLs de subida.');
        }

        if (uploadTargets.length < filesToUpload.length) {
          throw new Error('create-image devolvio menos URLs que imagenes a subir.');
        }

        const uploads = filesToUpload.map((entry, idx) => {
          const target = uploadTargets[idx];
          if (!target?.url || !target?.key) {
            throw new Error('Respuesta invalida de create-image: falta url o key.');
          }

          return this.uploadToPresignedUrl(target.url, entry.file, entry.name).pipe(
            map(() => {
              payload.images[entry.index].name = target.key;
            }),
          );
        });

        return forkJoin(uploads).pipe(map(() => payload));
      }),
    );
  }

  private uploadToPresignedUrl(url: string, file: File, fileName: string): Observable<void> {
    return this.http
      .put(url, file, {
        // S3 suele responder vacío o con XML; evitamos parseo JSON.
        observe: 'response',
        responseType: 'text',
      })
      .pipe(
        map(() => undefined),
        catchError((error: unknown) => {
          const httpError = error as HttpErrorResponse;

          if (httpError.status === 0) {
            return throwError(
              () =>
                new Error(
                  `Error de red/CORS subiendo ${fileName}. Revisa CORS del bucket S3 para permitir PUT desde este origen.`,
                ),
            );
          }

          const serverMessage =
            typeof httpError.error === 'string' ? httpError.error.slice(0, 200) : '';
          const suffix = serverMessage ? ` ${serverMessage}` : '';

          return throwError(
            () => new Error(`Fallo subiendo ${fileName} (HTTP ${httpError.status}).${suffix}`),
          );
        }),
      );
  }

  private normalizeUploadTargets(data: unknown): ImageUploadResponse[] {
    // Si es directamente un array de items
    if (Array.isArray(data)) {
      if (
        data.length > 0 &&
        typeof data[0] === 'object' &&
        'url' in (data[0] as object) &&
        'key' in (data[0] as object)
      ) {
        return data as ImageUploadResponse[];
      }
    }

    // Si es un objeto con propiedades
    if (data && typeof data === 'object') {
      const asRecord = data as Record<string, unknown>;

      // Si tiene propiedad 'data' con array (respuesta { data: [...] })
      if (Array.isArray(asRecord['data'])) {
        return asRecord['data'] as ImageUploadResponse[];
      }

      // Si tiene propiedad 'urls' con array (respuesta com estructura { urls: [...] })
      if (Array.isArray(asRecord['urls'])) {
        return asRecord['urls'] as ImageUploadResponse[];
      }

      // Si tiene propiedad 'images' con array
      if (Array.isArray(asRecord['images'])) {
        return asRecord['images'] as ImageUploadResponse[];
      }

      // Si es un objeto solo con url y key (un único item)
      if ('url' in asRecord && 'key' in asRecord) {
        return [asRecord as unknown as ImageUploadResponse];
      }
    }

    console.warn('[ImageService] normalizeUploadTargets received unexpected data:', data);
    return [];
  }
}

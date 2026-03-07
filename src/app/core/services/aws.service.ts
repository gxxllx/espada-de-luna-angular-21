import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AWSService {
  private readonly S3_BUCKET = _NGX_ENV_.NG_APP_AWS_S3_BUCKET;
}

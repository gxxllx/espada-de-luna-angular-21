import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@/environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl;
  const isApiRequest = req.url.startsWith(apiUrl);

  if (!isApiRequest) {
    return next(req);
  }

  const credentialsReq = req.clone({
    withCredentials: true,
  });
  return next(credentialsReq);
};

import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const credentialsReq = req.clone({
    withCredentials: true,
  });
  return next(credentialsReq);
};

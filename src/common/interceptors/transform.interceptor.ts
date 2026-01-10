import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        if (request.method === 'POST') {
          response.status(201);
          const result: any = {
            statusCode: 201,
            data: data || {},
          };
          if (data && data.accessToken) {
            result.accessToken = data.accessToken;
          }
          return result;
        }
        return data;
      }),
    );
  }
}

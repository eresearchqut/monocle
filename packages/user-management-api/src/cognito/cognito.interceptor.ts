import {BadGatewayException, BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {SdkError} from "@aws-sdk/types";

const BAD_GATEWAY_ERROR_NAMES = ['ExpiredTokenException'];
const BAD_REQUEST_ERROR_NAME = ['InvalidParameterException']

const isBadGatewayException = (err: any): err is SdkError => {
    return BAD_GATEWAY_ERROR_NAMES.findIndex((name) => name === err.name) > -1;
}

const isBadRequestException = (err: any): err is SdkError => {
    return BAD_REQUEST_ERROR_NAME.findIndex((name) => name === err.name) > -1;
}

@Injectable()
export class CognitoErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(
                catchError(err => {
                    if (isBadGatewayException(err)) {
                        return throwError(new BadGatewayException(err.message));
                    }
                    if (isBadRequestException(err)) {
                        return throwError(new BadRequestException(err.message));
                    }
                    return throwError(err);
                })
            );
    }
}

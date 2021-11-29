import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";

@Injectable()
export abstract class VersionErrorInterceptor implements NestInterceptor {
  abstract conditionFailureMessage: string;
  otherFailureMessage = "Failed saving data";

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: Error) => {
        if (
          isCancelled(error) &&
          error.CancellationReasons?.length === 1 &&
          error.CancellationReasons[0].Code === "ConditionalCheckFailed"
        ) {
          throw new ConditionException(this.conditionFailureMessage);
        }
        throw new HttpException(this.otherFailureMessage, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }
}

export class ConditionException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

function isCancelled(error: any): error is TransactionCanceledException {
  return error.name === "TransactionCanceledException";
}

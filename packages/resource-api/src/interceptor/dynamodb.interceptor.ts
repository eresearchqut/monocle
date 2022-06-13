import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";

@Injectable()
export abstract class VersionedErrorInterceptor implements NestInterceptor {
  addFailureMessage = "Item already exists";
  updateFailureMessage = "Failed updating latest item";
  otherFailureMessage = "Request failed";

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: Error) => {
        if (isCancelled(error) && error.CancellationReasons?.length === 2) {
          if (error.CancellationReasons[0].Code === "ConditionalCheckFailed") {
            throw new ConditionException(this.updateFailureMessage);
          } else if (error.CancellationReasons[1].Code === "ConditionalCheckFailed") {
            throw new ConditionException(this.addFailureMessage);
          }
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

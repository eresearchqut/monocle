import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorObject } from "ajv";

export class ValidationException extends HttpException {
  constructor(errors: ErrorObject[]) {
    super(errors, HttpStatus.BAD_REQUEST);
  }
}

export class PutException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ConstraintException extends HttpException {
  constructor(constraints: string[]) {
    super(
      { statusCode: HttpStatus.CONFLICT, message: "Constraint values were not accepted", constraints },
      HttpStatus.CONFLICT
    );
  }
}

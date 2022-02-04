import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorObject } from "ajv";

export class ValidationException extends HttpException {
  constructor(errors: ErrorObject[]) {
    super(errors, HttpStatus.BAD_REQUEST);
  }
}

export class RelationshipException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorObject } from "ajv";

export class MetadataException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class ValidationException extends HttpException {
  constructor(errors: ErrorObject[]) {
    super(errors, HttpStatus.BAD_REQUEST);
  }
}

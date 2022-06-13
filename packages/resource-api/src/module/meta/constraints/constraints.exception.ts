import { HttpException, HttpStatus } from "@nestjs/common";

export class ConstraintsException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

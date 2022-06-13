import { HttpException, HttpStatus } from "@nestjs/common";

export class RelationshipsException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

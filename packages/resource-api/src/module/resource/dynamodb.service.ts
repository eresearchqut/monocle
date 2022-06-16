import { DynamodbService } from "../dynamodb/dynamodb.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ResourceDynamodbService extends DynamodbService {}

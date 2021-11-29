// Adapted from example
// https://github.com/shelfio/jest-dynamodb#22-examples

import * as yaml from "js-yaml";
import * as fs from "fs";
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema";

type SAMTemplate = {
  Resources: {
    [key: string]: {
      Type: string;
      Properties: any;
    };
  };
};

module.exports = async () => {
  const template = yaml.load(fs.readFileSync("../template.yaml", "utf8"), {
    schema: CLOUDFORMATION_SCHEMA,
  }) as SAMTemplate;

  return {
    tables: Object.values(template.Resources)
      .filter((resource) => resource.Type === "AWS::DynamoDB::Table")
      .map((resource) => {
        if (typeof resource.Properties.TableName === "object") {
          resource.Properties.TableName = resource.Properties.TableName.data.replace("${Registry}", "test");
        }
        delete resource.Properties.StreamSpecification;
        return resource.Properties;
      }),
    port: 8000,
  };
};

import fs from "fs";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import yaml from "js-yaml";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Custom Printing E-commerce API",
      version: "1.0.0",
      description:
        "OpenAPI specification generated from JSDoc annotations in the Express codebase.",
    },
    servers: [
      {
        url: "http://localhost:3002",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), "src/routes/**/*.ts"),
    path.join(process.cwd(), "src/controllers/**/*.ts"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

const outputPath = path.join(process.cwd(), "openapi.yaml");
const yamlString = yaml.dump(swaggerSpec, { noRefs: true });

fs.writeFileSync(outputPath, yamlString, "utf8");
console.log(`✅ OpenAPI spec generated at ${outputPath}`);



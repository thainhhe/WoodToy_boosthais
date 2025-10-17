import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Wooden Toys Store API",
      version: "1.0.0",
      description: "API documentation for Wooden Toys Store backend",
      contact: {
        name: "WoodToy Team",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://your-production-url.com",
        description: "Production server",
      },
    ],
    components: {
      schemas: {
        Product: {
          type: "object",
          required: ["name", "price"],
          properties: {
            _id: {
              type: "string",
              description: "Auto-generated MongoDB ID",
              example: "507f1f77bcf86cd799439011",
            },
            name: {
              type: "string",
              description: "Product name",
              example: "Wooden Animal Puzzle",
            },
            description: {
              type: "string",
              description: "Product description",
              example: "A beautiful handcrafted wooden puzzle for children",
            },
            price: {
              type: "number",
              description: "Product price in USD",
              example: 29.99,
            },
            image: {
              type: "string",
              description: "Product image URL",
              example: "wooden-animal-puzzle.jpg",
            },
            category: {
              type: "string",
              description: "Product category",
              example: "Puzzles",
            },
            stock: {
              type: "number",
              description: "Available stock quantity",
              example: 50,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Product creation timestamp",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;


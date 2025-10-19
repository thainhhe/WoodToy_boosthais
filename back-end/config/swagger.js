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
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
      },
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
              maxLength: 200,
              example: "Wooden Animal Puzzle",
            },
            description: {
              type: "string",
              description: "Product description",
              maxLength: 2000,
              example: "A beautiful handcrafted wooden puzzle for children",
            },
            story: {
              type: "string",
              description: "Product story/history",
              maxLength: 5000,
              example: "Handcrafted by local artisans using sustainable wood from responsibly managed forests. Each piece is unique and tells a story of traditional craftsmanship passed down through generations.",
            },
            price: {
              type: "number",
              description: "Product price in USD",
              minimum: 0,
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
              maxLength: 100,
              example: "Puzzles",
            },
            stock: {
              type: "number",
              description: "Available stock quantity",
              minimum: 0,
              example: 50,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Product creation timestamp",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User ID",
              example: "507f1f77bcf86cd799439011",
            },
            name: {
              type: "string",
              description: "User name",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
              example: "john@example.com",
            },
            avatar: {
              type: "string",
              description: "User avatar/profile picture URL",
              example: "https://lh3.googleusercontent.com/a/...",
            },
            phoneNumber: {
              type: "string",
              description: "User phone number (Vietnamese format)",
              example: "0912345678",
            },
            gender: {
              type: "string",
              enum: ["male", "female", "other"],
              description: "User gender",
              example: "male",
            },
            address: {
              type: "object",
              properties: {
                street: {
                  type: "string",
                  example: "123 Nguyen Hue",
                },
                ward: {
                  type: "string",
                  example: "Ben Nghe",
                },
                district: {
                  type: "string",
                  example: "District 1",
                },
                city: {
                  type: "string",
                  example: "Ho Chi Minh City",
                },
                country: {
                  type: "string",
                  example: "Vietnam",
                },
                postalCode: {
                  type: "string",
                  example: "700000",
                },
              },
            },
            provider: {
              type: "string",
              enum: ["local", "google"],
              description: "Authentication provider",
              example: "local",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              description: "User role",
              example: "user",
            },
            isActive: {
              type: "boolean",
              description: "Is user account active",
              example: true,
            },
            lastLogin: {
              type: "string",
              format: "date-time",
              description: "Last login timestamp",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Account update timestamp",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Login successful",
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
                accessToken: {
                  type: "string",
                  description: "JWT access token (expires in 15 minutes)",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                refreshToken: {
                  type: "string",
                  description: "Refresh token (expires in 7 days)",
                  example: "1a2b3c4d5e6f7g8h9i0j...",
                },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              description: "Error message",
            },
            error: {
              type: "string",
              description: "Error details",
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


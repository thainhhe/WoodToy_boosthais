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
        url: "https://2handshop.id.vn",
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
            storyBlocks: {
              type: "array",
              description: "Rich story content with text and images interleaved",
              maxItems: 50,
              items: {
                $ref: "#/components/schemas/StoryBlock",
              },
            },
            images: {
              type: "array",
              description: "Product images",
              maxItems: 10,
              items: {
                type: "object",
                properties: {
                  url: {
                    type: "string",
                    description: "Image URL from Cloudinary",
                    example: "https://res.cloudinary.com/your-cloud/image/upload/v123/products/img.jpg",
                  },
                  publicId: {
                    type: "string",
                    description: "Cloudinary public ID",
                    example: "products/img_abc123",
                  },
                  alt: {
                    type: "string",
                    description: "Alt text for SEO",
                    example: "Wooden Animal Puzzle - Image 1",
                  },
                  isPrimary: {
                    type: "boolean",
                    description: "Is this the primary image",
                    example: true,
                  },
                },
              },
            },
            video: {
              type: "object",
              description: "Product video",
              properties: {
                url: {
                  type: "string",
                  description: "Video URL from Cloudinary",
                  example: "https://res.cloudinary.com/your-cloud/video/upload/v123/products/vid.mp4",
                },
                publicId: {
                  type: "string",
                  description: "Cloudinary public ID",
                  example: "products/video_abc123",
                },
                thumbnail: {
                  type: "string",
                  description: "Video thumbnail URL",
                  example: "https://res.cloudinary.com/your-cloud/video/upload/v123/products/vid.jpg",
                },
                duration: {
                  type: "number",
                  description: "Video duration in seconds",
                  example: 120,
                },
              },
            },
            price: {
              type: "number",
              description: "Product price in USD",
              minimum: 0,
              example: 29.99,
            },
            pricegiamgia: {
              type: "number",
              description: "Discounted price in USD (optional)",
              minimum: 0,
              example: 24.99,
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
        StoryBlock: {
          type: "object",
          required: ["type", "order"],
          properties: {
            type: {
              type: "string",
              enum: ["text", "image"],
              description: "Block type",
              example: "text",
            },
            order: {
              type: "number",
              description: "Display order (0, 1, 2, ...)",
              minimum: 0,
              example: 0,
            },
            content: {
              type: "string",
              description: "Text content (for text blocks only)",
              maxLength: 5000,
              example: "Each toy is carefully crafted by skilled artisans with over 20 years of experience...",
            },
            image: {
              type: "object",
              description: "Image data (for image blocks only)",
              properties: {
                url: {
                  type: "string",
                  description: "Image URL from Cloudinary",
                  example: "https://res.cloudinary.com/your-cloud/image/upload/v123/products/stories/story_img.jpg",
                },
                publicId: {
                  type: "string",
                  description: "Cloudinary public ID",
                  example: "products/stories/story_img_abc123",
                },
                caption: {
                  type: "string",
                  description: "Image caption/description",
                  maxLength: 200,
                  example: "Artisan crafting wooden toy by hand",
                },
                alt: {
                  type: "string",
                  description: "Alt text for SEO",
                  maxLength: 100,
                  example: "wooden-toy-crafting-process",
                },
              },
            },
            caption: {
              type: "string",
              description: "Caption for image blocks",
              maxLength: 200,
              example: "Artisan crafting wooden toy by hand",
            },
            alt: {
              type: "string",
              description: "Alt text for image blocks (SEO)",
              maxLength: 100,
              example: "wooden-toy-crafting-process",
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


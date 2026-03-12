# Photo Uploader API

A full-stack photo uploading and commenting application built with Express.js, PostgreSQL, and Prisma ORM. This project includes image management, user profiles, and a commenting system with Docker support.

## Tech Stack

- **Runtime**: Node.js 20 (Alpine)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **File Upload**: Multer
- **Language**: TypeScript
- **Container**: Docker & Docker Compose
- **Reverse Proxy**: Nginx

## Project Structure

```
├── index.ts              # Main application entry point
├── prisma/
│   └── schema.prisma     # Prisma database schema
├── prisma.config.ts      # Prisma configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Docker Compose orchestration
├── nginx.conf            # Nginx reverse proxy config
├── uploads/              # Local file storage directory
└── README.md             # This file
```

## Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 17+
- Docker & Docker Compose (optional)

### Local Setup

Install dependencies using bun or npm:

```bash
bun install
# or
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/photouploader
NODE_ENV=development
PORT=4000
```

## Available Scripts

- `bun run index.ts` - Start the development server
- `npm run dev` - Run with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled production build
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Create and apply database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI

## API Endpoints

### Users

**Create User**
```http
POST /user
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe"
}
```

### Images

**Upload Image**
```http
POST /upload/:userId
Content-Type: multipart/form-data

photo: [binary file]
```

**Get All Images with Users**
```http
GET /images
```

**Get Image with Comments**
```http
GET /images/:imageId/comments
```

### Comments

**Create Comment**
```http
POST /comments/:userId
Content-Type: application/json

{
  "text": "This is a great photo!"
}
```

**Get All Comments with Users**
```http
GET /comments
```

## Database Schema

The application uses the following models:

- **User**: Stores user information
- **Image**: Stores uploaded images with URLs
- **Comment**: Stores comment text
- **UserImage**: Junction table linking users to images
- **UserComment**: Junction table linking users to comments
- **ImageComment**: Junction table linking images to comments

See [prisma/schema.prisma](prisma/schema.prisma) for the complete schema.

## Docker Deployment

The project uses a multi-stage Docker build and Docker Compose for orchestration.

### Build and Run with Docker Compose

```bash
docker-compose up -d
```

This will start:
- **Nginx** on port 8080 (reverse proxy)
- **PostgreSQL** database
- **API** backend on port 4000 (via Nginx)
- **Frontend** on port 3000 (via Nginx)

### Accessing the Application

- API: `http://localhost:8080/api`
- Frontend: `http://localhost:8080`

### Stop Services

```bash
docker-compose down
```

## Project Features

✅ **Image Upload**: Upload photos with automatic file naming and storage
✅ **User Management**: Create and manage user profiles
✅ **Comments System**: Add comments to images with user attribution
✅ **Database Relations**: Complex many-to-many relationships with Prisma
✅ **Type Safety**: Full TypeScript support
✅ **Docker Ready**: Multi-stage build and Docker Compose configuration
✅ **Reverse Proxy**: Nginx configuration for production routing

## Development Workflow

1. Make changes to [index.ts](index.ts)
2. Update database schema in [prisma/schema.prisma](prisma/schema.prisma) if needed
3. Run migrations: `npm run prisma:migrate`
4. Start development server: `bun run index.ts`
5. Test endpoints using the API endpoints listed above

## Production Considerations

- Use cloud storage (AWS S3, etc.) instead of local file system for `image_url`
- Set `NODE_ENV=production` in environment variables
- Configure proper CORS headers for security
- Use environment-specific database URLs
- Implement authentication and authorization
- Add input validation and error handling

## License

This project was created using `bun init` in bun v1.3.10. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
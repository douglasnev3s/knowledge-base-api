# Dynamic Knowledge Base API

A RESTful API for managing interconnected topics and resources with version control, user roles, and permissions. Built with Node.js, TypeScript, and Express following SOLID principles and design patterns.

## Features

- **User Management** - Role-based access control (Admin, Editor, Viewer)
- **Topic Management** - Hierarchical topics with parent-child relationships
- **Version Control** - Complete topic versioning system with history
- **Resource Management** - Attach learning resources to topics
- **Custom Algorithms** - Shortest path algorithm between topics
- **Tree Building** - Recursive topic tree construction

## Tech Stack

- Node.js 22.x + TypeScript
- Express.js
- Jest + Supertest (Testing)
- JSON file storage
- Repository Pattern + SOLID principles

## Quick Start

### Prerequisites
- Node.js 22.x or higher
- npm 10.x or higher

### Installation & Setup

```bash
# Clone repository
git clone https://github.com/douglasnev3s/knowledge-base-api.git
cd knowledge-base-api

# Install dependencies
npm install

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000/api`

### Database Setup

No database setup required - the system uses JSON files for storage:
- Data files are automatically created in the `data/` directory
- Files are managed automatically by the application

## Authentication

The API uses simulated authentication via headers for testing purposes:

```http
x-user-id: {USER_ID}
```

To get started, create users using the setup endpoint (no auth required):

```bash
# Create Admin user
curl -X POST http://localhost:3000/api/users/setup \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin User", "email": "admin@test.com", "role": "Admin"}'

# Create Editor user  
curl -X POST http://localhost:3000/api/users/setup \
  -H "Content-Type: application/json" \
  -d '{"name": "Editor User", "email": "editor@test.com", "role": "Editor"}'

# Create Viewer user
curl -X POST http://localhost:3000/api/users/setup \
  -H "Content-Type: application/json" \
  -d '{"name": "Viewer User", "email": "viewer@test.com", "role": "Viewer"}'
```

Copy the `id` from the response and use it as `x-user-id` header in subsequent requests.

## API Endpoints

### Health Check
```http
GET /api/health
```

### Users (Admin only)
```http
GET    /api/users              # List users
GET    /api/users/:id          # Get user by ID
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
```

### Topics (Admin/Editor can modify, Viewer can read)
```http
GET    /api/topics                    # List all topics
GET    /api/topics/:id               # Get topic by ID
POST   /api/topics                   # Create topic
PUT    /api/topics/:id               # Update topic (creates new version)
DELETE /api/topics/:id               # Delete topic
GET    /api/topics/:id/versions      # Get topic version history
GET    /api/topics/:id/versions/:v   # Get specific version
GET    /api/topics/:id/tree          # Get recursive topic tree
GET    /api/topics/path/:id1/:id2    # Find shortest path between topics
```

### Resources (Admin/Editor can modify, Viewer can read)
```http
GET    /api/resources               # List all resources
GET    /api/resources/:id          # Get resource by ID
POST   /api/resources              # Create resource
PUT    /api/resources/:id          # Update resource
DELETE /api/resources/:id          # Delete resource
GET    /api/resources/topic/:id    # Get resources by topic
GET    /api/resources/type/:type   # Get resources by type (video, article, pdf, link)
```

### Permissions
```http
GET    /api/permissions/check      # Check current user permissions
```

## User Roles

- **Admin**: Full access to everything
- **Editor**: Can manage topics and resources, view users
- **Viewer**: Read-only access to topics and resources

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## Manual Testing

Use the HTTP files in `tests/manual/` for easy testing:
- Import them into VS Code REST Client or similar tool
- Follow the examples to test all functionality

## Example Usage

1. **Create a topic hierarchy:**
```bash
# Create root topic
curl -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -H "x-user-id: {ADMIN_ID}" \
  -d '{"name": "Programming", "content": "Programming fundamentals"}'

# Create child topic
curl -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -H "x-user-id: {ADMIN_ID}" \
  -d '{"name": "JavaScript", "content": "JS basics", "parentTopicId": "{PARENT_ID}"}'
```

2. **Add resources:**
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -H "x-user-id: {ADMIN_ID}" \
  -d '{"topicId": "{TOPIC_ID}", "url": "https://example.com", "description": "Tutorial", "type": "video"}'
```

3. **Get topic tree:**
```bash
curl -H "x-user-id: {USER_ID}" http://localhost:3000/api/topics/{ROOT_ID}/tree
```

## Response Format

Success:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

Error:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2025-08-06T12:00:00.000Z"
}
```

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm test            # Run tests
```

---

Built with TypeScript, Express.js, and modern software engineering practices.
# PujiGori Backend Implementation Guide

## 🎯 Notes 



### Commit 1 : Initial Project Setup

1. **Create Project Directory**
   -> Manually created the folder and started the project
   mkdir pujigori-backend
   cd pujigori-backend

2. **Copy All Configuration Files**
   ->Created these files in project root:
   - `package.json`
   - `tsconfig.json`
   - `.env.example`
   - `.gitignore`
   - `nodemon.json`
   - `.eslintrc.js`
   - `jest.config.js`

3. **Install Dependencies**
   ->Installed package afterwards.
   npm install

4. **Create Directory Structure**
   -> Initiating directories for the project setup
   mkdir -p src/{config,models,services,types,utils,controllers,routes,middleware,tests}
   mkdir -p dist logs uploads docs

### Commit 2 : DataBase Models , Serices & App, index.ts.

1. **Create Core Type Definitions**
   - Copy `src/types/index.ts` with all interfaces and enums

2. **Create Database Configuration**
   - Copy `src/config/database.ts` with MongoDB connection management

3. **Create Database Models** (Advanced Databse options explained at advancedModel.md)
   - Copy `src/models/Project.ts`
   - Copy `src/models/Donation.ts`
   - Copy `src/models/PaymentRequest.ts`

4. **Create Core Services**
   - Copy `src/services/SSLCommerzService.ts`
   - Copy `src/services/S3Service.ts`
   - Copy `src/services/QRService.ts`

5. **Create Utility Functions**
   - Copy `src/utils/index.ts`

6. **Create Application Setup**
   - Copy `src/app.ts`
   - Copy `src/index.ts`

### Commit 3: Environment Configuration (To do)

1. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Configure Required Variables**
   ```bash
   # Database
   MONGODB_URI=mongodb://localhost:27017/pujigori

   # JWT (placeholder for your auth)
   JWT_SECRET=your-super-secret-jwt-key-here

   # SSLCommerz (get from SSLCommerz account)
   SSLCOMMERZ_STORE_ID=your-store-id
   SSLCOMMERZ_STORE_PASS=your-store-password
   SSLCOMMERZ_IS_SANDBOX=true

   # AWS S3 (get from AWS console)
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=ap-southeast-1
   AWS_S3_BUCKET=your-bucket-name

   # URLs
   FRONTEND_URL=http://localhost:3000
   ```

### Commit 4: External Services Setup

#### MongoDB Setup
1. **Install MongoDB locally** or **use MongoDB Atlas**
   ```bash
      normal mongodb uri connection
   ```

#### AWS S3 Setup
1. **Create S3 Bucket**
   - Go to AWS Console → S3
   - Create new bucket (e.g., `pujigori-uploads`)
   - Enable public read access
   - Configure CORS policy

2. **Create IAM User**
   - Go to AWS Console → IAM
   - Create user with programmatic access
   - Attach S3 policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::your-bucket-name",
           "arn:aws:s3:::your-bucket-name/*"
         ]
       }
     ]
   }
   ```

#### SSLCommerz Setup
1. **Register with SSLCommerz**
   - Go to https://www.sslcommerz.com/
   - Register for account
   - Get Store ID and Store Password
   - Use sandbox mode for development

2. **Configure Webhook URLs**
   - Success URL: `http://localhost:5000/api/payments/success`
   - Fail URL: `http://localhost:5000/api/payments/fail`
   - Cancel URL: `http://localhost:5000/api/payments/cancel`
   - IPN URL: `http://localhost:5000/api/payments/webhook`

### Step 5: Test Basic Setup

1. **Start the Server**
   ```bash
   npm run dev
   ```

2. **Test Health Check**
   ```bash
   curl http://localhost:5000/health
   ```

   Expected response:
   ```json
   {
     "success": true,
     "message": "Service is healthy",
     "data": {
       "status": "healthy",
       "services": {
         "database": { "status": "connected" },
         "storage": { "status": "healthy" }
       }
     }
   }
   ```

3. **Test API Version**
   ```bash
   curl http://localhost:5000/api/version
   ```

### Step 6: Next Phase - Controllers and Routes

Now you're ready to implement the API endpoints. Here's what to create next:

#### 1. Create Controllers (Priority 1)

**src/controllers/ProjectController.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project';
import { ResponseUtils } from '../utils';

class ProjectController {
  // GET /api/projects
  async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await Project.findActive();
      res.json(ResponseUtils.success('Projects retrieved successfully', projects));
    } catch (error) {
      next(error);
    }
  }

  // POST /api/projects
  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = new Project(req.body);
      await project.save();
      res.status(201).json(ResponseUtils.success('Project created successfully', project));
    } catch (error) {
      next(error);
    }
  }

  // GET /api/projects/:slug
  async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await Project.findOne({ slug: req.params.slug });
      if (!project) {
        return res.status(404).json(ResponseUtils.error('Project not found'));
      }
      res.json(ResponseUtils.success('Project retrieved successfully', project));
    } catch (error) {
      next(error);
    }
  }

  // Add more methods: updateProject, deleteProject, etc.
}

export default new ProjectController();
```

#### 2. Create Routes (Priority 1)

**src/routes/projects.ts**
```typescript
import { Router } from 'express';
import ProjectController from '../controllers/ProjectController';
// import { authMiddleware } from '../middleware/auth'; // Your auth system

const router = Router();

// Public routes
router.get('/', ProjectController.getProjects);
router.get('/:slug', ProjectController.getProject);

// Protected routes (uncomment when auth middleware is ready)
// router.post('/', authMiddleware, ProjectController.createProject);
// router.put('/:id', authMiddleware, ProjectController.updateProject);
// router.delete('/:id', authMiddleware, ProjectController.deleteProject);

export default router;
```

#### 3. Update App.ts to Use Routes

```typescript
// In src/app.ts, uncomment and add:
import projectRoutes from './routes/projects';
// ... other imports

// In initializeRoutes method:
this.app.use('/api/projects', projectRoutes);
```

### Step 7: Testing and Validation

1. **Test Project Endpoints**
   ```bash
   # Get all projects
   curl http://localhost:5000/api/projects

   # Create a project (will need auth middleware later)
   curl -X POST http://localhost:5000/api/projects \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Project",
       "description": "A test crowdfunding project",
       "shortDescription": "Test project for crowdfunding platform",
       "category": "technology",
       "targetAmount": 50000,
       "startDate": "2023-10-01T00:00:00.000Z",
       "endDate": "2023-12-31T23:59:59.000Z",
       "location": {
         "district": "Dhaka",
         "division": "Dhaka"
       },
       "story": "This is a comprehensive story about our amazing project...",
       "risks": "Potential risks include technical challenges and market conditions..."
     }'
   ```

### Step 8: Development Workflow

1. **Code Quality**
   ```bash
   # Lint your code
   npm run lint

   # Fix linting issues
   npm run lint:fix

   # Build for production
   npm run build
   ```

2. **Git Workflow**
   ```bash
   git init
   git add .
   git commit -m "Initial PujiGori backend setup"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

### Step 9: Production Deployment Checklist

When ready for production:

- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB instance
- [ ] Configure production S3 bucket
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up process manager (PM2)
- [ ] Configure monitoring and logging
- [ ] Set up backup strategies
- [ ] Implement rate limiting
- [ ] Enable security headers

### 🚨 Common Issues and Solutions

#### Issue: MongoDB Connection Failed
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

#### Issue: S3 Upload Permission Denied
- Verify AWS credentials in .env
- Check S3 bucket policy
- Ensure IAM user has correct permissions

#### Issue: SSLCommerz Test Mode Issues
- Ensure `SSLCOMMERZ_IS_SANDBOX=true` for development
- Verify store credentials
- Check webhook URLs are accessible

#### Issue: Port Already in Use
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

### 📞 Support and Next Steps

You now have a fully functional backend foundation! The next major step is implementing all the controllers and routes for:

1. **Project Management** - Full CRUD operations
2. **Payment Processing** - SSLCommerz integration
3. **Donation Tracking** - Complete lifecycle management
4. **File Upload** - S3 integration
5. **Admin Panel** - Approval workflows

Each service is ready to use, and the architecture supports easy extension for additional features.

Ready to continue with Step 2 - Controllers and Routes implementation? Let me know!
1. in createProject , updateProject api  ---> at controllers/projectController there is unsolved block of who is creating the  project  - line ~303
```typescript
  async createProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: Get creator ID from authentication middleware
      // const creatorId = req.user?.id;
      const creatorId = "temp-creator-id"; // Placeholder

      const projectData = {
        ...req.body,
        creator: creatorId,
        slug: StringUtils.generateSlug(req.body.title),
      };
      ---
    }}
```

2. updateProject api  ---> at controllers/projectController

get creator id from the auth middleware.

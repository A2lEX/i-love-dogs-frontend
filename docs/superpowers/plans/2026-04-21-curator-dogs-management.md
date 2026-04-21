# Curator Dogs Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow curators to manage their dogs (add, edit, update status, upload photos) via an adaptive UI (Modal/Drawer).

**Architecture:** 
- **Backend:** Update Prisma schema, DTOs, and services to handle dog status and photo gallery.
- **Frontend:** Implement a responsive `DogManagementModal` and a photo gallery editor with upload logic using presigned URLs.

**Tech Stack:** 
- NestJS (Backend)
- Next.js 14+ App Router (Frontend)
- Prisma (ORM)
- CSS Modules (Styling, consistent with project)
- TanStack Query (Data Fetching/Mutations)

---

### Task 1: Backend - Prisma Schema Update

**Files:**
- Modify: `api/prisma/schema.prisma`

- [ ] **Step 1: Update `DogStatus` enum and `Dog` model**
```prisma
enum DogStatus {
  active
  on_hold   
  medical   
  adopted
  deceased
  archived
}

model Dog {
  // ...
  status          DogStatus
  city            String    @db.VarChar(100)
  cover_photo_url String?
  photos          String[]  @default([]) 
  // ...
}
```

- [ ] **Step 2: Generate Prisma client and run migration**
Run: `cd api && npx prisma migrate dev --name add_dog_photos_and_statuses`
Expected: Database updated.

- [ ] **Step 3: Commit**
```bash
cd api && git add prisma/schema.prisma
git commit -m "db: add photos field and new statuses to Dog model"
```

---

### Task 2: Backend - Update DTOs and Service

**Files:**
- Modify: `api/src/dogs/dto/create-dog.dto.ts`
- Modify: `api/src/dogs/dto/update-dog.dto.ts`
- Modify: `api/src/dogs/dogs.service.ts`

- [ ] **Step 1: Update `CreateDogDto`**
Add `photos` array.
```typescript
// api/src/dogs/dto/create-dog.dto.ts
export class CreateDogDto {
  // ...
  @ApiPropertyOptional({ type: [String], example: ['url1', 'url2'] })
  @IsOptional()
  @IsString({ each: true })
  photos?: string[];
}
```

- [ ] **Step 2: Update `UpdateDogDto`**
Add new statuses and `photos`.
```typescript
// api/src/dogs/dto/update-dog.dto.ts
export class UpdateDogDto extends PartialType(CreateDogDto) {
  @ApiPropertyOptional({
    enum: ['active', 'on_hold', 'medical', 'adopted', 'deceased', 'archived'],
  })
  @IsOptional()
  @IsIn(['active', 'on_hold', 'medical', 'adopted', 'deceased', 'archived'])
  status?: 'active' | 'on_hold' | 'medical' | 'adopted' | 'deceased' | 'archived';
}
```

- [ ] **Step 3: Update `DogsService.create` and `DogsService.update`**
```typescript
// api/src/dogs/dogs.service.ts
async create(userId: string, data: CreateDogDto) {
  const curatorId = await this.getCuratorProfileId(userId);
  return this.prisma.dog.create({
    data: {
      // ...
      photos: data.photos || [],
      // ...
    },
  });
}

async update(userId: string, dogId: string, data: UpdateDogDto) {
  // ... check curatorId
  return this.prisma.dog.update({
    where: { id: dogId },
    data: {
      // ...
      photos: data.photos,
      status: data.status,
    },
  });
}
```

- [ ] **Step 4: Commit**
```bash
git add api/src/dogs/dto/*.ts api/src/dogs/dogs.service.ts
git commit -m "feat(api): update dog creation and editing to support gallery and new statuses"
```

---

### Task 3: Frontend - Responsive Modal (Drawer on Mobile)

**Files:**
- Create: `frontend/src/components/ui/ResponsiveModal.tsx`
- Create: `frontend/src/components/ui/ResponsiveModal.module.css`

- [ ] **Step 1: Create `ResponsiveModal`**
Use `window.innerWidth` or `matchMedia` for responsive behavior. For mobile, it should slide from bottom.

- [ ] **Step 2: Commit**
```bash
git add frontend/src/components/ui/ResponsiveModal.*
git commit -m "feat(ui): add ResponsiveModal component"
```

---

### Task 4: Frontend - Photo Gallery Editor

**Files:**
- Create: `frontend/src/components/dogs/PhotoGalleryEditor.tsx`
- Create: `frontend/src/components/dogs/PhotoGalleryEditor.module.css`
- Create: `frontend/src/hooks/useMediaUpload.ts`

- [ ] **Step 1: Implement `useMediaUpload` hook**
Fetches presigned URL and uploads to S3.

- [ ] **Step 2: Create `PhotoGalleryEditor` component**
Grid of photos, delete button, "star" for cover.

- [ ] **Step 3: Commit**
```bash
git add frontend/src/components/dogs/PhotoGalleryEditor.* frontend/src/hooks/useMediaUpload.ts
git commit -m "feat(dogs): add photo gallery editor and upload hook"
```

---

### Task 5: Frontend - Dog Management Form & Integration

**Files:**
- Create: `frontend/src/components/dogs/DogManagementForm.tsx`
- Create: `frontend/src/components/dogs/DogManagementForm.module.css`
- Modify: `frontend/src/app/[lang]/profile/page.tsx`

- [ ] **Step 1: Create `DogManagementForm`**
Name, Breed, Age, Gender, City, Status, Description, Gallery.

- [ ] **Step 2: Integrate into Profile Page**
Show dog list and "Add Dog" button using `ResponsiveModal`.

- [ ] **Step 3: Commit**
```bash
git add frontend/src/components/dogs/* frontend/src/app/[lang]/profile/page.tsx
git commit -m "feat(profile): add curator dogs management"
```

---

### Task 6: Deploy - Backend to Production

- [ ] **Step 1: Run tests**
`cd api && npm run test`

- [ ] **Step 2: Build and Build Verify**
`cd api && npm run build`

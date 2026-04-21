# Curator Dogs Management Design

## 1. Overview
Curators need a way to manage dogs they are responsible for directly from their profile page. This includes adding new dogs, editing existing profiles, updating status, and uploading a gallery of photos. 

## 2. Architecture & Backend Updates (api)
- **Database (Prisma)**:
  - Add `photos` column to `Dog` model (type `String[]` or `Json`).
  - Add new enum values to `DogStatus`: `active` (default), `on_hold` (foster care), `medical` (under treatment), `adopted` (found home), `archived`.
- **API Endpoints**:
  - `POST /dogs`: Update `CreateDogDto` to accept `photos: string[]`.
  - `PUT /dogs/:id`: Update `UpdateDogDto` to accept `photos: string[]` and `status: DogStatus`.
- **Media Upload**:
  - Existing `POST /media/presigned-url` endpoint will be reused. The frontend will request URLs for each photo, upload them directly to S3, and pass the final `file_url` array to the dog endpoints.

## 3. Frontend Updates (frontend)
- **UI Components**:
  - `DogManagementModal`: A responsive modal that renders as a standard `Dialog` on desktop and a bottom `Drawer` on mobile. It will contain the dog creation/editing form.
  - `PhotoGalleryEditor`: A drag-and-drop or grid component allowing users to upload multiple photos, remove them, and select the primary/cover photo (which could just be the first photo in the array or explicitly set).
- **Forms & State**:
  - React Hook Form + Zod for validation.
  - Zustand or React Query to update the local list of dogs without requiring a full page refresh.
- **Profile Integration**:
  - The `/[lang]/profile` page will fetch the curator's dogs via `GET /curators/profile`.
  - Render a grid of `DogCard` components with "Edit" and "Change Status" quick actions.

## 4. Data Flow
1. User clicks "Add Dog" or "Edit" on a dog card.
2. The `DogManagementModal` opens.
3. User fills in details and selects photos.
4. On submit, for each new photo, the client requests a presigned URL, uploads the binary data to S3, and collects the resulting URLs.
5. The client submits the full form data (including photo URLs and cover photo) to `POST /dogs` or `PUT /dogs/:id`.
6. The client invalidates the `curators/profile` query to refresh the list of dogs.

## 5. Deployment
- The backend will be built and deployed to production upon successful testing and validation of the changes.

## 6. Testing Strategy
- Unit tests for the updated service logic (handling new fields).
- Verification of media upload flow.
- UI validation for mobile/desktop responsiveness of the Dialog/Drawer components.
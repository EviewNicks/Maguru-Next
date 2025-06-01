---
description: 
globs: 
alwaysApply: false
---
# Rencana Detail Implementasi Phase 1: Persiapan Infrastruktur

## Ringkasan

Phase 1 fokus pada persiapan infrastruktur dan implementasi server-side untuk fitur Draft Auto Save. Fase ini mencakup update schema database dan implementasi service layer yang akan menjadi fondasi untuk fitur auto-save.

## Timeline: 2-3 hari

## 1. Update Schema Database (Hari 1)

### 1.1 Analisis Model Data yang Ada

- Review model `ModulePage` saat ini di `prisma/schema.prisma`
- Identifikasi field yang sudah ada dan yang perlu ditambahkan
- Pastikan tidak ada konflik dengan fitur yang sudah ada

### 1.2 Perbarui Model `ModulePage` di `prisma/schema.prisma`

```prisma
model ModulePage {
  id          String       @id @default(uuid())
  moduleId    String       @map("module_id")
  order       Int
  type        String
  content     Json         // Format Tiptap untuk konten yang sudah dipublish
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  version     Int          @default(1)
  title       String
  status      ModuleStatus @default(DRAFT)

  // Fields baru untuk fitur draft
  authorId    String       // Pengguna yang membuat halaman (penting untuk tracking)
  lastEditBy  String?      // User terakhir yang mengedit (untuk collaborative editing)
  draftData   Json?        // Menyimpan data draft terpisah dari konten yang sudah dipublish
  draftSavedAt DateTime?   // Timestamp terakhir draft disimpan (untuk menampilkan info ke user)
  isDraft     Boolean      @default(false) // Flag untuk menandai apakah ini versi draft
  hasUnpublishedChanges Boolean @default(false) // Flag untuk menandai ada perubahan yang belum dipublish

  module      Module       @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@unique([moduleId, order])
  @@index([moduleId, order])
  @@index([moduleId, type])
  @@index([authorId]) // Index baru untuk query berdasarkan author
  @@map("module_pages")
}
```

### 1.3 Buat dan Jalankan Migrasi Database

```bash
npx prisma migrate dev --name add_draft_fields
```

### 1.4 Update Type Definitions

- Perbarui tipe TypeScript untuk `ModulePage` di `features/manage-module/types/index.ts`
- Tambahkan interface baru untuk data draft

```typescript
// Di features/manage-module/types/index.ts

export interface DraftData {
  pageId: string
  moduleId: string
  content: StandardEditorContent
  title?: string
  lastModified: number // timestamp
  version?: number // untuk conflict detection
  authorId: string // User yang membuat draft
}

export interface ModulePageWithDraft extends ModulePage {
  draftData?: DraftData | null
  draftSavedAt?: Date | null
  lastEditBy?: string | null
  isDraft: boolean
  hasUnpublishedChanges: boolean
}
```

### 1.5 Update Schema Validasi

- Perbarui Zod schema di `features/manage-module/types/modulePageSchema.ts`
- Tambahkan validasi untuk field draft baru

```typescript
// Di features/manage-module/types/modulePageSchema.ts

export const DraftDataSchema = z.object({
  pageId: z.string().uuid(),
  moduleId: z.string().uuid(),
  content: StandardEditorContentSchema,
  title: z.string().optional(),
  lastModified: z.number(),
  version: z.number().optional(),
  authorId: z.string()
});

export const ModulePageSchema = z.object({
  // ... field yang sudah ada
  authorId: z.string(),
  lastEditBy: z.string().nullable().optional(),
  draftData: DraftDataSchema.nullable().optional(),
  draftSavedAt: z.date().nullable().optional(),
  isDraft: z.boolean().default(false),
  hasUnpublishedChanges: z.boolean().default(false)
});

export type DraftData = z.infer<typeof DraftDataSchema>;
```

## 2. Implementasi Service Layer (Hari 1-2)

### 2.1 Update `modulePageService.ts`

- Tambahkan fungsi-fungsi baru untuk operasi draft
- Implementasikan validasi dan transformasi data
- Tambahkan error handling dan logging

```typescript
// Di features/manage-module/services/modulePageService.ts

// Tambahkan fungsi baru untuk draft operations
export async function saveDraft(pageId: string, draftData: DraftData): Promise<ModulePageWithDraft> {
  try {
    const existingPage = await prisma.modulePage.findUnique({
      where: { id: pageId }
    });
    
    if (!existingPage) {
      throw new Error(`Page with ID ${pageId} not found`);
    }
    
    const updatedPage = await prisma.modulePage.update({
      where: { id: pageId },
      data: {
        draftData: draftData as unknown as Prisma.JsonObject,
        draftSavedAt: new Date(),
        lastEditBy: draftData.authorId,
        hasUnpublishedChanges: true
      }
    });
    
    return updatedPage as ModulePageWithDraft;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw new Error(`Failed to save draft: ${error.message}`);
  }
}

export async function getDraft(pageId: string): Promise<DraftData | null> {
  try {
    const page = await prisma.modulePage.findUnique({
      where: { id: pageId }
    });
    
    if (!page || !page.draftData) {
      return null;
    }
    
    return page.draftData as unknown as DraftData;
  } catch (error) {
    console.error('Error getting draft:', error);
    throw new Error(`Failed to get draft: ${error.message}`);
  }
}

export async function publishDraft(pageId: string): Promise<ModulePageWithDraft> {
  try {
    const page = await prisma.modulePage.findUnique({
      where: { id: pageId }
    });
    
    if (!page || !page.draftData) {
      throw new Error(`No draft found for page with ID ${pageId}`);
    }
    
    const updatedPage = await prisma.modulePage.update({
      where: { id: pageId },
      data: {
        content: page.draftData as unknown as Prisma.JsonObject,
        version: { increment: 1 },
        hasUnpublishedChanges: false,
        updatedAt: new Date()
      }
    });
    
    return updatedPage as ModulePageWithDraft;
  } catch (error) {
    console.error('Error publishing draft:', error);
    throw new Error(`Failed to publish draft: ${error.message}`);
  }
}

export async function discardDraft(pageId: string): Promise<ModulePageWithDraft> {
  try {
    const updatedPage = await prisma.modulePage.update({
      where: { id: pageId },
      data: {
        draftData: null,
        draftSavedAt: null,
        hasUnpublishedChanges: false
      }
    });
    
    return updatedPage as ModulePageWithDraft;
  } catch (error) {
    console.error('Error discarding draft:', error);
    throw new Error(`Failed to discard draft: ${error.message}`);
  }
}

// Update interface IModulePageService
export interface IModulePageService {
  // ... metode yang sudah ada
  saveDraft(pageId: string, draftData: DraftData): Promise<ModulePageWithDraft>;
  getDraft(pageId: string): Promise<DraftData | null>;
  publishDraft(pageId: string): Promise<ModulePageWithDraft>;
  discardDraft(pageId: string): Promise<ModulePageWithDraft>;
}
```

### 2.2 Unit Test untuk Service Layer

- Buat file test untuk fungsi-fungsi draft baru
- Implementasikan test case untuk setiap fungsi

```typescript
// Di features/manage-module/services/__tests__/modulePageService.test.ts

describe('Draft operations', () => {
  beforeEach(() => {
    // Setup mock data dan prisma mock
  });
  
  test('saveDraft should save draft data to the database', async () => {
    // Test implementation
  });
  
  test('getDraft should return draft data if exists', async () => {
    // Test implementation
  });
  
  test('publishDraft should update content with draft data and increment version', async () => {
    // Test implementation
  });
  
  test('discardDraft should clear draft data', async () => {
    // Test implementation
  });
});
```

## 3. Implementasi API Routes (Hari 2-3)

### 3.1 Update Existing API Route

- Perbarui `app/api/module/[id]/pages/[pageid]/route.ts` untuk mendukung draft
- Tambahkan field draft-related ke response

```typescript
// Di app/api/module/[id]/pages/[pageid]/route.ts

export async function GET(
  request: Request,
  { params }: { params: { id: string; pageid: string } }
) {
  try {
    const page = await modulePageService.getModulePage(params.pageid);
    
    // Include draft information in response
    return NextResponse.json({
      ...page,
      hasDraft: !!page.draftData,
      draftSavedAt: page.draftSavedAt,
      hasUnpublishedChanges: page.hasUnpublishedChanges
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get page: ${error.message}` },
      { status: 500 }
    );
  }
}

// Update PUT handler untuk mendukung version control
export async function PUT(
  request: Request,
  { params }: { params: { id: string; pageid: string } }
) {
  try {
    const body = await request.json();
    
    // Tambahkan optimistic locking
    const page = await modulePageService.updateModulePage(params.pageid, {
      ...body,
      version: body.version // Untuk optimistic locking
    });
    
    return NextResponse.json(page);
  } catch (error) {
    if (error.message.includes('Version conflict')) {
      return NextResponse.json(
        { error: 'Version conflict. Please refresh and try again.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to update page: ${error.message}` },
      { status: 500 }
    );
  }
}
```

### 3.2 Buat API Route Baru untuk Draft

- Buat file `app/api/module/[id]/pages/[pageid]/draft/route.ts`
- Implementasikan handler untuk operasi draft

```typescript
// Di app/api/module/[id]/pages/[pageid]/draft/route.ts

import { NextResponse } from 'next/server';
import * as modulePageService from '@/features/manage-module/services/modulePageService';

// POST: Menyimpan draft
export async function POST(
  request: Request,
  { params }: { params: { id: string; pageid: string } }
) {
  try {
    const body = await request.json();
    const draftData = {
      ...body,
      pageId: params.pageid,
      moduleId: params.id,
      lastModified: Date.now()
    };
    
    const updatedPage = await modulePageService.saveDraft(params.pageid, draftData);
    
    return NextResponse.json({
      success: true,
      draftSavedAt: updatedPage.draftSavedAt,
      message: 'Draft saved successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to save draft: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET: Mendapatkan draft
export async function GET(
  request: Request,
  { params }: { params: { id: string; pageid: string } }
) {
  try {
    const draft = await modulePageService.getDraft(params.pageid);
    
    if (!draft) {
      return NextResponse.json(
        { message: 'No draft found for this page' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(draft);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get draft: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE: Membuang draft
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; pageid: string } }
) {
  try {
    await modulePageService.discardDraft(params.pageid);
    
    return NextResponse.json({
      success: true,
      message: 'Draft discarded successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to discard draft: ${error.message}` },
      { status: 500 }
    );
  }
}

// PATCH: Mempublikasikan draft
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; pageid: string } }
) {
  try {
    const updatedPage = await modulePageService.publishDraft(params.pageid);
    
    return NextResponse.json({
      success: true,
      version: updatedPage.version,
      updatedAt: updatedPage.updatedAt,
      message: 'Draft published successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to publish draft: ${error.message}` },
      { status: 500 }
    );
  }
}
```

### 3.3 API Testing

- Buat test untuk API routes baru
- Verifikasi response format dan status code

```typescript
// Di __tests__/api/module/[id]/pages/[pageid]/draft/route.test.ts

describe('Draft API Routes', () => {
  beforeEach(() => {
    // Setup mock data dan service mock
  });
  
  test('POST should save draft and return success response', async () => {
    // Test implementation
  });
  
  test('GET should return draft data if exists', async () => {
    // Test implementation
  });
  
  test('DELETE should discard draft and return success response', async () => {
    // Test implementation
  });
  
  test('PATCH should publish draft and return success response', async () => {
    // Test implementation
  });
});
```

## 4. Dokumentasi API (Hari 3)

### 4.1 Dokumentasi API Draft

- Buat dokumentasi untuk API routes baru
- Jelaskan format request dan response

```markdown
# Draft API Documentation

## Save Draft

**Endpoint:** POST /api/module/:id/pages/:pageid/draft

**Request Body:**
```json
{
  "content": { ... },
  "title": "Page Title",
  "authorId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "draftSavedAt": "2023-08-15T12:34:56.789Z",
  "message": "Draft saved successfully"
}
```

## Get Draft

**Endpoint:** GET /api/module/:id/pages/:pageid/draft

**Response:**
```json
{
  "pageId": "page-123",
  "moduleId": "module-123",
  "content": { ... },
  "title": "Page Title",
  "lastModified": 1692105296789,
  "authorId": "user-123"
}
```

## Discard Draft

**Endpoint:** DELETE /api/module/:id/pages/:pageid/draft

**Response:**
```json
{
  "success": true,
  "message": "Draft discarded successfully"
}
```

## Publish Draft

**Endpoint:** PATCH /api/module/:id/pages/:pageid/draft

**Response:**
```json
{
  "success": true,
  "version": 2,
  "updatedAt": "2023-08-15T12:34:56.789Z",
  "message": "Draft published successfully"
}
```
```

## 5. Validasi dan Testing Final (Hari 3)

### 5.1 Validasi Schema Database

- Verifikasi migrasi database berjalan dengan benar
- Periksa indeks dan relasi

### 5.2 Validasi API Routes

- Test API routes dengan Postman atau Thunder Client
- Verifikasi response format dan status code

### 5.3 Integrasi Testing

- Buat test untuk integrasi antara service dan API routes
- Verifikasi alur data dari API ke database

## Deliverables

1. Schema database yang diperbarui dengan field-field draft
2. Service layer dengan fungsi-fungsi draft baru
3. API routes untuk operasi draft
4. Unit test dan integration test
5. Dokumentasi API

## Risiko dan Mitigasi

### Risiko:

1. **Konflik dengan data yang sudah ada**
   - Mitigasi: Backup database sebelum migrasi dan lakukan testing di lingkungan staging

2. **Performance issues dengan JSONB**
   - Mitigasi: Optimasi query dan tambahkan indeks jika diperlukan

3. **Concurrent editing conflicts**
   - Mitigasi: Implementasikan optimistic locking dengan field `version`

## Checklist Phase 1

- [ ] Update model `ModulePage` di schema Prisma
- [ ] Buat dan jalankan migrasi database
- [ ] Update tipe TypeScript dan Zod schema
- [ ] Implementasi fungsi-fungsi draft di service layer
- [ ] Unit test untuk service layer
- [ ] Update API route yang sudah ada
- [ ] Buat API route baru untuk operasi draft
- [ ] API testing
- [ ] Dokumentasi API
- [ ] Validasi dan testing final

## Next Steps (Phase 2)

Setelah Phase 1 selesai, kita akan melanjutkan ke Phase 2: Implementasi Client-side Core, yang fokus pada:

1. Develop Feedback Service untuk UI feedback
2. Upgrade Hooks & Adapter untuk operasi draft
3. Implementasi debounce dan throttle untuk auto-save
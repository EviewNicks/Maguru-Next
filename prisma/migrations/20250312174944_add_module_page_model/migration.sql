-- CreateTable
CREATE TABLE "module_pages" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "module_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "module_pages_module_id_order_idx" ON "module_pages"("module_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "module_pages_module_id_order_key" ON "module_pages"("module_id", "order");

-- AddForeignKey
ALTER TABLE "module_pages" ADD CONSTRAINT "module_pages_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

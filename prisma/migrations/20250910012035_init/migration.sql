-- CreateTable
CREATE TABLE "public"."analyses" (
    "id" SERIAL NOT NULL,
    "owner" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "analyses_owner_repo_key" ON "public"."analyses"("owner", "repo");

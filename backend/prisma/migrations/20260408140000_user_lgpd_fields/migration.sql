-- LGPD: conta encerrada / consentimento registrado
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "privacyConsentAt" TIMESTAMP(3);

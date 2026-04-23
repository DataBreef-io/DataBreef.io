ALTER TABLE "sources" ADD COLUMN "database_type" text CHECK ("database_type" IN ('CRM', 'Analytics', 'Transactional', 'UserManagement', 'Custom'));

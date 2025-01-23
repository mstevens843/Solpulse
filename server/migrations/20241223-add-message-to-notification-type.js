module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_type typ
            JOIN pg_enum enm ON enm.enumtypid = typ.oid
            WHERE typ.typname = 'enum_Notifications_type' AND enm.enumlabel = 'message'
          ) THEN
            ALTER TYPE "enum_Notifications_type" ADD VALUE 'message';
          END IF;
        END$$;
      `);
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.sequelize.query(`
        BEGIN;
  
        -- Rename the corrupted enum
        ALTER TYPE "enum_Notifications_type" RENAME TO "enum_Notifications_type_old";
  
        -- Recreate the original enum with the correct values
        CREATE TYPE "enum_Notifications_type" AS ENUM ('like', 'comment', 'follow', 'transaction');
  
        -- Update columns to use the recreated enum
        ALTER TABLE "Notifications" ALTER COLUMN "type" TYPE "enum_Notifications_type" USING "type"::text::"enum_Notifications_type";
  
        -- Drop the old, corrupted enum
        DROP TYPE "enum_Notifications_type_old";
  
        COMMIT;
      `);
    },
  };
  
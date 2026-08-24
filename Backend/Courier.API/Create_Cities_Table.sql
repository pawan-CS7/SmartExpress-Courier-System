USE [CourierDB]
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cities')
BEGIN
    CREATE TABLE [dbo].[Cities] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY CLUSTERED,
        [Name] NVARCHAR(150) NOT NULL,
        [Province] NVARCHAR(100) NULL,
        [District] NVARCHAR(100) NULL,
        [PostalCode] NVARCHAR(20) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Cities table created successfully!';
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[Cities]') AND name = 'Province')
    BEGIN
        ALTER TABLE [dbo].[Cities] ADD [Province] NVARCHAR(100) NULL;
        PRINT 'Added Province column to Cities table.';
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[Cities]') AND name = 'District')
    BEGIN
        IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[Cities]') AND name = 'Zone')
        BEGIN
            EXEC sp_rename '[dbo].[Cities].Zone', 'District', 'COLUMN';
            PRINT 'Renamed Zone column to District.';
        END
        ELSE
        BEGIN
            ALTER TABLE [dbo].[Cities] ADD [District] NVARCHAR(100) NULL;
            PRINT 'Added District column to Cities table.';
        END
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[Cities]') AND name = 'PostalCode')
    BEGIN
        ALTER TABLE [dbo].[Cities] ADD [PostalCode] NVARCHAR(20) NULL;
        PRINT 'Added PostalCode column to Cities table.';
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[Cities]') AND name = 'IsActive')
    BEGIN
        ALTER TABLE [dbo].[Cities] ADD [IsActive] BIT NOT NULL DEFAULT 1;
        PRINT 'Added IsActive column to Cities table.';
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[Cities]') AND name = 'CreatedAt')
    BEGIN
        ALTER TABLE [dbo].[Cities] ADD [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE();
        PRINT 'Added CreatedAt column to Cities table.';
    END

    PRINT 'Cities table schema verified and updated successfully!';
END
GO

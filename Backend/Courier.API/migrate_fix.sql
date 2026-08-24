BEGIN TRANSACTION;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'TrackingNumber' AND Object_ID = Object_ID(N'Orders'))
BEGIN
    ALTER TABLE [Orders] ADD [TrackingNumber] nvarchar(450) NULL;
END
GO

UPDATE Orders SET TrackingNumber = WaybillId WHERE TrackingNumber IS NULL;
GO

-- Drop constraints on WaybillId
DECLARE @sql NVARCHAR(MAX) = N'';

SELECT @sql += N'ALTER TABLE [Orders] DROP CONSTRAINT ' + QUOTENAME(c.name) + N';' + CHAR(13)
FROM sys.key_constraints c
JOIN sys.index_columns ic ON c.parent_object_id = ic.object_id AND c.unique_index_id = ic.index_id
JOIN sys.columns col ON ic.object_id = col.object_id AND ic.column_id = col.column_id
WHERE c.parent_object_id = OBJECT_ID('Orders') AND col.name = 'WaybillId';

SELECT @sql += N'DROP INDEX ' + QUOTENAME(i.name) + N' ON [Orders];' + CHAR(13)
FROM sys.indexes i
JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
JOIN sys.columns col ON ic.object_id = col.object_id AND ic.column_id = col.column_id
WHERE i.object_id = OBJECT_ID('Orders') AND col.name = 'WaybillId' AND i.is_primary_key = 0 AND i.is_unique_constraint = 0;

EXEC sp_executesql @sql;
GO

IF EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'WaybillId' AND Object_ID = Object_ID(N'Orders'))
BEGIN
    ALTER TABLE [Orders] DROP COLUMN [WaybillId];
END
GO

IF EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'OrderNo' AND Object_ID = Object_ID(N'Orders'))
BEGIN
    ALTER TABLE [Orders] DROP COLUMN [OrderNo];
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TrackingPrefixStates]') AND type in (N'U'))
BEGIN
CREATE TABLE [TrackingPrefixStates] (
    [Id] int NOT NULL IDENTITY,
    [CurrentPrefix] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_TrackingPrefixStates] PRIMARY KEY ([Id])
);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Orders_TrackingNumber' AND object_id = OBJECT_ID('Orders'))
BEGIN
CREATE UNIQUE INDEX [IX_Orders_TrackingNumber] ON [Orders] ([TrackingNumber]) WHERE [TrackingNumber] IS NOT NULL;
END
GO

IF NOT EXISTS (SELECT * FROM [__EFMigrationsHistory] WHERE MigrationId = N'20260821152326_UnifyTrackingNumber')
BEGIN
INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260821152326_UnifyTrackingNumber', N'8.0.0');
END
GO

COMMIT TRANSACTION;
GO

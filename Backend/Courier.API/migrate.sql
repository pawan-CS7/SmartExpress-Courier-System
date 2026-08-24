BEGIN TRANSACTION;
GO

ALTER TABLE [Orders] ADD [TrackingNumber] nvarchar(450) NULL;
GO

UPDATE Orders SET TrackingNumber = WaybillId
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Orders]') AND [c].[name] = N'OrderNo');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Orders] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [Orders] DROP COLUMN [OrderNo];
GO

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Orders]') AND [c].[name] = N'WaybillId');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Orders] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [Orders] DROP COLUMN [WaybillId];
GO

CREATE TABLE [TrackingPrefixStates] (
    [Id] int NOT NULL IDENTITY,
    [CurrentPrefix] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_TrackingPrefixStates] PRIMARY KEY ([Id])
);
GO

CREATE UNIQUE INDEX [IX_Orders_TrackingNumber] ON [Orders] ([TrackingNumber]) WHERE [TrackingNumber] IS NOT NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260821152326_UnifyTrackingNumber', N'8.0.0');
GO

COMMIT;
GO


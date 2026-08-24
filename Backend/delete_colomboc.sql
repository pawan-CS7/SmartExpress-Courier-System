SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

DECLARE @UserId INT;
DECLARE @ClientId INT;

-- Find User
SELECT @UserId = Id, @ClientId = ClientId 
FROM Users 
WHERE Email = 'colomboc@gmail.com';

-- Find Client directly if user didn't have the link
IF @ClientId IS NULL
BEGIN
    SELECT @ClientId = Id FROM Clients WHERE Email = 'colomboc@gmail.com';
END

PRINT 'UserId: ' + ISNULL(CAST(@UserId AS VARCHAR), 'NULL');
PRINT 'ClientId: ' + ISNULL(CAST(@ClientId AS VARCHAR), 'NULL');

-- Delete Notifications
IF @UserId IS NOT NULL
BEGIN
    DELETE FROM Notifications WHERE TargetId = @UserId;
END

-- Delete Orders and their History for this Client
IF @ClientId IS NOT NULL
BEGIN
    -- Temporary table for order IDs
    SELECT Id INTO #TempOrders FROM Orders WHERE ClientId = @ClientId;
    
    -- Delete Order History
    DELETE FROM OrderStatusHistory WHERE OrderId IN (SELECT Id FROM #TempOrders);
    
    -- Delete Orders
    DELETE FROM Orders WHERE Id IN (SELECT Id FROM #TempOrders);
    
    DROP TABLE #TempOrders;
END

-- Delete User
IF @UserId IS NOT NULL
BEGIN
    DELETE FROM Users WHERE Id = @UserId;
    PRINT 'Deleted User';
END

-- Delete Client
IF @ClientId IS NOT NULL
BEGIN
    DELETE FROM Clients WHERE Id = @ClientId;
    PRINT 'Deleted Client';
END

PRINT 'Done.';

$connectionString = "Server=LAPTOP-5COUVOUD\SQLEXPRESS;Database=CourierDB;Trusted_Connection=True;TrustServerCertificate=True;"

try {
    $conn = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $conn.Open()
    $cmd = $conn.CreateCommand()

    # Cities Table Schema Check & Creation
    $cmd.CommandText = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cities')
BEGIN
    CREATE TABLE Cities (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(150) NOT NULL,
        Province NVARCHAR(100) NULL,
        District NVARCHAR(100) NULL,
        PostalCode NVARCHAR(20) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Cities') AND name = 'Province')
        ALTER TABLE Cities ADD Province NVARCHAR(100) NULL;

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Cities') AND name = 'District')
    BEGIN
        IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Cities') AND name = 'Zone')
            EXEC sp_rename 'Cities.Zone', 'District', 'COLUMN';
        ELSE
            ALTER TABLE Cities ADD District NVARCHAR(100) NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Cities') AND name = 'PostalCode')
        ALTER TABLE Cities ADD PostalCode NVARCHAR(20) NULL;

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Cities') AND name = 'IsActive')
        ALTER TABLE Cities ADD IsActive BIT NOT NULL DEFAULT 1;

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Cities') AND name = 'CreatedAt')
        ALTER TABLE Cities ADD CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE();
END
"@
    $cmd.ExecuteNonQuery() | Out-Null

    # Branches Table Schema Check & Creation
    $cmd.CommandText = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Branches')
BEGIN
    CREATE TABLE Branches (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(150) NOT NULL,
        CityId INT NOT NULL,
        Address NVARCHAR(250) NULL,
        ContactInfo NVARCHAR(50) NULL,
        Latitude FLOAT NULL,
        Longitude FLOAT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Branches') AND name = 'CityId')
        ALTER TABLE Branches ADD CityId INT NOT NULL DEFAULT 1;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Branches') AND name = 'Address')
        ALTER TABLE Branches ADD Address NVARCHAR(250) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Branches') AND name = 'ContactInfo')
        ALTER TABLE Branches ADD ContactInfo NVARCHAR(50) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Branches') AND name = 'Latitude')
        ALTER TABLE Branches ADD Latitude FLOAT NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Branches') AND name = 'Longitude')
        ALTER TABLE Branches ADD Longitude FLOAT NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Branches') AND name = 'IsActive')
        ALTER TABLE Branches ADD IsActive BIT NOT NULL DEFAULT 1;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Branches') AND name = 'CreatedAt')
        ALTER TABLE Branches ADD CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE();
END
"@
    $cmd.ExecuteNonQuery() | Out-Null

    $conn.Close()
    Write-Host "Cities (with Province, District, Name, PostalCode, IsActive) and Branches tables verified successfully!"
} catch {
    Write-Host "Error ensuring tables: $_"
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Courier.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateExistingWaybillsToNewFormat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Waybills
                SET Barcode = 'AA' + RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR), 6)
                WHERE ISNUMERIC(Barcode) = 1 OR LEN(Barcode) > 8;

                UPDATE Orders
                SET TrackingNumber = 'AA' + RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR), 6)
                WHERE ISNUMERIC(TrackingNumber) = 1 OR LEN(TrackingNumber) > 8;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Courier.API.Migrations
{
    /// <inheritdoc />
    public partial class AddOriginAndDestinationBranchId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OriginalBranchId",
                table: "Orders",
                newName: "OriginBranchId");

            migrationBuilder.AddColumn<int>(
                name: "DestinationBranchId",
                table: "Orders",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DestinationBranchId",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "OriginBranchId",
                table: "Orders",
                newName: "OriginalBranchId");
        }
    }
}

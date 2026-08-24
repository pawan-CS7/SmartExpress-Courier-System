using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Courier.API.Migrations
{
    /// <inheritdoc />
    public partial class UnifyTrackingNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TrackingNumber",
                table: "Orders",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.Sql("UPDATE Orders SET TrackingNumber = WaybillId");

            migrationBuilder.DropColumn(
                name: "OrderNo",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "WaybillId",
                table: "Orders");

            migrationBuilder.CreateTable(
                name: "TrackingPrefixStates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CurrentPrefix = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrackingPrefixStates", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_TrackingNumber",
                table: "Orders",
                column: "TrackingNumber",
                unique: true,
                filter: "[TrackingNumber] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrackingPrefixStates");

            migrationBuilder.DropIndex(
                name: "IX_Orders_TrackingNumber",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TrackingNumber",
                table: "Orders");

            migrationBuilder.AddColumn<string>(
                name: "OrderNo",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WaybillId",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}

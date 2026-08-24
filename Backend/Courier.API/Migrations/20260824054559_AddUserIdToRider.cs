using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Courier.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToRider : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE Orders SET AssignedRiderId = NULL");
            migrationBuilder.Sql("DELETE FROM Riders");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Riders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Riders_UserId",
                table: "Riders",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Riders_Users_UserId",
                table: "Riders",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Riders_Users_UserId",
                table: "Riders");

            migrationBuilder.DropIndex(
                name: "IX_Riders_UserId",
                table: "Riders");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Riders");
        }
    }
}

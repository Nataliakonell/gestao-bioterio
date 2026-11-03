using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRotinaAnimalIdInRotinaAnimalLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "TipoOperacao",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "CREATE",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "RF",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "RotinaAnimalId",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_RotinasAnimaisLogs_RotinaAnimalId",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                column: "RotinaAnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_RotinasAnimaisLogs_RotinaAnimalId_DataCriacao",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                columns: new[] { "RotinaAnimalId", "DataCriacao" });

            migrationBuilder.AddForeignKey(
                name: "FK_RotinasAnimaisLogs_RotinasAnimais_RotinaAnimalId",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                column: "RotinaAnimalId",
                principalSchema: "bioterio",
                principalTable: "RotinasAnimais",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RotinasAnimaisLogs_RotinasAnimais_RotinaAnimalId",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.DropIndex(
                name: "IX_RotinasAnimaisLogs_RotinaAnimalId",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.DropIndex(
                name: "IX_RotinasAnimaisLogs_RotinaAnimalId_DataCriacao",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.DropColumn(
                name: "RotinaAnimalId",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.AlterColumn<string>(
                name: "TipoOperacao",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "CREATE");

            migrationBuilder.AlterColumn<string>(
                name: "RF",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);
        }
    }
}

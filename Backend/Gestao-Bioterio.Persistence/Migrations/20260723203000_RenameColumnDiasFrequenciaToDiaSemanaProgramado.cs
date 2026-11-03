using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RenameColumnDiasFrequenciaToDiaSemanaProgramado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DiasFrequencia",
                schema: "bioterio",
                table: "RotinasAnimais",
                newName: "DiaSemanaProgramado");

            migrationBuilder.RenameColumn(
                name: "DiasFrequencia",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                newName: "DiaSemanaProgramado");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DiaSemanaProgramado",
                schema: "bioterio",
                table: "RotinasAnimais",
                newName: "DiasFrequencia");

            migrationBuilder.RenameColumn(
                name: "DiaSemanaProgramado",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                newName: "DiasFrequencia");
        }
    }
}

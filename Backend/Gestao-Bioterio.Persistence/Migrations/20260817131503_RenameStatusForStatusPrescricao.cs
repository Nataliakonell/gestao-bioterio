using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RenameStatusForStatusPrescricao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Status",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                newName: "StatusPrescricao");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StatusPrescricao",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                newName: "Status");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMotivoConsultaFromConsulta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MotivoConsulta",
                schema: "bioterio",
                table: "Consultas");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MotivoConsulta",
                schema: "bioterio",
                table: "Consultas",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}

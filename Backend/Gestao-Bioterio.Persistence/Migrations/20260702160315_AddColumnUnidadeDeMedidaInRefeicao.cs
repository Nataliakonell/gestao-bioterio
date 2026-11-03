using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddColumnUnidadeDeMedidaInRefeicao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UnidadeDeMedida",
                schema: "bioterio",
                table: "Refeicoes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "g");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UnidadeDeMedida",
                schema: "bioterio",
                table: "Refeicoes");
        }
    }
}

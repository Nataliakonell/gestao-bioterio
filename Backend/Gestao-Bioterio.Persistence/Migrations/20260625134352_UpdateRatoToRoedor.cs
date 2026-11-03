using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRatoToRoedor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE bioterio.Refeicoes SET TipoRefeicao = 'Roedor' WHERE TipoRefeicao = 'rato';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE bioterio.Refeicoes SET TipoRefeicao = 'rato' WHERE TipoRefeicao = 'Roedor';");
        }
    }
}

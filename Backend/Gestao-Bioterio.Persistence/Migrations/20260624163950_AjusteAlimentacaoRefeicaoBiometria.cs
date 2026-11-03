using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AjusteAlimentacaoRefeicaoBiometria : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "bioterio",
                table: "Alimentacoes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Pendente");

            migrationBuilder.Sql("UPDATE [bioterio].[Alimentacoes] SET [Status] = 'Alimentada' WHERE [ResultadoAlimentacao] = 1");
            migrationBuilder.Sql("UPDATE [bioterio].[Alimentacoes] SET [Status] = 'Pendente' WHERE [ResultadoAlimentacao] = 0");

            migrationBuilder.DropColumn(
                name: "ResultadoAlimentacao",
                schema: "bioterio",
                table: "Alimentacoes");

            migrationBuilder.AddColumn<decimal>(
                name: "ComprimentoCauda",
                schema: "bioterio",
                table: "BiometriasAnimais",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ResultadoAlimentacao",
                schema: "bioterio",
                table: "Alimentacoes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql("UPDATE [bioterio].[Alimentacoes] SET [ResultadoAlimentacao] = 1 WHERE [Status] = 'Alimentada'");
            migrationBuilder.Sql("UPDATE [bioterio].[Alimentacoes] SET [ResultadoAlimentacao] = 0 WHERE [Status] = 'Pendente'");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "bioterio",
                table: "Alimentacoes");

            migrationBuilder.DropColumn(
                name: "ComprimentoCauda",
                schema: "bioterio",
                table: "BiometriasAnimais");
        }
    }
}

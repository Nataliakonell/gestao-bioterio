using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNomeProfissionalToAuditableEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "TiposProcedimento",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "SolicitacoesExame",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "RotinasAnimais",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Refeicoes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "ProtocolosDesverminacao",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Procedimentos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "ModelosDocumento",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "MedicacoesAdministradas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Evolucoes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "DosesAplicacaoDesverminacao",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Consultas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "BiometriasAnimais",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Animals",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "AnimaisLog",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Anexos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Alimentacoes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "TiposProcedimento");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "SolicitacoesExame");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "RotinasAnimais");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Refeicoes");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "ProtocolosDesverminacao");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Procedimentos");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "PrescricoesMedicacao");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "ModelosDocumento");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "MedicacoesAdministradas");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "LiberacoesQuarentena");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Evolucoes");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "DosesAplicacaoDesverminacao");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "BiometriasAnimais");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Animals");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "AnimaisLog");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Anexos");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "AltaAmbulatoriais");

            migrationBuilder.DropColumn(
                name: "NomeProfissional",
                schema: "bioterio",
                table: "Alimentacoes");
        }
    }
}

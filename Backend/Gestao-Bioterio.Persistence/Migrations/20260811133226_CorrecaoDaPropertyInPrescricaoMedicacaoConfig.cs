using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CorrecaoDaPropertyInPrescricaoMedicacaoConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicacoesAdministradas_PrescricoesMedicacao_PrescricaoMedicacaoId1",
                schema: "bioterio",
                table: "MedicacoesAdministradas");

            migrationBuilder.DropIndex(
                name: "IX_MedicacoesAdministradas_PrescricaoMedicacaoId1",
                schema: "bioterio",
                table: "MedicacoesAdministradas");

            migrationBuilder.DropColumn(
                name: "PrescricaoMedicacaoId1",
                schema: "bioterio",
                table: "MedicacoesAdministradas");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PrescricaoMedicacaoId1",
                schema: "bioterio",
                table: "MedicacoesAdministradas",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicacoesAdministradas_PrescricaoMedicacaoId1",
                schema: "bioterio",
                table: "MedicacoesAdministradas",
                column: "PrescricaoMedicacaoId1");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicacoesAdministradas_PrescricoesMedicacao_PrescricaoMedicacaoId1",
                schema: "bioterio",
                table: "MedicacoesAdministradas",
                column: "PrescricaoMedicacaoId1",
                principalSchema: "bioterio",
                principalTable: "PrescricoesMedicacao",
                principalColumn: "Id");
        }
    }
}

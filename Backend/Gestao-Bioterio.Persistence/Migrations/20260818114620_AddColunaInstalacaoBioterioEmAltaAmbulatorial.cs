using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddColunaInstalacaoBioterioEmAltaAmbulatorial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "InstalacaoBioterioRetornoId",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AltaAmbulatoriais_InstalacaoBioterioRetornoId",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                column: "InstalacaoBioterioRetornoId");

            migrationBuilder.AddForeignKey(
                name: "FK_AltaAmbulatoriais_InstalacoesBioterio_InstalacaoBioterioRetornoId",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                column: "InstalacaoBioterioRetornoId",
                principalSchema: "bioterio",
                principalTable: "InstalacoesBioterio",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AltaAmbulatoriais_InstalacoesBioterio_InstalacaoBioterioRetornoId",
                schema: "bioterio",
                table: "AltaAmbulatoriais");

            migrationBuilder.DropIndex(
                name: "IX_AltaAmbulatoriais_InstalacaoBioterioRetornoId",
                schema: "bioterio",
                table: "AltaAmbulatoriais");

            migrationBuilder.DropColumn(
                name: "InstalacaoBioterioRetornoId",
                schema: "bioterio",
                table: "AltaAmbulatoriais");
        }
    }
}

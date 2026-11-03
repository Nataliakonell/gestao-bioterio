using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLocalizacaoIdFromEvento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Evento_Localizacao_LocalizacaoId",
                schema: "bioterio",
                table: "Evento");

            migrationBuilder.DropIndex(
                name: "IX_Evento_LocalizacaoId",
                schema: "bioterio",
                table: "Evento");

            migrationBuilder.DropColumn(
                name: "LocalizacaoId",
                schema: "bioterio",
                table: "Evento");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LocalizacaoId",
                schema: "bioterio",
                table: "Evento",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Evento_LocalizacaoId",
                schema: "bioterio",
                table: "Evento",
                column: "LocalizacaoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Evento_Localizacao_LocalizacaoId",
                schema: "bioterio",
                table: "Evento",
                column: "LocalizacaoId",
                principalSchema: "bioterio",
                principalTable: "Localizacao",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

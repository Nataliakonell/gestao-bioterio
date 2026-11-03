using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddColumnObservacoesInAlimentacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Observacoes",
                schema: "bioterio",
                table: "Alimentacoes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.Sql("DELETE FROM [bioterio].[BiometriasAnimais] WHERE [AnimalId] NOT IN (SELECT [Id] FROM [bioterio].[Animals]);");

            migrationBuilder.CreateIndex(
                name: "IX_BiometriasAnimais_AnimalId",
                schema: "bioterio",
                table: "BiometriasAnimais",
                column: "AnimalId");

            migrationBuilder.AddForeignKey(
                name: "FK_BiometriasAnimais_Animals_AnimalId",
                schema: "bioterio",
                table: "BiometriasAnimais",
                column: "AnimalId",
                principalSchema: "bioterio",
                principalTable: "Animals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BiometriasAnimais_Animals_AnimalId",
                schema: "bioterio",
                table: "BiometriasAnimais");

            migrationBuilder.DropIndex(
                name: "IX_BiometriasAnimais_AnimalId",
                schema: "bioterio",
                table: "BiometriasAnimais");

            migrationBuilder.DropColumn(
                name: "Observacoes",
                schema: "bioterio",
                table: "Alimentacoes");
        }
    }
}

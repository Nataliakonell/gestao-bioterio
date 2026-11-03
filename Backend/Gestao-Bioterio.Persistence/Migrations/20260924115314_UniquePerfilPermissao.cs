using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UniquePerfilPermissao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PerfilPermissao_PerfilId",
                schema: "bioterio",
                table: "PerfilPermissao");

            migrationBuilder.CreateIndex(
                name: "IX_PerfilPermissao_PerfilId_FuncionalidadeId",
                schema: "bioterio",
                table: "PerfilPermissao",
                columns: new[] { "PerfilId", "FuncionalidadeId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PerfilPermissao_PerfilId_FuncionalidadeId",
                schema: "bioterio",
                table: "PerfilPermissao");

            migrationBuilder.CreateIndex(
                name: "IX_PerfilPermissao_PerfilId",
                schema: "bioterio",
                table: "PerfilPermissao",
                column: "PerfilId");
        }
    }
}

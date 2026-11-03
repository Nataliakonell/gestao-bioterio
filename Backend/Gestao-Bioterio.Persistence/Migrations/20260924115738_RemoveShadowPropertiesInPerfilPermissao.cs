using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveShadowPropertiesInPerfilPermissao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PerfilPermissao_Funcionalidade_FuncionalidadeId1",
                schema: "bioterio",
                table: "PerfilPermissao");

            migrationBuilder.DropForeignKey(
                name: "FK_PerfilPermissao_Perfis_PerfilId1",
                schema: "bioterio",
                table: "PerfilPermissao");

            migrationBuilder.DropIndex(
                name: "IX_PerfilPermissao_FuncionalidadeId1",
                schema: "bioterio",
                table: "PerfilPermissao");

            migrationBuilder.DropIndex(
                name: "IX_PerfilPermissao_PerfilId1",
                schema: "bioterio",
                table: "PerfilPermissao");

            migrationBuilder.DropColumn(
                name: "FuncionalidadeId1",
                schema: "bioterio",
                table: "PerfilPermissao");

            migrationBuilder.DropColumn(
                name: "PerfilId1",
                schema: "bioterio",
                table: "PerfilPermissao");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FuncionalidadeId1",
                schema: "bioterio",
                table: "PerfilPermissao",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PerfilId1",
                schema: "bioterio",
                table: "PerfilPermissao",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PerfilPermissao_FuncionalidadeId1",
                schema: "bioterio",
                table: "PerfilPermissao",
                column: "FuncionalidadeId1");

            migrationBuilder.CreateIndex(
                name: "IX_PerfilPermissao_PerfilId1",
                schema: "bioterio",
                table: "PerfilPermissao",
                column: "PerfilId1");

            migrationBuilder.AddForeignKey(
                name: "FK_PerfilPermissao_Funcionalidade_FuncionalidadeId1",
                schema: "bioterio",
                table: "PerfilPermissao",
                column: "FuncionalidadeId1",
                principalSchema: "bioterio",
                principalTable: "Funcionalidade",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PerfilPermissao_Perfis_PerfilId1",
                schema: "bioterio",
                table: "PerfilPermissao",
                column: "PerfilId1",
                principalSchema: "bioterio",
                principalTable: "Perfis",
                principalColumn: "Id");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModeloDocumentoHeaderFooter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Conteudo",
                schema: "bioterio",
                table: "ModelosDocumento",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "ConfiguracaoLayoutJson",
                schema: "bioterio",
                table: "ModelosDocumento",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FooterTemplateId",
                schema: "bioterio",
                table: "ModelosDocumento",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HeaderTemplateId",
                schema: "bioterio",
                table: "ModelosDocumento",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TipoSecao",
                schema: "bioterio",
                table: "ModelosDocumento",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ModelosDocumento_FooterTemplateId",
                schema: "bioterio",
                table: "ModelosDocumento",
                column: "FooterTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelosDocumento_HeaderTemplateId",
                schema: "bioterio",
                table: "ModelosDocumento",
                column: "HeaderTemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_ModelosDocumento_ModelosDocumento_FooterTemplateId",
                schema: "bioterio",
                table: "ModelosDocumento",
                column: "FooterTemplateId",
                principalSchema: "bioterio",
                principalTable: "ModelosDocumento",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ModelosDocumento_ModelosDocumento_HeaderTemplateId",
                schema: "bioterio",
                table: "ModelosDocumento",
                column: "HeaderTemplateId",
                principalSchema: "bioterio",
                principalTable: "ModelosDocumento",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ModelosDocumento_ModelosDocumento_FooterTemplateId",
                schema: "bioterio",
                table: "ModelosDocumento");

            migrationBuilder.DropForeignKey(
                name: "FK_ModelosDocumento_ModelosDocumento_HeaderTemplateId",
                schema: "bioterio",
                table: "ModelosDocumento");

            migrationBuilder.DropIndex(
                name: "IX_ModelosDocumento_FooterTemplateId",
                schema: "bioterio",
                table: "ModelosDocumento");

            migrationBuilder.DropIndex(
                name: "IX_ModelosDocumento_HeaderTemplateId",
                schema: "bioterio",
                table: "ModelosDocumento");

            migrationBuilder.DropColumn(
                name: "ConfiguracaoLayoutJson",
                schema: "bioterio",
                table: "ModelosDocumento");

            migrationBuilder.DropColumn(
                name: "FooterTemplateId",
                schema: "bioterio",
                table: "ModelosDocumento");

            migrationBuilder.DropColumn(
                name: "HeaderTemplateId",
                schema: "bioterio",
                table: "ModelosDocumento");

            migrationBuilder.DropColumn(
                name: "TipoSecao",
                schema: "bioterio",
                table: "ModelosDocumento");

            migrationBuilder.AlterColumn<string>(
                name: "Conteudo",
                schema: "bioterio",
                table: "ModelosDocumento",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}

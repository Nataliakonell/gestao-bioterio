using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTipoProcedimento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LiberacoesQuarentena_InstalacoesBioterio_InstalacaoBioterioId",
                schema: "bioterio",
                table: "LiberacoesQuarentena");

            migrationBuilder.DropIndex(
                name: "IX_Procedimentos_TipoProcedimento",
                schema: "bioterio",
                table: "Procedimentos");

            migrationBuilder.DropIndex(
                name: "IX_LiberacoesQuarentena_AtendimentoId",
                schema: "bioterio",
                table: "LiberacoesQuarentena");

            migrationBuilder.DropColumn(
                name: "Detalhamento",
                schema: "bioterio",
                table: "Procedimentos");

            migrationBuilder.DropColumn(
                name: "TipoProcedimento",
                schema: "bioterio",
                table: "Procedimentos");

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                schema: "bioterio",
                table: "Procedimentos",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000);

            migrationBuilder.AddColumn<int>(
                name: "TipoProcedimentoId",
                schema: "bioterio",
                table: "Procedimentos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "TiposProcedimento",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposProcedimento", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Procedimentos_TipoProcedimentoId",
                schema: "bioterio",
                table: "Procedimentos",
                column: "TipoProcedimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_LiberacoesQuarentena_AtendimentoId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                column: "AtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_TiposProcedimento_Nome",
                schema: "bioterio",
                table: "TiposProcedimento",
                column: "Nome",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_LiberacoesQuarentena_InstalacoesBioterio_InstalacaoBioterioId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                column: "InstalacaoBioterioId",
                principalSchema: "bioterio",
                principalTable: "InstalacoesBioterio",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Procedimentos_TiposProcedimento_TipoProcedimentoId",
                schema: "bioterio",
                table: "Procedimentos",
                column: "TipoProcedimentoId",
                principalSchema: "bioterio",
                principalTable: "TiposProcedimento",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LiberacoesQuarentena_InstalacoesBioterio_InstalacaoBioterioId",
                schema: "bioterio",
                table: "LiberacoesQuarentena");

            migrationBuilder.DropForeignKey(
                name: "FK_Procedimentos_TiposProcedimento_TipoProcedimentoId",
                schema: "bioterio",
                table: "Procedimentos");

            migrationBuilder.DropTable(
                name: "TiposProcedimento",
                schema: "bioterio");

            migrationBuilder.DropIndex(
                name: "IX_Procedimentos_TipoProcedimentoId",
                schema: "bioterio",
                table: "Procedimentos");

            migrationBuilder.DropIndex(
                name: "IX_LiberacoesQuarentena_AtendimentoId",
                schema: "bioterio",
                table: "LiberacoesQuarentena");

            migrationBuilder.DropColumn(
                name: "TipoProcedimentoId",
                schema: "bioterio",
                table: "Procedimentos");

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                schema: "bioterio",
                table: "Procedimentos",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Detalhamento",
                schema: "bioterio",
                table: "Procedimentos",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TipoProcedimento",
                schema: "bioterio",
                table: "Procedimentos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Procedimentos_TipoProcedimento",
                schema: "bioterio",
                table: "Procedimentos",
                column: "TipoProcedimento");

            migrationBuilder.CreateIndex(
                name: "IX_LiberacoesQuarentena_AtendimentoId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                column: "AtendimentoId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_LiberacoesQuarentena_InstalacoesBioterio_InstalacaoBioterioId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                column: "InstalacaoBioterioId",
                principalSchema: "bioterio",
                principalTable: "InstalacoesBioterio",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

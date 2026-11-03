using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLiberacaoQuarentena : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LiberacoesQuarentena",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AtendimentoId = table.Column<int>(type: "int", nullable: false),
                    DataEntradaQuarentena = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataSaidaQuarentena = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InstalacaoBioterioId = table.Column<int>(type: "int", nullable: true),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LiberacoesQuarentena", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LiberacoesQuarentena_Atendimentos_AtendimentoId",
                        column: x => x.AtendimentoId,
                        principalSchema: "bioterio",
                        principalTable: "Atendimentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LiberacoesQuarentena_InstalacoesBioterio_InstalacaoBioterioId",
                        column: x => x.InstalacaoBioterioId,
                        principalSchema: "bioterio",
                        principalTable: "InstalacoesBioterio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LiberacoesQuarentena_AtendimentoId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                column: "AtendimentoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LiberacoesQuarentena_InstalacaoBioterioId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                column: "InstalacaoBioterioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LiberacoesQuarentena",
                schema: "bioterio");
        }
    }
}

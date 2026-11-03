using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAltaAmbulatorial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AltaAmbulatoriais",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AtendimentoId = table.Column<int>(type: "int", nullable: false),
                    DataEntradaAmbulatorio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProcedimentosMedicacoes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ObservacoesClinicas = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AltaAmbulatoriais", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AltaAmbulatoriais_Atendimentos_AtendimentoId",
                        column: x => x.AtendimentoId,
                        principalSchema: "bioterio",
                        principalTable: "Atendimentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AltaAmbulatoriais_AtendimentoId",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                column: "AtendimentoId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AltaAmbulatoriais",
                schema: "bioterio");
        }
    }
}

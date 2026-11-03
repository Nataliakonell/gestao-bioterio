using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAtendimentoAndAddConsulta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AltaAmbulatoriais_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "AltaAmbulatoriais");

            migrationBuilder.DropForeignKey(
                name: "FK_Anexos_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "Anexos");

            migrationBuilder.DropForeignKey(
                name: "FK_Evolucoes_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "Evolucoes");

            migrationBuilder.DropForeignKey(
                name: "FK_LiberacoesQuarentena_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "LiberacoesQuarentena");

            migrationBuilder.DropForeignKey(
                name: "FK_LiberacoesQuarentena_InstalacoesBioterio_InstalacaoBioterioId",
                schema: "bioterio",
                table: "LiberacoesQuarentena");

            migrationBuilder.DropForeignKey(
                name: "FK_PrescricoesMedicacao_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "PrescricoesMedicacao");

            migrationBuilder.DropForeignKey(
                name: "FK_Procedimentos_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "Procedimentos");

            migrationBuilder.DropForeignKey(
                name: "FK_SolicitacoesExame_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "SolicitacoesExame");

            migrationBuilder.Sql(@"
                UPDATE l
                SET l.AtendimentoId = a.AnimalId
                FROM [bioterio].[LiberacoesQuarentena] l
                INNER JOIN [bioterio].[Atendimentos] a ON l.AtendimentoId = a.Id
                WHERE l.AtendimentoId IS NOT NULL;
            ");

            migrationBuilder.Sql(@"
                UPDATE l
                SET l.AtendimentoId = a.AnimalId
                FROM [bioterio].[AltaAmbulatoriais] l
                INNER JOIN [bioterio].[Atendimentos] a ON l.AtendimentoId = a.Id
                WHERE l.AtendimentoId IS NOT NULL;
            ");

            migrationBuilder.Sql(@"
                DELETE FROM [bioterio].[LiberacoesQuarentena]
                WHERE AtendimentoId NOT IN (SELECT Id FROM [bioterio].[Animals]);
            ");

            migrationBuilder.Sql(@"
                DELETE FROM [bioterio].[AltaAmbulatoriais]
                WHERE AtendimentoId NOT IN (SELECT Id FROM [bioterio].[Animals]);
            ");

            migrationBuilder.DropTable(
                name: "Atendimentos",
                schema: "bioterio");

            migrationBuilder.DropIndex(
                name: "IX_SolicitacoesExame_AtendimentoId",
                schema: "bioterio",
                table: "SolicitacoesExame");

            migrationBuilder.DropIndex(
                name: "IX_Procedimentos_AtendimentoId",
                schema: "bioterio",
                table: "Procedimentos");

            migrationBuilder.DropIndex(
                name: "IX_PrescricoesMedicacao_AtendimentoId",
                schema: "bioterio",
                table: "PrescricoesMedicacao");

            migrationBuilder.DropIndex(
                name: "IX_Evolucoes_AtendimentoId",
                schema: "bioterio",
                table: "Evolucoes");

            migrationBuilder.DropIndex(
                name: "IX_Anexos_AtendimentoId",
                schema: "bioterio",
                table: "Anexos");

            migrationBuilder.DropIndex(
                name: "IX_AltaAmbulatoriais_AtendimentoId",
                schema: "bioterio",
                table: "AltaAmbulatoriais");

            migrationBuilder.DropColumn(
                name: "AtendimentoId",
                schema: "bioterio",
                table: "SolicitacoesExame");

            migrationBuilder.DropColumn(
                name: "AtendimentoId",
                schema: "bioterio",
                table: "Procedimentos");

            migrationBuilder.DropColumn(
                name: "AtendimentoId",
                schema: "bioterio",
                table: "PrescricoesMedicacao");

            migrationBuilder.DropColumn(
                name: "AtendimentoId",
                schema: "bioterio",
                table: "Evolucoes");

            migrationBuilder.DropColumn(
                name: "AtendimentoId",
                schema: "bioterio",
                table: "Anexos");

            migrationBuilder.RenameColumn(
                name: "AtendimentoId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                newName: "AnimalId");

            migrationBuilder.RenameIndex(
                name: "IX_LiberacoesQuarentena_AtendimentoId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                newName: "IX_LiberacoesQuarentena_AnimalId");

            migrationBuilder.RenameColumn(
                name: "AtendimentoId",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                newName: "AnimalId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataAltaClinica",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "Consultas",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    Anamnese = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MotivoConsulta = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExameFisico = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SuspeitaDiagnostica = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InstalacaoBioterioId = table.Column<int>(type: "int", nullable: true),
                    DataHoraConsulta = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Consultas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Consultas_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalSchema: "bioterio",
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Consultas_InstalacoesBioterio_InstalacaoBioterioId",
                        column: x => x.InstalacaoBioterioId,
                        principalSchema: "bioterio",
                        principalTable: "InstalacoesBioterio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesExame_AnimalId",
                schema: "bioterio",
                table: "SolicitacoesExame",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_AltaAmbulatoriais_AnimalId",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_AnimalId",
                schema: "bioterio",
                table: "Consultas",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_DataHoraConsulta",
                schema: "bioterio",
                table: "Consultas",
                column: "DataHoraConsulta");

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_InstalacaoBioterioId",
                schema: "bioterio",
                table: "Consultas",
                column: "InstalacaoBioterioId");

            migrationBuilder.AddForeignKey(
                name: "FK_AltaAmbulatoriais_Animals_AnimalId",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                column: "AnimalId",
                principalSchema: "bioterio",
                principalTable: "Animals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LiberacoesQuarentena_Animals_AnimalId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                column: "AnimalId",
                principalSchema: "bioterio",
                principalTable: "Animals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AltaAmbulatoriais_Animals_AnimalId",
                schema: "bioterio",
                table: "AltaAmbulatoriais");

            migrationBuilder.DropForeignKey(
                name: "FK_LiberacoesQuarentena_Animals_AnimalId",
                schema: "bioterio",
                table: "LiberacoesQuarentena");

            migrationBuilder.DropForeignKey(
                name: "FK_LiberacoesQuarentena_InstalacoesBioterio_InstalacaoBioterioId",
                schema: "bioterio",
                table: "LiberacoesQuarentena");

            migrationBuilder.DropTable(
                name: "Consultas",
                schema: "bioterio");

            migrationBuilder.DropIndex(
                name: "IX_SolicitacoesExame_AnimalId",
                schema: "bioterio",
                table: "SolicitacoesExame");

            migrationBuilder.DropIndex(
                name: "IX_AltaAmbulatoriais_AnimalId",
                schema: "bioterio",
                table: "AltaAmbulatoriais");

            migrationBuilder.RenameColumn(
                name: "AnimalId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                newName: "AtendimentoId");

            migrationBuilder.RenameIndex(
                name: "IX_LiberacoesQuarentena_AnimalId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                newName: "IX_LiberacoesQuarentena_AtendimentoId");

            migrationBuilder.RenameColumn(
                name: "AnimalId",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                newName: "AtendimentoId");

            migrationBuilder.AddColumn<int>(
                name: "AtendimentoId",
                schema: "bioterio",
                table: "SolicitacoesExame",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AtendimentoId",
                schema: "bioterio",
                table: "Procedimentos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AtendimentoId",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AtendimentoId",
                schema: "bioterio",
                table: "Evolucoes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AtendimentoId",
                schema: "bioterio",
                table: "Anexos",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataAltaClinica",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.CreateTable(
                name: "Atendimentos",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    BiometriaAnimalId = table.Column<int>(type: "int", nullable: true),
                    InstalacaoBioterioId = table.Column<int>(type: "int", nullable: false),
                    Anamnese = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataHoraRegistro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Diagnostico = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExameFisico = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Responsavel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TipoAtendimento = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Tratamento = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Atendimentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Atendimentos_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalSchema: "bioterio",
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Atendimentos_BiometriasAnimais_BiometriaAnimalId",
                        column: x => x.BiometriaAnimalId,
                        principalSchema: "bioterio",
                        principalTable: "BiometriasAnimais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Atendimentos_InstalacoesBioterio_InstalacaoBioterioId",
                        column: x => x.InstalacaoBioterioId,
                        principalSchema: "bioterio",
                        principalTable: "InstalacoesBioterio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesExame_AtendimentoId",
                schema: "bioterio",
                table: "SolicitacoesExame",
                column: "AtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Procedimentos_AtendimentoId",
                schema: "bioterio",
                table: "Procedimentos",
                column: "AtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescricoesMedicacao_AtendimentoId",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                column: "AtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Evolucoes_AtendimentoId",
                schema: "bioterio",
                table: "Evolucoes",
                column: "AtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Anexos_AtendimentoId",
                schema: "bioterio",
                table: "Anexos",
                column: "AtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_AltaAmbulatoriais_AtendimentoId",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                column: "AtendimentoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Atendimentos_AnimalId",
                schema: "bioterio",
                table: "Atendimentos",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_Atendimentos_BiometriaAnimalId",
                schema: "bioterio",
                table: "Atendimentos",
                column: "BiometriaAnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_Atendimentos_DataHoraRegistro",
                schema: "bioterio",
                table: "Atendimentos",
                column: "DataHoraRegistro");

            migrationBuilder.CreateIndex(
                name: "IX_Atendimentos_InstalacaoBioterioId",
                schema: "bioterio",
                table: "Atendimentos",
                column: "InstalacaoBioterioId");

            migrationBuilder.CreateIndex(
                name: "IX_Atendimentos_TipoAtendimento",
                schema: "bioterio",
                table: "Atendimentos",
                column: "TipoAtendimento");

            migrationBuilder.AddForeignKey(
                name: "FK_AltaAmbulatoriais_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "AltaAmbulatoriais",
                column: "AtendimentoId",
                principalSchema: "bioterio",
                principalTable: "Atendimentos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Anexos_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "Anexos",
                column: "AtendimentoId",
                principalSchema: "bioterio",
                principalTable: "Atendimentos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Evolucoes_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "Evolucoes",
                column: "AtendimentoId",
                principalSchema: "bioterio",
                principalTable: "Atendimentos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LiberacoesQuarentena_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                column: "AtendimentoId",
                principalSchema: "bioterio",
                principalTable: "Atendimentos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LiberacoesQuarentena_InstalacoesBioterio_InstalacaoBioterioId",
                schema: "bioterio",
                table: "LiberacoesQuarentena",
                column: "InstalacaoBioterioId",
                principalSchema: "bioterio",
                principalTable: "InstalacoesBioterio",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PrescricoesMedicacao_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                column: "AtendimentoId",
                principalSchema: "bioterio",
                principalTable: "Atendimentos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Procedimentos_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "Procedimentos",
                column: "AtendimentoId",
                principalSchema: "bioterio",
                principalTable: "Atendimentos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SolicitacoesExame_Atendimentos_AtendimentoId",
                schema: "bioterio",
                table: "SolicitacoesExame",
                column: "AtendimentoId",
                principalSchema: "bioterio",
                principalTable: "Atendimentos",
                principalColumn: "Id");
        }
    }
}

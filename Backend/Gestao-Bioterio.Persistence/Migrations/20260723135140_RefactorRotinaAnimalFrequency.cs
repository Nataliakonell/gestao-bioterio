using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RefactorRotinaAnimalFrequency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RotinasAnimaisLogs_Especies_EspecieId",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.DropIndex(
                name: "IX_RotinasAnimaisLogs_EspecieId",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.DropIndex(
                name: "IX_RotinasAnimais_EspecieId",
                schema: "bioterio",
                table: "RotinasAnimais");

            migrationBuilder.DropColumn(
                name: "FrequenciaAdulto",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.DropColumn(
                name: "FrequenciaFilhote",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.DropColumn(
                name: "FrequenciaAdulto",
                schema: "bioterio",
                table: "RotinasAnimais");

            migrationBuilder.DropColumn(
                name: "FrequenciaFilhote",
                schema: "bioterio",
                table: "RotinasAnimais");

            migrationBuilder.RenameColumn(
                name: "FrequenciaJovem",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                newName: "Frequencia");

            migrationBuilder.RenameColumn(
                name: "FrequenciaJovem",
                schema: "bioterio",
                table: "RotinasAnimais",
                newName: "Frequencia");

            migrationBuilder.AddColumn<string>(
                name: "DiasFrequencia",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FaseDeVida",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TipoFrequencia",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "TipoRotina",
                schema: "bioterio",
                table: "RotinasAnimais",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<string>(
                name: "DiasFrequencia",
                schema: "bioterio",
                table: "RotinasAnimais",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FaseDeVida",
                schema: "bioterio",
                table: "RotinasAnimais",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TipoFrequencia",
                schema: "bioterio",
                table: "RotinasAnimais",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_RotinasAnimais_EspecieId_TipoRotina_FaseDeVida",
                schema: "bioterio",
                table: "RotinasAnimais",
                columns: new[] { "EspecieId", "TipoRotina", "FaseDeVida" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RotinasAnimais_EspecieId_TipoRotina_FaseDeVida",
                schema: "bioterio",
                table: "RotinasAnimais");

            migrationBuilder.DropColumn(
                name: "DiasFrequencia",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.DropColumn(
                name: "FaseDeVida",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.DropColumn(
                name: "TipoFrequencia",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.DropColumn(
                name: "DiasFrequencia",
                schema: "bioterio",
                table: "RotinasAnimais");

            migrationBuilder.DropColumn(
                name: "FaseDeVida",
                schema: "bioterio",
                table: "RotinasAnimais");

            migrationBuilder.DropColumn(
                name: "TipoFrequencia",
                schema: "bioterio",
                table: "RotinasAnimais");

            migrationBuilder.RenameColumn(
                name: "Frequencia",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                newName: "FrequenciaJovem");

            migrationBuilder.RenameColumn(
                name: "Frequencia",
                schema: "bioterio",
                table: "RotinasAnimais",
                newName: "FrequenciaJovem");

            migrationBuilder.AddColumn<int>(
                name: "FrequenciaAdulto",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FrequenciaFilhote",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TipoRotina",
                schema: "bioterio",
                table: "RotinasAnimais",
                type: "int",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<int>(
                name: "FrequenciaAdulto",
                schema: "bioterio",
                table: "RotinasAnimais",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FrequenciaFilhote",
                schema: "bioterio",
                table: "RotinasAnimais",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RotinasAnimaisLogs_EspecieId",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                column: "EspecieId");

            migrationBuilder.CreateIndex(
                name: "IX_RotinasAnimais_EspecieId",
                schema: "bioterio",
                table: "RotinasAnimais",
                column: "EspecieId");

            migrationBuilder.AddForeignKey(
                name: "FK_RotinasAnimaisLogs_Especies_EspecieId",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                column: "EspecieId",
                principalSchema: "bioterio",
                principalTable: "Especies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

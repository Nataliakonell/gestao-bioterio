using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class PrescricaoMedicacaoConfiguration
         : IEntityTypeConfiguration<PrescricaoMedicacao>
    {
        public void Configure(EntityTypeBuilder<PrescricaoMedicacao> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.AnimalId)
                .IsRequired();

            builder.Property(x => x.MedicacaoId)
                .IsRequired();

            builder.Property(x => x.VolumeDose)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.ViaAdministracao)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(x => x.QuantidadeDoses)
                .IsRequired();

            builder.Property(x => x.IntervaloEntreDosesHoras)
                .IsRequired();

            builder.Property(x => x.DataHoraInicio)
                .IsRequired();

            builder.Property(x => x.Observacao)
                .IsRequired(false)
                .HasMaxLength(1000);

            builder.Property(x => x.StatusPrescricao)
                .IsRequired()
                .HasConversion<string>()
                .HasDefaultValue(StatusPrescricao.Ativa);

            builder.Property(x => x.DataHoraSuspensao)
                .IsRequired(false);

            builder.Property(x => x.MotivoSuspensao)
                .IsRequired(false)
                .HasMaxLength(1000);

            builder.HasMany(x => x.Administracoes)
                .WithOne(x => x.PrescricaoMedicacao)
                .HasForeignKey(x => x.PrescricaoMedicacaoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.AnimalId);

            builder.HasIndex(x => x.MedicacaoId);

            builder.HasIndex(x => x.DataHoraInicio);

            builder.Property(x => x.Responsavel)
                .IsRequired(false)
                .HasMaxLength(200);
        }
    }
}
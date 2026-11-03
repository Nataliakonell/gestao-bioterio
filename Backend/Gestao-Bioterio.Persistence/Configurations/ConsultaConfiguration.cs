using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class ConsultaConfiguration : IEntityTypeConfiguration<Consulta>
    {
        public void Configure(EntityTypeBuilder<Consulta> builder)
        {
            builder.ToTable("Consultas");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.AnimalId)
                .IsRequired();

            builder.HasOne(x => x.Animal)
                .WithMany()
                .HasForeignKey(x => x.AnimalId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.InstalacaoBioterioId)
                .IsRequired(false);

            builder.HasOne(x => x.InstalacaoBioterio)
                .WithMany()
                .HasForeignKey(x => x.InstalacaoBioterioId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.DataHoraConsulta)
                .IsRequired();

            builder.Property(x => x.Anamnese)
                .IsRequired();

            builder.Property(x => x.ExameFisico)
                .IsRequired(false);

            builder.Property(x => x.SuspeitaDiagnostica)
                .IsRequired(false);

            builder.HasIndex(x => x.AnimalId);
            builder.HasIndex(x => x.DataHoraConsulta);

            builder.Property(x => x.Responsavel)
                .IsRequired(false)
                .HasMaxLength(200);
        }
    }
}

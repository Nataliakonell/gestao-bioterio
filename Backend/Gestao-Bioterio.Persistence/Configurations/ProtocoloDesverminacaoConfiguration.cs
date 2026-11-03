using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class ProtocoloDesverminacaoConfiguration : IEntityTypeConfiguration<ProtocoloDesverminacao>
    {
        public void Configure(EntityTypeBuilder<ProtocoloDesverminacao> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.AnimalId)
                .IsRequired();

            builder.Property(x => x.DataEntrada)
                .IsRequired();

            builder.Property(x => x.StatusProtocolo)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(x => x.CicloInicialConcluido)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(x => x.DataProximaDose);

            builder.HasMany(x => x.Doses)
                .WithOne(x => x.ProtocoloDesverminacao)
                .HasForeignKey(x => x.ProtocoloDesverminacaoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Animal)
                .WithMany(a => a.ProtocolosDesverminacao)
                .HasForeignKey(x => x.AnimalId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

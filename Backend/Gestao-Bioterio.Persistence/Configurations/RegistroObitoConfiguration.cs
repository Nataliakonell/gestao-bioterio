using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class RegistroObitoConfiguration : IEntityTypeConfiguration<RegistroObito>
    {
        public void Configure(EntityTypeBuilder<RegistroObito> builder)
        {
            builder.ToTable("RegistrosObito");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.AnimalId)
                .IsRequired();

            builder.HasOne(x => x.Animal)
                .WithMany()
                .HasForeignKey(x => x.AnimalId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.DataObito)
                .IsRequired();

            builder.Property(x => x.HouveNecropsia)
                .IsRequired();

            builder.Property(x => x.Observacoes)
                .IsRequired(false)
                .HasMaxLength(1000);

            builder.HasIndex(x => x.AnimalId);
        }
    }
}

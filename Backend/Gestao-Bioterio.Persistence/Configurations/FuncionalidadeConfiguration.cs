using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class FuncionalidadeConfiguration : IEntityTypeConfiguration<Funcionalidade>
    {
        public void Configure(EntityTypeBuilder<Funcionalidade> builder)
        {
            builder.ToTable("Funcionalidade");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Nome)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(e => e.Descricao)
                .IsRequired()
                .HasMaxLength(200);
        }
    }
}

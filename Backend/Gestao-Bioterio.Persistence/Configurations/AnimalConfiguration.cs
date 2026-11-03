using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gestao_Bioterio.Persistence.Configurations
{
    public class AnimalConfiguration : IEntityTypeConfiguration<Animal>
    {
        public void Configure(EntityTypeBuilder<Animal> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.NumeroRegistro)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(a => a.NumeroRegistro)
                .IsUnique()
                .HasDatabaseName("IX_Animal_NumeroRegistro");

            builder.Property(a => a.NomePopular)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(a => a.Municipio)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(a => a.Genero)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(a => a.FaseDeVida)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(a => a.SituacaoAnimal)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(a => a.NumeroChip)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(a => a.NumeroChip)
                .IsUnique()
                .HasDatabaseName("IX_Animal_NumeroChip");

            builder.Property(a => a.Sisfauna)
                .IsRequired();

            builder.Property(a => a.TermoDeDoacao)
                .IsRequired();

            builder.Property(a => a.NomeArquivoFoto)
                .HasMaxLength(50);

            builder.HasOne(a => a.Especie)
                .WithMany(s => s.Animais)
                .HasForeignKey(a => a.EspecieId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.InstalacaoBioterio)
                .WithMany(l => l.Animais)
                .HasForeignKey(a => a.InstalacaoBioterioId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.LocalOrigem)
                .WithMany(g => g.Animais)
                .HasForeignKey(a => a.LocalOrigemId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

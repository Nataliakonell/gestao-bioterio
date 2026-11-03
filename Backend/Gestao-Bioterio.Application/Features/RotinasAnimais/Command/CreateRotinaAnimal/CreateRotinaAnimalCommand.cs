using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using System.Collections.Generic;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Command.CreateRotinaAnimal
{
    public class CreateRotinaAnimalCommand : IRequest<CreateRotinaAnimalResponse>
    {
        public int EspecieId { get; set; }
        public TipoRotina TipoRotina { get; set; }
        public string? ProtocoloDieta { get; set; }
        public List<RotinaFaseConfig> Fases { get; set; } = new List<RotinaFaseConfig>();
    }

    public class RotinaFaseConfig
    {
        public FaseDeVida FaseDeVida { get; set; }
        public TipoFrequencia TipoFrequencia { get; set; }
        public int? Frequencia { get; set; }
        public List<string>? DiaSemanaProgramado { get; set; }
        public string? ProtocoloDieta { get; set; }
    }
}

using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllAnimaisRotinaStatus
{
    public class RotinaStatusSummaryVm
    {
        public int AlimentacaoAtrasado { get; set; }
        public int AlimentacaoSemRegistro { get; set; }
        public int AlimentacaoHoje { get; set; }
        public int AlimentacaoProximo { get; set; }
        public int AlimentacaoConcluido { get; set; }
        public int AlimentacaoEmDia { get; set; }
        public int AlimentacaoNaoAlimentado { get; set; }

        public int BiometriaAtrasado { get; set; }
        public int BiometriaSemRegistro { get; set; }
        public int BiometriaHoje { get; set; }
        public int BiometriaProximo { get; set; }
        public int BiometriaConcluido { get; set; }
        public int BiometriaEmDia { get; set; }
        public int BiometriaNaoAlimentado { get; set; }
    }
}

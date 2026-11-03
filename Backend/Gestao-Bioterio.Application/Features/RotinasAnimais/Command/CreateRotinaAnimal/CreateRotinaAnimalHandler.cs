using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Command.CreateRotinaAnimal
{
    public class CreateRotinaAnimalHandler(
        IMapper mapper,
        IRotinaAnimalRepository rotinaAnimalRepository,
        IValidator<CreateRotinaAnimalCommand> validator
    ) : IRequestHandler<CreateRotinaAnimalCommand, CreateRotinaAnimalResponse>
    {
        public async Task<CreateRotinaAnimalResponse> Handle(CreateRotinaAnimalCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateRotinaAnimalResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação do cadastro de rotina.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            foreach (var fase in request.Fases)
            {
                var existe = await rotinaAnimalRepository.ExisteRotinaAsync(
                    request.EspecieId,
                    request.TipoRotina,
                    fase.FaseDeVida);

                if (existe)
                {
                    response.Success = false;
                    response.Message = "Já existe rotina cadastrada para esta espécie e fase.";
                    response.ValidationErrors =
                    [
                        $"Já existe esse tipo de rotina cadastrada para esta espécie na fase {fase.FaseDeVida}."
                    ];
                    return response;
                }
            }

            var rotinasCadastradas = new List<RotinaAnimal>();

            foreach (var fase in request.Fases)
            {
                var rotina = new RotinaAnimal
                {
                    EspecieId = request.EspecieId,
                    TipoRotina = request.TipoRotina,
                    ProtocoloDieta = fase.ProtocoloDieta ?? request.ProtocoloDieta,
                    FaseDeVida = fase.FaseDeVida,
                    TipoFrequencia = fase.TipoFrequencia,
                    Frequencia = fase.Frequencia,
                    DiaSemanaProgramado = fase.DiaSemanaProgramado
                };

                rotina = await rotinaAnimalRepository.AddAsync(rotina);
                rotinasCadastradas.Add(rotina);
            }

            response.Rotinas = mapper.Map<List<CreateRotinaAnimalDto>>(rotinasCadastradas);
            response.Message = "Rotina(s) cadastrada(s) com sucesso!";
            return response;
        }
    }
}

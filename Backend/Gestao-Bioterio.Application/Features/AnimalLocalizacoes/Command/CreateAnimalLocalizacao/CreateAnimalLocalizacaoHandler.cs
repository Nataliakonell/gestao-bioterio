using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.CreateAnimalLocalizacao
{
    public class CreateAnimalLocalizacaoHandler(
        IMapper mapper,
        IAnimalLocalizacaoRepository animalLocalizacaoRepository,
        IAnimalRepository animalRepository,
        ILocalizacaoRepository localizacaoRepository,
        IValidator<CreateAnimalLocalizacaoCommand> validator
    ) : IRequestHandler<CreateAnimalLocalizacaoCommand, CreateAnimalLocalizacaoResponse>
    {
        public async Task<CreateAnimalLocalizacaoResponse> Handle(CreateAnimalLocalizacaoCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateAnimalLocalizacaoResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação do vínculo de localização do animal.";
                return response;
            }

            var entity = mapper.Map<AnimalLocalizacao>(command);
            entity = await animalLocalizacaoRepository.AddAsync(entity);

            var animal = await animalRepository.GetByIdAsync(entity.AnimalId);
            var localizacao = await localizacaoRepository.GetByIdAsync(entity.LocalizacaoId);

            var dto = mapper.Map<CreateAnimalLocalizacaoDto>(entity);
            if (animal != null)
            {
                dto.AnimalNomePopular = animal.NomePopular;
                dto.AnimalNumeroRegistro = animal.NumeroRegistro;
            }
            if (localizacao != null)
            {
                dto.LocalizacaoNome = localizacao.Nome;
                dto.LocalizacaoCaminhoHierarquia = localizacao.CaminhoHierarquia;
            }

            response.Success = true;
            response.Id = entity.Id;
            response.AnimalLocalizacao = dto;
            response.Message = "Localização do animal cadastrada com sucesso!";

            return response;
        }
    }
}

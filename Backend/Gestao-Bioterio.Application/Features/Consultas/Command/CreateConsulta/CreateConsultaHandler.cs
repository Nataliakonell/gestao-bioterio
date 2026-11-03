using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Consultas.Command.CreateConsulta
{
    public class CreateConsultaHandler(
        IMapper mapper,
        IConsultaRepository repository,
        IValidator<CreateConsultaCommand> validator) : IRequestHandler<CreateConsultaCommand, CreateConsultaResponse>
    {
        public async Task<CreateConsultaResponse> Handle(CreateConsultaCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateConsultaResponse();
            var validation = await validator.ValidateAsync(request, cancellationToken);
            if (validation.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro ao cadastrar consulta.";
                response.ValidationErrors = validation.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var entity = mapper.Map<Consulta>(request);
            entity = await repository.AddAsync(entity);

            response.Id = entity.Id;
            response.Consulta = mapper.Map<CreateConsultaDto>(entity);
            response.Message = "Consulta cadastrada com sucesso!";
            return response;
        }
    }
}

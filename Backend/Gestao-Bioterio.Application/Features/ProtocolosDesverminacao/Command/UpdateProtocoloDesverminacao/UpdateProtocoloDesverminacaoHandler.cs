using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.UpdateProtocoloDesverminacao
{
    public class UpdateProtocoloDesverminacaoHandler(
        IProtocoloDesverminacaoRepository protocoloRepository,
        IValidator<UpdateProtocoloDesverminacaoCommand> validator
    ) : IRequestHandler<UpdateProtocoloDesverminacaoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateProtocoloDesverminacaoCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse("Erro na validação da atualização do protocolo de desverminação.", false);

            var protocolo = await protocoloRepository.GetByIdAsync(request.Id);
            if (protocolo == null)
                throw new NotFoundException(nameof(ProtocoloDesverminacao), request.Id);

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            protocolo.DataEntrada = request.DataEntrada;
            protocolo.StatusProtocolo = request.StatusProtocolo;
            protocolo.CicloInicialConcluido = request.CicloInicialConcluido;
            protocolo.DataConclusaoCicloInicial = request.DataConclusaoCicloInicial;
            protocolo.DataProximaDose = request.DataProximaDose;

            await protocoloRepository.UpdateAsync(protocolo);

            response.Success = true;
            response.Message = "Protocolo de desverminação atualizado com sucesso!";
            return response;
        }
    }
}
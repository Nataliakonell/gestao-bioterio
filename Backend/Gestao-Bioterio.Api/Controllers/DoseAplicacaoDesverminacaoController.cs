using Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.CreateDoseAplicacaoDesverminacao;
using Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.DeleteDoseAplicacaoDesverminacao;
using Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.UpdateDoseAplicacaoDesverminacao;
using Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Queries.GetAllDosesAplicacaoDesverminacao;
using Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Queries.GetDoseAplicacaoDesverminacaoDetail;
using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DoseAplicacaoDesverminacaoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllDoseAplicacaoDesverminacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Desverminação", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<DoseAplicacaoDesverminacaoListVm>>> GetAll(
            [FromQuery] int? protocoloId = null)
        {
            var result = await mediator.Send(new GetAllDosesAplicacaoDesverminacaoQuery
            {
                ProtocoloDesverminacaoId = protocoloId
            });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetDoseAplicacaoDesverminacaoById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Desverminação", NivelAcesso.Visualizar)]
        public async Task<ActionResult<DoseAplicacaoDesverminacaoDetailVm>> GetById(int id)
        {
            var query = new GetDoseAplicacaoDesverminacaoDetailQuery { Id = id };
            return Ok(await mediator.Send(query));
        }

        [HttpPost(Name = "AddDoseAplicacaoDesverminacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Desverminação", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreateDoseAplicacaoDesverminacaoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpPut(Name = "UpdateDoseAplicacaoDesverminacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Desverminação", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateDoseAplicacaoDesverminacaoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteDoseAplicacaoDesverminacao")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Desverminação", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var command = new DeleteDoseAplicacaoDesverminacaoCommand { Id = id };
            await mediator.Send(command);
            return NoContent();
        }
    }
}

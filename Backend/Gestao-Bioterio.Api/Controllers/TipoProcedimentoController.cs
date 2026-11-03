using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Application.Features.TiposProcedimento.Command.CreateTipoProcedimento;
using Gestao_Bioterio.Application.Features.TiposProcedimento.Command.DeleteTipoProcedimento;
using Gestao_Bioterio.Application.Features.TiposProcedimento.Command.UpdateTipoProcedimento;
using Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetAllTiposProcedimento;
using Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetTipoProcedimentoDetail;
using Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetTipoProcedimentoLookup;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TipoProcedimentoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllTipoProcedimento")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<TipoProcedimentoListVm>>> GetAll()
        {
            return Ok(await mediator.Send(new GetAllTiposProcedimentoQuery()));
        }

        [HttpGet("lookup", Name = "GetTipoProcedimentoLookup")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]

        public async Task<ActionResult<List<TipoProcedimentoLookupVm>>> GetLookup()
        {
            return Ok(await mediator.Send(new GetTipoProcedimentoLookupQuery()));
        }

        [HttpGet("{id}", Name = "GetTipoProcedimentoById")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]

        public async Task<ActionResult<TipoProcedimentoDetailVm>> GetById(int id)
        {
            return Ok(await mediator.Send(new GetTipoProcedimentoDetailQuery { Id = id }));
        }

        [HttpPost(Name = "AddTipoProcedimento")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]

        public async Task<ActionResult<CreateTipoProcedimentoResponse>> Create([FromBody] CreateTipoProcedimentoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpPut(Name = "UpdateTipoProcedimento")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Editar)]

        public async Task<ActionResult> Update([FromBody] UpdateTipoProcedimentoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteTipoProcedimento")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]

        public async Task<ActionResult> Delete(int id)
        {
            await mediator.Send(new DeleteTipoProcedimentoCommand { Id = id });
            return NoContent();
        }
    }
}

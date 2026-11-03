using Gestao_Bioterio.Application.Features.Medicacoes.Command.CreateMedicacao;
using Gestao_Bioterio.Application.Features.Medicacoes.Command.DeleteMedicacao;
using Gestao_Bioterio.Application.Features.Medicacoes.Command.UpdateMedicacao;
using Gestao_Bioterio.Application.Features.Medicacoes.Queries.GetAllMedicacoes;
using Gestao_Bioterio.Application.Features.Medicacoes.Queries.GetMedicacaoLookup;
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
    public class MedicacaoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllMedicacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Medicações cadastradas", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<MedicacaoListVm>>> GetAll()
        {
            var result = await mediator.Send(new GetAllMedicacoesQuery());
            return Ok(result);
        }

        [HttpGet("lookup", Name = "GetMedicacaoLookup")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Medicações cadastradas", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<MedicacaoLookupVm>>> GetLookup()
        {
            var result = await mediator.Send(new GetMedicacaoLookupQuery());
            return Ok(result);
        }

        [HttpPost(Name = "AddMedicacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Medicações cadastradas", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreateMedicacaoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpPut(Name = "UpdateMedicacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Medicações cadastradas", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateMedicacaoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteMedicacao")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Medicações cadastradas", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var command = new DeleteMedicacaoCommand { Id = id };
            await mediator.Send(command);
            return NoContent();
        }
    }
}

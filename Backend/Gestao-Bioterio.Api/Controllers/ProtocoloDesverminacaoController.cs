using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.CreateProtocoloDesverminacao;
using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.DeleteProtocoloDesverminacao;
using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.UpdateProtocoloDesverminacao;
using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetAllProtocolosDesverminacao;
using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetProtocoloDesverminacaoDetail;
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
    public class ProtocoloDesverminacaoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllProtocoloDesverminacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Desverminação", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<ProtocoloDesverminacaoListVm>>> GetAll()
        {
            var result = await mediator.Send(new GetAllProtocolosDesverminacaoQuery());
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetProtocoloDesverminacaoById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Desverminação", NivelAcesso.Visualizar)]
        public async Task<ActionResult<ProtocoloDesverminacaoDetailVm>> GetById(int id)
        {
            var query = new GetProtocoloDesverminacaoDetailQuery { Id = id };
            return Ok(await mediator.Send(query));
        }

        [HttpPost(Name = "AddProtocoloDesverminacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Desverminação", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreateProtocoloDesverminacaoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpPut(Name = "UpdateProtocoloDesverminacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Desverminação", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateProtocoloDesverminacaoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteProtocoloDesverminacao")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Desverminação", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var command = new DeleteProtocoloDesverminacaoCommand { Id = id };
            await mediator.Send(command);
            return NoContent();
        }
    }
}

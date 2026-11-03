using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Application.Features.Refeicoes.Command.CreateRefeicao;
using Gestao_Bioterio.Application.Features.Refeicoes.Command.DeleteRefeicao;
using Gestao_Bioterio.Application.Features.Refeicoes.Command.UpdateRefeicao;
using Gestao_Bioterio.Application.Features.Refeicoes.Queries.GetAllRefeicao;
using Gestao_Bioterio.Application.Features.Refeicoes.Queries.GetRefeicaoDetail;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RefeicaoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RefeicaoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet(Name = "GetAllRefeicao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Refeicao", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<RefeicaoListVm>>> GetAllRefeicao()
        {
            var result = await _mediator.Send(new GetAllRefeicaoQuery());
            return Ok(result);
        }

        [HttpPost(Name = "AddRefeicao")]
        [RequirePermission("Refeicao", NivelAcesso.Gerenciar)]

        public async Task<ActionResult> Create([FromBody] CreateRefeicaoCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpGet("{id}", Name = "GetRefeicaoById")]
        [RequirePermission("Refeicao", NivelAcesso.Visualizar)]

        public async Task<ActionResult<GetRefeicaoDetailVm>> GetRefeicaoById(int id)
        {
            var getRefeicaoDetailQuery = new GetRefeicaoDetailQuery() { Id = id };
            return Ok(await _mediator.Send(getRefeicaoDetailQuery));
        }

        [HttpPut(Name = "UpdateRefeicao")]
        [RequirePermission("Refeicao", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateRefeicaoCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteRefeicao")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Refeicao", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var deleteRefeicaoCommand = new DeleteRefeicaoCommand() { Id = id };
            await _mediator.Send(deleteRefeicaoCommand);
            return NoContent();
        }
    }
}

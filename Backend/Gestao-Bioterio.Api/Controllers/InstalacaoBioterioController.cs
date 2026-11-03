using Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.CreateInstalacaoBioterio;
using Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.DeleteInstalacaoBioterio;
using Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.UpdateInstalacaoBioterio;
using Gestao_Bioterio.Application.Features.InstalacoesBioterio.Queries.GetAllInstalacaoBioterio;
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
    public class InstalacaoBioterioController : ControllerBase
    {
        private readonly IMediator _mediator;

        public InstalacaoBioterioController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet(Name = "GetAllInstalacaoBioterio")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Instalações do biotério", NivelAcesso.Visualizar)]

        public async Task<ActionResult<List<InstalacaoBioterioListVm>>> GetAll()
        {
            var result = await _mediator.Send(new GetAllInstalacaoBioterioQuery());
            return Ok(result);
        }

        [HttpPost(Name = "AddInstalacaoBioterio")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Instalações do biotério", NivelAcesso.Gerenciar)]
        public async Task<ActionResult<int>> Create(
    [FromBody] CreateInstalacaoBioterioCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(id);
        }

        [HttpPut(Name = "UpdateInstalacaoBioterio")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [RequirePermission("Instalações do biotério", NivelAcesso.Editar)]
        public async Task<ActionResult> Update(
           [FromBody] UpdateInstalacaoBioterioCommand command)
        {
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("{id}", Name = "DeleteInstalacaoBioterio")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [RequirePermission("Instalações do biotério", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            await _mediator.Send(new DeleteLiberacaoQuarentenaCommand { Id = id });
            return NoContent();
        }
    }

}

using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Application.Features.Perfis.Command.CreatePerfil;
using Gestao_Bioterio.Application.Features.Perfis.Command.DeletePerfil;
using Gestao_Bioterio.Application.Features.Perfis.Command.UpdatePerfil;
using Gestao_Bioterio.Application.Features.Perfis.Queries.GetAllPerfil;
using Gestao_Bioterio.Application.Features.Perfis.Queries.GetPerfilDetail;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PerfilController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllPerfil")]
        [RequirePermission("Gerenciamento de perfis", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<PerfilListVm>>> GetAll()
        {
            var response = await mediator.Send(new GetAllPerfilQuery());
            return Ok(response);
        }

        [HttpGet("{id}", Name = "GetPerfilById")]
        [RequirePermission("Gerenciamento de perfis", NivelAcesso.Visualizar)]
        public async Task<ActionResult<PerfilDetailVm>> GetById(int id)
        {
            var response = await mediator.Send(new GetPerfilDetailQuery { Id = id });
            return Ok(response);
        }

        [HttpPost(Name = "AddPerfil")]
        [RequirePermission("Gerenciamento de perfis", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreatePerfilCommand cmd)
        {
            var response = await mediator.Send(cmd);
            return Ok(response);
        }

        [HttpPut(Name = "UpdatePerfil")]
        [RequirePermission("Gerenciamento de perfis", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdatePerfilCommand cmd)
        {
            var response = await mediator.Send(cmd);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeletePerfil")]
        [RequirePermission("Gerenciamento de perfis", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            await mediator.Send(new DeletePerfilCommand { Id = id });
            return NoContent();
        }

        [HttpPost("{id}/permissoes", Name = "AssignPermissao")]
        [RequirePermission("Gerenciamento de perfis", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> AssignPermissao(int id, [FromBody] Gestao_Bioterio.Application.Features.Perfis.Command.AssignPermissao.AssignPermissaoCommand cmd)
        {
            cmd.PerfilId = id;
            var response = await mediator.Send(cmd);
            return Ok(response);
        }
    }
}

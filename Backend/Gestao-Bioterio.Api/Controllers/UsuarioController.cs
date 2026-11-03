using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Application.Features.Usuarios.Command.CreateUsuario;
using Gestao_Bioterio.Application.Features.Usuarios.Command.DeleteUsuario;
using Gestao_Bioterio.Application.Features.Usuarios.Command.UpdateUsuario;
using Gestao_Bioterio.Application.Features.Usuarios.Queries.GetAllUsuarios;
using Gestao_Bioterio.Application.Features.Usuarios.Queries.GetMyPermissoes;
using Gestao_Bioterio.Application.Features.Usuarios.Queries.GetUsuariosDetail;
using Gestao_Bioterio.Application.Features.Usuarios.Queries.GetDadosExternosPorRf;
using Gestao_Bioterio.Application.Contracts.Persistence.DTOs;
using Gestao_Bioterio.Application.Features.Usuarios.Queries.GetUsuarioLookup;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
        [ApiController]
        [Route("api/[controller]")]
        [Authorize]
        public class UsuarioController(IMediator mediator) : ControllerBase
        {
            [HttpGet("buscar-rf/{rf}", Name = "GetDadosExternosPorRf")]
            [ProducesResponseType(StatusCodes.Status200OK)]
            [ProducesResponseType(StatusCodes.Status404NotFound)]
            [RequirePermission("Usuários", NivelAcesso.Visualizar)]
            public async Task<ActionResult<UsuarioExternoDto>> GetDadosExternosPorRf(string rf)
            {
                var query = new GetDadosExternosPorRfQuery { Rf = rf };
                var result = await mediator.Send(query);
                if (result == null) return NotFound("RF inválido ou não encontrado.");
                return Ok(result);
            }

            [HttpGet("me/permissoes", Name = "GetMyPermissoes")]
            [ProducesResponseType(StatusCodes.Status200OK)]
            [ProducesDefaultResponseType]
        public async Task<ActionResult<MyPermissoesVm>> GetMyPermissoes()
            {
                var rf = User.Claims.FirstOrDefault(c => c.Type == "RF" || c.Type == "rf" || c.Type == "preferred_username")?.Value ?? "";
                var isAdmin = User.HasClaim(c => c.Type == "Role" && c.Value == "Admin");

                var query = new GetMyPermissoesQuery
                {
                    RF = rf,
                    IsAdmin = isAdmin
                };

                return Ok(await mediator.Send(query));
            }

            [HttpGet("lookup", Name = "GetUsuarioLookup")]
            [ProducesResponseType(StatusCodes.Status200OK)]
            [ProducesDefaultResponseType]
            public async Task<ActionResult<List<UsuarioLookupVm>>> GetLookup()
            {
                var result = await mediator.Send(new GetUsuarioLookupQuery());
                return Ok(result);
            }

            [HttpGet(Name = "GetAllUsuario")]
            [ProducesResponseType(StatusCodes.Status200OK)]
            [ProducesDefaultResponseType]
            [RequirePermission("Usuários", NivelAcesso.Visualizar)]
        public async Task<ActionResult<PaginatedUsuarioListVm>> GetAll(
                [FromQuery] string? searchTerm = null,
                [FromQuery] bool? status = null,
                [FromQuery] int page = 1,
                [FromQuery] int pageSize = 10)
            {
                var query = new GetAllUsuarioQuery
                {
                    SearchTerm = searchTerm,
                    Status = status,
                    Page = page,
                    PageSize = pageSize
                };
                var result = await mediator.Send(query);
                return Ok(result);
            }

            [HttpPost(Name = "AddUsuario")]
            [RequirePermission("Usuários", NivelAcesso.Gerenciar)]

        public async Task<ActionResult> Create([FromBody] CreateUsuarioCommand command)
            {
                var response = await mediator.Send(command);
                return Ok(response);
            }

            [HttpGet("{id}", Name = "GetUsuarioById")]
            [RequirePermission("Usuários", NivelAcesso.Visualizar)]

        public async Task<ActionResult<UsuarioDetailVm>> GetUsuarioById(int id)
            {
                var getUsuarioDetailQuery = new GetUsuarioDetailQuery() { Id = id };
                return Ok(await mediator.Send(getUsuarioDetailQuery));
            }

            [HttpPut(Name = "UpdateUsuario")]
            [RequirePermission("Usuários", NivelAcesso.Editar)]

        public async Task<ActionResult> Update([FromBody] UpdateUsuarioCommand command)
            {
                var response = await mediator.Send(command);
                return Ok(response);
            }

            [HttpDelete("{id}", Name = "DeleteUsuario")]
            [ProducesResponseType(StatusCodes.Status204NoContent)]
            [ProducesResponseType(StatusCodes.Status404NotFound)]
            [ProducesDefaultResponseType]
            [RequirePermission("Usuários", NivelAcesso.Gerenciar)]

        public async Task<ActionResult> Delete(int id)
            {
                var deleteUsuarioCommand = new DeleteUsuarioCommand() { Id = id };
                await mediator.Send(deleteUsuarioCommand);
                return NoContent();
            }
        }
    }

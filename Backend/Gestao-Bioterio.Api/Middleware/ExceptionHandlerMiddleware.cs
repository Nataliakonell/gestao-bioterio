using Gestao_Bioterio.Application.Exceptions;
using System.Net;
using System.Text.Json;

namespace Gestao_Bioterio.Api.Middleware
{
    public class ExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlerMiddleware> _logger;

        public ExceptionHandlerMiddleware(RequestDelegate next, ILogger<ExceptionHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        { 
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exceção não tratada capturada pelo middleware");
                await ConvertException(context, ex);
            }
        }

        private Task ConvertException(HttpContext context, Exception exception)
        {
            HttpStatusCode httpStatusCode = HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            var result = string.Empty;

            // FluentValidation.ValidationException
            if (exception is FluentValidation.ValidationException fluentValidationException)
            {
                httpStatusCode = HttpStatusCode.BadRequest;
                var fluentErrors = fluentValidationException.Errors
                    .GroupBy(f => f.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(f => f.ErrorMessage).ToArray()
                    );

                var fluentResponse = new
                {
                    erro = "validation_error",
                    mensagem = "Um ou mais campos contêm erros de validação.",
                    detalhes = fluentErrors
                };

                result = JsonSerializer.Serialize(fluentResponse, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
            }
            else if (exception is ValidationException validationException)
            {
                httpStatusCode = HttpStatusCode.BadRequest;
                result = JsonSerializer.Serialize(validationException.ValdationErrors);
            }
            else if (exception is BadRequestException badRequestExceptionApp)
            {
                httpStatusCode = HttpStatusCode.BadRequest;
                result = JsonSerializer.Serialize(new { message = badRequestExceptionApp.Message });
            }
            else if (exception is BadHttpRequestException badRequestException)
            {
                httpStatusCode = HttpStatusCode.BadRequest;
                result = badRequestException.Message;
            }
            else if (exception is NotFoundException)
            {
                httpStatusCode = HttpStatusCode.NotFound;
            }
            else
            {
                httpStatusCode = HttpStatusCode.InternalServerError;
                result = JsonSerializer.Serialize(new
                {
                    erro = "internal_server_error",
                    mensagem = "Ocorreu um erro interno no servidor.",
                    detalhe = exception.InnerException != null ? $"{exception.Message} | Inner: {exception.InnerException.Message}" : exception.Message,
                    stackTrace = exception.StackTrace
                });
            }

            context.Response.StatusCode = (int)httpStatusCode;

            if (string.IsNullOrEmpty(result))
            {
                result = JsonSerializer.Serialize(new { error = exception.Message });
            }

            return context.Response.WriteAsync(result);
        }
    }
}

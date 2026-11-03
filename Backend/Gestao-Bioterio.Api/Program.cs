using Gestao_Bioterio.Api.Extensions;
using Gestao_Bioterio.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<BioterioDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.MigrationsHistoryTable("__EFMigrationsHistory", "bioterio")));

builder.Services.ConfigureServices(builder.Configuration);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();

    if (context.Database.IsRelational())
        context.Database.Migrate();
}

app.UseStartupExtensions();


app.Run();

public partial class Program { }


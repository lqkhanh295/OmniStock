FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy all csproj files and restore as distinct layers
COPY ["backend/ErpSystem.Api/ErpSystem.Api.csproj", "backend/ErpSystem.Api/"]
COPY ["backend/ErpSystem.Application/ErpSystem.Application.csproj", "backend/ErpSystem.Application/"]
COPY ["backend/ErpSystem.Domain/ErpSystem.Domain.csproj", "backend/ErpSystem.Domain/"]
COPY ["backend/ErpSystem.Infrastructure/ErpSystem.Infrastructure.csproj", "backend/ErpSystem.Infrastructure/"]
RUN dotnet restore "./backend/ErpSystem.Api/ErpSystem.Api.csproj"

# Copy the remaining files and build
COPY ["backend/", "backend/"]
WORKDIR "/src/backend/ErpSystem.Api"
RUN dotnet build "./ErpSystem.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./ErpSystem.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ErpSystem.Api.dll"]

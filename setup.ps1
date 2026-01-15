Write-Host "--- 🚀 Lancement du projet Crime Analytics ---" -ForegroundColor Cyan

# 1. Démarrage des conteneurs
Write-Host "`n[1/5] Démarrage de l'infrastructure Docker (Build & Up)..." -ForegroundColor Yellow
cd docker
docker-compose up --build -d
if ($LASTEXITCODE -ne 0) { Write-Error "Erreur lors du démarrage de Docker."; exit }

# 2. Attente de la disponibilité
Write-Host "`n[2/5] Attente de la disponibilité (20 sec)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# 3. Initialisation Neo4j
Write-Host "`n[3/5] Initialisation de Neo4j..." -ForegroundColor Yellow
# On copie le script cypher dans le conteneur
docker cp init_neo4j.cypher police_neo4j:/var/lib/neo4j/import/init_neo4j.cypher
# On exécute cypher-shell
docker exec police_neo4j cypher-shell -u neo4j -p password -f /var/lib/neo4j/import/init_neo4j.cypher

if ($LASTEXITCODE -eq 0) {
    Write-Host "Neo4j initialisé avec succès." -ForegroundColor Green
}
else {
    Write-Warning "Attention: Erreur ou avertissement lors de l'init Neo4j (peut-être déjà fait)."
}
cd ..

# 4. Message de succès final
Write-Host "`n✅ TERMINÉ ! Le Dashboard est accessible sur :" -ForegroundColor Green
Write-Host "➡️  http://localhost:3000" -ForegroundColor Cyan
Write-Host "API Backend : http://localhost:5001" -ForegroundColor Gray

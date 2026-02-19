import requests
import hashlib
import mysql.connector
from time import sleep

print("🔍 Script de Detecção de Fotos Placeholder")
print("=" * 50)

# 1. Download e hash da foto genérica conhecida
print("\n📥 A calcular hash da foto genérica...")
generic_url = "https://media.api-sports.io/football/players/455915.png"
try:
    generic_img = requests.get(generic_url, timeout=10).content
    generic_hash = hashlib.md5(generic_img).hexdigest()
    print(f"✅ Hash genérica: {generic_hash}")
except Exception as e:
    print(f"❌ Erro ao buscar foto genérica: {e}")
    exit()

# 2. Conectar à BD
print("\n🔌 A conectar à base de dados...")
try:
    db = mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="",
        database="football_quiz"
    )
    cursor = db.cursor()
    print("✅ Conectado com sucesso!")
except Exception as e:
    print(f"❌ Erro de conexão: {e}")
    exit()

# 3. Buscar todos os jogadores com foto
cursor.execute("SELECT id, photo FROM players WHERE photo IS NOT NULL")
players = cursor.fetchall()
total = len(players)

print(f"\n🔍 A verificar {total} jogadores...")
print("=" * 50)

# 4. Comparar cada foto
placeholder_ids = []
errors = 0

for idx, (player_id, photo_url) in enumerate(players, 1):
    try:
        # Progress indicator
        if idx % 50 == 0 or idx == total:
            print(f"[{idx}/{total}] A processar...")
        
        # Download e comparar hash
        img = requests.get(photo_url, timeout=5).content
        img_hash = hashlib.md5(img).hexdigest()
        
        if img_hash == generic_hash:
            placeholder_ids.append(player_id)
            print(f"  ✅ Genérica encontrada: ID {player_id}")
        
        # Rate limiting (evitar sobrecarga)
        sleep(0.1)
        
    except Exception as e:
        errors += 1
        if errors < 5:  # Mostrar só primeiros 5 erros
            print(f"  ⚠️  Erro no ID {player_id}: {e}")

# 5. Atualizar BD
print("\n" + "=" * 50)
print(f"📊 RESULTADO:")
print(f"   Total verificados: {total}")
print(f"   Genéricas encontradas: {len(placeholder_ids)}")
print(f"   Erros: {errors}")

if placeholder_ids:
    print(f"\n💾 A atualizar base de dados...")
    placeholders = ','.join(map(str, placeholder_ids))
    cursor.execute(f"UPDATE players SET is_photo_placeholder = 1 WHERE id IN ({placeholders})")
    db.commit()
    print(f"✅ {len(placeholder_ids)} jogadores marcados como placeholder!")
else:
    print("\n✅ Nenhuma foto genérica encontrada (ou todas já marcadas).")

# 6. Verificar resultado
cursor.execute("SELECT COUNT(*) FROM players WHERE is_photo_placeholder = 1")
marked_count = cursor.fetchone()[0]
print(f"\n📈 Total de placeholders na BD: {marked_count}")

db.close()
print("\n✅ Script concluído!")
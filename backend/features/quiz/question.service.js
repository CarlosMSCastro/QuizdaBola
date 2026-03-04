const db = require("../../shared/config/db");

// Procurar competição ativa
exports.getActiveCompetition = async (competitionId) => {
  const [competitions] = await db.execute(
    "SELECT table_name FROM competitions WHERE id = ? AND active = 1",
    [competitionId],
  );

  if (competitions.length === 0) {
    throw new Error("Competição não encontrada");
  }

  return competitions[0].table_name;
};

// Determinar dificuldade (46% easy, 40% medium, 14% hard)
exports.determineDifficulty = () => {
  const rand = Math.random() * 100;

  if (rand < 46) return "easy";
  if (rand < 86) return "medium";
  return "hard";
};

// Procurar jogador aleatório
exports.getRandomPlayer = async (tableName, difficulty, excludeIds) => {
  let query = `SELECT * FROM ${tableName} WHERE difficulty = ? AND is_photo_placeholder = 0`;
  const params = [difficulty];

  if (excludeIds.length > 0) {
    const placeholders = excludeIds.map(() => "?").join(",");
    query += ` AND id NOT IN (${placeholders})`;
    params.push(...excludeIds);
  }

  query += " ORDER BY RAND() LIMIT 1";

  const [players] = await db.execute(query, params);

  if (players.length === 0) {
    throw new Error("Nenhum jogador encontrado");
  }

  return players[0];
};

// Procurar opções erradas
exports.getWrongOptions = async (
  tableName,
  correctPlayerId,
  difficulty,
  excludeIds,
) => {
  let query = `SELECT name FROM ${tableName} WHERE id != ? AND difficulty = ? AND is_photo_placeholder = 0`;
  const params = [correctPlayerId, difficulty];

  if (excludeIds.length > 0) {
    const placeholders = excludeIds.map(() => "?").join(",");
    query += ` AND id NOT IN (${placeholders})`;
    params.push(...excludeIds);
  }

  query += " ORDER BY RAND() LIMIT 3";

  const [wrongPlayers] = await db.execute(query, params);

  return wrongPlayers.map((p) => p.name);
};

// Baralhar opções
exports.shuffleOptions = (correctAnswer, wrongOptions) => {
  return [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
};
